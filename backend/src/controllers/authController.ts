import { Request, Response } from 'express';
import pool from '../config/database';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';

const SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * Register a new user with email/phone and password
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, phone, password, name, user_type, buyer_role, language = 'ka' } = req.body;

    // Validate required fields
    if (!email || !password || !name || !user_type) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: email, password, name, user_type',
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
      return;
    }

    // Validate password (minimum 6 characters)
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long',
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

    // Check if email already exists
    const existingEmail = await pool.query('SELECT id FROM users WHERE email = $1', [
      email.toLowerCase(),
    ]);

    if (existingEmail.rows.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Email already registered. Please login instead.',
      });
      return;
    }

    // Check if phone already exists (if provided)
    if (phone) {
      const existingPhone = await pool.query(
        'SELECT id FROM users WHERE phone = $1 AND phone IS NOT NULL',
        [phone]
      );

      if (existingPhone.rows.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Phone number already registered',
        });
        return;
      }
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Validate language
    const validLanguages = ['ka', 'en'];
    const userLanguage = validLanguages.includes(language) ? language : 'ka';

    // Create user
    const userResult = await pool.query(
      `INSERT INTO users (email, phone, password_hash, name, user_type, buyer_role, language, is_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING id, email, phone, name, user_type, buyer_role, language`,
      [
        email.toLowerCase(),
        phone || null,
        password_hash,
        name.trim(),
        user_type,
        user_type === 'buyer' ? buyer_role : null,
        userLanguage,
      ]
    );

    const user = userResult.rows[0];

    // Generate JWT token
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
        email: user.email,
        phone: user.phone,
        name: user.name,
        user_type: user.user_type,
        buyer_role: user.buyer_role,
        language: user.language,
      },
      message: 'Registration completed successfully',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.',
    });
  }
}

/**
 * POST /api/auth/login
 * Login with email/phone and password
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { identifier, password } = req.body; // identifier can be email or phone

    // Validate input
    if (!identifier || !password) {
      res.status(400).json({
        success: false,
        error: 'Email/phone and password are required',
      });
      return;
    }

    // Check if identifier is email or phone
    const isEmail = identifier.includes('@');

    // Find user by email or phone
    const userResult = await pool.query(
      isEmail
        ? 'SELECT id, email, phone, name, user_type, buyer_role, language, is_active, password_hash FROM users WHERE email = $1'
        : 'SELECT id, email, phone, name, user_type, buyer_role, language, is_active, password_hash FROM users WHERE phone = $1',
      [isEmail ? identifier.toLowerCase() : identifier]
    );

    if (userResult.rows.length === 0) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
      return;
    }

    const user = userResult.rows[0];

    // Check if account is active
    if (!user.is_active) {
      res.status(403).json({
        success: false,
        error: 'Account is deactivated. Please contact support.',
      });
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      phone: user.phone,
      userType: user.user_type,
    });

    // Update last login
    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        user_type: user.user_type,
        buyer_role: user.buyer_role,
        language: user.language,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.',
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
      `SELECT id, email, phone, name, user_type, buyer_role, language
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    const user = result.rows[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
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

// Keep these for backward compatibility, will be removed later
export async function requestOTP(_req: Request, res: Response): Promise<void> {
  res.status(410).json({
    success: false,
    error: 'OTP authentication has been removed. Please use email/password login.',
  });
}

export async function verifyOTP_endpoint(_req: Request, res: Response): Promise<void> {
  res.status(410).json({
    success: false,
    error: 'OTP authentication has been removed. Please use email/password login.',
  });
}

export async function completeRegistration(_req: Request, res: Response): Promise<void> {
  res.status(410).json({
    success: false,
    error: 'OTP authentication has been removed. Please use email/password register.',
  });
}
