import {
  Component,
  signal,
  inject,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserLanguagesStore } from '../store/user-languages.store';
import { UserLanguage } from '../../../core/models/user.model';
import {
  LucideAngularModule,
  X,
  Trash2,
  AlertCircle,
} from 'lucide-angular';

@Component({
  selector: 'app-delete-language-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <!-- Modal Backdrop -->
    <div 
      *ngIf="isVisible()"
      class="fixed inset-0 flex items-center justify-center z-50"
      (click)="onBackdropClick($event)"
    >
      <!-- Modal Overlay -->
      <div class="fixed inset-0 bg-black opacity-30 -z-1"></div>
      
      <!-- Modal Content -->
      <div 
        class="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-text-primary">
            Delete Language
          </h2>
          <button
            class="p-2 text-text-secondary hover:text-text-primary transition-colors"
            (click)="onClose()"
          >
            <lucide-angular [img]="XIcon" size="20"></lucide-angular>
          </button>
        </div>

        <!-- Warning Icon and Message -->
        <div class="text-center mb-6">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <lucide-angular [img]="AlertCircleIcon" size="24" class="text-red-600"></lucide-angular>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Are you sure?
          </h3>
          <p class="text-sm text-gray-600" *ngIf="language">
            You are about to delete <span class="font-semibold">{{ language.name }}</span> 
            ({{ language.proficiency | titlecase }}) from your profile. This action cannot be undone.
          </p>
        </div>

        <!-- Error Message -->
        <div 
          *ngIf="error()" 
          class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2"
        >
          <lucide-angular [img]="AlertCircleIcon" size="16" class="text-red-500 mt-0.5 flex-shrink-0"></lucide-angular>
          <p class="text-sm text-red-700">{{ error() }}</p>
        </div>

        <!-- Form Actions -->
        <div class="flex items-center justify-end space-x-3">
          <button
            type="button"
            class="px-4 py-2 text-text-secondary border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            (click)="onClose()"
            [disabled]="isDeleting()"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            (click)="onConfirmDelete()"
            [disabled]="isDeleting()"
          >
            <lucide-angular 
              *ngIf="isDeleting()" 
              [img]="Trash2Icon" 
              size="16" 
              class="animate-spin"
            ></lucide-angular>
            <lucide-angular 
              *ngIf="!isDeleting()" 
              [img]="Trash2Icon" 
              size="16"
            ></lucide-angular>
            <span>{{ isDeleting() ? 'Deleting...' : 'Delete Language' }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class DeleteLanguageModalComponent {
  private readonly userLanguagesStore = inject(UserLanguagesStore);

  @Input() language: UserLanguage | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<UserLanguage>();

  readonly XIcon = X;
  readonly Trash2Icon = Trash2;
  readonly AlertCircleIcon = AlertCircle;

  readonly isVisible = signal(false);
  readonly isDeleting = signal(false);
  readonly error = signal<string | null>(null);

  /**
   * Show the modal
   */
  show(): void {
    this.isVisible.set(true);
    this.error.set(null);
  }

  /**
   * Hide the modal
   */
  hide(): void {
    this.isVisible.set(false);
    this.isDeleting.set(false);
    this.error.set(null);
  }

  /**
   * Handle backdrop click
   */
  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  /**
   * Handle close button click
   */
  onClose(): void {
    this.hide();
    this.close.emit();
  }

  /**
   * Handle delete confirmation
   */
  onConfirmDelete(): void {
    if (!this.language || this.isDeleting()) return;

    this.isDeleting.set(true);
    this.error.set(null);

    this.userLanguagesStore.deleteItem(this.language.id).subscribe({
      next: () => {
        this.deleted.emit(this.language!);
        this.hide();
      },
      error: (error: any) => {
        this.error.set(this.getErrorMessage(error));
        this.isDeleting.set(false);
      }
    });
  }

  /**
   * Extract error message from error response
   */
  private getErrorMessage(error: any): string {
    if (error?.error?.detail) {
      return error.error.detail;
    }
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  }
}
