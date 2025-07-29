import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { CrudOperations } from '../../../core/store/base-store';
import { Pagination } from '../../../core/store/base-state';

// Job interfaces matching your existing component
export interface JobListing {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  salary: string;
  experience: string;
  postedTime: string;
  applicants: number;
  description: string;
  requirements: string[];
  tags: string[];
  isBookmarked: boolean;
  matchPercentage: number;
  isUrgent: boolean;
  companyRating: number;
}

export interface JobFilter {
  search?: string;
  location?: string;
  type?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  experience?: string;
  salary?: string;
  tags?: string[];
  isRemote?: boolean;
  isUrgent?: boolean;
  sortBy?: 'relevance' | 'date' | 'salary' | 'company';
  sortDirection?: 'asc' | 'desc';
}

export interface CreateJobDto {
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  salary: string;
  experience: string;
  description: string;
  requirements: string[];
  tags: string[];
}

export interface UpdateJobDto {
  title?: string;
  company?: string;
  location?: string;
  type?: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  salary?: string;
  experience?: string;
  description?: string;
  requirements?: string[];
  tags?: string[];
  isBookmarked?: boolean;
}

@Injectable()
export class JobService implements CrudOperations<JobListing, CreateJobDto, UpdateJobDto, JobFilter> {
  private readonly baseUrl = '/api/jobs'; // Replace with your actual API base URL

  constructor(private http: HttpClient) {}

