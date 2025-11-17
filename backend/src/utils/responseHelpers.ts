/**
 * Response helper functions for consistent API responses
 */

import { Response } from 'express';

/**
 * Standard success response structure
 */
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T = unknown> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string; // Only in development
  };
}

/**
 * Send success response
 * @param res - Express response object
 * @param data - Response data
 * @param message - Optional success message
 * @param statusCode - HTTP status code (default: 200)
 */
export function success<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response<SuccessResponse<T>> {
  const response: SuccessResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send paginated response
 * @param res - Express response object
 * @param data - Array of items
 * @param page - Current page number (1-indexed)
 * @param total - Total number of items
 * @param limit - Items per page
 * @param message - Optional message
 */
export function paginated<T>(
  res: Response,
  data: T[],
  page: number,
  total: number,
  limit: number,
  message?: string
): Response<PaginatedResponse<T>> {
  const totalPages = Math.ceil(total / limit);

  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };

  if (message) {
    response.message = message;
  }

  return res.status(200).json(response);
}

/**
 * Send error response
 * @param res - Express response object
 * @param code - Error code
 * @param message - Error message
 * @param statusCode - HTTP status code
 * @param details - Optional error details
 * @param stack - Optional stack trace (development only)
 */
export function error(
  res: Response,
  code: string,
  message: string,
  statusCode: number = 500,
  details?: unknown,
  stack?: string
): Response<ErrorResponse> {
  const response: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (details) {
    response.error.details = details;
  }

  if (stack && process.env.NODE_ENV === 'development') {
    response.error.stack = stack;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send created response (201)
 * @param res - Express response object
 * @param data - Created resource data
 * @param message - Optional success message
 */
export function created<T>(
  res: Response,
  data: T,
  message: string = 'Resource created successfully'
): Response<SuccessResponse<T>> {
  return success(res, data, message, 201);
}

/**
 * Send no content response (204)
 * @param res - Express response object
 */
export function noContent(res: Response): Response {
  return res.status(204).send();
}

/**
 * Calculate pagination offset from page and limit
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @returns offset for database query
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Validate and sanitize pagination parameters
 * @param page - Requested page number
 * @param limit - Requested items per page
 * @param maxLimit - Maximum allowed limit (default: 100)
 * @returns Validated page and limit
 */
export function validatePagination(
  page?: number | string,
  limit?: number | string,
  maxLimit: number = 100
): { page: number; limit: number } {
  // Parse and validate page
  let validPage = 1;
  if (page) {
    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : page;
    if (!isNaN(parsedPage) && parsedPage > 0) {
      validPage = parsedPage;
    }
  }

  // Parse and validate limit
  let validLimit = 20; // Default limit
  if (limit) {
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      validLimit = Math.min(parsedLimit, maxLimit);
    }
  }

  return { page: validPage, limit: validLimit };
}
