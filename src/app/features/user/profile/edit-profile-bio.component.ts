import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  inject,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserStore } from '../store/user.store';
import {
  LucideAngularModule,
  Edit3,
  Save,
  X,
  Check,
} from 'lucide-angular';

@Component({
  selector: 'app-edit-profile-bio',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="bio-editor">
      <!-- Display Mode -->
      <div *ngIf="!isEditing()" class="flex items-start justify-between group">
        <p 
          class="text-text-secondary leading-relaxed flex-1 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
          [class.text-gray-400]="!currentBio() || currentBio().trim() === ''"
          (click)="startEditing()"
        >
          {{ currentBio() || 'Click to add your bio...' }}
        </p>
        <button
          (click)="startEditing()"
          class="p-2 text-text-secondary hover:text-text-primary transition-colors opacity-0 group-hover:opacity-100"
          title="Edit bio"
        >
          <lucide-angular [img]="Edit3Icon" size="16"></lucide-angular>
        </button>
      </div>

      <!-- Edit Mode -->
      <div *ngIf="isEditing()" class="space-y-3">
        <div class="relative">
          <textarea
            #bioTextarea
            [(ngModel)]="editingBio"
            (keydown)="onKeyDown($event)"
            class="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            rows="5"
            maxlength="500"
            placeholder="Tell people about yourself - your experience, passions, and what makes you unique..."
          ></textarea>
          <div class="absolute bottom-2 right-2 text-xs text-gray-400">
            {{ editingBio.length || 0 }}/500
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center justify-between">
          <div class="flex space-x-2">
            <button
              (click)="saveBio()"
              [disabled]="isSaving() || editingBio === originalBio()"
              class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <lucide-angular 
                [img]="isSaving() ? CheckIcon : SaveIcon" 
                size="14" 
                class="mr-1"
                [class.animate-spin]="isSaving()"
              ></lucide-angular>
              {{ isSaving() ? 'Saving...' : 'Save' }}
            </button>
            <button
              (click)="cancelEditing()"
              [disabled]="isSaving()"
              class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <lucide-angular [img]="XIcon" size="14" class="mr-1"></lucide-angular>
              Cancel
            </button>
          </div>
          
          <!-- Error Message -->
          <div *ngIf="errorMessage()" class="text-sm text-red-600">
            {{ errorMessage() }}
          </div>
        </div>

        <!-- Tips -->
        <div class="text-xs text-gray-500 space-y-1">
          <p>💡 Tips for a great bio:</p>
          <ul class="list-disc list-inside ml-2 space-y-0.5">
            <li>Mention your current role and experience</li>
            <li>Highlight your key skills and achievements</li>
            <li>Include what you're passionate about</li>
            <li>Keep it professional but personable</li>
          </ul>
        </div>
      </div>

      <!-- Success Message -->
      <div 
        *ngIf="showSuccessMessage()"
        class="mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm flex items-center"
      >
        <lucide-angular [img]="CheckIcon" size="14" class="mr-2 text-green-600"></lucide-angular>
        Bio updated successfully!
      </div>
    </div>
  `,
  styles: [`
    .bio-editor {
      min-height: 80px;
    }
    
    textarea:focus {
      outline: none;
    }
    
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class EditProfileBioComponent {
  @Input() bio: string = '';
  @Output() bioUpdated = new EventEmitter<string>();

  private readonly userStore = inject(UserStore);

  // Icons
  readonly Edit3Icon = Edit3;
  readonly SaveIcon = Save;
  readonly XIcon = X;
  readonly CheckIcon = Check;

  // State signals
  readonly isEditing = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showSuccessMessage = signal(false);
  readonly currentBio = signal(this.bio);
  readonly originalBio = signal(this.bio);

  // Editing state
  editingBio: string = '';

  constructor() {
    // Update current bio when input changes
    effect(() => {
      this.currentBio.set(this.bio);
      this.originalBio.set(this.bio);
      if (!this.isEditing()) {
        this.editingBio = this.bio;
      }
    });
  }

  /**
   * Start editing mode
   */
  startEditing(): void {
    this.isEditing.set(true);
    this.editingBio = this.currentBio();
    this.originalBio.set(this.currentBio());
    this.errorMessage.set(null);
    this.showSuccessMessage.set(false);

    // Focus the textarea after the view updates
    setTimeout(() => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        // Set cursor to end of text
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      }
    }, 100);
  }

  /**
   * Cancel editing and revert changes
   */
  cancelEditing(): void {
    this.isEditing.set(false);
    this.editingBio = this.originalBio();
    this.errorMessage.set(null);
  }

  /**
   * Save bio changes
   */
  saveBio(): void {
    if (this.isSaving()) {
      return;
    }

    // Trim whitespace
    const trimmedBio = (this.editingBio || '').trim();

    // Validate bio length
    if (trimmedBio.length > 500) {
      this.errorMessage.set('Bio must be 500 characters or less');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    // Update bio via user store
    this.userStore.updateCurrentUserProfile({ bio: trimmedBio }).subscribe({
      next: (updatedUser) => {
        // Update local state
        this.currentBio.set(updatedUser.bio);
        this.originalBio.set(updatedUser.bio);
        this.isEditing.set(false);
        this.isSaving.set(false);
        
        // Show success message
        this.showSuccessMessage.set(true);
        setTimeout(() => this.showSuccessMessage.set(false), 3000);
        
        // Emit updated bio
        this.bioUpdated.emit(updatedUser.bio);
      },
      error: (error) => {
        console.error('Failed to update bio:', error);
        this.errorMessage.set('Failed to update bio. Please try again.');
        this.isSaving.set(false);
      }
    });
  }

  /**
   * Handle keyboard shortcuts
   */
  onKeyDown(event: KeyboardEvent): void {
    // Save on Ctrl/Cmd + Enter
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      this.saveBio();
    }
    
    // Cancel on Escape
    if (event.key === 'Escape') {
      event.preventDefault();
      this.cancelEditing();
    }
  }
}
