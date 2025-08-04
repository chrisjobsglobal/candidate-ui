# User Experiences Store Implementation

This document describes the implementation of the User Experiences Store that extends the BaseStore for CRUD operations on user work experiences.

## API Endpoints

The store implements the following endpoints:

### GET /users/me/experiences
Retrieves the current user's work experiences list with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Number of items per page (default: 10)

**Response:**
```json
{
  "data": [
    {
      "title": "Senior Software Engineer",
      "company": "TechCorp Inc.",
      "location": "San Francisco, CA",
      "start_date": "2022-01-15",
      "end_date": null,
      "is_current": true,
      "description": "Leading a team of 5 developers in building scalable web applications.",
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

### POST /users/me/experiences
Creates a new experience for the current user.

**Request Body:**
```json
{
  "title": "Senior Software Engineer",
  "company": "TechCorp Inc.",
  "location": "San Francisco, CA",
  "start_date": "2022-01-15",
  "end_date": null,
  "is_current": true,
  "description": "Leading a team of 5 developers in building scalable web applications."
}
```

### PUT /users/me/experiences/{id}
Updates an existing experience.

**Request Body:**
```json
{
  "title": "Lead Software Engineer",
  "description": "Updated description of responsibilities."
}
```

### DELETE /users/me/experiences/{id}
Deletes an experience.

## Models

### UserExperience
Located in `src/app/core/models/user.model.ts`:

```typescript
export interface UserExperience {
  id: number;
  title: string;
  company: string;
  location: string;
  start_date: string; // ISO date string
  end_date: string | null;
  is_current: boolean;
  description: string;
  user_id: string;
}
```

### CreateUserExperienceDto
Used for creating new experiences:

```typescript
export interface CreateUserExperienceDto {
  title: string;
  company: string;
  location: string;
  start_date: string; // ISO date string
  end_date?: string | null;
  is_current: boolean;
  description: string;
}
```

### UpdateUserExperienceDto
Used for updating existing experiences:

```typescript
export interface UpdateUserExperienceDto {
  title?: string;
  company?: string;
  location?: string;
  start_date?: string;
  end_date?: string | null;
  is_current?: boolean;
  description?: string;
}
```

## Store Usage

### Basic Operations

```typescript
import { UserExperiencesStore } from './store/user-experiences.store';

// Inject the store
private readonly experiencesStore = inject(UserExperiencesStore);

// Load all experiences
this.experiencesStore.loadItems().subscribe(response => {
  console.log('Experiences:', response.items);
  console.log('Pagination:', response.pagination);
});

// Create a new experience
const newExperience: CreateUserExperienceDto = {
  title: 'Software Engineer',
  company: 'Example Corp',
  location: 'Remote',
  start_date: '2023-01-01',
  end_date: null,
  is_current: true,
  description: 'Working on various projects'
};

this.experiencesStore.createItem(newExperience).subscribe(created => {
  console.log('Created experience:', created);
});

// Update an experience
this.experiencesStore.updateItemById(1, { 
  title: 'Senior Software Engineer',
  description: 'Updated responsibilities'
}).subscribe(updated => {
  console.log('Updated experience:', updated);
});

// Delete an experience
this.experiencesStore.deleteItem(1).subscribe(() => {
  console.log('Experience deleted');
});

// Get a specific experience by ID
this.experiencesStore.getItemById(1).subscribe(experience => {
  console.log('Experience:', experience);
});
```

### Filtering and Searching

```typescript
// Filter by company
this.experiencesStore.getExperiencesByCompany('TechCorp Inc.').subscribe(response => {
  console.log('TechCorp experiences:', response.items);
});

// Filter by location
this.experiencesStore.getExperiencesByLocation('San Francisco, CA').subscribe(response => {
  console.log('SF experiences:', response.items);
});

// Get current experiences only
this.experiencesStore.getCurrentExperiences().subscribe(response => {
  console.log('Current experiences:', response.items);
});

// Get past experiences only
this.experiencesStore.getPastExperiences().subscribe(response => {
  console.log('Past experiences:', response.items);
});

// Filter by date range
this.experiencesStore.getExperiencesByDateRange('2020-01-01', '2022-12-31').subscribe(response => {
  console.log('Experiences from 2020-2022:', response.items);
});
```

### Sorting

```typescript
// Sort by start date (most recent first)
this.experiencesStore.sortByStartDate('desc').subscribe(response => {
  console.log('Experiences by date:', response.items);
});

// Sort by title alphabetically
this.experiencesStore.sortByTitle('asc').subscribe(response => {
  console.log('Experiences by title:', response.items);
});

// Sort by company name
this.experiencesStore.sortByCompany('asc').subscribe(response => {
  console.log('Experiences by company:', response.items);
});
```

### Pagination

```typescript
// Load specific page
this.experiencesStore.loadItems({}, { page: 2, limit: 5 }).subscribe(response => {
  console.log('Page 2:', response.items);
  console.log('Pagination info:', response.pagination);
});

// Navigate pages
this.experiencesStore.nextPage().subscribe(response => {
  console.log('Next page:', response.items);
});

this.experiencesStore.previousPage().subscribe(response => {
  console.log('Previous page:', response.items);
});
```

### Advanced Filtering

```typescript
// Custom filter
const filter: Partial<UserExperiencesFilter> = {
  title: 'Engineer',
  is_current: true,
  location: 'San Francisco'
};

this.experiencesStore.applyFilter(filter).subscribe(response => {
  console.log('Filtered experiences:', response.items);
});

