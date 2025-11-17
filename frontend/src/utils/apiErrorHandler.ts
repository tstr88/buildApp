/**
 * API Error Handler
 * Centralized error handling for API requests
 */

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
    stack?: string;
  };
}

export interface ApiErrorContext {
  endpoint?: string;
  method?: string;
  status?: number;
}

/**
 * Parse API error response
 */
export function parseApiError(error: any, context?: ApiErrorContext): {
  code: string;
  message: string;
  details?: any;
  userMessage: string;
} {
  // Network error (offline, server unreachable)
  if (!error.response && error.request) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Network error occurred',
      userMessage:
        'Unable to connect to the server. Please check your internet connection and try again.',
    };
  }

  // Server returned error response
  if (error.response?.data?.error) {
    const apiError = error.response.data.error;
    return {
      code: apiError.code,
      message: apiError.message,
      details: apiError.details,
      userMessage: getUserFriendlyMessage(apiError.code, apiError.message, apiError.details),
    };
  }

  // HTTP status error without structured response
  if (error.response) {
    const status = error.response.status;
    return {
      code: `HTTP_${status}`,
      message: error.response.statusText || 'Unknown error',
      userMessage: getHttpStatusMessage(status),
    };
  }

  // Unknown error
  return {
    code: 'UNKNOWN_ERROR',
    message: error.message || 'An unknown error occurred',
    userMessage: 'Something went wrong. Please try again.',
  };
}

/**
 * Convert error codes to user-friendly messages
 */
function getUserFriendlyMessage(code: string, serverMessage: string, details?: any): string {
  const messages: Record<string, string> = {
    VALIDATION_ERROR: details?.field
      ? `Invalid ${details.field}: ${serverMessage}`
      : 'Please check your input and try again.',
    NOT_FOUND: 'The requested resource was not found.',
    UNAUTHORIZED: 'Your session has expired. Please log in again.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    CONFLICT: 'This resource already exists or conflicts with existing data.',
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment before trying again.',

    // Business logic errors
    NO_SUPPLIERS_SELECTED: 'Please select at least one supplier.',
    OFFER_EXPIRED: 'This offer has expired. Please request a new quote.',
    CONFIRMATION_WINDOW_EXPIRED: 'The 24-hour confirmation window has expired.',
    WRONG_PHONE_CONFIRMATION: 'Only the person who placed this order can confirm delivery.',
    SKU_UNAVAILABLE: 'This item is no longer available. Try requesting a quote instead.',
    OUTSIDE_DELIVERY_ZONE: 'This project is outside the delivery area.',
    DUPLICATE_ORDER: 'This order has already been placed.',
    OTP_EXPIRED: 'Verification code expired. Please request a new one.',
    INVALID_OTP: 'Invalid verification code. Please check and try again.',
    RESOURCE_PAUSED: 'This resource is currently unavailable.',

    // File upload errors
    FILE_UPLOAD_ERROR: 'File upload failed. Please check the file and try again.',

    // Server errors
    INTERNAL_SERVER_ERROR: 'An unexpected error occurred. Please try again.',
    DATABASE_ERROR: 'A database error occurred. Please try again.',
    SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again later.',
  };

  return messages[code] || serverMessage || 'An error occurred. Please try again.';
}

/**
 * Get user-friendly message for HTTP status codes
 */
function getHttpStatusMessage(status: number): string {
  if (status >= 500) {
    return 'Server error. Please try again later.';
  }
  if (status === 404) {
    return 'The requested resource was not found.';
  }
  if (status === 403) {
    return 'You do not have permission to access this resource.';
  }
  if (status === 401) {
    return 'Your session has expired. Please log in again.';
  }
  if (status === 400) {
    return 'Invalid request. Please check your input.';
  }
  return 'An error occurred. Please try again.';
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  // Network errors are retryable
  if (!error.response && error.request) {
    return true;
  }

  // Server errors (5xx) are retryable
  if (error.response && error.response.status >= 500) {
    return true;
  }

  // Specific error codes that are retryable
  const retryableCodes = ['RATE_LIMIT_EXCEEDED', 'SERVICE_UNAVAILABLE'];
  if (error.response?.data?.error?.code && retryableCodes.includes(error.response.data.error.code)) {
    return true;
  }

  return false;
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry,
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if not retryable or max retries reached
      if (!isRetryableError(error) || attempt === maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(initialDelay * Math.pow(backoffFactor, attempt), maxDelay);

      // Call retry callback
      if (onRetry) {
        onRetry(attempt + 1, error);
      }

      console.log(`Retrying request (attempt ${attempt + 1}/${maxRetries}) after ${delay}ms...`);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Check if user is offline
 */
export function isOffline(): boolean {
  return !navigator.onLine;
}

/**
 * Wait for online status
 */
export function waitForOnline(): Promise<void> {
  if (navigator.onLine) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const handleOnline = () => {
      window.removeEventListener('online', handleOnline);
      resolve();
    };
    window.addEventListener('online', handleOnline);
  });
}
