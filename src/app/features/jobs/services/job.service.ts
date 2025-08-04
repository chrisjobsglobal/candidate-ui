import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Job interfaces
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
export class JobService {
  private readonly baseUrl = '/api/jobs';

  constructor(private http: HttpClient) {}

  /**
   * Toggle bookmark status for a job
   */
  toggleBookmark(id: string): Observable<JobListing> {
    return this.http.patch<JobListing>(`${this.baseUrl}/${id}/bookmark`, {});
  }
}
