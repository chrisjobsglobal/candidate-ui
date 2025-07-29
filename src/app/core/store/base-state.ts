import { computed, signal, Signal, WritableSignal } from '@angular/core';

/**
 * Base pagination interface
 */
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Base filter interface - extend this for specific entity filters
 */
export interface BaseFilter {
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Loading states for different operations
 */
export interface LoadingStates {
  list: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  detail: boolean;
}

/**
 * Base state interface for CRUD operations
 */
export interface BaseState<T, F extends BaseFilter = BaseFilter> {
  // Core data
  items: T[];
  currentItem: T | null;
  
  // State management
  loading: LoadingStates;
  error: string | null;
  
  // Data management
  filter: F;
  pagination: Pagination;
  
  // Metadata
  lastUpdated: Date | null;
  isDirty: boolean;
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
};

/**
 * Default loading states
 */
export const DEFAULT_LOADING_STATES: LoadingStates = {
  list: false,
  create: false,
  update: false,
  delete: false,
  detail: false,
};

/**
 * Default base filter
 */
export const DEFAULT_BASE_FILTER: BaseFilter = {
  search: '',
  sortBy: undefined,
  sortDirection: 'asc',
};

/**
 * Abstract base state class with signal-based reactive state management
 */
export abstract class BaseStateClass<T, F extends BaseFilter = BaseFilter> {
  // Private signals
  private readonly _items = signal<T[]>([]);
  private readonly _currentItem = signal<T | null>(null);
  private readonly _loading = signal<LoadingStates>({ ...DEFAULT_LOADING_STATES });
  private readonly _error = signal<string | null>(null);
  private readonly _filter = signal<F>(this.getDefaultFilter());
  private readonly _pagination = signal<Pagination>({ ...DEFAULT_PAGINATION });
  private readonly _lastUpdated = signal<Date | null>(null);
  private readonly _isDirty = signal<boolean>(false);

  // Public readonly signals
  readonly items: Signal<T[]> = this._items.asReadonly();
  readonly currentItem: Signal<T | null> = this._currentItem.asReadonly();
  readonly loading: Signal<LoadingStates> = this._loading.asReadonly();
  readonly error: Signal<string | null> = this._error.asReadonly();
  readonly filter: Signal<F> = this._filter.asReadonly();
  readonly pagination: Signal<Pagination> = this._pagination.asReadonly();
  readonly lastUpdated: Signal<Date | null> = this._lastUpdated.asReadonly();
  readonly isDirty: Signal<boolean> = this._isDirty.asReadonly();

  // Computed signals
  readonly hasItems = computed(() => this.items().length > 0);
  readonly isEmpty = computed(() => this.items().length === 0);
  readonly isLoading = computed(() => Object.values(this.loading()).some(loading => loading));
  readonly hasError = computed(() => !!this.error());
  readonly canLoadMore = computed(() => {
    const pagination = this.pagination();
    return pagination.page < pagination.totalPages;
  });
  readonly selectedIndex = computed(() => {
    const current = this.currentItem();
    return current ? this.items().findIndex(item => this.compareItems(item, current)) : -1;
  });

  /**
   * Abstract method to get default filter - implement in concrete classes
   */
  protected abstract getDefaultFilter(): F;

  /**
   * Abstract method to compare items for equality - implement in concrete classes
   */
  protected abstract compareItems(item1: T, item2: T): boolean;

  /**
   * Set items and automatically select first item if no current item exists
   */
  setItems(items: T[]): void {
    this._items.set(items);
    this._lastUpdated.set(new Date());
    this._isDirty.set(false);
    
    // Auto-select first item if no current item and items exist
    if (!this.currentItem() && items.length > 0) {
      this.setCurrentItem(items[0]);
    }
  }

  /**
   * Add items to the existing list (useful for pagination)
   */
  addItems(items: T[]): void {
    const currentItems = this._items();
    this._items.set([...currentItems, ...items]);
    this._lastUpdated.set(new Date());
    this._isDirty.set(false);
  }

  /**
   * Add a single item to the list
   */
  addItem(item: T): void {
    const currentItems = this._items();
    this._items.set([...currentItems, item]);
    this._lastUpdated.set(new Date());
    this._isDirty.set(true);
  }

