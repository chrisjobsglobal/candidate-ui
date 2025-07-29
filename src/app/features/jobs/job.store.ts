import { Injectable, computed, inject } from '@angular/core';
import { Observable, tap, catchError, finalize } from 'rxjs';
import { BaseStore, CrudOperations } from '../../core/store/base-store';
import { BaseFilter } from '../../core/store/base-state';
import { JobListing, JobFilter, CreateJobDto, UpdateJobDto, JobService } from './services/job.service';

/**
 * Job store implementation using the base store with HTTP calls
 */
@Injectable({
  providedIn: 'root'
})
export class JobStore extends BaseStore<JobListing, CreateJobDto, UpdateJobDto, JobFilter> {
  
  private jobService = inject(JobService);
  
  constructor() {
    super({
      enableOptimisticUpdates: true,
      enableCaching: true,
      cacheTimeout: 300000 // 5 minutes
    });
  }

  protected getService(): CrudOperations<JobListing, CreateJobDto, UpdateJobDto, JobFilter> {
    return this.jobService;
  }

  protected getItemId(job: JobListing): string {
    return job.id;
  }

  protected getDefaultFilter(): JobFilter {
    return {
      search: '',
      sortBy: 'relevance',
      sortDirection: 'desc'
    };
  }

  protected compareItems(job1: JobListing, job2: JobListing): boolean {
    return job1.id === job2.id;
  }

  // Computed signals for specific job queries
  readonly activeJobs = computed(() => 
    this.items().filter(job => !job.isUrgent) // Non-urgent jobs
  );

  readonly urgentJobs = computed(() => 
    this.items().filter(job => job.isUrgent)
  );

  readonly bookmarkedJobs = computed(() => 
    this.items().filter(job => job.isBookmarked)
  );

  readonly fullTimeJobs = computed(() => 
    this.items().filter(job => job.type === 'full-time')
  );

  readonly remoteJobs = computed(() => 
    this.items().filter(job => job.type === 'remote' || job.location.toLowerCase().includes('remote'))
  );

  readonly highSalaryJobs = computed(() => 
    this.items().filter(job => {
      // Simple check for high salary - in real app, parse salary properly
      return job.salary.includes('$120,000') || job.salary.includes('$130,000') || job.salary.includes('$150,000') || job.salary.includes('$180,000');
    })
  );

  readonly recentJobs = computed(() => 
    this.items().filter(job => {
      // Simple check for recent jobs - in real app, parse dates properly
      return job.postedTime.includes('day') || job.postedTime.includes('hour') || job.postedTime.includes('Just now');
    })
  );

  readonly jobsByCompany = computed(() => {
    const jobs = this.items();
    return jobs.reduce((acc, job) => {
      if (!acc[job.company]) acc[job.company] = [];
      acc[job.company].push(job);
      return acc;
    }, {} as Record<string, JobListing[]>);
  });

  readonly averageMatchPercentage = computed(() => {
    const jobs = this.items();
    if (jobs.length === 0) return 0;
    const total = jobs.reduce((sum, job) => sum + job.matchPercentage, 0);
    return Math.round(total / jobs.length);
  });

  // Custom job-specific methods

  /**
   * Search jobs by specific criteria
   */
  searchJobs(searchQuery: string): Observable<{ items: JobListing[]; pagination: any }> {
    return this.search(searchQuery);
  }

  /**
   * Filter jobs by type
   */
  filterByType(type: JobFilter['type']): Observable<{ items: JobListing[]; pagination: any }> {
    return this.applyFilter({ type });
  }

  /**
   * Filter jobs by location
   */
  filterByLocation(location: string): Observable<{ items: JobListing[]; pagination: any }> {
    return this.applyFilter({ location });
  }

  /**
   * Filter jobs by experience level
   */
  filterByExperience(experience: string): Observable<{ items: JobListing[]; pagination: any }> {
    return this.applyFilter({ experience });
  }

  /**
   * Filter remote jobs only
   */
  filterRemoteJobs(): Observable<{ items: JobListing[]; pagination: any }> {
    return this.applyFilter({ isRemote: true });
  }

  /**
   * Filter urgent jobs only
   */
  filterUrgentJobs(): Observable<{ items: JobListing[]; pagination: any }> {
    return this.applyFilter({ isUrgent: true });
  }

  /**
   * Filter by tags
   */
  filterByTags(tags: string[]): Observable<{ items: JobListing[]; pagination: any }> {
    return this.applyFilter({ tags });
  }

  /**
   * Apply multiple filters at once
   */
  applyQuickFilters(filters: { [key: string]: boolean }): Observable<{ items: JobListing[]; pagination: any }> {
    const jobFilter: Partial<JobFilter> = {};

    if (filters['remote']) jobFilter.isRemote = true;
    if (filters['urgent']) jobFilter.isUrgent = true;
    if (filters['entry-level']) jobFilter.experience = '0-2 years';
    if (filters['tech']) jobFilter.tags = ['JavaScript', 'TypeScript', 'Angular', 'React', 'Node.js'];
    
    return this.applyFilter(jobFilter);
  }

  /**
   * Toggle bookmark status for a job
   */
  toggleBookmark(jobId: string): Observable<JobListing> {
    // Use the service method for bookmarking
    this.setLoading('update', true);
    this.clearError();

    return this.jobService.toggleBookmark(jobId).pipe(
      tap(updatedJob => {
        this.updateItem(updatedJob);
        if (this.currentItem()?.id === jobId) {
          this.setCurrentItem(updatedJob);
        }
      }),
      catchError(error => {
        this.setError(this.extractErrorMessage(error));
        throw error;
      }),
      finalize(() => this.setLoading('update', false))
    );
  }

  /**
   * Sort jobs by criteria
   */
  sortBy(sortBy: JobFilter['sortBy'], sortDirection: 'asc' | 'desc' = 'desc'): Observable<{ items: JobListing[]; pagination: any }> {
    return this.sort(sortBy!, sortDirection);
  }

  /**
   * Get jobs for a specific company
   */
  getJobsByCompany(company: string): Observable<{ items: JobListing[]; pagination: any }> {
    return this.applyFilter({ search: company });
  }

  /**
   * Initialize with default data load
   */
  initializeJobs(): Observable<{ items: JobListing[]; pagination: any }> {
    return this.loadItems();
  }
}
