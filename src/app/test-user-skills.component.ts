import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserSkillsStore, CreateUserSkillDto } from './features/user/store/user-skills.store';
import { UserSkill } from './core/models/user.model';
import {
  LucideAngularModule,
  ArrowLeft,
  Star,
  Plus,
  Trash2,
  Edit,
  Search,
} from 'lucide-angular';

@Component({
  selector: 'app-test-user-skills',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <button
            type="button"
            (click)="goBack()"
            class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <lucide-angular [img]="ArrowLeftIcon" size="16" class="mr-2"></lucide-angular>
            Back to App
          </button>
          
          <h1 class="text-3xl font-bold text-gray-900">User Skills Test Page</h1>
          <p class="text-gray-600 mt-2">Test the user skills store and CRUD operations</p>
        </div>

        <!-- Add New Skill Form -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <lucide-angular [img]="PlusIcon" size="20" class="mr-2 text-green-600"></lucide-angular>
            Add New Skill
          </h2>
          
          <form [formGroup]="skillForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="skill_name" class="block text-sm font-medium text-gray-700 mb-1">
                  Skill Name
                </label>
                <input
                  id="skill_name"
                  type="text"
                  formControlName="skill_name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., JavaScript, Python, Design..."
                />
                <div *ngIf="skillForm.get('skill_name')?.invalid && skillForm.get('skill_name')?.touched" 
                     class="text-red-600 text-sm mt-1">
                  Skill name is required
                </div>
              </div>
              
              <div>
                <label for="rating" class="block text-sm font-medium text-gray-700 mb-1">
                  Rating (1-100)
                </label>
                <input
                  id="rating"
                  type="number"
                  min="1"
                  max="100"
                  formControlName="rating"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter rating 1-100"
                />
                <div *ngIf="skillForm.get('rating')?.invalid && skillForm.get('rating')?.touched" 
                     class="text-red-600 text-sm mt-1">
                  Rating must be between 1 and 100
                </div>
              </div>
            </div>
            
            <div class="flex justify-end">
              <button
                type="submit"
                [disabled]="skillForm.invalid || skillsStore.loading().create"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <lucide-angular [img]="PlusIcon" size="16" class="mr-2"></lucide-angular>
                <span *ngIf="skillsStore.loading().create">Adding...</span>
                <span *ngIf="!skillsStore.loading().create">Add Skill</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Skills List -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <lucide-angular [img]="StarIcon" size="20" class="mr-2 text-yellow-600"></lucide-angular>
              Your Skills
            </h2>
            
            <div class="flex items-center space-x-4">
              <!-- Search -->
              <div class="relative">
                <lucide-angular [img]="SearchIcon" size="16" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></lucide-angular>
                <input
                  type="text"
                  placeholder="Search skills..."
                  (input)="onSearch($event)"
                  class="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              
              <!-- Sort Options -->
              <select 
                (change)="onSort($event)"
                class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="skill_name-asc">Name (A-Z)</option>
                <option value="skill_name-desc">Name (Z-A)</option>
                <option value="rating-desc">Rating (High to Low)</option>
                <option value="rating-asc">Rating (Low to High)</option>
                <option value="stars-desc">Stars (High to Low)</option>
                <option value="stars-asc">Stars (Low to High)</option>
              </select>
              
              <button
                (click)="loadSkills()"
                [disabled]="skillsStore.loading().list"
                class="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm"
              >
                Refresh
              </button>
            </div>
          </div>
          
          <!-- Loading State -->
          <div *ngIf="skillsStore.loading().list" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600">Loading skills...</p>
          </div>

          <!-- Error State -->
          <div *ngIf="skillsStore.error()" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p class="text-red-800">{{ skillsStore.error() }}</p>
          </div>

          <!-- Empty State -->
          <div *ngIf="!skillsStore.loading().list && skillsStore.items().length === 0 && !skillsStore.error()" 
               class="text-center py-12">
            <lucide-angular [img]="StarIcon" size="48" class="mx-auto text-gray-300 mb-4"></lucide-angular>
            <h3 class="text-lg font-medium text-gray-900 mb-2">No skills found</h3>
            <p class="text-gray-600 mb-6">Start by adding your first skill above.</p>
          </div>

          <!-- Skills Grid -->
          <div *ngIf="!skillsStore.loading().list && skillsStore.items().length > 0" 
               class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div *ngFor="let skill of skillsStore.items()" 
                 class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-medium text-gray-900 truncate">{{ skill.skill_name }}</h3>
                <div class="flex items-center space-x-1 ml-2">
                  <button
                    (click)="editSkill(skill)"
                    class="p-1 text-gray-400 hover:text-blue-600"
                    title="Edit skill"
                  >
                    <lucide-angular [img]="EditIcon" size="14"></lucide-angular>
                  </button>
                  <button
                    (click)="deleteSkill(skill.id)"
                    [disabled]="skillsStore.loading().delete"
                    class="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                    title="Delete skill"
                  >
                    <lucide-angular [img]="Trash2Icon" size="14"></lucide-angular>
                  </button>
                </div>
              </div>
              
              <div class="space-y-2">
                <!-- Rating Bar -->
                <div>
                  <div class="flex items-center justify-between text-sm mb-1">
                    <span class="text-gray-600">Rating</span>
                    <span class="font-medium">{{ skill.rating }}/100</span>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-blue-600 h-2 rounded-full transition-all"
                      [style.width.%]="skill.rating"
                    ></div>
                  </div>
                </div>
                
                <!-- Stars -->
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Stars</span>
                  <div class="flex items-center">
                    <lucide-angular [img]="StarIcon" size="14" class="text-yellow-500 mr-1"></lucide-angular>
                    <span class="text-sm font-medium">{{ skill.stars }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div *ngIf="skillsStore.items().length > 0 && skillsStore.pagination().totalPages > 1" 
               class="mt-6 flex items-center justify-between">
            <p class="text-sm text-gray-600">
              Showing {{ (skillsStore.pagination().page - 1) * skillsStore.pagination().limit + 1 }} to 
              {{ Math.min(skillsStore.pagination().page * skillsStore.pagination().limit, skillsStore.pagination().total) }} 
              of {{ skillsStore.pagination().total }} skills
            </p>
            
            <div class="flex items-center space-x-2">
              <button
                (click)="previousPage()"
                [disabled]="skillsStore.pagination().page <= 1 || skillsStore.loading().list"
                class="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span class="text-sm text-gray-600">
                Page {{ skillsStore.pagination().page }} of {{ skillsStore.pagination().totalPages }}
              </span>
              
              <button
                (click)="nextPage()"
                [disabled]="!skillsStore.canLoadMore() || skillsStore.loading().list"
                class="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <!-- Debug Information -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mt-8">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Debug Information</h3>
          <div class="space-y-2 text-sm">
            <div><strong>Total Skills:</strong> {{ skillsStore.items().length }}</div>
            <div><strong>Loading State:</strong> 
              <span *ngFor="let state of getLoadingStates(); let last = last">
                {{ state }}<span *ngIf="!last">, </span>
              </span>
            </div>
            <div><strong>Current Page:</strong> {{ skillsStore.pagination().page }}</div>
            <div><strong>Total Pages:</strong> {{ skillsStore.pagination().totalPages }}</div>
            <div><strong>Can Load More:</strong> {{ skillsStore.canLoadMore() ? 'Yes' : 'No' }}</div>
            <div><strong>Current Filter:</strong> {{ skillsStore.filter() | json }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class TestUserSkillsComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  skillsStore = inject(UserSkillsStore);
  skillForm: FormGroup;
  
  Math = Math;

  // Lucide icons
  ArrowLeftIcon = ArrowLeft;
  StarIcon = Star;
  PlusIcon = Plus;
  Trash2Icon = Trash2;
  EditIcon = Edit;
  SearchIcon = Search;

  constructor() {
    this.skillForm = this.fb.group({
      skill_name: ['', [Validators.required, Validators.minLength(2)]],
      rating: [50, [Validators.required, Validators.min(1), Validators.max(100)]]
    });
  }

  ngOnInit() {
    this.loadSkills();
  }

  goBack() {
    this.router.navigate(['/']);
  }

  loadSkills() {
    this.skillsStore.loadItems().subscribe({
      next: (result) => {
        console.log('Skills loaded:', result);
      },
      error: (error) => {
        console.error('Error loading skills:', error);
      }
    });
  }

  onSubmit() {
    if (this.skillForm.valid) {
      const skillData: CreateUserSkillDto = this.skillForm.value;
      
      this.skillsStore.createItem(skillData).subscribe({
        next: (newSkill) => {
          console.log('Skill created:', newSkill);
          this.skillForm.reset({
            skill_name: '',
            rating: 50
          });
        },
        error: (error) => {
          console.error('Error creating skill:', error);
        }
      });
    }
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.value.trim()) {
      this.skillsStore.search(target.value).subscribe();
    } else {
      this.skillsStore.clearFilter().subscribe();
    }
  }

  onSort(event: Event) {
    const target = event.target as HTMLSelectElement;
    const [sortBy, direction] = target.value.split('-');
    this.skillsStore.sort(sortBy, direction as 'asc' | 'desc').subscribe();
  }

  editSkill(skill: UserSkill) {
    // For now, just populate the form with the skill data
    this.skillForm.patchValue({
      skill_name: skill.skill_name,
      rating: skill.rating
    });
    
    // In a real implementation, you might want to track which skill is being edited
    // and change the form submission behavior
    console.log('Editing skill:', skill);
  }

  deleteSkill(skillId: number) {
    if (confirm('Are you sure you want to delete this skill?')) {
      this.skillsStore.deleteItem(skillId).subscribe({
        next: () => {
          console.log('Skill deleted');
        },
        error: (error) => {
          console.error('Error deleting skill:', error);
        }
      });
    }
  }

  previousPage() {
    const currentPage = this.skillsStore.pagination().page;
    if (currentPage > 1) {
      this.skillsStore.loadItems({}, { page: currentPage - 1 }).subscribe();
    }
  }

  nextPage() {
    this.skillsStore.loadMore().subscribe();
  }

  getLoadingStates(): string[] {
    const states: string[] = [];
    const loading = this.skillsStore.loading();
    if (loading.list) states.push('list');
    if (loading.detail) states.push('detail');
    if (loading.create) states.push('create');
    if (loading.update) states.push('update');
    if (loading.delete) states.push('delete');
    return states.length > 0 ? states : ['none'];
  }
}
