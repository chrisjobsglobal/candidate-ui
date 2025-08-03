import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserSkillsStore, CreateUserSkillDto } from '../store/user-skills.store';
import { UserSkill } from '../../../core/models/user.model';
import {
  LucideAngularModule,
  Plus,
  Star,
  Edit,
  Trash2,
} from 'lucide-angular';

interface Skill {
  name: string;
  level: number; // 1-5
  endorsed: number;
}

@Component({
  selector: 'app-profile-skills',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="bg-white rounded-xl p-6 shadow-elegant">
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
                <lucide-angular
                  *ngFor="let star of [1, 2, 3, 4, 5]"
                  [img]="StarIcon"
                  size="14"
                  [class.text-yellow-500]="star <= skill.stars"
                  [class.text-background-subtle]="star > skill.stars"
                ></lucide-angular>
              </div>
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
                  (click)="onDeleteSkill(skill.id)"
                  [disabled]="skillsStore.loading().delete"
                  class="p-1 text-text-secondary hover:text-red-600 transition-colors disabled:opacity-50"
                  title="Delete skill"
                >
                  <lucide-angular [img]="Trash2Icon" size="12"></lucide-angular>
                </button>
              </div>
            </div>
          </div>
          <!-- Progress bar based on rating -->
          <div class="w-full bg-background-subtle rounded-full h-2">
            <div
              class="bg-primary-900 h-2 rounded-full transition-all"
              [style.width.%]="skill.rating"
            ></div>
          </div>
        </div>

        <!-- Fallback to demo skills if no API skills -->
        <div *ngIf="skillsStore.items().length === 0 && demoSkills && demoSkills.length > 0">
          <div *ngFor="let skill of demoSkills" class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-medium text-text-primary">{{ skill.name }}</span>
              <div class="flex items-center space-x-2">
                <div class="flex items-center space-x-1">
                  <lucide-angular
                    *ngFor="let star of [1, 2, 3, 4, 5]"
                    [img]="StarIcon"
                    size="14"
                    [class.text-yellow-500]="star <= skill.level"
                    [class.text-background-subtle]="star > skill.level"
                  ></lucide-angular>
                </div>
                <span class="text-sm text-text-secondary">{{ skill.endorsed }}</span>
              </div>
            </div>
            <div class="w-full bg-background-subtle rounded-full h-2">
              <div
                class="bg-primary-900 h-2 rounded-full"
                [style.width.%]="skill.level * 20"
              ></div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="skillsStore.items().length === 0 && (!demoSkills || demoSkills.length === 0)" 
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
    </div>
  `,
})
export class ProfileSkillsComponent {
  @Input() demoSkills?: Skill[];
  @Output() addSkill = new EventEmitter<void>();
  @Output() editSkill = new EventEmitter<UserSkill>();
  @Output() deleteSkill = new EventEmitter<number>();

  readonly skillsStore = inject(UserSkillsStore);

  // Lucide icons
  readonly PlusIcon = Plus;
  readonly StarIcon = Star;
  readonly EditIcon = Edit;
  readonly Trash2Icon = Trash2;

  constructor() {
    // Load skills when component initializes
    this.loadSkills();
  }

  private loadSkills(): void {
    this.skillsStore.loadItems().subscribe({
      next: (result) => {
        console.log('Skills loaded in profile component:', result);
      },
      error: (error) => {
        console.error('Failed to load skills in profile component:', error);
        // If it's an auth error, you might want to redirect to login
        if (error.status === 401) {
          console.warn('Authentication required - user may need to log in again');
        }
      }
    });
  }

  onAddSkill(): void {
    this.addSkill.emit();
  }

  onEditSkill(skill: UserSkill): void {
    this.editSkill.emit(skill);
  }

  onDeleteSkill(skillId: number): void {
    if (confirm('Are you sure you want to delete this skill?')) {
      this.skillsStore.deleteItem(skillId).subscribe({
        next: () => {
          console.log('Skill deleted successfully');
        },
        error: (error) => {
          console.error('Failed to delete skill:', error);
        }
      });
    }
  }

  refreshSkills(): void {
    this.skillsStore.refresh().subscribe();
  }
}
