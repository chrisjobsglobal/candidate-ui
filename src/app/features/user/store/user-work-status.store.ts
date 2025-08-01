import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, finalize, tap, throwError } from 'rxjs';
import { ConfigService } from '../../../core/services/config.service';

/**
 * Work status response from FastAPI /users/me/work-status endpoint
 */
export interface WorkStatusResponse {
  is_hiring: boolean;
  is_open_to_work: boolean;
  job_title: string;
  company: string;
  work_status_message: string;
}

/**
 * Work status update DTO
 */
export interface UpdateWorkStatusDto {
  is_hiring?: boolean;
  is_open_to_work?: boolean;
  job_title?: string;
  company?: string;
  work_status_message?: string;
}

/**
 * Loading states for work status operations
 */
interface WorkStatusLoadingStates {
  get: boolean;
  update: boolean;
}

/**
 * Store for managing user work status data
 */
@Injectable({
  providedIn: 'root'
})
export class UserWorkStatusStore {
  private readonly http = inject(HttpClient);
  private readonly configService = inject(ConfigService);
  private readonly baseUrl = `${this.configService.getApiBaseUrl()}/users/me`;

  // State signals
  private readonly _workStatus = signal<WorkStatusResponse | null>(null);
  private readonly _loading = signal<WorkStatusLoadingStates>({
    get: false,
    update: false
  });
  private readonly _error = signal<string | null>(null);
  private readonly _lastUpdated = signal<Date | null>(null);

  // Computed selectors
  readonly workStatus = this._workStatus.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly lastUpdated = this._lastUpdated.asReadonly();

  // Computed derived state
  readonly isLoading = computed(() => {
    const loading = this._loading();
    return loading.get || loading.update;
  });

  readonly hasData = computed(() => this._workStatus() !== null);

  readonly isHiring = computed(() => this._workStatus()?.is_hiring ?? false);
  readonly isOpenToWork = computed(() => this._workStatus()?.is_open_to_work ?? false);
  readonly jobTitle = computed(() => this._workStatus()?.job_title ?? '');
  readonly company = computed(() => this._workStatus()?.company ?? '');
  readonly workStatusMessage = computed(() => this._workStatus()?.work_status_message ?? '');

  readonly workStatusSummary = computed(() => {
    const status = this._workStatus();
    if (!status) return null;

    return {
      primaryStatus: status.is_hiring ? 'hiring' : status.is_open_to_work ? 'open-to-work' : 'not-specified',
      displayText: status.is_hiring 
        ? `Hiring at ${status.company || 'Company'}` 
        : status.is_open_to_work 
        ? `Open to work${status.job_title ? ` as ${status.job_title}` : ''}` 
        : 'Status not specified',
      message: status.work_status_message,
      company: status.company,
      jobTitle: status.job_title
    };
  });

  /**
   * Get current user's work status
   */
  getWorkStatus(): Observable<WorkStatusResponse> {
    this._setLoading('get', true);
    this._clearError();

    const authToken = this._getAuthToken();
    if (!authToken) {
      const error = new Error('No authentication token available');
      this._setError('Authentication required');
      this._setLoading('get', false);
      return throwError(() => error);
    }

    const headers = { 'Authorization': authToken };

    return this.http.get<WorkStatusResponse>(`${this.baseUrl}/work-status`, { headers }).pipe(
      tap((workStatus) => {
        this._workStatus.set(workStatus);
        this._lastUpdated.set(new Date());
      }),
      catchError((error) => {
        const errorMessage = error?.error?.detail || error?.message || 'Failed to fetch work status';
        this._setError(errorMessage);
        return throwError(() => error);
      }),
      finalize(() => this._setLoading('get', false))
    );
  }

  /**
   * Update current user's work status
   */
  updateWorkStatus(updateData: UpdateWorkStatusDto): Observable<WorkStatusResponse> {
    this._setLoading('update', true);
    this._clearError();

    const authToken = this._getAuthToken();
    if (!authToken) {
      const error = new Error('No authentication token available');
      this._setError('Authentication required');
      this._setLoading('update', false);
      return throwError(() => error);
    }

    const headers = { 'Authorization': authToken };

    return this.http.put<WorkStatusResponse>(`${this.baseUrl}/work-status`, updateData, { headers }).pipe(
      tap((updatedWorkStatus) => {
        this._workStatus.set(updatedWorkStatus);
        this._lastUpdated.set(new Date());
      }),
      catchError((error) => {
        const errorMessage = error?.error?.detail || error?.message || 'Failed to update work status';
        this._setError(errorMessage);
        return throwError(() => error);
      }),
      finalize(() => this._setLoading('update', false))
    );
  }

  /**
   * Optimistically update work status locally (useful for UI updates before API call)
   */
  updateWorkStatusOptimistic(updateData: Partial<WorkStatusResponse>): void {
    const currentStatus = this._workStatus();
    if (currentStatus) {
      this._workStatus.set({ ...currentStatus, ...updateData });
    }
  }

  /**
   * Clear work status data
   */
  clearWorkStatus(): void {
    this._workStatus.set(null);
    this._lastUpdated.set(null);
    this._clearError();
  }

  /**
   * Refresh work status data
   */
  refresh(): Observable<WorkStatusResponse> {
    return this.getWorkStatus();
  }

  /**
   * Check if work status data is stale (older than 5 minutes)
   */
  isDataStale(): boolean {
    const lastUpdated = this._lastUpdated();
    if (!lastUpdated) return true;
    
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastUpdated < fiveMinutesAgo;
  }

  /**
   * Get work status with automatic refresh if stale
   */
  getWorkStatusWithRefresh(): Observable<WorkStatusResponse> {
    if (this.hasData() && !this.isDataStale()) {
      // Return current data without making API call
      return new Observable(observer => {
        const current = this._workStatus();
        if (current) {
          observer.next(current);
          observer.complete();
        } else {
          observer.error(new Error('No work status data available'));
        }
      });
    }

    return this.getWorkStatus();
  }

  // Private helper methods
  private _setLoading(operation: keyof WorkStatusLoadingStates, loading: boolean): void {
    this._loading.update(current => ({ ...current, [operation]: loading }));
  }

  private _setError(error: string): void {
    this._error.set(error);
  }

  private _clearError(): void {
    this._error.set(null);
  }

  /**
   * Get authentication token from localStorage
   */
  private _getAuthToken(): string | null {
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
}