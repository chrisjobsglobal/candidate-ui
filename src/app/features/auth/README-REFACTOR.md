# Auth and User Store Architecture

This document explains the separation of concerns between authentication and user management in the application.

## Architecture Overview

The authentication system has been refactored to separate authentication concerns from user data management:

### 1. AuthStore (`src/app/features/auth/auth.store.ts`)
**Purpose**: Handles authentication-related operations only
- Login/logout functionality
- Token management (access token, token type)
- Authentication state (isAuthenticated, loading, error)
- Token persistence in localStorage
- Error handling for authentication

**Key Features**:
- Focused solely on authentication
- No user profile data management
- Provides auth headers for API requests
- Signal-based reactive state

### 2. UserStore (`src/app/features/user/store/user.store.ts`)
**Purpose**: Manages user data and user-related operations
- Extends BaseStore for CRUD operations
- User profile management
- User search and filtering
- Current user state management
- User data persistence

**Key Features**:
- Extends BaseStore for full CRUD capabilities
- Manages current authenticated user
- Provides user profile operations
- Handles user data caching
- Signal-based reactive state

### 3. AuthService (`src/app/core/services/auth.service.ts`)
**Purpose**: Coordinates between AuthStore and UserStore
- Provides a unified interface for authentication flow
- Handles complete login/logout process
- Manages the relationship between auth and user data

**Key Features**:
- Complete authentication flow (login + fetch user profile)
- Unified logout (clear auth + clear user data)
- App initialization logic
- Single point of access for components

## Usage Examples

### Basic Login Flow
```typescript
import { AuthService } from '../core/services/auth.service';

@Component({...})
export class LoginComponent {
  private authService = inject(AuthService);

  login(credentials: LoginRequest) {
    this.authService.login(credentials).subscribe({
      next: (response) => {
        // User is now authenticated and profile is loaded
        console.log('Login successful');
      },
      error: (error) => {
        // Handle login error
        console.error('Login failed:', error);
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}
```

### Using Reactive Signals in Components
```typescript
@Component({
  template: `
    @if (authService.isAuthenticated()) {
      <div>Welcome {{ authService.currentUser()?.firstName }}!</div>
      <button (click)="logout()">Logout</button>
    } @else {
      <app-login></app-login>
    }
  `
})
export class AppComponent {
  protected authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}
```

### Direct Store Access (Advanced)
```typescript
import { AuthStore } from '../features/auth/auth.store';
import { UserStore } from '../features/user/store/user.store';

@Component({...})
export class AdvancedComponent {
  private authStore = inject(AuthStore);
  private userStore = inject(UserStore);

  // Access auth-specific features
  checkToken() {
    return this.authStore.hasValidToken();
  }

  // Access user-specific features
  searchUsers(filter: UserFilter) {
    return this.userStore.searchUsers(filter);
  }

  updateProfile(data: UpdateUserProfileDto) {
    return this.userStore.updateCurrentUserProfile(data);
  }
}
```

## Key Benefits

### 1. Separation of Concerns
- **AuthStore**: Only handles authentication logic
- **UserStore**: Only handles user data management
- **AuthService**: Coordinates both stores

### 2. Reusability
- UserStore can be used independently for user management features
- AuthStore can be used independently for authentication features
- BaseStore provides CRUD operations for UserStore

### 3. Maintainability
- Clear boundaries between authentication and user management
- Easier to test individual components
- Easier to extend with new features

### 4. Scalability
- UserStore extends BaseStore, providing full CRUD capabilities
- Can easily add more user-related features
- Can easily add more authentication methods

## File Structure
```
src/app/
├── core/
│   ├── services/
│   │   └── auth.service.ts           # Coordination service
│   ├── store/
│   │   ├── base-store.ts            # Base CRUD store
│   │   └── base-state.ts            # Base state management
│   └── models/
│       └── user.model.ts            # User interfaces
├── features/
│   ├── auth/
│   │   └── auth.store.ts            # Authentication only
│   └── user/
│       └── store/
│           └── user.store.ts        # User management
└── examples/
    └── login-example.component.ts   # Usage example
```

## Migration Notes

If you have existing code that uses the old combined auth store:

1. **Replace direct user access**: 
   - Old: `authStore.user()`
   - New: `userStore.currentUser()` or `authService.currentUser()`

2. **Update profile operations**:
   - Old: `authStore.fetchUserProfile()`
   - New: `userStore.fetchCurrentUserProfile()` or `authService.refreshUserProfile()`

3. **Use AuthService for complete flows**:
   - Login: Use `authService.login()` instead of just `authStore.login()`
   - Logout: Use `authService.logout()` for complete cleanup

4. **Update component imports**:
   - Add UserStore import if you need user-specific operations
   - Use AuthService for most common authentication needs
