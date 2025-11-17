import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload, isTempToken } from '../utils/jwt';
import pool from '../config/database';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        phone: string;
        name: string;
        user_type: string;
        buyer_role?: string;
        language: string;
      };
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 * Attaches user object to req.user
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'No authentication token provided',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let payload: JWTPayload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Invalid token',
      });
      return;
    }

    // Check if it's a temporary token (not allowed for protected routes)
    if (isTempToken(payload)) {
      res.status(401).json({
        success: false,
        error: 'Temporary token not valid for this operation. Complete registration first.',
      });
      return;
    }

    // Fetch user from database
    const result = await pool.query(
      `SELECT id, phone, name, user_type, buyer_role, language, is_active
       FROM users
       WHERE id = $1`,
      [payload.userId]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      res.status(403).json({
        success: false,
        error: 'Account is deactivated',
      });
      return;
    }

    // Attach user to request
    req.user = {
      id: user.id,
      phone: user.phone,
      name: user.name,
      user_type: user.user_type,
      buyer_role: user.buyer_role,
      language: user.language,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
}

/**
 * Middleware to check if user has specific role
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.user_type)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
}

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't fail if no token
 */
export async function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);

    try {
      const payload = verifyToken(token);

      if (!isTempToken(payload)) {
        const result = await pool.query(
          `SELECT id, phone, name, user_type, buyer_role, language, is_active
           FROM users
           WHERE id = $1 AND is_active = true`,
          [payload.userId]
        );

        if (result.rows.length > 0) {
          const user = result.rows[0];
          req.user = {
            id: user.id,
            phone: user.phone,
            name: user.name,
            user_type: user.user_type,
            buyer_role: user.buyer_role,
            language: user.language,
          };
        }
      }
    } catch (error) {
      // Silently fail for optional auth
    }

    next();
  } catch (error) {
    next();
  }
}
