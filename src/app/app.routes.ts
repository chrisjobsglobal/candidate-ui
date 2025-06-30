import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./core/shared/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
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
  }
];
