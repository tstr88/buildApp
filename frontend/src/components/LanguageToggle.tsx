import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

/**
 * Language toggle component with KA/EN pills
 * Allows users to switch between Georgian and English languages
 * Syncs with user preferences if authenticated
 */
export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const { isAuthenticated, updateLanguage } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const currentLanguage = i18n.language;

  const changeLanguage = async (lng: 'ka' | 'en') => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);

      if (isAuthenticated) {
        // Update language preference on server
        await updateLanguage(lng);
      } else {
        // Just update i18next locally
        i18n.changeLanguage(lng);
      }
    } catch (error) {
      console.error('Failed to change language:', error);
      // i18next already updated locally even if server update failed
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <button
        onClick={() => changeLanguage('ka')}
        className={`
          px-3 py-1.5 rounded-md text-sm font-medium transition-all
          ${
            currentLanguage === 'ka'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }
        `}
        aria-label="Switch to Georgian"
        aria-pressed={currentLanguage === 'ka'}
      >
        KA
      </button>
      <button
        onClick={() => changeLanguage('en')}
        className={`
          px-3 py-1.5 rounded-md text-sm font-medium transition-all
          ${
            currentLanguage === 'en'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }
        `}
        aria-label="Switch to English"
        aria-pressed={currentLanguage === 'en'}
      >
        EN
      </button>
    </div>
  );
}

/**
 * Compact language toggle (for mobile/small spaces)
 */
export function LanguageToggleCompact() {
  const { i18n } = useTranslation();
  const { isAuthenticated, updateLanguage } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleLanguage = async () => {
    if (isUpdating) return;

    const newLang = i18n.language === 'ka' ? 'en' : 'ka';

    try {
      setIsUpdating(true);

      if (isAuthenticated) {
        await updateLanguage(newLang);
      } else {
        i18n.changeLanguage(newLang);
      }
    } catch (error) {
      console.error('Failed to toggle language:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-2 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      aria-label="Toggle language"
    >
      {i18n.language === 'ka' ? 'EN' : 'KA'}
    </button>
  );
}
