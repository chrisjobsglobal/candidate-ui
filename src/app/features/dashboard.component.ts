import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  LucideAngularModule,
  TrendingUp,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ExternalLink,
  Building2,
  Calendar
} from 'lucide-angular';

interface JobCard {
  id: string;
  title: string;
  company: string;
  logo: string;
  location: string;
  type: string;
  salary: string;
  postedTime: string;
  applicants: number;
  tags: string[];
  isBookmarked: boolean;
  matchPercentage: number;
}

interface PostCard {
  id: string;
  author: {
    name: string;
    role: string;
    company: string;
    avatar: string;
    isVerified: boolean;
  };
  content: string;
  image?: string;
  timeAgo: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Welcome Section -->
      <div class="bg-gradient-to-r from-gradient-start to-gradient-end rounded-2xl p-8 text-white relative overflow-hidden">
        <div class="relative z-10">
          <h1 class="text-3xl font-bold mb-2">Welcome back, John! 👋</h1>
          <p class="text-white/90 mb-6">Ready to find your next opportunity? You have 3 new job matches today.</p>
          <button class="bg-white text-primary-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
            View Job Matches
          </button>
        </div>
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div class="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 translate-x-16"></div>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white rounded-xl p-6 shadow-elegant">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-text-secondary text-sm">Profile Views</p>
              <p class="text-2xl font-bold text-text-primary">142</p>
            </div>
            <div class="p-3 bg-blue-50 rounded-full">
              <lucide-angular [img]="EyeIcon" size="24" class="text-blue-600"></lucide-angular>
            </div>
          </div>
          <div class="flex items-center mt-4 text-green-600">
            <lucide-angular [img]="TrendingUpIcon" size="16" class="mr-1"></lucide-angular>
            <span class="text-sm">+12% from last week</span>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-elegant">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-text-secondary text-sm">Applications</p>
              <p class="text-2xl font-bold text-text-primary">28</p>
            </div>
            <div class="p-3 bg-primary-50 rounded-full">
              <lucide-angular [img]="UsersIcon" size="24" class="text-primary-900"></lucide-angular>
            </div>
          </div>
          <div class="flex items-center mt-4 text-green-600">
            <lucide-angular [img]="TrendingUpIcon" size="16" class="mr-1"></lucide-angular>
            <span class="text-sm">+5 this week</span>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-elegant">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-text-secondary text-sm">Saved Jobs</p>
              <p class="text-2xl font-bold text-text-primary">15</p>
            </div>
            <div class="p-3 bg-yellow-50 rounded-full">
              <lucide-angular [img]="BookmarkIcon" size="24" class="text-yellow-600"></lucide-angular>
            </div>
          </div>
          <div class="flex items-center mt-4 text-text-secondary">
            <span class="text-sm">3 applied recently</span>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-elegant">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-text-secondary text-sm">Connections</p>
              <p class="text-2xl font-bold text-text-primary">89</p>
            </div>
            <div class="p-3 bg-green-50 rounded-full">
              <lucide-angular [img]="UsersIcon" size="24" class="text-green-600"></lucide-angular>
            </div>
          </div>
          <div class="flex items-center mt-4 text-green-600">
            <lucide-angular [img]="TrendingUpIcon" size="16" class="mr-1"></lucide-angular>
            <span class="text-sm">+3 new connections</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Feed -->
        <div class="lg:col-span-2 space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-text-primary">Feed</h2>
            <button class="text-primary-900 hover:text-primary-800 font-medium">View All</button>
          </div>

