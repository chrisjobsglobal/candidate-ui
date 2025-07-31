import { Component, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavComponent } from '../nav/nav.component';
import { HeaderComponent } from './header/header.component';
import { JobMarqueeComponent } from './job-marquee/job-marquee.component';
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
  Heart,
  Filter,
  Rocket,
} from 'lucide-angular';

interface Statistic {
  value: string;
  label: string;
  icon?: any;
}

interface ValueProp {
  title: string;
  description: string;
  icon: any;
  points: string[];
  ctaText: string;
  ctaAction: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, NavComponent, HeaderComponent, JobMarqueeComponent],
  template: `
    <div class="min-h-screen bg-white">
      <!-- Navigation -->
      <app-nav></app-nav>

      <!-- Header Section -->
      <app-header></app-header>

      <!-- Job Marquee -->
      <app-job-marquee></app-job-marquee>

      <!-- Value Propositions -->
      <section class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <!-- Job Seekers -->
            <div
              *ngFor="let prop of valueProps"
              class="text-center lg:text-left"
            >
              <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-900 rounded-2xl mb-8">
                <lucide-angular [img]="prop.icon" size="32"></lucide-angular>
              </div>
              
              <h2 class="text-3xl md:text-4xl font-bold text-text-primary mb-6">
                {{ prop.title }}
              </h2>
              
              <p class="text-lg text-text-secondary mb-8 leading-relaxed">
                {{ prop.description }}
              </p>
              
              <ul class="space-y-4 mb-10">
                <li
                  *ngFor="let point of prop.points"
                  class="flex items-start gap-3"
                >
                  <lucide-angular
                    [img]="CheckCircleIcon"
                    size="20"
                    class="text-green-500 mt-1 flex-shrink-0"
                  ></lucide-angular>
                  <span class="text-text-secondary">{{ point }}</span>
                </li>
              </ul>
              
              <div class="flex flex-col sm:flex-row gap-4">
                <button
                  (click)="handleCTA(prop.ctaAction)"
                  class="bg-primary-900 text-white font-semibold py-4 px-8 rounded-xl hover:bg-primary-800 transition-colors flex items-center justify-center gap-2"
                >
                  {{ prop.ctaText }}
                  <lucide-angular [img]="ArrowRightIcon" size="20"></lucide-angular>
                </button>
                <button class="text-primary-900 font-semibold py-4 px-8 rounded-xl border border-primary-900 hover:bg-primary-50 transition-colors">
                  Learn more
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- AI Recruiter Feature -->
      <section class="py-20 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 class="text-4xl md:text-5xl font-bold text-text-primary mb-6">
                Meet JobsGlobal:AI<br>
                <span class="text-primary-900">Your AI recruiter.</span>
              </h2>
              
              <p class="text-xl text-text-secondary mb-8 leading-relaxed">
                Here to help with all the logistics. JobsGlobal:AI finds best fit candidates,
                vets for interest, and schedules your favorites on your calendar — all in a matter
                of days. It's that easy.
              </p>
              
              <button class="bg-primary-900 text-white font-semibold py-4 px-8 rounded-xl hover:bg-primary-800 transition-colors flex items-center gap-2">
                Learn more
                <lucide-angular [img]="ArrowRightIcon" size="20"></lucide-angular>
              </button>
            </div>
            
            <div class="relative">
              <div class="w-full h-80 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
                <lucide-angular [img]="RocketIcon" size="120" class="text-primary-900"></lucide-angular>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials -->
      <section class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-bold text-text-primary mb-6">
              From our users
            </h2>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              *ngFor="let testimonial of testimonials"
              class="bg-gray-50 rounded-2xl p-8"
            >
              <div class="flex items-center mb-6">
                <div class="w-12 h-12 bg-gradient-to-br from-primary-900 to-primary-700 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  {{ testimonial.name.charAt(0) }}
                </div>
                <div>
                  <div class="font-semibold text-text-primary">
                    {{ testimonial.name }}
                  </div>
                  <div class="text-sm text-text-secondary">
                    {{ testimonial.role }}
                  </div>
                </div>
              </div>
              
              <blockquote class="text-text-secondary italic">
                "{{ testimonial.content }}"
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Startups -->
      <section class="py-20 bg-primary-900">
        <div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 class="text-4xl md:text-5xl font-bold text-white mb-6 tracking-wide">
            Our top picks for 2025 are here!
          </h2>
          <p class="text-xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            JobsGlobal has selected 10 startups across 10 trending industries that should be
            on your radar in 2025. See what teams our community is most excited about in the
            year ahead!
          </p>
          
          <button class="bg-white text-primary-900 font-bold py-4 px-8 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mx-auto">
            Explore our 10 of 10
            <lucide-angular [img]="ArrowRightIcon" size="20"></lucide-angular>
          </button>
        </div>
      </section>

      <!-- Footer CTA -->
      <section class="py-20 bg-white border-t border-gray-200">
        <div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 class="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Got talent?
          </h2>
          <p class="text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
            Join millions of professionals who trust JobsGlobal to advance their careers.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              (click)="navigateToJobs()"
              class="bg-primary-900 text-white font-bold py-4 px-8 rounded-xl hover:bg-primary-800 transition-colors flex items-center justify-center gap-2"
            >
              Find Jobs
              <lucide-angular [img]="ArrowRightIcon" size="20"></lucide-angular>
            </button>
            
            <button
              (click)="navigateToRegister()"
              class="text-primary-900 font-bold py-4 px-8 rounded-xl border border-primary-900 hover:bg-primary-50 transition-colors"
            >
              Sign up
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
  `]
})
export class HeroComponent implements OnInit, OnDestroy {
  // Icons
  readonly CheckCircleIcon = CheckCircle;
  readonly ArrowRightIcon = ArrowRight; 
  readonly HeartIcon = Heart;
  readonly Building2Icon = Building2;
  readonly RocketIcon = Rocket;

