import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { 
  LucideAngularModule, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock,
  User,
  ArrowLeft
} from 'lucide-angular';
import { AuthStore, LoginRequest } from '../../features/auth/auth.store';
import { UserStore } from '../../features/user/store/user.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-background-main to-background-subtle flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <!-- Back to Home -->
        <div class="flex items-start justify-start absolute top-4 left-4">
          <button
            (click)="navigateHome()"
            class="flex items-center text-text-secondary hover:text-text-primary transition-colors group"
          >
            <lucide-angular
              [img]="ArrowLeftIcon"
              size="20"
              class="mr-2 group-hover:-translate-x-1 transition-transform"
            ></lucide-angular>
            Back to Home
          </button>
        </div>
      
      <div class="max-w-md w-full space-y-8 relative z-10">
        

        <!-- Header -->
        <div class="text-center">
          <img 
            src="/logo_red.png" 
            alt="JobsGlobal" 
            class="h-12 w-auto mx-auto mb-6"
          />
          <h2 class="text-3xl font-bold text-text-primary mb-2">
            Welcome back
          </h2>
          <p class="text-text-secondary">
            Sign in to your account to continue your job search
          </p>
        </div>

        <!-- Login Form -->
        <div class="bg-white rounded-2xl shadow-elegant p-8">
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Email Field -->
            <div>
              <label for="email" class="block text-sm font-medium text-text-primary mb-2">
                Email Address *
              </label>
              <div class="relative">
                <lucide-angular
                  [img]="MailIcon"
                  size="20"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                ></lucide-angular>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  autocomplete="email"
                  class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  [class.border-red-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                  placeholder="Enter your email"
                />
              </div>
              <div *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched" class="text-red-500 text-sm mt-1">
                <span *ngIf="loginForm.get('email')?.errors?.['required']">Email is required</span>
                <span *ngIf="loginForm.get('email')?.errors?.['email']">Please enter a valid email</span>
              </div>
            </div>

            <!-- Password Field -->
            <div>
              <label for="password" class="block text-sm font-medium text-text-primary mb-2">
                Password *
              </label>
              <div class="relative">
                <lucide-angular
                  [img]="LockIcon"
                  size="20"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                ></lucide-angular>
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  autocomplete="current-password"
                  class="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  [class.border-red-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  (click)="togglePassword()"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <lucide-angular
                    [img]="showPassword() ? EyeOffIcon : EyeIcon"
                    size="20"
                  ></lucide-angular>
                </button>
              </div>
              <div *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched" class="text-red-500 text-sm mt-1">
                <span *ngIf="loginForm.get('password')?.errors?.['required']">Password is required</span>
                <span *ngIf="loginForm.get('password')?.errors?.['minlength']">Password must be at least 6 characters</span>
              </div>
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  formControlName="rememberMe"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label for="remember-me" class="ml-2 block text-sm text-text-secondary">
                  Remember me
                </label>
              </div>
              <a 
                routerLink="/forgot-password"
                class="text-sm text-primary-600 hover:text-primary-500 font-medium transition-colors"
              >
                Forgot password?
              </a>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="loginForm.invalid || authStore.loading()"
              class="w-full bg-primary-900 hover:bg-primary-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span *ngIf="!authStore.loading()">Sign in</span>
              <div *ngIf="authStore.loading()" class="flex items-center">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </div>
            </button>

            <!-- Error Message -->
            <div *ngIf="authStore.error()" class="bg-red-50 border border-red-200 rounded-lg p-3">
              <p class="text-red-600 text-sm">{{ authStore.error() }}</p>
              <button 
                type="button"
                (click)="authStore.clearError()"
                class="text-red-600 text-xs underline mt-1 hover:text-red-700"
              >
                Dismiss
              </button>
            </div>

            <!-- Divider -->
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-text-secondary">Or continue with</span>
              </div>
            </div>

            <!-- Google Login -->
            <button
              type="button"
              (click)="loginWithGoogle()"
              class="w-full bg-white border border-gray-300 text-text-primary py-3 px-4 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
            >
              <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </form>

          <!-- Sign Up Link -->
          <div class="mt-6 text-center">
            <p class="text-text-secondary">
              Don't have an account?
              <a 
                routerLink="/register"
                class="font-medium text-primary-600 hover:text-primary-500 transition-colors ml-1"
              >
                Sign up
              </a>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center text-sm text-text-muted">
          <p>
            By signing in, you agree to our 
            <a href="#" class="text-primary-600 hover:text-primary-500 transition-colors">Terms of Service</a>
            and 
            <a href="#" class="text-primary-600 hover:text-primary-500 transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-grid-pattern {
      background-image: 
        linear-gradient(rgba(44, 62, 80, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(44, 62, 80, 0.1) 1px, transparent 1px);
      background-size: 20px 20px;
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoginComponent {
  // Icons
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly UserIcon = User;
  readonly ArrowLeftIcon = ArrowLeft;

  // Inject services
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  readonly authStore = inject(AuthStore);
  private readonly userStore = inject(UserStore);

  // Signals
  showPassword = signal(false);

  // Form
  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Clear any existing errors when component initializes
    this.authStore.clearError();

    // Check if user is already authenticated and redirect
    if (this.authStore.isAuthenticated()) {
      // Fetch user profile and navigate to dashboard
      this.userStore.fetchCurrentUserProfile().subscribe({
        next: () => {
          this.router.navigate(['/app/dashboard']);
        },
        error: (error) => {
          console.error('Failed to fetch user profile:', error);
          // Still navigate to dashboard even if profile fetch fails
          this.router.navigate(['/app/dashboard']);
        }
      });
    }
  }

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      const formValue = this.loginForm.value;
      
      // Prepare login request matching the API interface
      const loginRequest: LoginRequest = {
        username_or_email: formValue.email,
        password: formValue.password
      };

      try {
        // Call the auth store login method
        await firstValueFrom(this.authStore.login(loginRequest));
        
        // Fetch current user profile to update user store
        await firstValueFrom(this.userStore.fetchCurrentUserProfile());
        
        // Navigate to dashboard on successful login
        this.router.navigate(['/app/dashboard']);
      } catch (error) {
        // Error is already handled by the auth store
        console.error('Login failed:', error);
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  async loginWithGoogle(): Promise<void> {
    try {
      // TODO: Implement Google OAuth integration with auth store
      console.log('Google login attempt - not yet implemented');
      
      // For now, show a message that this feature is coming soon
      alert('Google login will be implemented in a future update.');
    } catch (error) {
      console.error('Google login error:', error);
      // TODO: Handle Google login error through auth store
    }
  }
}