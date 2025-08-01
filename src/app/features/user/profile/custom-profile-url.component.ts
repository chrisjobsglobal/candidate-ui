import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserStore } from '../store/user.store';
import {
  LucideAngularModule,
  Edit3,
  Link,
  ExternalLink,
  Check,
  X,
} from 'lucide-angular';

@Component({
  selector: 'app-custom-profile-url',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <!-- Custom Profile URL -->
    <div class="mt-6 pt-6 border-t border-gray-200">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Custom Profile URL</h3>
        <button
          *ngIf="!isEditingProfileTag()"
          (click)="startEditingProfileTag()"
          class="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <lucide-angular [img]="Edit3Icon" size="16"></lucide-angular>
        </button>
      </div>

      <!-- View Mode -->
      <div *ngIf="!isEditingProfileTag()" class="space-y-3">
        <div class="flex items-center space-x-3">
          <div class="p-2 bg-gray-100 rounded-lg">
            <lucide-angular [img]="LinkIcon" size="16" class="text-blue-600"></lucide-angular>
          </div>
          <div class="flex-1">
            <span class="font-medium text-gray-900">{{ getProfileUrl() }}</span>
            <p class="text-sm text-gray-500 mt-1">
              This is your public profile URL that you can share with others.
            </p>
          </div>
          <button
            (click)="copyProfileUrl()"
            class="p-2 text-gray-500 hover:text-blue-600 transition-colors"
            title="Copy URL"
          >
            <lucide-angular [img]="ExternalLinkIcon" size="16"></lucide-angular>
          </button>
        </div>
      </div>

      <!-- Edit Mode -->
      <div *ngIf="isEditingProfileTag()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Custom URL
          </label>
          <div class="relative">
            <input
              [(ngModel)]="profileTagValue"
              (input)="checkProfileTagAvailability()"
              type="text"
              placeholder="e.g., marian-smith"
              class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              [class.border-red-300]="profileTagAvailable() === false"
              [class.border-green-300]="profileTagAvailable() === true"
            />
            <div
              *ngIf="isCheckingProfileTag()"
              class="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
            <div
              *ngIf="!isCheckingProfileTag() && profileTagAvailable() === true"
              class="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <lucide-angular [img]="CheckIcon" size="16" class="text-green-600"></lucide-angular>
            </div>
            <div
              *ngIf="!isCheckingProfileTag() && profileTagAvailable() === false"
              class="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <lucide-angular [img]="XIcon" size="16" class="text-red-600"></lucide-angular>
            </div>
          </div>
          <p
            *ngIf="profileTagMessage()"
            class="mt-2 text-sm"
            [class.text-green-600]="profileTagAvailable() === true"
            [class.text-red-600]="profileTagAvailable() === false"
            [class.text-gray-500]="profileTagAvailable() === null"
          >
            {{ profileTagMessage() }}
          </p>
          <p class="mt-2 text-sm text-gray-500">
            Your profile will be available at: {{ getWindowOrigin() }}/profile/{{ profileTagValue() || 'your-custom-tag' }}
          </p>
        </div>

        <div class="flex items-center space-x-3">
          <button
            (click)="saveProfileTag()"
            [disabled]="profileTagAvailable() !== true || !profileTagValue().trim()"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Save URL
          </button>
          <button
            (click)="cancelEditingProfileTag()"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div
      *ngIf="uploadMessage()"
      class="mt-4 p-4 rounded-xl border shadow-sm"
      [class.bg-green-50]="uploadMessage()!.type === 'success'"
      [class.border-green-200]="uploadMessage()!.type === 'success'"
      [class.text-green-800]="uploadMessage()!.type === 'success'"
      [class.bg-red-50]="uploadMessage()!.type === 'error'"
      [class.border-red-200]="uploadMessage()!.type === 'error'"
      [class.text-red-800]="uploadMessage()!.type === 'error'"
    >
      <div class="flex items-center space-x-2">
        <div class="flex-shrink-0">
          <lucide-angular 
            *ngIf="uploadMessage()!.type === 'success'" 
            [img]="CheckIcon" 
            size="16"
            class="text-green-600"
          ></lucide-angular>
          <lucide-angular 
            *ngIf="uploadMessage()!.type === 'error'" 
            [img]="XIcon" 
            size="16"
            class="text-red-600"
          ></lucide-angular>
        </div>
        <span class="font-medium">{{ uploadMessage()!.message }}</span>
      </div>
    </div>
  `,
})
export class CustomProfileUrlComponent {
  private readonly userStore = inject(UserStore);

  readonly Edit3Icon = Edit3;
  readonly LinkIcon = Link;
  readonly ExternalLinkIcon = ExternalLink;
  readonly CheckIcon = Check;
  readonly XIcon = X;

  // Current user from store
  readonly currentUser = this.userStore.currentUser;

  // Profile tag editing state
  readonly isEditingProfileTag = signal(false);
  readonly profileTagValue = signal('');
  readonly isCheckingProfileTag = signal(false);
  readonly profileTagAvailable = signal<boolean | null>(null);
  readonly profileTagMessage = signal<string>('');
  readonly uploadMessage = signal<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  /**
   * Start editing profile tag
   */
  startEditingProfileTag(): void {
    const currentUser = this.currentUser();
    this.profileTagValue.set(currentUser?.profileTag || '');
    this.isEditingProfileTag.set(true);
    this.profileTagAvailable.set(null);
    this.profileTagMessage.set('');
    this.clearUploadMessage();
  }

  /**
   * Cancel editing profile tag
   */
  cancelEditingProfileTag(): void {
    this.isEditingProfileTag.set(false);
    this.profileTagValue.set('');
    this.profileTagAvailable.set(null);
    this.profileTagMessage.set('');
    this.clearUploadMessage();
  }

  /**
   * Check profile tag availability
   */
  checkProfileTagAvailability(): void {
    const profileTag = this.profileTagValue().trim();
    
    if (!profileTag) {
      this.profileTagAvailable.set(null);
      this.profileTagMessage.set('');
      return;
    }

    // Basic validation
    if (profileTag.length < 3) {
      this.profileTagAvailable.set(false);
      this.profileTagMessage.set('Profile tag must be at least 3 characters long');
      return;
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(profileTag)) {
      this.profileTagAvailable.set(false);
      this.profileTagMessage.set('Profile tag can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    // Check if it's the same as current tag
    const currentUser = this.currentUser();
    if (currentUser?.profileTag === profileTag) {
      this.profileTagAvailable.set(true);
      this.profileTagMessage.set('Current profile tag');
      return;
    }

    this.isCheckingProfileTag.set(true);
    this.userStore.checkProfileTagAvailability(profileTag).subscribe({
      next: (response) => {
        this.profileTagAvailable.set(response.available);
        this.profileTagMessage.set(response.message || (response.available ? 'Available' : 'Not available'));
      },
      error: (error) => {
        console.error('Failed to check profile tag availability:', error);
        this.profileTagAvailable.set(false);
        this.profileTagMessage.set('Error checking availability');
      },
      complete: () => {
        this.isCheckingProfileTag.set(false);
      }
    });
  }

  /**
   * Save profile tag
   */
  saveProfileTag(): void {
    const profileTag = this.profileTagValue().trim();
    
    if (!profileTag || this.profileTagAvailable() !== true) {
      return;
    }

    this.userStore.updateUserProfileTag(profileTag).subscribe({
      next: (user) => {
        this.showUploadMessage('success', 'Profile URL updated successfully!');
        this.isEditingProfileTag.set(false);
        this.profileTagValue.set('');
        this.profileTagAvailable.set(null);
        this.profileTagMessage.set('');
      },
      error: (error) => {
        console.error('Failed to update profile tag:', error);
        const errorMessage = error.error?.detail || error.message || 'Failed to update profile URL. Please try again.';
        this.showUploadMessage('error', errorMessage);
      }
    });
  }

  /**
   * Get profile URL for current user
   */
  getProfileUrl(): string {
    const currentUser = this.currentUser();
    if (currentUser) {
      return this.userStore.getProfileUrl(currentUser);
    }
    return '';
  }

  /**
   * Copy profile URL to clipboard
   */
  copyProfileUrl(): void {
    const profileUrl = this.getProfileUrl();
    if (profileUrl) {
      navigator.clipboard.writeText(profileUrl).then(() => {
        this.showUploadMessage('success', 'Profile URL copied to clipboard!');
      }).catch((error) => {
        console.error('Failed to copy URL:', error);
        this.showUploadMessage('error', 'Failed to copy URL to clipboard');
      });
    }
  }

  /**
   * Get the current window origin for URL display
   */
  getWindowOrigin(): string {
    return window.location.origin;
  }

  /**
   * Show upload message
   */
  private showUploadMessage(type: 'success' | 'error', message: string): void {
    this.uploadMessage.set({ type, message });
    // Auto-clear message after 5 seconds
    setTimeout(() => {
      this.clearUploadMessage();
    }, 5000);
  }

  /**
   * Clear upload message
   */
  private clearUploadMessage(): void {
    this.uploadMessage.set(null);
  }
}
