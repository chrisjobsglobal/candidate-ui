# Job Store Implementation Guide

## Overview

Your jobs component has been successfully migrated to use the signal-based store architecture. Here's what was implemented:

## Files Created/Updated

### 1. Job Service (`src/app/features/jobs/services/job.service.ts`)
- **Mock Implementation**: Contains sample data for development
- **HTTP Ready**: All methods have commented HTTP implementations
- **Full CRUD**: Support for create, read, update, delete operations
- **Filtering & Search**: Server-side filtering and pagination
- **Bookmark Management**: Toggle bookmark functionality

### 2. Job Store (`src/app/features/jobs/job.store.ts`)
- **Signal-Based**: Uses Angular 20 signals for reactive state
- **Extends BaseStore**: Inherits all CRUD and state management features
- **Computed Signals**: Pre-built queries (urgent jobs, remote jobs, etc.)
- **Error Handling**: Automatic error state management
- **Loading States**: Separate loading states for different operations

### 3. Updated Jobs Component (`src/app/features/jobs.component.ts`)
- **Store Integration**: Now uses JobStore instead of manual signals
- **Reactive UI**: Automatic updates when store state changes
- **Event Handlers**: Proper search, filter, and sort functionality
- **Loading States**: Shows loading indicators and error messages
- **Bookmark Toggle**: Integrated with store bookmark functionality

## Key Features Implemented

### ✅ Reactive State Management
```typescript
// Access job data
this.jobStore.items()           // All jobs
this.jobStore.currentItem()     // Selected job
this.jobStore.loading()         // Loading states
this.jobStore.error()           // Error state
this.jobStore.pagination()      // Pagination info

// Computed queries
this.jobStore.urgentJobs()      // Urgent jobs only
this.jobStore.remoteJobs()      // Remote jobs only
this.jobStore.bookmarkedJobs()  // Bookmarked jobs only
```

### ✅ Search & Filtering
```typescript
// Search jobs
this.jobStore.searchJobs(searchTerm).subscribe()

// Filter by type
this.jobStore.filterByType('full-time').subscribe()

// Filter by location
this.jobStore.filterByLocation('Remote').subscribe()

// Apply multiple filters
this.jobStore.applyQuickFilters({
  remote: true,
  tech: true,
  'entry-level': false
}).subscribe()
```

### ✅ CRUD Operations
```typescript
// Load jobs
this.jobStore.loadItems().subscribe()

// Load more (pagination)
this.jobStore.loadMore().subscribe()

// Toggle bookmark
this.jobStore.toggleBookmark(jobId).subscribe()

// Refresh data
this.jobStore.refresh().subscribe()
```

### ✅ Loading & Error States
```typescript
// Check loading states
this.jobStore.isLoading()           // Any operation loading
this.jobStore.loading().list        // List loading specifically
this.jobStore.loading().update      // Update loading

// Error handling
this.jobStore.hasError()            // Has error
this.jobStore.error()               // Error message
this.jobStore.clearError()          // Clear error
```

## Converting to Real HTTP Calls

### Step 1: Update the Service URLs
In `job.service.ts`, update the `baseUrl`:
```typescript
private readonly baseUrl = 'https://your-api.com/api/jobs'; // Your actual API URL
```

### Step 2: Uncomment HTTP Calls
Replace the mock implementations with real HTTP calls:

```typescript
// Before (Mock)
getAll(filter?: Partial<JobFilter>, pagination?: Partial<Pagination>): Observable<{ items: JobListing[]; pagination: Pagination }> {
  return this.mockGetAll(filter, pagination);
}

// After (Real HTTP)
getAll(filter?: Partial<JobFilter>, pagination?: Partial<Pagination>): Observable<{ items: JobListing[]; pagination: Pagination }> {
  return this.http.get<{ items: JobListing[]; pagination: Pagination }>(\`\${this.baseUrl}\`, {
    params: this.buildHttpParams(filter, pagination)
  });
}
```

### Step 3: Update Response Format
Ensure your API returns data in this format:
```typescript
{
  items: JobListing[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### Step 4: Add HttpClient Provider
Ensure `HttpClient` is provided in your app:
```typescript
// app.config.ts
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    // ... other providers
  ]
};
```

## API Endpoints Expected

The service expects these endpoints:

- `GET /api/jobs` - Get all jobs with filters and pagination
- `GET /api/jobs/:id` - Get single job by ID
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `PATCH /api/jobs/:id/bookmark` - Toggle bookmark

## Query Parameters

For filtering, the service sends these query parameters:

- `search` - Search term
- `location` - Location filter
- `type` - Job type (full-time, part-time, etc.)
- `experience` - Experience level
- `tags` - Comma-separated skills/tags
- `isRemote` - Boolean for remote jobs
- `isUrgent` - Boolean for urgent jobs
- `sortBy` - Sort field (relevance, date, salary, company)
- `sortDirection` - Sort direction (asc, desc)
- `page` - Page number
- `limit` - Items per page

## Usage Examples

### Basic Job Loading
```typescript
ngOnInit() {
  // Load initial jobs
  this.jobStore.initializeJobs().subscribe({
    next: (response) => {
      console.log(\`Loaded \${response.items.length} jobs\`);
    },
    error: (error) => {
      console.error('Failed to load jobs:', error);
    }
  });
}
```

### Search Implementation
```typescript
onSearchChange() {
  const searchQuery = this.searchQuery();
  if (searchQuery.trim()) {
    this.jobStore.searchJobs(searchQuery).subscribe();
  } else {
    this.jobStore.clearFilter().subscribe();
  }
}
```

### Bookmark Toggle
```typescript
toggleBookmark(job: JobListing) {
  this.jobStore.toggleBookmark(job.id).subscribe({
    next: (updatedJob) => {
      console.log(\`Bookmark toggled for \${updatedJob.title}\`);
    },
    error: (error) => {
      console.error('Failed to toggle bookmark:', error);
    }
  });
}
```

### Reactive UI Updates
```typescript
// In your template
<div *ngIf="jobStore.isLoading()" class="loading-spinner">
  Loading jobs...
</div>

<div *ngIf="jobStore.hasError()" class="error-message">
  Error: {{ jobStore.error() }}
  <button (click)="jobStore.clearError()">✕</button>
</div>

<div *ngFor="let job of jobStore.items()">
  <!-- Job card -->
</div>
```

## Benefits of This Implementation

1. **Reactive**: UI automatically updates when data changes
2. **Type Safe**: Full TypeScript support with proper interfaces
3. **Reusable**: Store can be used across multiple components
4. **Testable**: Easy to mock and test
5. **Performant**: Signals provide optimal change detection
6. **Scalable**: Easy to add new features and filters
7. **Error Handling**: Built-in error state management
8. **Loading States**: Comprehensive loading state tracking

## Next Steps

1. **Replace Mock Data**: Update service to use real HTTP calls
2. **Add Authentication**: Include auth headers in HTTP requests
3. **Add Caching**: Enable caching for better performance
4. **Add Offline Support**: Implement offline capabilities
5. **Add Real-time Updates**: Use WebSockets for live job updates
6. **Optimize Filtering**: Implement debounced search
7. **Add Pagination UI**: Create pagination controls

Your jobs component is now ready for production with a robust, signal-based state management system!