  valueProps: ValueProp[] = [
    {
      title: 'Why job seekers love us',
      description: 'Connect directly with founders at top startups - no third party recruiters allowed.',
      icon: this.HeartIcon,
      points: [
        'Everything you need to know, all upfront. View salary, stock options, and more before applying.',
        'Say goodbye to cover letters - your profile is all you need. One click to apply and you\'re done.',
        'Unique jobs at startups and tech companies you can\'t find anywhere else.'
      ],
      ctaText: 'Sign up',
      ctaAction: 'signup'
    },
    {
      title: 'Why recruiters love us',
      description: 'Tap into a community of 10M+ engaged, startup-ready candidates.',
      icon: this.Building2Icon,
      points: [
        'Everything you need to kickstart your recruiting — set up job posts, company branding, and HR tools within 10 minutes, all for free.',
        'A free applicant tracking system, or free integration with any ATS you may already use.',
        'Let us handle the heavy-lifting with RecruiterCloud. Our new AI-Recruiter scans 500M+ candidates.'
      ],
      ctaText: 'Sign up',
      ctaAction: 'recruit-signup'
    }
  ];

  testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Senior Developer',
      content: 'I love JobsGlobal. I got my current job at a startup entirely through the site last year - it\'s super easy to use and I love the UI.'
    },
    {
      name: 'Marcus Johnson',
      role: 'Product Manager',
      content: 'The direct connection with founders is amazing. No more dealing with recruiters who don\'t understand the role.'
    },
    {
      name: 'Elena Rodriguez',
      role: 'UX Designer',
      content: 'One-click applications saved me so much time. Found my dream startup job in just two weeks!'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialize component
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  navigateToJobs(): void {
    this.router.navigate(['/app/jobs']);
  }

  navigateToRegister(): void {
    // For now, navigate to jobs since register component doesn't exist yet
    // TODO: Create register component and update this
    this.router.navigate(['/app/jobs']);
  }

  handleCTA(action: string): void {
    switch (action) {
      case 'signup':
        this.navigateToRegister();
        break;
      case 'recruit-signup':
        // Navigate to recruiter signup when available
        this.navigateToJobs();
        break;
      default:
        this.navigateToJobs();
    }
  }
}
