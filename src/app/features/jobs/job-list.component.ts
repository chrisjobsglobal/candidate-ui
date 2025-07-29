import { Component, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobStore } from './job.store';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">Job Listings</h1>
      
      <!-- Search and Filters -->
      <div class="mb-6 space-y-4">
        <div class="flex gap-4">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearchChange()"
            placeholder="Search jobs..."
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button
            (click)="refresh()"
            [disabled]="jobStore.isLoading()"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ jobStore.isLoading() ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
      </div>

      <!-- Statistics -->
      <div class="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-blue-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-blue-600">{{ jobStore.items().length }}</div>
          <div class="text-sm text-blue-800">Total Jobs</div>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <div class="text-2xl font-bold text-green-600">{{ jobStore.activeJobs().length }}</div>
          <div class="text-sm text-green-800">Active Jobs</div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="jobStore.isLoading() && jobStore.isEmpty()" class="text-center py-12">
        <div class="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-gray-600">Loading jobs...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="jobStore.isEmpty() && !jobStore.isLoading()" class="text-center py-12">
        <p class="text-gray-600 text-lg">No jobs found</p>
      </div>

      <!-- Job List -->
      <div *ngIf="jobStore.hasItems()" class="space-y-4">
        <div
          *ngFor="let job of jobStore.items(); trackBy: trackByJobId"
          (click)="selectJob(job)"
          [class.ring-2]="job === jobStore.currentItem()"
          class="border border-gray-200 rounded-lg p-6 cursor-pointer hover:shadow-md"
        >
          <h3 class="text-lg font-semibold">{{ job.title }}</h3>
          <p class="text-gray-600">{{ job.location }}</p>
        </div>
      </div>
    </div>
  `
})
export class JobListComponent implements OnInit, OnDestroy {
  searchTerm = '';

  constructor(public jobStore: JobStore) {}

  ngOnInit() {
    // Note: This is just an example - you'll need to implement the actual service
    console.log('JobListComponent initialized');
  }

  ngOnDestroy() {
    this.jobStore.disableAutoRefresh();
  }

  refresh() {
    console.log('Refresh jobs');
  }

  onSearchChange() {
    console.log('Search changed:', this.searchTerm);
  }

  selectJob(job: any) {
    this.jobStore.setCurrentItem(job);
  }

  trackByJobId(index: number, job: any): string {
    return job.id;
  }
}
