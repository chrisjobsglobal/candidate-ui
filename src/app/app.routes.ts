import { Routes } from '@angular/router';

export const routes: Routes = [
  // Public routes (no layout)
  {
    path: '',
    loadComponent: () => import('./public/hero/hero.component').then(m => m.HeroComponent)
  },
  {
    path: 'hero',
    loadComponent: () => import('./public/hero/hero.component').then(m => m.HeroComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./public/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./public/login/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./public/register/register.component').then(m => m.RegisterComponent)
  },
  // Authenticated routes (with layout)
  {
    path: 'app',
    loadComponent: () => import('./core/shared/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: '',
        redirectTo: '/app/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'jobs',
        loadComponent: () => import('./features/jobs.component').then(m => m.JobsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/user/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'profile/edit',
        loadComponent: () => import('./features/user/profile/edit-profile.component').then(m => m.EditProfileComponent)
      },
      {
        path: 'profile/work-status',
        loadComponent: () => import('./features/user/profile/edit-profile-work-status.component').then(m => m.EditProfileWorkStatusComponent)
      },
      {
        path: 'test-work-status',
        loadComponent: () => import('./test-work-status.component').then(m => m.TestWorkStatusComponent)
      },
      {
        path: 'messages',
        loadComponent: () => import('./features/messages.component').then(m => m.MessagesComponent)
      },
      {
        path: 'discover',
        loadComponent: () => import('./features/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'applications',
        loadComponent: () => import('./features/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/dashboard.component').then(m => m.DashboardComponent)
      }
    ]
  },
  // Legacy route redirects for backward compatibility
  {
    path: 'dashboard',
    redirectTo: '/app/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'jobs',
    redirectTo: '/app/jobs',
    pathMatch: 'full'
  },
  {
    path: 'profile',
    redirectTo: '/app/profile',
    pathMatch: 'full'
  },
  {
    path: 'messages',
    redirectTo: '/app/messages',
    pathMatch: 'full'
  }
];
