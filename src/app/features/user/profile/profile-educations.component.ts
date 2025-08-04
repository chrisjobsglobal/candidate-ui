import {
  Component,
  signal,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Edit3,
  Plus,
  GraduationCap,
} from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { UserEducation } from '../../../core/models/user.model';
import { UserEducationsStore } from '../store/user-educations.store';
import { EducationModalComponent } from './education-modal.component';

@Component({
  selector: 'app-profile-educations',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, EducationModalComponent],
  template: `
    <!-- Education -->
    <div class="bg-white rounded-xl p-6 shadow-elegant mb-8">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-text-primary">Education</h2>
        <button
          class="p-2 text-text-secondary hover:text-text-primary transition-colors"
          (click)="onAddEducation()"
        >
          <lucide-angular [img]="PlusIcon" size="16"></lucide-angular>
        </button>
      </div>
      
      <!-- Loading state -->
      <div *ngIf="loading()" class="flex items-center justify-center py-8">
        <div class="text-text-secondary">Loading educations...</div>
      </div>
      
      <!-- Error state -->
      <div *ngIf="error()" class="flex items-center justify-center py-8">
        <div class="text-red-600">{{ error() }}</div>
      </div>
      
      <!-- Empty state -->
      <div *ngIf="!loading() && !error() && education().length === 0" class="text-center py-8">
        <div class="text-text-secondary">No education entries found. Click the + button to add your first education.</div>
      </div>

      <div class="space-y-4" *ngIf="!loading() && !error() && education().length > 0">
        <div
          *ngFor="let edu of education()"
          class="flex items-start space-x-4 p-4 border border-background-subtle rounded-lg"
        >
          <div class="p-3 bg-primary-50 rounded-lg">
            <lucide-angular
              [img]="GraduationCapIcon"
              size="20"
              class="text-primary-900"
            ></lucide-angular>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold text-text-primary">
              {{ edu.degree }}
            </h3>
            <p class="text-primary-900 font-medium">
              {{ edu.institution }}
            </p>
            <p class="text-sm text-text-secondary">
              {{ edu.field_of_study }}
            </p>
            <p class="text-sm text-text-secondary mt-1">
              {{ formatDateRange(edu.start_date, edu.end_date) }}
            </p>
            <p *ngIf="edu.grade" class="text-sm text-text-secondary">
              Grade: {{ edu.grade }}
            </p>
            <p *ngIf="edu.description" class="text-sm text-text-secondary mt-2">
              {{ edu.description }}
            </p>
          </div>
          <button
            class="p-1 text-text-secondary hover:text-text-primary transition-colors"
            (click)="onEditEducation(edu)"
          >
            <lucide-angular [img]="Edit3Icon" size="14"></lucide-angular>
          </button>
        </div>
      </div>
    </div>

    <!-- Education Modal -->
    <app-education-modal
      *ngIf="showModal()"
      [education]="selectedEducation()"
      (closeModal)="onCloseModal()"
      (educationAdded)="onEducationAdded($event)"
      (educationUpdated)="onEducationUpdated($event)"
      (educationDeleted)="onEducationDeleted($event)"
    />
  `,
})
export class ProfileEducationsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly educationsStore = inject(UserEducationsStore);

  readonly Edit3Icon = Edit3;
  readonly PlusIcon = Plus;
  readonly GraduationCapIcon = GraduationCap;

  education = signal<UserEducation[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  // Modal state
  showModal = signal<boolean>(false);
  selectedEducation = signal<UserEducation | null>(null);

  ngOnInit(): void {
    this.loadEducations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load educations from the store
   */
  private loadEducations(): void {
    this.loading.set(true);
    this.error.set(null);

    this.educationsStore.loadItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: { items: UserEducation[]; pagination: any }) => {
          this.education.set(response.items);
          this.loading.set(false);
        },
        error: (error: any) => {
          console.error('Error loading educations:', error);
          this.error.set('Failed to load educations');
          this.loading.set(false);
        }
      });
  }

  /**
   * Handle adding a new education entry
   */
  onAddEducation(): void {
    this.selectedEducation.set(null);
    this.showModal.set(true);
  }

  /**
   * Handle editing an existing education entry
   */
  onEditEducation(education: UserEducation): void {
    this.selectedEducation.set(education);
    this.showModal.set(true);
  }

  /**
   * Handle closing the modal
   */
  onCloseModal(): void {
    this.showModal.set(false);
    this.selectedEducation.set(null);
  }

  /**
   * Handle education added
   */
  onEducationAdded(education: UserEducation): void {
    const currentEducations = this.education();
    this.education.set([...currentEducations, education]);
  }

  /**
   * Handle education updated
   */
  onEducationUpdated(updatedEducation: UserEducation): void {
    const currentEducations = this.education();
    const updatedEducations = currentEducations.map(edu => 
      edu.id === updatedEducation.id ? updatedEducation : edu
    );
    this.education.set(updatedEducations);
  }

  /**
   * Handle education deleted
   */
  onEducationDeleted(educationId: number): void {
    const currentEducations = this.education();
    const filteredEducations = currentEducations.filter(edu => edu.id !== educationId);
    this.education.set(filteredEducations);
  }

  /**
   * Format date range for display
   */
  formatDateRange(startDate: string, endDate: string | null): string {
    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    };

    const start = formatDate(startDate);
    const end = endDate ? formatDate(endDate) : 'Present';
    
    return `${start} - ${end}`;
  }
}
