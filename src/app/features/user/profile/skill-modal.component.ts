import { Component, inject, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserSkill } from '../../../core/models/user.model';
import { CreateUserSkillDto, UpdateUserSkillDto } from '../store/user-skills.store';
import {
  LucideAngularModule,
  X,
  Save,
  Star,
  Loader2,
} from 'lucide-angular';

@Component({
  selector: 'app-skill-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <!-- Modal Backdrop -->
    <div 
      *ngIf="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      (click)="onBackdropClick($event)"
    >
      <!-- Modal Overlay -->
      <div class="fixed inset-0 bg-black opacity-30 -z-1"></div>

      <!-- Modal Content -->
      <div 
        class="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        (click)="$event.stopPropagation()"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">
            {{ isEditMode ? 'Edit Skill' : 'Add New Skill' }}
          </h2>
          <button
            type="button"
            (click)="onClose()"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <lucide-angular [img]="XIcon" size="24"></lucide-angular>
          </button>
        </div>

        <!-- Modal Body -->
        <form [formGroup]="skillForm" (ngSubmit)="onSubmit()" class="p-6">
          <div class="space-y-6">
            <!-- Skill Name -->
            <div>
              <label for="skill_name" class="block text-sm font-medium text-gray-700 mb-2">
                Skill Name *
              </label>
              <input
                type="text"
                id="skill_name"
                formControlName="skill_name"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g., JavaScript, Project Management, Communication"
                [class.border-red-300]="skillForm.get('skill_name')?.invalid && skillForm.get('skill_name')?.touched"
              />
              <div *ngIf="skillForm.get('skill_name')?.invalid && skillForm.get('skill_name')?.touched" 
                   class="mt-1 text-sm text-red-600">
                Skill name is required
              </div>
            </div>

            <!-- Rating Slider -->
            <div>
              <label for="rating" class="block text-sm font-medium text-gray-700 mb-2">
                Skill Level: {{ skillForm.get('rating')?.value || 0 }}/50
              </label>
              <div class="space-y-3">
                <input
                  type="range"
                  id="rating"
                  formControlName="rating"
                  min="1"
                  max="50"
                  step="1"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div class="flex justify-between text-xs text-gray-500">
                  <span>Beginner (1)</span>
                  <span>Intermediate (25)</span>
                  <span>Expert (50)</span>
                </div>
              </div>
            </div>

            <!-- Star Preview -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Star Rating Preview
              </label>
              <div class="flex items-center space-x-1">
                <span 
                  *ngFor="let star of [1, 2, 3, 4, 5]"
                  class="text-lg"
                  [ngClass]="{
                    'text-yellow-400': star <= getStarsFromRating(skillForm.get('rating')?.value || 0),
                    'text-gray-300': star > getStarsFromRating(skillForm.get('rating')?.value || 0)
                  }"
                >
                  {{ star <= getStarsFromRating(skillForm.get('rating')?.value || 0) ? '★' : '☆' }}
                </span>
                <span class="ml-2 text-sm text-gray-600">
                  ({{ getStarsFromRating(skillForm.get('rating')?.value || 0) }}/5 stars)
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                Stars are automatically calculated based on your skill level
              </p>
            </div>

            <!-- Rating Guide -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-gray-700 mb-2">Rating Guide:</h4>
              <div class="space-y-1 text-xs text-gray-600">
                <div class="flex justify-between">
                  <span>1-10: Beginner</span>
                  <span>★☆☆☆☆</span>
                </div>
                <div class="flex justify-between">
                  <span>11-20: Basic</span>
                  <span>★★☆☆☆</span>
                </div>
                <div class="flex justify-between">
                  <span>21-30: Intermediate</span>
                  <span>★★★☆☆</span>
                </div>
                <div class="flex justify-between">
                  <span>31-40: Advanced</span>
                  <span>★★★★☆</span>
                </div>
                <div class="flex justify-between">
                  <span>41-50: Expert</span>
                  <span>★★★★★</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              (click)="onClose()"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="skillForm.invalid || isSubmitting"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-900 border border-transparent rounded-lg hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <lucide-angular 
                *ngIf="isSubmitting" 
                [img]="Loader2Icon" 
                size="16" 
                class="mr-2 animate-spin"
              ></lucide-angular>
              <lucide-angular 
                *ngIf="!isSubmitting" 
                [img]="SaveIcon" 
                size="16" 
                class="mr-2"
              ></lucide-angular>
              {{ isEditMode ? 'Update Skill' : 'Add Skill' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    /* Custom slider styles */
    .slider::-webkit-slider-thumb {
      appearance: none;
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: #1f2937;
      cursor: pointer;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .slider::-moz-range-thumb {
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: #1f2937;
      cursor: pointer;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .slider::-webkit-slider-track {
      height: 8px;
      cursor: pointer;
      background: #e5e7eb;
      border-radius: 4px;
    }

    .slider::-moz-range-track {
      height: 8px;
      cursor: pointer;
      background: #e5e7eb;
      border-radius: 4px;
    }
  `]
})
export class SkillModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() skill: UserSkill | null = null;
  @Input() isSubmitting = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<CreateUserSkillDto | UpdateUserSkillDto>();

  private readonly fb = inject(FormBuilder);

  skillForm: FormGroup;
  isEditMode = false;

  // Lucide icons
  readonly XIcon = X;
  readonly SaveIcon = Save;
  readonly StarIcon = Star;
  readonly Loader2Icon = Loader2;

  constructor() {
    this.skillForm = this.fb.group({
      skill_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      rating: [25, [Validators.required, Validators.min(1), Validators.max(50)]]
    });
  }

  ngOnInit(): void {
    this.updateForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['skill'] || changes['isOpen']) {
      this.updateForm();
    }
  }

  private updateForm(): void {
    this.isEditMode = !!this.skill;
    
    if (this.skill) {
      this.skillForm.patchValue({
        skill_name: this.skill.skill_name,
        rating: this.skill.rating
      });
    } else {
      this.skillForm.reset({
        skill_name: '',
        rating: 25
      });
    }
  }

  /**
   * Calculate stars from rating (1-50 -> 1-5 stars)
   * Rating 1-10: 1 star
   * Rating 11-20: 2 stars
   * Rating 21-30: 3 stars
   * Rating 31-40: 4 stars
   * Rating 41-50: 5 stars
   */
  getStarsFromRating(rating: number): number {
    if (rating <= 10) return 1;
    if (rating <= 20) return 2;
    if (rating <= 30) return 3;
    if (rating <= 40) return 4;
    return 5;
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.skillForm.valid && !this.isSubmitting) {
      const formValue = this.skillForm.value;
      
      if (this.isEditMode) {
        // For updates, only send changed fields
        const updateData: UpdateUserSkillDto = {};
        
        if (formValue.skill_name !== this.skill?.skill_name) {
          updateData.skill_name = formValue.skill_name;
        }
        
        if (formValue.rating !== this.skill?.rating) {
          updateData.rating = formValue.rating;
        }
        
        this.save.emit(updateData);
      } else {
        // For creation, send all required fields
        const createData: CreateUserSkillDto = {
          skill_name: formValue.skill_name,
          rating: formValue.rating
        };
        
        this.save.emit(createData);
      }
    }
  }
}
