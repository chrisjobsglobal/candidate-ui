import { Injectable, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, throwError } from 'rxjs';
import { BaseStore, CrudOperations } from '../../../core/store/base-store';
import { BaseFilter } from '../../../core/store/base-state';
import { User, JobSeekerProfile, Experience, Education, Certification, Language } from '../../../core/models/user.model';
import { ConfigService } from '../../../core/services/config.service';

/**
 * User profile response from FastAPI /users/me endpoint
 */
export interface UserProfileResponse {
  username: string;
  email: string;
  id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  last_login: string | null;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  cover_photo: string | null;
  profile_tag: string | null;
  bio: string;
  is_verified: boolean;
  mobile: string | null;
  address: string | null;
  country: string | null;
}

/**
 * User profile update DTO
 */
export interface UpdateUserProfileDto {
  first_name?: string;
  last_name?: string;
  bio?: string;
  mobile?: string;
  address?: string;
  country?: string;
  avatar_url?: string;
  cover_photo?: string;
  profile_tag?: string;
}

/**
 * User filter for searching users
 */
export interface UserFilter extends BaseFilter {
  role?: 'jobseeker' | 'recruiter' | 'admin';
  isActive?: boolean;
  email?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Create user DTO
 */
export interface CreateUserDto {
  email: string;
  first_name: string;
  last_name: string;
  role?: 'jobseeker' | 'recruiter' | 'admin';
  bio?: string;
  mobile?: string;
  address?: string;
  country?: string;
}

/**
 * User store for managing user data and operations
 * Extends BaseStore to provide CRUD operations
 */
@Injectable({
  providedIn: 'root'
})
export class UserStore extends BaseStore<User, CreateUserDto, UpdateUserProfileDto, UserFilter> {
  private readonly configService = inject(ConfigService);
  private readonly authBaseUrl = this.configService.getApiBaseUrl() + '/auth';
  private readonly usersBaseUrl = this.configService.getApiBaseUrl() + '/users';

  // Current user signals (for the authenticated user)
  readonly currentUser = computed(() => {
    const items = this.items();
    const currentUserId = this.getCurrentUserId();
    return currentUserId ? items.find(user => user.id === currentUserId) || null : null;
  });

  readonly isCurrentUserLoaded = computed(() => !!this.currentUser());

  constructor() {
    const http = inject(HttpClient);
    const configService = inject(ConfigService);
    super(http, configService.getApiBaseUrl() + '/users', {
      enableCaching: true,
      cacheTimeout: 300000, // 5 minutes
      enableOptimisticUpdates: true
    });
    
    // Initialize current user from localStorage after a brief delay
    // This ensures the store is fully initialized first
    setTimeout(() => {
      this.initializeCurrentUserFromStorage();
    }, 0);
  }

  protected getService(): CrudOperations<User, CreateUserDto, UpdateUserProfileDto, UserFilter> {
    // This is deprecated but required by base class
    // HTTP operations are handled directly in BaseStore
    throw new Error('Service method deprecated - use HTTP operations directly');
  }

  protected getItemId(item: User): string {
    return item.id;
  }

  protected getDefaultFilter(): UserFilter {
    return {
      search: '',
      sortBy: 'firstName',
      sortDirection: 'asc'
    };
  }

  protected compareItems(item1: User, item2: User): boolean {
    return item1.id === item2.id;
  }

  /**
   * Helper method to add or update user in store
   */
  private addOrUpdateUserInStore(user: User): void {
    try {
      console.log('Adding/updating user in store:', user);
      const items = this.items();
      const existingIndex = items.findIndex(item => item.id === user.id);
      
      if (existingIndex >= 0) {
        console.log('Updating existing user at index:', existingIndex);
        this.updateItem(user);
      } else {
        console.log('Adding new user to store');
        this.addItem(user);
      }
      console.log('Current items in store after update:', this.items());
    } catch (error) {
      console.warn('Failed to add or update user in store:', error);
    }
  }

