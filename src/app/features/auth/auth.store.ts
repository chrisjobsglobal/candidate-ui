import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError, switchMap, map } from 'rxjs';
import { signal, computed } from '@angular/core';
import { User } from '../../core/models/user.model';

/**
 * Login request interface based on FastAPI endpoint
 */
export interface LoginRequest {
  username_or_email: string;
  password: string;
}

/**
 * Login response interface based on FastAPI endpoint
 */
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

/**
 * Validation error detail from FastAPI
 */
export interface ValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

/**
 * Validation error response from FastAPI
 */
export interface ValidationErrorResponse {
  detail: ValidationErrorDetail[];
}

/**
 * User profile response from FastAPI /auth/me endpoint
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
  bio: string;
  is_verified: boolean;
  mobile: string | null;
  address: string | null;
  country: string | null;
  full_name: string;
}

/**
 * User authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  tokenType: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * Auth store for handling authentication operations
 */
@Injectable({
  providedIn: 'root'
})
export class AuthStore {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000/auth'; // Adjust this to match your API base URL

  // Auth state signals
  private readonly _isAuthenticated = signal<boolean>(false);
  private readonly _accessToken = signal<string | null>(null);
  private readonly _tokenType = signal<string | null>(null);
  private readonly _user = signal<User | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Public readonly signals
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  readonly tokenType = this._tokenType.asReadonly();
  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // Computed signals
  readonly authToken = computed(() => {
    const token = this._accessToken();
    const type = this._tokenType();
    return token && type ? `${type} ${token}` : null;
  });

  constructor() {
    // Initialize state from localStorage if available
    this.initializeFromStorage();
    
    // If user is authenticated but no user data, fetch it from API
    if (this._isAuthenticated() && !this._user()) {
      console.log('User authenticated but no user data available, fetching from API...');
      this.fetchUserProfile().subscribe({
        next: (user) => {
          console.log('User profile loaded on init:', user);
        },
        error: (error) => {
          console.warn('Failed to fetch user profile on app init:', error);
        }
      });
    }
  }

  /**
   * Login method that calls the FastAPI /auth/login endpoint
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials).pipe(
      tap((response: LoginResponse) => {
        // Update auth state on successful login
        this._accessToken.set(response.access_token);
        this._tokenType.set(response.token_type);
        this._isAuthenticated.set(true);
        this._error.set(null);

        // Save to localStorage for persistence
        this.saveToStorage(response);
      }),
      // Fetch user profile after successful login
      tap((response: LoginResponse) => {
        // Fetch user profile from the real API endpoint
        this.fetchUserProfile().subscribe({
          next: (user) => {
            console.log('User profile loaded:', user);
          },
          error: (error) => {
            console.warn('Failed to fetch user profile after login:', error);
            // Fallback to mock data if API call fails
            this.setMockUserData(credentials.username_or_email);
          }
        });
      }),
      catchError((error) => {
        // Handle login errors
        this._isAuthenticated.set(false);
        this._accessToken.set(null);
        this._tokenType.set(null);
        this._user.set(null);
        
        // Extract error message
        const errorMessage = this.extractErrorMessage(error);
        this._error.set(errorMessage);
        
        return throwError(() => error);
      }),
      tap(() => {
        this._loading.set(false);
      })
    );
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
  fetchUserProfile(): Observable<User> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return throwError(() => new Error('No authentication token available'));
    }

    return this.http.get<UserProfileResponse>(`${this.baseUrl}/me`, { headers }).pipe(
      tap((apiUser: UserProfileResponse) => {
        // Transform API response to our User model
        const user: User = {
          id: apiUser.id,
          email: apiUser.email,
          firstName: apiUser.first_name,
          lastName: apiUser.last_name,
          profilePicture: apiUser.avatar_url || undefined,
          role: this.mapUserRole(apiUser),
          isOnline: apiUser.is_active,
          lastSeen: apiUser.last_login ? new Date(apiUser.last_login) : new Date(),
          createdAt: new Date(apiUser.created_at),
          updatedAt: apiUser.updated_at ? new Date(apiUser.updated_at) : new Date()
        };
        
        this._user.set(user);
        // Update localStorage with user data
        try {
          localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          console.warn('Failed to save user to storage:', error);
        }
      }),
      // Return the transformed User object
      map((apiUser: UserProfileResponse): User => ({
        id: apiUser.id,
        email: apiUser.email,
        firstName: apiUser.first_name,
        lastName: apiUser.last_name,
        profilePicture: apiUser.avatar_url || undefined,
        role: this.mapUserRole(apiUser),
        isOnline: apiUser.is_active,
        lastSeen: apiUser.last_login ? new Date(apiUser.last_login) : new Date(),
        createdAt: new Date(apiUser.created_at),
        updatedAt: apiUser.updated_at ? new Date(apiUser.updated_at) : new Date()
      })),
      catchError((error) => {
        console.error('Failed to fetch user profile:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get authorization headers for API requests
   */
  private getAuthHeaders(): HttpHeaders | null {
    const token = this._accessToken();
    const tokenType = this._tokenType();
    
    if (!token || !tokenType) {
      return null;
    }

    return new HttpHeaders({
      'Authorization': `${tokenType} ${token}`
    });
  }

