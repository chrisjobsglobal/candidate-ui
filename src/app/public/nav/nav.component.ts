import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Top Navigation Bar -->
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <img 
              src="/logo_red.png" 
              alt="JobsGlobal" 
              class="h-10 w-auto cursor-pointer" 
              (click)="navigateHome()"
            />
          </div>
          
          <!-- Navigation Links -->
          <div class="hidden md:flex items-center space-x-8">
            <a 
              href="#" 
              (click)="navigateToJobs(); $event.preventDefault()"
              class="text-text-secondary hover:text-text-primary font-medium transition-colors"
            >
              Find Jobs
            </a>
            <a 
              href="#" 
              class="text-text-secondary hover:text-text-primary font-medium transition-colors"
            >
              For Companies
            </a>
            <a 
              href="#" 
              (click)="navigateToJobs(); $event.preventDefault()"
              class="text-text-secondary hover:text-text-primary font-medium transition-colors"
            >
              Remote Jobs
            </a>
            <a 
              href="#" 
              (click)="navigateToJobs(); $event.preventDefault()"
              class="text-text-secondary hover:text-text-primary font-medium transition-colors"
            >
              Browse
            </a>
          </div>
          
          <!-- Auth Buttons -->
          <div class="flex items-center space-x-4">
            <button 
              (click)="handleLogin()"
              class="text-text-secondary hover:text-text-primary font-medium transition-colors"
            >
              Log in
            </button>
            <button 
              (click)="handleSignup()"
              class="bg-primary-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-800 transition-colors"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class NavComponent {
  constructor(private router: Router) {}

  navigateHome(): void {
    this.router.navigate(['/']);
  }

  navigateToJobs(): void {
    this.router.navigate(['/app/jobs']);
  }

  handleLogin(): void {
    this.router.navigate(['/login']);
  }

  handleSignup(): void {
    this.router.navigate(['/register']);
  }
}
