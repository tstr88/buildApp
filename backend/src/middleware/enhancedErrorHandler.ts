/**
 * Enhanced Error Handling Middleware
 * Provides detailed error handling with database error parsing and logging
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors/CustomErrors';
import { error as errorResponse } from '../utils/responseHelpers';

/**
 * Enhanced global error handler middleware
 * Handles API errors, database errors, JWT errors, and file upload errors
 */
export function enhancedErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Enhanced logging
  console.error('[ERROR]', {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    userId: (req as any).user?.id,
    error: err.message,
    ...(err instanceof ApiError && { code: err.code, operational: err.isOperational }),
  });

  // Handle ApiError instances
  if (err instanceof ApiError) {
    // Log non-operational errors (unexpected system errors)
    if (!err.isOperational) {
      console.error('[CRITICAL ERROR]', {
        stack: err.stack,
        details: err.details,
      });
      // TODO: Send alert to admin (Slack/email/monitoring service)
    }

    errorResponse(
      res,
      err.code,
      err.message,
      err.statusCode,
      err.details,
      process.env.NODE_ENV === 'development' ? err.stack : undefined
    );
    return;
  }

  // Handle PostgreSQL errors
  const pgError = err as any;
  if (pgError.code) {
    // Duplicate key violation
    if (pgError.code === '23505') {
      errorResponse(res, 'CONFLICT', 'Resource already exists', 409, {
        constraint: pgError.constraint,
      });
      return;
    }
    // Foreign key violation
    if (pgError.code === '23503') {
      errorResponse(res, 'VALIDATION_ERROR', 'Referenced resource does not exist', 400, {
        constraint: pgError.constraint,
      });
      return;
    }
    // Not null violation
    if (pgError.code === '23502') {
      errorResponse(res, 'VALIDATION_ERROR', 'Required field is missing', 400, {
        column: pgError.column,
      });
      return;
    }
    // Check constraint violation
    if (pgError.code === '23514') {
      errorResponse(res, 'VALIDATION_ERROR', 'Invalid value for field', 400, {
        constraint: pgError.constraint,
      });
      return;
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    errorResponse(res, 'UNAUTHORIZED', 'Invalid authentication token', 401);
    return;
  }
  if (err.name === 'TokenExpiredError') {
    errorResponse(res, 'UNAUTHORIZED', 'Authentication token expired', 401);
    return;
  }

  // Handle Multer errors (file upload)
  if (err.name === 'MulterError') {
    const multerErr = err as any;
    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      errorResponse(res, 'FILE_UPLOAD_ERROR', 'File size exceeds limit (max 5MB)', 400);
      return;
    }
    if (multerErr.code === 'LIMIT_FILE_COUNT') {
      errorResponse(res, 'FILE_UPLOAD_ERROR', 'Too many files (max 3)', 400);
      return;
    }
    errorResponse(res, 'FILE_UPLOAD_ERROR', 'File upload failed', 400);
    return;
  }

  // Handle unexpected errors
  console.error('[UNEXPECTED ERROR]', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });

  const statusCode = 500;
  const code = 'INTERNAL_SERVER_ERROR';
  const message = process.env.NODE_ENV === 'development'
    ? err.message
    : 'An unexpected error occurred. Please try again.';

  errorResponse(
    res,
    code,
    message,
    statusCode,
    undefined,
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
}
