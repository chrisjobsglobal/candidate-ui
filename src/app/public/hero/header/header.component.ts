import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  Search,
  Users,
  Database,
  MapPin,
  Upload,
  BriefcaseBusiness,
  Sparkles,
} from 'lucide-angular';

interface Statistic {
  value: string;
  label: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <!-- Hero Section -->
    <section class="pt-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <!-- Main Headline -->
        <h1
          class="text-6xl md:text-7xl font-bold text-text-primary mb-8 leading-tight"
        >
          Find what's next for you
        </h1>

        <!-- Tab Toggle -->
        <div class="max-w-2xl mx-auto mb-3">
          <div class="flex bg-gray-100 rounded-2xl p-1">
            <button
              (click)="activeTab.set('search')"
              [class]="
                activeTab() === 'search'
                  ? 'flex-1 py-3 px-6 rounded-xl bg-white text-primary-900 font-semibold shadow-sm transition-all duration-200'
                  : 'flex-1 py-3 px-6 rounded-xl text-text-secondary font-medium hover:text-text-primary transition-all duration-200'
              "
            >
              <lucide-angular
                [img]="BriefcaseBusinessIcon"
                size="18"
                class="inline mr-2"
              ></lucide-angular>
              Search Jobs
            </button>
            <button
              (click)="activeTab.set('upload')"
              [class]="
                activeTab() === 'upload'
                  ? 'flex-1 py-3 px-6 rounded-xl bg-white text-primary-900 font-semibold shadow-sm transition-all duration-200'
                  : 'flex-1 py-3 px-6 rounded-xl text-text-secondary font-medium hover:text-text-primary transition-all duration-200'
              "
            >
              <lucide-angular
                [img]="SparklesIcon"
                size="18"
                class="inline mr-2"
              ></lucide-angular>
              AI CV Match
            </button>
          </div>
        </div>

        <!-- Search Tab Content -->
        <div *ngIf="activeTab() === 'search'" class="max-w-2xl mx-auto mb-16">
          <div class="bg-gray-50 rounded-2xl p-2 border border-gray-200">
            <div class="flex">
              <div class="flex-1 relative">
                <lucide-angular
                  [img]="SearchIcon"
                  size="20"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                ></lucide-angular>
                <input
                  type="text"
                  placeholder="Job title, company, or keyword"
                  [(ngModel)]="searchQuery"
                  class="w-full pl-14 pr-4 py-4 bg-transparent text-text-primary placeholder-text-muted border-0 rounded-xl focus:outline-none"
                />
              </div>
              <button
                (click)="onSearch()"
                class="bg-primary-900 hover:bg-primary-800 text-white font-semibold py-4 px-8 rounded-xl transition-colors flex items-center gap-2"
              >
                <lucide-angular [img]="SearchIcon" size="20"></lucide-angular>
                Search
              </button>
            </div>
          </div>
        </div>

        <!-- AI CV Upload Tab Content -->
        <div *ngIf="activeTab() === 'upload'" class="max-w-2xl mx-auto mb-6">
          <div
            class="bg-gradient-to-r from-primary-50/20 to-primary-100/20 rounded-2xl p-8 border border-primary-200"
          >
            <div class="text-center">
              <div
                class="bg-primary-900 rounded-full p-4 mx-auto w-16 h-16 flex items-center justify-center mb-6"
              >
                <lucide-angular
                  [img]="UploadIcon"
                  size="28"
                  class="text-white"
                ></lucide-angular>
              </div>
              <h3 class="text-2xl font-bold text-text-primary mb-4">
                🚀 AI-Powered Career Matching
              </h3>
              <p class="text-text-secondary mb-6 text-lg max-w-md mx-auto">
                Upload your CV and let our advanced AI instantly analyze your
                skills, experience, and preferences to find perfect job matches
                tailored just for you.
              </p>

              <!-- Upload Area -->
              <div
                class="border-2 border-dashed border-primary-300 rounded-xl p-8 mb-6 bg-white/50 hover:bg-white/70 transition-colors cursor-pointer"
                (click)="triggerFileUpload()"
                (dragover)="onDragOver($event)"
                (drop)="onDrop($event)"
              >
                <input
                  #fileInput
                  type="file"
                  class="hidden"
                  accept=".pdf,.doc,.docx"
                  (change)="onFileSelected($event)"
                />
                <lucide-angular
                  [img]="UploadIcon"
                  size="32"
                  class="text-primary-600 mx-auto mb-4"
                ></lucide-angular>
                <p class="text-text-primary font-semibold mb-2">
                  Drop your CV here or click to browse
                </p>
                <p class="text-text-secondary text-sm">
                  Supports PDF, DOC, DOCX files up to 10MB
                </p>
              </div>

