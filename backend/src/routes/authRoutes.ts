import { Router } from 'express';
import {
  register,
  login,
  requestOTP,
  verifyOTP_endpoint,
  completeRegistration,
  getCurrentUser,
  updatePreferences,
  logout,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes (no authentication required)
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);

// Old OTP routes (deprecated - return 410 Gone)
router.post('/request-otp', authRateLimiter, requestOTP);
router.post('/verify-otp', authRateLimiter, verifyOTP_endpoint);
router.post('/complete-registration', authRateLimiter, completeRegistration);

// Protected routes (authentication required)
router.get('/me', authenticate, getCurrentUser);
router.patch('/update-preferences', authenticate, updatePreferences);
router.post('/logout', authenticate, logout);

export default router;
