import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  X
} from 'lucide-angular';

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
        <div class="flex items-center justify-between h-16 px-6 border-b border-background-subtle">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-r from-gradient-start to-gradient-end rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">C</span>
            </div>
            <span class="text-xl font-bold text-text-primary">CareerHub</span>
          </div>
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
                  class="ml-auto bg-primary-900 text-white text-xs px-2 py-1 rounded-full"
                >
                  {{ item.badge }}
                </span>
              </a>
            </li>
          </ul>
        </nav>

        <!-- User Profile -->
        <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-background-subtle">
          <div class="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
            <div class="w-10 h-10 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full flex items-center justify-center">
              <span class="text-white font-semibold text-sm">JD</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-text-primary truncate">John Doe</p>
              <p class="text-xs text-text-secondary truncate">Software Engineer</p>
            </div>
            <lucide-angular [img]="SettingsIcon" size="16" class="text-text-secondary"></lucide-angular>
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
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
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
              <button class="relative p-2 text-text-secondary hover:text-text-primary transition-colors">
                <lucide-angular [img]="BellIcon" size="20"></lucide-angular>
                <span class="absolute -top-1 -right-1 w-5 h-5 bg-primary-900 text-white text-xs rounded-full flex items-center justify-center">3</span>
              </button>
              <button class="relative p-2 text-text-secondary hover:text-text-primary transition-colors">
                <lucide-angular [img]="MessageSquareIcon" size="20"></lucide-angular>
                <span class="absolute -top-1 -right-1 w-2 h-2 bg-primary-900 rounded-full"></span>
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

  isMobileMenuOpen = signal(false);

  navigationItems = [
    { icon: Home, label: 'Home', route: '/dashboard', badge: null },
    { icon: Search, label: 'Discover', route: '/discover', badge: null },
    { icon: Briefcase, label: 'Jobs', route: '/jobs', badge: '5' },
    { icon: User, label: 'Applications', route: '/applications', badge: null },
    { icon: MessageSquare, label: 'Messages', route: '/messages', badge: '2' },
    { icon: Bell, label: 'Notifications', route: '/notifications', badge: null },
    { icon: User, label: 'Profile', route: '/profile', badge: null },
  ];

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(value => !value);
  }
}
