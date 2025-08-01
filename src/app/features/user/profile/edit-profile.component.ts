import {
  Component,
  signal,
  inject,
  OnInit,
  OnDestroy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, takeUntil, catchError, of, map } from 'rxjs';
import { UserStore, UpdateUserProfileDto } from '../store/user.store';
import { ConfigService } from '../../../core/services/config.service';
import { Country, CountryResponse, UserMessage } from '../../../core/models/common.model';
import {
  LucideAngularModule,
  Save,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Loader2,
  AlertCircle,
  Check,
} from 'lucide-angular';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Edit Profile</h1>
            <p class="text-gray-600 mt-2">Update your personal information and preferences</p>
          </div>
          <button
            type="button"
            (click)="navigateBack()"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <lucide-angular [img]="XIcon" size="16" class="mr-2"></lucide-angular>
            Cancel
          </button>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div
        *ngIf="message()"
        class="mb-6 p-4 rounded-xl border shadow-sm"
        [class.bg-green-50]="message()!.type === 'success'"
        [class.border-green-200]="message()!.type === 'success'"
        [class.text-green-800]="message()!.type === 'success'"
        [class.bg-red-50]="message()!.type === 'error'"
        [class.border-red-200]="message()!.type === 'error'"
        [class.text-red-800]="message()!.type === 'error'"
      >
        <div class="flex items-center space-x-2">
          <div class="flex-shrink-0">
            <lucide-angular 
              *ngIf="message()!.type === 'success'" 
              [img]="CheckIcon" 
              size="16"
              [class.text-green-600]="message()!.type === 'success'"
            ></lucide-angular>
            <lucide-angular 
              *ngIf="message()!.type === 'error'" 
              [img]="AlertCircleIcon" 
              size="16"
              [class.text-red-600]="message()!.type === 'error'"
            ></lucide-angular>
          </div>
          <span class="font-medium">{{ message()!.message }}</span>
        </div>
      </div>

      <!-- Profile Form -->
      <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-8">
        <!-- Basic Information -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <lucide-angular [img]="UserIcon" size="20" class="mr-2 text-blue-600"></lucide-angular>
            Basic Information
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- First Name -->
            <div>
              <label for="first_name" class="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                id="first_name"
                formControlName="first_name"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your first name"
              />
              <div *ngIf="profileForm.get('first_name')?.invalid && profileForm.get('first_name')?.touched" 
                   class="mt-1 text-sm text-red-600">
                First name is required
              </div>
            </div>

            <!-- Last Name -->
            <div>
              <label for="last_name" class="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                id="last_name"
                formControlName="last_name"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your last name"
              />
              <div *ngIf="profileForm.get('last_name')?.invalid && profileForm.get('last_name')?.touched" 
                   class="mt-1 text-sm text-red-600">
                Last name is required
              </div>
            </div>

            <!-- Profile Tag -->
            <div class="md:col-span-2">
              <label for="profile_tag" class="block text-sm font-medium text-gray-700 mb-2">
                Profile Tag
              </label>
              <input
                type="text"
                id="profile_tag"
                formControlName="profile_tag"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., @johndoe"
                maxlength="50"
              />
              <p class="mt-1 text-sm text-gray-500">A unique identifier for your profile</p>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <lucide-angular [img]="PhoneIcon" size="20" class="mr-2 text-green-600"></lucide-angular>
            Contact Information
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Mobile -->
            <div>
              <label for="mobile" class="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                id="mobile"
                formControlName="mobile"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <!-- Country -->
            <div>
              <label for="country" class="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                id="country"
                formControlName="country"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              >
                <option value="">Select a country</option>
                <option *ngFor="let country of countries()" [value]="country.value">
                  {{ country.label }}
                </option>
              </select>
              <div *ngIf="loadingCountries()" class="mt-2 flex items-center text-sm text-gray-500">
                <lucide-angular [img]="Loader2Icon" size="14" class="mr-2 animate-spin"></lucide-angular>
                Loading countries...
              </div>
            </div>

            <!-- Address -->
            <div class="md:col-span-2">
              <label for="address" class="block text-sm font-medium text-gray-700 mb-2">
                <lucide-angular [img]="MapPinIcon" size="16" class="inline mr-1"></lucide-angular>
                Address
              </label>
              <textarea
                id="address"
                formControlName="address"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Enter your full address"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Bio Section -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <lucide-angular [img]="FileTextIcon" size="20" class="mr-2 text-purple-600"></lucide-angular>
            About Me
          </h2>
          
          <div>
            <label for="bio" class="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              formControlName="bio"
              rows="5"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              placeholder="Tell us about yourself, your experience, and what you're looking for..."
              maxlength="500"
            ></textarea>
            <div class="mt-1 flex justify-between items-center">
              <p class="text-sm text-gray-500">Share your professional story and aspirations</p>
              <span class="text-sm text-gray-400">
                {{ (profileForm.get('bio')?.value || '').length }}/500
              </span>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            (click)="navigateBack()"
            class="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="profileForm.invalid || isSubmitting()"
            class="inline-flex items-center px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <lucide-angular 
              *ngIf="!isSubmitting()" 
              [img]="SaveIcon" 
              size="16" 
              class="mr-2"
            ></lucide-angular>
            <lucide-angular 
              *ngIf="isSubmitting()" 
              [img]="Loader2Icon" 
              size="16" 
              class="mr-2 animate-spin"
            ></lucide-angular>
            {{ isSubmitting() ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
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
export class EditProfileComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly userStore = inject(UserStore);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);
  private readonly destroy$ = new Subject<void>();

  // Icons
  readonly SaveIcon = Save;
  readonly XIcon = X;
  readonly UserIcon = User;
  readonly MailIcon = Mail;
  readonly PhoneIcon = Phone;
  readonly MapPinIcon = MapPin;
  readonly FileTextIcon = FileText;
  readonly Loader2Icon = Loader2;
  readonly AlertCircleIcon = AlertCircle;
  readonly CheckIcon = Check;

  // Signals
  readonly countries = signal<Country[]>([]);
  readonly loadingCountries = signal(false);
  readonly isSubmitting = signal(false);
  readonly message = signal<UserMessage | null>(null);

  // Computed
  readonly currentUser = computed(() => this.userStore.currentUser());

  // Form
  profileForm: FormGroup;

  constructor() {
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      bio: ['', [Validators.maxLength(1000)]],
      mobile: [''],
      address: [''],
      country: [''],
      profile_tag: ['', [Validators.maxLength(50)]],
    });
  }

  ngOnInit(): void {
    this.loadCountries();
    this.loadCurrentUserData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCountries(): void {
    this.loadingCountries.set(true);
    
    const countriesUrl = `${this.configService.getApiBaseUrl()}/resources/countries`;
    
    this.http.get<CountryResponse>(countriesUrl)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Failed to load countries:', error);
          this.showMessage('error', 'Failed to load countries. Please try again.');
          return of({ countries: [] });
        })
      )
      .subscribe(response => {
        this.countries.set(response.countries || []);
        this.loadingCountries.set(false);
      });
  }

  private loadCurrentUserData(): void {
    // First try to load from current user in store
    const user = this.currentUser();
    if (user) {
      // We need to load the full profile data from the API to get bio, mobile, address, country
      this.loadUserProfileFromApi();
    } else {
      // If no current user, redirect to login or show error
      this.showMessage('error', 'No user data available. Please log in again.');
    }
  }

  private loadUserProfileFromApi(): void {
    const authToken = this.getAuthToken();
    if (!authToken) {
      this.showMessage('error', 'Authentication required. Please log in again.');
      return;
    }

    const headers = { 'Authorization': authToken };
    const profileUrl = `${this.configService.getApiBaseUrl()}/users/me`;

    this.http.get<any>(profileUrl, { headers })
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Failed to load profile data:', error);
          this.showMessage('error', 'Failed to load profile data. Using available information.');
          
          // Fallback to loading from current user
          const user = this.currentUser();
          if (user) {
            this.profileForm.patchValue({
              first_name: user.first_name || '',
              last_name: user.last_name || '',
              bio: '',
              mobile: '',
              address: '',
              country: '',
              profile_tag: user.profile_tag || '',
            });
          }
          return of(null);
        })
      )
      .subscribe(profileData => {
        if (profileData) {
          this.profileForm.patchValue({
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            bio: profileData.bio || '',
            mobile: profileData.mobile || '',
            address: profileData.address || '',
            country: profileData.country || '',
            profile_tag: profileData.profile_tag || '',
          });
        }
      });
  }

  private getAuthToken(): string | null {
    try {
      const storedToken = localStorage.getItem('access_token');
      const storedTokenType = localStorage.getItem('token_type');
      
      if (storedToken && storedTokenType) {
        return `${storedTokenType} ${storedToken}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
    return null;
  }

  onSubmit(): void {
    if (this.profileForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);
      
      const formValue = this.profileForm.value;
      const updateDto: UpdateUserProfileDto = {
        first_name: formValue.first_name?.trim(),
        last_name: formValue.last_name?.trim(),
        bio: formValue.bio?.trim() || undefined,
        mobile: formValue.mobile?.trim() || undefined,
        address: formValue.address?.trim() || undefined,
        country: formValue.country || undefined,
        profile_tag: formValue.profile_tag?.trim() || undefined,
      };

      // Remove empty strings and convert to undefined
      Object.keys(updateDto).forEach(key => {
        const value = updateDto[key as keyof UpdateUserProfileDto];
        if (value === '') {
          (updateDto as any)[key] = undefined;
        }
      });

      // Call the update method from UserStore
      // Note: We'll need to add this method to the UserStore
      this.updateUserProfile(updateDto);
    } else {
      this.markFormGroupTouched();
    }
  }

  private updateUserProfile(updateDto: UpdateUserProfileDto): void {
    this.userStore.updateCurrentUserProfile(updateDto)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Failed to update profile:', error);
          this.showMessage('error', 'Failed to update profile. Please try again.');
          this.isSubmitting.set(false);
          return of(null);
        })
      )
      .subscribe(updatedUser => {
        if (updatedUser) {
          this.isSubmitting.set(false);
          this.showMessage('success', 'Profile updated successfully!');
          
          // Navigate back after a brief delay
          setTimeout(() => {
            this.navigateBack();
          }, 1500);
        }
      });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });
  }

  private showMessage(type: 'success' | 'error', message: string): void {
    this.message.set({ type, message });
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        this.message.set(null);
      }, 5000);
    }
  }

  navigateBack(): void {
    this.router.navigate(['/app/profile']);
  }
}
