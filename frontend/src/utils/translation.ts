/**
 * Auto-translation utility using MyMemory Translation API
 * Free tier: 1000 words/day, no API key required
 */

interface TranslationCache {
  [key: string]: string;
}

// Simple in-memory cache to avoid repeated API calls
const translationCache: TranslationCache = {};

/**
 * Translate text between Georgian and English
 * @param text - Text to translate
 * @param from - Source language ('ka' or 'en')
 * @param to - Target language ('ka' or 'en')
 * @returns Translated text or original text if translation fails
 */
export async function translateText(
  text: string,
  from: 'ka' | 'en',
  to: 'ka' | 'en'
): Promise<string> {
  // Don't translate if text is empty
  if (!text || text.trim() === '') {
    return '';
  }

  // Don't translate if same language
  if (from === to) {
    return text;
  }

  // Check cache first
  const cacheKey = `${from}-${to}-${text}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    // Using MyMemory Translation API (free, no API key required)
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
    );

    if (!response.ok) {
      console.warn('Translation API request failed:', response.status);
      return text;
    }

    const data = await response.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      // Cache the result
      translationCache[cacheKey] = translated;
      return translated;
    }

    return text;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}

/**
 * Debounce function to avoid too many API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
