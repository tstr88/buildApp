import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const TEMP_TOKEN_EXPIRE = '15m'; // Temporary tokens for registration expire in 15 minutes

export interface JWTPayload {
  userId: string;
  phone: string;
  userType?: string;
  isTemp?: boolean;
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: JWTPayload, expiresIn?: string | number): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: expiresIn || JWT_EXPIRE,
  } as jwt.SignOptions);
}

/**
 * Generate a temporary token for registration
 */
export function generateTempToken(phone: string): string {
  return generateToken(
    {
      userId: '',
      phone,
      isTemp: true,
    },
    TEMP_TOKEN_EXPIRE
  );
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
}

/**
 * Generate a refresh token (longer expiry)
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, {
    expiresIn: '30d',
  });
}

/**
 * Check if token is temporary (for registration)
 */
export function isTempToken(payload: JWTPayload): boolean {
  return payload.isTemp === true;
}
