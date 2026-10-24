/**
 * prerender.js — Server-side HTML shell injection for SEO
 *
 * This module takes the built index.html and injects real, crawlable content
 * so Googlebot can index page content without executing JavaScript.
 *
 * Strategy:
 *  - A hidden <div id="ssr-content"> is injected before </body>.
 *  - It contains real <h1>, <p>, <ul>, <img alt=""> HTML built from DB data.
 *  - React mounts in <div id="root"> as usual — unaffected.
 *  - Search crawlers parse the injected markup; users only see the React UI.
 *
 * Usage:
 *   import { buildPageHtml } from './prerender.js';
 *   const html = buildPageHtml(baseHtml, { title, description, bodyHtml, canonicalUrl });
 */

/** Escape special HTML characters to prevent XSS in injected content */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const SITE_URL = 'https://www.meenkodi.com';

/**
 * Turn an image URL into one that link previews (WhatsApp, Facebook, X) show
 * as a large card: absolute URL, and for Cloudinary a 1200x630 JPEG.
 */
export function shareImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  let u = url.trim();
  if (u.startsWith('/')) u = `${SITE_URL}${u}`;
  if (!/^https?:\/\//i.test(u)) return '';
  // WhatsApp and Facebook can't show AVIF/SVG previews; let the logo be used instead
  if (/\.(avif|svg)(\?|$)/i.test(u) && !u.includes('res.cloudinary.com')) return '';
  const marker = '/image/upload/';
  if (u.includes('res.cloudinary.com') && u.includes(marker) && !/\.(pdf|svg)(\?|$)/i.test(u)) {
    const i = u.indexOf(marker) + marker.length;
    u = `${u.slice(0, i)}c_fill,g_auto,w_1200,h_630,f_jpg,q_auto/${u.slice(i)}`;
  }
  return u;
}

// JSON-LD types in index.html that describe the homepage only (site-wide ones
// such as Organization and WebSite stay on every page)
const PAGE_SPECIFIC_LD_TYPES = new Set(['BreadcrumbList', 'ItemList', 'Article', 'FAQPage', 'CollectionPage']);

function stripPageSpecificJsonLd(html) {
  return html.replace(/\s*<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (block, json) => {
    try {
      const data = JSON.parse(json);
      const types = (data['@graph'] || [data]).map((d) => d['@type']).flat();
      return types.some((t) => PAGE_SPECIFIC_LD_TYPES.has(t)) ? '' : block;
    } catch {
      return block;
    }
  });
}

/** <script> tag for a JSON-LD object ("<" escaped so text can't close the tag) */
function jsonLdScript(data) {
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

const PUBLISHER = {
  '@type': 'Organization',
  name: 'Meenkodi Tamil Heritage Foundation',
  url: SITE_URL,
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
};

/** BreadcrumbList: [{ name, url }] from Home to the current page */
export function breadcrumbLd(trail) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', url: `${SITE_URL}/` }, ...trail].map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/** Article-type structured data for content pages (articles, temples, poets...) */
export function articleLd({ url, headline, description, image, datePublished, dateModified, authorName }) {
  const img = shareImageUrl(image);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: url,
    url,
    headline: String(headline || '').slice(0, 110),
    ...(description ? { description } : {}),
    ...(img ? { image: [img] } : {}),
    ...(datePublished ? { datePublished: new Date(datePublished).toISOString() } : {}),
    ...(dateModified || datePublished ? { dateModified: new Date(dateModified || datePublished).toISOString() } : {}),
    author: authorName ? { '@type': 'Person', name: authorName } : PUBLISHER,
    publisher: PUBLISHER,
    inLanguage: ['en', 'ta'],
  };
}

/** ImageGallery for Seeds folders and gallery listings */
export function imageGalleryLd({ url, name, description, photos = [] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    url,
    name,
    ...(description ? { description } : {}),
    image: photos.filter((p) => p && /^https?:\/\//i.test(p.url || '')).slice(0, 100).map((p) => ({
      '@type': 'ImageObject',
      contentUrl: p.url,
      name: p.caption || name,
    })),
  };
}

