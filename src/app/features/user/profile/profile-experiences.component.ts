import {
  Component,
  signal,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Edit3,
  MapPin,
  Calendar,
  Plus,
} from 'lucide-angular';
import { UserExperiencesStore } from '../store/user-experiences.store';
import { UserExperience } from '../../../core/models/user.model';
import { ExperienceModalComponent } from './experience-modal.component';

@Component({
  selector: 'app-profile-experiences',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ExperienceModalComponent],
  template: `
    <!-- Experience -->
    <div class="bg-white rounded-xl p-6 shadow-elegant mb-8">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-text-primary">
          Experience
        </h2>
        <button
          (click)="openAddModal()"
          class="p-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <lucide-angular [img]="PlusIcon" size="16"></lucide-angular>
        </button>
      </div>
      <div class="space-y-6" *ngIf="!isLoading()">
        <div
          *ngFor="let exp of experiences()"
          class="relative pl-8 border-l-2 border-background-subtle last:border-l-0"
        >
          <div
            class="absolute -left-2 top-0 w-4 h-4 bg-primary-900 rounded-full"
          ></div>
          <div class="pb-6">
            <div class="flex items-start justify-between mb-2">
              <div>
                <h3 class="text-lg font-semibold text-text-primary">
                  {{ exp.title }}
                </h3>
                <p class="text-primary-900 font-medium">
                  {{ exp.company }}
                </p>
                <div
                  class="flex items-center space-x-4 mt-1 text-sm text-text-secondary"
                >
                  <div class="flex items-center space-x-1">
                    <lucide-angular
                      [img]="CalendarIcon"
                      size="14"
                    ></lucide-angular>
                    <span
                      >{{ formatDate(exp.start_date) }} -
                      {{ exp.is_current ? 'Present' : formatDate(exp.end_date) }}</span
                    >
                  </div>
                  <div class="flex items-center space-x-1">
                    <lucide-angular
                      [img]="MapPinIcon"
                      size="14"
                    ></lucide-angular>
                    <span>{{ exp.location }}</span>
                  </div>
                </div>
              </div>
              <button
                (click)="openEditModal(exp)"
                class="p-1 text-text-secondary hover:text-text-primary transition-colors"
              >
                <lucide-angular
                  [img]="Edit3Icon"
                  size="14"
                ></lucide-angular>
              </button>
            </div>
            <p class="text-text-secondary text-sm leading-relaxed">
              {{ exp.description }}
            </p>
          </div>
        </div>
      </div>
      <div *ngIf="isLoading()" class="text-center py-8">
        <p class="text-text-secondary">Loading experiences...</p>
      </div>
      <div *ngIf="error()" class="text-center py-8">
        <p class="text-red-600">{{ error() }}</p>
        <button 
          (click)="loadExperiences()" 
          class="mt-2 text-primary-900 hover:text-primary-800 text-sm"
        >
          Try again
        </button>
      </div>
    </div>

    <!-- Experience Modal -->
    <app-experience-modal
      *ngIf="showModal()"
      [experience]="selectedExperience()"
      (closeModal)="closeModal()"
      (experienceAdded)="onExperienceAdded($event)"
      (experienceUpdated)="onExperienceUpdated($event)"
      (experienceDeleted)="onExperienceDeleted($event)"
    ></app-experience-modal>
  `,
})
export class ProfileExperiencesComponent implements OnInit {
  readonly Edit3Icon = Edit3;
  readonly MapPinIcon = MapPin;
  readonly CalendarIcon = Calendar;
  readonly PlusIcon = Plus;

  private readonly experiencesStore = inject(UserExperiencesStore);

  experiences = signal<UserExperience[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  // Modal state
  showModal = signal<boolean>(false);
  selectedExperience = signal<UserExperience | null>(null);

  ngOnInit() {
    this.loadExperiences();
  }

  loadExperiences() {
    this.isLoading.set(true);
    this.error.set(null);

    this.experiencesStore.loadItems().subscribe({
      next: (response: { items: UserExperience[]; pagination: any }) => {
        this.experiences.set(response.items);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load experiences:', err);
        this.error.set('Failed to load experiences. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Open modal for adding new experience
   */
  openAddModal() {
    this.selectedExperience.set(null);
    this.showModal.set(true);
  }

  /**
   * Open modal for editing existing experience
   */
  openEditModal(experience: UserExperience) {
    this.selectedExperience.set(experience);
    this.showModal.set(true);
  }

  /**
   * Close modal
   */
  closeModal() {
    this.showModal.set(false);
    this.selectedExperience.set(null);
  }

  /**
   * Handle experience added
   */
  onExperienceAdded(experience: UserExperience) {
    const currentExperiences = this.experiences();
    this.experiences.set([experience, ...currentExperiences]);
  }

  /**
   * Handle experience updated
   */
  onExperienceUpdated(updatedExperience: UserExperience) {
    const currentExperiences = this.experiences();
    const updatedExperiences = currentExperiences.map(exp => 
      exp.id === updatedExperience.id ? updatedExperience : exp
    );
    this.experiences.set(updatedExperiences);
  }

  /**
   * Handle experience deleted
   */
  onExperienceDeleted(experienceId: number) {
    const currentExperiences = this.experiences();
    const filteredExperiences = currentExperiences.filter(exp => exp.id !== experienceId);
    this.experiences.set(filteredExperiences);
  }

  /**
   * Format date string for display
   */
  formatDate(dateString: string | null): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    } catch {
      return dateString;
    }
  }
}
