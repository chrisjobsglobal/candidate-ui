import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
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
import { JobStore } from './jobs/job.store';
import { JobListing } from './jobs/services/job.service';

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
                (ngModelChange)="onSearchChange()"
                class="w-full pl-10 pr-4 py-3 border border-background-subtle rounded-lg focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none transition-all"
              >
            </div>
          </div>

          <!-- Location -->
          <div class="relative">
            <select 
              [(ngModel)]="selectedLocation"
              (ngModelChange)="onLocationChange()"
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
              (ngModelChange)="onJobTypeChange()"
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
          Showing {{ filteredJobs().length }} of {{ jobStore.items().length }} jobs
          <span *ngIf="jobStore.loading().list" class="ml-2 text-primary-900">
            (Loading...)
          </span>
        </div>
        <div class="flex items-center space-x-4">
          <button
            (click)="refreshJobs()"
            [disabled]="jobStore.isLoading()"
            class="px-3 py-2 text-sm bg-primary-900 text-white rounded-lg hover:bg-primary-800 disabled:opacity-50 transition-colors"
          >
            {{ jobStore.isLoading() ? 'Refreshing...' : 'Refresh' }}
          </button>
          <span class="text-sm text-text-secondary">Sort by:</span>
          <select 
            [(ngModel)]="sortBy"
            (ngModelChange)="onSortChange()"
            class="border border-background-subtle rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none"
          >
            <option value="relevance">Relevance</option>
            <option value="date">Date Posted</option>
            <option value="salary">Salary</option>
            <option value="company">Company</option>
          </select>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="jobStore.hasError()" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center justify-between">
          <div class="text-red-800">
            <strong>Error:</strong> {{ jobStore.error() }}
          </div>
          <button
            (click)="jobStore.clearError()"
            class="text-red-600 hover:text-red-800 font-semibold"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div 
        *ngIf="jobStore.loading().list && jobStore.isEmpty()" 
        class="text-center py-12"
      >
        <div class="animate-spin w-8 h-8 border-4 border-primary-900 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-text-secondary">Loading jobs...</p>
      </div>

      <!-- Empty State -->
      <div 
        *ngIf="jobStore.isEmpty() && !jobStore.loading().list" 
        class="text-center py-12"
      >
        <p class="text-text-secondary text-lg mb-2">No jobs found</p>
        <p class="text-text-secondary">Try adjusting your search criteria or filters</p>
        <button
          (click)="loadJobs()"
          class="mt-4 px-6 py-3 bg-primary-900 text-white rounded-lg hover:bg-primary-800 transition-colors"
        >
          Load Jobs
        </button>
      </div>

      <!-- Job Listings -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" *ngIf="jobStore.hasItems()">
        <div 
          *ngFor="let job of filteredJobs()" 
          (click)="selectJob(job)"
          [class.ring-2]="job === jobStore.currentItem()"
          [class.ring-primary-900]="job === jobStore.currentItem()"
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
        <button 
          (click)="loadMoreJobs()"
          [disabled]="jobStore.loading().list || !jobStore.canLoadMore()"
          class="px-8 py-3 bg-white border border-background-subtle text-text-primary rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ jobStore.loading().list ? 'Loading...' : 'Load More Jobs' }}
        </button>
      </div>
    </div>
  `
})
export class JobsComponent implements OnInit, OnDestroy {
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

  // Computed signal for filtered jobs using the store
  filteredJobs = computed(() => {
    const items = this.jobStore.items();
    const searchQuery = this.searchQuery();
    const selectedLocation = this.selectedLocation();
    const selectedJobType = this.selectedJobType();

    // Client-side filtering for immediate UI response
    // The store handles server-side filtering for data fetching
    let filtered = items;

    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(search) ||
        job.company.toLowerCase().includes(search) ||
        job.description.toLowerCase().includes(search)
      );
    }

    if (selectedLocation && selectedLocation !== '') {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    if (selectedJobType && selectedJobType !== '') {
      filtered = filtered.filter(job => job.type === selectedJobType);
    }

    return filtered;
  });

  constructor(public jobStore: JobStore) {}

  ngOnInit() {
    // Load initial jobs data
    this.loadJobs();
  }

  ngOnDestroy() {
    // Cleanup any subscriptions
    this.jobStore.disableAutoRefresh();
  }

  loadJobs() {
    this.jobStore.initializeJobs().subscribe({
      next: (response) => {
        console.log(`Loaded ${response.items.length} jobs`);
      },
      error: (error) => {
        console.error('Failed to load jobs:', error);
      }
    });
  }

  // Search and filter methods
  onSearchChange() {
    const searchQuery = this.searchQuery();
    if (searchQuery.trim()) {
      // Trigger server-side search
      this.jobStore.searchJobs(searchQuery).subscribe();
    } else {
      // Reset to show all jobs
      this.jobStore.clearFilter().subscribe();
    }
  }

  onLocationChange() {
    const location = this.selectedLocation();
    if (location) {
      this.jobStore.filterByLocation(location).subscribe();
    } else {
      this.loadJobs();
    }
  }

  onJobTypeChange() {
    const jobType = this.selectedJobType();
    if (jobType) {
      this.jobStore.filterByType(jobType as any).subscribe();
    } else {
      this.loadJobs();
    }
  }

  onSortChange() {
    const sortBy = this.sortBy();
    if (sortBy) {
      this.jobStore.sortBy(sortBy as any).subscribe();
    }
  }

  toggleFilter(filter: any) {
    const filters = this.quickFilters();
    const index = filters.findIndex(f => f.id === filter.id);
    if (index !== -1) {
      filters[index].active = !filters[index].active;
      this.quickFilters.set([...filters]);
      
      // Apply quick filters to store
      const activeFilters = filters.reduce((acc, f) => {
        acc[f.id] = f.active;
        return acc;
      }, {} as { [key: string]: boolean });
      
      this.jobStore.applyQuickFilters(activeFilters).subscribe();
    }
  }

  toggleBookmark(job: JobListing) {
    this.jobStore.toggleBookmark(job.id).subscribe({
      next: (updatedJob) => {
        console.log(`Bookmark toggled for ${updatedJob.title}`);
      },
      error: (error) => {
        console.error('Failed to toggle bookmark:', error);
      }
    });
  }

  selectJob(job: JobListing) {
    this.jobStore.setCurrentItem(job);
  }

  loadMoreJobs() {
    this.jobStore.loadMore().subscribe({
      next: (response) => {
        console.log(`Loaded ${response.items.length} more jobs`);
      },
      error: (error) => {
        console.error('Failed to load more jobs:', error);
      }
    });
  }

  refreshJobs() {
    this.jobStore.refresh().subscribe({
      next: (response) => {
        console.log(`Refreshed ${response.items.length} jobs`);
      },
      error: (error) => {
        console.error('Failed to refresh jobs:', error);
      }
    });
  }
}
