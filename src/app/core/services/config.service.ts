import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface AppConfig {
  apiBaseUrl: string;
  uploadsBaseUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private readonly config: AppConfig = {
    apiBaseUrl: environment.apiBaseUrl,
    uploadsBaseUrl: environment.uploadsBaseUrl
  };

  getApiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  getUploadsBaseUrl(): string {
    return this.config.uploadsBaseUrl;
  }

  /**
   * Get full URL for uploaded file
   */
  getUploadUrl(relativePath: string): string {
    if (!relativePath) return '';
    
    // If it's already a full URL, return as is
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      // Check if it's using the wrong port and fix it
      if (relativePath.includes('localhost:49002')) {
        return relativePath.replace('localhost:49002', 'localhost:8000');
      }
      return relativePath;
    }
    
    // If it's a relative path, prepend the uploads base URL
    const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
    return `${this.config.uploadsBaseUrl}/${cleanPath}`;
  }

  /**
   * Update configuration (useful for different environments)
   */
  updateConfig(newConfig: Partial<AppConfig>): void {
    Object.assign(this.config, newConfig);
  }
}
