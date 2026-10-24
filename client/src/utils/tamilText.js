// Tamil/English helpers shared by links and SEO titles.
// Keep slugify() identical to server/utils/slug.js so links match on both sides.

// Everyday English spelling of Tamil (Meenkodi, Pandiyan, Kalvettu, Ayyampettai):
// short vowels single, ீ/ூ as "ee"/"oo".
const TA_VOWELS = {
  'அ': 'a', 'ஆ': 'a', 'இ': 'i', 'ஈ': 'ee', 'உ': 'u', 'ஊ': 'oo', 'எ': 'e', 'ஏ': 'e',
  'ஐ': 'ai', 'ஒ': 'o', 'ஓ': 'o', 'ஔ': 'au', 'ஃ': 'h',
};
const TA_CONSONANTS = {
  'க': 'k', 'ங': 'ng', 'ச': 's', 'ஞ': 'nj', 'ட': 't', 'ண': 'n', 'த': 'th', 'ந': 'n',
  'ப': 'p', 'ம': 'm', 'ய': 'y', 'ர': 'r', 'ல': 'l', 'வ': 'v', 'ழ': 'zh', 'ள': 'l',
  'ற': 'r', 'ன': 'n', 'ஜ': 'j', 'ஷ': 'sh', 'ஸ': 's', 'ஹ': 'h',
};
const TA_SIGNS = {
  'ா': 'a', 'ி': 'i', 'ீ': 'ee', 'ு': 'u', 'ூ': 'oo', 'ெ': 'e', 'ே': 'e', 'ை': 'ai',
  'ொ': 'o', 'ோ': 'o', 'ௌ': 'au', '்': '',
};

export const hasTamil = (text) => /[஀-௿]/.test(String(text || ''));

/** Tamil script -> English letters (other characters are kept) */
export function transliterateTamil(text) {
  const chars = [...String(text || '')];
  let out = '';
  let prevConsonant = null; // consonant of the previous Tamil letter
  let prevDead = false;     // previous letter had ் (no vowel)
  let prevVowelSound = false;
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (TA_CONSONANTS[ch] !== undefined) {
      let sound = TA_CONSONANTS[ch];
      if (ch === 'ட') {
        // "d" between vowels and after ண (kodi, Pandiyan); "t" at the start, without a
        // vowel (ட்) and when doubled (Kalvettu, Porattam)
        const dead = chars[i + 1] === '்';
        if (!dead && prevDead && prevConsonant === 'ண') sound = 'd';
        else if (!dead && !(prevDead && prevConsonant === 'ட') && prevVowelSound) sound = 'd';
      }
      const next = chars[i + 1];
      if (next !== undefined && TA_SIGNS[next] !== undefined) {
        out += sound + TA_SIGNS[next];
        prevDead = next === '்';
        i++;
      } else {
        out += `${sound}a`; // consonant with its inherent "a"
        prevDead = false;
      }
      prevConsonant = ch;
      prevVowelSound = !prevDead;
    } else if (TA_VOWELS[ch] !== undefined) {
      out += TA_VOWELS[ch];
      prevConsonant = null;
      prevDead = false;
      prevVowelSound = true;
    } else if (TA_SIGNS[ch] === undefined) {
      out += ch;
      prevConsonant = null;
      prevDead = false;
      prevVowelSound = false;
    }
  }
  return out.replace(/ngk/g, 'ng').replace(/thth/g, 'th');
}

/** Text -> "lowercase-words-with-hyphens" (Tamil written in English letters) */
export function slugify(text, maxLength = 70) {
  const slug = transliterateTamil(text)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug.length <= maxLength) return slug;
  const cut = slug.slice(0, maxLength);
  return cut.slice(0, cut.lastIndexOf('-') > 20 ? cut.lastIndexOf('-') : maxLength).replace(/-+$/, '');
}

/** Tamil text in English letters with capitals, e.g. "Thiyaki Imanuvel Sekaran" */
export function romanize(text) {
  return transliterateTamil(text).replace(/\s+/g, ' ').trim().replace(/\b([a-z])/g, (c) => c.toUpperCase());
}

/**
 * Text that contains Tamil, also in English letters, so searches typed either way
 * match: "Thiyaki Imanuvel Sekaran - Gallery | தியாகி இமானுவேல் சேகரன்"
 */
export function withRomanized(text) {
  if (!hasTamil(text)) return text;
  const tamilPart = (String(text).match(/[஀-௿][஀-௿\s.,()]*/g) || []).join(' ').replace(/\s+/g, ' ').trim();
  return `${romanize(text)} | ${tamilPart}`;
}
