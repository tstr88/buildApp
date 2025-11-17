/**
 * Global error handling middleware
 * Catches all errors and sends consistent error responses
 */

import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors/CustomErrors';
import { error as errorResponse } from '../utils/responseHelpers';

/**
 * Global error handler middleware
 * Should be registered last in the middleware stack
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error for debugging
  console.error('Error caught by errorHandler:', err);

  // Handle ApiError instances
  if (err instanceof ApiError) {
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

  // Handle unexpected errors
  const statusCode = 500;
  const code = 'INTERNAL_SERVER_ERROR';
  const message = process.env.NODE_ENV === 'development'
    ? err.message
    : 'An unexpected error occurred';

  errorResponse(
    res,
    code,
    message,
    statusCode,
    undefined,
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
}

/**
 * Handle unhandled promise rejections
 */
export function handleUnhandledRejection(): void {
  process.on('unhandledRejection', (reason: Error | unknown) => {
    console.error('UNHANDLED REJECTION! Shutting down gracefully...');
    console.error(reason);

    // Exit process (let process manager restart)
    process.exit(1);
  });
}

/**
 * Handle uncaught exceptions
 */
export function handleUncaughtException(): void {
  process.on('uncaughtException', (error: Error) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down gracefully...');
    console.error(error);

    // Exit process (let process manager restart)
    process.exit(1);
  });
}

/**
 * 404 Not Found handler
 * Should be registered after all routes
 */
export function notFoundHandler(_req: Request, res: Response): void {
  errorResponse(res, 'NOT_FOUND', 'Route not found', 404);
}
