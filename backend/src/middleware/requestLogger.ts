/**
 * Request logging middleware
 * Logs HTTP requests with timing and status information
 */

import morgan from 'morgan';
import { Request, Response } from 'express';

/**
 * Custom token for response time in milliseconds
 */
morgan.token('response-time-ms', (_req: Request, res: Response) => {
  const responseTime = res.get('X-Response-Time');
  return responseTime || '-';
});

/**
 * Custom token for request body (only in development)
 */
morgan.token('body', (req: Request) => {
  if (process.env.NODE_ENV === 'development' && req.body) {
    // Don't log sensitive fields
    const sanitized = { ...req.body };
    if (sanitized.password) sanitized.password = '[REDACTED]';
    if (sanitized.otp) sanitized.otp = '[REDACTED]';
    if (sanitized.otp_code) sanitized.otp_code = '[REDACTED]';
    return JSON.stringify(sanitized);
  }
  return '';
});

/**
 * Development logging format (verbose)
 */
const devFormat = ':method :url :status :response-time ms - :res[content-length] :body';

/**
 * Production logging format (concise)
 */
const prodFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

/**
 * Request logger middleware
 * Uses different formats for development and production
 */
export const requestLogger = morgan(
  process.env.NODE_ENV === 'production' ? prodFormat : devFormat
);

/**
 * Response time middleware
 * Adds X-Response-Time header to responses
 */
export function responseTime(_req: Request, res: Response, next: () => void): void {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${duration}ms`);
  });

  next();
}

export default requestLogger;
