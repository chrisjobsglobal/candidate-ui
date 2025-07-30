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
        loadComponent: () => import('./features/profile.component').then(m => m.ProfileComponent)
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
