# User Skills Store Implementation

This document describes the implementation of the User Skills Store that extends the BaseStore for CRUD operations on user skills.

## API Endpoints

The store implements the following endpoints:

### GET /users/me/skills
Retrieves the current user's skills list.

**Response:**
```json
[
  {
    "skill_name": "Fencing",
    "rating": 30,
    "id": 1,
    "user_id": "01986ffa-a3e6-787e-8e94-51a78409e3be",
    "stars": 3
  }
]
```

### POST /users/me/skills
Creates a new skill for the current user.

**Request Body:**
```json
{
  "skill_name": "Fencing",
  "rating": 30
}
```

**Response:**
```json
{
  "skill_name": "Fencing",
  "rating": 30,
  "id": 1,
  "user_id": "01986ffa-a3e6-787e-8e94-51a78409e3be",
  "stars": 3
}
```

## Models

### UserSkill
Located in `src/app/core/models/user.model.ts`:

```typescript
export interface UserSkill {
  id: number;
  skill_name: string;
  rating: number;
  user_id: string;
  stars: number;
}
```

### DTOs
Located in `src/app/features/user/store/user-skills.store.ts`:

```typescript
export interface CreateUserSkillDto {
  skill_name: string;
  rating: number;
}

export interface UpdateUserSkillDto {
  skill_name?: string;
  rating?: number;
}

export interface UserSkillsFilter extends BaseFilter {
  skill_name?: string;
  min_rating?: number;
  max_rating?: number;
  min_stars?: number;
  max_stars?: number;
}
```

## Store Implementation

The `UserSkillsStore` extends `BaseStore` and provides:

### Core CRUD Operations (inherited from BaseStore)
- `loadItems()` - Load all skills with filtering and pagination
- `loadItem(id)` - Load a specific skill by ID
- `createItem(dto)` - Create a new skill
- `updateItemById(id, dto)` - Update an existing skill
- `deleteItem(id)` - Delete a skill

### Additional Convenience Methods
- `getSkillsByName(skillName)` - Filter skills by name
- `getSkillsByRating(minRating, maxRating?)` - Filter skills by rating range
- `getSkillsByStars(minStars, maxStars?)` - Filter skills by star rating
- `sortByRating(direction)` - Sort skills by rating
- `sortByStars(direction)` - Sort skills by stars
- `sortByName(direction)` - Sort skills alphabetically

### Signals (inherited from BaseStore)
- `items()` - Current list of skills
- `currentItem()` - Currently selected skill
- `loading()` - Loading states for different operations
- `error()` - Current error message
- `filter()` - Current filter settings
- `pagination()` - Current pagination state

## Usage Example

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { UserSkillsStore, CreateUserSkillDto } from './path/to/user-skills.store';

@Component({
  // component configuration
})
export class MyComponent implements OnInit {
  private skillsStore = inject(UserSkillsStore);

  ngOnInit() {
    // Load all skills
    this.skillsStore.loadItems().subscribe();
  }

  addSkill() {
    const newSkill: CreateUserSkillDto = {
      skill_name: 'TypeScript',
      rating: 85
    };

    this.skillsStore.createItem(newSkill).subscribe({
      next: (skill) => console.log('Skill created:', skill),
      error: (error) => console.error('Error:', error)
    });
  }

  // Access reactive data
  get skills() {
    return this.skillsStore.items();
  }

  get isLoading() {
    return this.skillsStore.loading();
  }

  get hasError() {
    return this.skillsStore.error();
  }
}
```

## Test Component

A comprehensive test component is available at `/app/test-user-skills` that demonstrates:

- Creating new skills
- Listing and filtering skills
- Searching skills
- Sorting skills by different criteria
- Pagination
- Delete operations
- Loading states and error handling

To access the test component, navigate to `http://localhost:4200/app/test-user-skills` when the application is running.

## Configuration

The store is configured with:
- **Base URL**: `{apiBaseUrl}/users/me/skills`
- **Optimistic Updates**: Enabled
- **Caching**: Disabled
- **Pagination**: Standard FastAPI pagination parameters

## Dependencies

- Angular Signals for reactive state management
- HttpClient for API communication
- BaseStore for common CRUD functionality
- ConfigService for API URL configuration
