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
  LogOut,
} from 'lucide-angular';
import { AuthStore } from '../../features/auth/auth.store';
import { UserStore } from '../../features/user/store/user.store';
import { User as UserModel } from '../models/user.model';
import { ProfileBlockComponent } from "./blocks/profile-block.component";

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, ProfileBlockComponent],
  template: `
    <div class="min-h-screen bg-background-main">
      <!-- Mobile menu overlay -->
      <div
        *ngIf="isMobileMenuOpen()"
        class="fixed inset-0 z-40 bg-black opacity-50 lg:hidden"
        (click)="toggleMobileMenu()"
      ></div>

      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-elegant transform transition-transform duration-300 ease-in-out lg:translate-x-0"
        [class.translate-x-0]="isMobileMenuOpen()"
        [class.-translate-x-full]="!isMobileMenuOpen()"
      >
        <!-- Logo -->
        <div
          class="flex items-center justify-between h-[65px] px-6 border-b border-background-subtle"
        >
          <div
            class="h-[50px] w-full"
            style="background: url(/logo_red.png); background-size: contain; background-repeat:no-repeat; background-position: center"
          ></div>
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

        <app-profile-block></app-profile-block>

        <!-- Login Prompt (when not authenticated) -->
        <div
          *ngIf="!authStore.isAuthenticated()"
          class="absolute bottom-0 left-0 right-0 p-4 border-t border-background-subtle"
        >
          <div class="text-center">
            <p class="text-sm text-text-secondary mb-3">
              Please sign in to continue
            </p>
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
        <header
          class="bg-white shadow-sm border-b border-background-subtle sticky top-0 z-30"
        >
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
                />
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-4">
              <button
                class="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
                (click)="navigateNotifications()"
              >
                <lucide-angular [img]="BellIcon" size="20"></lucide-angular>
                <span
                  class="absolute -top-1 -right-1 w-5 h-5 bg-primary-900 text-white text-xs rounded-full flex items-center justify-center"
                  >3</span
                >
              </button>
              <button
                class="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
                (click)="navigateMessages()"
              >
                <lucide-angular
                  [img]="MessageSquareIcon"
                  size="20"
                ></lucide-angular>
                <span
                  class="absolute -top-0 -right-0 w-2 h-2 bg-primary-900 rounded-full"
                ></span>
              </button>
            </div>
          </div>
        </header>

        <!-- Page content -->
        <main class="p-0 pt-6 lg:p-6 ">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
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
  readonly userStore = inject(UserStore);

  isMobileMenuOpen = signal(false);
  profileImageError = signal(false);

  // Computed values for user info
  readonly currentUser = computed(
    () => this.userStore.currentUser() as UserModel | null
  );
  readonly userDisplayName = computed(() => {
    const user = this.currentUser();
    if (user && user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return 'Guest User';
  });
  readonly userInitials = computed(() => {
    const user = this.currentUser();
    if (user && user.first_name && user.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(
        0
      )}`.toUpperCase();
    }
    return 'GU';
  });
  readonly userRole = computed(() => {
    const user = this.currentUser();
    if (user) {
      if (user.is_hiring) {
        return 'Recruiter';
      } else if (user.is_open_to_work) {
        return 'Job Seeker';
      }
    }
    return 'Guest';
  });
  readonly shouldShowProfileImage = computed(() => {
    const user = this.currentUser();
    return user?.avatar_url && !this.profileImageError();
  });

  constructor() {
    // Reset profile image error when user changes
    // effect(() => {
    //   // This effect runs whenever the user signal changes
    //   this.currentUser();
    //   this.profileImageError.set(false);
    // });
  }

  navigationItems = [
    { icon: Home, label: 'Home', route: '/app/dashboard', badge: null },
    { icon: Search, label: 'Discover', route: '/app/discover', badge: null },
    { icon: Briefcase, label: 'Jobs', route: '/app/jobs', badge: '5' },
    {
      icon: User,
      label: 'Applications',
      route: '/app/applications',
      badge: null,
    },
    {
      icon: MessageSquare,
      label: 'Messages',
      route: '/app/messages',
      badge: '2',
    },
    {
      icon: Bell,
      label: 'Notifications',
      route: '/app/notifications',
      badge: null,
    },
    { icon: User, label: 'Profile', route: '/app/profile', badge: null },
  ];

  navigateNotifications() {
    this.router.navigate(['/app/notifications']);
  }

  navigateMessages() {
    this.router.navigate(['/app/messages']);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update((value) => !value);
  }

  logout() {
    this.authStore.logout();
    this.userStore.clearCurrentUser();
    this.router.navigate(['/login']);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
