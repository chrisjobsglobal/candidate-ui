import {
  Component,
  signal,
  input,
  output,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  X,
  Calendar,
  MapPin,
  Building,
  User,
  FileText,
  Trash2,
} from 'lucide-angular';
import { UserExperiencesStore, CreateUserExperienceDto, UpdateUserExperienceDto } from '../store/user-experiences.store';
import { UserExperience } from '../../../core/models/user.model';

@Component({
  selector: 'app-experience-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <!-- Modal Backdrop -->
    <div 
      class="fixed inset-0 flex items-center justify-center z-50"
    >
      
      <!-- Modal Overlay -->
      <div class="fixed inset-0 bg-black opacity-30 -z-1"></div>
     
      <!-- Modal Content -->
      <div 
        class="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        (click)="$event.stopPropagation()"
        (mousedown)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-text-primary">
            {{ isEdit() ? 'Edit Experience' : 'Add Experience' }}
          </h2>
          <button
            (click)="onClose()"
            class="p-2 text-text-secondary hover:text-text-primary transition-colors rounded-lg hover:bg-gray-100"
          >
            <lucide-angular [img]="XIcon" size="20"></lucide-angular>
          </button>
        </div>

        <!-- Form -->
        <form (ngSubmit)="onSubmit()" class="p-6 space-y-6">
          <!-- Job Title -->
          <div >
            <label class="block text-sm font-medium text-text-primary mb-2">
              <lucide-angular [img]="UserIcon" size="16" class="inline mr-2"></lucide-angular>
              Job Title *
            </label>
            <input
              type="text"
              [(ngModel)]="formData.title"
              name="title"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Senior Software Engineer"
              
            />
          </div>

          <!-- Company -->
          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">
              <lucide-angular [img]="BuildingIcon" size="16" class="inline mr-2"></lucide-angular>
              Company *
            </label>
            <input
              type="text"
              [(ngModel)]="formData.company"
              name="company"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. TechCorp Inc."
            />
          </div>

          <!-- Location -->
          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">
              <lucide-angular [img]="MapPinIcon" size="16" class="inline mr-2"></lucide-angular>
              Location *
            </label>
            <input
              type="text"
              [(ngModel)]="formData.location"
              name="location"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. San Francisco, CA or Remote"
            />
          </div>

          <!-- Date Range -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Start Date -->
            <div>
              <label class="block text-sm font-medium text-text-primary mb-2">
                <lucide-angular [img]="CalendarIcon" size="16" class="inline mr-2"></lucide-angular>
                Start Date *
              </label>
              <input
                type="date"
                [(ngModel)]="formData.start_date"
                name="start_date"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <!-- End Date -->
            <div>
              <label class="block text-sm font-medium text-text-primary mb-2">
                <lucide-angular [img]="CalendarIcon" size="16" class="inline mr-2"></lucide-angular>
                End Date
              </label>
              <input
                type="date"
                [(ngModel)]="formData.end_date"
                name="end_date"
                [disabled]="formData.is_current"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100"
                [class.disabled:bg-gray-100]="formData.is_current"
              />
            </div>
          </div>

          <!-- Currently Working -->
          <div class="flex items-center space-x-3">
            <input
              type="checkbox"
              [(ngModel)]="formData.is_current"
              name="is_current"
              (change)="onCurrentToggle()"
              id="is_current"
              class="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
            />
            <label for="is_current" class="text-sm font-medium text-text-primary">
              I currently work here
            </label>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">
              <lucide-angular [img]="FileTextIcon" size="16" class="inline mr-2"></lucide-angular>
              Description *
            </label>
            <textarea
              [(ngModel)]="formData.description"
              name="description"
              required
              rows="6"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-vertical"
              placeholder="Describe your responsibilities, achievements, and key contributions in this role..."
            ></textarea>
          </div>

          <!-- Error Message -->
          <div *ngIf="error()" class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-600 text-sm">{{ error() }}</p>
          </div>

          <!-- Actions -->
          <div class="flex justify-between pt-6 border-t border-gray-200">
            <!-- Delete Button (only in edit mode) -->
            <button
              *ngIf="isEdit()"
              type="button"
              (click)="onDelete()"
              [disabled]="isLoading()"
              class="px-6 py-3 text-red-600 hover:text-red-700 transition-colors rounded-lg border border-red-300 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <lucide-angular [img]="Trash2Icon" size="16" class="inline mr-2"></lucide-angular>
              <span *ngIf="!isLoading()">Delete</span>
              <span *ngIf="isLoading()">Deleting...</span>
            </button>
            <div *ngIf="!isEdit()"></div>

            <!-- Cancel and Save buttons -->
            <div class="flex space-x-3">
              <button
                type="button"
                (click)="onClose()"
                class="px-6 py-3 text-text-secondary hover:text-text-primary transition-colors rounded-lg border border-gray-300 hover:border-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="isLoading() || !isFormValid()"
                class="px-6 py-3 bg-primary-900 text-white rounded-lg hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span *ngIf="!isLoading()">
                  {{ isEdit() ? 'Update Experience' : 'Add Experience' }}
                </span>
                <span *ngIf="isLoading()">
                  {{ isEdit() ? 'Updating...' : 'Adding...' }}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ExperienceModalComponent implements OnInit {
  // Icons
  readonly XIcon = X;
  readonly CalendarIcon = Calendar;
  readonly MapPinIcon = MapPin;
  readonly BuildingIcon = Building;
  readonly UserIcon = User;
  readonly FileTextIcon = FileText;
  readonly Trash2Icon = Trash2;

  // Inputs and Outputs
  experience = input<UserExperience | null>(null);
  closeModal = output<void>();
  experienceAdded = output<UserExperience>();
  experienceUpdated = output<UserExperience>();
  experienceDeleted = output<number>();

  // Store
  private readonly experiencesStore = inject(UserExperiencesStore);

  // State
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  isEdit = signal<boolean>(false);

  // Form Data
  formData = {
    title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: ''
  };

  ngOnInit() {
    const exp = this.experience();
    if (exp) {
      this.isEdit.set(true);
      this.formData = {
        title: exp.title,
        company: exp.company,
        location: exp.location,
        start_date: exp.start_date,
        end_date: exp.end_date || '',
        is_current: exp.is_current,
        description: exp.description
      };
    }
  }

  onCurrentToggle() {
    if (this.formData.is_current) {
      this.formData.end_date = '';
    }
  }

  isFormValid(): boolean {
    return !!(
      this.formData.title.trim() &&
      this.formData.company.trim() &&
      this.formData.location.trim() &&
      this.formData.start_date &&
      this.formData.description.trim() &&
      (this.formData.is_current || this.formData.end_date)
    );
  }

  onSubmit() {
    if (!this.isFormValid()) {
      this.error.set('Please fill in all required fields.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    if (this.isEdit()) {
      this.updateExperience();
    } else {
      this.createExperience();
    }
  }

  createExperience() {
    const createDto: CreateUserExperienceDto = {
      title: this.formData.title.trim(),
      company: this.formData.company.trim(),
      location: this.formData.location.trim(),
      start_date: this.formData.start_date,
      end_date: this.formData.is_current ? null : this.formData.end_date,
      is_current: this.formData.is_current,
      description: this.formData.description.trim()
    };

    this.experiencesStore.createItem(createDto).subscribe({
      next: (created: UserExperience) => {
        this.experienceAdded.emit(created);
        this.onClose();
      },
      error: (err: any) => {
        console.error('Failed to create experience:', err);
        this.error.set('Failed to create experience. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  updateExperience() {
    const exp = this.experience();
    if (!exp) return;

    const updateDto: UpdateUserExperienceDto = {
      title: this.formData.title.trim(),
      company: this.formData.company.trim(),
      location: this.formData.location.trim(),
      start_date: this.formData.start_date,
      end_date: this.formData.is_current ? null : this.formData.end_date,
      is_current: this.formData.is_current,
      description: this.formData.description.trim()
    };

    this.experiencesStore.updateItemById(exp.id, updateDto).subscribe({
      next: (updated: UserExperience) => {
        this.experienceUpdated.emit(updated);
        this.onClose();
      },
      error: (err: any) => {
        console.error('Failed to update experience:', err);
        this.error.set('Failed to update experience. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  onDelete() {
    const exp = this.experience();
    if (!exp) return;

    if (!confirm('Are you sure you want to delete this experience? This action cannot be undone.')) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.experiencesStore.deleteItem(exp.id).subscribe({
      next: () => {
        this.experienceDeleted.emit(exp.id);
        this.onClose();
      },
      error: (err: any) => {
        console.error('Failed to delete experience:', err);
        this.error.set('Failed to delete experience. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  onClose() {
    this.closeModal.emit();
  }

  onBackdropClick(event: MouseEvent) {
    // Only close if the click was directly on the backdrop container, not on any child elements
    // Also check that the target is not an input, textarea, or other form element
    const target = event.target as HTMLElement;
    
    if (event.target === event.currentTarget && 
        !target.closest('input, textarea, select, button, form')) {
      this.onClose();
    }
  }
}
