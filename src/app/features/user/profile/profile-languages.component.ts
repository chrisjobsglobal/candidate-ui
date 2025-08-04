import {
  Component,
  signal,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserStore } from '../store/user.store';
import { UserLanguagesStore } from '../store/user-languages.store';
import { Language, UserLanguage } from '../../../core/models/user.model';
import { LanguageModalComponent } from './language-modal.component';
import { DeleteLanguageModalComponent } from './delete-language-modal.component';
import {
  LucideAngularModule,
  Plus,
  Edit,
  Trash2,
} from 'lucide-angular';

@Component({
  selector: 'app-profile-languages',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, LanguageModalComponent, DeleteLanguageModalComponent],
  template: `
    <div class="bg-white rounded-xl p-6 shadow-elegant mb-8">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-text-primary">Languages</h2>
        <button
          class="p-2 text-text-secondary hover:text-text-primary transition-colors"
          (click)="onAddLanguage()"
        >
          <lucide-angular [img]="PlusIcon" size="16"></lucide-angular>
        </button>
      </div>
      <div class="space-y-3">
        <!-- Loading state -->
        <div *ngIf="isLoading()" class="text-center py-8 text-text-secondary">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
          <p class="text-sm">Loading languages...</p>
        </div>

        <!-- Error state -->
        <div *ngIf="error() && !isLoading()" class="text-center py-8 text-red-600">
          <p class="text-sm">Failed to load languages</p>
          <button 
            class="mt-2 text-xs text-primary-500 hover:text-primary-700 underline"
            (click)="loadLanguages()"
          >
            Try again
          </button>
        </div>

        <!-- Languages list -->
        <div
          *ngFor="let lang of languages(); trackBy: trackByLanguage"
          class="flex items-center justify-between group hover:bg-gray-50 p-2 rounded-lg transition-colors"
        >
          <span class="font-medium text-text-primary">{{
            lang.name
          }}</span>
          <div class="flex items-center space-x-2">
            <span
              class="text-sm text-text-secondary px-2 py-1 bg-background-subtle rounded-full"
            >
              {{ lang.proficiency | titlecase }}
            </span>
            <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all">
              <button
                class="p-1 text-text-secondary hover:text-primary-600 transition-colors"
                (click)="onEditLanguage(lang)"
                title="Edit language"
              >
                <lucide-angular [img]="EditIcon" size="14"></lucide-angular>
              </button>
              <button
                class="p-1 text-text-secondary hover:text-red-600 transition-colors"
                (click)="onRemoveLanguage(lang)"
                title="Remove language"
              >
                <lucide-angular [img]="Trash2Icon" size="14"></lucide-angular>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Empty state -->
        <div 
          *ngIf="languages().length === 0 && !isLoading() && !error()" 
          class="text-center py-8 text-text-secondary"
        >
          <div class="mb-2">
            <lucide-angular [img]="PlusIcon" size="24" class="mx-auto opacity-50"></lucide-angular>
          </div>
          <p class="text-sm">No languages added yet</p>
          <p class="text-xs mt-1">Click the + button to add your first language</p>
        </div>
      </div>
    </div>

    <!-- Add/Edit Language Modal -->
    <app-language-modal
      #languageModal
      [language]="selectedLanguage()"
      (close)="onModalClose()"
      (saved)="onLanguageSaved($event)"
    ></app-language-modal>

    <!-- Delete Language Modal -->
    <app-delete-language-modal
      #deleteModal
      [language]="selectedLanguage()"
      (close)="onDeleteModalClose()"
      (deleted)="onLanguageDeleted($event)"
    ></app-delete-language-modal>
  `,
})
export class ProfileLanguagesComponent implements OnInit {
  private readonly userStore = inject(UserStore);
  private readonly userLanguagesStore = inject(UserLanguagesStore);

  @ViewChild('languageModal') languageModal!: LanguageModalComponent;
  @ViewChild('deleteModal') deleteModal!: DeleteLanguageModalComponent;

  readonly PlusIcon = Plus;
  readonly EditIcon = Edit;
  readonly Trash2Icon = Trash2;

  // Current user from store
  readonly currentUser = this.userStore.currentUser;

  // Languages from the store
  readonly languages = this.userLanguagesStore.items;
  readonly isLoading = this.userLanguagesStore.isLoading;
  readonly error = this.userLanguagesStore.error;

  // Selected language for modals
  readonly selectedLanguage = signal<UserLanguage | null>(null);

  ngOnInit(): void {
    // Load user languages on component initialization
    this.loadLanguages();
  }

  /**
   * Load languages from the API
   */
  loadLanguages(): void {
    this.userLanguagesStore.loadItems().subscribe({
      next: (result: { items: UserLanguage[]; pagination: any }) => {
        console.log('Languages loaded successfully:', result);
      },
      error: (error: any) => {
        console.error('Failed to load languages:', error);
      }
    });
  }

  /**
   * Track function for ngFor to improve performance
   */
  trackByLanguage(index: number, language: UserLanguage): number {
    return language.id;
  }

  /**
   * Handle adding a new language
   */
  onAddLanguage(): void {
    this.selectedLanguage.set(null);
    this.languageModal.show();
  }

  /**
   * Handle editing a language
   */
  onEditLanguage(language: UserLanguage): void {
    this.selectedLanguage.set(language);
    this.languageModal.show();
  }

  /**
   * Handle removing a language
   */
  onRemoveLanguage(language: UserLanguage): void {
    this.selectedLanguage.set(language);
    this.deleteModal.show();
  }

  /**
   * Handle language modal close
   */
  onModalClose(): void {
    this.selectedLanguage.set(null);
  }

  /**
   * Handle delete modal close
   */
  onDeleteModalClose(): void {
    this.selectedLanguage.set(null);
  }

  /**
   * Handle language saved (created or updated)
   */
  onLanguageSaved(language: UserLanguage): void {
    console.log('Language saved:', language);
    this.selectedLanguage.set(null);
    // The store automatically updates the signal, no need to manually refresh
  }

  /**
   * Handle language deleted
   */
  onLanguageDeleted(language: UserLanguage): void {
    console.log('Language deleted:', language);
    this.selectedLanguage.set(null);
    // The store automatically updates the signal, no need to manually refresh
  }

  /**
   * Update languages list (for future use with modals/forms)
   */
  updateLanguages(languages: UserLanguage[]): void {
    // This method can be used when implementing add/edit modals
    // The store will automatically update the signal when items change
    console.log('Languages updated:', languages);
  }
}
