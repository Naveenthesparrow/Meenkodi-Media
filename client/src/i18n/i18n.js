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
    react: {
      useSuspense: false,
    },
  });

// Load initial language immediately
const initialLang = saved || 'en';
loadLanguage(initialLang).then((translation) => {
  i18n.addResourceBundle(initialLang, 'translation', translation, true, true);
  // Force re-render after loading
  i18n.changeLanguage(initialLang);
});

// Load on language change
i18n.on('languageChanged', (lng) => {
  loadLanguage(lng).then((translation) => {
    i18n.addResourceBundle(lng, 'translation', translation, true, true);
  });
});

export default i18n;
