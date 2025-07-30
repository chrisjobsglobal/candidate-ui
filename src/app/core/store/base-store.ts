import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, finalize, tap, of, map } from 'rxjs';
import { BaseStateClass, BaseFilter, Pagination } from './base-state';

/**
 * FastAPI standardized list response format
 */
export interface FastAPIListResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

/**
 * Base CRUD operations interface (deprecated - HTTP operations now handled internally)
 * @deprecated Use BaseStore with HTTP operations instead
 */
export interface CrudOperations<T, CreateDto = Partial<T>, UpdateDto = Partial<T>, F extends BaseFilter = BaseFilter> {
  getAll(filter?: Partial<F>, pagination?: Partial<Pagination>): Observable<{ items: T[]; pagination: Pagination }>;
  getById(id: string | number): Observable<T>;
  create(item: CreateDto): Observable<T>;
  update(id: string | number, item: UpdateDto): Observable<T>;
  delete(id: string | number): Observable<void>;
}

/**
 * Store configuration interface
 */
export interface StoreConfig {
  enableAutoRefresh?: boolean;
  autoRefreshInterval?: number;
  enableOptimisticUpdates?: boolean;
  enableCaching?: boolean;
  cacheTimeout?: number;
  paginationParams?: {
    page?: string;
    limit?: string;
  };
}

/**
 * Default store configuration
 */
export const DEFAULT_STORE_CONFIG: StoreConfig = {
  enableAutoRefresh: false,
  autoRefreshInterval: 30000, // 30 seconds
  enableOptimisticUpdates: true,
  enableCaching: false,
  cacheTimeout: 300000, // 5 minutes
  paginationParams: {
    page: 'page',
    limit: 'per_page'
  }
};

/**
 * Abstract base store class with signal-based state management and built-in HTTP CRUD operations
 */
@Injectable()
export abstract class BaseStore<
  T,
  CreateDto = Partial<T>,
  UpdateDto = Partial<T>,
  F extends BaseFilter = BaseFilter