          <!-- Posts -->
          <div class="space-y-6">
            <div *ngFor="let post of posts()" class="bg-white rounded-xl p-6 shadow-elegant">
              <!-- Post Header -->
              <div class="flex items-start space-x-4 mb-4">
                <div class="w-12 h-12 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full flex items-center justify-center">
                  <span class="text-white font-semibold">{{ post.author.name.charAt(0) }}</span>
                </div>
                <div class="flex-1">
                  <div class="flex items-center space-x-2">
                    <h3 class="font-semibold text-text-primary">{{ post.author.name }}</h3>
                    <span *ngIf="post.author.isVerified" class="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <span class="text-white text-xs">✓</span>
                    </span>
                  </div>
                  <p class="text-text-secondary text-sm">{{ post.author.role }} at {{ post.author.company }}</p>
                  <p class="text-text-secondary text-xs">{{ post.timeAgo }}</p>
                </div>
              </div>

              <!-- Post Content -->
              <div class="mb-4">
                <p class="text-text-primary leading-relaxed">{{ post.content }}</p>
                <img *ngIf="post.image" [src]="post.image" class="mt-4 rounded-lg w-full object-cover max-h-96" />
              </div>

              <!-- Post Actions -->
              <div class="flex items-center justify-between pt-4 border-t border-background-subtle">
                <div class="flex items-center space-x-6">
                  <button 
                    class="flex items-center space-x-2 text-text-secondary hover:text-primary-900 transition-colors"
                    [class.text-primary-900]="post.isLiked"
                  >
                    <lucide-angular [img]="HeartIcon" size="20"></lucide-angular>
                    <span class="text-sm">{{ post.likes }}</span>
                  </button>
                  <button class="flex items-center space-x-2 text-text-secondary hover:text-primary-900 transition-colors">
                    <lucide-angular [img]="MessageCircleIcon" size="20"></lucide-angular>
                    <span class="text-sm">{{ post.comments }}</span>
                  </button>
                  <button class="flex items-center space-x-2 text-text-secondary hover:text-primary-900 transition-colors">
                    <lucide-angular [img]="Share2Icon" size="20"></lucide-angular>
                    <span class="text-sm">{{ post.shares }}</span>
                  </button>
                </div>
                <button class="text-text-secondary hover:text-primary-900 transition-colors">
                  <lucide-angular [img]="BookmarkIcon" size="20"></lucide-angular>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Recommended Jobs -->
          <div class="bg-white rounded-xl p-6 shadow-elegant">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-text-primary">Recommended for You</h3>
              <button class="text-primary-900 hover:text-primary-800 text-sm font-medium">View All</button>
            </div>

            <div class="space-y-4">
              <div *ngFor="let job of recommendedJobs()" class="p-4 border border-background-subtle rounded-lg hover:border-primary-900 transition-colors cursor-pointer">
                <div class="flex items-start space-x-3">
                  <div class="w-10 h-10 bg-gradient-to-r from-gradient-start to-gradient-end rounded-lg flex items-center justify-center">
                    <lucide-angular [img]="Building2Icon" size="16" class="text-white"></lucide-angular>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-text-primary truncate">{{ job.title }}</h4>
                    <p class="text-sm text-text-secondary">{{ job.company }}</p>
                    <div class="flex items-center space-x-4 mt-2 text-xs text-text-secondary">
                      <div class="flex items-center space-x-1">
                        <lucide-angular [img]="MapPinIcon" size="12"></lucide-angular>
                        <span>{{ job.location }}</span>
                      </div>
                      <div class="flex items-center space-x-1">
                        <lucide-angular [img]="DollarSignIcon" size="12"></lucide-angular>
                        <span>{{ job.salary }}</span>
                      </div>
                    </div>
                    <div class="mt-2">
                      <div class="flex items-center justify-between">
                        <span class="text-xs text-primary-900 font-medium">{{ job.matchPercentage }}% match</span>
                        <button class="text-primary-900 hover:text-primary-800">
                          <lucide-angular [img]="ExternalLinkIcon" size="14"></lucide-angular>
                        </button>
                      </div>
                      <div class="w-full bg-background-subtle rounded-full h-1 mt-1">
                        <div class="bg-primary-900 h-1 rounded-full" [style.width.%]="job.matchPercentage"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Upcoming Events -->
          <div class="bg-white rounded-xl p-6 shadow-elegant">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-text-primary">Upcoming Events</h3>
              <button class="text-primary-900 hover:text-primary-800 text-sm font-medium">View All</button>
            </div>

