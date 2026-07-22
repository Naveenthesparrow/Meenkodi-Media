import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

/**
 * Hook to get bilingual content based on current language
 * @returns {Function} Function that takes a bilingual object and returns the appropriate language string
 */
export const useBilingualContent = () => {
  const { i18n } = useTranslation();

  /**
   * Get content in the current language
   * Wrapped in `useCallback` so the returned function is stable
   * and can safely be used in dependency arrays.
   */
  const getContent = useCallback((content, fallback = '') => {
    if (!content) return fallback;

    if (typeof content === 'string') return content;

    const currentLang = i18n.language || 'en';
    return content[currentLang] || content.en || content.ta || fallback;
  }, [i18n.language]);

  return getContent;
};

/**
 * Standalone function to get bilingual content (for use outside components)
 * @param {Object|String} content - Either a bilingual object {en: "...", ta: "..."} or a plain string
 * @param {String} language - Language code ('en' or 'ta')
 * @param {String} fallback - Fallback text if no content available
 * @returns {String} Content in specified language
 */
export const getBilingualContent = (content, language = 'en', fallback = '') => {
  if (!content) return fallback;
  
  // If it's already a string (legacy data), return it
  if (typeof content === 'string') return content;
  
  // If it's a bilingual object, return the appropriate language
  return content[language] || content.en || content.ta || fallback;
};

/**
 * Helper to create a bilingual object from separate values
 * @param {String} en - English text
 * @param {String} ta - Tamil text
 * @returns {Object} Bilingual object
 */
export const createBilingualContent = (en = '', ta = '') => ({
  en,
  ta
});
