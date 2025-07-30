# Jobs Endpoint Configuration Changes

## Summary

Updated the JobStore to use a local development endpoint with proper pagination parameter mapping.

## Changes Made

### 1. Updated Job Store Endpoint
**File:** `src/app/features/jobs/job.store.ts`

Changed from:
```typescript
super(http, 'https://jobsglobal.com/api/jobs', {
```

To:
```typescript
super(http, 'http://localhost:8000/jobs', {
```

### 2. Enhanced BaseStore with Configurable Pagination Parameters
**File:** `src/app/core/store/base-store.ts`

#### Added Configuration Option
```typescript
export interface StoreConfig {
  // ... existing config
  paginationParams?: {
    page?: string;
    limit?: string;
  };
}
```

#### Updated Default Configuration
```typescript
export const DEFAULT_STORE_CONFIG: StoreConfig = {
  // ... existing config
  paginationParams: {
    page: 'page',
    limit: 'per_page'  // Changed from 'limit' to 'per_page'
  }
};
```

#### Enhanced Parameter Building
```typescript
protected buildHttpParams(filter?: Partial<F>, pagination?: Partial<Pagination>): HttpParams {
  // ... filter parameters

  // Add pagination parameters with configurable names
  if (pagination) {
    const pageParam = this.config.paginationParams?.page || 'page';
    const limitParam = this.config.paginationParams?.limit || 'per_page';
    
    if (pagination.page) params = params.set(pageParam, pagination.page.toString());
    if (pagination.limit) params = params.set(limitParam, pagination.limit.toString());
  }

  return params;
}
```

## Expected API Calls

The JobStore will now make HTTP requests to your local development server:

### List Jobs (with pagination)
```http
GET http://localhost:8000/jobs/?page=1&per_page=10
```

### Get Single Job
```http
GET http://localhost:8000/jobs/{id}
```

### Create Job
```http
POST http://localhost:8000/jobs/
Content-Type: application/json

{
  "title": "Software Engineer",
  "company": "Tech Corp",
  // ... other job fields
}
```

### Update Job
```http
PUT http://localhost:8000/jobs/{id}
Content-Type: application/json

{
  "title": "Updated Title",
  // ... other updated fields
}
```

### Delete Job
```http
DELETE http://localhost:8000/jobs/{id}
```

## Expected Response Format

### List Response
```json
{
  "items": [
    {
      "id": "job-1",
      "title": "Software Engineer",
      "company": "Tech Corp",
      // ... other job fields
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Single Item Response
```json
{
  "id": "job-1",
  "title": "Software Engineer",
  "company": "Tech Corp",
  // ... other job fields
}
```

## Usage in Components

No changes needed in components. The JobStore will continue to work the same way:

```typescript
export class JobsComponent {
  jobStore = inject(JobStore);

  ngOnInit() {
    // This will now call http://localhost:8000/jobs/?page=1&per_page=10
    this.jobStore.loadItems().subscribe();
  }
}
```

## Flexibility

The pagination parameter names are now configurable. If you need different parameter names for different endpoints, you can override them in the store configuration:

```typescript
super(http, 'http://localhost:8000/jobs', {
  paginationParams: {
    page: 'pageNum',      // Custom page parameter name
    limit: 'pageSize'     // Custom limit parameter name
  }
});
```

This would generate URLs like: `http://localhost:8000/jobs/?pageNum=1&pageSize=10`
