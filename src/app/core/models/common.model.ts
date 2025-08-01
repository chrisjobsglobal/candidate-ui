/**
 * Country model for country selection dropdown
 */
export interface Country {
  value: string;
  label: string;
}

/**
 * API response for countries endpoint
 */
export interface CountryResponse {
  countries: Country[];
}

/**
 * Common response interface for API calls
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Upload response interface
 */
export interface UploadResponse {
  success: boolean;
  message: string;
  url?: string;
  avatar_url?: string;
  cover_photo_url?: string;
}

/**
 * Message interface for user feedback
 */
export interface UserMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}