/** CollectionPage + ItemList for section list pages */
export function collectionLd({ url, name, description, items = [] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    url,
    name,
    ...(description ? { description } : {}),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.slice(0, 200).map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}${item.href}`,
        name: item.title,
      })),
    },
  };
}

/** Replace the content of an existing <meta property|name="key"> tag, or add it before </head> */
function setMeta(html, key, value) {
  const safe = escapeHtml(value);
  const re = new RegExp(`(<meta\\s+(?:property|name)="${key.replace(/[.:]/g, '\\$&')}"\\s+content=")[^"]*(")`);
  if (re.test(html)) return html.replace(re, `$1${safe}$2`);
  return html.replace('</head>', `  <meta property="${key}" content="${safe}" />\n</head>`);
}

/**
 * Build a full HTML page with injected SSR content.
 *
 * @param {string} baseHtml  - The raw index.html file content
 * @param {object} opts
 * @param {string}  opts.title        - <title> to inject (overrides the base)
 * @param {string}  opts.description  - <meta description> to inject
 * @param {string}  opts.bodyHtml     - Raw HTML for the hidden #ssr-content div
 * @param {string}  opts.canonicalUrl - Canonical URL for this page
 * @param {string}  [opts.image]      - Page image used for link previews (og:image)
 * @param {string}  [opts.type]       - og:type, e.g. "article" for detail pages
 * @returns {string} Modified HTML string
 */
export function buildPageHtml(baseHtml, { title, description, bodyHtml, canonicalUrl, image, type, jsonLd }) {
  let html = baseHtml;

  // Structured data: the base index.html carries homepage-only JSON-LD (an
  // Article about the Pandiya dynasty, an FAQ, breadcrumbs...). On other pages
  // replace those with this page's own data.
  if (Array.isArray(jsonLd)) {
    html = stripPageSpecificJsonLd(html);
    const scripts = jsonLd.filter(Boolean).map(jsonLdScript).join('\n  ');
    if (scripts) html = html.replace('</head>', `  ${scripts}\n</head>`);
  }

  // Link preview tags (WhatsApp/Facebook/X don't run JavaScript, so these must
  // be in the HTML itself). The base index.html carries the homepage values.
  if (canonicalUrl) {
    html = setMeta(html, 'og:url', canonicalUrl);
    html = setMeta(html, 'twitter:url', canonicalUrl);
  }
  if (title) {
    html = setMeta(html, 'twitter:title', title);
    html = setMeta(html, 'og:image:alt', title);
    html = setMeta(html, 'twitter:image:alt', title);
  }
  if (description) html = setMeta(html, 'twitter:description', description);
  const previewImage = shareImageUrl(image);
  if (previewImage) {
    html = setMeta(html, 'og:image', previewImage);
    html = setMeta(html, 'twitter:image', previewImage);
    if (previewImage.includes('w_1200,h_630')) {
      html = setMeta(html, 'og:image:width', '1200');
      html = setMeta(html, 'og:image:height', '630');
    }
  }
  if (type) html = setMeta(html, 'og:type', type);

  // 1. Inject canonical URL
  const canonicalTag = `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`;
  if (html.includes('<!-- CANONICAL_TAG -->')) {
    html = html.replace('<!-- CANONICAL_TAG -->', canonicalTag);
  } else if (html.includes('<link rel="canonical"')) {
    html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, canonicalTag);
  } else {
    html = html.replace('</head>', `  ${canonicalTag}\n</head>`);
  }

  // 2. Inject page-specific <title> (override the static one in index.html)
  if (title) {
    const safeTitle = escapeHtml(title);
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`);
    // Also update og:title
    html = html.replace(
      /<meta property="og:title" content="[^"]*"/,
      `<meta property="og:title" content="${safeTitle}"`
    );
  }

  // 3. Inject page-specific <meta description>
  if (description) {
    const safeDesc = escapeHtml(description);
    html = html.replace(
      /<meta name="description"\s+content="[^"]*"/,
      `<meta name="description" content="${safeDesc}"`
    );
    html = html.replace(
      /<meta property="og:description"\s+content="[^"]*"/,
      `<meta property="og:description" content="${safeDesc}"`
    );
  }

  // 4. Inject crawlable body content right before </body>
  //    Hidden from the visual UI (display:none) but fully readable by crawlers.
  if (bodyHtml) {
    const ssrBlock = `
<div id="ssr-content" aria-hidden="true" style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;">
${bodyHtml}
</div>
`;
    html = html.replace('</body>', `${ssrBlock}\n</body>`);
  }

  return html;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page-specific HTML builder helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Pick the English or Tamil value from a bilingual {en, ta} field */
function pick(field) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field.en || field.ta || '';
}

/** Strip HTML tags and markdown syntax from a string (for content previews) */
function stripTags(str) {
  return str
    ? String(str)
      .replace(/<[^>]+>/g, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')        // markdown images
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')       // markdown links -> their text
      .replace(/^\s*#{1,6}\s+/gm, '')                // headings
      .replace(/(\*\*|__|\*|`)/g, '')                // bold / italic / code marks
      .replace(/\s+/g, ' ')
      .trim()
    : '';
}

