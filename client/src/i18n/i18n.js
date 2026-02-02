import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './en.json';
import taTranslations from './ta.json';

const saved = typeof window !== 'undefined' ? localStorage.getItem('lang') : 'en';
const fallbackLng = 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      ta: {
        translation: taTranslations
      }
    },
    lng: saved || 'en',
    fallbackLng,
    interpolation: {
      escapeValue: false,
    },
    returnEmptyString: false,
    react: {
      useSuspense: false,
    },
  });

export default i18n;