  /**
   * Get current user ID from auth store or localStorage
   */
  private getCurrentUserId(): string | null {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return user.id;
      }
    } catch (error) {
      console.warn('Failed to get current user ID:', error);
    }
    return null;
  }

  /**
   * Map API user response to User model
   */
  private mapApiUserToUser(apiUser: UserProfileResponse): User {
    console.log('Mapping API user to User model:', apiUser);
    const mappedUser = {
      id: apiUser.id,
      email: apiUser.email,
      firstName: apiUser.first_name,
      lastName: apiUser.last_name,
      profilePicture: apiUser.avatar_url ? this.configService.getUploadUrl(apiUser.avatar_url) : undefined,
      coverPhoto: apiUser.cover_photo ? this.configService.getUploadUrl(apiUser.cover_photo) : undefined,
      profileTag: apiUser.profile_tag || undefined,
      role: this.mapUserRole(apiUser),
      isOnline: apiUser.is_active,
      lastSeen: apiUser.last_login ? new Date(apiUser.last_login) : new Date(),
      createdAt: new Date(apiUser.created_at),
      updatedAt: apiUser.updated_at ? new Date(apiUser.updated_at) : new Date()
    };
    console.log('Mapped user:', mappedUser);
    console.log('Profile picture URL:', mappedUser.profilePicture);
    console.log('Cover photo URL:', mappedUser.coverPhoto);
    console.log('Profile tag:', mappedUser.profileTag);
    return mappedUser;
  }

  /**
   * Map API role to our User model role
   */
  private mapUserRole(apiUser: UserProfileResponse): 'jobseeker' | 'recruiter' | 'admin' {
    // TODO: Determine role mapping based on your API response
    // For now, default to jobseeker, but you can add logic here
    // based on user properties, user type fields, or other indicators
    
    // Example logic (adjust based on your API):
    // if (apiUser.user_type === 'recruiter') return 'recruiter';
    // if (apiUser.is_admin) return 'admin';
    
    return 'jobseeker'; // Default role
  }

  /**
   * Fetch current user profile from API
   */
  fetchCurrentUserProfile(): Observable<User> {
    this.setLoading('detail', true);
    this.clearError();

    const authToken = this.getAuthToken();
    if (!authToken) {
      const error = new Error('No authentication token available');
      this.setError(error.message);
      this.setLoading('detail', false);
      return throwError(() => error);
    }

    const headers = { 'Authorization': authToken };

    return this.http.get<UserProfileResponse>(`${this.usersBaseUrl}/me`, { headers }).pipe(
      map((apiUser: UserProfileResponse) => this.mapApiUserToUser(apiUser)),
      tap((user: User) => {
        // Update the user in our store
        this.addOrUpdateUserInStore(user);
        
        // Update localStorage with user data
        try {
          localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          console.warn('Failed to save user to storage:', error);
        }
      }),
      catchError((error) => {
        console.error('Failed to fetch current user profile:', error);
        this.setError('Failed to fetch user profile');
        return throwError(() => error);
      }),
      tap(() => this.setLoading('detail', false))
    );
  }

  /**
   * Update current user profile
   */
  updateCurrentUserProfile(updateData: UpdateUserProfileDto): Observable<User> {
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      const error = new Error('No current user ID available');
      this.setError(error.message);
      return throwError(() => error);
    }

    return this.updateUser(currentUserId, updateData);
  }

  /**
   * Update user profile (can be used for any user if admin)
   */
  updateUser(userId: string, updateData: UpdateUserProfileDto): Observable<User> {
    this.setLoading('update', true);
    this.clearError();

    const authToken = this.getAuthToken();
    if (!authToken) {
      const error = new Error('No authentication token available');
      this.setError(error.message);
      this.setLoading('update', false);
      return throwError(() => error);
    }

    const headers = { 'Authorization': authToken };

    return this.http.put<UserProfileResponse>(`${this.usersBaseUrl}/me`, updateData, { headers }).pipe(
      map((apiUser: UserProfileResponse) => this.mapApiUserToUser(apiUser)),
      tap((user: User) => {
        // Update the user in our store
        this.addOrUpdateUserInStore(user);
        
        // Update localStorage if this is the current user
        const currentUserId = this.getCurrentUserId();
        if (currentUserId === user.id) {
          try {
            localStorage.setItem('user', JSON.stringify(user));
          } catch (error) {
            console.warn('Failed to save user to storage:', error);
          }
        }
      }),
      catchError((error) => {
        console.error('Failed to update user profile:', error);
        this.setError('Failed to update user profile');
        return throwError(() => error);
      }),
      tap(() => this.setLoading('update', false))
    );
  }

  /**
   * Load user by ID
   */
  loadUser(userId: string): Observable<User> {
    return this.loadItem(userId);
  }

  /**
   * Search users with filters
   */
  searchUsers(filter?: Partial<UserFilter>): Observable<{ items: User[]; pagination: any }> {
    return this.loadItems(filter);
  }

  /**
   * Get authentication token from localStorage or auth store
   */
  private getAuthToken(): string | null {
    try {
      const storedToken = localStorage.getItem('access_token');
      const storedTokenType = localStorage.getItem('token_type');
      
      if (storedToken && storedTokenType) {
        return `${storedTokenType} ${storedToken}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
    return null;
  }

  /**
   * Set current user data (called from auth store after login)
   */
  setCurrentUser(user: User): void {
    this.addOrUpdateUserInStore(user);
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.warn('Failed to save user to storage:', error);
    }
  }

  /**
   * Clear current user data (called on logout)
   */
  clearCurrentUser(): void {
    const currentUserId = this.getCurrentUserId();
    if (currentUserId) {
      const items = this.items();
      const userToRemove = items.find(user => user.id === currentUserId);
      if (userToRemove) {
        this.removeItem(userToRemove);
      }
    }
    try {
      localStorage.removeItem('user');
    } catch (error) {
      console.warn('Failed to clear user from storage:', error);
    }
  }

  /**
   * Initialize current user from storage
   */
  initializeCurrentUserFromStorage(): void {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        // Validate the user object has required properties
        if (user && user.id && user.firstName && user.lastName) {
          this.addOrUpdateUserInStore(user);
        } else {
          console.warn('Invalid user data in localStorage, clearing it');
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.warn('Failed to initialize user from storage:', error);
      // Clear corrupted data
      try {
        localStorage.removeItem('user');
      } catch (clearError) {
        console.warn('Failed to clear corrupted user data:', clearError);
      }
    }
  }

  // Additional user-specific methods can be added here
  // For example: profile management, connections, etc.

  /**
   * Upload user avatar file
   */
  uploadUserAvatar(file: File): Observable<{ success: boolean; message: string; avatar_url: string }> {
    this.setLoading('update', true);
    this.clearError();

    const authToken = this.getAuthToken();
    if (!authToken) {
      const error = new Error('No authentication token available');
      this.setError(error.message);
      this.setLoading('update', false);
      return throwError(() => error);
    }

    const formData = new FormData();
    formData.append('file', file);

    const headers = { 'Authorization': authToken };

    return this.http.post<{ success: boolean; message: string; avatar_url: string }>(`${this.usersBaseUrl}/me/avatar`, formData, { headers }).pipe(
      tap((response) => {
        if (response.success) {
          // Directly update the user in the store with new avatar URL
          const currentUser = this.currentUser();
          if (currentUser) {
            const correctedAvatarUrl = this.configService.getUploadUrl(response.avatar_url);
            const updatedUser = { ...currentUser, profilePicture: correctedAvatarUrl };
            this.addOrUpdateUserInStore(updatedUser);
            
            // Also update localStorage
            try {
              localStorage.setItem('user', JSON.stringify(updatedUser));
            } catch (error) {
              console.warn('Failed to save updated user to storage:', error);
            }
          }
        }
      }),
      catchError((error) => {
        console.error('Failed to upload avatar:', error);
        this.setError('Failed to upload avatar');
        return throwError(() => error);
      }),
      tap(() => this.setLoading('update', false))
    );
  }

  /**
   * Update user avatar URL (for direct URL updates)
   */
  updateUserAvatar(avatarUrl: string): Observable<User> {
    return this.updateCurrentUserProfile({ avatar_url: avatarUrl });
  }

  /**
   * Upload user cover photo file
   */
  uploadUserCoverPhoto(file: File): Observable<{ success: boolean; message: string; cover_photo_url: string }> {
    this.setLoading('update', true);
    this.clearError();

    const authToken = this.getAuthToken();
    if (!authToken) {
      const error = new Error('No authentication token available');
      this.setError(error.message);
      this.setLoading('update', false);
      return throwError(() => error);
    }

    const formData = new FormData();
    formData.append('file', file);

    const headers = { 'Authorization': authToken };

    return this.http.post<{ success: boolean; message: string; cover_photo_url: string }>(`${this.usersBaseUrl}/me/cover-photo`, formData, { headers }).pipe(
      tap((response) => {
        if (response.success) {
          // Directly update the user in the store with new cover photo URL
          const currentUser = this.currentUser();
          if (currentUser) {
            const correctedCoverPhotoUrl = this.configService.getUploadUrl(response.cover_photo_url);
            const updatedUser = { ...currentUser, coverPhoto: correctedCoverPhotoUrl };
            this.addOrUpdateUserInStore(updatedUser);
            
            // Also update localStorage
            try {
              localStorage.setItem('user', JSON.stringify(updatedUser));
            } catch (error) {
              console.warn('Failed to save updated user to storage:', error);
            }
          }
        }
      }),
      catchError((error) => {
        console.error('Failed to upload cover photo:', error);
        this.setError('Failed to upload cover photo');
        return throwError(() => error);
      }),
      tap(() => this.setLoading('update', false))
    );
  }

  /**
   * Update user cover photo URL (for direct URL updates)
   */
  updateUserCoverPhoto(coverPhotoUrl: string): Observable<User> {
    return this.updateCurrentUserProfile({ cover_photo: coverPhotoUrl });
  }

  /**
   * Update user profile tag for custom URL
   */
  updateUserProfileTag(profileTag: string): Observable<User> {
    return this.updateCurrentUserProfile({ profile_tag: profileTag });
  }

  /**
   * Generate profile URL from profile tag
   */
  getProfileUrl(user: User): string {
    const baseUrl = window.location.origin;
    if (user.profileTag) {
      return `${baseUrl}/profile/${user.profileTag}`;
    }
    return `${baseUrl}/profile/${user.id}`;
  }

  /**
   * Check if profile tag is available
   */
  checkProfileTagAvailability(profileTag: string): Observable<{ available: boolean; message?: string }> {
    const authToken = this.getAuthToken();
    if (!authToken) {
      const error = new Error('No authentication token available');
      return throwError(() => error);
    }

    const headers = { 'Authorization': authToken };
    
    return this.http.get<{ available: boolean; message?: string }>(`${this.usersBaseUrl}/check-profile-tag/${profileTag}`, { headers }).pipe(
      catchError((error) => {
        console.error('Failed to check profile tag availability:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get user's full name
   */
  getUserFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    const user = this.items().find(u => u.id === userId);
    return user?.isOnline || false;
  }
}
