import {
  Component,
  signal,
  inject,
  ViewChild,
  ElementRef,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserStore } from '../store/user.store';
import { ConfigService } from '../../../core/services/config.service';
import { CoverPhotoCropperComponent, CropResult } from './cover-photo-cropper.component';
import { CustomProfileUrlComponent } from './custom-profile-url.component';
import {
  LucideAngularModule,
  Edit3,
  MapPin,
  Mail,
  Phone,
  Globe,
  Share2,
  Eye,
  Users,
  Briefcase,
  Funnel,
  Camera,
} from 'lucide-angular';

@Component({
  selector: 'app-profile-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, CoverPhotoCropperComponent, CustomProfileUrlComponent],
  template: `
    <!-- Hidden file input for avatar upload -->
    <input
      #fileInput
      type="file"
      accept="image/*"
      (change)="onAvatarFileSelected($event)"
      style="display: none;"
    />

    <!-- Hidden file input for cover photo upload -->
    <input
      #coverPhotoFileInput
      type="file"
      accept="image/*"
      (change)="onCoverPhotoFileSelected($event)"
      style="display: none;"
    />

    <!-- Profile Header -->
    <div class="bg-white rounded-2xl shadow-elegant overflow-hidden">
      <!-- Cover Photo -->
      <div 
        class="h-48 lg:h-56 relative group cursor-pointer overflow-hidden"
        [class.bg-gradient-to-r]="!currentUser()?.coverPhoto"
        [class.from-gray-950]="!currentUser()?.coverPhoto"
        [class.to-gray-800]="!currentUser()?.coverPhoto"
        (click)="triggerCoverPhotoUpload()"
      >
        <!-- Cover photo image -->
        <img
          *ngIf="currentUser()?.coverPhoto"
          [src]="currentUser()!.coverPhoto"
          alt="Cover Photo"
          class="absolute inset-0 w-full h-full object-cover"
          (error)="onImageError($event)"
        />
        
        <!-- Cover photo upload overlay -->
        <div
          *ngIf="!isUploadingCoverPhoto()"
          class="absolute inset-0 bg-black/20 hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <div class="text-center text-white">
            <lucide-angular [img]="CameraIcon" size="32" class="mx-auto mb-2"></lucide-angular>
            <span class="text-sm font-medium">{{ currentUser()?.coverPhoto ? 'Change Cover Photo' : 'Add Cover Photo' }}</span>
          </div>
        </div>

        <!-- Loading indicator for cover photo upload -->
        <div
          *ngIf="isUploadingCoverPhoto()"
          class="absolute inset-0 bg-black/50 flex items-center justify-center"
        >
          <div class="text-center text-white">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <span class="text-sm font-medium">Uploading...</span>
          </div>
        </div>

        <button
          class="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-all duration-200 backdrop-blur-sm"
          (click)="$event.stopPropagation(); triggerCoverPhotoUpload()"
          [disabled]="isUploadingCoverPhoto()"
        >
          <lucide-angular [img]="Edit3Icon" size="16"></lucide-angular>
        </button>
      </div>

      <!-- Profile Info -->
      <div class="relative px-6 lg:px-8 pb-8 -mt-24">
        <!-- Profile Picture and Info -->
        <div class="flex flex-col lg:flex-row lg:items-end space-y-6 lg:space-y-0 lg:space-x-8 ">
          <div class="relative flex-shrink-0 self-center lg:self-auto">
            <div
              class="w-32 h-32 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full border-4 border-white flex items-center justify-center overflow-hidden group cursor-pointer shadow-xl "
              (click)="triggerAvatarUpload()"
            >

              <img
                *ngIf="currentUser()?.profilePicture"
                [src]="currentUser()!.profilePicture"
                alt="Profile Picture"
                class="w-full h-full object-cover"
                (error)="onImageError($event)"
              />
              <span
                *ngIf="!currentUser()?.profilePicture"
                class="text-4xl font-bold text-white"
                >{{ getUserInitials() }}</span
              >

              <!-- Upload overlay -->
              <div
                class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
              >
                <lucide-angular
                  [img]="CameraIcon"
                  size="24"
                  class="text-white mt-3"
                ></lucide-angular>
              </div>
            </div>

            <!-- Loading indicator for avatar upload -->
            <div
              *ngIf="isUploadingAvatar()"
              class="absolute inset-0 w-32 h-32 bg-black/50 rounded-full flex items-center justify-center"
            >
              <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"
              ></div>
            </div>

            <button
              (click)="triggerAvatarUpload()"
              class="absolute bottom-0 right-0 p-2.5 bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100"
              [disabled]="isUploadingAvatar()"
            >
              <lucide-angular
                [img]="CameraIcon"
                size="14"
                class="text-gray-600"
              ></lucide-angular>
            </button>
          </div>

          <div class="flex-1 pl-6">
            <div class="flex flex-col h-full">
              <!-- Main Info Section -->
              <div class="flex flex-wrap items-start justify-center mb-6">
                <div class="flex-1">
                  <h1 class="text-4xl md:text-5xl font-bold text-gray-900 lg:text-white  leading-tight whitespace-nowrap">
                    {{ getUserFullName() }}
                  </h1>
                  <p class="text-xl text-gray-600 font-medium ">
                    Senior Software Engineer
                  </p>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex items-center space-x-3 ml-6 mt-4">
                  <button
                    class="flex items-center space-x-2 px-4 py-2.5 border border-gray-300 text-gray-700 bg-gray-100 hover:bg-gray-50 rounded-lg transition-all duration-200"
                  >
                    <lucide-angular
                      [img]="EyeIcon"
                      size="16"
                    ></lucide-angular>
                    <span class="font-medium">{{ profileStats().views }}</span>
                  </button>
                  <button
                    class="flex items-center space-x-2 px-4 py-2.5 border border-gray-300 text-gray-700 bg-gray-100 hover:bg-gray-50 rounded-lg transition-all duration-200"
                  >
                    <lucide-angular
                      [img]="Share2Icon"
                      size="16"
                    ></lucide-angular>
                    <span class="font-medium">Share</span>
                  </button>
                  <button
                    class="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-semibold shadow-lg whitespace-nowrap"
                    (click)="onEditProfile()"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>

              <!-- Stats Section -->
              <div class="flex flex-wrap items-center gap-x-8 gap-y-3 mt-auto">
                <div class="flex items-center space-x-2">
                  <lucide-angular
                    [img]="MapPinIcon"
                    size="16"
                    class="text-green-600"
                  ></lucide-angular>
                  <span class="text-gray-700 font-medium">San Francisco, CA</span>
                </div>
                <div class="flex items-center space-x-2">
                  <lucide-angular
                    [img]="UsersIcon"
                    size="16"
                    class="text-blue-600"
                  ></lucide-angular>
                  <span class="text-gray-700 font-medium">{{ profileStats().connections }} connections</span>
                </div>
                <div class="flex items-center space-x-2">
                  <lucide-angular
                    [img]="BriefcaseIcon"
                    size="16"
                    class="text-amber-600"
                  ></lucide-angular>
                  <span class="text-gray-700 font-medium">4 active applications</span>
                </div>
                <div class="flex items-center space-x-2">
                  <lucide-angular
                    [img]="FunnelIcon"
                    size="16"
                    class="text-purple-600"
                  ></lucide-angular>
                  <span class="text-gray-700 font-medium">1 shortlisted</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200">
          <div class="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-colors">
            <div class="p-2 bg-gray-100 rounded-lg">
              <lucide-angular [img]="MailIcon" size="16"></lucide-angular>
            </div>
            <span class="font-medium">{{ currentUser()?.email || 'john.doe@email.com' }}</span>
          </div>
          <div class="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-colors">
            <div class="p-2 bg-gray-100 rounded-lg">
              <lucide-angular [img]="PhoneIcon" size="16"></lucide-angular>
            </div>
            <span class="font-medium">+1 (555) 123-4567</span>
          </div>
          <div class="flex items-center space-x-3 text-gray-600 hover:text-gray-900 transition-colors">
            <div class="p-2 bg-gray-100 rounded-lg">
              <lucide-angular [img]="GlobeIcon" size="16"></lucide-angular>
            </div>
            <span class="font-medium">johndoe.dev</span>
          </div>
        </div>

        <!-- Custom Profile URL Component -->
        <app-custom-profile-url></app-custom-profile-url>
      </div>
    </div>

    <!-- Cover Photo Cropper Modal -->
    <app-cover-photo-cropper
      *ngIf="showCoverPhotoCropper() && coverPhotoForCropping()"
      [imageUrl]="coverPhotoForCropping()!.url"
      [originalFile]="coverPhotoForCropping()!.file"
      (cropComplete)="onCoverPhotoCropComplete($event)"
      (cropCancel)="onCoverPhotoCropCancel()"
    ></app-cover-photo-cropper>
  `,
})
export class ProfileHeaderComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('coverPhotoFileInput') coverPhotoFileInput!: ElementRef<HTMLInputElement>;

  // Inputs
  profileStats = input({
    views: 142,
    connections: 89,
    profileStrength: 85,
  });

  // Outputs
  editProfile = output<void>();
  uploadMessage = output<{ type: 'success' | 'error'; message: string }>();

  private readonly userStore = inject(UserStore);
  private readonly configService = inject(ConfigService);

  readonly Edit3Icon = Edit3;
  readonly MapPinIcon = MapPin;
  readonly MailIcon = Mail;
  readonly PhoneIcon = Phone;
  readonly GlobeIcon = Globe;
  readonly Share2Icon = Share2;
  readonly EyeIcon = Eye;
  readonly UsersIcon = Users;
  readonly BriefcaseIcon = Briefcase;
  readonly FunnelIcon = Funnel;
  readonly CameraIcon = Camera;

  // Current user from store
  readonly currentUser = this.userStore.currentUser;

  // Upload states
  readonly isUploadingAvatar = signal(false);
  readonly isUploadingCoverPhoto = signal(false);

  // Cover photo cropping state
  readonly showCoverPhotoCropper = signal(false);
  readonly coverPhotoForCropping = signal<{ file: File; url: string } | null>(null);

  /**
   * Get user's full name
   */
  getUserFullName(): string {
    const user = this.currentUser();
    if (user) {
      return `${user.firstName} ${user.lastName}`;
    }
    return 'John Doe'; // Fallback
  }

  /**
   * Get user initials for avatar placeholder
   */
  getUserInitials(): string {
    const user = this.currentUser();
    if (user) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(
        0
      )}`.toUpperCase();
    }
    return 'JD'; // Fallback
  }

  /**
   * Trigger avatar upload file picker
   */
  triggerAvatarUpload(): void {
    if (this.isUploadingAvatar()) return;
    this.fileInput.nativeElement.click();
  }

  /**
   * Handle avatar file selection
   */
  onAvatarFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.emitUploadMessage('error', 'Please select a valid image file.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      this.emitUploadMessage('error', 'File size must be less than 5MB.');
      return;
    }

    this.uploadAvatar(file);
  }

  /**
   * Upload avatar file
   */
  private uploadAvatar(file: File): void {
    this.isUploadingAvatar.set(true);

    this.userStore.uploadUserAvatar(file).subscribe({
      next: (response) => {
        if (response.success) {
          this.emitUploadMessage(
            'success',
            response.message || 'Avatar updated successfully!'
          );
        } else {
          this.emitUploadMessage(
            'error',
            'Failed to upload avatar. Please try again.'
          );
        }
      },
      error: (error) => {
        console.error('Avatar upload failed:', error);
        const errorMessage =
          error.error?.detail ||
          error.message ||
          'Failed to upload avatar. Please try again.';
        this.emitUploadMessage('error', errorMessage);
      },
      complete: () => {
        this.isUploadingAvatar.set(false);
        // Clear the file input
        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }
      },
    });
  }

  /**
   * Trigger cover photo upload file picker
   */
  triggerCoverPhotoUpload(): void {
    if (this.isUploadingCoverPhoto()) return;
    this.coverPhotoFileInput.nativeElement.click();
  }

  /**
   * Handle cover photo file selection
   */
  onCoverPhotoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.emitUploadMessage('error', 'Please select a valid image file.');
      return;
    }

    // Validate file size (max 10MB for cover photos)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      this.emitUploadMessage('error', 'File size must be less than 10MB.');
      return;
    }

    // Create object URL for the cropper
    const imageUrl = URL.createObjectURL(file);
    this.coverPhotoForCropping.set({ file, url: imageUrl });
    this.showCoverPhotoCropper.set(true);

    // Clear the file input
    input.value = '';
  }

  /**
   * Handle cover photo crop completion
   */
  onCoverPhotoCropComplete(cropResult: CropResult): void {
    this.showCoverPhotoCropper.set(false);
    
    // Clean up the object URL
    const currentCrop = this.coverPhotoForCropping();
    if (currentCrop) {
      URL.revokeObjectURL(currentCrop.url);
    }
    this.coverPhotoForCropping.set(null);

    // Upload the cropped image
    this.uploadCoverPhoto(cropResult.croppedFile);
  }

  /**
   * Handle cover photo crop cancellation
   */
  onCoverPhotoCropCancel(): void {
    this.showCoverPhotoCropper.set(false);
    
    // Clean up the object URL
    const currentCrop = this.coverPhotoForCropping();
    if (currentCrop) {
      URL.revokeObjectURL(currentCrop.url);
    }
    this.coverPhotoForCropping.set(null);
  }

  /**
   * Upload cover photo file
   */
  private uploadCoverPhoto(file: File): void {
    this.isUploadingCoverPhoto.set(true);

    this.userStore.uploadUserCoverPhoto(file).subscribe({
      next: (response) => {
        if (response.success) {
          this.emitUploadMessage(
            'success',
            response.message || 'Cover photo updated successfully!'
          );
        } else {
          this.emitUploadMessage(
            'error',
            'Failed to upload cover photo. Please try again.'
          );
        }
      },
      error: (error) => {
        console.error('Cover photo upload failed:', error);
        const errorMessage =
          error.error?.detail ||
          error.message ||
          'Failed to upload cover photo. Please try again.';
        this.emitUploadMessage('error', errorMessage);
      },
      complete: () => {
        this.isUploadingCoverPhoto.set(false);
        // Clear the file input
        if (this.coverPhotoFileInput) {
          this.coverPhotoFileInput.nativeElement.value = '';
        }
      },
    });
  }

  /**
   * Handle image load error
   */
  onImageError(event: Event): void {
    console.error('Failed to load image:', event);
    const img = event.target as HTMLImageElement;
    console.error('Image src that failed:', img.src);
  }

  /**
   * Handle edit profile button click
   */
  onEditProfile(): void {
    this.editProfile.emit();
  }

  /**
   * Emit upload message to parent component
   */
  private emitUploadMessage(type: 'success' | 'error', message: string): void {
    this.uploadMessage.emit({ type, message });
  }
}