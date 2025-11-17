/**
 * Formatting utilities for buildApp
 * Handles currency, dates, times, and numbers with Georgian/English localization
 */

/**
 * Format currency in Georgian Lari (GEL)
 * @param amount - Amount in GEL
 * @param language - Language code ('ka' or 'en')
 * @returns Formatted currency string
 * @example
 * formatCurrency(3600, 'ka') // "3 600 ₾"
 * formatCurrency(3600, 'en') // "3,600 ₾"
 */
export function formatCurrency(amount: number, language: string = 'ka'): string {
  // Georgian uses space separator, English uses comma
  const separator = language === 'ka' ? ' ' : ',';

  // Format with no decimal places (Georgian Lari typically doesn't use decimals for whole amounts)
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return `${formatted} ₾`;
}

/**
 * Format currency with decimals
 * @param amount - Amount in GEL
 * @param language - Language code ('ka' or 'en')
 * @returns Formatted currency string with 2 decimal places
 * @example
 * formatCurrencyDetailed(3600.50, 'ka') // "3 600.50 ₾"
 */
export function formatCurrencyDetailed(amount: number, language: string = 'ka'): string {
  const separator = language === 'ka' ? ' ' : ',';

  const [whole, decimal] = amount.toFixed(2).split('.');
  const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

  return `${formattedWhole}.${decimal} ₾`;
}

/**
 * Format number with thousand separators
 * @param num - Number to format
 * @param language - Language code ('ka' or 'en')
 * @returns Formatted number string
 * @example
 * formatNumber(12500, 'ka') // "12 500"
 * formatNumber(12500, 'en') // "12,500"
 */
export function formatNumber(num: number, language: string = 'ka'): string {
  const separator = language === 'ka' ? ' ' : ',';
  return Math.round(num)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/**
 * Georgian month names
 */
const GEORGIAN_MONTHS = [
  'იანვარი',
  'თებერვალი',
  'მარტი',
  'აპრილი',
  'მაისი',
  'ივნისი',
  'ივლისი',
  'აგვისტო',
  'სექტემბერი',
  'ოქტომბერი',
  'ნოემბერი',
  'დეკემბერი',
];

/**
 * English month names
 */
const ENGLISH_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Georgian weekday names (short)
 */
const GEORGIAN_WEEKDAYS_SHORT = ['კვი', 'ორშ', 'სამ', 'ოთხ', 'პარ', 'შაბ', 'კვ'];

/**
 * English weekday names (short)
 */
const ENGLISH_WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Format date in Georgian or English
 * @param date - Date to format
 * @param language - Language code ('ka' or 'en')
 * @param includeYear - Whether to include year
 * @returns Formatted date string
 * @example
 * formatDate(new Date(2024, 9, 30), 'ka') // "30 ოქტომბერი"
 * formatDate(new Date(2024, 9, 30), 'en') // "October 30"
 * formatDate(new Date(2024, 9, 30), 'ka', true) // "30 ოქტომბერი 2024"
 */
export function formatDate(date: Date | string, language: string = 'ka', includeYear: boolean = false): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const day = d.getDate();
  const month = language === 'ka' ? GEORGIAN_MONTHS[d.getMonth()] : ENGLISH_MONTHS[d.getMonth()];
  const year = d.getFullYear();

  if (language === 'ka') {
    return includeYear ? `${day} ${month} ${year}` : `${day} ${month}`;
  } else {
    return includeYear ? `${month} ${day}, ${year}` : `${month} ${day}`;
  }
}

/**
 * Format date with weekday
 * @param date - Date to format
 * @param language - Language code ('ka' or 'en')
 * @returns Formatted date string with weekday
 * @example
 * formatDateWithWeekday(new Date(2024, 9, 30), 'ka') // "კვი, 30 ოქტომბერი"
 */
export function formatDateWithWeekday(date: Date | string, language: string = 'ka'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const weekday = language === 'ka'
    ? GEORGIAN_WEEKDAYS_SHORT[d.getDay()]
    : ENGLISH_WEEKDAYS_SHORT[d.getDay()];

  return `${weekday}, ${formatDate(d, language)}`;
}

