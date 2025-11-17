import { Request, Response } from 'express';
import pool from '../config/database';
import {
  generateOTP,
  hashOTP,
  verifyOTP,
  validateGeorgianPhone,
  formatPhone,
  sendOTPSMS,
} from '../utils/otp';
import { generateToken, generateTempToken, verifyToken, isTempToken } from '../utils/jwt';
import { checkOTPRateLimit } from '../middleware/rateLimiter';

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 3;

/**
 * POST /api/auth/request-otp
 * Request an OTP code for phone verification
 * In development mode, auto-login without OTP verification
 */
export async function requestOTP(req: Request, res: Response): Promise<void> {
  try {
    let { phone } = req.body;

    // Validate phone number presence
    if (!phone) {
      res.status(400).json({
        success: false,
        error: 'Phone number is required',
      });
      return;
    }

    // Format and validate phone number
    phone = formatPhone(phone);

    if (!validateGeorgianPhone(phone)) {
      res.status(400).json({
        success: false,
        error: 'Invalid Georgian phone number format. Expected: +995XXXXXXXXX',
      });
      return;
    }

    // DEVELOPMENT MODE: Auto-login without OTP verification
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n🔓 [DEV MODE] Auto-login for ${phone} - OTP verification bypassed\n`);

      // Check if user exists
      const userResult = await pool.query(
        'SELECT id, name, user_type, buyer_role, language, is_active FROM users WHERE phone = $1',
        [phone]
      );

      if (userResult.rows.length === 0) {
        // New user - return temp token for registration
        const tempToken = generateTempToken(phone);

        res.json({
          success: true,
          registration_required: true,
          temp_token: tempToken,
          message: 'Phone verified. Please complete registration.',
        });
        return;
      }

      // Existing user - generate full JWT and login
      const user = userResult.rows[0];

      if (!user.is_active) {
        res.status(403).json({
          success: false,
          error: 'Account is deactivated. Please contact support.',
        });
        return;
      }

      const token = generateToken({
        userId: user.id,
        phone: phone,
        userType: user.user_type,
      });

      // Update last login
      await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

      res.json({
        success: true,
        registration_required: false,
        token,
        user: {
          id: user.id,
          phone: phone,
          name: user.name,
          user_type: user.user_type,
          buyer_role: user.buyer_role,
          language: user.language,
        },
      });
      return;
    }

    // PRODUCTION MODE: Normal OTP flow
    // Check rate limit
    const rateLimit = checkOTPRateLimit(phone);
    if (!rateLimit.allowed) {
      res.status(429).json({
        success: false,
        error: `Too many OTP requests. Please try again after ${rateLimit.resetTime?.toLocaleTimeString()}`,
        resetTime: rateLimit.resetTime,
      });
      return;
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);

    // Store OTP in database
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await pool.query(
      `INSERT INTO otps (phone, otp_code, purpose, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [phone, hashedOTP, 'login', expiresAt]
    );

    // Send OTP via SMS
    await sendOTPSMS(phone, otp);

    // Return success (don't leak OTP in response)
    res.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: OTP_EXPIRY_MINUTES * 60, // seconds
      remainingAttempts: rateLimit.remainingAttempts,
    });
  } catch (error) {
    console.error('Request OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP. Please try again.',
    });
  }
}

/**
 * POST /api/auth/verify-otp
 * Verify OTP and login or initiate registration
 */
export async function verifyOTP_endpoint(req: Request, res: Response): Promise<void> {
  try {
    let { phone, otp } = req.body;

    // Validate input
    if (!phone || !otp) {
      res.status(400).json({
        success: false,
        error: 'Phone number and OTP are required',
      });
      return;
    }

    phone = formatPhone(phone);

    if (!validateGeorgianPhone(phone)) {
      res.status(400).json({
        success: false,
        error: 'Invalid phone number format',
      });
      return;
    }

    // Find the most recent non-used, non-expired OTP
    const otpResult = await pool.query(
      `SELECT id, otp_code, attempts, expires_at, is_used
       FROM otps
       WHERE phone = $1
         AND purpose = 'login'
         AND is_used = false
         AND expires_at > NOW()
       ORDER BY created_at DESC
       LIMIT 1`,
      [phone]
    );

    if (otpResult.rows.length === 0) {
      res.status(400).json({
        success: false,
        error: 'No valid OTP found. Please request a new one.',
      });
      return;
    }

    const otpRecord = otpResult.rows[0];

    // Check if max attempts exceeded
    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      // Mark as used
      await pool.query('UPDATE otps SET is_used = true WHERE id = $1', [otpRecord.id]);

      res.status(400).json({
        success: false,
        error: 'Maximum verification attempts exceeded. Please request a new OTP.',
      });
      return;
    }

    // Verify OTP
    const isValid = await verifyOTP(otp, otpRecord.otp_code);

    if (!isValid) {
      // Increment attempts
      const newAttempts = otpRecord.attempts + 1;
      await pool.query('UPDATE otps SET attempts = $1 WHERE id = $2', [newAttempts, otpRecord.id]);

      res.status(400).json({
        success: false,
        error: 'Invalid OTP code',
        remainingAttempts: MAX_OTP_ATTEMPTS - newAttempts,
      });
      return;
    }

    // Mark OTP as used
    await pool.query('UPDATE otps SET is_used = true WHERE id = $1', [otpRecord.id]);

    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, name, user_type, buyer_role, language, is_active FROM users WHERE phone = $1',
      [phone]
    );

    if (userResult.rows.length === 0) {
      // New user - return temp token for registration
      const tempToken = generateTempToken(phone);

      res.json({
        success: true,
        registration_required: true,
        temp_token: tempToken,
        message: 'Phone verified. Please complete registration.',
      });
      return;
    }

    // Existing user - generate full JWT and create session
    const user = userResult.rows[0];

    if (!user.is_active) {
      res.status(403).json({
        success: false,
        error: 'Account is deactivated. Please contact support.',
      });
      return;
    }

    const token = generateToken({
      userId: user.id,
      phone: phone,
      userType: user.user_type,
    });

    // Update last login
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    // Create session record (optional, for refresh token management)
    // await pool.query(
    //   'INSERT INTO user_sessions (user_id, refresh_token, expires_at) VALUES ($1, $2, $3)',
    //   [user.id, refreshToken, expiresAt]
    // );

    res.json({
      success: true,
      registration_required: false,
      token,
      user: {
        id: user.id,
        phone: phone,
        name: user.name,
        user_type: user.user_type,
        buyer_role: user.buyer_role,
        language: user.language,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Verification failed. Please try again.',
    });
  }
}

