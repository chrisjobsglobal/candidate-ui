import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { BaseStore, CrudOperations, FastAPIListResponse } from '../../../core/store/base-store';
import { BaseFilter, Pagination } from '../../../core/store/base-state';
import { UserLanguage } from '../../../core/models/user.model';
import { ConfigService } from '../../../core/services/config.service';

/**
 * Create language DTO (no id or user_id - these are handled by the backend)
 */
export interface CreateUserLanguageDto {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
}

/**
 * Update language DTO
 */
export interface UpdateUserLanguageDto {
  name?: string;
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'native';
}

/**
 * User languages filter interface
 */
export interface UserLanguagesFilter extends BaseFilter {
  name?: string;
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'native';
}

/**
 * User Languages Store extending BaseStore for CRUD operations on user languages
 */
@Injectable({
  providedIn: 'root'
})
export class UserLanguagesStore extends BaseStore<UserLanguage, CreateUserLanguageDto, UpdateUserLanguageDto, UserLanguagesFilter> {
  private readonly configService = inject(ConfigService);

  constructor() {
    super(
      inject(HttpClient),
      `${inject(ConfigService).getApiBaseUrl()}/users/me/languages`,
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
   * Get item ID from a language
   */
  protected getItemId(item: UserLanguage): string | number {
    return item.id;
  }

  /**
   * Get default filter for languages
   */
  protected getDefaultFilter(): UserLanguagesFilter {
    return {
      search: '',
      sortBy: 'name',
      sortDirection: 'asc'
    };
  }

  /**
   * Compare two language items for equality
   */
  protected compareItems(item1: UserLanguage, item2: UserLanguage): boolean {
    return item1.id === item2.id;
  }

  /**
   * Deprecated method - HTTP operations are handled internally
   */
  protected getService(): CrudOperations<UserLanguage, CreateUserLanguageDto, UpdateUserLanguageDto, UserLanguagesFilter> {
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
  protected override httpGetAll(filter?: Partial<UserLanguagesFilter>, pagination?: Partial<Pagination>): Observable<{ items: UserLanguage[]; pagination: Pagination }> {
    try {
      const headers = this.getAuthHeaders();
      const params = this.buildHttpParams(filter, pagination);
      
      return this.http.get<FastAPIListResponse<UserLanguage>>(`${this.baseUrl}`, { headers, params }).pipe(
        map((response: FastAPIListResponse<UserLanguage>) => this.transformFastAPIResponse(response))
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Override HTTP GET single item to include authentication
   */
  protected override httpGetById(id: string | number): Observable<UserLanguage> {
    try {
      const headers = this.getAuthHeaders();
      return this.http.get<UserLanguage>(`${this.baseUrl}/${id}`, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Override HTTP POST create to include authentication and normalize proficiency
   */
  protected override httpCreate(item: CreateUserLanguageDto): Observable<UserLanguage> {
    try {
      const headers = this.getAuthHeaders();
      // Normalize proficiency to lowercase for API consistency
      const normalizedItem = {
        ...item,
        proficiency: item.proficiency.toLowerCase() as 'beginner' | 'intermediate' | 'advanced' | 'native'
      };
      return this.http.post<UserLanguage>(`${this.baseUrl}`, normalizedItem, { headers });
    } catch (error) {
      return throwError(() => error);
    }
  }

  /**
   * Override HTTP PUT update to include authentication and normalize proficiency
   */
  protected override httpUpdate(id: string | number, item: UpdateUserLanguageDto): Observable<UserLanguage> {
    try {
      const headers = this.getAuthHeaders();
      // Normalize proficiency to lowercase for API consistency if provided
      const normalizedItem = {
        ...item,
        ...(item.proficiency && { 
          proficiency: item.proficiency.toLowerCase() as 'beginner' | 'intermediate' | 'advanced' | 'native' 
        })
      };
      return this.http.put<UserLanguage>(`${this.baseUrl}/${id}`, normalizedItem, { headers });
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

  // Additional convenience methods specific to languages

  /**
   * Get languages by name (filter by language name)
   */
  getLanguagesByName(name: string): Observable<{ items: UserLanguage[]; pagination: any }> {
    return this.applyFilter({ name });
  }

  /**
   * Get languages by proficiency level
   */
  getLanguagesByProficiency(proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native'): Observable<{ items: UserLanguage[]; pagination: any }> {
    return this.applyFilter({ proficiency });
  }

  /**
   * Sort languages alphabetically by name
   */
  sortByName(direction: 'asc' | 'desc' = 'asc'): Observable<{ items: UserLanguage[]; pagination: any }> {
    return this.sort('name', direction);
  }

  /**
   * Sort languages by proficiency level (beginner -> native)
   */
  sortByProficiency(direction: 'asc' | 'desc' = 'asc'): Observable<{ items: UserLanguage[]; pagination: any }> {
    return this.sort('proficiency', direction);
  }

  /**
   * Get all native languages
   */
  getNativeLanguages(): Observable<{ items: UserLanguage[]; pagination: any }> {
    return this.getLanguagesByProficiency('native');
  }

  /**
   * Get all non-native languages
   */
  getNonNativeLanguages(): Observable<{ items: UserLanguage[]; pagination: any }> {
    return this.applyFilter({
      search: '',
      sortBy: 'proficiency',
      sortDirection: 'desc'
    });
  }
}
