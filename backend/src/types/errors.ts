/**
 * Custom Error Types
 * Standardized error codes and classes for consistent error handling
 */

export enum ErrorCode {
  // Client Errors (4xx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  CONFLICT = 'CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',

  // Business Logic Errors
  NO_SUPPLIERS_SELECTED = 'NO_SUPPLIERS_SELECTED',
  OFFER_EXPIRED = 'OFFER_EXPIRED',
  CONFIRMATION_WINDOW_EXPIRED = 'CONFIRMATION_WINDOW_EXPIRED',
  WRONG_PHONE_CONFIRMATION = 'WRONG_PHONE_CONFIRMATION',
  SKU_UNAVAILABLE = 'SKU_UNAVAILABLE',
  OUTSIDE_DELIVERY_ZONE = 'OUTSIDE_DELIVERY_ZONE',
  DUPLICATE_ORDER = 'DUPLICATE_ORDER',

  // Server Errors (5xx)
  SERVER_ERROR = 'SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

export interface ErrorDetails {
  field?: string;
  value?: any;
  expected?: string;
  constraint?: string;
  [key: string]: any;
}

export class AppError extends Error {
  code: ErrorCode;
  statusCode: number;
  details?: ErrorDetails;
  isOperational: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: ErrorDetails,
    isOperational: boolean = true
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', details?: ErrorDetails) {
    super(ErrorCode.NOT_FOUND, message, 404, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required', details?: ErrorDetails) {
    super(ErrorCode.UNAUTHORIZED, message, 401, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden', details?: ErrorDetails) {
    super(ErrorCode.FORBIDDEN, message, 403, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: ErrorDetails) {
    super(ErrorCode.CONFLICT, message, 409, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', details?: ErrorDetails) {
    super(ErrorCode.RATE_LIMITED, message, 429, details);
  }
}

export class BusinessLogicError extends AppError {
  constructor(code: ErrorCode, message: string, details?: ErrorDetails) {
    super(code, message, 400, details);
  }
}

export class ServerError extends AppError {
  constructor(message: string = 'Internal server error', details?: ErrorDetails) {
    super(ErrorCode.SERVER_ERROR, message, 500, details, false);
  }
}