/**
 * POST /api/auth/complete-registration
 * Complete user registration after OTP verification
 */
export async function completeRegistration(req: Request, res: Response): Promise<void> {
  try {
    const { temp_token, name, user_type, buyer_role, language = 'ka' } = req.body;

    // Validate input
    if (!temp_token || !name || !user_type) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: temp_token, name, user_type',
      });
      return;
    }

    // Verify temp token
    let payload;
    try {
      payload = verifyToken(temp_token);
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid temporary token',
      });
      return;
    }

    // Check if it's a temp token
    if (!isTempToken(payload)) {
      res.status(400).json({
        success: false,
        error: 'Invalid temporary token',
      });
      return;
    }

    // Validate user_type
    const validUserTypes = ['buyer', 'supplier', 'admin'];
    if (!validUserTypes.includes(user_type)) {
      res.status(400).json({
        success: false,
        error: 'Invalid user_type. Must be: buyer, supplier, or admin',
      });
      return;
    }

    // Validate buyer_role if user_type is buyer
    if (user_type === 'buyer') {
      if (!buyer_role) {
        res.status(400).json({
          success: false,
          error: 'buyer_role is required for buyer accounts',
        });
        return;
      }

      const validBuyerRoles = ['homeowner', 'contractor'];
      if (!validBuyerRoles.includes(buyer_role)) {
        res.status(400).json({
          success: false,
          error: 'Invalid buyer_role. Must be: homeowner or contractor',
        });
        return;
      }
    }

    const phone = payload.phone;

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE phone = $1', [phone]);

    if (existingUser.rows.length > 0) {
      res.status(400).json({
        success: false,
        error: 'User already exists. Please login instead.',
      });
      return;
    }

    // Validate language
    const validLanguages = ['ka', 'en'];
    const userLanguage = validLanguages.includes(language) ? language : 'ka';

    // Create user
    const userResult = await pool.query(
      `INSERT INTO users (phone, name, user_type, buyer_role, language, is_verified)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, phone, name, user_type, buyer_role, language`,
      [phone, name.trim(), user_type, user_type === 'buyer' ? buyer_role : null, userLanguage]
    );

    const user = userResult.rows[0];

    // Generate full JWT token
    const token = generateToken({
      userId: user.id,
      phone: user.phone,
      userType: user.user_type,
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        user_type: user.user_type,
        buyer_role: user.buyer_role,
        language: user.language,
      },
      message: 'Registration completed successfully',
    });
  } catch (error) {
    console.error('Complete registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.',
    });
  }
}

/**
 * GET /api/auth/me
 * Get current user information
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user information',
    });
  }
}

/**
 * PATCH /api/auth/update-preferences
 * Update user preferences (language, etc.)
 */
export async function updatePreferences(req: Request, res: Response): Promise<void> {
  try {
    const { language } = req.body;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // Validate language if provided
    if (language) {
      const validLanguages = ['ka', 'en'];
      if (!validLanguages.includes(language)) {
        res.status(400).json({
          success: false,
          error: 'Invalid language. Must be: ka or en',
        });
        return;
      }

      // Update user language
      await pool.query(
        'UPDATE users SET language = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [language, req.user.id]
      );
    }

    // Fetch updated user
    const result = await pool.query(
      `SELECT id, phone, name, user_type, buyer_role, language
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    const user = result.rows[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        user_type: user.user_type,
        buyer_role: user.buyer_role,
        language: user.language,
      },
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences',
    });
  }
}

/**
 * POST /api/auth/logout
 * Logout user (invalidate session if using session table)
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  try {
    // If using session table, delete the session here
    // await pool.query('DELETE FROM user_sessions WHERE user_id = $1', [req.user?.id]);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
}