/** Truncate text to maxLen characters */
function truncate(str, maxLen = 200) {
  const s = str || '';
  return s.length > maxLen ? s.slice(0, maxLen) + '…' : s;
}

/**
 * Build the hidden SSR body HTML for the homepage.
 * Includes site intro, featured articles, and navigation links.
 */
export function buildHomeBodyHtml({ recentArticles = [], recentEvents = [] } = {}) {
  const articleLinks = recentArticles.slice(0, 8).map(a => {
    const t = pick(a.title);
    const desc = truncate(stripTags(pick(a.content)), 150);
    const img = a.image ? `<img src="${escapeHtml(a.image)}" alt="${escapeHtml(t)} - Meenkodi Tamil Heritage article" loading="lazy" />` : '';
    return `
  <article>
    <h2><a href="/articles/${a.slug || a._id}">${escapeHtml(t)}</a></h2>
    ${img}
    <p>${escapeHtml(desc)}</p>
  </article>`;
  }).join('\n');

  const eventLinks = recentEvents.slice(0, 5).map(e => {
    const t = pick(e.title);
    const loc = pick(e.location);
    const date = e.date ? new Date(e.date).toDateString() : '';
    return `<li><a href="/events/${e.slug || e._id}">${escapeHtml(t)}</a>${date ? ` — ${escapeHtml(date)}` : ''}${loc ? ` @ ${escapeHtml(loc)}` : ''}</li>`;
  }).join('\n');

  return `
<main>
  <h1>Meenkodi — Tamil Heritage: 5000+ Years of Tamil Civilization</h1>
  <p>
    Meenkodi preserves and shares 5000+ years of Tamil civilization — history, temples, dynasties
    (Pandiya, Chola, Chera), cultural traditions, and archaeological discoveries.
    Explore the stories of the Southerns (தென்புலத்தார் / தென்னவர்), Pandiyargal,
    temple architecture, Sangam literature, festivals, and living heritage across India and the Tamil diaspora.
  </p>
  <p>
    Discover the Pandyas — the earliest kingdom of the southern land and the roots of one of the world's
    earliest civilizations. Learn about Pandiya kings, their capital Madurai, Malla rulers, and the legends
    of Kumari Kandam.
  </p>

  <nav aria-label="Site sections">
    <ul>
      <li><a href="/explore">Explore Tamil Heritage</a></li>
      <li><a href="/explore/temples">Tamil Temples &amp; Architecture</a></li>
      <li><a href="/explore/literature">Sangam Literature</a></li>
      <li><a href="/explore/dance">Tamil Dance &amp; Performing Arts</a></li>
      <li><a href="/explore/foods">Tamil Foods &amp; Cuisine</a></li>
      <li><a href="/explore/festivals">Tamil Festivals</a></li>
      <li><a href="/explore/clothing">Traditional Tamil Clothing</a></li>
      <li><a href="/explore/ancientscience">Ancient Tamil Science</a></li>
      <li><a href="/articles">Articles on Tamil History &amp; Culture</a></li>
      <li><a href="/gallery">Photo Gallery — Temples, Kings, Heritage</a></li>
      <li><a href="/events">Upcoming Tamil Heritage Events</a></li>
      <li><a href="/resources">Educational Resources &amp; Books</a></li>
    </ul>
  </nav>

  ${articleLinks ? `<section>\n<h2>Latest Articles on Tamil Heritage</h2>\n${articleLinks}\n</section>` : ''}
  ${eventLinks ? `<section>\n<h2>Upcoming Events</h2>\n<ul>${eventLinks}</ul>\n</section>` : ''}
</main>
`;
}

/**
 * Build hidden SSR body HTML for the /articles listing page.
 */
