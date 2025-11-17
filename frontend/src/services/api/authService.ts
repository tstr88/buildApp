/**
 * Authentication API Service
 */

import { apiClient } from './client';

export interface RequestOTPPayload {
  phone: string;
}

export interface RequestOTPResponse {
  success: boolean;
  message: string;
  expiresIn: number;
  otp?: string; // Only in development mode
}

export interface VerifyOTPPayload {
  phone: string;
  otp: string;
}

export interface RegisterPayload {
  phone: string;
  otp: string;
  name: string;
  email?: string;
  language?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    phone: string;
    name: string;
    user_type: string;
    language: string;
  };
}

/**
 * Request OTP code
 */
export async function requestOTP(payload: RequestOTPPayload): Promise<RequestOTPResponse> {
  const response = await apiClient.post<RequestOTPResponse>('/auth/request-otp', payload);
  return response.data;
}

/**
 * Verify OTP and login (existing user)
 */
export async function verifyOTPLogin(payload: VerifyOTPPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/verify-otp', payload);

  // Store token and user data
  if (response.data.success && response.data.token) {
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }

  return response.data;
}

/**
 * Register new user with OTP verification
 */
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', payload);

  // Store token and user data
  if (response.data.success && response.data.token) {
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }

  return response.data;
}

/**
 * Logout
 */
export function logout(): void {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('auth_token');
}

/**
 * Get current user from local storage
 */
export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  return null;
}
