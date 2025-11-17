# buildApp Authentication System

## Overview

The buildApp authentication system uses **phone-based OTP (One-Time Password) verification** for secure, passwordless authentication. This provides a simple and secure way for Georgian users to access the platform.

## Features

✅ Phone-based authentication (Georgian numbers: +995XXXXXXXXX)
✅ 6-digit OTP codes
✅ Rate limiting (3 OTP requests per hour per phone)
✅ Max 3 verification attempts per OTP
✅ 5-minute OTP expiry
✅ JWT token-based sessions (7-day expiry)
✅ Automatic token refresh validation
✅ Protected and public routes
✅ User roles (buyer/supplier with sub-roles)
✅ Bilingual UI (Georgian/English)

## Architecture

### Backend

**Tech Stack:**
- Express.js with TypeScript
- PostgreSQL for data storage
- JWT for session management
- bcrypt for OTP hashing
- express-rate-limit for rate limiting

**Key Components:**
1. **OTP Utilities** (`src/utils/otp.ts`)
   - OTP generation
   - OTP hashing/verification
   - Phone number validation
   - SMS integration (Twilio-ready)

2. **JWT Utilities** (`src/utils/jwt.ts`)
   - Token generation
   - Token verification
   - Temporary tokens for registration

3. **Rate Limiting** (`src/middleware/rateLimiter.ts`)
   - Phone-based rate limiting
   - IP-based rate limiting
   - In-memory store (Redis-ready)

4. **Authentication Middleware** (`src/middleware/auth.ts`)
   - JWT verification
   - User session validation
   - Role-based access control

5. **Auth Controller** (`src/controllers/authController.ts`)
   - `/request-otp` - Request OTP code
   - `/verify-otp` - Verify OTP and login
   - `/complete-registration` - Complete new user registration
   - `/me` - Get current user
   - `/logout` - Logout

### Frontend

**Tech Stack:**
- React 19 with TypeScript
- React Router DOM for routing
- Axios for API calls
- jwt-decode for token parsing
- Context API for state management

**Key Components:**
1. **PhoneInput** (`src/components/PhoneInput.tsx`)
   - Georgian phone number input (+995 prefix)
   - Format validation
   - Paste support

2. **OTPInput** (`src/components/OTPInput.tsx`)
   - 6-digit code input
   - Auto-focus next field
   - Paste support
   - Keyboard navigation

3. **RegistrationForm** (`src/components/RegistrationForm.tsx`)
   - Name input
   - User type selection (buyer/supplier)
   - Buyer role selection (homeowner/contractor)

4. **AuthContext** (`src/context/AuthContext.tsx`)
   - Global auth state management
   - Login/logout functions
   - Auto token expiry check
   - Local storage persistence

5. **Pages:**
   - `Login` - Phone + OTP verification
   - `Register` - Complete registration for new users
   - `Home` - Protected home page (example)

## Authentication Flow

### New User Registration

```
1. User enters phone number (+995XXXXXXXXX)
   ↓
2. Backend validates phone format
   ↓
3. Backend checks rate limit (3 per hour)
   ↓
4. Backend generates 6-digit OTP
   ↓
5. Backend hashes and stores OTP (5-min expiry)
   ↓
6. Backend sends OTP via SMS (logs in dev mode)
   ↓
7. User enters OTP code
   ↓
8. Backend verifies OTP (max 3 attempts)
   ↓
9. Backend checks if user exists
   ↓
10. No user found → Return temp token
   ↓
11. User completes registration form
    - Name
    - User type (buyer/supplier)
    - Buyer role (if buyer)
   ↓
12. Backend creates user account
   ↓
13. Backend returns JWT token + user data
   ↓
14. Frontend stores token + redirects to home
```

### Existing User Login

```
1. User enters phone number
   ↓
2. Backend validates and sends OTP
   ↓
3. User enters OTP code
   ↓
4. Backend verifies OTP
   ↓
5. Backend finds existing user
   ↓
6. Backend returns JWT token + user data
   ↓
7. Frontend stores token + redirects to home
```

## API Endpoints

### POST /api/auth/request-otp

Request an OTP code.

**Request:**
```json
{
  "phone": "+995555123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": 300,
  "remainingAttempts": 2
}
```

**Response (Rate Limited):**
```json
{
  "success": false,
  "error": "Too many OTP requests. Please try again in an hour.",
  "resetTime": "2025-01-30T14:30:00Z"
}
```

**Rate Limit:** 3 requests per phone per hour

### POST /api/auth/verify-otp

Verify OTP code and login or initiate registration.

**Request:**
```json
{
  "phone": "+995555123456",
  "otp": "123456"
}
```

**Response (New User):**
```json
{
  "success": true,
  "registration_required": true,
  "temp_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Phone verified. Please complete registration."
}
```

**Response (Existing User):**
```json
{
  "success": true,
  "registration_required": false,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "phone": "+995555123456",
    "name": "Giorgi Beridze",
    "user_type": "buyer",
    "buyer_role": "homeowner",
    "language": "ka"
  }
}
```

**Response (Invalid OTP):**
```json
{
  "success": false,
  "error": "Invalid OTP code",
  "remainingAttempts": 2
}
```

**Max Attempts:** 3 per OTP

### POST /api/auth/complete-registration

Complete user registration after OTP verification.

**Request:**
```json
{
  "temp_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "name": "Giorgi Beridze",
  "user_type": "buyer",
  "buyer_role": "homeowner"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "phone": "+995555123456",
    "name": "Giorgi Beridze",
    "user_type": "buyer",
    "buyer_role": "homeowner",
    "language": "ka"
  },
  "message": "Registration completed successfully"
}
```