/**
 * Format date in short format (DD.MM.YYYY)
 * @param date - Date to format
 * @returns Formatted date string
 * @example
 * formatDateShort(new Date(2024, 9, 30)) // "30.10.2024"
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();

  return `${day}.${month}.${year}`;
}

/**
 * Format time in 24-hour format
 * @param date - Date or time string to format
 * @returns Formatted time string
 * @example
 * formatTime(new Date(2024, 9, 30, 9, 0)) // "09:00"
 * formatTime('09:00') // "09:00"
 */
export function formatTime(date: Date | string): string {
  if (typeof date === 'string') {
    // Already formatted time string
    return date;
  }

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

/**
 * Format time range
 * @param startTime - Start time
 * @param endTime - End time
 * @returns Formatted time range
 * @example
 * formatTimeRange('09:00', '11:00') // "09:00–11:00"
 * formatTimeRange(new Date(2024, 9, 30, 9, 0), new Date(2024, 9, 30, 11, 0)) // "09:00–11:00"
 */
export function formatTimeRange(startTime: Date | string, endTime: Date | string): string {
  const start = formatTime(startTime);
  const end = formatTime(endTime);

  return `${start}–${end}`;
}

/**
 * Format date and time
 * @param date - Date to format
 * @param language - Language code ('ka' or 'en')
 * @returns Formatted date and time string
 * @example
 * formatDateTime(new Date(2024, 9, 30, 9, 0), 'ka') // "30 ოქტომბერი, 09:00"
 */
export function formatDateTime(date: Date | string, language: string = 'ka'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return `${formatDate(d, language)}, ${formatTime(d)}`;
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param date - Date to format
 * @param language - Language code ('ka' or 'en')
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: Date | string, language: string = 'ka'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (language === 'ka') {
    if (diffMinutes < 1) return 'ახლახან';
    if (diffMinutes < 60) return `${diffMinutes} წუთის წინ`;
    if (diffHours < 24) return `${diffHours} საათის წინ`;
    if (diffDays === 1) return 'გუშინ';
    if (diffDays < 7) return `${diffDays} დღის წინ`;
    return formatDate(d, language);
  } else {
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(d, language);
  }
}

/**
 * Format distance in kilometers or meters
 * @param distanceInKm - Distance in kilometers
 * @param language - Language code ('ka' or 'en')
 * @returns Formatted distance string
 * @example
 * formatDistance(0.5, 'ka') // "500 მ"
 * formatDistance(2.3, 'ka') // "2.3 კმ"
 */
export function formatDistance(distanceInKm: number, language: string = 'ka'): string {
  if (distanceInKm < 1) {
    const meters = Math.round(distanceInKm * 1000);
    return language === 'ka' ? `${meters} მ` : `${meters} m`;
  }

  const km = distanceInKm.toFixed(1);
  return language === 'ka' ? `${km} კმ` : `${km} km`;
}

/**
 * Format phone number for display
 * @param phone - Phone number (assumed to be +995XXXXXXXXX)
 * @returns Formatted phone number
 * @example
 * formatPhone('+995555123456') // "+995 555 12 34 56"
 */
export function formatPhone(phone: string): string {
  // Remove all non-digit characters except leading +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Georgian phone format: +995 XXX XX XX XX
  if (cleaned.startsWith('+995') && cleaned.length === 13) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9, 11)} ${cleaned.slice(11)}`;
  }

  return phone;
}

/**
 * Format percentage
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 * @example
 * formatPercentage(95.5) // "95.5%"
 * formatPercentage(95.567, 1) // "95.6%"
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Distance in kilometers
 * @example
 * calculateDistance(41.7151, 44.8271, 41.7, 44.8) // Returns distance in km
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Check if a project location is within a supplier's delivery zone
 * @param projectLat - Project latitude
 * @param projectLng - Project longitude
 * @param depotLat - Supplier depot latitude
 * @param depotLng - Supplier depot longitude
 * @param radiusKm - Delivery radius in kilometers
 * @returns True if project is within delivery zone
 * @example
 * isWithinDeliveryZone(41.7151, 44.8271, 41.7, 44.8, 15) // true or false
 */
export function isWithinDeliveryZone(
  projectLat: number,
  projectLng: number,
  depotLat: number,
  depotLng: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(projectLat, projectLng, depotLat, depotLng);
  return distance <= radiusKm;
}
