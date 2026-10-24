/**
 * Language-aware text for SEO.
 *
 * Admins type names in Tamil or English, and sometimes Tamil into the
 * "English" box. Search engines should match every way people search:
 * Tamil script (தியாகி இமானுவேல் சேகரன்), Tamil in English letters
 * (thiyagi imanuvel sekaran) and English words. So the language is detected
 * from the text itself, and Tamil-only names also get an English-letter form.
 */
import { transliterateTamil } from './slug.js';

const TAMIL_LETTERS = /[஀-௿]/;

export const hasTamil = (text) => TAMIL_LETTERS.test(String(text || ''));

/** Every non-empty string inside a field ({en, ta}, string or array) */
function texts(field) {
  if (!field) return [];
  if (typeof field === 'string') return [field];
  if (Array.isArray(field)) return field.flatMap(texts);
  if (typeof field === 'object') return [field.en, field.ta].filter((v) => typeof v === 'string');
  return [];
}

/** Text of a field sorted by its real language: { en, ta } (either may be '') */
export function byLanguage(field) {
  const out = { en: '', ta: '' };
  for (const raw of texts(field)) {
    const value = raw.trim();
    if (!value) continue;
    const lang = hasTamil(value) ? 'ta' : 'en';
    if (!out[lang]) out[lang] = value;
  }
  return out;
}

const titleCase = (s) => s.replace(/\b([a-z])/g, (c) => c.toUpperCase());

/** Tamil text in English letters, e.g. "Thiyaki Imanuvel Sekaran" */
export function romanize(tamil) {
  return titleCase(transliterateTamil(tamil).replace(/\s+/g, ' ').trim());
}

/**
 * Name parts for titles/alt text: { latin, ta }.
 * latin = the English text, or the Tamil name in English letters.
 */
export function nameParts(field) {
  const { en, ta } = byLanguage(field);
  return { latin: en || (ta ? romanize(ta) : ''), ta };
}

/** "English or romanized | Tamil" (one part if they would be the same) */
export function bilingualName(field, separator = ' | ') {
  const { latin, ta } = nameParts(field);
  return [latin, ta].filter(Boolean).join(separator);
}

/** Language of a piece of text, for lang="" attributes */
export const langOf = (text) => (hasTamil(text) ? 'ta' : 'en');
