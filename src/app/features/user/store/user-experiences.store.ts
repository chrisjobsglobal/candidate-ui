import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { BaseStore, CrudOperations, FastAPIListResponse } from '../../../core/store/base-store';
import { BaseFilter, Pagination } from '../../../core/store/base-state';
import { UserExperience } from '../../../core/models/user.model';
import { ConfigService } from '../../../core/services/config.service';

/**
 * Create experience DTO (no id or user_id - these are handled by the backend)
 */
export interface CreateUserExperienceDto {
  title: string;
  company: string;
  location: string;
  start_date: string; // ISO date string
  end_date?: string | null;
  is_current: boolean;
  description: string;
}

/**
 * Update experience DTO
 */
export interface UpdateUserExperienceDto {
  title?: string;
  company?: string;
  location?: string;
  start_date?: string;
  end_date?: string | null;
  is_current?: boolean;
  description?: string;
}

/**
 * User experiences filter interface
 */
export interface UserExperiencesFilter extends BaseFilter {
  title?: string;
  company?: string;
  location?: string;
  is_current?: boolean;
  start_date_from?: string;
  start_date_to?: string;
}

/**
 * User Experiences Store extending BaseStore for CRUD operations on user experiences
 */
@Injectable({
  providedIn: 'root'
})
export class UserExperiencesStore extends BaseStore<UserExperience, CreateUserExperienceDto, UpdateUserExperienceDto, UserExperiencesFilter> {
  private readonly configService = inject(ConfigService);

  constructor() {
    super(
      inject(HttpClient),
      `${inject(ConfigService).getApiBaseUrl()}/users/me/experiences`,
      {
        enableOptimisticUpdates: true,
        enableCaching: false,
        paginationParams: {
          page: 'page',
          limit: 'per_page'
        }
      }
    );
  }

  /**
   * Get item ID from an experience
   */
  protected getItemId(item: UserExperience): string | number {
    return item.id;
  }

  /**
   * Get default filter for experiences
   */
  protected getDefaultFilter(): UserExperiencesFilter {
    return {
      search: '',
      sortBy: 'start_date',
      sortDirection: 'desc'
    };
  }

  /**
   * Compare two experience items for equality
   */
  protected compareItems(item1: UserExperience, item2: UserExperience): boolean {
    return item1.id === item2.id;
  }

  /**
   * Deprecated method - HTTP operations are handled internally
   */
  protected getService(): CrudOperations<UserExperience, CreateUserExperienceDto, UpdateUserExperienceDto, UserExperiencesFilter> {
    throw new Error('getService method is deprecated - HTTP operations are handled internally');
  }

  /**
   * Get authentication token from localStorage
   */
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

  /**
   * Get headers with authentication
   */
  private getAuthHeaders(): HttpHeaders {
    const authToken = this.getAuthToken();
    if (!authToken) {
      throw new Error('No authentication token available');
    }
    return new HttpHeaders({
      'Authorization': authToken,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Override HTTP GET all items to include authentication
   */
  protected override httpGetAll(filter?: Partial<UserExperiencesFilter>, pagination?: Partial<Pagination>): Observable<{ items: UserExperience[]; pagination: Pagination }> {
    try {
      const headers = this.getAuthHeaders();
      const params = this.buildHttpParams(filter, pagination);
      
      return this.http.get<FastAPIListResponse<UserExperience>>(`${this.baseUrl}`, { headers, params }).pipe(
        map((response: FastAPIListResponse<UserExperience>) => this.transformFastAPIResponse(response))
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Override HTTP GET single item to include authentication
   */
  protected override httpGetById(id: string | number): Observable<UserExperience> {
    try {
      const headers = this.getAuthHeaders();
      return this.http.get<UserExperience>(`${this.baseUrl}/${id}`, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Override HTTP POST create to include authentication
   */
  protected override httpCreate(item: CreateUserExperienceDto): Observable<UserExperience> {
    try {
      const headers = this.getAuthHeaders();
      return this.http.post<UserExperience>(`${this.baseUrl}`, item, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Override HTTP PUT update to include authentication
   */
  protected override httpUpdate(id: string | number, item: UpdateUserExperienceDto): Observable<UserExperience> {
    try {
      const headers = this.getAuthHeaders();
      return this.http.put<UserExperience>(`${this.baseUrl}/${id}`, item, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Override HTTP DELETE to include authentication
   */
  protected override httpDelete(id: string | number): Observable<void> {
    try {
      const headers = this.getAuthHeaders();
      return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  // Additional convenience methods specific to experiences

  /**
   * Get experiences by title (filter by job title)
   */
  getExperiencesByTitle(title: string): Observable<{ items: UserExperience[]; pagination: any }> {
    return this.applyFilter({ title });
  }

  /**
   * Get experiences by company (filter by company name)
   */
  getExperiencesByCompany(company: string): Observable<{ items: UserExperience[]; pagination: any }> {
    return this.applyFilter({ company });
  }

  /**
   * Get experiences by location
   */
  getExperiencesByLocation(location: string): Observable<{ items: UserExperience[]; pagination: any }> {
    return this.applyFilter({ location });
  }

  /**
   * Get current experiences only
   */
  getCurrentExperiences(): Observable<{ items: UserExperience[]; pagination: any }> {
    return this.applyFilter({ is_current: true });
  }

  /**
   * Get past experiences only
   */
  getPastExperiences(): Observable<{ items: UserExperience[]; pagination: any }> {
    return this.applyFilter({ is_current: false });
  }

  /**
   * Get experiences within a date range
   */
  getExperiencesByDateRange(startDateFrom: string, startDateTo?: string): Observable<{ items: UserExperience[]; pagination: any }> {
    const filter: Partial<UserExperiencesFilter> = { start_date_from: startDateFrom };
    if (startDateTo) {
      filter.start_date_to = startDateTo;
    }
    return this.applyFilter(filter);
  }

  /**
   * Sort experiences by start date (most recent first by default)
   */
  sortByStartDate(direction: 'asc' | 'desc' = 'desc'): Observable<{ items: UserExperience[]; pagination: any }> {
    return this.sort('start_date', direction);
  }

  /**
   * Sort experiences alphabetically by title
   */
  sortByTitle(direction: 'asc' | 'desc' = 'asc'): Observable<{ items: UserExperience[]; pagination: any }> {
    return this.sort('title', direction);
  }

  /**
   * Sort experiences alphabetically by company
   */
  sortByCompany(direction: 'asc' | 'desc' = 'asc'): Observable<{ items: UserExperience[]; pagination: any }> {
    return this.sort('company', direction);
  }
}