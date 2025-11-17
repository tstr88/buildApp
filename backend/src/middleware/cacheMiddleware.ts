/**
 * Cache Middleware
 * Provides request-level caching for API endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { cache } from '../utils/cache';
import { logger } from '../utils/logger';

interface CacheOptions {
  ttl: number; // Time to live in seconds
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean; // Only cache if condition is true
}

/**
 * Cache middleware factory
 *
 * @example
 * router.get('/catalog/:supplierId', cacheMiddleware({ ttl: 60 }), getCatalog);
 */
export function cacheMiddleware(options: CacheOptions) {
  const { ttl, keyGenerator, condition } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip caching if cache is disabled
    if (!cache.isEnabled()) {
      return next();
    }

    // Skip caching if condition fails
    if (condition && !condition(req)) {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : `api:${req.method}:${req.originalUrl}`;

    try {
      // Try to get from cache
      const cached = await cache.get<any>(cacheKey);

      if (cached) {
        logger.debug(`[Cache] HIT: ${cacheKey}`);
        res.setHeader('X-Cache', 'HIT');
        res.json(cached);
        return;
      }

      // Cache miss - intercept res.json to cache the response
      logger.debug(`[Cache] MISS: ${cacheKey}`);
      res.setHeader('X-Cache', 'MISS');

      const originalJson = res.json.bind(res);

      res.json = function (body: any): Response {
        // Cache successful responses only (2xx status codes)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.set(cacheKey, body, ttl).catch((err) => {
            logger.error(`[Cache] Failed to cache response for ${cacheKey}:`, err);
          });
        }

        return originalJson(body);
      };

      next();
    } catch (error) {
      logger.error(`[Cache] Error in cache middleware for ${cacheKey}:`, error);
      // Continue without caching on error
      next();
    }
  };
}

/**
 * Conditional cache middleware - only cache for authenticated users
 */
export function cacheForAuthenticatedUsers(ttl: number, keyGenerator?: (req: Request) => string) {
  return cacheMiddleware({
    ttl,
    keyGenerator,
    condition: (req: Request) => !!req.user,
  });
}

/**
 * Conditional cache middleware - only cache GET requests
 */
export function cacheGetRequests(ttl: number, keyGenerator?: (req: Request) => string) {
  return cacheMiddleware({
    ttl,
    keyGenerator,
    condition: (req: Request) => req.method === 'GET',
  });
}
