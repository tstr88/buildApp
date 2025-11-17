/**
 * Validation Service
 * Provides validation utilities for common data formats
 */

import { ValidationError } from '../utils/errors/CustomErrors';

/**
 * Validation service class
 */
export class ValidationService {
  /**
   * Validate Georgian phone number format
   * @param phone - Phone number string
   * @returns True if valid
   */
  validatePhone(phone: string): boolean {
    // Georgian phone format: +995XXXXXXXXX (13 characters)
    const georgianPhoneRegex = /^\+995\d{9}$/;
    return georgianPhoneRegex.test(phone);
  }

  /**
   * Validate email format
   * @param email - Email string
   * @returns True if valid
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate coordinates (latitude, longitude)
   * @param lat - Latitude
   * @param lon - Longitude
   * @returns True if valid
   */
  validateCoordinates(lat: number, lon: number): boolean {
    return (
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
    );
  }

  /**
   * Validate UUID format
   * @param uuid - UUID string
   * @returns True if valid
   */
  validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Validate measurement units
   * @param unit - Unit string
   * @returns True if valid
   */
  validateUnit(unit: string): boolean {
    const validUnits = ['m', 'm2', 'm3', 'pcs', 'kg', 'ton', 'l', 'bag', 'box', 'pallet', 'set'];
    return validUnits.includes(unit.toLowerCase());
  }

  /**
   * Validate date is in the future
   * @param date - Date to validate
   * @returns True if date is in the future
   */
  validateFutureDate(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj > new Date();
  }

  /**
   * Validate date range
   * @param startDate - Start date
   * @param endDate - End date
   * @returns True if end date is after start date
   */
  validateDateRange(startDate: Date | string, endDate: Date | string): boolean {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    return end > start;
  }

  /**
   * Validate positive number
   * @param value - Number to validate
   * @returns True if positive
   */
  validatePositiveNumber(value: number): boolean {
    return typeof value === 'number' && value > 0 && !isNaN(value);
  }

  /**
   * Validate required fields in object
   * @param data - Data object
   * @param requiredFields - Array of required field names
   * @throws ValidationError if any required field is missing
   */
  validateRequiredFields(data: Record<string, unknown>, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => {
      const value = data[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      throw new ValidationError(
        `Missing required fields: ${missingFields.join(', ')}`,
        { missingFields }
      );
    }
  }

  /**
   * Sanitize string input (remove dangerous characters)
   * @param input - Input string
   * @returns Sanitized string
   */
  sanitizeString(input: string): string {
    // Remove null bytes and control characters
    return input.replace(/[\x00-\x1F\x7F]/g, '').trim();
  }

  /**
   * Validate and sanitize phone number
   * @param phone - Phone number
   * @returns Validated and formatted phone number
   * @throws ValidationError if invalid
   */
  validateAndFormatPhone(phone: string): string {
    // Remove all non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // Add +995 if missing
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('995')) {
        cleaned = `+${cleaned}`;
      } else if (cleaned.length === 9) {
        cleaned = `+995${cleaned}`;
      } else {
        throw new ValidationError('Invalid phone number format');
      }
    }

    if (!this.validatePhone(cleaned)) {
      throw new ValidationError('Invalid Georgian phone number format. Expected: +995XXXXXXXXX');
    }

    return cleaned;
  }

  /**
   * Validate coordinates and return formatted object
   * @param lat - Latitude
   * @param lon - Longitude
   * @returns Validated coordinates
   * @throws ValidationError if invalid
   */
  validateAndFormatCoordinates(lat: number, lon: number): { latitude: number; longitude: number } {
    if (!this.validateCoordinates(lat, lon)) {
      throw new ValidationError(
        'Invalid coordinates',
        { latitude: lat, longitude: lon }
      );
    }

    return {
      latitude: parseFloat(lat.toFixed(8)),
      longitude: parseFloat(lon.toFixed(8)),
    };
  }

  /**
   * Validate file size
   * @param sizeInBytes - File size in bytes
   * @param maxSizeInMB - Maximum size in megabytes
   * @returns True if valid
   */
  validateFileSize(sizeInBytes: number, maxSizeInMB: number = 10): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return sizeInBytes <= maxSizeInBytes;
  }

  /**
   * Validate image MIME type
   * @param mimetype - MIME type string
   * @returns True if valid image type
   */
  validateImageType(mimetype: string): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return allowedTypes.includes(mimetype.toLowerCase());
  }

  /**
   * Validate string length
   * @param value - String to validate
   * @param min - Minimum length
   * @param max - Maximum length
   * @returns True if valid
   */
  validateStringLength(value: string, min: number, max: number): boolean {
    const length = value.trim().length;
    return length >= min && length <= max;
  }

  /**
   * Validate enum value
   * @param value - Value to validate
   * @param allowedValues - Array of allowed values
   * @returns True if valid
   */
  validateEnum<T extends string>(value: T, allowedValues: T[]): boolean {
    return allowedValues.includes(value);
  }

  /**
   * Validate order ID format
   * @param orderId - Order ID string
   * @returns True if valid
   */
  validateOrderId(orderId: string): boolean {
    // Format: ORD-{timestamp}-{random}
    const orderIdRegex = /^ORD-\d{13}-[A-Z0-9]{6}$/;
    return orderIdRegex.test(orderId);
  }

  /**
   * Validate RFQ ID format
   * @param rfqId - RFQ ID string
   * @returns True if valid
   */
  validateRFQId(rfqId: string): boolean {
    // Format: RFQ-{timestamp}-{random}
    const rfqIdRegex = /^RFQ-\d{13}-[A-Z0-9]{6}$/;
    return rfqIdRegex.test(rfqId);
  }
}

// Export singleton instance
export default new ValidationService();
