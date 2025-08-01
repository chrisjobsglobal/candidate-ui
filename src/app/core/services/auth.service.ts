import { Injectable, inject } from '@angular/core';
import { AuthStore } from '../../features/auth/auth.store';
import { UserStore } from '../../features/user/store/user.store';

/**
 * Simplified authentication service that provides convenient access to auth and user stores
 * Login functionality is handled directly by AuthStore
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly authStore = inject(AuthStore);
  private readonly userStore = inject(UserStore);

  // Expose store signals for components to use
  readonly isAuthenticated = this.authStore.isAuthenticated;
  readonly loading = this.authStore.loading;
  readonly error = this.authStore.error;
  readonly authToken = this.authStore.authToken;
  
  // User-related signals from UserStore
  readonly currentUser = this.userStore.currentUser;

  /**
   * Complete logout flow: clear auth + clear user data
   */
  logout(): void {
    this.authStore.logout();
    this.userStore.clearCurrentUser();
  }

  /**
   * Get auth headers for API requests
   */
  getAuthHeaders() {
    return this.authStore.getAuthHeaders();
  }

  /**
   * Clear any authentication errors
   */
  clearAuthError(): void {
    this.authStore.clearError();
  }
}
