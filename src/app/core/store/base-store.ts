import { Injectable } from '@angular/core';
import { Observable, catchError, finalize, tap, of } from 'rxjs';
import { BaseStateClass, BaseFilter, Pagination } from './base-state';

/**
 * Base CRUD operations interface
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
};

/**
 * Abstract base store class with signal-based state management and CRUD operations
 */
@Injectable()
export abstract class BaseStore<
  T,
  CreateDto = Partial<T>,
  UpdateDto = Partial<T>,
  F extends BaseFilter = BaseFilter
> extends BaseStateClass<T, F> {
  
  protected readonly config: StoreConfig;
  private autoRefreshInterval?: number;
  private cacheTimestamp?: Date;

  constructor(config: Partial<StoreConfig> = {}) {
    super();
    this.config = { ...DEFAULT_STORE_CONFIG, ...config };
  }

  /**
   * Abstract method to get the service for CRUD operations
   */
  protected abstract getService(): CrudOperations<T, CreateDto, UpdateDto, F>;

  /**
   * Abstract method to extract ID from an item
   */
  protected abstract getItemId(item: T): string | number;

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

    return this.getService().getAll(currentFilter, currentPagination).pipe(
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

    return this.getService().getAll(this.filter(), this.pagination()).pipe(
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

    return this.getService().getById(id).pipe(
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

    return this.getService().create(createDto).pipe(
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

    return this.getService().update(id, updateDto).pipe(
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

    return this.getService().delete(id).pipe(
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
    constructor() {
      super(config);
    }

    protected getService(): CrudOperations<T, CreateDto, UpdateDto, F> {
      throw new Error('getService method must be implemented');
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