              <button
                (click)="onUploadCV()"
                [disabled]="!selectedFile()"
                [class]="
                  selectedFile()
                    ? 'bg-primary-900 hover:bg-primary-800 text-white font-semibold py-4 px-8 rounded-xl transition-colors flex items-center gap-2 mx-auto'
                    : 'bg-gray-300 text-gray-800 font-semibold py-4 px-8 rounded-xl flex items-center gap-2 mx-auto cursor-not-allowed'
                "
              >
                <lucide-angular [img]="UploadIcon" size="20"></lucide-angular>
                {{
                  selectedFile()
                    ? 'Analyze CV & Find Matches'
                    : 'Select a file first'
                }}
              </button>

              <div
                *ngIf="selectedFile()"
                class="mt-4 text-sm text-text-secondary"
              >
                Selected: {{ selectedFile()?.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Alternative Registration Option -->
        <div *ngIf="activeTab() === 'upload'" class="max-w-2xl mx-auto mb-16">
          <div class="text-center mb-6">
            <div class="text-text-secondary font-medium">OR</div>
          </div>
          <div class="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <div class="text-center">
              <h4 class="text-lg font-semibold text-text-primary mb-2">
                Don't have a CV ready?
              </h4>
              <p class="text-text-secondary mb-4 text-sm">
                Join our platform now and build your profile manually. You can
                always upload your CV later.
              </p>
              <a
                (click)="navigateToRegister()"
                class="text-primary-600 cursor-pointer font-medium py-3 px-6  transition-colors"
              >
                Create Account Without CV
              </a>
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div class="grid grid-cols-3 gap-8 mb-10">
          <div
            *ngFor="let stat of statistics; let i = index"
            class="text-center"
          >
            <div
              class="text-3xl md:text-4xl font-bold text-text-primary/60 mb-2 flex items-center justify-center gap-2"
            >
              <lucide-angular
                [img]="getStatIcon(i)"
                size="32"
                class="text-primary-900"
              ></lucide-angular>
              <div>{{ stat.value }}</div>
            </div>
            <div class="text-text-secondary/80 font-medium">
              {{ stat.label }}
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class HeaderComponent {
  // Icons
  readonly SearchIcon = Search;
  readonly UsersIcon = Users;
  readonly DatabaseIcon = Database;
  readonly MapPinIcon = MapPin;
  readonly UploadIcon = Upload;
  readonly BriefcaseBusinessIcon = BriefcaseBusiness;
  readonly SparklesIcon = Sparkles;

  // Form data
  searchQuery = signal('');
  activeTab = signal<'search' | 'upload'>('search');
  selectedFile = signal<File | null>(null);

  // Statistics data
  statistics: Statistic[] = [
    {
      value: '400K+',
      label: 'Candidates Deployed',
    },
    {
      value: '10M+',
      label: 'Candidate Profiles',
    },
    {
      value: '21',
      label: 'Branches across 15 Countries',
    },
  ];

  constructor(private router: Router) {}

  getStatIcon(index: number) {
    const icons = [this.UsersIcon, this.DatabaseIcon, this.MapPinIcon];
    return icons[index];
  }

  onSearch(): void {
    if (this.searchQuery()) {
      this.router.navigate(['/app/jobs'], {
        queryParams: {
          search: this.searchQuery(),
        },
      });
    } else {
      this.navigateToJobs();
    }
  }

  onUploadCV(): void {
    if (this.selectedFile()) {
      // TODO: Implement AI CV upload functionality
      console.log('Uploading CV:', this.selectedFile()?.name);
      // Here you would typically:
      // 1. Upload the file to your backend
      // 2. Parse CV with AI
      // 3. Register user with parsed data
      // 4. Show job matches

      this.router.navigate(['/app/jobs'], {
        queryParams: {
          aiUpload: 'true',
          fileName: this.selectedFile()?.name,
        },
      });
    }
  }

  triggerFileUpload(): void {
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    fileInput?.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a PDF, DOC, or DOCX file.');
        return;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        alert('File size must be less than 10MB.');
        return;
      }

      this.selectedFile.set(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a PDF, DOC, or DOCX file.');
        return;
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        alert('File size must be less than 10MB.');
        return;
      }

      this.selectedFile.set(file);
    }
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

  private navigateToJobs(): void {
    this.router.navigate(['/app/jobs']);
  }
}
