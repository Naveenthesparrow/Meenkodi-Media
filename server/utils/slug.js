/**
 * Readable URL slugs ("new-zealand-pallar-mallar-kumara-maori-people") for
 * content pages, instead of database ids in the address.
 *
 * - Built from the English name/title; Tamil-only names are transliterated
 *   to Latin letters so every page gets a readable slug.
 * - Unique per collection ("-2", "-3" ... on clashes).
 * - Set once and never changed afterwards, so shared links keep working.
 */

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

/** Text -> "lowercase-words-with-hyphens", at most ~70 characters */
export function slugify(text, maxLength = 70) {
  const slug = transliterateTamil(text)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // accents
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (slug.length <= maxLength) return slug;
  const cut = slug.slice(0, maxLength);
  return cut.slice(0, cut.lastIndexOf('-') > 20 ? cut.lastIndexOf('-') : maxLength).replace(/-+$/, '');
}

const pickText = (field) => (!field ? '' : typeof field === 'string' ? field : (field.en || field.ta || ''));

/** The text a document's slug is built from: English name/title first, then Tamil */
export function slugSource(doc) {
  const name = doc.name || doc.title;
  if (name && typeof name === 'object') return name.en || name.ta || '';
  return pickText(name);
}

/** A slug for `doc` that no other document of `Model` uses (null if the name is empty) */
export async function uniqueSlug(Model, doc) {
  const base = slugify(slugSource(doc));
  if (!base) return null;
  for (let n = 1; n < 1000; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const taken = await Model.exists({ slug: candidate, _id: { $ne: doc._id } });
    if (!taken) return candidate;
  }
  return null;
}

/**
 * Add a `slug` field to a schema; new documents get one automatically on save.
 * Existing slugs are never changed (links stay stable when a title is edited).
 */
export function addSlug(schema) {
  schema.add({ slug: { type: String, trim: true, index: { unique: true, sparse: true } } });
  schema.pre('save', async function setSlug() {
    if (!this.slug) {
      const slug = await uniqueSlug(this.constructor, this);
      if (slug) this.slug = slug;
    }
  });
}
