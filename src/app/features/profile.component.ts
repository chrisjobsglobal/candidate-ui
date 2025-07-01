import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  LucideAngularModule,
  Edit3,
  MapPin,
  Calendar,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Github,
  Plus,
  Award,
  GraduationCap,
  Briefcase,
  Languages,
  Star,
  Download,
  Share2,
  Eye,
  Users,
  Funnel
} from 'lucide-angular';

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
  grade?: string;
}

interface Skill {
  name: string;
  level: number; // 1-5
  endorsed: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="max-w-6xl mx-auto space-y-8">
      <!-- Profile Header -->
      <div class="bg-white rounded-xl shadow-elegant overflow-hidden">
        <!-- Cover Photo -->
        <div class="h-48 bg-gradient-to-r from-gradient-start to-gradient-end relative">
          <button class="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors">
            <lucide-angular [img]="Edit3Icon" size="16"></lucide-angular>
          </button>
        </div>

        <!-- Profile Info -->
        <div class="relative px-8 pb-8">
          <!-- Profile Picture -->
          <div class="flex items-end space-x-6 -mt-16">
            <div class="relative">
              <div class="w-32 h-32 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full border-4 border-white flex items-center justify-center">
                <span class="text-4xl font-bold text-white">JD</span>
              </div>
              <button class="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow">
                <lucide-angular [img]="Edit3Icon" size="14" class="text-text-secondary"></lucide-angular>
              </button>
            </div>
            <div class="flex-1 pb-4">
              <div class="flex items-start justify-between">
                <div class="-translate-y-5">
                  <h1 class="text-3xl font-bold text-white">John Doe</h1>
                  <p class="text-xl text-gray-100 font-medium">Senior Software Engineer</p>
                  <div class="flex items-center space-x-4 mt-2 pt-2 text-text-secondary">
                    <div class="flex items-center space-x-1">
                      <lucide-angular [img]="MapPinIcon" size="16" class="text-green-500"></lucide-angular>
                      <span>San Francisco, CA</span>
                    </div>
                    <div class="flex items-center space-x-1">
                      <lucide-angular [img]="UsersIcon" size="16" class="text-blue-500"></lucide-angular>
                      <span>{{ profileStats().connections }} connections</span>
                    </div>
                    <div class="flex items-center space-x-1">
                      <lucide-angular [img]="BriefcaseIcon" size="16" class="text-amber-500"></lucide-angular>
                      <span>4 active applications</span>
                    </div>
                    <div class="flex items-center space-x-1">
                      <lucide-angular [img]="FunnelIcon" size="16" class="text-blue-500"></lucide-angular>
                      <span>1 shortlisted</span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-3">
                  <button class="flex items-center space-x-2 px-4 py-2 border border-background-subtle text-gray-100 hover:bg-primary-800  rounded-lg transition-colors">
                    <lucide-angular [img]="EyeIcon" size="16"></lucide-angular>
                    <span>{{ profileStats().views }}</span>
                  </button>
                  <button class="flex items-center space-x-2 px-4 py-2 border border-background-subtle text-gray-100 hover:bg-primary-800  rounded-lg transition-colors">
                    <lucide-angular [img]="Share2Icon" size="16"></lucide-angular>
                    <span>Share</span>
                  </button>
                  <button class="px-6 py-2 bg-primary-900 text-white border border-background-subtle rounded-lg hover:bg-primary-800 transition-colors font-medium">
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-background-subtle">
            <div class="flex items-center space-x-2 text-text-secondary">
              <lucide-angular [img]="MailIcon" size="16"></lucide-angular>
              <span>john.doe&#64;email.com</span>
            </div>
            <div class="flex items-center space-x-2 text-text-secondary">
              <lucide-angular [img]="PhoneIcon" size="16"></lucide-angular>
              <span>+1 (555) 123-4567</span>
            </div>
            <div class="flex items-center space-x-2 text-text-secondary">
              <lucide-angular [img]="GlobeIcon" size="16"></lucide-angular>
              <span>johndoe.dev</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-8">
          <!-- About -->
          <div class="bg-white rounded-xl p-6 shadow-elegant">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-text-primary">About</h2>
              <button class="p-2 text-text-secondary hover:text-text-primary transition-colors">
                <lucide-angular [img]="Edit3Icon" size="16"></lucide-angular>
              </button>
            </div>
            <p class="text-text-secondary leading-relaxed">
              Passionate Senior Software Engineer with 8+ years of experience in full-stack development. 
              Specialized in building scalable web applications using modern JavaScript frameworks including 
              Angular, React, and Node.js. Strong background in cloud technologies, DevOps practices, and 
              team leadership. Always eager to learn new technologies and mentor junior developers.
            </p>
          </div>

