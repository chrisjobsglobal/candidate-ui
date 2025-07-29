# Base Store and State Documentation

This project implements modern signal-based state management using Angular 20's signals for CRUD operations with loading states, filtering, pagination, and error handling.

## Architecture Overview

The base store and state system consists of two main classes:

1. **BaseStateClass** - Abstract reactive state management with signals
2. **BaseStore** - Abstract store with CRUD operations extending BaseStateClass

## Key Features

- ✅ **Signal-based reactive state** - Uses Angular signals for optimal performance
- ✅ **CRUD operations** - Create, Read, Update, Delete with loading states
- ✅ **Filtering & Search** - Flexible filtering with search capabilities
- ✅ **Pagination** - Built-in pagination support
- ✅ **Error handling** - Comprehensive error management
- ✅ **Optimistic updates** - Optional optimistic UI updates
- ✅ **Caching** - Optional response caching with TTL
- ✅ **Auto-refresh** - Configurable automatic data refresh
- ✅ **Navigation helpers** - Next/previous item selection
- ✅ **Loading states** - Separate loading states for different operations

## Base State Features

### Core Signals
```typescript
// Read-only signals
readonly items: Signal<T[]>
readonly currentItem: Signal<T | null>
readonly loading: Signal<LoadingStates>
readonly error: Signal<string | null>
readonly filter: Signal<F>
readonly pagination: Signal<Pagination>
readonly lastUpdated: Signal<Date | null>
readonly isDirty: Signal<boolean>
```

### Computed Signals
```typescript
readonly hasItems: Signal<boolean>
readonly isEmpty: Signal<boolean>
readonly isLoading: Signal<boolean>
readonly hasError: Signal<boolean>
readonly canLoadMore: Signal<boolean>
readonly selectedIndex: Signal<number>
```

### Helper Methods
```typescript
// Item management
setItems(items: T[]): void
addItems(items: T[]): void  // For pagination
addItem(item: T): void
updateItem(updatedItem: T): void
removeItem(itemToRemove: T): void

// Current item selection
setCurrentItem(item: T | null): void
setCurrentItemByIndex(index: number): void
selectNext(): void
selectPrevious(): void

// State management
setLoading(operation: keyof LoadingStates, isLoading: boolean): void
setError(error: string | null): void
clearError(): void

// Filter management
setFilter(filter: Partial<F>): void
resetFilter(): void

// Pagination management
setPagination(pagination: Partial<Pagination>): void
resetPagination(): void
nextPage(): void
previousPage(): void

// Utility
reset(): void
getSnapshot(): BaseState<T, F>
```

## Base Store Features

### CRUD Operations
```typescript
// Loading operations
loadItems(filter?: Partial<F>, pagination?: Partial<Pagination>): Observable<{items: T[], pagination: Pagination}>
loadMore(): Observable<{items: T[], pagination: Pagination}>
loadItem(id: string | number): Observable<T>

// Mutation operations
createItem(createDto: CreateDto): Observable<T>
updateItemById(id: string | number, updateDto: UpdateDto): Observable<T>
deleteItem(id: string | number): Observable<void>

// Utility operations
refresh(): Observable<{items: T[], pagination: Pagination}>
search(searchTerm: string): Observable<{items: T[], pagination: Pagination}>
sort(sortBy: string, sortDirection: 'asc' | 'desc'): Observable<{items: T[], pagination: Pagination}>
applyFilter(filter: Partial<F>): Observable<{items: T[], pagination: Pagination}>
clearFilter(): Observable<{items: T[], pagination: Pagination}>
```

### Configuration Options
```typescript
interface StoreConfig {
  enableAutoRefresh?: boolean;        // Default: false
  autoRefreshInterval?: number;       // Default: 30000ms
  enableOptimisticUpdates?: boolean;  // Default: true
  enableCaching?: boolean;            // Default: false
  cacheTimeout?: number;              // Default: 300000ms (5 min)
}
```