// Search with text
this.experiencesStore.search('Angular').subscribe(response => {
  console.log('Angular-related experiences:', response.items);
});
```

## Component Integration

### Profile Experiences Component

The `ProfileExperiencesComponent` demonstrates how to integrate the store with full CRUD functionality:

```typescript
export class ProfileExperiencesComponent implements OnInit {
  private readonly experiencesStore = inject(UserExperiencesStore);

  experiences = signal<UserExperience[]>([]);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  
  // Modal state
  showModal = signal<boolean>(false);
  selectedExperience = signal<UserExperience | null>(null);

  ngOnInit() {
    this.loadExperiences();
  }

  loadExperiences() {
    this.isLoading.set(true);
    this.error.set(null);

    this.experiencesStore.loadItems().subscribe({
      next: (response) => {
        this.experiences.set(response.items);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load experiences:', err);
        this.error.set('Failed to load experiences. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  // Modal methods
  openAddModal() {
    this.selectedExperience.set(null);
    this.showModal.set(true);
  }

  openEditModal(experience: UserExperience) {
    this.selectedExperience.set(experience);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedExperience.set(null);
  }

  // CRUD event handlers
  onExperienceAdded(experience: UserExperience) {
    const currentExperiences = this.experiences();
    this.experiences.set([experience, ...currentExperiences]);
  }

  onExperienceUpdated(updatedExperience: UserExperience) {
    const currentExperiences = this.experiences();
    const updatedExperiences = currentExperiences.map(exp => 
      exp.id === updatedExperience.id ? updatedExperience : exp
    );
    this.experiences.set(updatedExperiences);
  }

  onExperienceDeleted(experienceId: number) {
    const currentExperiences = this.experiences();
    const filteredExperiences = currentExperiences.filter(exp => exp.id !== experienceId);
    this.experiences.set(filteredExperiences);
  }
}
```

### Experience Modal Component

The `ExperienceModalComponent` provides a form for creating and editing experiences:

```typescript
export class ExperienceModalComponent implements OnInit {
  experience = input<UserExperience | null>(null);
  closeModal = output<void>();
  experienceAdded = output<UserExperience>();
  experienceUpdated = output<UserExperience>();
  experienceDeleted = output<number>();

  private readonly experiencesStore = inject(UserExperiencesStore);

  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  isEdit = signal<boolean>(false);

  formData = {
    title: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: ''
  };

  ngOnInit() {
    const exp = this.experience();
    if (exp) {
      this.isEdit.set(true);
      // Populate form with existing data
      this.formData = {
        title: exp.title,
        company: exp.company,
        location: exp.location,
        start_date: exp.start_date,
        end_date: exp.end_date || '',
        is_current: exp.is_current,
        description: exp.description
      };
    }
  }

  createExperience() {
    const createDto: CreateUserExperienceDto = {
      title: this.formData.title.trim(),
      company: this.formData.company.trim(),
      location: this.formData.location.trim(),
      start_date: this.formData.start_date,
      end_date: this.formData.is_current ? null : this.formData.end_date,
      is_current: this.formData.is_current,
      description: this.formData.description.trim()
    };

    this.experiencesStore.createItem(createDto).subscribe({
      next: (created) => {
        this.experienceAdded.emit(created);
        this.onClose();
      },
      error: (err) => {
        this.error.set('Failed to create experience. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  updateExperience() {
    const exp = this.experience();
    if (!exp) return;

    const updateDto: UpdateUserExperienceDto = {
      title: this.formData.title.trim(),
      company: this.formData.company.trim(),
      location: this.formData.location.trim(),
      start_date: this.formData.start_date,
      end_date: this.formData.is_current ? null : this.formData.end_date,
      is_current: this.formData.is_current,
      description: this.formData.description.trim()
    };

    this.experiencesStore.updateItemById(exp.id, updateDto).subscribe({
      next: (updated) => {
        this.experienceUpdated.emit(updated);
        this.onClose();
      },
      error: (err) => {
        this.error.set('Failed to update experience. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  deleteExperience() {
    const exp = this.experience();
    if (!exp) return;

    if (!confirm('Are you sure you want to delete this experience?')) {
      return;
    }

    this.experiencesStore.deleteItem(exp.id).subscribe({
      next: () => {
        this.experienceDeleted.emit(exp.id);
        this.onClose();
      },
      error: (err) => {
        this.error.set('Failed to delete experience. Please try again.');
        this.isLoading.set(false);
      }
    });
  }
}
```

## Error Handling

The store includes comprehensive error handling for authentication and HTTP errors:

```typescript
// Authentication errors are handled automatically
// HTTP errors are propagated to the caller
this.experiencesStore.loadItems().subscribe({
  next: (response) => {
    // Handle success
  },
  error: (error) => {
    if (error.message === 'No authentication token available') {
      // Redirect to login
    } else {
      // Handle other errors
    }
  }
});
```

## Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Authentication handling with JWT tokens
- ✅ Pagination support
- ✅ Filtering and searching
- ✅ Sorting capabilities
- ✅ Error handling
- ✅ TypeScript type safety
- ✅ Observable-based reactive patterns
- ✅ Optimistic updates (configurable)
- ✅ FastAPI response format handling

## Notes

- All operations require authentication via JWT token stored in localStorage
- The store automatically handles the FastAPI pagination response format
- Date fields use ISO string format for API compatibility
- The store extends BaseStore for consistent behavior across the application
