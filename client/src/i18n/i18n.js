import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ta from './ta.json';

const saved = typeof window !== 'undefined' ? localStorage.getItem('lang') : 'en';
const fallbackLng = 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ta: { translation: ta },
    },
    lng: saved || 'en',
    fallbackLng,
    interpolation: {
      escapeValue: false,
    },
    returnEmptyString: false,
  });

export default i18n;
