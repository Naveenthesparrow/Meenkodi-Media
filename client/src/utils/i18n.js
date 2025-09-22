import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '../i18n/en.json';
import ta from '../i18n/ta.json';

const resources = {
  en: { translation: en },
  ta: { translation: ta },
};

const STORAGE_KEY = 'app_language';

// Read persisted language if any
const persistedLng = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: persistedLng || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      // Order of detection
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: STORAGE_KEY,
    },
  });

// Persist language on change
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
    const html = document.querySelector('html');
    if (html) html.setAttribute('lang', lng);
  } catch (e) {
    // ignore
  }
});

export default i18n;