### GET /api/auth/me

Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "phone": "+995555123456",
    "name": "Giorgi Beridze",
    "user_type": "buyer",
    "buyer_role": "homeowner",
    "language": "ka"
  }
}
```

### POST /api/auth/logout

Logout (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Frontend Usage

### Using AuthContext

```tsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Routes

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
}
```

### Making Authenticated API Calls

```tsx
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { token } = useAuth();

  const fetchData = async () => {
    const response = await axios.get('/api/some-endpoint', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  };

  // ...
}
```

## Security Features

### OTP Security

1. **Hashing:** OTPs are hashed with bcrypt before storage
2. **Expiry:** 5-minute expiration
3. **Single Use:** OTPs are marked as used after verification
4. **Max Attempts:** 3 attempts per OTP before invalidation

### Rate Limiting

1. **OTP Requests:** 3 per phone per hour
2. **Auth Endpoints:** 10 requests per IP per 15 minutes
3. **API General:** 100 requests per IP per 15 minutes

### JWT Security

1. **Expiry:** 7-day default expiration
2. **Secret:** Configurable via JWT_SECRET env variable
3. **Verification:** Every request verifies token and checks user status
4. **Auto Expiry Check:** Frontend checks token expiry every minute

### Database Security

1. **Hashed OTPs:** Never store plain OTPs
2. **User Status:** Check is_active flag on every auth
3. **Audit Trail:** Track last_login_at and session info

## Configuration

### Backend Environment Variables

```env
# JWT Configuration
JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRE=7d

# SMS Configuration (optional - Twilio)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

### Frontend Environment Variables

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:5000/api
```

## Development vs Production

### Development Mode

- OTPs are logged to console
- SMS sending is skipped
- Can see detailed error messages

To test in development:
1. Start backend: `npm run dev`
2. Start frontend: `npm run dev`
3. Enter phone number
4. Check backend console for OTP code
5. Enter OTP in frontend

### Production Mode

- OTPs sent via SMS (configure Twilio)
- Generic error messages
- Rate limiting enforced

## SMS Integration (Twilio)

To enable SMS sending in production:

1. Install Twilio SDK:
```bash
npm install twilio
```

2. Update `src/utils/otp.ts`:

```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendOTPSMS(phone: string, otp: string): Promise<boolean> {
  if (process.env.NODE_ENV === 'production') {
    try {
      await client.messages.create({
        body: `Your buildApp verification code is: ${otp}. Valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      });
      return true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  logOTPInDevelopment(phone, otp);
  return true;
}
```

3. Set environment variables:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+995xxxxxxxxx
```

## Testing

### Test User Flow

1. **New User Registration:**
   - Open http://localhost:5173/login
   - Enter: +995555123456
   - Check backend console for OTP
   - Enter OTP
   - Fill registration form
   - Should redirect to home

2. **Existing User Login:**
   - Logout
   - Enter same phone number
   - Get new OTP
   - Enter OTP
   - Should redirect to home directly

3. **Rate Limiting:**
   - Request OTP 3 times
   - 4th request should be blocked for 1 hour

4. **Token Expiry:**
   - Login
   - Check localStorage for token
   - Set system time forward 8 days
   - Refresh page
   - Should redirect to login

## Troubleshooting

### OTP Not Sending

Check:
- Backend is running
- Phone number format is correct (+995XXXXXXXXX)
- Not rate limited (check backend logs)
- Database connection is working

### OTP Verification Fails

Check:
- OTP hasn't expired (5 minutes)
- Haven't exceeded 3 attempts
- OTP code is exactly 6 digits
- Check backend logs for errors

### Token Invalid

Check:
- Token hasn't expired (7 days)
- JWT_SECRET hasn't changed
- User account is still active
- Clear localStorage and login again

### Rate Limited

Wait for the reset time shown in error message (1 hour from first request).

## Future Enhancements

Potential improvements:

1. **Refresh Tokens:** Implement refresh token rotation
2. **2FA:** Optional two-factor authentication
3. **Social Login:** Google/Facebook OAuth (optional)
4. **Remember Device:** Skip OTP for trusted devices
5. **Redis:** Use Redis for rate limiting (scalable)
6. **Session Management:** Track active sessions in database
7. **Biometric Auth:** Face ID / Fingerprint for mobile
8. **Email Fallback:** Email OTP as backup

## Database Schema

### users table
```sql
id UUID PRIMARY KEY
phone VARCHAR(20) UNIQUE NOT NULL
name VARCHAR(255) NOT NULL
user_type user_type NOT NULL  -- buyer, supplier, admin
buyer_role buyer_role          -- homeowner, contractor
language language_preference   -- ka, en
is_active BOOLEAN
is_verified BOOLEAN
last_login_at TIMESTAMP
created_at TIMESTAMP
updated_at TIMESTAMP
```

### otps table
```sql
id UUID PRIMARY KEY
phone VARCHAR(20) NOT NULL
otp_code VARCHAR(60) NOT NULL  -- bcrypt hash
purpose VARCHAR(50)             -- login, registration, reset
attempts INTEGER DEFAULT 0
is_used BOOLEAN DEFAULT false
expires_at TIMESTAMP NOT NULL
created_at TIMESTAMP
```

### user_sessions table (optional, for refresh tokens)
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES users(id)
refresh_token TEXT
device_info JSONB
ip_address INET
expires_at TIMESTAMP
created_at TIMESTAMP
last_used_at TIMESTAMP
```

## Support

For issues or questions:
1. Check this documentation
2. Review code comments
3. Check backend logs
4. Test with Postman/curl

## License

Part of the buildApp project.

---

**Last Updated:** 2025-01
**Version:** 1.0
