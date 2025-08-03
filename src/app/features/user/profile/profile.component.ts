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
import { UserSkill } from '../../../core/models/user.model';
import { ProfileHeaderComponent } from './profile-header.component';
import { EditProfileBioComponent } from './edit-profile-bio.component';
import { ProfileSkillsComponent } from './profile-skills.component';
import {
  LucideAngularModule,
  Edit3,
  MapPin,
  Calendar,
  Linkedin,
  Github,
  Globe,
  Plus,
  Award,
  GraduationCap,
  Briefcase,
  Languages,
  Star,
  Download,
} from 'lucide-angular';

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  grade?: string;
}

interface Skill {
  name: string;
  level: number; // 1-5
  endorsed: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, ProfileHeaderComponent, EditProfileBioComponent, ProfileSkillsComponent],
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
          <div class="bg-white rounded-xl p-6 shadow-elegant">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-text-primary">
                Experience
              </h2>
              <button
                class="p-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <lucide-angular [img]="PlusIcon" size="16"></lucide-angular>
              </button>
            </div>
            <div class="space-y-6">
              <div
                *ngFor="let exp of experience()"
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
                            >{{ exp.startDate }} -
                            {{ exp.isCurrent ? 'Present' : exp.endDate }}</span
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
          </div>

          <!-- Education -->
          <div class="bg-white rounded-xl p-6 shadow-elegant">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-text-primary">Education</h2>
              <button
                class="p-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <lucide-angular [img]="PlusIcon" size="16"></lucide-angular>
              </button>
            </div>
            <div class="space-y-4">
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
                    {{ edu.fieldOfStudy }}
                  </p>
                  <p class="text-sm text-text-secondary mt-1">
                    {{ edu.startDate }} - {{ edu.endDate }}
                  </p>
                  <p *ngIf="edu.grade" class="text-sm text-text-secondary">
                    Grade: {{ edu.grade }}
                  </p>
                </div>
                <button
                  class="p-1 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <lucide-angular [img]="Edit3Icon" size="14"></lucide-angular>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-8">
          <!-- Skills -->
          <app-profile-skills
            [demoSkills]="skills()"
            (addSkill)="onAddSkill()"
            (editSkill)="onEditSkill($event)"
            (deleteSkill)="onDeleteSkill($event)"
          ></app-profile-skills>

          <!-- Languages -->
          <div class="bg-white rounded-xl p-6 shadow-elegant">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-text-primary">Languages</h2>
              <button
                class="p-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <lucide-angular [img]="PlusIcon" size="16"></lucide-angular>
              </button>
            </div>
            <div class="space-y-3">
              <div
                *ngFor="let lang of languages()"
                class="flex items-center justify-between"
              >
                <span class="font-medium text-text-primary">{{
                  lang.name
                }}</span>
                <span
                  class="text-sm text-text-secondary px-2 py-1 bg-background-subtle rounded-full"
                >
                  {{ lang.proficiency | titlecase }}
                </span>
              </div>
            </div>
          </div>

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
  readonly MapPinIcon = MapPin;
  readonly CalendarIcon = Calendar;
  readonly LinkedinIcon = Linkedin;
  readonly GithubIcon = Github;
  readonly GlobeIcon = Globe;
  readonly PlusIcon = Plus;
  readonly AwardIcon = Award;
  readonly GraduationCapIcon = GraduationCap;
  readonly BriefcaseIcon = Briefcase;
  readonly LanguagesIcon = Languages;
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
   * Handle add skill event from skills component
   */
  onAddSkill(): void {
    // For now, navigate to a skill management page or open a modal
    // In the future, this could open an inline form or modal
    console.log('Add skill requested');
    // You could navigate to a dedicated skills management page
    // this.router.navigate(['/app/profile/skills/add']);
  }

  /**
   * Handle edit skill event from skills component
   */
  onEditSkill(skill: UserSkill): void {
    console.log('Edit skill requested:', skill);
    // You could navigate to an edit page or open a modal
    // this.router.navigate(['/app/profile/skills/edit', skill.id]);
  }

  /**
   * Handle delete skill event from skills component
   */
  onDeleteSkill(skillId: number): void {
    console.log('Delete skill requested:', skillId);
    // The actual deletion is handled in the skills component
    // This method is here for any additional logic if needed
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

  experience = signal<Experience[]>([
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      startDate: 'Jan 2022',
      endDate: '',
      isCurrent: true,
      description:
        'Leading a team of 5 developers in building scalable web applications using Angular and Node.js. Responsible for architecture decisions, code reviews, and mentoring junior developers. Implemented CI/CD pipelines that reduced deployment time by 60%.',
    },
    {
      id: '2',
      title: 'Software Engineer',
      company: 'StartupXYZ',
      location: 'San Francisco, CA',
      startDate: 'Jun 2019',
      endDate: 'Dec 2021',
      isCurrent: false,
      description:
        'Developed and maintained multiple web applications using React and TypeScript. Collaborated with cross-functional teams to deliver high-quality software solutions. Reduced application load times by 40% through performance optimizations.',
    },
    {
      id: '3',
      title: 'Junior Developer',
      company: 'WebStudio',
      location: 'Remote',
      startDate: 'Mar 2018',
      endDate: 'May 2019',
      isCurrent: false,
      description:
        'Built responsive websites and web applications using HTML, CSS, JavaScript, and PHP. Worked closely with designers to implement pixel-perfect user interfaces. Gained experience in version control and agile development methodologies.',
    },
  ]);

  education = signal<Education[]>([
    {
      id: '1',
      institution: 'Stanford University',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2014',
      endDate: '2018',
      grade: '3.8 GPA',
    },
    {
      id: '2',
      institution: 'Google Cloud Certified',
      degree: 'Professional Cloud Architect',
      fieldOfStudy: 'Cloud Computing',
      startDate: '2021',
      endDate: '2021',
    },
  ]);

  skills = signal<Skill[]>([
    { name: 'JavaScript', level: 5, endorsed: 45 },
    { name: 'TypeScript', level: 5, endorsed: 38 },
    { name: 'Angular', level: 5, endorsed: 42 },
    { name: 'React', level: 4, endorsed: 35 },
    { name: 'Node.js', level: 4, endorsed: 28 },
    { name: 'Python', level: 3, endorsed: 22 },
    { name: 'AWS', level: 4, endorsed: 31 },
    { name: 'Docker', level: 3, endorsed: 18 },
  ]);

  languages = signal([
    { name: 'English', proficiency: 'native' },
    { name: 'Spanish', proficiency: 'intermediate' },
    { name: 'French', proficiency: 'beginner' },
  ]);
}
