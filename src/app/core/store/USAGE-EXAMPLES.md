# BaseStore Usage Examples

The `BaseStore` now includes built-in HTTP CRUD operations. Child stores need to provide the HTTP client, model type, and root endpoint.

## Basic Store Implementation

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseStore } from './base-store';
import { BaseFilter } from './base-state';

// Define your model
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

// Define your filter interface
export interface UserFilter extends BaseFilter {
  role?: string;
  isActive?: boolean;
}

// Create DTOs for create and update operations
export interface CreateUserDto {
  name: string;
  email: string;
  role: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserStore extends BaseStore<User, CreateUserDto, UpdateUserDto, UserFilter> {
  
  constructor() {
    const http = inject(HttpClient);
    // Pass HTTP client, base endpoint URL, and optional config
    super(http, '/api/users', {
      enableOptimisticUpdates: true,
      enableCaching: true,
      cacheTimeout: 300000, // 5 minutes
      enableAutoRefresh: false,
      autoRefreshInterval: 30000 // 30 seconds
    });
  }

  // Required: Define how to extract ID from an item
  protected getItemId(user: User): string {
    return user.id;
  }

  // Required: Define default filter
  protected getDefaultFilter(): UserFilter {
    return {
      search: '',
      sortBy: 'name',
      sortDirection: 'asc'
    };
  }

  // Required: Define how to compare items for equality
  protected compareItems(user1: User, user2: User): boolean {
    return user1.id === user2.id;
  }

  // Optional: The getService method is deprecated but kept for backward compatibility
  protected getService() {
    throw new Error('getService is deprecated - HTTP operations are handled internally');
  }
}
```

## HTTP Endpoints Expected

The BaseStore expects your backend to follow RESTful conventions:

- `GET /api/users` - Get all users with optional query parameters for filtering/pagination
- `GET /api/users/:id` - Get single user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update existing user
- `DELETE /api/users/:id` - Delete user

### Expected Response Formats

#### List Response
```typescript
{
  items: User[],
  pagination: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

#### Single Item Response
```typescript
User
```

## Usage in Components

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { UserStore } from './user.store';

@Component({
  selector: 'app-users',
  template: `
    <div>
      <!-- Loading state -->
      <div *ngIf="userStore.isLoading()">Loading...</div>
      
      <!-- Error state -->
      <div *ngIf="userStore.hasError()" class="error">
        {{ userStore.error() }}
      </div>
      
      <!-- User list -->
      <div *ngFor="let user of userStore.items()">
        <h3>{{ user.name }}</h3>
        <p>{{ user.email }}</p>
        <button (click)="selectUser(user)">Select</button>
        <button (click)="deleteUser(user.id)">Delete</button>
      </div>
      
      <!-- Pagination -->
      <div>
        <button 
          (click)="userStore.previousPage()" 
          [disabled]="userStore.pagination().page === 1">
          Previous
        </button>
        <span>Page {{ userStore.pagination().page }} of {{ userStore.pagination().totalPages }}</span>
        <button 
          (click)="userStore.nextPage()" 
          [disabled]="!userStore.canLoadMore()">
          Next
        </button>
      </div>
      
      <!-- Load more button -->
      <button 
        (click)="loadMore()" 
        [disabled]="!userStore.canLoadMore() || userStore.loading().list">
        Load More
      </button>
      
      <!-- Search -->
      <input 
        (input)="search($event)" 
        placeholder="Search users...">
      
      <!-- Filter by role -->
      <select (change)="filterByRole($event)">
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>
    </div>
  `
})
export class UsersComponent implements OnInit {
  userStore = inject(UserStore);

  ngOnInit() {
    // Load initial data
    this.userStore.loadItems().subscribe();
    
    // Optional: Enable auto-refresh
    this.userStore.enableAutoRefresh();
  }

  selectUser(user: User) {
    this.userStore.setCurrentItem(user);
  }

  deleteUser(id: string) {
    this.userStore.deleteItem(id).subscribe();
  }

  loadMore() {
    this.userStore.loadMore().subscribe();
  }

  search(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.userStore.search(searchTerm).subscribe();
  }

  filterByRole(event: Event) {
    const role = (event.target as HTMLSelectElement).value;
    this.userStore.applyFilter({ role: role || undefined }).subscribe();
  }

  createUser(userData: CreateUserDto) {
    this.userStore.createItem(userData).subscribe();
  }

  updateUser(id: string, userData: UpdateUserDto) {
    this.userStore.updateItemById(id, userData).subscribe();
  }
}
```

## Available Methods

### Data Loading
- `loadItems(filter?, pagination?)` - Load all items
- `loadMore()` - Load next page of items
- `loadItem(id)` - Load single item by ID
- `refresh()` - Refresh current data

### CRUD Operations
- `createItem(createDto)` - Create new item
- `updateItemById(id, updateDto)` - Update existing item
- `deleteItem(id)` - Delete item

### Filtering & Search
- `search(searchTerm)` - Search items
- `sort(field, direction)` - Sort items
- `applyFilter(filter)` - Apply custom filter
- `clearFilter()` - Clear all filters

### State Management
- `setCurrentItem(item)` - Set selected item
- `reset()` - Reset to initial state
- `enableAutoRefresh()` - Enable auto-refresh
- `disableAutoRefresh()` - Disable auto-refresh

### Computed Signals
- `items()` - All items
- `currentItem()` - Currently selected item
- `loading()` - Loading states
- `error()` - Error message
- `hasItems()` - Whether items exist
- `isEmpty()` - Whether list is empty
- `isLoading()` - Whether any operation is loading
- `hasError()` - Whether there's an error
- `canLoadMore()` - Whether more items can be loaded
- `pagination()` - Current pagination state
- `filter()` - Current filter state

## Advanced Configuration

```typescript
constructor() {
  const http = inject(HttpClient);
  super(http, '/api/users', {
    enableOptimisticUpdates: true,    // Show changes immediately before server confirms
    enableCaching: true,              // Cache responses
    cacheTimeout: 300000,             // Cache timeout in milliseconds
    enableAutoRefresh: true,          // Auto-refresh data
    autoRefreshInterval: 30000        // Auto-refresh interval in milliseconds
  });
}
```

## Migration from Service-based Store

If you have an existing store using the service pattern:

### Before (Service-based)
```typescript
constructor() {
  super(config);
}

protected getService(): CrudOperations<T> {
  return this.myService;
}
```

### After (HTTP-based)
```typescript
constructor() {
  const http = inject(HttpClient);
  super(http, '/api/my-endpoint', config);
}

protected getService(): CrudOperations<T> {
  // This method is now deprecated but kept for backward compatibility
  throw new Error('getService is deprecated - HTTP operations are handled internally');
}
```
