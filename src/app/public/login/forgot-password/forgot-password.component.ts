import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { 
  LucideAngularModule, 
  Mail, 
  ArrowLeft,
  CheckCircle,
  Send
} from 'lucide-angular';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-background-main to-background-subtle flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div class="max-w-md w-full space-y-8 relative z-10">
        <!-- Back to Login -->
        <div class="flex items-center justify-start">
          <button 
            (click)="navigateToLogin()"
            class="flex items-center text-text-secondary hover:text-text-primary transition-colors group"
          >
            <lucide-angular 
              [img]="ArrowLeftIcon" 
              size="20" 
              class="mr-2 group-hover:-translate-x-1 transition-transform"
            ></lucide-angular>
            Back to Login
          </button>
        </div>

        <!-- Header -->
        <div class="text-center">
          <img 
            src="/logo_red.png" 
            alt="JobsGlobal" 
            class="h-12 w-auto mx-auto mb-6"
          />
          <h2 class="text-3xl font-bold text-text-primary mb-2">
            Reset your password
          </h2>
          <p class="text-text-secondary">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <!-- Success State -->
        <div *ngIf="emailSent()" class="bg-white rounded-2xl shadow-elegant p-8 text-center">
          <div class="flex justify-center mb-6">
            <div class="bg-green-100 rounded-full p-3">
              <lucide-angular
                [img]="CheckCircleIcon"
                size="32"
                class="text-green-600"
              ></lucide-angular>
            </div>
          </div>
          
          <h3 class="text-xl font-semibold text-text-primary mb-2">
            Check your email
          </h3>
          
          <p class="text-text-secondary mb-6">
            We've sent a password reset link to <strong>{{ forgotPasswordForm.get('email')?.value }}</strong>
          </p>
          
          <div class="space-y-4">
            <button
              (click)="resendEmail()"
              [disabled]="isLoading()"
              class="w-full bg-gray-100 text-text-primary py-3 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Didn't receive an email? Resend
            </button>
            
            <button
              (click)="navigateToLogin()"
              class="w-full text-primary-600 hover:text-primary-500 font-medium transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>

        <!-- Reset Form -->
        <div *ngIf="!emailSent()" class="bg-white rounded-2xl shadow-elegant p-8">
          <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Email Field -->
            <div>
              <label for="email" class="block text-sm font-medium text-text-primary mb-2">
                Email address
              </label>
              <div class="relative">
                <lucide-angular
                  [img]="MailIcon"
                  size="20"
                  class="absolute left-2 top-1/2 transform -translate-y-1/2 text-text-secondary"
                ></lucide-angular>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="Enter your email address"
                  [class.border-red-300]="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched"
                  [class.focus:ring-red-500]="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched"
                />
              </div>
              <div class="mt-1 text-sm text-red-600" *ngIf="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched">
                <span *ngIf="forgotPasswordForm.get('email')?.errors?.['required']">Email is required</span>
                <span *ngIf="forgotPasswordForm.get('email')?.errors?.['email']">Please enter a valid email address</span>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="forgotPasswordForm.invalid || isLoading()"
              class="w-full bg-primary-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <lucide-angular
                *ngIf="!isLoading()"
                [img]="SendIcon"
                size="20"
                class="mr-2"
              ></lucide-angular>
              <span *ngIf="!isLoading()">Send reset link</span>
              <div *ngIf="isLoading()" class="flex items-center">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Sending...
              </div>
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

        <!-- Security Note -->
        <div class="text-center text-sm text-text-muted">
          <p>
            For security reasons, we'll send the reset link to the email address associated with your account.
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
export class ForgotPasswordComponent {
  // Icons
  readonly MailIcon = Mail;
  readonly ArrowLeftIcon = ArrowLeft;
  readonly CheckCircleIcon = CheckCircle;
  readonly SendIcon = Send;

  // Signals
  isLoading = signal(false);
  emailSent = signal(false);

  // Form
  forgotPasswordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  async onSubmit(): Promise<void> {
    if (this.forgotPasswordForm.valid) {
      this.isLoading.set(true);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // TODO: Implement actual forgot password logic
        console.log('Password reset request:', this.forgotPasswordForm.value);
        
        // Show success state
        this.emailSent.set(true);
      } catch (error) {
        console.error('Forgot password error:', error);
        // TODO: Handle forgot password error
      } finally {
        this.isLoading.set(false);
      }
    } else {
      // Mark email field as touched to show validation errors
      this.forgotPasswordForm.get('email')?.markAsTouched();
    }
  }

  async resendEmail(): Promise<void> {
    this.isLoading.set(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Implement actual resend email logic
      console.log('Resend email request:', this.forgotPasswordForm.value);
    } catch (error) {
      console.error('Resend email error:', error);
      // TODO: Handle resend email error
    } finally {
      this.isLoading.set(false);
    }
  }
}