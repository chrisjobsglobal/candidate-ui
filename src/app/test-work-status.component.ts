import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserWorkStatusStore } from './features/user/store/user-work-status.store';
import {
  LucideAngularModule,
  ArrowLeft,
  Briefcase,
  Users,
  Building2,
  MessageCircle,
} from 'lucide-angular';

@Component({
  selector: 'app-test-work-status',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <button
            type="button"
            (click)="goBack()"
            class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <lucide-angular [img]="ArrowLeftIcon" size="16" class="mr-2"></lucide-angular>
            Back to App
          </button>
          
          <h1 class="text-3xl font-bold text-gray-900">Work Status Test Page</h1>
          <p class="text-gray-600 mt-2">Test the work status store and form component</p>
        </div>

        <!-- Work Status Store Test -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <lucide-angular [img]="BriefcaseIcon" size="20" class="mr-2 text-blue-600"></lucide-angular>
            Current Work Status
          </h2>
          
          <!-- Loading State -->
          <div *ngIf="workStatusStore.isLoading()" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p class="text-gray-600">Loading work status...</p>
          </div>

          <!-- Error State -->
          <div *ngIf="workStatusStore.error()" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <p class="text-sm text-red-600 mt-1">{{ workStatusStore.error() }}</p>
            <button
              type="button"
              (click)="loadWorkStatus()"
              class="mt-3 inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              Try Again
            </button>
          </div>

          <!-- Work Status Data -->
          <div *ngIf="workStatusStore.hasData() && !workStatusStore.isLoading()">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <!-- Status Flags -->
              <div>
                <h3 class="text-sm font-medium text-gray-900 mb-3">Status Flags</h3>
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Hiring:</span>
                    <span class="text-sm font-medium" [class.text-green-600]="workStatusStore.isHiring()" [class.text-gray-400]="!workStatusStore.isHiring()">
                      {{ workStatusStore.isHiring() ? 'Yes' : 'No' }}
                    </span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Open to Work:</span>
                    <span class="text-sm font-medium" [class.text-blue-600]="workStatusStore.isOpenToWork()" [class.text-gray-400]="!workStatusStore.isOpenToWork()">
                      {{ workStatusStore.isOpenToWork() ? 'Yes' : 'No' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Job Details -->
              <div>
                <h3 class="text-sm font-medium text-gray-900 mb-3">Job Details</h3>
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Job Title:</span>
                    <span class="text-sm text-gray-900">{{ workStatusStore.jobTitle() || 'Not set' }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">Company:</span>
                    <span class="text-sm text-gray-900">{{ workStatusStore.company() || 'Not set' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Status Message -->
            <div *ngIf="workStatusStore.workStatusMessage()" class="bg-gray-50 rounded-lg p-4">
              <h3 class="text-sm font-medium text-gray-900 mb-2 flex items-center">
                <lucide-angular [img]="MessageCircleIcon" size="16" class="mr-2"></lucide-angular>
                Status Message
              </h3>
              <p class="text-sm text-gray-700">{{ workStatusStore.workStatusMessage() }}</p>
            </div>

            <!-- Summary -->
            @if (workStatusStore.workStatusSummary(); as summary) {
              <div class="mt-6 bg-blue-50 rounded-lg p-4">
                <h3 class="text-sm font-medium text-blue-900 mb-2">Summary</h3>
                <p class="text-sm text-blue-800 font-medium">{{ summary.displayText }}</p>
                @if (summary.message) {
                  <p class="text-sm text-blue-600 mt-1">"{{ summary.message }}"</p>
                }
                <div class="mt-2 flex items-center gap-4 text-xs text-blue-600">
                  <span>Status: {{ summary.primaryStatus }}</span>
                  @if (summary.company) {
                    <span>Company: {{ summary.company }}</span>
                  }
                  @if (summary.jobTitle) {
                    <span>Title: {{ summary.jobTitle }}</span>
                  }
                </div>
              </div>
            }
          </div>

          <!-- No Data State -->
          <div *ngIf="!workStatusStore.hasData() && !workStatusStore.isLoading() && !workStatusStore.error()" class="text-center py-8">
            <lucide-angular [img]="BriefcaseIcon" size="32" class="mx-auto mb-4 text-gray-400"></lucide-angular>
            <p class="text-gray-600 mb-4">No work status data available</p>
            <button
              type="button"
              (click)="loadWorkStatus()"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Load Work Status
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Actions</h2>
          <div class="flex flex-wrap gap-4">
            <button
              type="button"
              (click)="loadWorkStatus()"
              [disabled]="workStatusStore.loading().get"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <lucide-angular [img]="BriefcaseIcon" size="16" class="mr-2"></lucide-angular>
              Load Work Status
            </button>
            
            <a
              routerLink="/app/profile/work-status"
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <lucide-angular [img]="UsersIcon" size="16" class="mr-2"></lucide-angular>
              Edit Work Status
            </a>
            
            <button
              type="button"
              (click)="clearWorkStatus()"
              class="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              Clear Data
            </button>
            
            <button
              type="button"
              (click)="testOptimisticUpdate()"
              [disabled]="!workStatusStore.hasData()"
              class="inline-flex items-center px-4 py-2 border border-purple-300 rounded-lg text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test Optimistic Update
            </button>
          </div>
        </div>

        <!-- Store Metadata -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mt-8">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Store Metadata</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 class="font-medium text-gray-900 mb-2">Loading States</h3>
              <div class="space-y-1">
                <div class="flex justify-between">
                  <span class="text-gray-600">Get:</span>
                  <span [class.text-blue-600]="workStatusStore.loading().get" [class.text-gray-400]="!workStatusStore.loading().get">
                    {{ workStatusStore.loading().get ? 'Loading' : 'Idle' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Update:</span>
                  <span [class.text-blue-600]="workStatusStore.loading().update" [class.text-gray-400]="!workStatusStore.loading().update">
                    {{ workStatusStore.loading().update ? 'Loading' : 'Idle' }}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 class="font-medium text-gray-900 mb-2">Data Status</h3>
              <div class="space-y-1">
                <div class="flex justify-between">
                  <span class="text-gray-600">Has Data:</span>
                  <span [class.text-green-600]="workStatusStore.hasData()" [class.text-gray-400]="!workStatusStore.hasData()">
                    {{ workStatusStore.hasData() ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Is Stale:</span>
                  <span [class.text-orange-600]="workStatusStore.isDataStale()" [class.text-gray-400]="!workStatusStore.isDataStale()">
                    {{ workStatusStore.isDataStale() ? 'Yes' : 'No' }}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 class="font-medium text-gray-900 mb-2">Timestamps</h3>
              <div class="space-y-1">
                <div class="flex justify-between">
                  <span class="text-gray-600">Last Updated:</span>
                  <span class="text-gray-900 text-xs">
                    {{ workStatusStore.lastUpdated() ? (workStatusStore.lastUpdated() | date:'short') : 'Never' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class TestWorkStatusComponent {
  private readonly router = inject(Router);
  protected readonly workStatusStore = inject(UserWorkStatusStore);

  // Icons
  readonly ArrowLeftIcon = ArrowLeft;
  readonly BriefcaseIcon = Briefcase;
  readonly UsersIcon = Users;
  readonly Building2Icon = Building2;
  readonly MessageCircleIcon = MessageCircle;

  ngOnInit() {
    // Auto-load work status when component initializes
    this.loadWorkStatus();
  }

  loadWorkStatus() {
    this.workStatusStore.getWorkStatus().subscribe({
      next: (status) => {
        console.log('Work status loaded:', status);
      },
      error: (error) => {
        console.error('Failed to load work status:', error);
      }
    });
  }

  clearWorkStatus() {
    this.workStatusStore.clearWorkStatus();
  }

  testOptimisticUpdate() {
    // Test optimistic update
    this.workStatusStore.updateWorkStatusOptimistic({
      is_hiring: !this.workStatusStore.isHiring(),
      work_status_message: `Updated at ${new Date().toLocaleTimeString()}`
    });
  }

  goBack() {
    this.router.navigate(['/app/dashboard']);
  }
}
