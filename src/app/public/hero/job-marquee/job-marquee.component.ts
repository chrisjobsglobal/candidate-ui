import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Job {
  title: string;
  company: string;
  location: string;
  salary?: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
}

@Component({
  selector: 'app-job-marquee',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Job Marquee -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-text-primary mb-4">
            Latest Jobs from Top Companies
          </h2>
          <p class="text-text-secondary">
            Discover your next opportunity with leading startups and tech companies
          </p>
        </div>
        
        <!-- Job Cards with Scroll Animation -->
        <div class="relative overflow-hidden">
          <div class="flex animate-marquee space-x-4 py-2">
            <div
              *ngFor="let job of jobs; let i = index"
              class="flex-shrink-0 bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer min-w-[280px]"
              (click)="navigateToJob(job)"
            >
              <h3 class="text-base font-semibold text-text-primary mb-1">
                {{ job.title }}
              </h3>
              
              <p class="text-sm text-primary-900 font-medium mb-2">
                {{ job.company }}
              </p>
              
              <div class="flex items-center gap-2 text-xs text-text-secondary">
                <span>{{ job.location }}</span>
                <span>•</span>
                <span>{{ job.type }}</span>
                <span *ngIf="job.salary">•</span>
                <span *ngIf="job.salary" class="text-green-600 font-medium">{{ job.salary }}</span>
              </div>
            </div>
            
            <!-- Duplicate jobs for seamless loop -->
            <div
              *ngFor="let job of jobs; let i = index"
              class="flex-shrink-0 bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer min-w-[280px]"
              (click)="navigateToJob(job)"
            >
              <h3 class="text-base font-semibold text-text-primary mb-1">
                {{ job.title }}
              </h3>
              
              <p class="text-sm text-primary-900 font-medium mb-2">
                {{ job.company }}
              </p>
              
              <div class="flex items-center gap-2 text-xs text-text-secondary">
                <span>{{ job.location }}</span>
                <span>•</span>
                <span>{{ job.type }}</span>
                <span *ngIf="job.salary">•</span>
                <span *ngIf="job.salary" class="text-green-600 font-medium">{{ job.salary }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- View All Jobs Button -->
        <div class="text-center mt-12">
          <button
            (click)="navigateToAllJobs()"
            class="bg-primary-900 text-white font-semibold py-3 px-8 rounded-lg hover:bg-primary-800 transition-colors inline-flex items-center gap-2"
          >
            <span>View All {{ jobs.length }} Jobs</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    @keyframes marquee {
      0% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(-50%);
      }
    }
    
    .animate-marquee {
      animation: marquee 30s linear infinite;
    }
    
    .animate-marquee:hover {
      animation-play-state: paused;
    }
  `]
})
export class JobMarqueeComponent implements OnInit {
  jobs: Job[] = [
    { title: 'Senior Software Engineer', company: 'TechCorp', location: 'San Francisco, CA', salary: '$120k - $180k', type: 'Full-time' },
    { title: 'Product Manager', company: 'InnovateX', location: 'New York, NY', salary: '$100k - $140k', type: 'Full-time' },
    { title: 'UX Designer', company: 'CreativeCo', location: 'Austin, TX', salary: '$80k - $120k', type: 'Full-time' },
    { title: 'Data Scientist', company: 'DataFlow', location: 'Seattle, WA', salary: '$110k - $160k', type: 'Full-time' },
    { title: 'DevOps Engineer', company: 'CloudTech', location: 'Remote', salary: '$90k - $130k', type: 'Remote' },
    { title: 'Frontend Developer', company: 'StartupXYZ', location: 'Los Angeles, CA', salary: '$85k - $125k', type: 'Full-time' },
    { title: 'Backend Developer', company: 'ScaleUp', location: 'Chicago, IL', salary: '$95k - $135k', type: 'Full-time' },
    { title: 'Mobile Developer', company: 'AppCo', location: 'Boston, MA', salary: '$88k - $128k', type: 'Full-time' },
    { title: 'Machine Learning Engineer', company: 'AI Innovations', location: 'Palo Alto, CA', salary: '$130k - $190k', type: 'Full-time' },
    { title: 'Marketing Manager', company: 'GrowthLab', location: 'Denver, CO', salary: '$70k - $100k', type: 'Full-time' },
    { title: 'Full Stack Engineer', company: 'WebFlow', location: 'Remote', salary: '$100k - $150k', type: 'Remote' },
    { title: 'QA Engineer', company: 'TestPro', location: 'Portland, OR', salary: '$75k - $105k', type: 'Full-time' },
    { title: 'Solutions Architect', company: 'CloudMaster', location: 'Atlanta, GA', salary: '$140k - $200k', type: 'Full-time' },
    { title: 'React Developer', company: 'FrontendCo', location: 'Remote', salary: '$90k - $130k', type: 'Remote' },
    { title: 'Python Developer', company: 'CodeCraft', location: 'Miami, FL', salary: '$85k - $125k', type: 'Full-time' },
    { title: 'UI/UX Designer', company: 'DesignHub', location: 'San Diego, CA', salary: '$75k - $115k', type: 'Contract' },
    { title: 'Cybersecurity Analyst', company: 'SecureNet', location: 'Washington, DC', salary: '$95k - $135k', type: 'Full-time' },
    { title: 'Project Manager', company: 'AgileCorp', location: 'Nashville, TN', salary: '$80k - $120k', type: 'Full-time' },
    { title: 'Sales Engineer', company: 'TechSales', location: 'Phoenix, AZ', salary: '$90k - $150k', type: 'Full-time' },
    { title: 'Content Strategist', company: 'ContentCo', location: 'Remote', salary: '$60k - $90k', type: 'Remote' },
    { title: 'Blockchain Developer', company: 'CryptoTech', location: 'San Francisco, CA', salary: '$120k - $180k', type: 'Full-time' },
    { title: 'Growth Hacker', company: 'ScaleUp', location: 'Austin, TX', salary: '$70k - $110k', type: 'Full-time' },
    { title: 'Site Reliability Engineer', company: 'InfraScale', location: 'Seattle, WA', salary: '$115k - $165k', type: 'Full-time' },
    { title: 'Technical Writer', company: 'DocuTech', location: 'Remote', salary: '$65k - $95k', type: 'Remote' },
    { title: 'Business Analyst', company: 'Analytics Pro', location: 'Dallas, TX', salary: '$75k - $105k', type: 'Full-time' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Initialize component
  }

  getJobTypeClass(type: string): string {
    switch (type) {
      case 'Remote':
        return 'bg-green-100 text-green-800';
      case 'Full-time':
        return 'bg-blue-100 text-blue-800';
      case 'Part-time':
        return 'bg-yellow-100 text-yellow-800';
      case 'Contract':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  navigateToJob(job: Job): void {
    // Navigate to job details page with job information
    this.router.navigate(['/app/jobs'], {
      queryParams: {
        search: job.title,
        company: job.company
      }
    });
  }

  navigateToAllJobs(): void {
    this.router.navigate(['/app/jobs']);
  }
}
