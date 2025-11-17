import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import kaTranslations from './locales/ka.json';

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Init i18next
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      ka: {
        translation: kaTranslations,
      },
    },

    // Default language
    fallbackLng: 'ka', // Georgian is default

    // Available languages
    supportedLngs: ['ka', 'en'],

    // Language detection order
    detection: {
      order: ['localStorage', 'querystring', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'buildapp_language',
      lookupQuerystring: 'lang',
    },

    // React options
    react: {
      useSuspense: false, // Disable suspense for simplicity
    },

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // Debug mode (disable in production)
    debug: import.meta.env.DEV,
  });

export default i18n;
