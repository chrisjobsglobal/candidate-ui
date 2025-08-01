import {
  Component,
  signal,
  inject,
  OnInit,
  OnDestroy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil, catchError, of } from 'rxjs';
import { UserWorkStatusStore, UpdateWorkStatusDto } from '../store/user-work-status.store';
import {
  LucideAngularModule,
  Save,
  X,
  Briefcase,
  Users,
  MessageCircle,
  Building2,
  Loader2,
  AlertCircle,
  Check,
  Eye,
  EyeOff,
} from 'lucide-angular';

@Component({
  selector: 'app-edit-profile-work-status',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Work Status</h1>
            <p class="text-gray-600 mt-2">Manage your current work availability and hiring status</p>
          </div>
          <button
            type="button"
            (click)="navigateBack()"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <lucide-angular [img]="XIcon" size="16" class="mr-2"></lucide-angular>
            Back to Profile
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="workStatusStore.loading().get && !workStatusStore.hasData()" 
           class="bg-white rounded-xl border border-gray-200 p-8 shadow-sm text-center">
        <lucide-angular [img]="Loader2Icon" size="32" class="mx-auto mb-4 text-blue-600 animate-spin"></lucide-angular>
        <p class="text-gray-600">Loading work status...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="workStatusStore.error() && !workStatusStore.hasData()" 
           class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
        <div class="flex items-center">
          <lucide-angular [img]="AlertCircleIcon" size="20" class="text-red-600 mr-3"></lucide-angular>
          <div>
            <h3 class="text-sm font-medium text-red-800">Error Loading Work Status</h3>
            <p class="text-sm text-red-600 mt-1">{{ workStatusStore.error() }}</p>
          </div>
        </div>
        <button
          type="button"
          (click)="loadWorkStatus()"
          class="mt-4 inline-flex items-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          Try Again
        </button>
      </div>

      <!-- Success Message -->
      <div *ngIf="showSuccessMessage()" 
           class="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
        <div class="flex items-center">
          <lucide-angular [img]="CheckIcon" size="20" class="text-green-600 mr-3"></lucide-angular>
          <div>
            <h3 class="text-sm font-medium text-green-800">Work Status Updated</h3>
            <p class="text-sm text-green-600 mt-1">Your work status has been successfully updated.</p>
          </div>
        </div>
      </div>

      <!-- Current Status Preview -->
      <div *ngIf="workStatusStore.hasData()" class="bg-blue-50 rounded-xl border border-blue-200 p-6 mb-8">
        <h3 class="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <lucide-angular [img]="EyeIcon" size="20" class="mr-2"></lucide-angular>
          Current Status Preview
        </h3>
        <div class="flex flex-wrap gap-2 mb-4">
          <span *ngIf="workStatusStore.isHiring()" 
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <lucide-angular [img]="UsersIcon" size="14" class="mr-1"></lucide-angular>
            Hiring
          </span>
          <span *ngIf="workStatusStore.isOpenToWork()" 
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <lucide-angular [img]="BriefcaseIcon" size="14" class="mr-1"></lucide-angular>
            Open to Work
          </span>
          <span *ngIf="!workStatusStore.isHiring() && !workStatusStore.isOpenToWork()" 
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <lucide-angular [img]="EyeOffIcon" size="14" class="mr-1"></lucide-angular>
            Status Not Set
          </span>
        </div>
        @if (workStatusStore.workStatusSummary(); as summary) {
          <div class="text-sm text-blue-800">
            <p class="font-medium">{{ summary.displayText }}</p>
            @if (summary.message) {
              <p class="mt-1 text-blue-600">"{{ summary.message }}"</p>
            }
          </div>
        }
      </div>

      <!-- Work Status Form -->
      <form *ngIf="workStatusStore.hasData() || workStatusStore.error()" 
            [formGroup]="workStatusForm" 
            (ngSubmit)="onSubmit()" 
            class="space-y-8">
        
        <!-- Status Toggles -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <lucide-angular [img]="BriefcaseIcon" size="20" class="mr-2 text-blue-600"></lucide-angular>
            Work Availability
          </h2>
          
          <div class="space-y-6">
            <!-- Open to Work Toggle -->
            <div class="flex items-start space-x-3">
              <div class="flex items-center h-5">
                <input
                  id="is_open_to_work"
                  name="is_open_to_work"
                  type="checkbox"
                  formControlName="is_open_to_work"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div class="text-sm">
                <label for="is_open_to_work" class="font-medium text-gray-900 cursor-pointer">
                  Open to Work
                </label>
                <p class="text-gray-500">
                  Let others know you're available for new opportunities
                </p>
              </div>
            </div>

            <!-- Hiring Toggle -->
            <div class="flex items-start space-x-3">
              <div class="flex items-center h-5">
                <input
                  id="is_hiring"
                  name="is_hiring"
                  type="checkbox"
                  formControlName="is_hiring"
                  class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>
              <div class="text-sm">
                <label for="is_hiring" class="font-medium text-gray-900 cursor-pointer">
                  Currently Hiring
                </label>
                <p class="text-gray-500">
                  Indicate that your company is actively looking for talent
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Job Information -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <lucide-angular [img]="Building2Icon" size="20" class="mr-2 text-purple-600"></lucide-angular>
            Current Position
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Job Title -->
            <div>
              <label for="job_title" class="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <input
                type="text"
                id="job_title"
                formControlName="job_title"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Senior Software Engineer"
                maxlength="100"
              />
              <p class="mt-1 text-sm text-gray-500">Your current or desired job title</p>
            </div>

            <!-- Company -->
            <div>
              <label for="company" class="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <input
                type="text"
                id="company"
                formControlName="company"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Tech Solutions Inc."
                maxlength="100"
              />
              <p class="mt-1 text-sm text-gray-500">Your current or previous company</p>
            </div>
          </div>
        </div>

        <!-- Status Message -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <lucide-angular [img]="MessageCircleIcon" size="20" class="mr-2 text-orange-600"></lucide-angular>
            Status Message
          </h2>
          
          <div>
            <label for="work_status_message" class="block text-sm font-medium text-gray-700 mb-2">
              Work Status Message
            </label>
            <textarea
              id="work_status_message"
              formControlName="work_status_message"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Share more details about your current work status, what you're looking for, or what positions you're hiring for..."
              maxlength="500"
            ></textarea>
            <div class="mt-2 flex justify-between items-center">
              <p class="text-sm text-gray-500">
                This message will be visible to others on your profile
              </p>
              <span class="text-sm text-gray-400">
                {{ (workStatusForm.get('work_status_message')?.value || '').length }}/500
              </span>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            (click)="resetForm()"
            [disabled]="isSubmitting()"
            class="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            [disabled]="workStatusForm.invalid || isSubmitting()"
            class="inline-flex items-center px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <lucide-angular 
              *ngIf="!isSubmitting()" 
              [img]="SaveIcon" 
              size="16" 
              class="mr-2"
            ></lucide-angular>
            <lucide-angular 
              *ngIf="isSubmitting()" 
              [img]="Loader2Icon" 
              size="16" 
              class="mr-2 animate-spin"
            ></lucide-angular>
            {{ isSubmitting() ? 'Updating...' : 'Update Work Status' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Custom checkbox styling */
    input[type="checkbox"]:checked {
      background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z'/%3e%3c/svg%3e");
    }
  `]
})
export class EditProfileWorkStatusComponent implements OnInit, OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly workStatusStore = inject(UserWorkStatusStore);
  private readonly destroy$ = new Subject<void>();

  // Form
  workStatusForm: FormGroup;

  // Icons
  readonly XIcon = X;
  readonly SaveIcon = Save;
  readonly BriefcaseIcon = Briefcase;
  readonly UsersIcon = Users;
  readonly MessageCircleIcon = MessageCircle;
  readonly Building2Icon = Building2;
  readonly Loader2Icon = Loader2;
  readonly AlertCircleIcon = AlertCircle;
  readonly CheckIcon = Check;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;

  // State
  readonly isSubmitting = signal<boolean>(false);
  readonly showSuccessMessage = signal<boolean>(false);

  constructor() {
    this.workStatusForm = this.formBuilder.group({
      is_hiring: [false],
      is_open_to_work: [false],
      job_title: ['', [Validators.maxLength(100)]],
      company: ['', [Validators.maxLength(100)]],
      work_status_message: ['', [Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.loadWorkStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadWorkStatus(): void {
    this.workStatusStore.getWorkStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (workStatus) => {
          this.populateForm(workStatus);
        },
        error: (error) => {
          console.error('Failed to load work status:', error);
        }
      });
  }

  populateForm(workStatus: any): void {
    this.workStatusForm.patchValue({
      is_hiring: workStatus.is_hiring || false,
      is_open_to_work: workStatus.is_open_to_work || false,
      job_title: workStatus.job_title || '',
      company: workStatus.company || '',
      work_status_message: workStatus.work_status_message || ''
    });
  }

  onSubmit(): void {
    if (this.workStatusForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      this.showSuccessMessage.set(false);

      const formData: UpdateWorkStatusDto = this.workStatusForm.value;

      // Optimistic update
      this.workStatusStore.updateWorkStatusOptimistic(formData);

      this.workStatusStore.updateWorkStatus(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedStatus) => {
            this.isSubmitting.set(false);
            this.showSuccessMessage.set(true);
            
            // Hide success message after 5 seconds
            setTimeout(() => {
              this.showSuccessMessage.set(false);
            }, 5000);
          },
          error: (error) => {
            this.isSubmitting.set(false);
            console.error('Failed to update work status:', error);
            
            // Revert optimistic update by refreshing data
            this.workStatusStore.refresh()
              .pipe(takeUntil(this.destroy$))
              .subscribe();
          }
        });
    }
  }

  resetForm(): void {
    const currentStatus = this.workStatusStore.workStatus();
    if (currentStatus) {
      this.populateForm(currentStatus);
    } else {
      this.workStatusForm.reset({
        is_hiring: false,
        is_open_to_work: false,
        job_title: '',
        company: '',
        work_status_message: ''
      });
    }
    this.showSuccessMessage.set(false);
  }

  navigateBack(): void {
    this.router.navigate(['/profile']);
  }
}