import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ApiError {
  success: false;
  error: string;
}

export interface RequestOTPResponse {
  success: true;
  message: string;
  expiresIn?: number;
  remainingAttempts?: number;
  // Dev mode auto-login fields
  registration_required?: boolean;
  temp_token?: string;
  token?: string;
  user?: User;
}

export interface VerifyOTPResponse {
  success: true;
  registration_required: boolean;
  temp_token?: string;
  token?: string;
  user?: User;
  message?: string;
}

export interface CompleteRegistrationResponse {
  success: true;
  token: string;
  user: User;
  message: string;
}

export interface User {
  id: string;
  phone: string;
  name: string;
  user_type: string;
  buyer_role?: string;
  language: string;
}

/**
 * Request an OTP code
 */
export async function requestOTP(phone: string): Promise<RequestOTPResponse> {
  try {
    const response = await api.post<RequestOTPResponse>('/auth/request-otp', { phone });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.error || 'Failed to request OTP');
    }
    throw new Error('Network error. Please check your connection.');
  }
}

/**
 * Verify OTP code
 */
export async function verifyOTP(phone: string, otp: string): Promise<VerifyOTPResponse> {
  try {
    const response = await api.post<VerifyOTPResponse>('/auth/verify-otp', { phone, otp });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.error || 'Failed to verify OTP');
    }
    throw new Error('Network error. Please check your connection.');
  }
}

/**
 * Complete registration
 */
export async function completeRegistration(
  temp_token: string,
  name: string,
  user_type: 'buyer' | 'supplier',
  buyer_role?: 'homeowner' | 'contractor',
  language?: 'ka' | 'en'
): Promise<CompleteRegistrationResponse> {
  try {
    const response = await api.post<CompleteRegistrationResponse>('/auth/complete-registration', {
      temp_token,
      name,
      user_type,
      buyer_role,
      language,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.error || 'Registration failed');
    }
    throw new Error('Network error. Please check your connection.');
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(token: string): Promise<{ success: true; user: User }> {
  try {
    const response = await api.get<{ success: true; user: User }>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.error || 'Failed to get user');
    }
    throw new Error('Network error. Please check your connection.');
  }
}

/**
 * Update user preferences (language, etc.)
 */
export async function updatePreferences(
  token: string,
  preferences: { language?: 'ka' | 'en' }
): Promise<{ success: true; user: User }> {
  try {
    const response = await api.patch<{ success: true; user: User }>(
      '/auth/update-preferences',
      preferences,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiError>;
      throw new Error(axiosError.response?.data?.error || 'Failed to update preferences');
    }
    throw new Error('Network error. Please check your connection.');
  }
}

/**
 * Logout
 */
export async function logout(token: string): Promise<void> {
  try {
    await api.post(
      '/auth/logout',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    // Silently fail logout on server side
    console.error('Logout error:', error);
  }
}
