/**
 * useLocalCache Hook
 * React hook for managing cached data with LocalStorage
 */

import { useState, useEffect, useCallback } from 'react';
import { localCache } from '../utils/localStorageCache';

interface UseLocalCacheOptions<T> {
  key: string;
  ttl: number; // Time to live in milliseconds
  fetchFn: () => Promise<T>;
  enabled?: boolean; // Whether to auto-fetch on mount
}

interface UseLocalCacheResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
}

/**
 * Hook for caching data in LocalStorage with auto-refresh
 *
 * @example
 * const { data, loading, error, refetch } = useLocalCache({
 *   key: 'user-profile',
 *   ttl: 10 * 60 * 1000, // 10 minutes
 *   fetchFn: () => api.getUserProfile(),
 * });
 */
export function useLocalCache<T>({
  key,
  ttl,
  fetchFn,
  enabled = true,
}: UseLocalCacheOptions<T>): UseLocalCacheResult<T> {
  const [data, setData] = useState<T | null>(() => {
    // Try to load from cache on mount
    return localCache.get<T>(key);
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchFn();
      setData(result);
      localCache.set(key, result, ttl);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch data');
      setError(error);
      console.error(`[useLocalCache] Error fetching data for key ${key}:`, error);
    } finally {
      setLoading(false);
    }
  }, [key, ttl, fetchFn]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const invalidate = useCallback(() => {
    localCache.delete(key);
    setData(null);
  }, [key]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Check if we have cached data
    const cached = localCache.get<T>(key);
    if (cached) {
      setData(cached);
      return;
    }

    // No cached data, fetch fresh
    fetchData();
  }, [key, enabled, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
  };
}

/**
 * Hook for caching form drafts
 *
 * @example
 * const { draft, saveDraft, clearDraft } = useFormDraft('rfq-draft', 7 * 24 * 60 * 60 * 1000);
 */
export function useFormDraft<T>(key: string, ttl: number) {
  const [draft, setDraft] = useState<T | null>(() => {
    return localCache.get<T>(key);
  });

  const saveDraft = useCallback(
    (data: T) => {
      setDraft(data);
      localCache.set(key, data, ttl);
    },
    [key, ttl]
  );

  const clearDraft = useCallback(() => {
    setDraft(null);
    localCache.delete(key);
  }, [key]);

  return {
    draft,
    saveDraft,
    clearDraft,
  };
}

/**
 * Hook for managing recent searches
 *
 * @example
 * const { searches, addSearch, clearSearches } = useRecentSearches(userId, 10);
 */
export function useRecentSearches(userId: string, maxItems: number = 10) {
  const key = `recent-searches:${userId}`;
  const ttl = 30 * 24 * 60 * 60 * 1000; // 30 days

  const [searches, setSearches] = useState<string[]>(() => {
    return localCache.get<string[]>(key) || [];
  });

  const addSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      setSearches((prev) => {
        // Remove duplicates and add to front
        const updated = [trimmed, ...prev.filter((s) => s !== trimmed)].slice(0, maxItems);
        localCache.set(key, updated, ttl);
        return updated;
      });
    },
    [key, ttl, maxItems]
  );

  const removeSearch = useCallback(
    (query: string) => {
      setSearches((prev) => {
        const updated = prev.filter((s) => s !== query);
        localCache.set(key, updated, ttl);
        return updated;
      });
    },
    [key, ttl]
  );

  const clearSearches = useCallback(() => {
    setSearches([]);
    localCache.delete(key);
  }, [key]);

  return {
    searches,
    addSearch,
    removeSearch,
    clearSearches,
  };
}
