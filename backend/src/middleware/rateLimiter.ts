import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// In-memory store for rate limiting (for development)
// In production, use Redis with rate-limit-redis
const otpRequestStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiter for OTP requests
 * Limits: 3 requests per phone number per hour
 */
export const otpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per window
  message: {
    success: false,
    error: 'Too many OTP requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use phone number as key (or IP if no phone provided)
  keyGenerator: (req: Request) => {
    const phone = req.body.phone;
    if (phone) {
      return `phone:${phone}`;
    }
    // Fall back to IP address
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket.remoteAddress;
    return `ip:${ip || 'unknown'}`;
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: 'Too many OTP requests from this phone number. Please try again in an hour.',
    });
  },
});

/**
 * Custom rate limiter for OTP requests by phone number
 * More granular control than express-rate-limit
 */
export function checkOTPRateLimit(phone: string): {
  allowed: boolean;
  remainingAttempts: number;
  resetTime?: Date;
} {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxAttempts = 3;

  const record = otpRequestStore.get(phone);

  // No record or window expired
  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs;
    otpRequestStore.set(phone, { count: 1, resetTime });
    return {
      allowed: true,
      remainingAttempts: maxAttempts - 1,
      resetTime: new Date(resetTime),
    };
  }

  // Within window
  if (record.count >= maxAttempts) {
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: new Date(record.resetTime),
    };
  }

  // Increment count
  record.count++;
  otpRequestStore.set(phone, record);

  return {
    allowed: true,
    remainingAttempts: maxAttempts - record.count,
    resetTime: new Date(record.resetTime),
  };
}

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits: 10 requests per 15 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: {
    success: false,
    error: 'Too many authentication attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Clean up expired rate limit records (call periodically)
 */
export function cleanupExpiredRecords(): void {
  const now = Date.now();
  for (const [key, record] of otpRequestStore.entries()) {
    if (now > record.resetTime) {
      otpRequestStore.delete(key);
    }
  }
}

// Clean up every hour
setInterval(cleanupExpiredRecords, 60 * 60 * 1000);
