/**
 * LocalStorage Cache Utility
 * Provides client-side caching with TTL support
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class LocalStorageCache {
  private prefix: string = 'buildapp_cache_';

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) {
        return null;
      }

      const cacheItem: CacheItem<T> = JSON.parse(item);

      // Check if expired
      const now = Date.now();
      if (now - cacheItem.timestamp > cacheItem.ttl) {
        this.delete(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.error(`[LocalStorageCache] Error getting key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL (time to live in milliseconds)
   */
  set<T>(key: string, value: T, ttlMs: number): boolean {
    try {
      const cacheItem: CacheItem<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: ttlMs,
      };

      localStorage.setItem(this.prefix + key, JSON.stringify(cacheItem));
      return true;
    } catch (error) {
      console.error(`[LocalStorageCache] Error setting key ${key}:`, error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('[LocalStorageCache] Storage quota exceeded, clearing old cache...');
        this.clearExpired();
      }
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  delete(key: string): boolean {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error(`[LocalStorageCache] Error deleting key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('[LocalStorageCache] Error clearing cache:', error);
    }
  }

  /**
   * Clear expired entries only
   */
  clearExpired(): number {
    let cleared = 0;
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();

      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          try {
            const item = localStorage.getItem(key);
            if (item) {
              const cacheItem: CacheItem<any> = JSON.parse(item);
              if (now - cacheItem.timestamp > cacheItem.ttl) {
                localStorage.removeItem(key);
                cleared++;
              }
            }
          } catch (err) {
            // Invalid entry, remove it
            localStorage.removeItem(key);
            cleared++;
          }
        }
      });
    } catch (error) {
      console.error('[LocalStorageCache] Error clearing expired entries:', error);
    }
    return cleared;
  }

  /**
   * Get or set pattern - fetch from cache or compute and cache
   */
  getOrSet<T>(key: string, fetchFn: () => T | Promise<T>, ttlMs: number): T | Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const fresh = fetchFn();

    // Handle both sync and async fetch functions
    if (fresh instanceof Promise) {
      return fresh.then((data) => {
        this.set(key, data, ttlMs);
        return data;
      });
    } else {
      this.set(key, fresh, ttlMs);
      return fresh;
    }
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Get cache size in bytes (approximate)
   */
  getSize(): number {
    let size = 0;
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          const item = localStorage.getItem(key);
          if (item) {
            size += key.length + item.length;
          }
        }
      });
    } catch (error) {
      console.error('[LocalStorageCache] Error calculating size:', error);
    }
    return size;
  }

  /**
   * Get human-readable cache size
   */
  getSizeFormatted(): string {
    const bytes = this.getSize();
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }
}

// Export singleton instance
export const localCache = new LocalStorageCache();

// Cache key builders for consistency
export const LocalCacheKeys = {
  // User profile
  userProfile: (userId: string) => `user:${userId}`,

  // Supplier catalog
  supplierCatalog: (supplierId: string) => `catalog:${supplierId}`,

  // Categories list
  categories: 'categories',

  // Recent searches
  recentSearches: (userId: string) => `searches:${userId}`,

  // Map location
  lastMapLocation: (userId: string) => `map:location:${userId}`,

  // Form drafts
  rfqDraft: (userId: string) => `draft:rfq:${userId}`,
  orderDraft: (userId: string) => `draft:order:${userId}`,

  // Onboarding progress
  onboardingProgress: (userId: string) => `onboarding:${userId}`,
};

// Cache TTL constants (in milliseconds)
export const LocalCacheTTL = {
  USER_PROFILE: 10 * 60 * 1000, // 10 minutes
  CATALOG: 5 * 60 * 1000, // 5 minutes
  CATEGORIES: 30 * 60 * 1000, // 30 minutes
  RECENT_SEARCHES: 24 * 60 * 60 * 1000, // 24 hours
  MAP_LOCATION: 24 * 60 * 60 * 1000, // 24 hours
  FORM_DRAFT: 7 * 24 * 60 * 60 * 1000, // 7 days
  ONBOARDING: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Auto-cleanup on page load
if (typeof window !== 'undefined') {
  // Clear expired entries on load
  localCache.clearExpired();

  // Periodic cleanup every 5 minutes
  setInterval(() => {
    const cleared = localCache.clearExpired();
    if (cleared > 0) {
      console.log(`[LocalStorageCache] Cleared ${cleared} expired entries`);
    }
  }, 5 * 60 * 1000);
}
