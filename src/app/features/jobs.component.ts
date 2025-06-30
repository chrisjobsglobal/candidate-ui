import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule,
  Search,
  Filter,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Building2,
  Calendar,
  Star,
  ChevronDown
} from 'lucide-angular';

interface JobListing {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  salary: string;
  experience: string;
  postedTime: string;
  applicants: number;
  description: string;
  requirements: string[];
  tags: string[];
  isBookmarked: boolean;
  matchPercentage: number;
  isUrgent: boolean;
  companyRating: number;
}

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-text-primary mb-2">Find Your Dream Job</h1>
        <p class="text-text-secondary">Discover opportunities that match your skills and preferences</p>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-xl p-6 shadow-elegant mb-8">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="lg:col-span-2">
            <div class="relative">
              <lucide-angular 
                [img]="SearchIcon" 
                size="20" 
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
              ></lucide-angular>
              <input 
                type="text" 
                placeholder="Search job titles, companies, or keywords..."
                [(ngModel)]="searchQuery"
                class="w-full pl-10 pr-4 py-3 border border-background-subtle rounded-lg focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none transition-all"
              >
            </div>
          </div>

          <!-- Location -->
          <div class="relative">
            <select 
              [(ngModel)]="selectedLocation"
              class="w-full appearance-none px-4 py-3 border border-background-subtle rounded-lg focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none transition-all bg-white"
            >
              <option value="">All Locations</option>
              <option value="remote">Remote</option>
              <option value="san-francisco">San Francisco, CA</option>
              <option value="new-york">New York, NY</option>
              <option value="london">London, UK</option>
              <option value="toronto">Toronto, ON</option>
            </select>
            <lucide-angular 
              [img]="ChevronDownIcon" 
              size="16" 
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary pointer-events-none"
            ></lucide-angular>
          </div>

          <!-- Job Type -->
          <div class="relative">
            <select 
              [(ngModel)]="selectedJobType"
              class="w-full appearance-none px-4 py-3 border border-background-subtle rounded-lg focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none transition-all bg-white"
            >
              <option value="">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
            <lucide-angular 
              [img]="ChevronDownIcon" 
              size="16" 
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary pointer-events-none"
            ></lucide-angular>
          </div>
        </div>

        <!-- Advanced Filters -->
        <div class="mt-4 pt-4 border-t border-background-subtle">
          <div class="flex flex-wrap gap-2">
            <button 
              *ngFor="let filter of quickFilters()"
              [class.bg-primary-900]="filter.active"
              [class.text-white]="filter.active"
              [class.bg-background-subtle]="!filter.active"
              [class.text-text-secondary]="!filter.active"
              class="px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-primary-800 hover:text-white"
              (click)="toggleFilter(filter)"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>
      </div>

      <!-- Results Header -->
      <div class="flex items-center justify-between mb-6">
        <div class="text-text-secondary">
          Showing {{ filteredJobs().length }} of {{ jobs().length }} jobs
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-text-secondary">Sort by:</span>
          <select 
            [(ngModel)]="sortBy"
            class="border border-background-subtle rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none"
          >
            <option value="relevance">Relevance</option>
            <option value="date">Date Posted</option>
            <option value="salary">Salary</option>
            <option value="company">Company</option>
          </select>
        </div>
      </div>

      <!-- Job Listings -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          *ngFor="let job of filteredJobs()" 
          class="bg-white rounded-xl p-6 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 cursor-pointer border border-transparent hover:border-primary-900/20"
        >
          <!-- Job Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-gradient-to-r from-gradient-start to-gradient-end rounded-lg flex items-center justify-center">
                <lucide-angular [img]="Building2Icon" size="20" class="text-white"></lucide-angular>
              </div>
              <div class="flex-1">
                <div class="flex items-center space-x-2 mb-1">
                  <h3 class="text-lg font-semibold text-text-primary">{{ job.title }}</h3>
                  <span *ngIf="job.isUrgent" class="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                    Urgent
                  </span>
                </div>
                <div class="flex items-center space-x-2 mb-2">
                  <p class="text-text-secondary font-medium">{{ job.company }}</p>
                  <div class="flex items-center space-x-1" *ngIf="job.companyRating">
                    <lucide-angular [img]="StarIcon" size="14" class="text-yellow-500"></lucide-angular>
                    <span class="text-sm text-text-secondary">{{ job.companyRating }}</span>
                  </div>
                </div>
                <div class="flex items-center space-x-4 text-sm text-text-secondary">
                  <div class="flex items-center space-x-1">
                    <lucide-angular [img]="MapPinIcon" size="14"></lucide-angular>
                    <span>{{ job.location }}</span>
                  </div>
                  <div class="flex items-center space-x-1">
                    <lucide-angular [img]="ClockIcon" size="14"></lucide-angular>
                    <span>{{ job.postedTime }}</span>
                  </div>
                </div>
              </div>
            </div>
            <button 
              (click)="toggleBookmark(job)"
              class="p-2 hover:bg-background-subtle rounded-lg transition-colors"
            >
              <lucide-angular 
                [img]="job.isBookmarked ? BookmarkCheckIcon : BookmarkIcon" 
                size="20" 
                [class.text-primary-900]="job.isBookmarked"
                [class.text-text-secondary]="!job.isBookmarked"
              ></lucide-angular>
            </button>
          </div>

          <!-- Job Details -->
          <div class="space-y-4">
            <!-- Salary & Type -->
            <div class="flex items-center space-x-6">
              <div class="flex items-center space-x-2 text-primary-900 font-semibold">
                <lucide-angular [img]="DollarSignIcon" size="16"></lucide-angular>
                <span>{{ job.salary }}</span>
              </div>
              <span class="px-3 py-1 bg-primary-50 text-primary-900 text-sm font-medium rounded-full">
                {{ job.type | titlecase }}
              </span>
              <span class="text-sm text-text-secondary">{{ job.experience }}</span>
            </div>

            <!-- Description -->
            <p class="text-text-secondary text-sm leading-relaxed line-clamp-3">
              {{ job.description }}
            </p>

            <!-- Tags -->
            <div class="flex flex-wrap gap-2">
              <span 
                *ngFor="let tag of job.tags.slice(0, 5)" 
                class="px-2 py-1 bg-background-subtle text-text-secondary text-xs rounded-full"
              >
                {{ tag }}
              </span>
              <span 
                *ngIf="job.tags.length > 5" 
                class="px-2 py-1 bg-background-subtle text-text-secondary text-xs rounded-full"
              >
                +{{ job.tags.length - 5 }} more
              </span>
            </div>

            <!-- Match & Applicants -->
            <div class="flex items-center justify-between pt-4 border-t border-background-subtle">
              <div class="flex items-center space-x-4">
                <div class="text-sm">
                  <span class="text-primary-900 font-semibold">{{ job.matchPercentage }}% match</span>
                  <div class="w-20 bg-background-subtle rounded-full h-1 mt-1">
                    <div class="bg-primary-900 h-1 rounded-full" [style.width.%]="job.matchPercentage"></div>
                  </div>
                </div>
                <div class="flex items-center space-x-1 text-text-secondary text-sm">
                  <lucide-angular [img]="UsersIcon" size="14"></lucide-angular>
                  <span>{{ job.applicants }} applicants</span>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <button class="px-4 py-2 border border-primary-900 text-primary-900 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium">
                  View Details
                </button>
                <button class="px-4 py-2 bg-primary-900 text-white rounded-lg hover:bg-primary-800 transition-colors text-sm font-medium">
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Load More -->
      <div class="mt-12 text-center">
        <button class="px-8 py-3 bg-white border border-background-subtle text-text-primary rounded-lg hover:bg-gray-50 transition-colors font-medium">
          Load More Jobs
        </button>
      </div>
    </div>
  `
})
export class JobsComponent {
  readonly SearchIcon = Search;
  readonly FilterIcon = Filter;
  readonly MapPinIcon = MapPin;
  readonly DollarSignIcon = DollarSign;
  readonly ClockIcon = Clock;
  readonly UsersIcon = Users;
  readonly BookmarkIcon = Bookmark;
  readonly BookmarkCheckIcon = BookmarkCheck;
  readonly ExternalLinkIcon = ExternalLink;
  readonly Building2Icon = Building2;
  readonly CalendarIcon = Calendar;
  readonly StarIcon = Star;
  readonly ChevronDownIcon = ChevronDown;

  searchQuery = signal('');
  selectedLocation = signal('');
  selectedJobType = signal('');
  sortBy = signal('relevance');

  quickFilters = signal([
    { id: 'remote', label: 'Remote', active: false },
    { id: 'entry-level', label: 'Entry Level', active: false },
    { id: 'high-salary', label: 'High Salary', active: false },
    { id: 'startup', label: 'Startup', active: false },
    { id: 'tech', label: 'Tech', active: true },
    { id: 'benefits', label: 'Great Benefits', active: false }
  ]);

  jobs = signal<JobListing[]>([
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      type: 'full-time',
      salary: '$120,000 - $150,000',
      experience: '5+ years',
      postedTime: '2 days ago',
      applicants: 45,
      description: 'We are looking for a passionate Senior Frontend Developer to join our growing team. You will be responsible for building user-facing features using cutting-edge technologies including Angular, React, and modern JavaScript frameworks.',
      requirements: ['5+ years frontend experience', 'Expert in Angular/React', 'TypeScript proficiency'],
      tags: ['Angular', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'REST APIs', 'Git'],
      isBookmarked: false,
      matchPercentage: 92,
      isUrgent: false,
      companyRating: 4.5
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      location: 'Remote',
      type: 'full-time',
      salary: '$110,000 - $140,000',
      experience: '3+ years',
      postedTime: '1 day ago',
      applicants: 23,
      description: 'Join our innovative startup as a Full Stack Engineer. Work on exciting projects that impact millions of users. We offer flexible work arrangements and competitive compensation.',
      requirements: ['3+ years full-stack experience', 'Node.js & React', 'Database design'],
      tags: ['React', 'Node.js', 'MongoDB', 'AWS', 'Docker', 'GraphQL'],
      isBookmarked: true,
      matchPercentage: 88,
      isUrgent: true,
      companyRating: 4.2
    },
    {
      id: '3',
      title: 'JavaScript Developer',
      company: 'InnovateNow',
      location: 'New York, NY',
      type: 'contract',
      salary: '$80 - $100/hour',
      experience: '2+ years',
      postedTime: '3 hours ago',
      applicants: 12,
      description: 'Contract opportunity for an experienced JavaScript Developer. Work on cutting-edge web applications with modern frameworks and tools.',
      requirements: ['2+ years JavaScript', 'Modern frameworks', 'API integration'],
      tags: ['JavaScript', 'Vue.js', 'Express', 'MongoDB', 'REST', 'Agile'],
      isBookmarked: false,
      matchPercentage: 85,
      isUrgent: false,
      companyRating: 4.0
    },
    {
      id: '4',
      title: 'Senior Software Engineer',
      company: 'Google',
      location: 'Mountain View, CA',
      type: 'full-time',
      salary: '$180,000 - $220,000',
      experience: '7+ years',
      postedTime: '1 week ago',
      applicants: 156,
      description: 'Google is seeking a Senior Software Engineer to work on large-scale distributed systems. Join our team and help build products that impact billions of users worldwide.',
      requirements: ['7+ years software engineering', 'Distributed systems', 'Computer Science degree'],
      tags: ['Java', 'Python', 'Distributed Systems', 'Machine Learning', 'Cloud'],
      isBookmarked: true,
      matchPercentage: 95,
      isUrgent: false,
      companyRating: 4.8
    },
    {
      id: '5',
      title: 'Frontend Developer',
      company: 'Microsoft',
      location: 'Seattle, WA',
      type: 'full-time',
      salary: '$130,000 - $160,000',
      experience: '4+ years',
      postedTime: '4 days ago',
      applicants: 89,
      description: 'Microsoft is looking for a Frontend Developer to work on Azure portal and Office 365 applications. Experience with React and TypeScript is required.',
      requirements: ['4+ years frontend', 'React & TypeScript', 'Cloud platforms'],
      tags: ['React', 'TypeScript', 'Azure', 'Office 365', 'C#', '.NET'],
      isBookmarked: false,
      matchPercentage: 90,
      isUrgent: false,
      companyRating: 4.6
    },
    {
      id: '6',
      title: 'Junior Web Developer',
      company: 'WebStudio',
      location: 'Remote',
      type: 'full-time',
      salary: '$60,000 - $80,000',
      experience: '0-2 years',
      postedTime: '6 hours ago',
      applicants: 78,
      description: 'Perfect opportunity for a Junior Web Developer to start their career. We provide mentorship and training in modern web technologies.',
      requirements: ['Basic web development', 'HTML/CSS/JS', 'Learning mindset'],
      tags: ['HTML', 'CSS', 'JavaScript', 'PHP', 'WordPress', 'MySQL'],
      isBookmarked: false,
      matchPercentage: 75,
      isUrgent: true,
      companyRating: 3.8
    }
  ]);

  filteredJobs = signal<JobListing[]>([]);

  constructor() {
    this.filteredJobs.set(this.jobs());
  }

  toggleFilter(filter: any) {
    const filters = this.quickFilters();
    const index = filters.findIndex(f => f.id === filter.id);
    if (index !== -1) {
      filters[index].active = !filters[index].active;
      this.quickFilters.set([...filters]);
    }
  }

  toggleBookmark(job: JobListing) {
    const jobs = this.jobs();
    const index = jobs.findIndex(j => j.id === job.id);
    if (index !== -1) {
      jobs[index].isBookmarked = !jobs[index].isBookmarked;
      this.jobs.set([...jobs]);
      this.filteredJobs.set([...jobs]);
    }
  }
}
