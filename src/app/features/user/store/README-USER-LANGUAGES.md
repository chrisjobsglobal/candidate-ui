# User Languages Store Implementation

This document describes the implementation of the User Languages Store that extends the BaseStore for CRUD operations on user languages.

## API Endpoints

The store implements the following endpoints:

### GET /users/me/languages
Retrieves the current user's languages list with pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 10)

**Response:**
```json
{
  "data": [
    {
      "name": "Arabic",
      "proficiency": "native",
      "id": 1,
      "user_id": "01985634-4b3c-7fac-ac03-e444ff5cd588"
    }
  ],
  "total": 1,
  "page": 1,
  "per_page": 10,
  "total_pages": 1
}
```

### POST /users/me/languages
Creates a new language for the current user.

**Request Body:**
```json
{
  "name": "Spanish",
  "proficiency": "intermediate"
}
```

**Response:**
```json
{
  "name": "Spanish",
  "proficiency": "intermediate",
  "id": 2,
  "user_id": "01985634-4b3c-7fac-ac03-e444ff5cd588"
}
```

### PUT /users/me/languages/{id}
Updates an existing language.

**Request Body:**
```json
{
  "name": "Spanish",
  "proficiency": "advanced"
}
```

### DELETE /users/me/languages/{id}
Deletes a language by ID.

## Models

### UserLanguage
Located in `src/app/core/models/user.model.ts`:

```typescript
export interface UserLanguage {
  id: number;
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
  user_id: string;
}
```

### CreateUserLanguageDto
```typescript
export interface CreateUserLanguageDto {
  name: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
}
```

### UpdateUserLanguageDto
```typescript
export interface UpdateUserLanguageDto {
  name?: string;
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'native';
}
```

## Usage Examples

### Basic Usage

```typescript
import { inject } from '@angular/core';
import { UserLanguagesStore } from './user-languages.store';

export class MyComponent {
  private readonly userLanguagesStore = inject(UserLanguagesStore);

  // Access reactive signals
  readonly languages = this.userLanguagesStore.items;
  readonly isLoading = this.userLanguagesStore.isLoading;
  readonly error = this.userLanguagesStore.error;

  ngOnInit() {
    // Load all languages
    this.userLanguagesStore.loadItems().subscribe();
  }
}
```

### CRUD Operations

```typescript
// Create a new language
const newLanguage: CreateUserLanguageDto = {
  name: 'French',
  proficiency: 'beginner'
};

this.userLanguagesStore.createItem(newLanguage).subscribe({
  next: (language) => console.log('Language created:', language),
  error: (error) => console.error('Error:', error)
});

// Update a language
const updates: UpdateUserLanguageDto = {
  proficiency: 'intermediate'
};

this.userLanguagesStore.updateItem(languageId, updates).subscribe({
  next: (language) => console.log('Language updated:', language),
  error: (error) => console.error('Error:', error)
});

// Delete a language
this.userLanguagesStore.deleteItem(languageId).subscribe({
  next: () => console.log('Language deleted'),
  error: (error) => console.error('Error:', error)
});
```

### Filtering and Sorting

```typescript
// Filter by proficiency level
this.userLanguagesStore.getLanguagesByProficiency('native').subscribe({
  next: (result) => console.log('Native languages:', result.items)
});

// Filter by name
this.userLanguagesStore.getLanguagesByName('English').subscribe({
  next: (result) => console.log('English entries:', result.items)
});

// Sort by name
this.userLanguagesStore.sortByName('asc').subscribe({
  next: (result) => console.log('Sorted languages:', result.items)
});

// Sort by proficiency
this.userLanguagesStore.sortByProficiency('desc').subscribe({
  next: (result) => console.log('Languages by proficiency:', result.items)
});
```

### Convenience Methods

```typescript
// Get all native languages
this.userLanguagesStore.getNativeLanguages().subscribe({
  next: (result) => console.log('Native languages:', result.items)
});

// Get all non-native languages
this.userLanguagesStore.getNonNativeLanguages().subscribe({
  next: (result) => console.log('Learning languages:', result.items)
});
```

## Integration with Profile Component

The `ProfileLanguagesComponent` uses this store to display and manage user languages:

```typescript
export class ProfileLanguagesComponent implements OnInit {
  private readonly userLanguagesStore = inject(UserLanguagesStore);

  readonly languages = this.userLanguagesStore.items;
  readonly isLoading = this.userLanguagesStore.isLoading;
  readonly error = this.userLanguagesStore.error;

  ngOnInit(): void {
    this.loadLanguages();
  }

  loadLanguages(): void {
    this.userLanguagesStore.loadItems().subscribe();
  }

  onRemoveLanguage(language: UserLanguage): void {
    this.userLanguagesStore.deleteItem(language.id).subscribe();
  }
}
```

## Authentication

The store automatically handles authentication by:
1. Reading `access_token` and `token_type` from localStorage
2. Adding Authorization header to all requests
3. Throwing errors if no token is available

## Error Handling

The store provides reactive error handling through the `error` signal. Common error scenarios:
- Network connectivity issues
- Authentication failures (401)
- Validation errors (400)
- Server errors (500)

## State Management

The store maintains the following reactive state:
- `items`: Signal containing the current list of languages
- `isLoading`: Signal indicating loading state for different operations
- `error`: Signal containing any error that occurred
- `pagination`: Signal with pagination information
- `filter`: Signal with current filter settings
