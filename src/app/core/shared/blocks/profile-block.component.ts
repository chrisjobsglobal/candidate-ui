import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  Input,
  signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LogOut, LucideAngularModule, Settings } from 'lucide-angular';
import { AuthStore } from '../../../features/auth/auth.store';
import { UserStore } from '../../../features/user/store/user.store';
import { User as UserModel } from '../../models/user.model';

@Component({
  selector: 'app-profile-block',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <!-- User Profile -->
    <div
      *ngIf="authStore.isAuthenticated()"
      class="absolute bottom-0 left-0 right-0 p-2 border-t border-background-subtle"
    >
      <div class="flex items-center space-x-3 p-3 pb-0">
        <!-- User Avatar -->
        <div
          class="w-10 h-10 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full flex items-center justify-center relative"
        >
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
          <p class="text-sm font-medium text-text-primary truncate">
            {{ userDisplayName() }}
          </p>
          <p
            *ngIf="currentUser()?.email"
            class="text-xs text-text-muted truncate"
          >
            {{ currentUser()?.email }}
          </p>
          <p
            *ngIf="!currentUser()?.email"
            class="text-xs text-text-muted truncate"
          >
            {{ userRole() }}
          </p>
        </div>

        <!-- Actions Dropdown -->
        <div class="relative">
          <button
            routerLink="/app/profile"
            class="p-1 cursor-pointer text-text-secondary hover:text-text-primary transition-colors hover:bg-gray-100 rounded"
            title="Go to Profile"
          >
            <lucide-angular [img]="SettingsIcon" size="16"></lucide-angular>
          </button>
        </div>
      </div>

      <!-- Quick Logout Button -->
      <div class="p-2">
        <button
          (click)="logout()"
          class="w-full mt-2 flex items-center justify-center space-x-2 px-3 py-2 text-sm bg-gray-50 text-red-500 hover:bg-gray-100 hover:text-red-700 rounded-lg transition-colors"
        >
          <lucide-angular [img]="LogOutIcon" size="16"></lucide-angular>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  `,
})
export class ProfileBlockComponent {
  readonly SettingsIcon = Settings;
  readonly LogOutIcon = LogOut;

  readonly router = inject(Router);
  readonly authStore = inject(AuthStore);
  readonly userStore = inject(UserStore);

  isMobileMenuOpen = signal(false);
  profileImageError = signal(false);

  readonly currentUser = computed(
    () => this.userStore.currentUser() as UserModel | null
  );
  readonly userDisplayName = computed(() => {
    const user = this.currentUser();
    if (user && user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return 'Guest User';
  });
  readonly userInitials = computed(() => {
    const user = this.currentUser();
    if (user && user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(
        0
      )}`.toUpperCase();
    }
    return 'GU';
  });
  readonly userRole = computed(() => {
    const user = this.currentUser();
    if (user && user.role) {
      return user.role === 'jobseeker'
        ? 'Job Seeker'
        : user.role === 'recruiter'
        ? 'Recruiter'
        : 'Administrator';
    }
    return 'Guest';
  });
  readonly shouldShowProfileImage = computed(() => {
    const user = this.currentUser();
    return user?.profilePicture && !this.profileImageError();
  });

  constructor() {
    // Reset profile image error when user changes
    effect(() => {
      // This effect runs whenever the user signal changes
      this.currentUser();
      this.profileImageError.set(false);
    });
  }

  logout() {
    this.authStore.logout();
    this.userStore.clearCurrentUser();
    this.router.navigate(['/login']);
  }

  onImageError(event: Event) {
    this.profileImageError.set(true);
  }
}
