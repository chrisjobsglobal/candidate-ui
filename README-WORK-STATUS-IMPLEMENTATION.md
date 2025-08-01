# Work Status Implementation Guide

This guide explains the newly implemented work status feature for the candidate UI application.

## Overview

The work status feature allows users to:
- Set their availability status (hiring/open to work)
- Add job title and company information
- Write a custom status message
- View and update their work status through a dedicated form

## Components Created

### 1. UserWorkStatusStore
**Location**: `src/app/features/user/store/user-work-status.store.ts`

A signal-based store that manages work status data with:
- GET `/users/me/work-status` - Fetch current work status
- PUT `/users/me/work-status` - Update work status
- Optimistic updates
- Loading states and error handling
- Data staleness detection

### 2. EditProfileWorkStatusComponent
**Location**: `src/app/features/user/profile/edit-profile-work-status.component.ts`

A comprehensive form component for editing work status with:
- Toggle switches for hiring/open to work status
- Job title and company input fields
- Status message textarea
- Real-time preview of current status
- Form validation and submission handling

### 3. TestWorkStatusComponent (Demo)
**Location**: `src/app/test-work-status.component.ts`

A test component for demonstration purposes that shows:
- Store state visualization
- Loading/error states
- All computed selectors
- Action buttons for testing store methods

## Routes Added

```typescript
// Work status form
/app/profile/work-status

// Test/demo page
/app/test-work-status
```

## API Integration

### Endpoint
```
PUT /users/me/work-status
```

### Request Body
```json
{
  "is_hiring": true,
  "is_open_to_work": true,
  "job_title": "Senior Software Engineer",
  "company": "Tech Company Inc.",
  "work_status_message": "Looking for talented developers to join our team!"
}
```

### Response
```json
{
  "is_hiring": true,
  "is_open_to_work": true,
  "job_title": "Senior Software Engineer", 
  "company": "Tech Company Inc.",
  "work_status_message": "Looking for talented developers to join our team!"
}
```

## How to Test

### 1. Access the Demo Page
Navigate to `/app/test-work-status` to see:
- Current store state
- All computed properties
- Loading/error states
- Action buttons to test functionality

### 2. Use the Form
Navigate to `/app/profile/work-status` to:
- Edit work status settings
- See real-time preview
- Submit changes

### 3. Integration Points

#### In Profile Component
You can add a link to the work status form:

```typescript
// In profile.component.ts
onEditWorkStatus(): void {
  this.router.navigate(['/app/profile/work-status']);
}
```

#### Display Work Status
Use the store in any component to display work status:

```typescript
export class SomeComponent {
  private readonly workStatusStore = inject(UserWorkStatusStore);
  
  ngOnInit() {
    this.workStatusStore.getWorkStatus().subscribe();
  }
}
```

```html
@if (workStatusStore.isHiring()) {
  <span class="badge hiring">🏢 Hiring</span>
}
@if (workStatusStore.isOpenToWork()) {
  <span class="badge">🔍 Open to Work</span>
}
```

## Store Usage Examples

### Load Work Status
```typescript
// Basic load
this.workStatusStore.getWorkStatus().subscribe();

// Load with auto-refresh if stale
this.workStatusStore.getWorkStatusWithRefresh().subscribe();
```

### Update Work Status
```typescript
// Update with API call
this.workStatusStore.updateWorkStatus({
  is_hiring: true,
  company: 'New Company'
}).subscribe();

// Optimistic update (immediate UI update)
this.workStatusStore.updateWorkStatusOptimistic({
  is_hiring: true
});
```

### Access State
```typescript
// Get all data
const workStatus = this.workStatusStore.workStatus();

// Get individual properties
const isHiring = this.workStatusStore.isHiring();
const company = this.workStatusStore.company();

// Get computed summary
const summary = this.workStatusStore.workStatusSummary();
```

## Form Component Features

### Real-time Preview
Shows current status with badges and formatted display text

### Validation
- Job title: max 100 characters
- Company: max 100 characters  
- Status message: max 500 characters

### Loading States
- Loading indicator during API calls
- Disabled form during submission
- Success/error message display

### Optimistic Updates
Form immediately updates the UI, then syncs with the server

## Error Handling

The store handles various error scenarios:
- Network failures
- Authentication errors (401)
- Validation errors (422)
- Server errors (500)

Errors are displayed in the UI with retry options.

## Next Steps

### Integration Ideas
1. **Profile Header**: Add work status badges to profile display
2. **Dashboard**: Show work status in user dashboard
3. **Search/Discovery**: Filter users by work status
4. **Notifications**: Alert users about status changes

### Profile Header Integration
```typescript
// In profile-header.component.ts
private readonly workStatusStore = inject(UserWorkStatusStore);

ngOnInit() {
  this.workStatusStore.getWorkStatus().subscribe();
}
```

```html
<!-- In profile header template -->
<div class="work-status-badges">
  @if (workStatusStore.isHiring()) {
    <span class="badge hiring">Hiring</span>
  }
  @if (workStatusStore.isOpenToWork()) {
    <span class="badge open-to-work">Open to Work</span>
  }
</div>
```

## Styling

The components use the same design system as the existing profile forms:
- Tailwind CSS classes
- Consistent spacing and colors
- Lucide icons
- Responsive grid layouts
- Form validation styling

All styling matches the existing `EditProfileComponent` patterns for consistency.