export function buildArticlesBodyHtml({ articles = [] } = {}) {
  const items = articles.slice(0, 20).map(a => {
    const t = pick(a.title);
    const desc = truncate(stripTags(pick(a.content)), 160);
    const img = a.image ? `<img src="${escapeHtml(a.image)}" alt="${escapeHtml(t)} — Tamil heritage article image" loading="lazy" />` : '';
    return `
  <article>
    <h2><a href="/articles/${a.slug || a._id}">${escapeHtml(t)}</a></h2>
    ${img}
    <p>${escapeHtml(desc)}</p>
  </article>`;
  }).join('\n');

  return `
<main>
  <h1>Articles on Tamil History, Culture and Heritage — Meenkodi</h1>
  <p>
    Read in-depth articles about Tamil civilization, Pandiya dynasty, Chola empire, Sangam literature,
    temple architecture, cultural traditions, and the stories of the Southerns (தென்புலத்தார்).
  </p>
  ${items}
</main>
`;
}

/**
 * Build hidden SSR body HTML for a single article detail page.
 */
export function buildArticleDetailBodyHtml({ article }) {
  if (!article) return '<main><h1>Article — Meenkodi Tamil Heritage</h1></main>';
  const t = pick(article.title);
  const author = article.authorName || '';
  const cover = article.image || article.imageLink;
  const img = cover
    ? `<img src="${escapeHtml(cover)}" alt="${escapeHtml(t)} — Tamil heritage article cover image" loading="lazy" />`
    : '';
  const content = article.content || {};
  const en = typeof content === 'string' ? content : content.en;
  const ta = typeof content === 'string' ? '' : content.ta;
  // Images written inside the article as markdown ![caption](url)
  const inlineImages = [...`${en || ''}\n${ta || ''}`.matchAll(/!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g)]
    .slice(0, 40)
    .map(([, alt, url]) => `  <figure><img src="${escapeHtml(url)}" alt="${escapeHtml(alt || t)}" loading="lazy" />${alt ? `<figcaption>${escapeHtml(alt)}</figcaption>` : ''}</figure>`)
    .join('\n');

  return `
<main>
  <article>
    <h1>${escapeHtml(t)}</h1>
    ${img}
    ${author ? `<p>By ${escapeHtml(author)}</p>` : ''}
    ${paragraphs(en, 'en')}
    ${paragraphs(ta, 'ta')}
    ${inlineImages}
  </article>
  <p><a href="/articles">← Back to all articles</a></p>
</main>
`;
}

/**
 * Build hidden SSR body HTML for the /gallery listing page.
 * Every gallery item gets:
 *   - Its actual name as an <h2> heading
 *   - The image with alt = actual name
 *   - 1-2 sentence description (from DB or auto-generated from name + category)
 */
export function buildGalleryBodyHtml({ items = [] } = {}) {
  const nonFolders = items.filter(i => !i.isFolder).slice(0, 40);
  const itemHtml = nonFolders.map(item => {
    const name    = pick(item.name);
    const rawDesc = pick(item.description);
    const cat     = item.category || 'Tamil heritage';
    const era     = item.era ? ` from the ${item.era} period` : '';
    // Use DB description if present; otherwise auto-generate a meaningful sentence
    const desc    = rawDesc
      ? truncate(rawDesc, 200)
      : `${name}${era} — part of the ${cat} collection on Meenkodi, preserving the visual heritage of Tamil civilization.`;
    const alt     = pick(item.imageAlt) || name;
    const img     = item.imageUrl
      ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(alt)}" loading="lazy" />`
      : '';
    return `
  <figure>
    <h2><a href="/gallery/${item.slug || item._id}">${escapeHtml(name)}</a></h2>
    <a href="/gallery/${item.slug || item._id}">${img}</a>
    <figcaption>
      <strong>${escapeHtml(name)}</strong>
      <p>${escapeHtml(desc)}</p>
      ${item.category ? `<p><small>Category: ${escapeHtml(item.category)}${era ? ` · ${escapeHtml(item.era)}` : ''}</small></p>` : ''}
    </figcaption>
  </figure>`;
  }).join('\n');

  return `
<main>
  <h1>Gallery — Tamil Heritage Photos, Kings, Temples &amp; Culture | Meenkodi</h1>
  <p>
    Browse our Tamil heritage gallery: photos of ancient Pandiya and Chola kings, Dravidian temples,
    traditional festivals, cultural events, and heritage sites across Tamil Nadu and the Tamil diaspora.
    Every image is named and described to preserve its historical context.
  </p>
  ${itemHtml}
</main>
`;
}


/**
 * Build hidden SSR body HTML for a single gallery item detail page.
 */