## Implementation Example

### 1. Define Your Models and DTOs

```typescript
// models/job.model.ts
export interface Job {
  id: string;
  title: string;
  company: Company;
  description: string;
  // ... other properties
}

// Define filter interface
export interface JobFilter extends BaseFilter {
  type?: 'full-time' | 'part-time' | 'contract';
  experienceLevel?: 'entry' | 'mid' | 'senior';
  location?: string;
  skills?: string[];
}

// Define DTOs
export interface CreateJobDto {
  title: string;
  companyId: string;
  description: string;
  // ... other properties
}

export interface UpdateJobDto {
  title?: string;
  description?: string;
  // ... other optional properties
}
```

### 2. Implement the Service Interface

```typescript
// services/job.service.ts
@Injectable({
  providedIn: 'root'
})
export class JobService implements CrudOperations<Job, CreateJobDto, UpdateJobDto, JobFilter> {
  
  constructor(private http: HttpClient) {}

  getAll(filter?: Partial<JobFilter>, pagination?: Partial<Pagination>): Observable<{ items: Job[]; pagination: Pagination }> {
    let params = new HttpParams();
    
    // Add filter parameters
    if (filter?.search) params = params.set('search', filter.search);
    if (filter?.type) params = params.set('type', filter.type);
    if (filter?.location) params = params.set('location', filter.location);
    
    // Add pagination parameters
    if (pagination?.page) params = params.set('page', pagination.page.toString());
    if (pagination?.limit) params = params.set('limit', pagination.limit.toString());

    return this.http.get<{ items: Job[]; pagination: Pagination }>('/api/jobs', { params });
  }

  getById(id: string): Observable<Job> {
    return this.http.get<Job>(\`/api/jobs/\${id}\`);
  }

  create(job: CreateJobDto): Observable<Job> {
    return this.http.post<Job>('/api/jobs', job);
  }

  update(id: string, job: UpdateJobDto): Observable<Job> {
    return this.http.put<Job>(\`/api/jobs/\${id}\`, job);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(\`/api/jobs/\${id}\`);
  }
}
```

### 3. Create Your Store

```typescript
// stores/job.store.ts
@Injectable({
  providedIn: 'root'
})
export class JobStore extends BaseStore<Job, CreateJobDto, UpdateJobDto, JobFilter> {
  
  constructor(private jobService: JobService) {
    super({
      enableOptimisticUpdates: true,
      enableCaching: true,
      cacheTimeout: 300000 // 5 minutes
    });
  }

  protected getService(): CrudOperations<Job, CreateJobDto, UpdateJobDto, JobFilter> {
    return this.jobService;
  }

  protected getItemId(job: Job): string {
    return job.id;
  }

  protected getDefaultFilter(): JobFilter {
    return {
      search: '',
      sortBy: 'createdAt',
      sortDirection: 'desc'
    };
  }

  protected compareItems(job1: Job, job2: Job): boolean {
    return job1.id === job2.id;
  }

  // Add custom computed signals
  readonly activeJobs = computed(() => 
    this.items().filter(job => job.isActive)
  );

  readonly fullTimeJobs = computed(() => 
    this.items().filter(job => job.type === 'full-time')
  );

  // Add custom methods
  searchJobsBySkills(skills: string[]): Observable<{ items: Job[]; pagination: Pagination }> {
    return this.applyFilter({ skills });
  }

  toggleJobStatus(jobId: string): Observable<Job> {
    const job = this.items().find(j => j.id === jobId);
    if (!job) throw new Error('Job not found');
    
    return this.updateItemById(jobId, { isActive: !job.isActive });
  }
}
```

### 4. Use in Components