          <!-- Experience -->
          <div class="bg-white rounded-xl p-6 shadow-elegant">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-text-primary">Experience</h2>
              <button class="p-2 text-text-secondary hover:text-text-primary transition-colors">
                <lucide-angular [img]="PlusIcon" size="16"></lucide-angular>
              </button>
            </div>
            <div class="space-y-6">
              <div *ngFor="let exp of experience()" class="relative pl-8 border-l-2 border-background-subtle last:border-l-0">
                <div class="absolute -left-2 top-0 w-4 h-4 bg-primary-900 rounded-full"></div>
                <div class="pb-6">
                  <div class="flex items-start justify-between mb-2">
                    <div>
                      <h3 class="text-lg font-semibold text-text-primary">{{ exp.title }}</h3>
                      <p class="text-primary-900 font-medium">{{ exp.company }}</p>
                      <div class="flex items-center space-x-4 mt-1 text-sm text-text-secondary">
                        <div class="flex items-center space-x-1">
                          <lucide-angular [img]="CalendarIcon" size="14"></lucide-angular>
                          <span>{{ exp.startDate }} - {{ exp.isCurrent ? 'Present' : exp.endDate }}</span>
                        </div>
                        <div class="flex items-center space-x-1">
                          <lucide-angular [img]="MapPinIcon" size="14"></lucide-angular>
                          <span>{{ exp.location }}</span>
                        </div>
                      </div>
                    </div>
                    <button class="p-1 text-text-secondary hover:text-text-primary transition-colors">
                      <lucide-angular [img]="Edit3Icon" size="14"></lucide-angular>
                    </button>
                  </div>
                  <p class="text-text-secondary text-sm leading-relaxed">{{ exp.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Education -->
          <div class="bg-white rounded-xl p-6 shadow-elegant">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-text-primary">Education</h2>
              <button class="p-2 text-text-secondary hover:text-text-primary transition-colors">
                <lucide-angular [img]="PlusIcon" size="16"></lucide-angular>
              </button>
            </div>
            <div class="space-y-4">
              <div *ngFor="let edu of education()" class="flex items-start space-x-4 p-4 border border-background-subtle rounded-lg">
                <div class="p-3 bg-primary-50 rounded-lg">
                  <lucide-angular [img]="GraduationCapIcon" size="20" class="text-primary-900"></lucide-angular>
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-text-primary">{{ edu.degree }}</h3>
                  <p class="text-primary-900 font-medium">{{ edu.institution }}</p>
                  <p class="text-sm text-text-secondary">{{ edu.fieldOfStudy }}</p>
                  <p class="text-sm text-text-secondary mt-1">{{ edu.startDate }} - {{ edu.endDate }}</p>
                  <p *ngIf="edu.grade" class="text-sm text-text-secondary">Grade: {{ edu.grade }}</p>
                </div>
                <button class="p-1 text-text-secondary hover:text-text-primary transition-colors">
                  <lucide-angular [img]="Edit3Icon" size="14"></lucide-angular>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-8">
          <!-- Skills -->
          <div class="bg-white rounded-xl p-6 shadow-elegant">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-text-primary">Skills</h2>
              <button class="p-2 text-text-secondary hover:text-text-primary transition-colors">
                <lucide-angular [img]="PlusIcon" size="16"></lucide-angular>
              </button>
            </div>
            <div class="space-y-4">
              <div *ngFor="let skill of skills()" class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-medium text-text-primary">{{ skill.name }}</span>
                  <div class="flex items-center space-x-2">
                    <div class="flex items-center space-x-1">
                      <lucide-angular 
                        *ngFor="let star of [1,2,3,4,5]" 
                        [img]="StarIcon" 
                        size="14" 
                        [class.text-yellow-500]="star <= skill.level"
                        [class.text-background-subtle]="star > skill.level"
                      ></lucide-angular>
                    </div>
                    <span class="text-sm text-text-secondary">{{ skill.endorsed }}</span>
                  </div>
                </div>
                <div class="w-full bg-background-subtle rounded-full h-2">
                  <div class="bg-primary-900 h-2 rounded-full" [style.width.%]="skill.level * 20"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Languages -->
          <div class="bg-white rounded-xl p-6 shadow-elegant">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-text-primary">Languages</h2>
              <button class="p-2 text-text-secondary hover:text-text-primary transition-colors">
                <lucide-angular [img]="PlusIcon" size="16"></lucide-angular>
              </button>
            </div>
            <div class="space-y-3">
              <div *ngFor="let lang of languages()" class="flex items-center justify-between">
                <span class="font-medium text-text-primary">{{ lang.name }}</span>
                <span class="text-sm text-text-secondary px-2 py-1 bg-background-subtle rounded-full">
                  {{ lang.proficiency | titlecase }}
                </span>
              </div>
            </div>
          </div>

          <!-- Social Links -->
          <div class="bg-white rounded-xl p-6 shadow-elegant">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-semibold text-text-primary">Connect</h2>
              <button class="p-2 text-text-secondary hover:text-text-primary transition-colors">
                <lucide-angular [img]="Edit3Icon" size="16"></lucide-angular>
              </button>
            </div>
            <div class="space-y-3">
              <a href="#" class="flex items-center space-x-3 p-3 border border-background-subtle rounded-lg hover:bg-gray-50 transition-colors">
                <lucide-angular [img]="LinkedinIcon" size="20" class="text-blue-600"></lucide-angular>
                <span class="text-text-primary">LinkedIn</span>
              </a>
              <a href="#" class="flex items-center space-x-3 p-3 border border-background-subtle rounded-lg hover:bg-gray-50 transition-colors">
                <lucide-angular [img]="GithubIcon" size="20" class="text-text-primary"></lucide-angular>
                <span class="text-text-primary">GitHub</span>
              </a>
              <a href="#" class="flex items-center space-x-3 p-3 border border-background-subtle rounded-lg hover:bg-gray-50 transition-colors">
                <lucide-angular [img]="GlobeIcon" size="20" class="text-text-secondary"></lucide-angular>
                <span class="text-text-primary">Portfolio</span>
              </a>
            </div>
          </div>

          <!-- Resume Download -->
          <div class="bg-gradient-to-r from-gradient-start to-gradient-end rounded-xl p-6 text-white">
            <h3 class="text-lg font-semibold mb-2">Download Resume</h3>
            <p class="text-white/90 text-sm mb-4">Share your complete profile with employers</p>
            <button class="w-full flex items-center justify-center space-x-2 py-3 bg-white text-primary-900 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              <lucide-angular [img]="DownloadIcon" size="16"></lucide-angular>
              <span>Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent {
  readonly Edit3Icon = Edit3;
  readonly MapPinIcon = MapPin;
  readonly CalendarIcon = Calendar;
  readonly MailIcon = Mail;
  readonly PhoneIcon = Phone;
  readonly GlobeIcon = Globe;
  readonly LinkedinIcon = Linkedin;
  readonly GithubIcon = Github;
  readonly PlusIcon = Plus;
  readonly AwardIcon = Award;
  readonly GraduationCapIcon = GraduationCap;
  readonly BriefcaseIcon = Briefcase;
  readonly LanguagesIcon = Languages;
  readonly StarIcon = Star;
  readonly DownloadIcon = Download;
  readonly Share2Icon = Share2;
  readonly EyeIcon = Eye;
  readonly UsersIcon = Users;
  readonly FunnelIcon = Funnel;


  profileStats = signal({
    views: 142,
    connections: 89,
    profileStrength: 85
  });

  experience = signal<Experience[]>([
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      startDate: 'Jan 2022',
      endDate: '',
      isCurrent: true,
      description: 'Leading a team of 5 developers in building scalable web applications using Angular and Node.js. Responsible for architecture decisions, code reviews, and mentoring junior developers. Implemented CI/CD pipelines that reduced deployment time by 60%.'
    },
    {
      id: '2',
      title: 'Software Engineer',
      company: 'StartupXYZ',
      location: 'San Francisco, CA',
      startDate: 'Jun 2019',
      endDate: 'Dec 2021',
      isCurrent: false,
      description: 'Developed and maintained multiple web applications using React and TypeScript. Collaborated with cross-functional teams to deliver high-quality software solutions. Reduced application load times by 40% through performance optimizations.'
    },
    {
      id: '3',
      title: 'Junior Developer',
      company: 'WebStudio',
      location: 'Remote',
      startDate: 'Mar 2018',
      endDate: 'May 2019',
      isCurrent: false,
      description: 'Built responsive websites and web applications using HTML, CSS, JavaScript, and PHP. Worked closely with designers to implement pixel-perfect user interfaces. Gained experience in version control and agile development methodologies.'
    }
  ]);

  education = signal<Education[]>([
    {
      id: '1',
      institution: 'Stanford University',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2014',
      endDate: '2018',
      grade: '3.8 GPA'
    },
    {
      id: '2',
      institution: 'Google Cloud Certified',
      degree: 'Professional Cloud Architect',
      fieldOfStudy: 'Cloud Computing',
      startDate: '2021',
      endDate: '2021'
    }
  ]);

  skills = signal<Skill[]>([
    { name: 'JavaScript', level: 5, endorsed: 45 },
    { name: 'TypeScript', level: 5, endorsed: 38 },
    { name: 'Angular', level: 5, endorsed: 42 },
    { name: 'React', level: 4, endorsed: 35 },
    { name: 'Node.js', level: 4, endorsed: 28 },
    { name: 'Python', level: 3, endorsed: 22 },
    { name: 'AWS', level: 4, endorsed: 31 },
    { name: 'Docker', level: 3, endorsed: 18 }
  ]);

  languages = signal([
    { name: 'English', proficiency: 'native' },
    { name: 'Spanish', proficiency: 'intermediate' },
    { name: 'French', proficiency: 'beginner' }
  ]);
}
