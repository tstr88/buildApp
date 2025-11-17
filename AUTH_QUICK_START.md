# Authentication System - Quick Start

## Prerequisites

- PostgreSQL database created and migrations run
- Backend `.env` file configured
- Frontend `.env` file configured

## Setup Steps

### 1. Backend Setup

```bash
cd backend

# Already installed during previous setup, but if needed:
# npm install jsonwebtoken bcrypt express-rate-limit @types/jsonwebtoken @types/bcrypt

# Make sure .env has JWT_SECRET
# JWT_SECRET=your_secret_key_here

# Start backend
npm run dev
```

Backend will run on http://localhost:5000

### 2. Frontend Setup

```bash
cd frontend

# Already installed during previous setup, but if needed:
# npm install axios jwt-decode

# Make sure .env has API URL
# VITE_API_BASE_URL=http://localhost:5000/api

# Start frontend
npm run dev
```

Frontend will run on http://localhost:5173

### 3. Test Authentication

1. **Open** http://localhost:5173
2. **You'll be redirected** to `/login` (not authenticated)
3. **Enter phone:** +995555123456
4. **Click** "Continue"
5. **Check backend terminal** for OTP code (in development mode)
6. **Enter OTP** in frontend (6 digits)
7. **New users:** Fill registration form
   - Name: Your name
   - Type: Buyer or Supplier
   - Role: (if buyer) Homeowner or Contractor
8. **Click** "Register"
9. **Success!** Redirected to home page

### 4. Test Existing User

1. **Logout** from home page
2. **Login** with same phone number
3. **Get new OTP** (check terminal)
4. **Enter OTP**
5. **Should login** directly without registration

## Quick Test Commands

### Test with curl

**Request OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+995555123456"}'
```

**Verify OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"+995555123456","otp":"123456"}'
```

**Complete Registration (with temp_token from verify response):**
```bash
curl -X POST http://localhost:5000/api/auth/complete-registration \
  -H "Content-Type: application/json" \
  -d '{
    "temp_token":"YOUR_TEMP_TOKEN",
    "name":"Test User",
    "user_type":"buyer",
    "buyer_role":"homeowner"
  }'
```

**Get Current User (with JWT token):**
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Development Mode Features

### OTP in Console

In development, OTPs are logged to the backend console:

```
============================================================
🔐 OTP GENERATED (Development Mode)
============================================================
Phone: +995555123456
OTP Code: 123456
Expires: 5 minutes
============================================================
```

### Test Phone Numbers

Use any valid Georgian format:
- +995555123456
- +995591234567
- +995598765432

## File Structure Created

### Backend

```
backend/
├── src/
│   ├── controllers/
│   │   └── authController.ts        # Auth endpoints
│   ├── middleware/
│   │   ├── auth.ts                  # JWT middleware
│   │   └── rateLimiter.ts           # Rate limiting
│   ├── routes/
│   │   └── authRoutes.ts            # Auth routes
│   ├── utils/
│   │   ├── otp.ts                   # OTP utilities
│   │   └── jwt.ts                   # JWT utilities
│   └── index.ts                     # Updated with auth routes
```

### Frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── PhoneInput.tsx           # Phone input component
│   │   ├── OTPInput.tsx             # OTP input component
│   │   └── RegistrationForm.tsx    # Registration form
│   ├── context/
│   │   └── AuthContext.tsx          # Auth state management
│   ├── pages/
│   │   ├── Login.tsx                # Login page
│   │   ├── Register.tsx             # Registration page
│   │   └── Home.tsx                 # Protected home page
│   ├── services/
│   │   └── authApi.ts               # Auth API calls
│   └── App.tsx                      # Updated with routes
```

## Common Issues

### Port Already in Use

```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Database Not Running

```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS)
brew services start postgresql@14
```

### OTP Not Appearing

- Check backend terminal for logs
- Make sure backend is running
- Check for error messages in response

### Token Expired

- Tokens expire after 7 days
- Clear localStorage and login again
- Or wait for auto-redirect to login

## Environment Variables

### Backend `.env`

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRE=7d

DB_HOST=localhost
DB_PORT=5432
DB_NAME=buildapp
DB_USER=postgres
DB_PASSWORD=your_password
```

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=buildApp
VITE_DEFAULT_LANGUAGE=ka
```

## Next Steps

After authentication is working:

1. **Test all flows:**
   - New user registration
   - Existing user login
   - Logout
   - Protected routes

2. **Integrate with other features:**
   - Add authentication to API endpoints
   - Use `authenticate` middleware for protected routes
   - Access `req.user` in controllers

3. **Production Setup:**
   - Configure Twilio for SMS
   - Set strong JWT_SECRET
   - Enable HTTPS
   - Setup Redis for rate limiting

## API Endpoints Summary

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/request-otp` | POST | No | Request OTP code |
| `/api/auth/verify-otp` | POST | No | Verify OTP |
| `/api/auth/complete-registration` | POST | Temp Token | Complete registration |
| `/api/auth/me` | GET | Yes | Get current user |
| `/api/auth/logout` | POST | Yes | Logout |

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can request OTP
- [ ] OTP appears in backend console
- [ ] Can verify OTP (new user)
- [ ] Registration form appears
- [ ] Can complete registration
- [ ] Redirects to home after registration
- [ ] Can logout
- [ ] Can login again (existing user)
- [ ] Token persists after page refresh
- [ ] Protected routes require authentication
- [ ] Rate limiting works (try 4 OTP requests)

## Support

See [AUTH_SYSTEM_README.md](./AUTH_SYSTEM_README.md) for complete documentation.

---

**Last Updated:** 2025-01
