# Error Handling Guide

Complete guide for implementing robust error handling in buildApp.

## Table of Contents

1. [Backend Error Handling](#backend-error-handling)
2. [Frontend Error Handling](#frontend-error-handling)
3. [Edge Cases](#edge-cases)
4. [Best Practices](#best-practices)
5. [Testing](#testing)

---

## Backend Error Handling

### Custom Error Classes

Located in `/backend/src/utils/errors/CustomErrors.ts`:

```typescript
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  RateLimitError,
  // Business logic errors
  NoSuppliersSelectedError,
  OfferExpiredError,
  ConfirmationWindowExpiredError,
  WrongPhoneConfirmationError,
  SKUUnavailableError,
  OutsideDeliveryZoneError,
  DuplicateOrderError,
  OTPExpiredError,
  InvalidOTPError,
  ResourcePausedError,
} from '../utils/errors/CustomErrors';
```

### Usage in Controllers

```typescript
import { NotFoundError, ValidationError } from '../utils/errors/CustomErrors';

export async function getOrder(req: Request, res: Response): Promise<void> {
  const { orderId } = req.params;

  // Validate input
  if (!orderId) {
    throw new ValidationError('Order ID is required', { field: 'orderId' });
  }

  const order = await pool.query('SELECT * FROM orders WHERE id = $1', [orderId]);

  if (order.rows.length === 0) {
    throw new NotFoundError('Order not found', { orderId });
  }

  res.json({ success: true, data: order.rows[0] });
}
```

### Validation Utilities

Located in `/backend/src/utils/validation.ts`:

```typescript
import {
  validatePhone,
  validateCoordinates,
  validatePrice,
  assertValidPhone,
  assertValidCoordinates,
  assertRequiredFields,
  assertNonEmptyArray,
  isWithin24Hours,
} from '../utils/validation';

// Example: Validate phone
if (!validatePhone(phone)) {
  throw new ValidationError('Invalid phone number format');
}

// Or use assertion (throws automatically)
assertValidPhone(phone);

// Validate coordinates
assertValidCoordinates(lat, lng);

// Check if within 24h confirmation window
if (!isWithin24Hours(deliveryTime)) {
  throw new ConfirmationWindowExpiredError(deliveryTime);
}

// Validate required fields
assertRequiredFields(req.body, ['name', 'phone', 'address']);

// Validate non-empty array
assertNonEmptyArray(req.body.suppliers, 'suppliers');
```

### Rate Limiting

Located in `/backend/src/middleware/rateLimiter.ts`:

```typescript
import {
  apiRateLimiter,
  authRateLimiter,
  otpRateLimiter,
  checkOTPRateLimit,
} from '../middleware/rateLimiter';

// Apply to routes
router.post('/api/auth/request-otp', otpRateLimiter, asyncHandler(requestOTP));
router.post('/api/auth/verify-otp', authRateLimiter, asyncHandler(verifyOTP));

// Custom OTP rate check
const rateCheck = checkOTPRateLimit(phone);
if (!rateCheck.allowed) {
  throw new RateLimitError('Too many OTP requests', {
    resetTime: rateCheck.resetTime,
  });
}
```

### Error Handler Middleware

Automatically formats all errors:

```typescript
// In index.ts
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Register after all routes
app.use(notFoundHandler); // 404 handler
app.use(errorHandler); // Global error handler
```

---

## Frontend Error Handling

### Toast Notifications

Wrap your app with `ToastProvider`:

```typescript
// App.tsx
import { ToastProvider } from './hooks/useToast';

function App() {
  return (
    <ToastProvider>
      {/* Your app content */}
    </ToastProvider>
  );
}
```

Use the `useToast` hook:

```typescript
import { useToast } from '../hooks/useToast';

function MyComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Order placed successfully!');
  };

  const handleError = () => {
    toast.error('Failed to place order', 'Please check your internet connection and try again.');
  };

  const handleWarning = () => {
    toast.warning('This offer will expire in 1 hour');
  };

  const handleInfo = () => {
    toast.info('Your order is being processed');
  };

  return <div>{/* Component content */}</div>;
}
```

### Error Boundary

Wrap components to catch rendering errors:

```typescript
import { ErrorBoundary } from './components/error/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Caught by ErrorBoundary:', error, errorInfo);
        // Send to logging service
      }}
    >
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### API Error Handling

```typescript
import { parseApiError, retryWithBackoff, isOffline, waitForOnline } from '../utils/apiErrorHandler';
import { useToast } from '../hooks/useToast';

function MyComponent() {
  const toast = useToast();

  const handleSubmit = async () => {
    try {
      // Check if offline
      if (isOffline()) {
        toast.warning('You are offline', 'Changes will be saved when you reconnect.');
        await waitForOnline(); // Wait for connection
      }

      // Retry with exponential backoff
      const response = await retryWithBackoff(
        () => api.post('/orders', orderData),
        {
          maxRetries: 3,
          onRetry: (attempt, error) => {
            toast.info(`Retrying... (attempt ${attempt}/3)`);
          },
        }
      );

      toast.success('Order placed successfully!');
    } catch (error) {
      const { userMessage, code, details } = parseApiError(error);
      toast.error('Failed to place order', userMessage);

      // Handle specific error codes
      if (code === 'UNAUTHORIZED') {
        // Redirect to login
        navigate('/login');
      }
    }
  };
}
```

### Loading States

```typescript
import { LoadingSpinner, InlineSpinner, Skeleton } from '../components/common/LoadingSpinner';

// Full-screen loading
<LoadingSpinner size="lg" message="Loading..." fullScreen />

// Inline loading in button
<button disabled={isLoading}>
  {isLoading ? <InlineSpinner /> : 'Submit'}
</button>

// Skeleton loaders for content placeholders
<Skeleton width="100%" height="60px" count={3} />
```

### Retry Button

```typescript
import { RetryButton, ErrorState, EmptyState } from '../components/common/RetryButton';

// Simple retry button
<RetryButton onRetry={handleRetry} />

// Full error state
<ErrorState
  message="Failed to load orders"
  description="Something went wrong while fetching your orders."
  onRetry={handleRetry}
/>

// Empty state
<EmptyState
  icon={Icons.Package}
  title="No orders yet"
  description="Your orders will appear here once you place one."
  action={{
    label: 'Browse Products',
    onClick: () => navigate('/catalog'),
  }}
/>
```

---

## Edge Cases

### 1. RFQ with No Suppliers Selected

**Backend validation:**
```typescript
if (!req.body.suppliers || req.body.suppliers.length === 0) {
  throw new NoSuppliersSelectedError();
}
```

**Frontend:**
```typescript
if (selectedSuppliers.length === 0) {
  toast.error('Please select at least one supplier');
  return;
}
```

### 2. Offer Expired

**Backend:**
```typescript
if (new Date() > new Date(offer.expires_at)) {
  throw new OfferExpiredError(offer.expires_at);
}
```

**Frontend:**
```typescript
if (isOfferExpired(offer)) {
  toast.warning('This offer has expired', 'Please request a new quote.');
  navigate('/rfqs');
}
```

### 3. Confirmation Window Expired (24h)

**Backend:**
```typescript
import { isWithin24Hours } from '../utils/validation';

if (!isWithin24Hours(delivery.delivered_at)) {
  throw new ConfirmationWindowExpiredError(delivery.delivered_at);
}
```

### 4. Wrong Phone Confirmation

**Backend:**
```typescript
if (req.user.phone !== order.buyer_phone) {
  throw new WrongPhoneConfirmationError();
}
```

### 5. SKU Unavailable Mid-Flow

**Backend:**
```typescript
if (!sku.is_active || !sku.direct_order_enabled) {
  throw new SKUUnavailableError(sku.id, 'Item has been deactivated');
}
```

**Frontend:**
```typescript
if (!sku.is_active) {
  toast.warning('Item no longer available', 'Try requesting a quote instead.');
  // Show "Add to RFQ" option
}
```

### 6. Project Outside Delivery Zone

**Backend:**
```typescript
if (distance > supplier.delivery_radius_km) {
  throw new OutsideDeliveryZoneError(supplier.name, project.location);
}
```

### 7. Duplicate Order Detection

**Backend:**
```typescript
const existing = await pool.query(
  `SELECT id FROM orders
   WHERE buyer_id = $1 AND supplier_id = $2
   AND created_at > NOW() - INTERVAL '5 minutes'`,
  [buyerId, supplierId]
);

if (existing.rows.length > 0) {
  throw new DuplicateOrderError(existing.rows[0].id);
}
```

### 8. OTP Expired/Invalid

**Backend:**
```typescript
if (Date.now() > otp.expires_at) {
  throw new OTPExpiredError();
}

if (otp.code !== providedCode) {
  attemptsRemaining--;
  if (attemptsRemaining === 0) {
    // Lock account temporarily
  }
  throw new InvalidOTPError(attemptsRemaining);
}
```

### 9. Network Errors

**Frontend:**
```typescript
try {
  await api.post('/orders', data);
} catch (error) {
  if (isOffline()) {
    toast.warning('You are offline', 'Reconnect to complete this action.');
    // Queue action for later
    queueOfflineAction('createOrder', data);
  }
}
```

---

## Best Practices

### Backend

1. **Always use custom error classes**
   - Don't throw raw `Error` objects
   - Use specific error classes for different scenarios

2. **Provide helpful error details**
   ```typescript
   throw new ValidationError('Invalid price', {
     field: 'price',
     value: -100,
     expected: 'Positive number',
   });
   ```

3. **Log errors appropriately**
   - Operational errors: log at info/warn level
   - Non-operational errors: log at error level + alert admin

4. **Use rate limiting**
   - Apply to all sensitive endpoints
   - Different limits for different operations

5. **Validate early**
   - Validate at the controller level before business logic
   - Use validation utilities for consistency

### Frontend

1. **Always show user-friendly messages**
   - Never show technical errors to users
   - Provide actionable next steps

2. **Use loading states**
   - Show spinners during async operations
   - Disable buttons to prevent double submission

3. **Implement retry logic**
   - Auto-retry network errors
   - Show manual retry button for failures

4. **Handle offline gracefully**
   - Detect offline state
   - Queue actions when offline
   - Sync when back online

5. **Use Error Boundaries**
   - Wrap major sections of the app
   - Provide fallback UI
   - Log errors for debugging

---

## Testing

### Backend

```typescript
// Test error cases
describe('Order creation', () => {
  it('should throw ValidationError for missing fields', async () => {
    await expect(createOrder({} as any)).rejects.toThrow(ValidationError);
  });

  it('should throw NotFoundError for invalid SKU', async () => {
    await expect(createOrder({ skuId: 'invalid' })).rejects.toThrow(NotFoundError);
  });

  it('should throw RateLimitError after too many requests', async () => {
    // Make 10+ requests quickly
    for (let i = 0; i < 15; i++) {
      if (i < 10) {
        await createOrder(validData);
      } else {
        await expect(createOrder(validData)).rejects.toThrow(RateLimitError);
      }
    }
  });
});
```

### Frontend

```typescript
// Test error handling
describe('OrderForm', () => {
  it('should show error toast on API failure', async () => {
    const toast = { error: jest.fn() };
    render(<OrderForm toast={toast} />);

    // Simulate API error
    api.post.mockRejectedValue(new Error('Network error'));

    await userEvent.click(screen.getByText('Submit'));

    expect(toast.error).toHaveBeenCalledWith(
      expect.stringContaining('Failed'),
      expect.any(String)
    );
  });

  it('should retry on network error', async () => {
    render(<OrderForm />);

    // First call fails, second succeeds
    api.post.mockRejectedValueOnce(new Error('Network error'));
    api.post.mockResolvedValueOnce({ data: { success: true } });

    await userEvent.click(screen.getByText('Submit'));
    await userEvent.click(screen.getByText('Retry'));

    expect(api.post).toHaveBeenCalledTimes(2);
  });
});
```

---

## Summary

- **Backend**: Use custom error classes, validate inputs, apply rate limiting
- **Frontend**: Show user-friendly messages, implement retry logic, handle offline
- **Always**: Log errors, provide fallback UI, test edge cases
