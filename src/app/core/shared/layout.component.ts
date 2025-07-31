import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { 
  LucideAngularModule, 
  Home, 
  Search, 
  Briefcase, 
  MessageSquare, 
  Bell, 
  User, 
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-angular';
import { AuthStore } from '../../features/auth/auth.store';
import { User as UserModel } from '../models/user.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background-main">
      <!-- Mobile menu overlay -->
      <div 
        *ngIf="isMobileMenuOpen()" 
        class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
        (click)="toggleMobileMenu()"
      ></div>

      <!-- Sidebar -->
      <aside class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-elegant transform transition-transform duration-300 ease-in-out lg:translate-x-0"
             [class.translate-x-0]="isMobileMenuOpen()"
             [class.-translate-x-full]="!isMobileMenuOpen()">
        
        <!-- Logo -->
        <div class="flex items-center justify-between h-[65px] px-6 border-b border-background-subtle">
          <div class="h-[50px] w-full" style="background: url(/logo_red.png); background-size: contain; background-repeat:no-repeat; background-position: center"></div>
          <button 
            (click)="toggleMobileMenu()"
            class="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <lucide-angular [img]="XIcon" size="20"></lucide-angular>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="mt-8 px-4">
          <ul class="space-y-2">
            <li *ngFor="let item of navigationItems">
              <a 
                [routerLink]="item.route"
                routerLinkActive="bg-primary-50 text-primary-900 border-r-2 border-primary-900"
                class="flex items-center space-x-3 px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-gray-50 rounded-lg transition-all duration-200 group"
              >
                <lucide-angular 
                  [img]="item.icon" 
                  size="20"
                  class="group-hover:text-primary-900 transition-colors"
                ></lucide-angular>
                <span class="font-medium">{{ item.label }}</span>
                <span 
                  *ngIf="item.badge" 
                  class="ml-auto bg-primary-900 text-white text-xs px-2 py-1 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {{ item.badge }}
                </span>
              </a>
            </li>
          </ul>
        </nav>

        <!-- User Profile -->
        <div *ngIf="authStore.isAuthenticated()" class="absolute bottom-0 left-0 right-0 p-4 border-t border-background-subtle">
          <div class="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group">
            <!-- User Avatar -->
            <div class="w-10 h-10 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full flex items-center justify-center relative">
              <img 
                *ngIf="shouldShowProfileImage()" 
                [src]="currentUser()?.profilePicture" 
                [alt]="userDisplayName()"
                class="w-full h-full rounded-full object-cover"
                (error)="onImageError($event)"
              />
              <span 
                *ngIf="!shouldShowProfileImage()" 
                class="text-white font-semibold text-sm"
              >
                {{ userInitials() }}
              </span>
              <!-- Online indicator -->
              <div 
                *ngIf="currentUser()?.isOnline"
                class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
              ></div>
            </div>
            
            <!-- User Info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-text-primary truncate">{{ userDisplayName() }}</p>
              <p class="text-xs text-text-secondary truncate">{{ userRole() }}</p>
              <p *ngIf="currentUser()?.email" class="text-xs text-text-muted truncate">{{ currentUser()?.email }}</p>
            </div>
            
            <!-- Actions Dropdown -->
            <div class="relative">
              <button 
                routerLink="/app/profile"
                class="p-1 text-text-secondary hover:text-text-primary transition-colors group-hover:bg-gray-100 rounded"
                title="Go to Profile"
              >
                <lucide-angular [img]="SettingsIcon" size="16"></lucide-angular>
              </button>
            </div>
          </div>
          
          <!-- Quick Logout Button -->
          <button 
            (click)="logout()"
            class="w-full mt-2 flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <lucide-angular [img]="LogOutIcon" size="16"></lucide-angular>
            <span>Sign Out</span>
          </button>
        </div>

        <!-- Login Prompt (when not authenticated) -->
        <div *ngIf="!authStore.isAuthenticated()" class="absolute bottom-0 left-0 right-0 p-4 border-t border-background-subtle">
          <div class="text-center">
            <p class="text-sm text-text-secondary mb-3">Please sign in to continue</p>
            <button 
              (click)="navigateToLogin()"
              class="w-full bg-primary-900 hover:bg-primary-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <div class="lg:pl-64">
        <!-- Top bar -->
        <header class="bg-white shadow-sm border-b border-background-subtle sticky top-0 z-30">
          <div class="flex items-center justify-between h-16 px-6">
            <button 
              (click)="toggleMobileMenu()"
              class="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              <lucide-angular [img]="MenuIcon" size="24"></lucide-angular>
            </button>

            <!-- Search bar -->
            <div class="flex-1 max-w-2xl mx-4">
              <div class="relative">
                <lucide-angular 
                  [img]="SearchIcon" 
                  size="20" 
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 -translate-x-1 text-text-secondary"
                ></lucide-angular>
                <input 
                  type="text" 
                  placeholder="Search jobs, people, companies..."
                  class="w-full pl-10 pr-4 py-2 border border-background-subtle rounded-full focus:ring-2 focus:ring-primary-900 focus:border-transparent outline-none transition-all bg-background-main text-text-primary placeholder-text-secondary"
                >
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-4">
              <button class="relative p-2 text-text-secondary hover:text-text-primary transition-colors" 
                (click)="navigateNotifications()"
              >
                <lucide-angular [img]="BellIcon" size="20"></lucide-angular>
                <span class="absolute -top-1 -right-1 w-5 h-5 bg-primary-900 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </button>
              <button class="relative p-2 text-text-secondary hover:text-text-primary transition-colors" (click)="navigateMessages()">
                <lucide-angular [img]="MessageSquareIcon" size="20"></lucide-angular>
                <span class="absolute -top-0 -right-0 w-2 h-2 bg-primary-900 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        <!-- Page content -->
        <main class="p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent {
  readonly HomeIcon = Home;
  readonly SearchIcon = Search;
  readonly BriefcaseIcon = Briefcase;
  readonly MessageSquareIcon = MessageSquare;
  readonly BellIcon = Bell;
  readonly UserIcon = User;
  readonly SettingsIcon = Settings;
  readonly MenuIcon = Menu;
  readonly XIcon = X;
  readonly LogOutIcon = LogOut;

  // Inject services
  readonly router = inject(Router);
  readonly authStore = inject(AuthStore);

  isMobileMenuOpen = signal(false);
  profileImageError = signal(false);

  // Computed values for user info
  readonly currentUser = computed(() => this.authStore.user() as UserModel | null);
  readonly userDisplayName = computed(() => {
    const user = this.currentUser();
    if (user) {
      return `${user.firstName} ${user.lastName}`;
    }
    return 'Guest User';
  });
  readonly userInitials = computed(() => {
    const user = this.currentUser();
    if (user) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return 'GU';
  });
  readonly userRole = computed(() => {
    const user = this.currentUser();
    if (user) {
      return user.role === 'jobseeker' ? 'Job Seeker' : 
             user.role === 'recruiter' ? 'Recruiter' : 
             'Administrator';
    }
    return 'Guest';
  });
  readonly shouldShowProfileImage = computed(() => {
    return this.currentUser()?.profilePicture && !this.profileImageError();
  });

  constructor() {
    // Reset profile image error when user changes
    effect(() => {
      // This effect runs whenever the user signal changes
      this.currentUser();
      this.profileImageError.set(false);
    });
  }

  navigationItems = [
    { icon: Home, label: 'Home', route: '/app/dashboard', badge: null },
    { icon: Search, label: 'Discover', route: '/app/discover', badge: null },
    { icon: Briefcase, label: 'Jobs', route: '/app/jobs', badge: '5' },
    { icon: User, label: 'Applications', route: '/app/applications', badge: null },
    { icon: MessageSquare, label: 'Messages', route: '/app/messages', badge: '2' },
    { icon: Bell, label: 'Notifications', route: '/app/notifications', badge: null },
    { icon: User, label: 'Profile', route: '/app/profile', badge: null },
  ];

  navigateNotifications() {
    this.router.navigate(['/app/notifications']);
  }

  navigateMessages() {
    this.router.navigate(['/app/messages']);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(value => !value);
  }

  logout() {
    this.authStore.logout();
    this.router.navigate(['/login']);
  }

  onImageError(event: Event) {
    this.profileImageError.set(true);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
