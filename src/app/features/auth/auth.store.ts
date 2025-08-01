import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { signal, computed } from '@angular/core';

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
 * Authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  tokenType: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Auth store for handling authentication operations only
 * User data management is handled by UserStore
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
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Public readonly signals
  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  readonly tokenType = this._tokenType.asReadonly();
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
      catchError((error) => {
        // Handle login errors
        this._isAuthenticated.set(false);
        this._accessToken.set(null);
        this._tokenType.set(null);
        
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
   * Logout method
   */
  logout(): void {
    this._isAuthenticated.set(false);
    this._accessToken.set(null);
    this._tokenType.set(null);
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

      if (storedToken && storedTokenType) {
        this._accessToken.set(storedToken);
        this._tokenType.set(storedTokenType);
        this._isAuthenticated.set(true);
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
   * Update loading state
   */
  setLoading(loading: boolean): void {
    this._loading.set(loading);
  }

  /**
   * Get authorization headers for API requests
   */
  getAuthHeaders(): HttpHeaders | null {
    const token = this._accessToken();
    const tokenType = this._tokenType();
    
    if (!token || !tokenType) {
      return null;
    }

    return new HttpHeaders({
      'Authorization': `${tokenType} ${token}`
    });
  }
}