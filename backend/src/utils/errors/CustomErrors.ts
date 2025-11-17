/**
 * Custom error classes for buildApp API
 * Provides consistent error handling across the application
 */

/**
 * Base API Error class
 */
export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, code: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true; // Operational errors are expected errors

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - Validation errors
 */
export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED', undefined);
  }
}

/**
 * 403 Forbidden - Insufficient permissions
 */
export class ForbiddenError extends ApiError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN', undefined);
  }
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found', details?: unknown) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

/**
 * 409 Conflict - Resource conflict
 */
export class ConflictError extends ApiError {
  constructor(message: string = 'Resource conflict', details?: unknown) {
    super(message, 409, 'CONFLICT', details);
  }
}

/**
 * 422 Unprocessable Entity - Business logic validation failed
 */
export class UnprocessableEntityError extends ApiError {
  constructor(message: string = 'Request cannot be processed', details?: unknown) {
    super(message, 422, 'UNPROCESSABLE_ENTITY', details);
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class RateLimitError extends ApiError {
  constructor(message: string = 'Too many requests', details?: unknown) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', details);
  }
}

/**
 * 500 Internal Server Error - Unexpected errors
 */
export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal server error', details?: unknown) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', details);
    this.isOperational = false; // Not an operational error
  }
}

/**
 * 503 Service Unavailable - External service errors
 */
export class ServiceUnavailableError extends ApiError {
  constructor(message: string = 'Service temporarily unavailable', details?: unknown) {
    super(message, 503, 'SERVICE_UNAVAILABLE', details);
  }
}

/**
 * Database-specific errors
 */
export class DatabaseError extends ApiError {
  constructor(message: string = 'Database operation failed', details?: unknown) {
    super(message, 500, 'DATABASE_ERROR', details);
    this.isOperational = false;
  }
}

/**
 * File upload errors
 */
export class FileUploadError extends ApiError {
  constructor(message: string = 'File upload failed', details?: unknown) {
    super(message, 400, 'FILE_UPLOAD_ERROR', details);
  }
}

/**
 * Business Logic Errors - Specific domain errors
 */

/**
 * No suppliers selected for RFQ
 */
export class NoSuppliersSelectedError extends ApiError {
  constructor(message: string = 'At least one supplier must be selected') {
    super(message, 400, 'NO_SUPPLIERS_SELECTED', {
      suggestion: 'Select at least one supplier to send RFQ',
    });
  }
}

/**
 * Offer has expired
 */
export class OfferExpiredError extends ApiError {
  constructor(expiresAt?: string) {
    super('This offer has expired', 400, 'OFFER_EXPIRED', {
      expiresAt,
      suggestion: 'Request a new quote from the supplier',
    });
  }
}

/**
 * Confirmation window expired (24h limit)
 */
export class ConfirmationWindowExpiredError extends ApiError {
  constructor(deliveredAt: string) {
    super('Confirmation window has expired', 400, 'CONFIRMATION_WINDOW_EXPIRED', {
      deliveredAt,
      limit: '24 hours',
      suggestion: 'Order was auto-completed',
    });
  }
}

/**
 * Wrong phone attempting confirmation
 */
export class WrongPhoneConfirmationError extends ApiError {
  constructor() {
    super(
      'Only the person who placed this order can confirm delivery',
      403,
      'WRONG_PHONE_CONFIRMATION'
    );
  }
}

/**
 * SKU unavailable for direct order
 */
export class SKUUnavailableError extends ApiError {
  constructor(skuId: string, reason?: string) {
    super('This item is no longer available for direct order', 400, 'SKU_UNAVAILABLE', {
      skuId,
      reason: reason || 'Item has been deactivated or is out of stock',
      suggestion: 'Try requesting a quote instead',
    });
  }
}

/**
 * Project outside delivery zone
 */
export class OutsideDeliveryZoneError extends ApiError {
  constructor(supplierName: string, projectLocation?: string) {
    super(
      `This project is outside ${supplierName}'s delivery area`,
      400,
      'OUTSIDE_DELIVERY_ZONE',
      {
        supplierName,
        projectLocation,
        suggestion: 'Try pickup or select a different supplier',
      }
    );
  }
}

/**
 * Duplicate order detected
 */
export class DuplicateOrderError extends ApiError {
  constructor(existingOrderId: string) {
    super('This order has already been placed', 409, 'DUPLICATE_ORDER', {
      existingOrderId,
      suggestion: 'View your existing order instead',
    });
  }
}

/**
 * OTP expired
 */
export class OTPExpiredError extends ApiError {
  constructor() {
    super('Verification code has expired', 400, 'OTP_EXPIRED', {
      suggestion: 'Request a new code',
    });
  }
}

/**
 * Invalid OTP
 */
export class InvalidOTPError extends ApiError {
  constructor(attemptsRemaining?: number) {
    super('Invalid verification code', 400, 'INVALID_OTP', {
      attemptsRemaining,
      suggestion: 'Check the code and try again',
    });
  }
}

/**
 * Resource paused/inactive
 */
export class ResourcePausedError extends ApiError {
  constructor(resourceType: string, resourceId: string) {
    super(`This ${resourceType} is currently paused`, 400, 'RESOURCE_PAUSED', {
      resourceType,
      resourceId,
      suggestion: 'Try again later or contact the supplier',
    });
  }
}

/**
 * Helper function to check if error is operational
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof ApiError) {
    return error.isOperational;
  }
  return false;
}
