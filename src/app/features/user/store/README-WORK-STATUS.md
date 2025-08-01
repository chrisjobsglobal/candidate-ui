# User Work Status Store

This store manages the user's work status data from the `/users/me/work-status` API endpoint.

## Features

- Get current user's work status
- Update work status with optimistic updates
- Automatic data staleness detection
- Computed selectors for easy UI binding
- Loading states and error handling
- Derived work status summary

## Usage Examples

### Basic Usage in Component

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { UserWorkStatusStore } from './store/user-work-status.store';

@Component({
  selector: 'app-work-status',
  template: `
    <div class="work-status">
      @if (workStatusStore.isLoading()) {
        <div>Loading work status...</div>
      }
      
      @if (workStatusStore.error()) {
        <div class="error">{{ workStatusStore.error() }}</div>
      }
      
      @if (workStatusStore.workStatus(); as status) {
        <div class="status-display">
          <h3>Work Status</h3>
          <p><strong>Hiring:</strong> {{ status.is_hiring ? 'Yes' : 'No' }}</p>
          <p><strong>Open to Work:</strong> {{ status.is_open_to_work ? 'Yes' : 'No' }}</p>
          <p><strong>Job Title:</strong> {{ status.job_title }}</p>
          <p><strong>Company:</strong> {{ status.company }}</p>
          <p><strong>Message:</strong> {{ status.work_status_message }}</p>
        </div>
      }
    </div>
  `
})
export class WorkStatusComponent implements OnInit {
  protected readonly workStatusStore = inject(UserWorkStatusStore);

  ngOnInit() {
    // Load work status on component init
    this.workStatusStore.getWorkStatus().subscribe();
  }

  updateStatus() {
    this.workStatusStore.updateWorkStatus({
      is_hiring: true,
      company: 'My Company',
      work_status_message: 'Looking for talented developers!'
    }).subscribe();
  }
}
```

### Using Computed Selectors

```typescript
export class ProfileComponent {
  private readonly workStatusStore = inject(UserWorkStatusStore);

  // Use computed selectors for reactive UI
  readonly isHiring = this.workStatusStore.isHiring;
  readonly isOpenToWork = this.workStatusStore.isOpenToWork;
  readonly workStatusSummary = this.workStatusStore.workStatusSummary;

  template = `
    <div class="profile-status">
      @if (isHiring()) {
        <span class="badge hiring">🏢 Hiring</span>
      }
      @if (isOpenToWork()) {
        <span class="badge open-to-work">🔍 Open to Work</span>
      }
      
      @if (workStatusSummary(); as summary) {
        <p>{{ summary.displayText }}</p>
        @if (summary.message) {
          <p class="status-message">{{ summary.message }}</p>
        }
      }
    </div>
  `;
}
```

### Form Integration with Optimistic Updates

```typescript
export class EditWorkStatusComponent {
  private readonly workStatusStore = inject(UserWorkStatusStore);
  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    is_hiring: [false],
    is_open_to_work: [false],
    job_title: [''],
    company: [''],
    work_status_message: ['']
  });

  ngOnInit() {
    // Load current status and populate form
    this.workStatusStore.getWorkStatus().subscribe(status => {
      this.form.patchValue(status);
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const formData = this.form.value;
      
      // Optimistically update UI immediately
      this.workStatusStore.updateWorkStatusOptimistic(formData);
      
      // Then make API call
      this.workStatusStore.updateWorkStatus(formData).subscribe({
        next: () => {
          console.log('Work status updated successfully');
        },
        error: (error) => {
          // Revert optimistic update on error
          this.workStatusStore.refresh().subscribe();
        }
      });
    }
  }
}
```

### Auto-refresh with Stale Data Detection

```typescript
export class DashboardComponent implements OnInit {
  private readonly workStatusStore = inject(UserWorkStatusStore);

  ngOnInit() {
    // Get work status with automatic refresh if stale
    this.workStatusStore.getWorkStatusWithRefresh().subscribe();
  }

  manualRefresh() {
    this.workStatusStore.refresh().subscribe();
  }
}
```

## API Interface

### WorkStatusResponse
```typescript
interface WorkStatusResponse {
  is_hiring: boolean;
  is_open_to_work: boolean;
  job_title: string;
  company: string;
  work_status_message: string;
}
```

### UpdateWorkStatusDto
```typescript
interface UpdateWorkStatusDto {
  is_hiring?: boolean;
  is_open_to_work?: boolean;
  job_title?: string;
  company?: string;
  work_status_message?: string;
}
```

## Store Methods

### Main Operations
- `getWorkStatus()` - Fetch current work status
- `updateWorkStatus(data)` - Update work status
- `updateWorkStatusOptimistic(data)` - Local optimistic update
- `refresh()` - Force refresh data
- `getWorkStatusWithRefresh()` - Get with auto-refresh if stale
- `clearWorkStatus()` - Clear stored data

### State Selectors
- `workStatus()` - Current work status data
- `loading()` - Loading states
- `error()` - Current error message
- `isLoading()` - General loading state
- `hasData()` - Whether data exists
- `isHiring()` - Hiring status
- `isOpenToWork()` - Open to work status
- `jobTitle()` - Current job title
- `company()` - Current company
- `workStatusMessage()` - Status message
- `workStatusSummary()` - Computed summary object

## Error Handling

The store automatically handles errors and provides error messages through the `error()` signal. Common error scenarios:

- Network failures
- Authentication errors (401)
- Validation errors (422)
- Server errors (500)

```typescript
// Handle errors in component
ngOnInit() {
  this.workStatusStore.getWorkStatus().subscribe({
    error: (error) => {
      console.error('Failed to load work status:', error);
      // Error is also available via workStatusStore.error() signal
    }
  });
}
```

## Best Practices

1. **Load data on component init** for components that display work status
2. **Use computed selectors** for reactive UI updates
3. **Implement optimistic updates** for better UX
4. **Handle errors gracefully** with fallback UI states
5. **Use auto-refresh** for components that may have stale data
6. **Clear data on logout** to prevent data leaks
