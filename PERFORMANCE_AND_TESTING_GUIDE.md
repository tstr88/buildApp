# Performance Optimization & Testing Guide

Complete guide for optimizing performance and conducting comprehensive testing before MVP launch.

## Table of Contents

1. [Performance Optimizations](#performance-optimizations)
2. [Testing Strategy](#testing-strategy)
3. [Load Testing](#load-testing)
4. [Pre-Launch Checklist](#pre-launch-checklist)

---

## Performance Optimizations

### Frontend Optimizations ✅

#### 1. Code Splitting (Implemented)
- **Lazy Loading**: All routes are now lazy-loaded using `React.lazy()`
- **Benefits**:
  - Reduced initial bundle size
  - Faster initial page load
  - On-demand loading of route components
- **Implementation**: See `/frontend/src/App.tsx`

```typescript
// Eager-loaded (critical)
import Login from './pages/auth/Login';
import { BuyerHome } from './pages/BuyerHome';

// Lazy-loaded (code-split)
const Catalog = lazy(() => import('./pages/Catalog'));
const CreateRFQ = lazy(() => import('./pages/CreateRFQ'));
```

#### 2. Image Optimization
**Implemented Features**:
- WEBP format conversion (see photo upload service)
- Compression to 80% quality
- Max width: 1920px

**TODO - Further Optimizations**:
```typescript
// Add lazy loading for images
import { useState, useEffect, useRef } from 'react';

export const LazyImage: React.FC<{src: string; alt: string}> = ({src, alt}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsLoaded(true);
        observer.disconnect();
      }
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={isLoaded ? src : '/placeholder.svg'}
      alt={alt}
      loading="lazy"
    />
  );
};
```

#### 3. Bundle Size Optimization
**Current Status**:
- Vite automatically handles tree-shaking
- Code splitting implemented

**Monitor Bundle Size**:
```bash
cd frontend
npm run build
npx vite-bundle-visualizer
```

**Target**: <300KB initial JS bundle

#### 4. Caching Strategy

**LocalStorage** (Frontend):
```typescript
// Cache user preferences
localStorage.setItem('user_language', 'ka');
localStorage.setItem('user_currency', 'GEL');

// Cache draft RFQs
const draftKey = `rfq_draft_${projectId}`;
localStorage.setItem(draftKey, JSON.stringify(draftData));

// Retrieve on page load
const draft = JSON.parse(localStorage.getItem(draftKey) || 'null');
```

**Service Worker** (TODO for production):
```javascript
// sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('buildapp-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/static/css/main.css',
        '/static/js/main.js',
      ]);
    })
  );
});
```

#### 5. Debounce & Throttle

**Search Input** (300ms debounce):
```typescript
import { useState, useEffect } from 'react';

export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Usage
const searchTerm = useDebounce(inputValue, 300);
```

**Map Pan** (100ms throttle):
```typescript
export const throttle = (func: Function, delay: number) => {
  let lastCall = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastCall < delay) return;
    lastCall = now;
    return func(...args);
  };
};

// Usage
const handleMapPan = throttle((event) => {
  // Update map center
}, 100);
```

### Backend Optimizations ✅

#### 1. Database Indexes (Implemented)
Created indexes for:
- User authentication: `idx_users_phone`
- RFQ queries: `idx_rfqs_status_created`
- Order queries: `idx_orders_buyer_status`, `idx_orders_supplier_status`
- Notification queries: `idx_notifications_user_read`
- GiST indexes for location queries
- GIN indexes for JSONB array searches

**Verify Indexes**:
```sql
-- List all indexes
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

#### 2. Query Optimization

**Avoid N+1 Queries**:
```typescript
// ❌ Bad: N+1 query
const rfqs = await pool.query('SELECT * FROM rfqs');
for (const rfq of rfqs.rows) {
  const offers = await pool.query('SELECT * FROM offers WHERE rfq_id = $1', [rfq.id]);
}

// ✅ Good: Single query with JOIN
const rfqsWithOffers = await pool.query(`
  SELECT
    r.*,
    json_agg(
      json_build_object('id', o.id, 'total_amount', o.total_amount)
    ) AS offers
  FROM rfqs r
  LEFT JOIN offers o ON r.id = o.rfq_id
  GROUP BY r.id
`);
```

**Use Query Parameters** (prevents SQL injection):
```typescript
// ✅ Always use parameterized queries
const result = await pool.query(
  'SELECT * FROM orders WHERE buyer_id = $1 AND status = $2',
  [buyerId, status]
);
```

#### 3. Connection Pooling
**Already Configured** in `/backend/src/database/db.ts`:
```typescript
const pool = new Pool({
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

**Monitor Pool Usage**:
```typescript
console.log('Total connections:', pool.totalCount);
console.log('Idle connections:', pool.idleCount);
console.log('Waiting clients:', pool.waitingCount);
```

#### 4. Caching with Redis (TODO for Production)

**Install Redis**:
```bash
npm install redis ioredis
```

**Implementation Example**:
```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379,
});

// Cache trust metrics (TTL: 5 minutes)
export async function getTrustMetric(supplierId: string): Promise<number> {
  const cacheKey = `trust:${supplierId}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return parseFloat(cached);
  }

  const result = await pool.query(
    'SELECT trust_metric FROM suppliers WHERE id = $1',
    [supplierId]
  );

  const metric = result.rows[0]?.trust_metric || 0;
  await redis.setex(cacheKey, 300, metric.toString()); // 5 min TTL

  return metric;
}

// Cache catalog browse (TTL: 1 minute)
export async function getCatalogCache(supplierId: string): Promise<any> {
  const cacheKey = `catalog:${supplierId}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch from database
  const skus = await fetchSKUs(supplierId);

  await redis.setex(cacheKey, 60, JSON.stringify(skus)); // 1 min TTL
  return skus;
}

// Invalidate cache on update
export async function updateSKU(skuId: string, data: any): Promise<void> {
  await pool.query('UPDATE skus SET ... WHERE id = $1', [skuId]);

  // Invalidate catalog cache
  const sku = await pool.query('SELECT supplier_id FROM skus WHERE id = $1', [skuId]);
  await redis.del(`catalog:${sku.rows[0].supplier_id}`);
}
```

#### 5. Background Jobs (TODO for Production)

**Install Bull (Redis-based queue)**:
```bash
npm install bull @types/bull
```

**Implementation**:
```typescript
import Bull from 'bull';

const notificationQueue = new Bull('notifications', {
  redis: { host: 'localhost', port: 6379 },
});

// Add job to queue
export async function sendNotification(userId: string, message: string) {
  await notificationQueue.add('send-notification', {
    userId,
    message,
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  });
}

// Process jobs
notificationQueue.process('send-notification', async (job) => {
  const { userId, message } = job.data;
  // Send notification via SMS/push
  await sendSMS(userId, message);
});
```

### API Response Time Targets

**Current Performance** (measure with):
```bash
# Install autocannon for load testing
npm install -g autocannon

# Test endpoint
autocannon -c 10 -d 30 http://localhost:3001/api/buyers/orders
```

**Targets**:
- List endpoints: <200ms p95
- Detail endpoints: <100ms p95
- Heavy operations (RFQ creation): <500ms p95

**Monitor in Production**:
```typescript
// Add response time logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);

    // Alert if slow
    if (duration > 1000) {
      console.warn(`SLOW REQUEST: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  next();
});
```

---

## Testing Strategy

### Unit Tests (Backend)

**Setup Jest**:
```bash
cd backend
npm install --save-dev jest @types/jest ts-jest
```

**jest.config.js**:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
};
```

**Example Unit Tests**:
```typescript
// __tests__/services/distance.test.ts
import { calculateDistance } from '../services/distance';

describe('Distance Calculation', () => {
  it('should calculate distance between two points', () => {
    const tbilisi = { lat: 41.7151, lng: 44.8271 };
    const batumi = { lat: 41.6168, lng: 41.6367 };

    const distance = calculateDistance(tbilisi, batumi);

    expect(distance).toBeGreaterThan(350); // ~360km
    expect(distance).toBeLessThan(370);
  });

  it('should return 0 for same location', () => {
    const point = { lat: 41.7151, lng: 44.8271 };
    expect(calculateDistance(point, point)).toBe(0);
  });
});

// __tests__/utils/validation.test.ts
import { validatePhone, validatePrice } from '../utils/validation';

describe('Validation Utils', () => {
  describe('validatePhone', () => {
    it('should accept valid Georgian phone numbers', () => {
      expect(validatePhone('+995555123456')).toBe(true);
      expect(validatePhone('+995599987654')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('555123456')).toBe(false);
      expect(validatePhone('+995')).toBe(false);
      expect(validatePhone('+99555512345678')).toBe(false);
    });
  });

  describe('validatePrice', () => {
    it('should accept positive numbers', () => {
      expect(validatePrice(100.50)).toBe(true);
      expect(validatePrice(0.01)).toBe(true);
    });

    it('should reject invalid prices', () => {
      expect(validatePrice(0)).toBe(false);
      expect(validatePrice(-10)).toBe(false);
      expect(validatePrice(NaN)).toBe(false);
    });
  });
});
```

**Run Tests**:
```bash
npm test
npm test -- --coverage
```

### Integration Tests (API)

**Example API Tests**:
```typescript
// __tests__/integration/rfq-flow.test.ts
import request from 'supertest';
import app from '../app';
import { pool } from '../database/db';

describe('RFQ Flow Integration', () => {
  let authToken: string;
  let projectId: string;
  let rfqId: string;

  beforeAll(async () => {
    // Login and get auth token
    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone: '+995555123456', code: '1234' });

    authToken = res.body.data.token;
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should create a project', async () => {
    const res = await request(app)
      .post('/api/buyers/projects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Project',
        location: { lat: 41.7151, lng: 44.8271 },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    projectId = res.body.data.id;
  });

  it('should create an RFQ', async () => {
    const res = await request(app)
      .post('/api/buyers/rfqs')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        project_id: projectId,
        lines: [{ description: 'Test item', quantity: 100, unit: 'kg' }],
        supplier_ids: ['supplier-uuid'],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    rfqId = res.body.data.id;
  });

  it('should fetch RFQ details', async () => {
    const res = await request(app)
      .get(`/api/buyers/rfqs/${rfqId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(rfqId);
  });
});
```

### E2E Tests (Frontend)

**Setup Playwright**:
```bash
cd frontend
npm install --save-dev @playwright/test
npx playwright install
```

**playwright.config.ts**:
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});
```

