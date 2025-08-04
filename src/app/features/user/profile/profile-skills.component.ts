import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSkillsStore, CreateUserSkillDto, UpdateUserSkillDto } from '../store/user-skills.store';
import { UserSkill } from '../../../core/models/user.model';
import { SkillModalComponent } from './skill-modal.component';
import { DeleteSkillModalComponent } from './delete-skill-modal.component';
import {
  LucideAngularModule,
  Plus,
  Star,
  Edit,
  Trash2,
} from 'lucide-angular';

@Component({
  selector: 'app-profile-skills',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, SkillModalComponent, DeleteSkillModalComponent],
  template: `
    <div class="bg-white rounded-xl p-6 shadow-elegant mb-8">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-text-primary">Skills</h2>
        <button
          (click)="onAddSkill()"
          class="p-2 text-text-secondary hover:text-text-primary transition-colors"
          title="Add new skill"
        >
          <lucide-angular [img]="PlusIcon" size="16"></lucide-angular>
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="skillsStore.loading().list" class="text-center py-8">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-900 mx-auto mb-2"></div>
        <p class="text-text-secondary text-sm">Loading skills...</p>
      </div>

      <!-- Success/Error Messages -->
      <div
        *ngIf="message()"
        class="mb-4 p-3 rounded-lg border"
        [class.bg-green-50]="message()!.type === 'success'"
        [class.border-green-200]="message()!.type === 'success'"
        [class.text-green-800]="message()!.type === 'success'"
        [class.bg-red-50]="message()!.type === 'error'"
        [class.border-red-200]="message()!.type === 'error'"
        [class.text-red-800]="message()!.type === 'error'"
      >
        <p class="text-sm font-medium">{{ message()!.message }}</p>
      </div>

      <!-- Error State -->
      <div *ngIf="skillsStore.error()" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <p class="text-red-800 text-sm">{{ skillsStore.error() }}</p>
      </div>

      <!-- Skills List -->
      <div class="space-y-4" *ngIf="!skillsStore.loading().list">
        <!-- Real Skills from API -->
        <div *ngFor="let skill of skillsStore.items()" class="space-y-2 group">
          <div class="flex items-center justify-between">
            <span class="font-medium text-text-primary">{{ skill.skill_name }}</span>
            <div class="flex items-center space-x-2">
              <!-- Stars based on API stars field -->
              <div class="flex items-center space-x-1">
                <span 
                  *ngFor="let star of [1, 2, 3, 4, 5]"
                  class="text-sm"
                  [ngClass]="{
                    'text-yellow-400': star <= skill.stars,
                    'text-gray-300': star > skill.stars
                  }"
                >
                  {{ star <= skill.stars ? '★' : '☆' }}
                </span>
              </div>
              <!-- Rating display -->
              <span class="text-sm text-text-secondary">{{ skill.rating }}/50</span>
              <!-- Action buttons (shown on hover) -->
              <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  (click)="onEditSkill(skill)"
                  class="p-1 text-text-secondary hover:text-primary-900 transition-colors"
                  title="Edit skill"
                >
                  <lucide-angular [img]="EditIcon" size="12"></lucide-angular>
                </button>
                <button
                  (click)="onDeleteSkill(skill)"
                  [disabled]="skillsStore.loading().delete"
                  class="p-1 text-text-secondary hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Delete skill"
                >
                  <lucide-angular [img]="Trash2Icon" size="12"></lucide-angular>
                </button>
              </div>
            </div>
          </div>
          <!-- Progress bar based on rating (max 50) -->
          <div class="w-full bg-background-subtle rounded-full h-2">
            <div
              class="bg-primary-900 h-2 rounded-full transition-all"
              [style.width.%]="(skill.rating / 50) * 100"
              [title]="'Rating: ' + skill.rating + '/50'"
            ></div>
          </div>
        </div>

        <!-- Fallback to demo skills if no API skills -->
        <!-- DEMO SKILLS REMOVED - Using only API skills now -->

        <!-- Empty State -->
        <div *ngIf="skillsStore.items().length === 0" 
             class="text-center py-8">
          <lucide-angular [img]="StarIcon" size="32" class="mx-auto text-background-subtle mb-3"></lucide-angular>
          <h3 class="text-text-primary font-medium mb-1">No skills yet</h3>
          <p class="text-text-secondary text-sm mb-4">Add your first skill to showcase your expertise</p>
          <button
            (click)="onAddSkill()"
            class="inline-flex items-center px-4 py-2 bg-primary-900 text-white rounded-lg hover:bg-primary-800 transition-colors text-sm"
          >
            <lucide-angular [img]="PlusIcon" size="14" class="mr-2"></lucide-angular>
            Add Skill
          </button>
        </div>
      </div>

      <!-- Skill Modal -->
      <app-skill-modal
        [isOpen]="isSkillModalOpen()"
        [skill]="selectedSkill()"
        [isSubmitting]="skillsStore.loading().create || skillsStore.loading().update"
        (close)="onCloseSkillModal()"
        (save)="onSaveSkill($event)"
      ></app-skill-modal>

      <!-- Delete Skill Modal -->
      <app-delete-skill-modal
        #deleteSkillModal
        [skill]="skillToDelete()"
        (close)="onCloseDeleteModal()"
        (deleted)="onSkillDeleted($event)"
      ></app-delete-skill-modal>
    </div>
  `,
})
export class ProfileSkillsComponent implements OnInit {
  readonly skillsStore = inject(UserSkillsStore);

