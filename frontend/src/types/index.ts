// Global type definitions for buildApp

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'buyer' | 'supplier' | 'admin';
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type Language = 'ka' | 'en';

export interface AppConfig {
  apiBaseUrl: string;
  defaultLanguage: Language;
  appName: string;
}

// Re-export fence types
export * from './fence';

// Re-export slab types
export * from './slab';

// Re-export project types
export * from './project';