**Example E2E Tests**:
```typescript
// e2e/buyer-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Buyer Journey', () => {
  test('complete RFQ flow', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="phone"]', '+995555123456');
    await page.click('button[type="submit"]');

    await page.fill('input[name="otp"]', '1234');
    await page.click('button[type="submit"]');

    // Create project
    await page.goto('/projects/new');
    await page.fill('input[name="name"]', 'Test Project');
    await page.click('button:has-text("Save")');

    // Create RFQ
    await page.goto('/rfqs/create');
    await page.fill('textarea[name="description"]', 'Test RFQ');
    await page.click('button:has-text("Send RFQ")');

    // Verify success
    await expect(page.locator('text=RFQ sent successfully')).toBeVisible();
  });

  test('should handle expired offers', async ({ page }) => {
    await page.goto('/rfqs/123');

    // Mock expired offer
    await page.evaluate(() => {
      localStorage.setItem('mock_expired_offer', 'true');
    });

    await page.click('button:has-text("Accept Offer")');

    // Should show error
    await expect(page.locator('text=This offer has expired')).toBeVisible();
  });
});
```

**Run E2E Tests**:
```bash
npx playwright test
npx playwright test --headed # See browser
npx playwright show-report # View results
```

---

## Load Testing

**Install Artillery**:
```bash
npm install -g artillery
```