export function buildGalleryDetailBodyHtml({ item }) {
  if (!item) return '<main><h1>Gallery — Meenkodi Tamil Heritage</h1></main>';
  const name = pick(item.name);
  const desc = pick(item.description);
  const seoTitle = pick(item.seoTitle) || name;
  const seoDesc = pick(item.seoDescription) || desc;
  const alt = pick(item.imageAlt) || `${name} — Tamil heritage`;
  const img = item.imageUrl
    ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(alt)}" loading="lazy" />`
    : '';

  return `
<main>
  <h1>${escapeHtml(seoTitle)}</h1>
  ${img}
  <p>${escapeHtml(seoDesc || desc)}</p>
  ${item.category ? `<p>Category: ${escapeHtml(item.category)}</p>` : ''}
  ${item.era ? `<p>Era / Period: ${escapeHtml(item.era)}</p>` : ''}
  ${item.location ? `<p>Location: ${escapeHtml(item.location)}</p>` : ''}
  ${item.keywords && item.keywords.length ? `<p>Keywords: ${item.keywords.map(escapeHtml).join(', ')}</p>` : ''}
  <p><a href="/gallery">← Back to Gallery</a></p>
</main>
`;
}

/**
 * Build hidden SSR body HTML for the /events listing page.
 */
export function buildEventsBodyHtml({ events = [] } = {}) {
  const items = events.slice(0, 20).map(e => {
    const t = pick(e.title);
    const desc = truncate(pick(e.description), 160);
    const loc = pick(e.location);
    const date = e.date ? new Date(e.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
    const img = e.imageUrl ? `<img src="${escapeHtml(e.imageUrl)}" alt="${escapeHtml(t)} — Tamil heritage event" loading="lazy" />` : '';
    return `
  <article>
    <h2><a href="/events/${e.slug || e._id}">${escapeHtml(t)}</a></h2>
    ${img}
    ${date ? `<time datetime="${e.date ? new Date(e.date).toISOString() : ''}">${escapeHtml(date)}</time>` : ''}
    ${loc ? `<p>Location: ${escapeHtml(loc)}</p>` : ''}
    ${desc ? `<p>${escapeHtml(desc)}</p>` : ''}
  </article>`;
  }).join('\n');

  return `
<main>
  <h1>Tamil Heritage Events &amp; Workshops — Meenkodi</h1>
  <p>
    Join upcoming Tamil heritage events, cultural workshops, seminars, and community gatherings
    celebrating 5000+ years of Tamil civilization, Pandiya dynasty history, Sangam literature,
    temple architecture, and traditional arts.
  </p>
  ${items}
</main>
`;
}

/**
 * Build hidden SSR body HTML for a single event detail page.
 */
export function buildEventDetailBodyHtml({ event }) {
  if (!event) return '<main><h1>Event — Meenkodi Tamil Heritage</h1></main>';
  const t = pick(event.title);
  const desc = pick(event.description);
  const loc = pick(event.location);
  const date = event.date
    ? new Date(event.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';
  const img = event.imageUrl
    ? `<img src="${escapeHtml(event.imageUrl)}" alt="${escapeHtml(t)} — Meenkodi Tamil heritage event" loading="lazy" />`
    : '';

  return `
<main>
  <h1>${escapeHtml(t)}</h1>
  ${img}
  ${date ? `<p>Date: <time datetime="${event.date ? new Date(event.date).toISOString() : ''}">${escapeHtml(date)}</time></p>` : ''}
  ${loc ? `<p>Location: ${escapeHtml(loc)}</p>` : ''}
  ${desc ? `<p>${escapeHtml(desc)}</p>` : ''}
  <p><a href="/events">← Back to all events</a></p>
</main>
`;
}

/**
 * Build hidden SSR body HTML for the /explore page.
 */
export function buildExploreBodyHtml() {
  return `
<main>
  <h1>Explore Tamil Heritage — Meenkodi</h1>
  <p>
    Explore 5000+ years of Tamil civilization across eight major heritage categories.
    Discover Pandiya, Chola, and Chera dynasties; ancient temples; Sangam literature;
    classical dance forms; traditional foods; festivals; clothing; and ancient Tamil science.
  </p>
  <nav>
    <ul>
      <li><a href="/explore/temples">Tamil Temples &amp; Dravidian Architecture</a></li>
      <li><a href="/explore/literature">Sangam Literature &amp; Tamil Poets</a></li>
      <li><a href="/explore/dance">Tamil Dance &amp; Performing Arts</a></li>
      <li><a href="/explore/foods">Traditional Tamil Foods &amp; Cuisine</a></li>
      <li><a href="/explore/festivals">Tamil Festivals &amp; Celebrations</a></li>
      <li><a href="/explore/clothing">Traditional Tamil Clothing</a></li>
      <li><a href="/explore/ancientscience">Ancient Tamil Science &amp; Technology</a></li>
      <li><a href="/explore/lands/kurinji">Five Tamil Lands — Kurinji</a></li>
      <li><a href="/explore/lands/mullai">Five Tamil Lands — Mullai</a></li>
      <li><a href="/explore/lands/marutham">Five Tamil Lands — Marutham</a></li>
      <li><a href="/explore/lands/neithal">Five Tamil Lands — Neithal</a></li>
      <li><a href="/explore/lands/palai">Five Tamil Lands — Palai</a></li>
    </ul>
  </nav>
</main>
`;
}

/**
 * Hidden SSR body for any content detail page (temple, food, Seeds folder, poet...).
 * photos: optional [{ url, caption }] so each image is indexed with its own name.
 */
export function buildDetailBodyHtml({
  heading, description, image, photos = [], backHref, backLabel,
  facts = [], sections = [], items = [],
}) {
  const img = image
    ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(heading)} — Meenkodi Tamil Heritage" loading="lazy" />`
    : '';
  const factList = facts.filter(f => f && f.value).map(f =>
    `    <dt>${escapeHtml(f.label)}</dt><dd>${escapeHtml(stripTags(f.value))}</dd>`).join('\n');
  // Full text of every part of the page, in both languages (Tamil searches too)
  const sectionHtml = sections.filter(s => s && (s.en || s.ta || s.image)).map(s => {
    const sectionImg = s.image && /^https?:\/\//i.test(s.image)
      ? `<img src="${escapeHtml(s.image)}" alt="${escapeHtml(s.heading || heading)}" loading="lazy" />`
      : '';
    return `  <section>
    ${s.heading ? `<h2>${escapeHtml(s.heading)}</h2>` : ''}
    ${sectionImg}
    ${paragraphs(s.en, 'en')}
    ${paragraphs(s.ta, 'ta')}
  </section>`;
  }).join('\n');
  const gallery = photos.filter(p => p && p.url).slice(0, 80).map(p => {
    const caption = p.caption || heading;
    return `  <figure><img src="${escapeHtml(p.url)}" alt="${escapeHtml(caption)}" loading="lazy" /><figcaption>${escapeHtml(caption)}</figcaption></figure>`;
  }).join('\n');
  // Links to every item of a section, so crawlers can reach them from the list page
  const itemList = items.filter(i => i && i.href).map(i => {
    const thumb = i.image && /^https?:\/\//i.test(i.image)
      ? `<img src="${escapeHtml(i.image)}" alt="${escapeHtml(i.title)}" loading="lazy" />`
      : '';
    return `    <li><a href="${escapeHtml(i.href)}">${thumb}${escapeHtml(i.title)}</a></li>`;
  }).join('\n');

  return `
<main>
  <h1>${escapeHtml(heading)}</h1>
  ${img}
  ${description ? paragraphs(description) : ''}
  ${factList ? `<dl>\n${factList}\n  </dl>` : ''}
  ${sectionHtml}
  ${gallery ? `<section>\n${gallery}\n</section>` : ''}
  ${itemList ? `<ul>\n${itemList}\n  </ul>` : ''}
  ${backHref ? `<p><a href="${escapeHtml(backHref)}">← ${escapeHtml(backLabel || 'Back')}</a></p>` : ''}
</main>
`;
}

/** Text (plain, markdown or HTML) as escaped <p> paragraphs, capped for size */
function paragraphs(text, lang) {
  if (!text) return '';
  const langAttr = lang ? ` lang="${lang}"` : '';
  return String(text).slice(0, 12000)
    .split(/\n\s*\n|<\/p>|<br\s*\/?>/i)
    .map(p => stripTags(p))
    .filter(Boolean)
    .map(p => `<p${langAttr}>${escapeHtml(p)}</p>`)
    .join('\n    ');
}

/** Plain-text summary for meta descriptions */
export function metaDescription(text, fallback, maxLen = 200) {
  const s = truncate(stripTags(text || ''), maxLen);
  return s || fallback;
}

/**
 * Shortcut: inject only the canonical tag (used by the generic catch-all).
 */
export function injectCanonical(baseHtml, canonicalUrl) {
  return buildPageHtml(baseHtml, { canonicalUrl, title: '', description: '', bodyHtml: '' });
}
