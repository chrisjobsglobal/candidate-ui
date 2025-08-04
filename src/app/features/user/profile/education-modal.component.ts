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
  Building2,
  GraduationCap,
  BookOpen,
  FileText,
  Trash2,
  Award,
} from 'lucide-angular';
import { UserEducationsStore, CreateUserEducationDto, UpdateUserEducationDto } from '../store/user-educations.store';
import { UserEducation } from '../../../core/models/user.model';

@Component({
  selector: 'app-education-modal',
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
            {{ isEdit() ? 'Edit Education' : 'Add Education' }}
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
          <!-- Institution -->
          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">
              <lucide-angular [img]="Building2Icon" size="16" class="inline mr-2"></lucide-angular>
              Institution *
            </label>
            <input
              type="text"
              [(ngModel)]="formData.institution"
              name="institution"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Stanford University"
            />
          </div>

          <!-- Degree -->
          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">
              <lucide-angular [img]="GraduationCapIcon" size="16" class="inline mr-2"></lucide-angular>
              Degree *
            </label>
            <input
              type="text"
              [(ngModel)]="formData.degree"
              name="degree"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Bachelor of Science, Master's Degree"
            />
          </div>

          <!-- Field of Study -->
          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">
              <lucide-angular [img]="BookOpenIcon" size="16" class="inline mr-2"></lucide-angular>
              Field of Study *
            </label>
            <input
              type="text"
              [(ngModel)]="formData.field_of_study"
              name="field_of_study"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Computer Science, Business Administration"
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
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              />
              <p class="text-xs text-text-secondary mt-1">Leave empty if currently enrolled</p>
            </div>
          </div>

          <!-- Grade -->
          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">
              <lucide-angular [img]="AwardIcon" size="16" class="inline mr-2"></lucide-angular>
              Grade/GPA (Optional)
            </label>
            <input
              type="text"
              [(ngModel)]="formData.grade"
              name="grade"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. 3.8 GPA, First Class Honours, 85%"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">
              <lucide-angular [img]="FileTextIcon" size="16" class="inline mr-2"></lucide-angular>
              Description (Optional)
            </label>
            <textarea
              [(ngModel)]="formData.description"
              name="description"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-vertical"
              placeholder="Describe your academic achievements, thesis, relevant coursework, extracurricular activities..."
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
                  {{ isEdit() ? 'Update Education' : 'Add Education' }}
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
export class EducationModalComponent implements OnInit {
  // Icons
  readonly XIcon = X;
  readonly CalendarIcon = Calendar;
  readonly Building2Icon = Building2;
  readonly GraduationCapIcon = GraduationCap;
  readonly BookOpenIcon = BookOpen;
  readonly FileTextIcon = FileText;
  readonly Trash2Icon = Trash2;
  readonly AwardIcon = Award;

  // Inputs and Outputs
  education = input<UserEducation | null>(null);
  closeModal = output<void>();
  educationAdded = output<UserEducation>();
  educationUpdated = output<UserEducation>();
  educationDeleted = output<number>();

  // Store
  private readonly educationsStore = inject(UserEducationsStore);

  // State
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  isEdit = signal<boolean>(false);

  // Form Data
  formData = {
    institution: '',
    degree: '',
    field_of_study: '',
    start_date: '',
    end_date: '',
    grade: '',
    description: ''
  };

  ngOnInit() {
    const edu = this.education();
    if (edu) {
      this.isEdit.set(true);
      this.formData = {
        institution: edu.institution,
        degree: edu.degree,
        field_of_study: edu.field_of_study,
        start_date: edu.start_date,
        end_date: edu.end_date || '',
        grade: edu.grade || '',
        description: edu.description || ''
      };
    }
  }

  isFormValid(): boolean {
    return !!(
      this.formData.institution.trim() &&
      this.formData.degree.trim() &&
      this.formData.field_of_study.trim() &&
      this.formData.start_date
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
      this.updateEducation();
    } else {
      this.createEducation();
    }
  }

  createEducation() {
    const createDto: CreateUserEducationDto = {
      institution: this.formData.institution.trim(),
      degree: this.formData.degree.trim(),
      field_of_study: this.formData.field_of_study.trim(),
      start_date: this.formData.start_date,
      end_date: this.formData.end_date || null,
      grade: this.formData.grade.trim() || null,
      description: this.formData.description.trim() || null
    };

    this.educationsStore.createItem(createDto).subscribe({
      next: (created: UserEducation) => {
        this.educationAdded.emit(created);
        this.onClose();
      },
      error: (err: any) => {
        console.error('Failed to create education:', err);
        this.error.set('Failed to create education. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  updateEducation() {
    const edu = this.education();
    if (!edu) return;

    const updateDto: UpdateUserEducationDto = {
      institution: this.formData.institution.trim(),
      degree: this.formData.degree.trim(),
      field_of_study: this.formData.field_of_study.trim(),
      start_date: this.formData.start_date,
      end_date: this.formData.end_date || null,
      grade: this.formData.grade.trim() || null,
      description: this.formData.description.trim() || null
    };

    this.educationsStore.updateItemById(edu.id, updateDto).subscribe({
      next: (updated: UserEducation) => {
        this.educationUpdated.emit(updated);
        this.onClose();
      },
      error: (err: any) => {
        console.error('Failed to update education:', err);
        this.error.set('Failed to update education. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  onDelete() {
    const edu = this.education();
    if (!edu) return;

    if (!confirm('Are you sure you want to delete this education entry? This action cannot be undone.')) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.educationsStore.deleteItem(edu.id).subscribe({
      next: () => {
        this.educationDeleted.emit(edu.id);
        this.onClose();
      },
      error: (err: any) => {
        console.error('Failed to delete education:', err);
        this.error.set('Failed to delete education. Please try again.');
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