```typescript
// components/job-list.component.ts
@Component({
  selector: 'app-job-list',
  template: \`
    <div class="job-list">
      <!-- Search -->
      <input 
        [value]="jobStore.filter().search || ''"
        (input)="onSearch($event)"
        placeholder="Search jobs..."
      />

      <!-- Loading indicator -->
      <div *ngIf="jobStore.isLoading()" class="loading">
        Loading jobs...
      </div>

      <!-- Error message -->
      <div *ngIf="jobStore.hasError()" class="error">
        {{ jobStore.error() }}
      </div>

      <!-- Job list -->
      <div *ngFor="let job of jobStore.items(); trackBy: trackByJobId" 
           class="job-card"
           [class.selected]="job === jobStore.currentItem()"
           (click)="jobStore.setCurrentItem(job)">
        <h3>{{ job.title }}</h3>
        <p>{{ job.company.name }}</p>
        <p>{{ job.location }}</p>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button 
          (click)="jobStore.previousPage()"
          [disabled]="jobStore.pagination().page === 1">
          Previous
        </button>
        
        <span>
          Page {{ jobStore.pagination().page }} of {{ jobStore.pagination().totalPages }}
        </span>
        
        <button 
          (click)="jobStore.nextPage()"
          [disabled]="!jobStore.canLoadMore()">
          Next
        </button>
      </div>

      <!-- Load more for infinite scroll -->
      <button 
        *ngIf="jobStore.canLoadMore()"
        (click)="jobStore.loadMore().subscribe()"
        [disabled]="jobStore.loading().list">
        Load More
      </button>
    </div>
  \`
})
export class JobListComponent implements OnInit {
  
  constructor(public jobStore: JobStore) {}

  ngOnInit() {
    // Load initial data
    this.jobStore.loadItems().subscribe();
  }

  onSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.jobStore.search(searchTerm).subscribe();
  }

  trackByJobId(index: number, job: Job): string {
    return job.id;
  }
}
```

## Advanced Usage

### Custom Computed Signals
```typescript
// In your store
readonly highSalaryJobs = computed(() => 
  this.items().filter(job => job.salaryRange.min > 100000)
);

readonly jobsByLocation = computed(() => {
  const jobs = this.items();
  return jobs.reduce((acc, job) => {
    if (!acc[job.location]) acc[job.location] = [];
    acc[job.location].push(job);
    return acc;
  }, {} as Record<string, Job[]>);
});
```

### Error Handling
```typescript
// In your component
ngOnInit() {
  this.jobStore.loadItems().subscribe({
    next: (response) => {
      console.log('Jobs loaded:', response.items.length);
    },
    error: (error) => {
      // Error is automatically set in store
      console.error('Failed to load jobs:', error);
    }
  });
}
```

### Optimistic Updates
When `enableOptimisticUpdates` is true, the UI updates immediately when calling `updateItemById` or `deleteItem`, then reverts if the API call fails.

### Auto-refresh
```typescript
// Enable auto-refresh
this.jobStore.enableAutoRefresh();

// Disable when component is destroyed
ngOnDestroy() {
  this.jobStore.disableAutoRefresh();
}
```

## Best Practices

1. **Always call abstract methods** - Implement all required abstract methods in your concrete store
2. **Use computed signals** - Create computed signals for derived data instead of manual calculations
3. **Handle errors gracefully** - The store automatically manages error states, but handle them in your components
4. **Leverage optimistic updates** - Enable for better UX, but test thoroughly
5. **Use proper TypeScript types** - Extend interfaces properly for type safety
6. **Track by functions** - Always use trackBy functions in *ngFor for performance
7. **Cleanup subscriptions** - Use async pipe or proper subscription management

## TypeScript Support

The base classes are fully typed and provide excellent IntelliSense support. Generic types ensure type safety throughout your application:

```typescript
// Fully typed store
class JobStore extends BaseStore<Job, CreateJobDto, UpdateJobDto, JobFilter>

// All methods are properly typed
loadItems(): Observable<{ items: Job[]; pagination: Pagination }>
createItem(job: CreateJobDto): Observable<Job>
updateItemById(id: string, job: UpdateJobDto): Observable<Job>
```
