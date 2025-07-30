import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { computed } from '@angular/core';
import { BaseStore } from './base-store';
import { BaseFilter } from './base-state';

/**
 * Example user model
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User-specific filter interface
 */
export interface UserFilter extends BaseFilter {
  role?: 'admin' | 'user' | 'manager';
  isActive?: boolean;
}

/**
 * DTO for creating a new user
 */
export interface CreateUserDto {
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
}

/**
 * DTO for updating an existing user
 */
export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: 'admin' | 'user' | 'manager';
  isActive?: boolean;
}

/**
 * Example user store implementation demonstrating the new BaseStore pattern
 */
@Injectable({
  providedIn: 'root'
})
export class ExampleUserStore extends BaseStore<User, CreateUserDto, UpdateUserDto, UserFilter> {
  
  constructor() {
    // Inject HttpClient and pass it to the parent constructor along with base URL
    const http = inject(HttpClient);
    super(http, '/api/users', {
      enableOptimisticUpdates: true,
      enableCaching: true,
      cacheTimeout: 300000, // 5 minutes
      enableAutoRefresh: false,
      autoRefreshInterval: 30000 // 30 seconds
    });
  }

  /**
   * Required: Extract ID from user object
   */
  protected getItemId(user: User): string {
    return user.id;
  }

  /**
   * Required: Define default filter values
   */
  protected getDefaultFilter(): UserFilter {
    return {
      search: '',
      sortBy: 'name',
      sortDirection: 'asc'
    };
  }

  /**
   * Required: Compare two users for equality
   */
  protected compareItems(user1: User, user2: User): boolean {
    return user1.id === user2.id;
  }

  /**
   * Deprecated: This method is no longer used as HTTP operations are handled internally
   */
  protected getService(): any {
    throw new Error('getService is deprecated - HTTP operations are handled internally');
  }

  // Computed signals for specific user queries
  readonly activeUsers = computed(() => 
    this.items().filter(user => user.isActive)
  );

  readonly adminUsers = computed(() => 
    this.items().filter(user => user.role === 'admin')
  );

  readonly managerUsers = computed(() => 
    this.items().filter(user => user.role === 'manager')
  );

  readonly regularUsers = computed(() => 
    this.items().filter(user => user.role === 'user')
  );

  readonly usersByRole = computed(() => {
    const users = this.items();
    return users.reduce((acc, user) => {
      if (!acc[user.role]) acc[user.role] = [];
      acc[user.role].push(user);
      return acc;
    }, {} as Record<string, User[]>);
  });

  /**
   * Custom method: Filter users by role
   */
  filterByRole(role: 'admin' | 'user' | 'manager' | 'all') {
    if (role === 'all') {
      return this.clearFilter();
    }
    return this.applyFilter({ role });
  }

  /**
   * Custom method: Filter by active status
   */
  filterByActiveStatus(isActive: boolean) {
    return this.applyFilter({ isActive });
  }

  /**
   * Custom method: Activate a user
   */
  activateUser(id: string) {
    return this.updateItemById(id, { isActive: true });
  }

  /**
   * Custom method: Deactivate a user
   */
  deactivateUser(id: string) {
    return this.updateItemById(id, { isActive: false });
  }
}
