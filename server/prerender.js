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

/**
 * Build a full HTML page with injected SSR content.
 *
 * @param {string} baseHtml  - The raw index.html file content
 * @param {object} opts
 * @param {string}  opts.title        - <title> to inject (overrides the base)
 * @param {string}  opts.description  - <meta description> to inject
 * @param {string}  opts.bodyHtml     - Raw HTML for the hidden #ssr-content div
 * @param {string}  opts.canonicalUrl - Canonical URL for this page
 * @returns {string} Modified HTML string
 */
export function buildPageHtml(baseHtml, { title, description, bodyHtml, canonicalUrl }) {
  let html = baseHtml;

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

/** Strip HTML tags from a string (for content previews) */
function stripTags(str) {
  return str ? String(str).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
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
    <h2><a href="/articles/${a._id}">${escapeHtml(t)}</a></h2>
    ${img}
    <p>${escapeHtml(desc)}</p>
  </article>`;
  }).join('\n');

  const eventLinks = recentEvents.slice(0, 5).map(e => {
    const t = pick(e.title);
    const loc = pick(e.location);
    const date = e.date ? new Date(e.date).toDateString() : '';
    return `<li><a href="/events/${e._id}">${escapeHtml(t)}</a>${date ? ` — ${escapeHtml(date)}` : ''}${loc ? ` @ ${escapeHtml(loc)}` : ''}</li>`;
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
    <h2><a href="/articles/${a._id}">${escapeHtml(t)}</a></h2>
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
  const content = truncate(stripTags(pick(article.content)), 500);
  const author = article.authorName || '';
  const img = article.image
    ? `<img src="${escapeHtml(article.image)}" alt="${escapeHtml(t)} — Tamil heritage article cover image" loading="lazy" />`
    : '';

  return `
<main>
  <h1>${escapeHtml(t)}</h1>
  ${img}
  ${author ? `<p>By ${escapeHtml(author)}</p>` : ''}
  <p>${escapeHtml(content)}</p>
  <p><a href="/articles">← Back to all articles</a></p>
</main>
`;
}

/**
 * Build hidden SSR body HTML for the /gallery listing page.
 */
export function buildGalleryBodyHtml({ items = [] } = {}) {
  const nonFolders = items.filter(i => !i.isFolder).slice(0, 20);
  const itemHtml = nonFolders.map(item => {
    const name = pick(item.name);
    const desc = truncate(pick(item.description), 160);
    const alt = pick(item.imageAlt) || `${name} — Tamil heritage gallery image`;
    const img = item.imageUrl
      ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(alt)}" loading="lazy" />`
      : '';
    return `
  <figure>
    <a href="/gallery/${item._id}">${img}</a>
    <figcaption><a href="/gallery/${item._id}">${escapeHtml(name)}</a>${desc ? ` — ${escapeHtml(desc)}` : ''}</figcaption>
  </figure>`;
  }).join('\n');

  return `
<main>
  <h1>Gallery — Tamil Heritage Photos, Temples, Kings &amp; Culture — Meenkodi</h1>
  <p>
    Browse photos of ancient Tamil temples, Pandiya and Chola kings, traditional festivals,
    cultural events, and heritage sites across Tamil Nadu and the Tamil diaspora.
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
    <h2><a href="/events/${e._id}">${escapeHtml(t)}</a></h2>
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
 * Shortcut: inject only the canonical tag (used by the generic catch-all).
 */
export function injectCanonical(baseHtml, canonicalUrl) {
  return buildPageHtml(baseHtml, { canonicalUrl, title: '', description: '', bodyHtml: '' });
}
