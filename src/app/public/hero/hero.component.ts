import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  Search,
  MapPin,
  Users,
  Briefcase,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Globe,
  Shield,
  Zap,
  Award,
  Building2,
  Star,
  ChevronRight,
  PlayCircle,
  Calendar,
  Clock,
  Target,
} from 'lucide-angular';

interface Statistic {
  value: string;
  label: string;
  icon: any;
}

interface Feature {
  title: string;
  description: string;
  icon: any;
}

interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-background-main">
      <!-- Hero Section -->
      <section class="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
        <!-- Background Pattern -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div class="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div class="text-center">
            <!-- Main Headline -->
            <h1 class="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Find Your 
              <span class="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Dream Career
              </span>
            </h1>
            
            <!-- Subheadline -->
            <p class="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Connect with global opportunities from top companies worldwide. 
              Your next career milestone starts here.
            </p>
            
            <!-- Search Bar -->
            <div class="max-w-4xl mx-auto mb-12">
              <div class="bg-white rounded-2xl shadow-elegant-lg p-2">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <!-- Job Search -->
                  <div class="relative">
                    <lucide-angular
                      [img]="SearchIcon"
                      size="20"
                      class="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary"
                    ></lucide-angular>
                    <input
                      type="text"
                      placeholder="Job title or keyword"
                      [(ngModel)]="searchQuery"
                      class="w-full pl-12 pr-4 py-4 text-text-primary placeholder-text-muted border-0 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  
                  <!-- Location -->
                  <div class="relative">
                    <lucide-angular
                      [img]="MapPinIcon"
                      size="20"
                      class="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary"
                    ></lucide-angular>
                    <input
                      type="text"
                      placeholder="Location or remote"
                      [(ngModel)]="locationQuery"
                      class="w-full pl-12 pr-4 py-4 text-text-primary placeholder-text-muted border-0 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  
                  <!-- Search Button -->
                  <button
                    (click)="onSearch()"
                    class="bg-primary-900 hover:bg-primary-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <lucide-angular [img]="SearchIcon" size="20"></lucide-angular>
                    Search Jobs
                  </button>
                </div>
              </div>
              
              <!-- Popular Searches -->
              <div class="mt-6 text-center">
                <p class="text-white/80 text-sm mb-3">Popular searches:</p>
                <div class="flex flex-wrap justify-center gap-2">
                  <button
                    *ngFor="let term of popularSearches"
                    (click)="setSearchTerm(term)"
                    class="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full text-sm font-medium transition-all duration-200 backdrop-blur-sm"
                  >
                    {{ term }}
                  </button>
                </div>
              </div>
            </div>
            
            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                (click)="navigateToJobs()"
                class="bg-white text-primary-900 font-bold py-4 px-8 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Browse All Jobs
                <lucide-angular [img]="ArrowRightIcon" size="20"></lucide-angular>
              </button>
              
              <button
                (click)="playVideo()"
                class="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-xl hover:bg-white hover:text-primary-900 transition-all duration-300 flex items-center gap-2"
              >
                <lucide-angular [img]="PlayCircleIcon" size="20"></lucide-angular>
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Statistics Section -->
      <section class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div
              *ngFor="let stat of statistics"
              class="text-center group cursor-pointer"
            >
              <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-900 rounded-2xl mb-4 group-hover:bg-primary-900 group-hover:text-white transition-all duration-300">
                <lucide-angular [img]="stat.icon" size="32"></lucide-angular>
              </div>
              <div class="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                {{ stat.value }}
              </div>
              <div class="text-text-secondary font-medium">
                {{ stat.label }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-20 bg-background-main">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Why Choose 
              <span class="text-primary-900">JobsGlobal</span>?
            </h2>
            <p class="text-xl text-text-secondary max-w-3xl mx-auto">
              We're revolutionizing how professionals connect with opportunities. 
              Experience the future of job searching.
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              *ngFor="let feature of features"
              class="bg-white rounded-2xl p-8 shadow-elegant hover:shadow-elegant-lg transition-all duration-300 group cursor-pointer transform hover:-translate-y-1"
            >
              <div class="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-900 to-primary-700 text-white rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <lucide-angular [img]="feature.icon" size="24"></lucide-angular>
              </div>
              <h3 class="text-xl font-bold text-text-primary mb-4">
                {{ feature.title }}
              </h3>
              <p class="text-text-secondary leading-relaxed">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works Section -->
      <section class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              How It Works
            </h2>
            <p class="text-xl text-text-secondary max-w-2xl mx-auto">
              Land your dream job in three simple steps
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              *ngFor="let step of steps; let i = index"
              class="text-center relative"
            >
              <!-- Step Number -->
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-900 to-primary-700 text-white text-2xl font-bold rounded-full mb-6">
                {{ i + 1 }}
              </div>
              
              <!-- Arrow (except for last item) -->
              <div
                *ngIf="i < steps.length - 1"
                class="hidden md:block absolute top-8 left-1/2 transform translate-x-8 text-primary-300"
              >
                <lucide-angular [img]="ChevronRightIcon" size="24"></lucide-angular>
              </div>
              
              <h3 class="text-xl font-bold text-text-primary mb-4">
                {{ step.title }}
              </h3>
              <p class="text-text-secondary">
                {{ step.description }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section class="py-20 bg-background-main">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Success Stories
            </h2>
            <p class="text-xl text-text-secondary max-w-2xl mx-auto">
              Join thousands of professionals who found their perfect match
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              *ngFor="let testimonial of testimonials"
              class="bg-white rounded-2xl p-8 shadow-elegant hover:shadow-elegant-lg transition-all duration-300"
            >
              <!-- Rating Stars -->
              <div class="flex items-center mb-4">
                <div class="flex">
                  <lucide-angular
                    *ngFor="let star of getStars(testimonial.rating)"
                    [img]="StarIcon"
                    size="16"
                    class="text-yellow-500"
                  ></lucide-angular>
                </div>
              </div>
              
              <blockquote class="text-text-secondary mb-6 italic">
                "{{ testimonial.content }}"
              </blockquote>
              
              <div class="flex items-center">
                <div class="w-12 h-12 bg-gradient-to-br from-primary-900 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  {{ testimonial.name.charAt(0) }}
                </div>
                <div>
                  <div class="font-semibold text-text-primary">
                    {{ testimonial.name }}
                  </div>
                  <div class="text-sm text-text-secondary">
                    {{ testimonial.role }} at {{ testimonial.company }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Call-to-Action Section -->
      <section class="py-20 bg-gradient-to-r from-primary-900 to-primary-700">
        <div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p class="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join millions of professionals who trust JobsGlobal to advance their careers. 
            Your future starts with a single click.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              (click)="navigateToJobs()"
              class="bg-white text-primary-900 font-bold py-4 px-8 rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Start Your Journey
              <lucide-angular [img]="ArrowRightIcon" size="20"></lucide-angular>
            </button>
            
            <button
              (click)="navigateToRegister()"
              class="bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-xl hover:bg-white hover:text-primary-900 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .gradient-text {
      background: linear-gradient(135deg, #990000, #B22222);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    .floating {
      animation: float 3s ease-in-out infinite;
    }
    
    .hero-pattern {
      background-image: 
        radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%);
    }
  `]
})
export class HeroComponent implements OnInit, OnDestroy {
  // Icons
  readonly SearchIcon = Search;
  readonly MapPinIcon = MapPin;
  readonly UsersIcon = Users;
  readonly BriefcaseIcon = Briefcase;
  readonly TrendingUpIcon = TrendingUp;
  readonly CheckCircleIcon = CheckCircle;
  readonly ArrowRightIcon = ArrowRight;
  readonly GlobeIcon = Globe;
  readonly ShieldIcon = Shield;
  readonly ZapIcon = Zap;
  readonly AwardIcon = Award;
  readonly Building2Icon = Building2;
  readonly StarIcon = Star;
  readonly ChevronRightIcon = ChevronRight;
  readonly PlayCircleIcon = PlayCircle;
  readonly CalendarIcon = Calendar;
  readonly ClockIcon = Clock;
  readonly TargetIcon = Target;

  // Form data
  searchQuery = signal('');
  locationQuery = signal('');

  // Data
  popularSearches = [
    'Software Engineer',
    'Data Scientist',
    'Product Manager',
    'UX Designer',
    'Marketing Manager',
    'Sales Representative'
  ];

  statistics: Statistic[] = [
    {
      value: '50K+',
      label: 'Active Jobs',
      icon: this.BriefcaseIcon
    },
    {
      value: '100K+',
      label: 'Happy Candidates',
      icon: this.UsersIcon
    },
    {
      value: '5K+',
      label: 'Top Companies',
      icon: this.Building2Icon
    },
    {
      value: '95%',
      label: 'Success Rate',
      icon: this.TrendingUpIcon
    }
  ];

  features: Feature[] = [
    {
      title: 'Global Opportunities',
      description: 'Access job opportunities from companies worldwide, including remote positions and international relocations.',
      icon: this.GlobeIcon
    },
    {
      title: 'AI-Powered Matching',
      description: 'Our advanced AI analyzes your skills and preferences to recommend the most suitable positions.',
      icon: this.ZapIcon
    },
    {
      title: 'Secure & Private',
      description: 'Your personal information is protected with enterprise-grade security and privacy measures.',
      icon: this.ShieldIcon
    },
    {
      title: 'Expert Career Support',
      description: 'Get personalized career advice and interview preparation from industry experts.',
      icon: this.AwardIcon
    },
    {
      title: 'Real-Time Updates',
      description: 'Receive instant notifications about new job matches and application status updates.',
      icon: this.ClockIcon
    },
    {
      title: 'Precision Targeting',
      description: 'Advanced filters help you find exactly what you\'re looking for, saving time and effort.',
      icon: this.TargetIcon
    }
  ];

  steps = [
    {
      title: 'Create Your Profile',
      description: 'Build a compelling profile that showcases your skills, experience, and career goals.'
    },
    {
      title: 'Discover Opportunities',
      description: 'Browse thousands of job listings or let our AI recommend perfect matches for you.'
    },
    {
      title: 'Land Your Dream Job',
      description: 'Apply with confidence and get hired by top companies around the world.'
    }
  ];

  testimonials: Testimonial[] = [
    {
      name: 'Sarah Chen',
      role: 'Senior Developer',
      company: 'Tech Innovations Inc.',
      content: 'JobsGlobal helped me transition from a local startup to a global tech company. The platform\'s AI matching was incredibly accurate!',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      role: 'Product Manager',
      company: 'Digital Solutions Ltd.',
      content: 'I found my dream remote position within two weeks. The quality of opportunities on JobsGlobal is unmatched.',
      rating: 5
    },
    {
      name: 'Elena Rodriguez',
      role: 'UX Designer',
      company: 'Creative Studio Co.',
      content: 'The career support team provided excellent guidance throughout my job search. Highly recommend this platform!',
      rating: 5
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialize component
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  onSearch(): void {
    if (this.searchQuery() || this.locationQuery()) {
      this.router.navigate(['/app/jobs'], {
        queryParams: {
          search: this.searchQuery(),
          location: this.locationQuery()
        }
      });
    } else {
      this.navigateToJobs();
    }
  }

  setSearchTerm(term: string): void {
    this.searchQuery.set(term);
    this.onSearch();
  }

  navigateToJobs(): void {
    this.router.navigate(['/app/jobs']);
  }

  navigateToRegister(): void {
    // For now, navigate to jobs since register component doesn't exist yet
    // TODO: Create register component and update this
    this.router.navigate(['/app/jobs']);
  }

  playVideo(): void {
    // Implement video modal or redirect to video
    console.log('Playing demo video...');
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }
}
