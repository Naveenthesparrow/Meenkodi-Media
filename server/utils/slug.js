/**
 * Readable URL slugs ("new-zealand-pallar-mallar-kumara-maori-people") for
 * content pages, instead of database ids in the address.
 *
 * - Built from the English name/title; Tamil-only names are transliterated
 *   to Latin letters so every page gets a readable slug.
 * - Unique per collection ("-2", "-3" ... on clashes).
 * - Set once and never changed afterwards, so shared links keep working.
 */

const TA_VOWELS = {
  'அ': 'a', 'ஆ': 'aa', 'இ': 'i', 'ஈ': 'ii', 'உ': 'u', 'ஊ': 'uu', 'எ': 'e', 'ஏ': 'ee',
  'ஐ': 'ai', 'ஒ': 'o', 'ஓ': 'oo', 'ஔ': 'au', 'ஃ': 'h',
};
const TA_CONSONANTS = {
  'க': 'k', 'ங': 'ng', 'ச': 's', 'ஞ': 'nj', 'ட': 't', 'ண': 'n', 'த': 'th', 'ந': 'n',
  'ப': 'p', 'ம': 'm', 'ய': 'y', 'ர': 'r', 'ல': 'l', 'வ': 'v', 'ழ': 'zh', 'ள': 'l',
  'ற': 'r', 'ன': 'n', 'ஜ': 'j', 'ஷ': 'sh', 'ஸ': 's', 'ஹ': 'h',
};
const TA_SIGNS = {
  'ா': 'aa', 'ி': 'i', 'ீ': 'ii', 'ு': 'u', 'ூ': 'uu', 'ெ': 'e', 'ே': 'ee', 'ை': 'ai',
  'ொ': 'o', 'ோ': 'oo', 'ௌ': 'au', '்': '',
};

/** Tamil script -> simple Latin letters (other characters are kept) */
export function transliterateTamil(text) {
  const chars = [...String(text || '')];
  let out = '';
  let tamil = ''; // current run of transliterated Tamil
  // Common everyday spelling for Tamil words only: single vowels ("sekaran",
  // not "seekaran"), "ng" for ங்க and "th" for த்த
  const flush = () => {
    out += tamil
      .replace(/aa/g, 'a').replace(/ii/g, 'i').replace(/uu/g, 'u').replace(/ee/g, 'e').replace(/oo/g, 'o')
      .replace(/ngk/g, 'ng').replace(/thth/g, 'th');
    tamil = '';
  };
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (TA_CONSONANTS[ch] !== undefined) {
      const next = chars[i + 1];
      if (next !== undefined && TA_SIGNS[next] !== undefined) {
        tamil += TA_CONSONANTS[ch] + TA_SIGNS[next];
        i++;
      } else {
        tamil += `${TA_CONSONANTS[ch]}a`; // consonant with its inherent "a"
      }
    } else if (TA_VOWELS[ch] !== undefined) {
      tamil += TA_VOWELS[ch];
    } else if (TA_SIGNS[ch] === undefined) {
      flush();
      out += ch;
    }
  }
  flush();
  return out;
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
