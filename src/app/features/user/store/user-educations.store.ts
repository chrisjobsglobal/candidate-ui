import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { BaseStore, CrudOperations, FastAPIListResponse } from '../../../core/store/base-store';
import { BaseFilter, Pagination } from '../../../core/store/base-state';
import { UserEducation } from '../../../core/models/user.model';
import { ConfigService } from '../../../core/services/config.service';

/**
 * Create education DTO (no id or user_id - these are handled by the backend)
 */
export interface CreateUserEducationDto {
  institution: string;
  degree: string;
  field_of_study: string;
  start_date: string; // ISO date string
  end_date?: string | null;
  grade?: string | null;
  description?: string | null;
}

/**
 * Update education DTO
 */
export interface UpdateUserEducationDto {
  institution?: string;
  degree?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string | null;
  grade?: string | null;
  description?: string | null;
}

/**
 * User educations filter interface
 */
export interface UserEducationsFilter extends BaseFilter {
  institution?: string;
  degree?: string;
  field_of_study?: string;
  grade?: string;
  start_date_from?: string;
  start_date_to?: string;
}

/**
 * User Educations Store extending BaseStore for CRUD operations on user educations
 */
@Injectable({
  providedIn: 'root'
})
export class UserEducationsStore extends BaseStore<UserEducation, CreateUserEducationDto, UpdateUserEducationDto, UserEducationsFilter> {
  private readonly configService = inject(ConfigService);

  constructor() {
    super(
      inject(HttpClient),
      `${inject(ConfigService).getApiBaseUrl()}/users/me/educations`,
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
   * Get item ID from an education
   */
  protected getItemId(item: UserEducation): string | number {
    return item.id;
  }

  /**
   * Get default filter for educations
   */
  protected getDefaultFilter(): UserEducationsFilter {
    return {
      search: '',
      sortBy: 'start_date',
      sortDirection: 'desc'
    };
  }

  /**
   * Compare two education items for equality
   */
  protected compareItems(item1: UserEducation, item2: UserEducation): boolean {
    return item1.id === item2.id;
  }

  /**
   * Deprecated method - HTTP operations are handled internally
   */
  protected getService(): CrudOperations<UserEducation, CreateUserEducationDto, UpdateUserEducationDto, UserEducationsFilter> {
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
  protected override httpGetAll(filter?: Partial<UserEducationsFilter>, pagination?: Partial<Pagination>): Observable<{ items: UserEducation[]; pagination: Pagination }> {
    try {
      const headers = this.getAuthHeaders();
      const params = this.buildHttpParams(filter, pagination);
      
      return this.http.get<FastAPIListResponse<UserEducation>>(`${this.baseUrl}`, { headers, params }).pipe(
        map((response: FastAPIListResponse<UserEducation>) => this.transformFastAPIResponse(response))
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Override HTTP GET single item to include authentication
   */
  protected override httpGetById(id: string | number): Observable<UserEducation> {
    try {
      const headers = this.getAuthHeaders();
      return this.http.get<UserEducation>(`${this.baseUrl}/${id}`, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Override HTTP POST create to include authentication
   */
  protected override httpCreate(item: CreateUserEducationDto): Observable<UserEducation> {
    try {
      const headers = this.getAuthHeaders();
      return this.http.post<UserEducation>(`${this.baseUrl}`, item, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Override HTTP PUT update to include authentication
   */
  protected override httpUpdate(id: string | number, item: UpdateUserEducationDto): Observable<UserEducation> {
    try {
      const headers = this.getAuthHeaders();
      return this.http.put<UserEducation>(`${this.baseUrl}/${id}`, item, { headers });
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

  // Additional convenience methods specific to educations

  /**
   * Get educations by institution (filter by institution name)
   */
  getEducationsByInstitution(institution: string): Observable<{ items: UserEducation[]; pagination: any }> {
    return this.applyFilter({ institution });
  }

  /**
   * Get educations by degree (filter by degree type)
   */
  getEducationsByDegree(degree: string): Observable<{ items: UserEducation[]; pagination: any }> {
    return this.applyFilter({ degree });
  }

  /**
   * Get educations by field of study
   */
  getEducationsByFieldOfStudy(fieldOfStudy: string): Observable<{ items: UserEducation[]; pagination: any }> {
    return this.applyFilter({ field_of_study: fieldOfStudy });
  }

  /**
   * Get educations by grade
   */
  getEducationsByGrade(grade: string): Observable<{ items: UserEducation[]; pagination: any }> {
    return this.applyFilter({ grade });
  }

  /**
   * Get educations within a date range
   */
  getEducationsByDateRange(startDateFrom: string, startDateTo?: string): Observable<{ items: UserEducation[]; pagination: any }> {
    const filter: Partial<UserEducationsFilter> = { start_date_from: startDateFrom };
    if (startDateTo) {
      filter.start_date_to = startDateTo;
    }
    return this.applyFilter(filter);
  }

  /**
   * Sort educations by start date (most recent first by default)
   */
  sortByStartDate(direction: 'asc' | 'desc' = 'desc'): Observable<{ items: UserEducation[]; pagination: any }> {
    return this.sort('start_date', direction);
  }

  /**
   * Sort educations alphabetically by institution
   */
  sortByInstitution(direction: 'asc' | 'desc' = 'asc'): Observable<{ items: UserEducation[]; pagination: any }> {
    return this.sort('institution', direction);
  }

  /**
   * Sort educations alphabetically by degree
   */
  sortByDegree(direction: 'asc' | 'desc' = 'asc'): Observable<{ items: UserEducation[]; pagination: any }> {
    return this.sort('degree', direction);
  }
}
