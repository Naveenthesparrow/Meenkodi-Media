import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const saved = typeof window !== 'undefined' ? localStorage.getItem('lang') : 'en';
const fallbackLng = 'en';

// Lazy load translations to reduce initial bundle
const loadLanguage = async (lang) => {
  const translation = lang === 'ta' 
    ? await import('./ta.json')
    : await import('./en.json');
  return translation.default;
};

i18n
  .use(initReactI18next)
  .init({
    resources: {},
    lng: saved || 'en',
    fallbackLng,
    interpolation: {
      escapeValue: false,
    },
    returnEmptyString: false,
  });

// Load initial language
loadLanguage(i18n.language).then((translation) => {
  i18n.addResourceBundle(i18n.language, 'translation', translation);
});

// Load on language change
i18n.on('languageChanged', (lng) => {
  if (!i18n.hasResourceBundle(lng, 'translation')) {
    loadLanguage(lng).then((translation) => {
      i18n.addResourceBundle(lng, 'translation', translation);
    });
  }
});

export default i18n;
