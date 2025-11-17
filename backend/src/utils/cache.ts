/**
 * Redis Cache Utility
 * Provides caching functionality with TTL support
 */

import Redis from 'ioredis';
import { logger } from './logger';

class CacheService {
  private client: Redis | null = null;
  private enabled: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const redisUrl = process.env.REDIS_URL;

    // Cache is optional for MVP - only enable if Redis URL is configured
    if (!redisUrl) {
      logger.info('[Cache] Redis URL not configured - caching disabled');
      this.enabled = false;
      return;
    }

    try {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        reconnectOnError: (err) => {
          const targetError = 'READONLY';
          if (err.message.includes(targetError)) {
            // Only reconnect when the error contains "READONLY"
            return true;
          }
          return false;
        },
      });

      this.client.on('connect', () => {
        logger.info('[Cache] Redis connected');
        this.enabled = true;
      });

      this.client.on('error', (err) => {
        logger.error('[Cache] Redis error:', err);
        this.enabled = false;
      });

      this.client.on('close', () => {
        logger.warn('[Cache] Redis connection closed');
        this.enabled = false;
      });
    } catch (error) {
      logger.error('[Cache] Failed to initialize Redis:', error);
      this.enabled = false;
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`[Cache] Error getting key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL (time to live in seconds)
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    if (!this.enabled || !this.client) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);

      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, serialized);
      } else {
        await this.client.set(key, serialized);
      }

      return true;
    } catch (error) {
      logger.error(`[Cache] Error setting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<boolean> {
    if (!this.enabled || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`[Cache] Error deleting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async deletePattern(pattern: string): Promise<number> {
    if (!this.enabled || !this.client) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      await this.client.del(...keys);
      return keys.length;
    } catch (error) {
      logger.error(`[Cache] Error deleting pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    if (!this.enabled || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`[Cache] Error checking existence of key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const fresh = await fetchFn();

    // Cache the result (fire and forget - don't block on cache writes)
    this.set(key, fresh, ttlSeconds).catch((err) => {
      logger.error(`[Cache] Failed to cache key ${key}:`, err);
    });

    return fresh;
  }

  /**
   * Increment a counter
   */
  async increment(key: string, ttlSeconds?: number): Promise<number> {
    if (!this.enabled || !this.client) {
      return 0;
    }

    try {
      const value = await this.client.incr(key);

      // Set TTL on first increment
      if (value === 1 && ttlSeconds) {
        await this.client.expire(key, ttlSeconds);
      }

      return value;
    } catch (error) {
      logger.error(`[Cache] Error incrementing key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Check if cache is enabled and connected
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.enabled = false;
    }
  }
}

// Export singleton instance
export const cache = new CacheService();

// Cache key builders for consistency
export const CacheKeys = {
  // Supplier catalog - TTL: 1 minute
  supplierCatalog: (supplierId: string) => `catalog:supplier:${supplierId}`,

  // Trust metrics - TTL: 5 minutes
  trustMetric: (supplierId: string) => `trust:${supplierId}`,

  // User profile - TTL: 10 minutes
  userProfile: (userId: string) => `user:${userId}`,

  // RFQ recipients list - TTL: 30 seconds (frequently changing)
  rfqRecipients: (rfqId: string) => `rfq:${rfqId}:recipients`,

  // Order details - TTL: 1 minute
  orderDetails: (orderId: string) => `order:${orderId}`,

  // Supplier list by category - TTL: 5 minutes
  suppliersByCategory: (category: string) => `suppliers:category:${category}`,

  // Active RFQs for supplier - TTL: 30 seconds
  supplierActiveRfqs: (supplierId: string) => `supplier:${supplierId}:rfqs:active`,

  // Pattern matchers for bulk invalidation
  patterns: {
    allSuppliers: 'suppliers:*',
    allCatalogs: 'catalog:*',
    allTrustMetrics: 'trust:*',
    supplierData: (supplierId: string) => `*:${supplierId}*`,
    rfqData: (rfqId: string) => `rfq:${rfqId}:*`,
  },
};

// Cache TTL constants (in seconds)
export const CacheTTL = {
  CATALOG: 60, // 1 minute
  TRUST_METRIC: 300, // 5 minutes
  USER_PROFILE: 600, // 10 minutes
  RFQ_RECIPIENTS: 30, // 30 seconds
  ORDER_DETAILS: 60, // 1 minute
  SUPPLIERS_BY_CATEGORY: 300, // 5 minutes
  ACTIVE_RFQS: 30, // 30 seconds
};
