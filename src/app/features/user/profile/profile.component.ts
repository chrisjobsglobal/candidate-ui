import {
  Component,
  signal,
  inject,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserStore } from '../store/user.store';
import { ProfileHeaderComponent } from './profile-header.component';
import { EditProfileBioComponent } from './edit-profile-bio.component';
import { ProfileSkillsComponent } from './profile-skills.component';
import { ProfileExperiencesComponent } from './profile-experiences.component';
import { ProfileEducationsComponent } from './profile-educations.component';
import { ProfileLanguagesComponent } from './profile-languages.component';
import {
  LucideAngularModule,
  Edit3,
  Linkedin,
  Github,
  Globe,
  Plus,
  Award,
  Briefcase,
  Star,
  Download,
} from 'lucide-angular';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ProfileHeaderComponent, EditProfileBioComponent, ProfileSkillsComponent, ProfileExperiencesComponent, ProfileEducationsComponent, ProfileLanguagesComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <!-- Profile Header -->
      <app-profile-header
        [profileStats]="profileStats()"
        (editProfile)="onEditProfile()"
        (uploadMessage)="onUploadMessage($event)"
      ></app-profile-header>

      <!-- Success/Error Messages -->
      <div
        *ngIf="uploadMessage()"
        class="p-4 rounded-xl border shadow-sm"
        [class.bg-green-50]="uploadMessage()!.type === 'success'"
        [class.border-green-200]="uploadMessage()!.type === 'success'"
        [class.text-green-800]="uploadMessage()!.type === 'success'"
        [class.bg-red-50]="uploadMessage()!.type === 'error'"
        [class.border-red-200]="uploadMessage()!.type === 'error'"
        [class.text-red-800]="uploadMessage()!.type === 'error'"
      >
        <div class="flex items-center space-x-2">
          <div class="flex-shrink-0">
            <lucide-angular 
              *ngIf="uploadMessage()!.type === 'success'" 
              [img]="DownloadIcon" 
              size="16"
              class="text-green-600"
            ></lucide-angular>
            <lucide-angular 
              *ngIf="uploadMessage()!.type === 'error'" 
              [img]="Edit3Icon" 
              size="16"
              class="text-red-600"
            ></lucide-angular>
          </div>
          <span class="font-medium">{{ uploadMessage()!.message }}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-8">
          <!-- About -->
          <div class="bg-white rounded-xl p-4 shadow-elegant">
            <div class="flex items-center justify-between pl-2 pt-2">
              <h2 class="text-xl font-semibold text-text-primary">About</h2>
            </div>
            <app-edit-profile-bio 
              [bio]="currentUser()?.bio || ''"
              (bioUpdated)="onBioUpdated($event)"
            ></app-edit-profile-bio>
          </div>

          <!-- Experience -->
          <app-profile-experiences></app-profile-experiences>

          <!-- Education -->
          <app-profile-educations></app-profile-educations>
        </div>

        <!-- Right Column -->
        <div class="space-y-8">
          <!-- Skills -->
          <app-profile-skills></app-profile-skills>

          <!-- Languages -->
          <app-profile-languages></app-profile-languages>

          <!-- Social Links -->
          <div class="bg-white rounded-xl p-6 shadow-elegant">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-text-primary">Connect</h2>
              <button
                class="p-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <lucide-angular [img]="Edit3Icon" size="16"></lucide-angular>
              </button>
            </div>
            <div class="space-y-3">
              <a
                href="#"
                class="flex items-center space-x-3 p-3 border border-background-subtle rounded-lg hover:bg-gray-50 transition-colors"
              >
                <lucide-angular
                  [img]="LinkedinIcon"
                  size="20"
                  class="text-blue-600"
                ></lucide-angular>
                <span class="text-text-primary">LinkedIn</span>
              </a>
              <a
                href="#"
                class="flex items-center space-x-3 p-3 border border-background-subtle rounded-lg hover:bg-gray-50 transition-colors"
              >
                <lucide-angular
                  [img]="GithubIcon"
                  size="20"
                  class="text-text-primary"
                ></lucide-angular>
                <span class="text-text-primary">GitHub</span>
              </a>
              <a
                href="#"
                class="flex items-center space-x-3 p-3 border border-background-subtle rounded-lg hover:bg-gray-50 transition-colors"
              >
                <lucide-angular
                  [img]="GlobeIcon"
                  size="20"
                  class="text-text-secondary"
                ></lucide-angular>
                <span class="text-text-primary">Portfolio</span>
              </a>
            </div>
          </div>

          <!-- Resume Download -->
          <div
            class="bg-gradient-to-r from-gradient-start to-gradient-end rounded-xl p-6 text-white"
          >
            <h3 class="text-lg font-semibold mb-2">Download Resume</h3>
            <p class="text-white/90 text-sm mb-4">
              Share your complete profile with employers
            </p>
            <button
              class="w-full flex items-center justify-center space-x-2 py-3 bg-white text-primary-900 rounded-lg hover:bg-gray-100 transition-colors font-medium"
            >
              <lucide-angular [img]="DownloadIcon" size="16"></lucide-angular>
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProfileComponent {
  private readonly userStore = inject(UserStore);
  private readonly router = inject(Router);

  readonly Edit3Icon = Edit3;
  readonly LinkedinIcon = Linkedin;
  readonly GithubIcon = Github;
  readonly GlobeIcon = Globe;
  readonly PlusIcon = Plus;
  readonly AwardIcon = Award;
  readonly BriefcaseIcon = Briefcase;
  readonly StarIcon = Star;
  readonly DownloadIcon = Download;

  // Current user from store
  readonly currentUser = this.userStore.currentUser;
  readonly isLoading = this.userStore.isLoading;

  // Upload message state
  readonly uploadMessage = signal<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  profileStats = signal({
    views: 142,
    connections: 89,
    profileStrength: 85,
  });

  constructor() {
    // Load current user profile on component initialization
    this.loadUserProfile();
  }

  /**
   * Handle edit profile button click from header
   */
  onEditProfile(): void {
    this.router.navigate(['/app/profile/edit']);
  }

  /**
   * Handle upload message from header
   */
  onUploadMessage(message: { type: 'success' | 'error'; message: string }): void {
    this.uploadMessage.set(message);
    // Auto-clear message after 5 seconds
    setTimeout(() => {
      this.uploadMessage.set(null);
    }, 5000);
  }

  /**
   * Handle bio update from the bio editing component
   */
  onBioUpdated(newBio: string): void {
    console.log('Bio updated:', newBio);
    // The user store will automatically update the current user signal
    // when the bio is successfully updated via the API
  }

  /**
   * Load current user profile
   */
  private loadUserProfile(): void {
    this.userStore.fetchCurrentUserProfile().subscribe({
      next: (user) => {
        console.log('User profile loaded:', user);
      },
      error: (error) => {
        console.error('Failed to load user profile:', error);
      },
    });
  }
}
