import {
  Component,
  signal,
  inject,
  Input,
  Output,
  EventEmitter,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserLanguagesStore, CreateUserLanguageDto, UpdateUserLanguageDto } from '../store/user-languages.store';
import { UserLanguage } from '../../../core/models/user.model';
import {
  LucideAngularModule,
  X,
  Save,
  AlertCircle,
} from 'lucide-angular';

@Component({
  selector: 'app-language-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <!-- Modal Backdrop -->
    <div 
      *ngIf="isVisible()"
      class="fixed inset-0  flex items-center justify-center z-50"
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
            {{ isEditing() ? 'Edit Language' : 'Add Language' }}
          </h2>
          <button
            class="p-2 text-text-secondary hover:text-text-primary transition-colors"
            (click)="onClose()"
          >
            <lucide-angular [img]="XIcon" size="20"></lucide-angular>
          </button>
        </div>

        <!-- Error Message -->
        <div 
          *ngIf="error()" 
          class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2"
        >
          <lucide-angular [img]="AlertCircleIcon" size="16" class="text-red-500 mt-0.5 flex-shrink-0"></lucide-angular>
          <p class="text-sm text-red-700">{{ error() }}</p>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" #languageForm="ngForm">
          <!-- Language Name -->
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-text-primary mb-2">
              Language Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              [(ngModel)]="formData.name"
              required
              maxlength="100"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g., English, Spanish, French"
              #nameField="ngModel"
            />
            <div *ngIf="nameField.invalid && nameField.touched" class="mt-1 text-sm text-red-600">
              Language name is required
            </div>
          </div>

          <!-- Proficiency Level -->
          <div class="mb-6">
            <label for="proficiency" class="block text-sm font-medium text-text-primary mb-2">
              Proficiency Level *
            </label>
            <select
              id="proficiency"
              name="proficiency"
              [(ngModel)]="formData.proficiency"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              #proficiencyField="ngModel"
            >
              <option value="">Select proficiency level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="native">Native</option>
            </select>
            <div *ngIf="proficiencyField.invalid && proficiencyField.touched" class="mt-1 text-sm text-red-600">
              Proficiency level is required
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex items-center justify-end space-x-3">
            <button
              type="button"
              class="px-4 py-2 text-text-secondary border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              (click)="onClose()"
              [disabled]="isSubmitting()"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              [disabled]="languageForm.invalid || isSubmitting()"
            >
              <lucide-angular 
                *ngIf="isSubmitting()" 
                [img]="SaveIcon" 
                size="16" 
                class="animate-spin"
              ></lucide-angular>
              <lucide-angular 
                *ngIf="!isSubmitting()" 
                [img]="SaveIcon" 
                size="16"
              ></lucide-angular>
              <span>{{ isSubmitting() ? 'Saving...' : 'Save Language' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class LanguageModalComponent implements OnInit {
  private readonly userLanguagesStore = inject(UserLanguagesStore);

  @Input() language: UserLanguage | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<UserLanguage>();

  readonly XIcon = X;
  readonly SaveIcon = Save;
  readonly AlertCircleIcon = AlertCircle;

  readonly isVisible = signal(false);
  readonly isSubmitting = signal(false);
  readonly error = signal<string | null>(null);

  formData: { name: string; proficiency: string } = {
    name: '',
    proficiency: ''
  };

  readonly isEditing = signal(false);

  ngOnInit(): void {
    if (this.language) {
      this.isEditing.set(true);
      this.formData = {
        name: this.language.name,
        proficiency: this.language.proficiency
      };
    } else {
      this.isEditing.set(false);
      this.formData = {
        name: '',
        proficiency: ''
      };
    }
  }

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
    this.isSubmitting.set(false);
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
   * Handle form submission
   */
  onSubmit(): void {
    if (this.isSubmitting()) return;

    this.isSubmitting.set(true);
    this.error.set(null);

    const proficiency = this.formData.proficiency as 'beginner' | 'intermediate' | 'advanced' | 'native';

    if (this.isEditing() && this.language) {
      // Update existing language
      const updateData: UpdateUserLanguageDto = {
        name: this.formData.name.trim(),
        proficiency: proficiency
      };

      this.userLanguagesStore.updateItemById(this.language.id, updateData).subscribe({
        next: (updatedLanguage: UserLanguage) => {
          this.saved.emit(updatedLanguage);
          this.hide();
        },
        error: (error: any) => {
          this.error.set(this.getErrorMessage(error));
          this.isSubmitting.set(false);
        }
      });
    } else {
      // Create new language
      const createData: CreateUserLanguageDto = {
        name: this.formData.name.trim(),
        proficiency: proficiency
      };

      this.userLanguagesStore.createItem(createData).subscribe({
        next: (newLanguage: UserLanguage) => {
          this.saved.emit(newLanguage);
          this.hide();
        },
        error: (error: any) => {
          this.error.set(this.getErrorMessage(error));
          this.isSubmitting.set(false);
        }
      });
    }
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
