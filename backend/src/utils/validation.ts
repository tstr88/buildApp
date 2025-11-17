/**
 * Validation Utilities
 * Helper functions for validating user input
 */

import { ValidationError } from '../types/errors';

/**
 * Validate Georgian phone number
 * Format: +995XXXXXXXXX (12 digits total)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+995\d{9}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate phone number and throw error if invalid
 */
export function assertValidPhone(phone: string): void {
  if (!validatePhone(phone)) {
    throw new ValidationError('Invalid phone number format', {
      field: 'phone',
      value: phone,
      expected: '+995XXXXXXXXX (Georgian phone number)',
    });
  }
}

/**
 * Validate coordinates (latitude, longitude)
 */
export function validateCoordinates(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    !isNaN(lat) &&
    !isNaN(lng)
  );
}

/**
 * Validate coordinates and throw error if invalid
 */
export function assertValidCoordinates(lat: number, lng: number): void {
  if (!validateCoordinates(lat, lng)) {
    throw new ValidationError('Invalid coordinates', {
      field: 'coordinates',
      value: { lat, lng },
      expected: 'lat: -90 to 90, lng: -180 to 180',
    });
  }
}

/**
 * Check if timestamp is within 24 hours of now
 */
export function isWithin24Hours(timestamp: Date | string): boolean {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const hours24Ms = 24 * 60 * 60 * 1000;
  return diffMs >= 0 && diffMs <= hours24Ms;
}

/**
 * Validate price (must be positive number)
 */
export function validatePrice(price: number): boolean {
  return typeof price === 'number' && price > 0 && !isNaN(price) && isFinite(price);
}

/**
 * Validate price and throw error if invalid
 */
export function assertValidPrice(price: number, field: string = 'price'): void {
  if (!validatePrice(price)) {
    throw new ValidationError('Invalid price', {
      field,
      value: price,
      expected: 'Positive number',
    });
  }
}

/**
 * Validate quantity (must be positive integer)
 */
export function validateQuantity(quantity: number): boolean {
  return Number.isInteger(quantity) && quantity > 0;
}

/**
 * Validate quantity and throw error if invalid
 */
export function assertValidQuantity(quantity: number, field: string = 'quantity'): void {
  if (!validateQuantity(quantity)) {
    throw new ValidationError('Invalid quantity', {
      field,
      value: quantity,
      expected: 'Positive integer',
    });
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate date is in the future
 */
export function isFutureDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.getTime() > Date.now();
}

/**
 * Validate required fields are present
 */
export function assertRequiredFields(data: any, fields: string[]): void {
  const missing = fields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    throw new ValidationError('Missing required fields', {
      field: missing.join(', '),
      expected: `Required fields: ${fields.join(', ')}`,
    });
  }
}

/**
 * Validate array is not empty
 */
export function assertNonEmptyArray(arr: any[], field: string): void {
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new ValidationError(`${field} cannot be empty`, {
      field,
      value: arr,
      expected: 'Non-empty array',
    });
  }
}

/**
 * Validate string length
 */
export function assertStringLength(
  str: string,
  field: string,
  min?: number,
  max?: number
): void {
  if (min !== undefined && str.length < min) {
    throw new ValidationError(`${field} is too short`, {
      field,
      value: str.length,
      expected: `Minimum ${min} characters`,
    });
  }
  if (max !== undefined && str.length > max) {
    throw new ValidationError(`${field} is too long`, {
      field,
      value: str.length,
      expected: `Maximum ${max} characters`,
    });
  }
}

/**
 * Validate value is within range
 */
export function assertInRange(
  value: number,
  field: string,
  min: number,
  max: number
): void {
  if (value < min || value > max) {
    throw new ValidationError(`${field} is out of range`, {
      field,
      value,
      expected: `Between ${min} and ${max}`,
    });
  }
}

/**
 * Validate enum value
 */
export function assertValidEnum<T>(
  value: any,
  field: string,
  validValues: T[]
): asserts value is T {
  if (!validValues.includes(value)) {
    throw new ValidationError(`Invalid ${field}`, {
      field,
      value,
      expected: `One of: ${validValues.join(', ')}`,
    });
  }
}