  /**
   * Update an existing item in the list
   */
  updateItem(updatedItem: T): void {
    const currentItems = this._items();
    const index = currentItems.findIndex(item => this.compareItems(item, updatedItem));
    
    if (index !== -1) {
      const newItems = [...currentItems];
      newItems[index] = updatedItem;
      this._items.set(newItems);
      
      // Update current item if it's the same item
      if (this.currentItem() && this.compareItems(this.currentItem()!, updatedItem)) {
        this._currentItem.set(updatedItem);
      }
      
      this._lastUpdated.set(new Date());
      this._isDirty.set(true);
    }
  }

  /**
   * Remove an item from the list
   */
  removeItem(itemToRemove: T): void {
    const currentItems = this._items();
    const filteredItems = currentItems.filter(item => !this.compareItems(item, itemToRemove));
    this._items.set(filteredItems);
    
    // Clear current item if it was the removed item
    if (this.currentItem() && this.compareItems(this.currentItem()!, itemToRemove)) {
      this._currentItem.set(filteredItems.length > 0 ? filteredItems[0] : null);
    }
    
    this._lastUpdated.set(new Date());
    this._isDirty.set(true);
  }

  /**
   * Set the current selected item
   */
  setCurrentItem(item: T | null): void {
    this._currentItem.set(item);
  }

  /**
   * Set current item by index
   */
  setCurrentItemByIndex(index: number): void {
    const items = this.items();
    if (index >= 0 && index < items.length) {
      this.setCurrentItem(items[index]);
    }
  }

  /**
   * Navigate to next item
   */
  selectNext(): void {
    const currentIndex = this.selectedIndex();
    const itemsLength = this.items().length;
    
    if (currentIndex < itemsLength - 1) {
      this.setCurrentItemByIndex(currentIndex + 1);
    }
  }

  /**
   * Navigate to previous item
   */
  selectPrevious(): void {
    const currentIndex = this.selectedIndex();
    
    if (currentIndex > 0) {
      this.setCurrentItemByIndex(currentIndex - 1);
    }
  }

  /**
   * Set loading state for a specific operation
   */
  setLoading(operation: keyof LoadingStates, isLoading: boolean): void {
    const currentLoading = this._loading();
    this._loading.set({
      ...currentLoading,
      [operation]: isLoading,
    });
  }

  /**
   * Set error state
   */
  setError(error: string | null): void {
    this._error.set(error);
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * Update filter
   */
  setFilter(filter: Partial<F>): void {
    const currentFilter = this._filter();
    this._filter.set({ ...currentFilter, ...filter });
    this._isDirty.set(true);
  }

  /**
   * Reset filter to default
   */
  resetFilter(): void {
    this._filter.set(this.getDefaultFilter());
    this._isDirty.set(true);
  }

  /**
   * Update pagination
   */
  setPagination(pagination: Partial<Pagination>): void {
    const currentPagination = this._pagination();
    this._pagination.set({ ...currentPagination, ...pagination });
  }

  /**
   * Reset pagination to first page
   */
  resetPagination(): void {
    this.setPagination({ page: 1 });
  }

  /**
   * Go to next page
   */
  nextPage(): void {
    const currentPagination = this._pagination();
    if (currentPagination.page < currentPagination.totalPages) {
      this.setPagination({ page: currentPagination.page + 1 });
    }
  }

  /**
   * Go to previous page
   */
  previousPage(): void {
    const currentPagination = this._pagination();
    if (currentPagination.page > 1) {
      this.setPagination({ page: currentPagination.page - 1 });
    }
  }

  /**
   * Clear all data and reset to initial state
   */
  reset(): void {
    this._items.set([]);
    this._currentItem.set(null);
    this._loading.set({ ...DEFAULT_LOADING_STATES });
    this._error.set(null);
    this._filter.set(this.getDefaultFilter());
    this._pagination.set({ ...DEFAULT_PAGINATION });
    this._lastUpdated.set(null);
    this._isDirty.set(false);
  }

  /**
   * Get current state snapshot
   */
  getSnapshot(): BaseState<T, F> {
    return {
      items: this.items(),
      currentItem: this.currentItem(),
      loading: this.loading(),
      error: this.error(),
      filter: this.filter(),
      pagination: this.pagination(),
      lastUpdated: this.lastUpdated(),
      isDirty: this.isDirty(),
    };
  }
}