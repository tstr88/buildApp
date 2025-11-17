import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  // Generate a random 6-digit number
  const otp = crypto.randomInt(100000, 999999).toString();
  return otp;
}

/**
 * Hash an OTP code for secure storage
 */
export async function hashOTP(otp: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(otp, saltRounds);
}

/**
 * Verify an OTP code against its hash
 */
export async function verifyOTP(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

/**
 * Validate Georgian phone number format
 * Expected format: +995XXXXXXXXX (9 digits after +995)
 */
export function validateGeorgianPhone(phone: string): boolean {
  const georgianPhoneRegex = /^\+995\d{9}$/;
  return georgianPhoneRegex.test(phone);
}

/**
 * Format phone number to standard format
 */
export function formatPhone(phone: string): string {
  // Remove all non-digit characters except +
  let formatted = phone.replace(/[^\d+]/g, '');

  // If it starts with 995, add +
  if (formatted.startsWith('995')) {
    formatted = '+' + formatted;
  }

  // If it doesn't start with +995, assume it's missing and add it
  if (!formatted.startsWith('+995')) {
    // Remove leading zeros or +
    formatted = formatted.replace(/^[0+]+/, '');
    formatted = '+995' + formatted;
  }

  return formatted;
}

/**
 * Log OTP in development (for testing)
 */
export function logOTPInDevelopment(phone: string, otp: string): void {
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n' + '='.repeat(60));
    console.log('🔐 OTP GENERATED (Development Mode)');
    console.log('='.repeat(60));
    console.log(`Phone: ${phone}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Expires: 5 minutes`);
    console.log('='.repeat(60) + '\n');
  }
}

/**
 * Send OTP via SMS (production)
 * TODO: Integrate with Twilio or similar service
 */
export async function sendOTPSMS(phone: string, otp: string): Promise<boolean> {
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implement Twilio or other SMS service
    // Example:
    // const twilio = require('twilio')(accountSid, authToken);
    // await twilio.messages.create({
    //   body: `Your buildApp verification code is: ${otp}`,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: phone
    // });

    console.warn('SMS sending not implemented. Configure Twilio or SMS service.');
    return false;
  }

  // In development, just log it
  logOTPInDevelopment(phone, otp);
  return true;
}