  /**
   * Logout method
   */
  logout(): void {
    this._isAuthenticated.set(false);
    this._accessToken.set(null);
    this._tokenType.set(null);
    this._user.set(null);
    this._error.set(null);
    
    // Clear from localStorage
    this.clearStorage();
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * Check if user has valid token
   */
  hasValidToken(): boolean {
    return this._isAuthenticated() && !!this._accessToken();
  }

  /**
   * Get current auth state as object
   */
  getAuthState(): AuthState {
    return {
      isAuthenticated: this._isAuthenticated(),
      accessToken: this._accessToken(),
      tokenType: this._tokenType(),
      user: this._user(),
      loading: this._loading(),
      error: this._error()
    };
  }

  /**
   * Initialize auth state from localStorage
   */
  private initializeFromStorage(): void {
    try {
      const storedToken = localStorage.getItem('access_token');
      const storedTokenType = localStorage.getItem('token_type');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedTokenType) {
        this._accessToken.set(storedToken);
        this._tokenType.set(storedTokenType);
        this._isAuthenticated.set(true);
        
        if (storedUser) {
          this._user.set(JSON.parse(storedUser));
        }
      }
    } catch (error) {
      console.warn('Failed to initialize auth state from storage:', error);
      this.clearStorage();
    }
  }

  /**
   * Save auth data to localStorage
   */
  private saveToStorage(response: LoginResponse): void {
    try {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('token_type', response.token_type);
      
      // Save user data if available
      const currentUser = this._user();
      if (currentUser) {
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
    } catch (error) {
      console.warn('Failed to save auth state to storage:', error);
    }
  }

  /**
   * Clear auth data from localStorage
   */
  private clearStorage(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    localStorage.removeItem('user');
  }

  /**
   * Extract error message from HTTP error response
   */
  private extractErrorMessage(error: any): string {
    if (error?.error?.detail) {
      // Handle FastAPI validation errors
      if (Array.isArray(error.error.detail)) {
        const validationErrors = error.error.detail as ValidationErrorDetail[];
        return validationErrors.map(err => err.msg).join(', ');
      }
      // Handle simple error detail
      if (typeof error.error.detail === 'string') {
        return error.error.detail;
      }
    }
    
    // Handle other error formats
    if (error?.message) {
      return error.message;
    }
    
    if (error?.error?.message) {
      return error.error.message;
    }
    
    // Default error message
    return 'An unexpected error occurred during authentication';
  }

  /**
   * Set user data (useful after fetching user profile)
   */
  setUser(user: User): void {
    this._user.set(user);
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.warn('Failed to save user to storage:', error);
    }
  }

  /**
   * Update loading state
   */
  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  /**
   * Helper method to capitalize first letter
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Set mock user data as fallback
   */
  private setMockUserData(email: string): void {
    const emailParts = email.split('@')[0];
    const nameParts = emailParts.split('.');
    const firstName = nameParts[0] ? this.capitalizeFirst(nameParts[0]) : 'User';
    const lastName = nameParts[1] ? this.capitalizeFirst(nameParts[1]) : 'Name';
    
    const mockUser: User = {
      id: '1',
      email: email,
      firstName: firstName,
      lastName: lastName,
      profilePicture: undefined,
      role: 'jobseeker',
      isOnline: true,
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.setUser(mockUser);
  }
}