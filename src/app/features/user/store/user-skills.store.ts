import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { BaseStore, CrudOperations, FastAPIListResponse } from '../../../core/store/base-store';
import { BaseFilter, Pagination } from '../../../core/store/base-state';
import { UserSkill } from '../../../core/models/user.model';
import { ConfigService } from '../../../core/services/config.service';

/**
 * Create skill DTO (no id, user_id, or stars - these are handled by the backend)
 */
export interface CreateUserSkillDto {
  skill_name: string;
  rating: number;
}

/**
 * Update skill DTO
 */
export interface UpdateUserSkillDto {
  skill_name?: string;
  rating?: number;
}

/**
 * User skills filter interface
 */
export interface UserSkillsFilter extends BaseFilter {
  skill_name?: string;
  min_rating?: number;
  max_rating?: number;
  min_stars?: number;
  max_stars?: number;
}

/**
 * User Skills Store extending BaseStore for CRUD operations on user skills
 */
@Injectable({
  providedIn: 'root'
})
export class UserSkillsStore extends BaseStore<UserSkill, CreateUserSkillDto, UpdateUserSkillDto, UserSkillsFilter> {
  private readonly configService = inject(ConfigService);

  constructor() {
    super(
      inject(HttpClient),
      `${inject(ConfigService).getApiBaseUrl()}/users/me/skills`,
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
   * Get item ID from a skill
   */
  protected getItemId(item: UserSkill): string | number {
    return item.id;
  }

  /**
   * Get default filter for skills
   */
  protected getDefaultFilter(): UserSkillsFilter {
    return {
      search: '',
      sortBy: 'skill_name',
      sortDirection: 'asc'
    };
  }

  /**
   * Compare two skill items for equality
   */
  protected compareItems(item1: UserSkill, item2: UserSkill): boolean {
    return item1.id === item2.id;
  }

  /**
   * Deprecated method - HTTP operations are handled internally
   */
  protected getService(): CrudOperations<UserSkill, CreateUserSkillDto, UpdateUserSkillDto, UserSkillsFilter> {
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
  protected override httpGetAll(filter?: Partial<UserSkillsFilter>, pagination?: Partial<Pagination>): Observable<{ items: UserSkill[]; pagination: Pagination }> {
    try {
      const headers = this.getAuthHeaders();
      const params = this.buildHttpParams(filter, pagination);
      
      return this.http.get<FastAPIListResponse<UserSkill>>(`${this.baseUrl}`, { headers, params }).pipe(
        map((response: FastAPIListResponse<UserSkill>) => this.transformFastAPIResponse(response))
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Override HTTP GET single item to include authentication
   */
  protected override httpGetById(id: string | number): Observable<UserSkill> {
    try {
      const headers = this.getAuthHeaders();
      return this.http.get<UserSkill>(`${this.baseUrl}/${id}`, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Override HTTP POST create to include authentication
   */
  protected override httpCreate(item: CreateUserSkillDto): Observable<UserSkill> {
    try {
      const headers = this.getAuthHeaders();
      return this.http.post<UserSkill>(`${this.baseUrl}`, item, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Override HTTP PUT update to include authentication
   */
  protected override httpUpdate(id: string | number, item: UpdateUserSkillDto): Observable<UserSkill> {
    try {
      const headers = this.getAuthHeaders();
      return this.http.put<UserSkill>(`${this.baseUrl}/${id}`, item, { headers });
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

  // Additional convenience methods specific to skills

  /**
   * Get skills by name (filter by skill name)
   */
  getSkillsByName(skillName: string): Observable<{ items: UserSkill[]; pagination: any }> {
    return this.applyFilter({ skill_name: skillName });
  }

  /**
   * Get skills by rating range
   */
  getSkillsByRating(minRating: number, maxRating?: number): Observable<{ items: UserSkill[]; pagination: any }> {
    const filter: Partial<UserSkillsFilter> = { min_rating: minRating };
    if (maxRating !== undefined) {
      filter.max_rating = maxRating;
    }
    return this.applyFilter(filter);
  }

  /**
   * Get skills by star rating
   */
  getSkillsByStars(minStars: number, maxStars?: number): Observable<{ items: UserSkill[]; pagination: any }> {
    const filter: Partial<UserSkillsFilter> = { min_stars: minStars };
    if (maxStars !== undefined) {
      filter.max_stars = maxStars;
    }
    return this.applyFilter(filter);
  }

  /**
   * Sort skills by rating (ascending or descending)
   */
  sortByRating(direction: 'asc' | 'desc' = 'desc'): Observable<{ items: UserSkill[]; pagination: any }> {
    return this.sort('rating', direction);
  }

  /**
   * Sort skills by stars (ascending or descending)
   */
  sortByStars(direction: 'asc' | 'desc' = 'desc'): Observable<{ items: UserSkill[]; pagination: any }> {
    return this.sort('stars', direction);
  }

  /**
   * Sort skills alphabetically by name
   */
  sortByName(direction: 'asc' | 'desc' = 'asc'): Observable<{ items: UserSkill[]; pagination: any }> {
    return this.sort('skill_name', direction);
  }
}