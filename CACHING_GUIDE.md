# Caching Implementation Guide

This guide explains how to use the caching utilities in buildApp for both backend (Redis) and frontend (LocalStorage).

## Table of Contents

1. [Backend Caching (Redis)](#backend-caching-redis)
2. [Frontend Caching (LocalStorage)](#frontend-caching-localstorage)
3. [Cache Invalidation Strategies](#cache-invalidation-strategies)
4. [Best Practices](#best-practices)

---

## Backend Caching (Redis)

### Setup

Redis is **optional** for MVP. The application works perfectly fine without it. To enable Redis caching:

1. Install Redis locally or use a hosted service
2. Add to your `.env` file:
   ```
   REDIS_URL=redis://localhost:6379
   ```
3. The cache service will automatically connect on startup

**Note**: If `REDIS_URL` is not set, caching is gracefully disabled and all cache operations become no-ops.

### Basic Usage

```typescript
import { cache, CacheKeys, CacheTTL } from '../utils/cache';

// Get from cache
const data = await cache.get<SupplierCatalog>(CacheKeys.supplierCatalog(supplierId));

// Set in cache with TTL
await cache.set(CacheKeys.supplierCatalog(supplierId), catalogData, CacheTTL.CATALOG);

// Delete from cache
await cache.delete(CacheKeys.supplierCatalog(supplierId));

// Get or set pattern (fetch from cache or compute and cache)
const catalog = await cache.getOrSet(
  CacheKeys.supplierCatalog(supplierId),
  async () => {
    // Fetch from database
    const result = await pool.query('SELECT * FROM skus WHERE supplier_id = $1', [supplierId]);
    return result.rows;
  },
  CacheTTL.CATALOG
);
```

### Cache Middleware

Use cache middleware for automatic request-level caching:

```typescript
import { cacheMiddleware, cacheGetRequests } from '../middleware/cacheMiddleware';
import { CacheTTL } from '../utils/cache';

// Cache GET /api/catalog/skus/:id for 1 minute
router.get(
  '/skus/:id',
  cacheMiddleware({
    ttl: CacheTTL.CATALOG,
    keyGenerator: (req) => `sku:${req.params.id}`,
  }),
  asyncHandler(async (req, res) => {
    // Your handler code
  })
);

// Cache all GET requests for this route
router.get(
  '/suppliers/:id/catalog',
  cacheGetRequests(CacheTTL.CATALOG),
  asyncHandler(async (req, res) => {
    // Your handler code
  })
);
```

### Example: Caching Catalog Endpoint

```typescript
import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler';
import { cacheMiddleware } from '../middleware/cacheMiddleware';
import { cache, CacheKeys, CacheTTL } from '../utils/cache';
import { success } from '../utils/responseHelpers';
import pool from '../config/database';

const router = Router();

// GET /api/catalog/skus/:id with caching
router.get(
  '/skus/:id',
  cacheMiddleware({
    ttl: CacheTTL.CATALOG,
    keyGenerator: (req) => CacheKeys.supplierCatalog(req.params.id),
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM skus WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'SKU not found'
      });
    }

    return success(res, result.rows[0], 'SKU retrieved successfully');
  })
);

export default router;
```

### Cache Keys Reference

All cache keys are defined in `CacheKeys` object for consistency:

```typescript
// Supplier catalog - TTL: 1 minute
CacheKeys.supplierCatalog(supplierId)

// Trust metrics - TTL: 5 minutes
CacheKeys.trustMetric(supplierId)

// User profile - TTL: 10 minutes
CacheKeys.userProfile(userId)

// RFQ recipients list - TTL: 30 seconds
CacheKeys.rfqRecipients(rfqId)

// Order details - TTL: 1 minute
CacheKeys.orderDetails(orderId)

// Suppliers by category - TTL: 5 minutes
CacheKeys.suppliersByCategory(category)

// Active RFQs for supplier - TTL: 30 seconds
CacheKeys.supplierActiveRfqs(supplierId)
```

### Cache TTL Reference

All TTL values are defined in seconds in the `CacheTTL` object:

```typescript
CacheTTL.CATALOG = 60           // 1 minute
CacheTTL.TRUST_METRIC = 300     // 5 minutes
CacheTTL.USER_PROFILE = 600     // 10 minutes
CacheTTL.RFQ_RECIPIENTS = 30    // 30 seconds
CacheTTL.ORDER_DETAILS = 60     // 1 minute
CacheTTL.SUPPLIERS_BY_CATEGORY = 300  // 5 minutes
CacheTTL.ACTIVE_RFQS = 30       // 30 seconds
```

---

## Frontend Caching (LocalStorage)

### Basic Usage

```typescript
import { localCache, LocalCacheKeys, LocalCacheTTL } from '../utils/localStorageCache';

// Get from cache
const profile = localCache.get<UserProfile>(LocalCacheKeys.userProfile(userId));

// Set in cache with TTL (in milliseconds)
localCache.set(LocalCacheKeys.userProfile(userId), profileData, LocalCacheTTL.USER_PROFILE);

// Delete from cache
localCache.delete(LocalCacheKeys.userProfile(userId));

// Get or set pattern
const catalog = localCache.getOrSet(
  LocalCacheKeys.supplierCatalog(supplierId),
  async () => {
    const response = await api.getSupplierCatalog(supplierId);
    return response.data;
  },
  LocalCacheTTL.CATALOG
);
```

### React Hooks

#### useLocalCache

Cache API data with automatic refresh:

```typescript
import { useLocalCache } from '../hooks/useLocalCache';
import { LocalCacheKeys, LocalCacheTTL } from '../utils/localStorageCache';

function UserProfile({ userId }: { userId: string }) {
  const { data, loading, error, refetch, invalidate } = useLocalCache({
    key: LocalCacheKeys.userProfile(userId),
    ttl: LocalCacheTTL.USER_PROFILE,
    fetchFn: () => api.getUserProfile(userId),
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;
  if (!data) return null;

  return (
    <div>
      <h1>{data.name}</h1>
      <button onClick={refetch}>Refresh</button>
      <button onClick={invalidate}>Clear Cache</button>
    </div>
  );
}
```

#### useFormDraft

Cache form drafts to prevent data loss:

```typescript
import { useFormDraft } from '../hooks/useLocalCache';
import { LocalCacheKeys, LocalCacheTTL } from '../utils/localStorageCache';

function CreateRFQForm({ userId }: { userId: string }) {
  const { draft, saveDraft, clearDraft } = useFormDraft<RFQFormData>(
    LocalCacheKeys.rfqDraft(userId),
    LocalCacheTTL.FORM_DRAFT
  );

  const [formData, setFormData] = useState<RFQFormData>(draft || defaultFormData);

  // Auto-save draft on form change
  useEffect(() => {
    saveDraft(formData);
  }, [formData, saveDraft]);

  const handleSubmit = async () => {
    await api.createRFQ(formData);
    clearDraft(); // Clear draft after successful submission
  };

  return (
    <form>
      {/* Form fields */}
      {draft && <Notice>Draft restored from {new Date(draft.timestamp).toLocaleString()}</Notice>}
    </form>
  );
}
```

#### useRecentSearches

Manage recent search history:

```typescript
import { useRecentSearches } from '../hooks/useLocalCache';

function SearchBar({ userId }: { userId: string }) {
  const { searches, addSearch, removeSearch, clearSearches } = useRecentSearches(userId, 10);

  const handleSearch = (query: string) => {
    addSearch(query);
    // Perform search
  };

  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />

      {searches.length > 0 && (
        <div className="recent-searches">
          <h4>Recent Searches</h4>
          {searches.map((search) => (
            <div key={search}>
              <span onClick={() => handleSearch(search)}>{search}</span>
              <button onClick={() => removeSearch(search)}>×</button>
            </div>
          ))}
          <button onClick={clearSearches}>Clear All</button>
        </div>
      )}
    </div>
  );
}
```

### Cache Keys Reference

All cache keys are defined in `LocalCacheKeys` object:

```typescript
LocalCacheKeys.userProfile(userId)
LocalCacheKeys.supplierCatalog(supplierId)
LocalCacheKeys.categories
LocalCacheKeys.recentSearches(userId)
LocalCacheKeys.lastMapLocation(userId)
LocalCacheKeys.rfqDraft(userId)
LocalCacheKeys.orderDraft(userId)
LocalCacheKeys.onboardingProgress(userId)
```

### Cache TTL Reference

All TTL values are defined in milliseconds in the `LocalCacheTTL` object:

```typescript
LocalCacheTTL.USER_PROFILE = 10 * 60 * 1000      // 10 minutes
LocalCacheTTL.CATALOG = 5 * 60 * 1000            // 5 minutes
LocalCacheTTL.CATEGORIES = 30 * 60 * 1000        // 30 minutes
LocalCacheTTL.RECENT_SEARCHES = 24 * 60 * 60 * 1000    // 24 hours
LocalCacheTTL.MAP_LOCATION = 24 * 60 * 60 * 1000       // 24 hours
LocalCacheTTL.FORM_DRAFT = 7 * 24 * 60 * 60 * 1000     // 7 days
LocalCacheTTL.ONBOARDING = 30 * 24 * 60 * 60 * 1000    // 30 days
```

### Automatic Cleanup

LocalStorage cache automatically:
- Clears expired entries on page load
- Runs periodic cleanup every 5 minutes
- Handles quota exceeded errors by clearing old cache

---

## Cache Invalidation Strategies

### Backend (Redis)

#### 1. Time-Based Invalidation (TTL)

Automatic - cache expires after TTL:

```typescript
// Cache expires after 1 minute
await cache.set(CacheKeys.supplierCatalog(supplierId), data, CacheTTL.CATALOG);
```

#### 2. Explicit Invalidation

Invalidate when data changes:

```typescript
// After updating SKU
await pool.query('UPDATE skus SET base_price = $1 WHERE id = $2', [newPrice, skuId]);

// Invalidate supplier catalog cache
await cache.delete(CacheKeys.supplierCatalog(supplierId));
```

#### 3. Pattern-Based Invalidation

Invalidate multiple related keys:

```typescript
import { CacheKeys } from '../utils/cache';

// Invalidate all supplier-related caches
await cache.deletePattern(CacheKeys.patterns.supplierData(supplierId));

// Invalidate all trust metrics
await cache.deletePattern(CacheKeys.patterns.allTrustMetrics);
```

#### 4. Event-Based Invalidation

Invalidate on specific events:

```typescript
// After supplier updates their catalog
export async function updateSKU(supplierId: string, skuId: string, data: any) {
  // Update database
  await pool.query('UPDATE skus SET ... WHERE id = $1', [skuId]);

  // Invalidate caches
  await Promise.all([
    cache.delete(CacheKeys.supplierCatalog(supplierId)),
    cache.deletePattern(`sku:${skuId}*`),
    cache.delete(CacheKeys.suppliersByCategory(data.category)),
  ]);
}
```

### Frontend (LocalStorage)

#### 1. Time-Based Invalidation (TTL)

Automatic - cache expires after TTL.

#### 2. Explicit Invalidation

```typescript
const { invalidate } = useLocalCache({
  key: LocalCacheKeys.userProfile(userId),
  ttl: LocalCacheTTL.USER_PROFILE,
  fetchFn: () => api.getUserProfile(userId),
});

// After updating profile
const handleUpdateProfile = async (data: UpdateProfileData) => {
  await api.updateProfile(data);
  invalidate(); // Clear cache and refetch
};
```

#### 3. Manual Cache Management

```typescript
import { localCache } from '../utils/localStorageCache';

// Clear specific key
localCache.delete(LocalCacheKeys.userProfile(userId));

// Clear all cache
localCache.clear();

// Clear expired only
localCache.clearExpired();
```

---

## Best Practices

### 1. Cache What's Expensive

Cache data that is:
- Expensive to compute (complex queries, aggregations)
- Frequently accessed (catalog, user profiles)
- Rarely changes (categories, static data)

**Don't cache**:
- Real-time data (order status, notifications)
- User-specific sensitive data (passwords, tokens)
- Data that changes frequently (< 10 seconds)

### 2. Choose Appropriate TTL

```typescript
// Frequently changing data - short TTL
CacheTTL.RFQ_RECIPIENTS = 30          // 30 seconds

// Moderate change frequency - medium TTL
CacheTTL.CATALOG = 60                 // 1 minute

// Rarely changing data - long TTL
CacheTTL.TRUST_METRIC = 300           // 5 minutes
CacheTTL.USER_PROFILE = 600           // 10 minutes
```

### 3. Use Consistent Cache Keys

Always use the predefined `CacheKeys` and `LocalCacheKeys` objects:

```typescript
// ✅ Good - consistent and typed
cache.set(CacheKeys.supplierCatalog(supplierId), data, CacheTTL.CATALOG);

// ❌ Bad - typos, inconsistent
cache.set(`supplier-catalog-${supplierId}`, data, 60);
```

### 4. Handle Cache Failures Gracefully

```typescript
// ✅ Good - cache failure doesn't break the app
const cached = await cache.get(key);
if (cached) {
  return cached;
}

const fresh = await fetchFromDatabase();
cache.set(key, fresh, ttl).catch(err => {
  // Log but don't throw - cache is optional
  logger.error('Cache write failed:', err);
});
return fresh;

// ❌ Bad - cache failure breaks the app
const data = await cache.get(key);
if (!data) {
  throw new Error('Cache miss!');
}
```

### 5. Invalidate on Updates

Always invalidate cache when data changes:

```typescript
// ✅ Good - invalidate after update
await pool.query('UPDATE skus SET ... WHERE id = $1', [skuId]);
await cache.delete(CacheKeys.supplierCatalog(supplierId));

// ❌ Bad - stale cache
await pool.query('UPDATE skus SET ... WHERE id = $1', [skuId]);
// Cache not invalidated - users see old data for 1 minute
```

### 6. Monitor Cache Performance

```typescript
// Add cache hit/miss logging in development
if (process.env.NODE_ENV === 'development') {
  const cached = await cache.get(key);
  console.log(`[Cache] ${cached ? 'HIT' : 'MISS'}: ${key}`);
}

// Track cache size in frontend
console.log('Cache size:', localCache.getSizeFormatted());
```

### 7. Test Without Cache

Always test your application with caching disabled to ensure it works without Redis:

```bash
# Remove REDIS_URL from .env
# Application should work fine without caching
npm run dev
```

---

## Performance Impact

### Expected Improvements

With caching enabled:

- **Catalog browsing**: 200ms → 20ms (90% faster)
- **Supplier profiles**: 150ms → 15ms (90% faster)
- **Trust metrics**: 500ms → 50ms (90% faster)
- **Category filters**: 100ms → 10ms (90% faster)

### Cache Hit Ratio

Monitor cache effectiveness with the `X-Cache` header:

```bash
curl -I http://localhost:3001/api/catalog/skus/123
# First request: X-Cache: MISS
# Second request: X-Cache: HIT
```

Aim for:
- **Development**: 60-70% hit ratio
- **Production**: 80-90% hit ratio

---

## Troubleshooting

### Redis Connection Issues

```
[Cache] Redis URL not configured - caching disabled
```

**Solution**: This is expected if Redis is not needed. To enable, set `REDIS_URL` in `.env`.

### Quota Exceeded (LocalStorage)

```
[LocalStorageCache] Storage quota exceeded, clearing old cache...
```

**Solution**: Automatic cleanup triggered. If persists, reduce TTL or cache less data.

### Stale Data

If users see outdated data:
1. Check cache invalidation after updates
2. Reduce TTL for that data type
3. Add manual refresh button

### Cache Never Hits

If `X-Cache: MISS` always:
1. Check Redis connection (`cache.isEnabled()`)
2. Verify TTL is not 0
3. Check cache key consistency
4. Ensure middleware is before handler

---

## Summary

- **Backend**: Redis caching is optional but recommended for production
- **Frontend**: LocalStorage caching improves UX and reduces API calls
- **Cache invalidation**: Use TTL + explicit invalidation on updates
- **Monitoring**: Track hit ratio and performance improvements
- **Testing**: Always test without cache enabled

For more details, see:
- `/backend/src/utils/cache.ts` - Redis cache implementation
- `/backend/src/middleware/cacheMiddleware.ts` - Request-level caching
- `/frontend/src/utils/localStorageCache.ts` - LocalStorage cache implementation
- `/frontend/src/hooks/useLocalCache.ts` - React hooks for caching
