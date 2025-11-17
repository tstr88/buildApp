/**
 * Utility helper functions for buildApp
 */

import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

/**
 * Generate unique order ID
 * Format: ORD-{timestamp}-{random}
 * @returns Order ID string
 * @example "ORD-1698765432000-A3X9K2"
 */
export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = generateRandomString(6);
  return `ORD-${timestamp}-${random}`;
}

/**
 * Generate unique RFQ ID
 * Format: RFQ-{timestamp}-{random}
 * @returns RFQ ID string
 * @example "RFQ-1698765432000-B7Y4M1"
 */
export function generateRFQId(): string {
  const timestamp = Date.now();
  const random = generateRandomString(6);
  return `RFQ-${timestamp}-${random}`;
}

/**
 * Generate unique invoice ID
 * Format: INV-{timestamp}-{random}
 * @returns Invoice ID string
 */
export function generateInvoiceId(): string {
  const timestamp = Date.now();
  const random = generateRandomString(6);
  return `INV-${timestamp}-${random}`;
}

/**
 * Generate random alphanumeric string
 * @param length - Length of the string
 * @returns Random string
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 - Latitude of point 1
 * @param lon1 - Longitude of point 1
 * @param lat2 - Latitude of point 2
 * @param lon2 - Longitude of point 2
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 * @param degrees - Degrees value
 * @returns Radians value
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Check if a point is within a delivery zone (simplified circle check)
 * @param pointLat - Point latitude
 * @param pointLon - Point longitude
 * @param centerLat - Zone center latitude
 * @param centerLon - Zone center longitude
 * @param radiusKm - Zone radius in kilometers
 * @returns True if point is within zone
 */
export function isWithinDeliveryZone(
  pointLat: number,
  pointLon: number,
  centerLat: number,
  centerLon: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(pointLat, pointLon, centerLat, centerLon);
  return distance <= radiusKm;
}

/**
 * Check if a point is within a polygon (ray casting algorithm)
 * @param point - Point to check [lat, lon]
 * @param polygon - Array of polygon vertices [[lat, lon], ...]
 * @returns True if point is within polygon
 */
export function isPointInPolygon(
  point: [number, number],
  polygon: Array<[number, number]>
): boolean {
  const [lat, lon] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [lat1, lon1] = polygon[i];
    const [lat2, lon2] = polygon[j];

    const intersect =
      lon1 > lon !== lon2 > lon &&
      lat < ((lat2 - lat1) * (lon - lon1)) / (lon2 - lon1) + lat1;

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Scrub EXIF data from image buffer
 * @param imageBuffer - Image buffer
 * @returns Cleaned image buffer
 */
export async function scrubExif(imageBuffer: Buffer): Promise<Buffer> {
  try {
    return await sharp(imageBuffer)
      .withMetadata({}) // Remove all metadata including EXIF
      .toBuffer();
  } catch (error) {
    console.error('Error scrubbing EXIF data:', error);
    throw error;
  }
}

/**
 * Format price in Georgian Lari
 * @param amount - Amount in GEL
 * @returns Formatted price string
 */
export function formatPrice(amount: number): string {
  return `${amount.toFixed(2)} �`;
}

/**
 * Calculate delivery window end time
 * @param startTime - Start time
 * @param windowHours - Window duration in hours
 * @returns End time
 */
export function calculateDeliveryWindowEnd(
  startTime: Date,
  windowHours: number
): Date {
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + windowHours);
  return endTime;
}

/**
 * Generate unique confirmation code
 * @param length - Length of code (default: 6)
 * @returns Confirmation code
 */
export function generateConfirmationCode(length: number = 6): string {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return code;
}

/**
 * Check if delivery date is valid (not in the past, not too far in the future)
 * @param deliveryDate - Delivery date
 * @param maxDaysInFuture - Maximum days in the future (default: 30)
 * @returns True if valid
 */
export function isValidDeliveryDate(
  deliveryDate: Date,
  maxDaysInFuture: number = 30
): boolean {
  const now = new Date();
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxDaysInFuture);

  return deliveryDate > now && deliveryDate <= maxDate;
}

/**
 * Calculate rental days between two dates
 * @param startDate - Rental start date
 * @param endDate - Rental end date
 * @returns Number of days
 */
export function calculateRentalDays(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculate rental total cost
 * @param dailyRate - Daily rental rate
 * @param days - Number of days
 * @param deposit - Deposit amount
 * @returns Total cost
 */
export function calculateRentalCost(
  dailyRate: number,
  days: number,
  deposit: number = 0
): { rentalCost: number; deposit: number; total: number } {
  const rentalCost = dailyRate * days;
  const total = rentalCost + deposit;

  return {
    rentalCost,
    deposit,
    total,
  };
}

/**
 * Sleep/delay function
 * @param ms - Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retries
 * @param delayMs - Initial delay in milliseconds
 * @returns Result of the function
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        const backoffDelay = delayMs * Math.pow(2, attempt);
        await sleep(backoffDelay);
      }
    }
  }

  throw lastError;
}

/**
 * Chunk array into smaller arrays
 * @param array - Array to chunk
 * @param size - Chunk size
 * @returns Array of chunks
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Remove duplicate items from array
 * @param array - Array with potential duplicates
 * @param key - Optional key to check for uniqueness (for objects)
 * @returns Array without duplicates
 */
export function removeDuplicates<T>(array: T[], key?: keyof T): T[] {
  if (!key) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Generate UUID v4
 * @returns UUID string
 */
export function generateUUID(): string {
  return uuidv4();
}