  @ViewChild('deleteSkillModal') deleteSkillModal!: DeleteSkillModalComponent;

  // Modal state
  readonly isSkillModalOpen = signal(false);
  readonly selectedSkill = signal<UserSkill | null>(null);
  readonly skillToDelete = signal<UserSkill | null>(null);

  // Success/error message state
  readonly message = signal<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Lucide icons
  readonly PlusIcon = Plus;
  readonly StarIcon = Star;
  readonly EditIcon = Edit;
  readonly Trash2Icon = Trash2;

  constructor() {
    // Skills will be loaded in ngOnInit following the job store pattern
  }

  ngOnInit(): void {
    // Load skills when component initializes - following job store pattern
    this.skillsStore.loadItems().subscribe({
      next: (result) => {
        this.skillsStore.items().forEach(skill => {
          console.log(`Skill: ${skill.skill_name}, Stars: ${skill.stars}, Rating: ${skill.rating}`);
        });
      },
      error: (error) => {
        console.error('Failed to load skills:', error);
        // Error handling is managed by the store's error signal
      }
    });
  }

  onAddSkill(): void {
    this.selectedSkill.set(null);
    this.isSkillModalOpen.set(true);
  }

  onEditSkill(skill: UserSkill): void {
    this.selectedSkill.set(skill);
    this.isSkillModalOpen.set(true);
  }

  onDeleteSkill(skill: UserSkill): void {
    this.skillToDelete.set(skill);
    this.deleteSkillModal.show();
  }

  onCloseDeleteModal(): void {
    this.skillToDelete.set(null);
  }

  onSkillDeleted(deletedSkill: UserSkill): void {
    console.log('Skill deleted successfully:', deletedSkill);
    this.showSuccessMessage('Skill deleted successfully!');
    this.skillToDelete.set(null);
  }

  refreshSkills(): void {
    this.skillsStore.refresh().subscribe();
  }

  // Modal-related methods

  onCloseSkillModal(): void {
    this.isSkillModalOpen.set(false);
    this.selectedSkill.set(null);
  }

  onSaveSkill(skillData: CreateUserSkillDto | UpdateUserSkillDto): void {
    const selectedSkill = this.selectedSkill();
    
    if (selectedSkill) {
      // Update existing skill
      this.skillsStore.updateItemById(selectedSkill.id, skillData as UpdateUserSkillDto).subscribe({
        next: (updatedSkill: UserSkill) => {
          console.log('Skill updated successfully:', updatedSkill);
          this.onCloseSkillModal();
          this.showSuccessMessage('Skill updated successfully!');
        },
        error: (error: any) => {
          console.error('Failed to update skill:', error);
          this.showErrorMessage('Failed to update skill. Please try again.');
        }
      });
    } else {
      // Create new skill
      this.skillsStore.createItem(skillData as CreateUserSkillDto).subscribe({
        next: (newSkill: UserSkill) => {
          console.log('Skill created successfully:', newSkill);
          this.onCloseSkillModal();
          this.showSuccessMessage('Skill added successfully!');
        },
        error: (error: any) => {
          console.error('Failed to create skill:', error);
          this.showErrorMessage('Failed to add skill. Please try again.');
        }
      });
    }
  }

  private showSuccessMessage(message: string): void {
    this.message.set({ type: 'success', message });
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.message.set(null);
    }, 5000);
  }

  private showErrorMessage(message: string): void {
    this.message.set({ type: 'error', message });
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.message.set(null);
    }, 5000);
  }
}
