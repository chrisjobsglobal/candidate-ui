import { Component, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Upload,
  FileText,
  CheckCircle,
  ArrowLeft,
} from 'lucide-angular';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LucideAngularModule,
    RouterModule,
  ],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-background-main to-background-subtle flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
    >
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <!-- Back to Home -->
        <div class="flex items-start justify-start absolute top-4 left-4">
          <button
            (click)="navigateHome()"
            class="flex items-center text-text-secondary hover:text-text-primary transition-colors group"
          >
            <lucide-angular
              [img]="ArrowLeftIcon"
              size="20"
              class="mr-2 group-hover:-translate-x-1 transition-transform"
            ></lucide-angular>
            Back to Home
          </button>
        </div>

      <div class="max-w-md w-full space-y-8 relative z-10">
        

        <!-- Header -->
        <div class="text-center">
          <img
            src="/logo_red.png"
            alt="JobsGlobal"
            class="h-12 w-auto mx-auto mb-6"
          />
          <h2 class="text-3xl font-bold text-text-primary mb-2">
            Join JobsGlobal
          </h2>
          <p class="text-text-secondary">
            Create your account and upload your CV to get started
          </p>
        </div>

        <!-- Register Form -->
        <div class="bg-white rounded-2xl shadow-elegant p-8">
          <!-- CV Upload Dropzone -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-text-primary mb-2">
              Upload Your CV (Optional)
            </label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center transition-all duration-200 hover:border-primary-400 hover:bg-gray-50 cursor-pointer"
              [class.border-primary-500]="isDragOver()"
              [class.bg-primary-50]="isDragOver()"
              [class.border-green-500]="uploadedFile()"
              [class.bg-green-50]="uploadedFile()"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
              (click)="fileInput.click()"
            >
              <input
                #fileInput
                type="file"
                class="hidden"
                accept=".pdf,.doc,.docx"
                (change)="onFileSelect($event)"
              />

              <!-- Upload Icon and Text -->
              <div *ngIf="!uploadedFile() && !isUploading()">
                <lucide-angular
                  [img]="UploadIcon"
                  size="24"
                  class="mx-auto text-gray-400 mb-2"
                ></lucide-angular>
                <p class="text-sm text-text-secondary mb-1">
                  <span class="font-medium text-primary-600"
                    >Click to upload</span
                  >
                  or drag and drop
                </p>
                <p class="text-xs text-text-muted">PDF, DOC, DOCX (max 10MB)</p>
              </div>

              <!-- Uploading State -->
              <div *ngIf="isUploading()" class="flex flex-col items-center">
                <div
                  class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mb-2"
                ></div>
                <p class="text-sm text-text-secondary">Uploading...</p>
              </div>

              <!-- Uploaded File -->
              <div
                *ngIf="uploadedFile() && !isUploading()"
                class="flex items-center justify-center space-x-2"
              >
                <lucide-angular
                  [img]="CheckCircleIcon"
                  size="20"
                  class="text-green-600"
                ></lucide-angular>
                <div class="text-left">
                  <p class="text-sm font-medium text-text-primary">
                    {{ uploadedFile()?.name }}
                  </p>
                  <p class="text-xs text-text-muted">
                    {{ formatFileSize(uploadedFile()?.size || 0) }}
                  </p>
                </div>
                <button
                  type="button"
                  (click)="removeFile($event)"
                  class="text-red-500 hover:text-red-700 transition-colors"
                >
                  <lucide-angular [img]="XIcon" size="14"></lucide-angular>
                </button>
              </div>
            </div>
            <p class="text-xs text-text-muted mt-1">
              Upload your CV to help employers find you faster
            </p>
          </div>

          <form
            [formGroup]="registerForm"
            (ngSubmit)="onSubmit()"
            class="space-y-6"
          >
            <!-- Full Name -->
            <div>
              <label class="block text-sm font-medium text-text-primary mb-2">
                Full Name *
              </label>
              <div class="relative">
                <lucide-angular
                  [img]="UserIcon"
                  size="20"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                ></lucide-angular>
                <input
                  type="text"
                  formControlName="fullName"
                  autocomplete="name"
                  placeholder="Enter your full name"
                  class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  [class.border-red-500]="
                    registerForm.get('fullName')?.invalid &&
                    registerForm.get('fullName')?.touched
                  "
                />
              </div>
              <div
                *ngIf="
                  registerForm.get('fullName')?.invalid &&
                  registerForm.get('fullName')?.touched
                "
                class="text-red-500 text-sm mt-1"
              >
                Full name is required
              </div>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-text-primary mb-2">
                Email Address *
              </label>
              <div class="relative">
                <lucide-angular
                  [img]="MailIcon"
                  size="20"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                ></lucide-angular>
                <input
                  type="email"
                  formControlName="email"
                  autocomplete="email"
                  placeholder="Enter your email"
                  class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  [class.border-red-500]="
                    registerForm.get('email')?.invalid &&
                    registerForm.get('email')?.touched
                  "
                />
              </div>
              <div
                *ngIf="
                  registerForm.get('email')?.invalid &&
                  registerForm.get('email')?.touched
                "
                class="text-red-500 text-sm mt-1"
              >
                <span *ngIf="registerForm.get('email')?.errors?.['required']"
                  >Email is required</span
                >
                <span *ngIf="registerForm.get('email')?.errors?.['email']"
                  >Please enter a valid email</span
                >
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-medium text-text-primary mb-2">
                Password *
              </label>
              <div class="relative">
                <lucide-angular
                  [img]="LockIcon"
                  size="20"
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                ></lucide-angular>
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Create a password"
                  autocomplete="new-password"
                  class="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  [class.border-red-500]="
                    registerForm.get('password')?.invalid &&
                    registerForm.get('password')?.touched
                  "
                />
                <button
                  type="button"
                  (click)="togglePasswordVisibility()"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                >
                  <lucide-angular
                    [img]="showPassword() ? EyeOffIcon : EyeIcon"
                    size="20"
                  ></lucide-angular>
                </button>
              </div>
              <div
                *ngIf="
                  registerForm.get('password')?.invalid &&
                  registerForm.get('password')?.touched
                "
                class="text-red-500 text-sm mt-1"
              >
                Password must be at least 6 characters
              </div>
            </div>

            <!-- Terms Checkbox -->
            <div class="flex items-start space-x-3">
              <input
                type="checkbox"
                formControlName="acceptTerms"
                id="acceptTerms"
                class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label for="acceptTerms" class="text-sm text-text-secondary">
                I agree to the
                <a href="#" class="text-primary-600 hover:text-primary-800"
                  >Terms of Service</a
                >
                and
                <a href="#" class="text-primary-600 hover:text-primary-800"
                  >Privacy Policy</a
                >
              </label>
            </div>
            <div
              *ngIf="
                registerForm.get('acceptTerms')?.invalid &&
                registerForm.get('acceptTerms')?.touched
              "
              class="text-red-500 text-sm -mt-4"
            >
              You must accept the terms and conditions
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="registerForm.invalid || isLoading()"
              class="w-full bg-primary-900 hover:bg-primary-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span
                *ngIf="isLoading()"
                class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
              ></span>
              {{ isLoading() ? 'Creating Account...' : 'Create Account' }}
            </button>
          </form>

          <!-- Login Link -->
          <div class="text-center mt-6">
            <p class="text-text-secondary">
              Already have an account?
              <a
                routerLink="/login"
                class="font-medium text-primary-600 hover:text-primary-500 transition-colors ml-1"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center text-sm text-text-muted">
          <p>
            By signing up, you agree to our
            <a
              href="#"
              class="text-primary-600 hover:text-primary-500 transition-colors"
              >Terms of Service</a
            >
            and
            <a
              href="#"
              class="text-primary-600 hover:text-primary-500 transition-colors"
              >Privacy Policy</a
            >
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class RegisterComponent {
  // Icons
  readonly UserIcon = User;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly XIcon = X;
  readonly UploadIcon = Upload;
  readonly FileTextIcon = FileText;
  readonly CheckCircleIcon = CheckCircle;
  readonly ArrowLeftIcon = ArrowLeft;

  // Signals
  showPassword = signal(false);
  isLoading = signal(false);
  isDragOver = signal(false);
  isUploading = signal(false);
  uploadedFile = signal<File | null>(null);

  // Events
  @Output() closeModal = new EventEmitter<void>();
  @Output() switchToLoginEvent = new EventEmitter<void>();
  @Output() registrationSuccess = new EventEmitter<any>();

  // Form
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      acceptTerms: [false, [Validators.requiredTrue]],
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }

  switchToLogin(): void {
    this.router.navigate(['/login']);
  }

  async onSubmit(): Promise<void> {
    if (this.registerForm.valid) {
      this.isLoading.set(true);

      try {
        const formData = this.registerForm.value;
        const uploadedCV = this.uploadedFile();

        // TODO: Replace with actual API call
        console.log('Registering user:', formData);
        if (uploadedCV) {
          console.log('CV file:', uploadedCV.name, uploadedCV.size);
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Mock successful registration
        const userData = {
          id: Math.random().toString(36).substr(2, 9),
          fullName: formData.fullName,
          email: formData.email,
          hasCV: !!uploadedCV,
          cvFileName: uploadedCV?.name || null,
          registeredAt: new Date().toISOString(),
        };

        this.registrationSuccess.emit(userData);

        // Store user data temporarily (replace with actual auth service)
        localStorage.setItem('user', JSON.stringify(userData));

        // Navigate to jobs page
        this.router.navigate(['/app/jobs'], {
          queryParams: { newUser: 'true' },
        });
      } catch (error) {
        console.error('Registration error:', error);
        // TODO: Handle registration error
        alert('Registration failed. Please try again.');
      } finally {
        this.isLoading.set(false);
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.registerForm.controls).forEach((key) => {
        this.registerForm.get(key)?.markAsTouched();
      });
    }
  }

  // CV Upload Methods
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileUpload(files[0]);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFileUpload(input.files[0]);
    }
  }

  private async handleFileUpload(file: File): Promise<void> {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF, DOC, or DOCX file.');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      alert('File size must be less than 10MB.');
      return;
    }

    this.isUploading.set(true);

    try {
      // Simulate file upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // TODO: Replace with actual file upload to your server
      console.log('Uploading file:', file.name);

      this.uploadedFile.set(file);
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      this.isUploading.set(false);
    }
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.uploadedFile.set(null);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