> extends BaseStateClass<T, F> {
  
  protected readonly config: StoreConfig;
  protected readonly http: HttpClient;
  protected readonly baseUrl: string;
  private autoRefreshInterval?: number;
  private cacheTimestamp?: Date;

  constructor(
    http: HttpClient,
    baseUrl: string,
    config: Partial<StoreConfig> = {}
  ) {
    super();
    this.http = http;
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.config = { ...DEFAULT_STORE_CONFIG, ...config };
  }

  /**
   * Abstract method to get the service for CRUD operations
   * @deprecated HTTP operations are now handled internally
   */
  protected abstract getService(): CrudOperations<T, CreateDto, UpdateDto, F>;

  /**
   * Abstract method to extract ID from an item
   */
  protected abstract getItemId(item: T): string | number;

  /**
   * Build HTTP parameters from filter and pagination
   */
  protected buildHttpParams(filter?: Partial<F>, pagination?: Partial<Pagination>): HttpParams {
    let params = new HttpParams();

    // Add filter parameters
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params = params.append(key, v.toString()));
          } else {
            params = params.set(key, value.toString());
          }
        }
      });
    }

    // Add pagination parameters
    if (pagination) {
      const pageParam = this.config.paginationParams?.page || 'page';
      const limitParam = this.config.paginationParams?.limit || 'per_page';
      
      if (pagination.page) params = params.set(pageParam, pagination.page.toString());
      if (pagination.limit) params = params.set(limitParam, pagination.limit.toString());
    }

    return params;
  }

  /**
   * Transform FastAPI list response to internal format
   */
  protected transformFastAPIResponse(response: FastAPIListResponse<T>): { items: T[]; pagination: Pagination } {
    return {
      items: response.data,
      pagination: {
        page: response.page,
        limit: response.per_page,
        total: response.total,
        totalPages: response.total_pages
      }
    };
  }

  /**
   * HTTP GET all items
   */
  protected httpGetAll(filter?: Partial<F>, pagination?: Partial<Pagination>): Observable<{ items: T[]; pagination: Pagination }> {
    const params = this.buildHttpParams(filter, pagination);
    
    return this.http.get<FastAPIListResponse<T>>(`${this.baseUrl}`, { params }).pipe(
      map((response: FastAPIListResponse<T>) => this.transformFastAPIResponse(response))
    );
  }

  /**
   * HTTP GET single item by ID
   */
  protected httpGetById(id: string | number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${id}`);
  }

  /**
   * HTTP POST create new item
   */
  protected httpCreate(item: CreateDto): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}`, item);
  }

  /**
   * HTTP PUT update existing item
   */
  protected httpUpdate(id: string | number, item: UpdateDto): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${id}`, item);
  }

  /**
   * HTTP DELETE item
   */
  protected httpDelete(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Load all items with optional filtering and pagination
   */
  loadItems(filter?: Partial<F>, pagination?: Partial<Pagination>): Observable<{ items: T[]; pagination: Pagination }> {
    this.setLoading('list', true);
    this.clearError();

    // Update filter if provided
    if (filter) {
      this.setFilter(filter);
    }

    // Update pagination if provided
    if (pagination) {
      this.setPagination(pagination);
    }

    const currentFilter = this.filter();
    const currentPagination = this.pagination();

    return this.httpGetAll(currentFilter, currentPagination).pipe(
      tap(response => {
        this.setItems(response.items);
        this.setPagination(response.pagination);
        this.updateCache();
      }),
      catchError(error => {
        this.setError(this.extractErrorMessage(error));
        return of({ items: [], pagination: currentPagination });
      }),
      finalize(() => this.setLoading('list', false))
    );
  }

  /**
   * Load more items (for pagination)
   */
  loadMore(): Observable<{ items: T[]; pagination: Pagination }> {
    if (!this.canLoadMore()) {
      return of({ items: [], pagination: this.pagination() });
    }

    this.setLoading('list', true);
    this.clearError();

    const nextPage = this.pagination().page + 1;
    this.setPagination({ page: nextPage });

    return this.httpGetAll(this.filter(), this.pagination()).pipe(
      tap(response => {
        this.addItems(response.items);
        this.setPagination(response.pagination);
        this.updateCache();
      }),
      catchError(error => {
        // Revert pagination on error
        this.setPagination({ page: nextPage - 1 });
        this.setError(this.extractErrorMessage(error));
        return of({ items: [], pagination: this.pagination() });
      }),
      finalize(() => this.setLoading('list', false))
    );
  }

  /**
   * Load a single item by ID
   */
  loadItem(id: string | number): Observable<T> {
    this.setLoading('detail', true);
    this.clearError();

    return this.httpGetById(id).pipe(
      tap(item => {
        this.setCurrentItem(item);
        // Update item in list if it exists
        const existingItems = this.items();
        const existingIndex = existingItems.findIndex(existing => this.getItemId(existing) === id);
        if (existingIndex !== -1) {
          this.updateItem(item);
        }
      }),
      catchError(error => {
        this.setError(this.extractErrorMessage(error));
        throw error;
      }),
      finalize(() => this.setLoading('detail', false))
    );
  }

  /**
   * Create a new item
   */
  createItem(createDto: CreateDto): Observable<T> {
    this.setLoading('create', true);
    this.clearError();

    return this.httpCreate(createDto).pipe(
      tap(newItem => {
        this.addItem(newItem);
        this.setCurrentItem(newItem);
        this.invalidateCache();
      }),
      catchError(error => {
        this.setError(this.extractErrorMessage(error));
        throw error;
      }),
      finalize(() => this.setLoading('create', false))
    );
  }

  /**
   * Update an existing item
   */
  updateItemById(id: string | number, updateDto: UpdateDto): Observable<T> {
    this.setLoading('update', true);
    this.clearError();

    // Optimistic update if enabled
    let originalItem: T | undefined;
    if (this.config.enableOptimisticUpdates) {
      const items = this.items();
      originalItem = items.find(item => this.getItemId(item) === id);
      if (originalItem) {
        const optimisticItem = { ...originalItem, ...updateDto } as T;
        this.updateItem(optimisticItem);
      }
    }

    return this.httpUpdate(id, updateDto).pipe(
      tap(updatedItem => {
        this.updateItem(updatedItem);
        // Update current item if it's the same
        if (this.currentItem() && this.getItemId(this.currentItem()!) === id) {
          this.setCurrentItem(updatedItem);
        }
        this.invalidateCache();
      }),
      catchError(error => {
        // Revert optimistic update on error
        if (this.config.enableOptimisticUpdates && originalItem) {
          this.updateItem(originalItem);
        }
        this.setError(this.extractErrorMessage(error));
        throw error;
      }),
      finalize(() => this.setLoading('update', false))
    );
  }

  /**
   * Delete an item
   */
  deleteItem(id: string | number): Observable<void> {
    this.setLoading('delete', true);
    this.clearError();

    // Find the item to delete for potential rollback
    const items = this.items();
    const itemToDelete = items.find(item => this.getItemId(item) === id);

    // Optimistic delete if enabled
    if (this.config.enableOptimisticUpdates && itemToDelete) {
      this.removeItem(itemToDelete);
    }

    return this.httpDelete(id).pipe(
      tap(() => {
        // Remove from list if not already removed optimistically
        if (!this.config.enableOptimisticUpdates && itemToDelete) {
          this.removeItem(itemToDelete);
        }
        this.invalidateCache();
      }),
      catchError(error => {
        // Revert optimistic delete on error
        if (this.config.enableOptimisticUpdates && itemToDelete) {
          this.addItem(itemToDelete);
        }
        this.setError(this.extractErrorMessage(error));
        throw error;
      }),
      finalize(() => this.setLoading('delete', false))
    );
  }

  /**
   * Refresh the current data
   */
  refresh(): Observable<{ items: T[]; pagination: Pagination }> {
    this.invalidateCache();
    return this.loadItems();
  }

  /**
   * Search items by updating the filter
   */
  search(searchTerm: string): Observable<{ items: T[]; pagination: Pagination }> {
    this.setFilter({ search: searchTerm } as Partial<F>);
    this.resetPagination();
    return this.loadItems();
  }

  /**
   * Sort items by field and direction
   */
  sort(sortBy: string, sortDirection: 'asc' | 'desc' = 'asc'): Observable<{ items: T[]; pagination: Pagination }> {
    this.setFilter({ sortBy, sortDirection } as Partial<F>);
    this.resetPagination();
    return this.loadItems();
  }

  /**
   * Apply filter and reload data
   */
  applyFilter(filter: Partial<F>): Observable<{ items: T[]; pagination: Pagination }> {
    this.setFilter(filter);
    this.resetPagination();
    return this.loadItems();
  }

  /**
   * Clear filter and reload data
   */
  clearFilter(): Observable<{ items: T[]; pagination: Pagination }> {
    this.resetFilter();
    this.resetPagination();
    return this.loadItems();
  }

  /**
   * Enable auto-refresh
   */
  enableAutoRefresh(): void {
    if (this.config.enableAutoRefresh && !this.autoRefreshInterval) {
      this.autoRefreshInterval = window.setInterval(() => {
        if (!this.isLoading()) {
          this.refresh().subscribe();
        }
      }, this.config.autoRefreshInterval);
    }
  }

  /**
   * Disable auto-refresh
   */
  disableAutoRefresh(): void {
    if (this.autoRefreshInterval) {
      clearInterval(this.autoRefreshInterval);
      this.autoRefreshInterval = undefined;
    }
  }

  /**
   * Check if cache is valid
   */
  protected isCacheValid(): boolean {
    if (!this.config.enableCaching || !this.cacheTimestamp) {
      return false;
    }
    
    const now = new Date();
    const timeDiff = now.getTime() - this.cacheTimestamp.getTime();
    return timeDiff < this.config.cacheTimeout!;
  }

  /**
   * Update cache timestamp
   */
  protected updateCache(): void {
    if (this.config.enableCaching) {
      this.cacheTimestamp = new Date();
    }
  }

  /**
   * Invalidate cache
   */
  protected invalidateCache(): void {
    this.cacheTimestamp = undefined;
  }

  /**
   * Extract error message from error object
   */
  protected extractErrorMessage(error: any): string {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.error?.message) {
      return error.error.message;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (error?.error) {
      return JSON.stringify(error.error);
    }
    
    return 'An unexpected error occurred';
  }

  /**
   * Cleanup resources
   */
  ngOnDestroy(): void {
    this.disableAutoRefresh();
  }
}

/**
 * Utility type for creating typed stores
 */
export type TypedStore<T> = BaseStore<T, Partial<T>, Partial<T>, BaseFilter>;

/**
 * Helper function to create a store with default configuration
 */
export function createStore<T, CreateDto = Partial<T>, UpdateDto = Partial<T>, F extends BaseFilter = BaseFilter>(
  config: Partial<StoreConfig> = {}
): typeof BaseStore<T, CreateDto, UpdateDto, F> {
  return class extends BaseStore<T, CreateDto, UpdateDto, F> {
    constructor(http: HttpClient, baseUrl: string) {
      super(http, baseUrl, config);
    }

    protected getService(): CrudOperations<T, CreateDto, UpdateDto, F> {
      throw new Error('getService method is deprecated - HTTP operations are handled internally');
    }

    protected getItemId(item: T): string | number {
      throw new Error('getItemId method must be implemented');
    }

    protected getDefaultFilter(): F {
      throw new Error('getDefaultFilter method must be implemented');
    }

    protected compareItems(item1: T, item2: T): boolean {
      throw new Error('compareItems method must be implemented');
    }
  };
}