            <div class="space-y-4">
              <div class="p-4 bg-primary-50 rounded-lg">
                <div class="flex items-center space-x-3">
                  <div class="p-2 bg-primary-900 rounded-lg">
                    <lucide-angular [img]="CalendarIcon" size="16" class="text-white"></lucide-angular>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-medium text-text-primary">Tech Career Fair</h4>
                    <p class="text-sm text-text-secondary">Tomorrow at 10:00 AM</p>
                    <p class="text-xs text-primary-900 mt-1">Virtual Event</p>
                  </div>
                </div>
              </div>

              <div class="p-4 border border-background-subtle rounded-lg">
                <div class="flex items-center space-x-3">
                  <div class="p-2 bg-background-subtle rounded-lg">
                    <lucide-angular [img]="CalendarIcon" size="16" class="text-text-secondary"></lucide-angular>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-medium text-text-primary">Resume Workshop</h4>
                    <p class="text-sm text-text-secondary">Friday at 2:00 PM</p>
                    <p class="text-xs text-text-secondary mt-1">Online Workshop</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  readonly TrendingUpIcon = TrendingUp;
  readonly MapPinIcon = MapPin;
  readonly ClockIcon = Clock;
  readonly DollarSignIcon = DollarSign;
  readonly UsersIcon = Users;
  readonly EyeIcon = Eye;
  readonly HeartIcon = Heart;
  readonly MessageCircleIcon = MessageCircle;
  readonly Share2Icon = Share2;
  readonly BookmarkIcon = Bookmark;
  readonly ExternalLinkIcon = ExternalLink;
  readonly Building2Icon = Building2;
  readonly CalendarIcon = Calendar;

  posts = signal<PostCard[]>([
    {
      id: '1',
      author: {
        name: 'Sarah Johnson',
        role: 'Senior Software Engineer',
        company: 'Google',
        avatar: '',
        isVerified: true
      },
      content: 'Just finished an amazing project using Angular 20! The new zoneless change detection is a game-changer. The performance improvements are incredible. What are your thoughts on the latest Angular features?',
      timeAgo: '2 hours ago',
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: false
    },
    {
      id: '2',
      author: {
        name: 'Microsoft Careers',
        role: 'Official Account',
        company: 'Microsoft',
        avatar: '',
        isVerified: true
      },
      content: 'We\'re hiring! Looking for passionate developers to join our cloud infrastructure team. Experience with Azure, Kubernetes, and distributed systems preferred. Remote-friendly positions available.',
      image: '/api/placeholder/600/300',
      timeAgo: '4 hours ago',
      likes: 156,
      comments: 42,
      shares: 28,
      isLiked: true
    }
  ]);

  recommendedJobs = signal<JobCard[]>([
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      logo: '',
      location: 'Remote',
      type: 'Full-time',
      salary: '$120k - $150k',
      postedTime: '2 days ago',
      applicants: 45,
      tags: ['Angular', 'TypeScript', 'Remote'],
      isBookmarked: false,
      matchPercentage: 92
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      logo: '',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$110k - $140k',
      postedTime: '1 day ago',
      applicants: 23,
      tags: ['React', 'Node.js', 'AWS'],
      isBookmarked: true,
      matchPercentage: 88
    },
    {
      id: '3',
      title: 'JavaScript Developer',
      company: 'InnovateNow',
      logo: '',
      location: 'New York, NY',
      type: 'Contract',
      salary: '$80/hour',
      postedTime: '3 hours ago',
      applicants: 12,
      tags: ['JavaScript', 'Vue.js', 'MongoDB'],
      isBookmarked: false,
      matchPercentage: 85
    }
  ]);
}