  // Mock data for development - remove when you have real API
  private mockJobs: JobListing[] = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      type: 'full-time',
      salary: '$120,000 - $150,000',
      experience: '5+ years',
      postedTime: '2 days ago',
      applicants: 45,
      description: 'We are looking for a passionate Senior Frontend Developer to join our growing team. You will be responsible for building user-facing features using cutting-edge technologies including Angular, React, and modern JavaScript frameworks.',
      requirements: ['5+ years frontend experience', 'Expert in Angular/React', 'TypeScript proficiency'],
      tags: ['Angular', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'REST APIs', 'Git'],
      isBookmarked: false,
      matchPercentage: 92,
      isUrgent: false,
      companyRating: 4.5
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      location: 'Remote',
      type: 'full-time',
      salary: '$110,000 - $140,000',
      experience: '3+ years',
      postedTime: '1 day ago',
      applicants: 23,
      description: 'Join our innovative startup as a Full Stack Engineer. Work on exciting projects that impact millions of users. We offer flexible work arrangements and competitive compensation.',
      requirements: ['3+ years full-stack experience', 'Node.js & React', 'Database design'],
      tags: ['React', 'Node.js', 'MongoDB', 'AWS', 'Docker', 'GraphQL'],
      isBookmarked: true,
      matchPercentage: 88,
      isUrgent: true,
      companyRating: 4.2
    },
    {
      id: '3',
      title: 'JavaScript Developer',
      company: 'InnovateNow',
      location: 'New York, NY',
      type: 'contract',
      salary: '$80 - $100/hour',
      experience: '2+ years',
      postedTime: '3 hours ago',
      applicants: 12,
      description: 'Contract opportunity for an experienced JavaScript Developer. Work on cutting-edge web applications with modern frameworks and tools.',
      requirements: ['2+ years JavaScript', 'Modern frameworks', 'API integration'],
      tags: ['JavaScript', 'Vue.js', 'Express', 'MongoDB', 'REST', 'Agile'],
      isBookmarked: false,
      matchPercentage: 85,
      isUrgent: false,
      companyRating: 4.0
    },
    {
      id: '4',
      title: 'Senior Software Engineer',
      company: 'Google',
      location: 'Mountain View, CA',
      type: 'full-time',
      salary: '$180,000 - $220,000',
      experience: '7+ years',
      postedTime: '1 week ago',
      applicants: 156,
      description: 'Google is seeking a Senior Software Engineer to work on large-scale distributed systems. Join our team and help build products that impact billions of users worldwide.',
      requirements: ['7+ years software engineering', 'Distributed systems', 'Computer Science degree'],
      tags: ['Java', 'Python', 'Distributed Systems', 'Machine Learning', 'Cloud'],
      isBookmarked: true,
      matchPercentage: 95,
      isUrgent: false,
      companyRating: 4.8
    },
    {
      id: '5',
      title: 'Frontend Developer',
      company: 'Microsoft',
      location: 'Seattle, WA',
      type: 'full-time',
      salary: '$130,000 - $160,000',
      experience: '4+ years',
      postedTime: '4 days ago',
      applicants: 89,
      description: 'Microsoft is looking for a Frontend Developer to work on Azure portal and Office 365 applications. Experience with React and TypeScript is required.',
      requirements: ['4+ years frontend', 'React & TypeScript', 'Cloud platforms'],
      tags: ['React', 'TypeScript', 'Azure', 'Office 365', 'C#', '.NET'],
      isBookmarked: false,
      matchPercentage: 90,
      isUrgent: false,
      companyRating: 4.6
    },
    {
      id: '6',
      title: 'Junior Web Developer',
      company: 'WebStudio',
      location: 'Remote',
      type: 'full-time',
      salary: '$60,000 - $80,000',
      experience: '0-2 years',
      postedTime: '6 hours ago',
      applicants: 78,
      description: 'Perfect opportunity for a Junior Web Developer to start their career. We provide mentorship and training in modern web technologies.',
      requirements: ['Basic web development', 'HTML/CSS/JS', 'Learning mindset'],
      tags: ['HTML', 'CSS', 'JavaScript', 'PHP', 'WordPress', 'MySQL'],
      isBookmarked: false,
      matchPercentage: 75,
      isUrgent: true,
      companyRating: 3.8
    }
  ];

  /**
   * Get all jobs with filtering and pagination
   */
  getAll(filter?: Partial<JobFilter>, pagination?: Partial<Pagination>): Observable<{ items: JobListing[]; pagination: Pagination }> {
    // TODO: Replace with actual HTTP call
    // return this.http.get<{ items: JobListing[]; pagination: Pagination }>(`${this.baseUrl}`, {
    //   params: this.buildHttpParams(filter, pagination)
    // });

    // Mock implementation with filtering
    return this.mockGetAll(filter, pagination);
  }

  /**
   * Get a single job by ID
   */
  getById(id: string): Observable<JobListing> {
    // TODO: Replace with actual HTTP call
    // return this.http.get<JobListing>(`${this.baseUrl}/${id}`);

    // Mock implementation
    return this.mockGetById(id);
  }

  /**
   * Create a new job
   */
  create(job: CreateJobDto): Observable<JobListing> {
    // TODO: Replace with actual HTTP call
    // return this.http.post<JobListing>(this.baseUrl, job);

    // Mock implementation
    return this.mockCreate(job);
  }

  /**
   * Update an existing job
   */
  update(id: string, job: UpdateJobDto): Observable<JobListing> {
    // TODO: Replace with actual HTTP call
    // return this.http.put<JobListing>(`${this.baseUrl}/${id}`, job);

    // Mock implementation
    return this.mockUpdate(id, job);
  }

  /**
   * Delete a job
   */
  delete(id: string): Observable<void> {
    // TODO: Replace with actual HTTP call
    // return this.http.delete<void>(`${this.baseUrl}/${id}`);

    // Mock implementation
    return this.mockDelete(id);
  }

  /**
   * Toggle bookmark status for a job
   */
  toggleBookmark(id: string): Observable<JobListing> {
    const job = this.mockJobs.find(j => j.id === id);
    if (!job) {
      throw new Error('Job not found');
    }

    // TODO: Replace with actual HTTP call
    // return this.http.patch<JobListing>(`${this.baseUrl}/${id}/bookmark`, {
    //   isBookmarked: !job.isBookmarked
    // });

    // Mock implementation
    job.isBookmarked = !job.isBookmarked;
    return of({ ...job }).pipe(delay(300));
  }

  // Private helper methods for building HTTP params
  private buildHttpParams(filter?: Partial<JobFilter>, pagination?: Partial<Pagination>): HttpParams {
    let params = new HttpParams();

    if (filter) {
      if (filter.search) params = params.set('search', filter.search);
      if (filter.location) params = params.set('location', filter.location);
      if (filter.type) params = params.set('type', filter.type);
      if (filter.experience) params = params.set('experience', filter.experience);
      if (filter.salary) params = params.set('salary', filter.salary);
      if (filter.tags && filter.tags.length > 0) params = params.set('tags', filter.tags.join(','));
      if (filter.isRemote !== undefined) params = params.set('isRemote', filter.isRemote.toString());
      if (filter.isUrgent !== undefined) params = params.set('isUrgent', filter.isUrgent.toString());
      if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
      if (filter.sortDirection) params = params.set('sortDirection', filter.sortDirection);
    }

    if (pagination) {
      if (pagination.page) params = params.set('page', pagination.page.toString());
      if (pagination.limit) params = params.set('limit', pagination.limit.toString());
    }

    return params;
  }

  // Mock implementation methods - remove when implementing real HTTP calls
  private mockGetAll(filter?: Partial<JobFilter>, pagination?: Partial<Pagination>): Observable<{ items: JobListing[]; pagination: Pagination }> {
    let filteredJobs = [...this.mockJobs];

    // Apply filters
    if (filter) {
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          job.title.toLowerCase().includes(searchTerm) ||
          job.company.toLowerCase().includes(searchTerm) ||
          job.description.toLowerCase().includes(searchTerm) ||
          job.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      if (filter.location) {
        filteredJobs = filteredJobs.filter(job => 
          job.location.toLowerCase().includes(filter.location!.toLowerCase())
        );
      }

      if (filter.type) {
        filteredJobs = filteredJobs.filter(job => job.type === filter.type);
      }

      if (filter.isRemote) {
        filteredJobs = filteredJobs.filter(job => 
          job.location.toLowerCase().includes('remote') || job.type === 'remote'
        );
      }

      if (filter.isUrgent) {
        filteredJobs = filteredJobs.filter(job => job.isUrgent === filter.isUrgent);
      }

      if (filter.tags && filter.tags.length > 0) {
        filteredJobs = filteredJobs.filter(job =>
          filter.tags!.some(tag => 
            job.tags.some(jobTag => jobTag.toLowerCase().includes(tag.toLowerCase()))
          )
        );
      }

      // Apply sorting
      if (filter.sortBy) {
        filteredJobs.sort((a, b) => {
          let comparison = 0;
          switch (filter.sortBy) {
            case 'date':
              // Mock date sorting - in real implementation, parse postedTime properly
              comparison = a.postedTime.localeCompare(b.postedTime);
              break;
            case 'company':
              comparison = a.company.localeCompare(b.company);
              break;
            case 'salary':
              // Simple salary comparison - in real implementation, parse salary properly
              comparison = a.salary.localeCompare(b.salary);
              break;
            case 'relevance':
            default:
              comparison = b.matchPercentage - a.matchPercentage;
              break;
          }
          return filter.sortDirection === 'desc' ? -comparison : comparison;
        });
      }
    }

    // Apply pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    const paginationResult: Pagination = {
      page,
      limit,
      total: filteredJobs.length,
      totalPages: Math.ceil(filteredJobs.length / limit)
    };

    return of({
      items: paginatedJobs,
      pagination: paginationResult
    }).pipe(delay(500)); // Simulate network delay
  }

  private mockGetById(id: string): Observable<JobListing> {
    const job = this.mockJobs.find(j => j.id === id);
    if (!job) {
      throw new Error(`Job with id ${id} not found`);
    }
    return of({ ...job }).pipe(delay(300));
  }

  private mockCreate(jobDto: CreateJobDto): Observable<JobListing> {
    const newJob: JobListing = {
      id: Date.now().toString(),
      ...jobDto,
      applicants: 0,
      isBookmarked: false,
      matchPercentage: Math.floor(Math.random() * 30) + 70, // 70-100%
      isUrgent: false,
      companyRating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0
      postedTime: 'Just now'
    };

    this.mockJobs.unshift(newJob);
    return of(newJob).pipe(delay(500));
  }

  private mockUpdate(id: string, updateDto: UpdateJobDto): Observable<JobListing> {
    const index = this.mockJobs.findIndex(j => j.id === id);
    if (index === -1) {
      throw new Error(`Job with id ${id} not found`);
    }

    this.mockJobs[index] = { ...this.mockJobs[index], ...updateDto };
    return of({ ...this.mockJobs[index] }).pipe(delay(300));
  }

  private mockDelete(id: string): Observable<void> {
    const index = this.mockJobs.findIndex(j => j.id === id);
    if (index === -1) {
      throw new Error(`Job with id ${id} not found`);
    }

    this.mockJobs.splice(index, 1);
    return of(void 0).pipe(delay(300));
  }
}