**artillery-config.yml**:
```yaml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
      name: Warm up
    - duration: 120
      arrivalRate: 50
      name: Sustained load
    - duration: 60
      arrivalRate: 100
      name: Spike
scenarios:
  - name: Browse catalog
    flow:
      - get:
          url: '/api/catalog/skus?page=1&limit=20'
  - name: Create RFQ
    flow:
      - post:
          url: '/api/buyers/rfqs'
          headers:
            Authorization: 'Bearer {{token}}'
          json:
            project_id: '{{projectId}}'
            lines: [{description: 'Test', quantity: 100, unit: 'kg'}]
```

**Run Load Test**:
```bash
artillery run artillery-config.yml
artillery run --output report.json artillery-config.yml
artillery report report.json
```

**Metrics to Monitor**:
- Response time (p50, p95, p99)
- Request rate (RPS)
- Error rate
- Database connections
- Memory usage
- CPU usage

---

## Pre-Launch Checklist

### Security
- [ ] HTTPS enabled (production)
- [ ] Environment variables secured
- [ ] Rate limiting configured
- [ ] CORS configured correctly
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (React auto-escapes)
- [ ] Authentication tokens expire
- [ ] Sensitive data not logged

### Performance
- [ ] Code splitting implemented
- [ ] Images optimized (WEBP, compressed)
- [ ] Database indexes created
- [ ] Gzip/Brotli compression enabled
- [ ] CDN configured (production)
- [ ] Bundle size <300KB
- [ ] Lighthouse score >90

### Testing
- [ ] Unit tests passing (>80% coverage)
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Manual testing completed
- [ ] Cross-browser tested
- [ ] Mobile devices tested
- [ ] Georgian language verified

### Monitoring
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (New Relic/Datadog)
- [ ] Uptime monitoring (Pingdom)
- [ ] Logs centralized (CloudWatch/Papertrail)
- [ ] Database backups configured

### Legal
- [ ] Terms of Service published
- [ ] Privacy Policy published
- [ ] GDPR compliance (for EU users)
- [ ] Cookie consent banner

### Documentation
- [ ] README.md updated
- [ ] API documentation complete
- [ ] Deployment guide ready
- [ ] Runbook for common issues

---

## Quick Performance Audit

**Run this command to check current status**:

```bash
# Frontend bundle size
cd frontend && npm run build && ls -lh dist/assets/*.js

# Database index check
psql -d buildapp_dev -c "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';"

# API response time (sample)
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3001/api/catalog/skus"

# Memory usage
ps aux | grep node
```

**curl-format.txt**:
```
time_namelookup:  %{time_namelookup}s\n
time_connect:  %{time_connect}s\n
time_total:  %{time_total}s\n
```

---

## MVP Launch Ready Criteria

✅ **Phase 1: Core Features Complete**
- Authentication (OTP)
- RFQ creation and management
- Offer submission
- Direct orders
- Delivery scheduling
- Photo upload

✅ **Phase 2: Performance Optimized**
- Code splitting implemented
- Database indexes created
- Error handling robust

⏳ **Phase 3: Testing Complete** (In Progress)
- Unit tests written
- Integration tests written
- E2E tests written
- Load testing conducted
- Manual testing completed

🎯 **Ready for MVP Launch when all checkboxes above are ✅**
