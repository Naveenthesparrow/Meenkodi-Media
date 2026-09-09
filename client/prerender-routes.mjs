#!/usr/bin/env node
/**
 * prerender-routes.mjs — Post-build static pre-renderer for Meenkodi
 *
 * Runs AFTER `vite build`. Reads the built client/dist/index.html, fetches
 * real content from the production API, injects page-specific HTML into
 * each route, and writes a separate index.html for every route into client/dist/.
 *
 * Render's static site then serves the correct pre-rendered file for each URL.
 *
 * Usage (add to build pipeline):
 *   cd client && npm run build && node prerender-routes.mjs
 *
 * Routes covered:
 *   /                    → dist/index.html  (homepage - already done by Vite)
 *   /gallery             → dist/gallery/index.html
 *   /gallery/:id         → dist/gallery/<id>/index.html
 *   /articles            → dist/articles/index.html
 *   /articles/:id        → dist/articles/<id>/index.html
 *   /events              → dist/events/index.html
 *   /events/:id          → dist/events/<id>/index.html
 *   /explore             → dist/explore/index.html
 *   /seeds-and-footprints → dist/seeds-and-footprints/index.html
 *   /faq                 → dist/faq/index.html
 *   /resources           → dist/resources/index.html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ─── Config ───────────────────────────────────────────────────────────────────
const BASE_URL   = 'https://www.meenkodi.com';
const API_BASE   = process.env.PRERENDER_API || 'https://meenkodi-media-fd.onrender.com';
const DIST_DIR   = path.join(__dirname, 'dist');
const BASE_HTML  = path.join(DIST_DIR, 'index.html');

// ─── Helpers ──────────────────────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function strip(str) {
  return str ? String(str).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : '';
}

function truncate(str, n = 220) {
  const s = strip(str || '');
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function pick(field) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field.en || field.ta || '';
}

async function apiFetch(path) {
  try {
    const url = `${API_BASE}${path}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!r.ok) { console.warn(`  ⚠️  ${url} → ${r.status}`); return null; }
    return r.json();
  } catch (e) {
    console.warn(`  ⚠️  apiFetch ${path} failed:`, e.message);
    return null;
  }
}

/** Write an HTML file to dist/<routePath>/index.html */
function writeRoute(routePath, html) {
  const dir  = path.join(DIST_DIR, routePath.replace(/^\//, ''));
  const file = path.join(dir, 'index.html');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, html, 'utf8');
  const kb = (html.length / 1024).toFixed(1);
  console.log(`  ✅  ${routePath} → ${file.replace(DIST_DIR, 'dist')} (${kb} KB)`);
}

/**
 * Inject page-specific content into the base HTML.
 * Injects:  <title>, <meta description>, <link canonical>, #ssr-content div
 */
function inject(baseHtml, { title, description, canonicalUrl, bodyHtml }) {
  let html = baseHtml;

  // 1. Canonical
  const canonical = `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`;
  if (html.includes('<link rel="canonical"')) {
    html = html.replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, canonical);
  } else {
    html = html.replace('</head>', `  ${canonical}\n</head>`);
  }

  // 2. Title
  if (title) {
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
    html = html.replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/,
      `$1${escapeHtml(title)}$2`);
  }

  // 3. Meta description
  if (description) {
    html = html.replace(/(<meta\s+name="description"\s+content=")[^"]*(")/,
      `$1${escapeHtml(description)}$2`);
    html = html.replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/,
      `$1${escapeHtml(description)}$2`);
  }

  // 4. SSR body block — injected before </body>, hidden from visual UI
  if (bodyHtml && bodyHtml.trim()) {
    const block = `\n<div id="ssr-content" aria-hidden="true" style="position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;">\n${bodyHtml}\n</div>\n`;
    html = html.replace('</body>', `${block}</body>`);
  }

  return html;
}

// ─── Page-specific body builders ─────────────────────────────────────────────

function galleryListHtml(items) {
  const visible = items.filter(i => !i.isFolder);
  const rows = visible.map(item => {
    const name   = escapeHtml(pick(item.name));
    const desc   = escapeHtml(truncate(pick(item.description)) ||
                   `${pick(item.name)} — part of the ${item.category || 'Tamil heritage'} collection on Meenkodi.`);
    const alt    = escapeHtml(pick(item.imageAlt) || pick(item.name) || 'Tamil heritage gallery image');
    const cat    = escapeHtml(item.category || '');
    const era    = item.era ? ` · ${escapeHtml(item.era)}` : '';
    const img    = item.imageUrl
      ? `<img src="${escapeHtml(item.imageUrl)}" alt="${alt}" loading="lazy" />`
      : '';
    return `
  <figure>
    <a href="/gallery/${item._id}">${img}</a>
    <h2><a href="/gallery/${item._id}">${name}</a></h2>
    <p>${desc}</p>
    ${cat ? `<p><small>Category: ${cat}${era}</small></p>` : ''}
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
  ${rows}
</main>`;
}

function galleryDetailHtml(item) {
  const name    = pick(item.name);
  const seoT    = pick(item.seoTitle) || name;
  const seoD    = pick(item.seoDescription) || pick(item.description) || `${name} — Tamil heritage on Meenkodi`;
  const alt     = pick(item.imageAlt) || name;
  const img     = item.imageUrl
    ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(alt)}" loading="lazy" />`
    : '';
  const desc    = truncate(seoD, 400);
  const cat     = item.category || '';
  const autoDesc = desc || `${name} — part of the ${cat || 'Tamil heritage'} collection on Meenkodi. This image documents the visual heritage of Tamil civilization.`;

  return `
<main>
  <h1>${escapeHtml(seoT)}</h1>
  ${img}
  <figcaption><strong>${escapeHtml(name)}</strong></figcaption>
  <p>${escapeHtml(autoDesc)}</p>
  ${cat ? `<p>Category: <a href="/gallery">${escapeHtml(cat)}</a></p>` : ''}
  ${item.era ? `<p>Era / Period: ${escapeHtml(item.era)}</p>` : ''}
  ${item.location ? `<p>Location: ${escapeHtml(item.location)}</p>` : ''}
  ${item.keywords && item.keywords.length ? `<p>Keywords: ${item.keywords.map(escapeHtml).join(', ')}</p>` : ''}
  <p><a href="/gallery">← Back to Gallery</a></p>
</main>`;
}

function articlesListHtml(articles) {
  const rows = articles.map(a => {
    const title = escapeHtml(pick(a.title));
    const desc  = escapeHtml(truncate(pick(a.content)));
    const img   = a.image
      ? `<img src="${escapeHtml(a.image)}" alt="${escapeHtml(pick(a.title))} — Meenkodi article" loading="lazy" />`
      : '';
    return `
  <article>
    <h2><a href="/articles/${a._id}">${title}</a></h2>
    ${img}
    ${desc ? `<p>${desc}</p>` : ''}
  </article>`;
  }).join('\n');

  return `
<main>
  <h1>Articles on Tamil Heritage, History &amp; Culture | Meenkodi</h1>
  <p>
    Read in-depth articles on Tamil civilization, Pandiya dynasty, Chola empire, Sangam literature,
    temple architecture, Pallar Mallar warriors, and cultural traditions on Meenkodi.
  </p>
  ${rows}
</main>`;
}

function articleDetailHtml(article) {
  const title   = pick(article.title);
  const content = truncate(pick(article.content), 600);
  const img     = article.image
    ? `<img src="${escapeHtml(article.image)}" alt="${escapeHtml(title)} — Meenkodi Tamil heritage article" loading="lazy" />`
    : '';

  return `
<main>
  <h1>${escapeHtml(title)}</h1>
  ${img}
  ${article.authorName ? `<p>By ${escapeHtml(article.authorName)}</p>` : ''}
  <p>${escapeHtml(content)}</p>
  <p><a href="/articles">← Back to all articles</a></p>
</main>`;
}

function eventsListHtml(events) {
  const rows = events.map(e => {
    const title = escapeHtml(pick(e.title));
    const desc  = escapeHtml(truncate(pick(e.description)));
    const date  = e.date ? new Date(e.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
    const loc   = escapeHtml(pick(e.location));
    const img   = e.imageUrl
      ? `<img src="${escapeHtml(e.imageUrl)}" alt="${escapeHtml(pick(e.title))} — Tamil heritage event" loading="lazy" />`
      : '';
    return `
  <article>
    <h2><a href="/events/${e._id}">${title}</a></h2>
    ${img}
    ${date ? `<time>${escapeHtml(date)}</time>` : ''}
    ${loc ? `<p>Location: ${loc}</p>` : ''}
    ${desc ? `<p>${desc}</p>` : ''}
  </article>`;
  }).join('\n');

  return `
<main>
  <h1>Tamil Heritage Events &amp; Workshops | Meenkodi</h1>
  <p>
    Join Tamil heritage events, cultural workshops, and community gatherings celebrating Pandiya dynasty history,
    Sangam literature, Dravidian temple architecture, and 5000+ years of Tamil civilization.
  </p>
  ${rows}
</main>`;
}

function eventDetailHtml(event) {
  const title = pick(event.title);
  const desc  = truncate(pick(event.description), 400);
  const date  = event.date ? new Date(event.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const loc   = pick(event.location);
  const img   = event.imageUrl
    ? `<img src="${escapeHtml(event.imageUrl)}" alt="${escapeHtml(title)} — Tamil heritage event" loading="lazy" />`
    : '';

  return `
<main>
  <h1>${escapeHtml(title)}</h1>
  ${img}
  ${date ? `<p>Date: <time>${escapeHtml(date)}</time></p>` : ''}
  ${loc ? `<p>Location: ${escapeHtml(loc)}</p>` : ''}
  ${desc ? `<p>${escapeHtml(desc)}</p>` : ''}
  <p><a href="/events">← Back to all events</a></p>
</main>`;
}

function seedsHtml() {
  return `
<main>
  <h1>Seeds &amp; Footprints — Tamil Heritage Research | Meenkodi</h1>
  <p>
    Seeds &amp; Footprints is Meenkodi's research section documenting the roots of Tamil civilization —
    archaeological findings, ancient manuscripts, Sangam poetry analysis, and linguistic evidence
    of Tamil's 5000+ year history.
  </p>
  <p>
    Explore primary sources, scholarly research, and community contributions that map the footprints
    of the Pandiya, Chola, and Chera dynasties across the Indian subcontinent and the global Tamil diaspora.
  </p>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/articles">Articles</a></li>
      <li><a href="/explore">Explore Heritage</a></li>
    </ul>
  </nav>
</main>`;
}

function exploreHtml() {
  return `
<main>
  <h1>Explore Tamil Heritage — Temples, Literature, Dance, Food &amp; More | Meenkodi</h1>
  <p>
    Explore 5000+ years of Tamil civilization across eight major heritage categories.
    Discover Pandiya, Chola, and Chera dynasties; ancient Dravidian temples; Sangam literature;
    classical dance forms; traditional foods; festivals; clothing; and ancient Tamil science.
  </p>
  <nav>
    <ul>
      <li><a href="/explore/temples">Tamil Temples &amp; Dravidian Architecture</a> — Brihadeeswarar, Meenakshi, Shore Temple</li>
      <li><a href="/explore/literature">Sangam Literature</a> — Thirukkural, Silappatikaram, Purananuru</li>
      <li><a href="/explore/dance">Tamil Dance &amp; Performing Arts</a> — Bharatanatyam, Koothu, Silambam</li>
      <li><a href="/explore/foods">Traditional Tamil Foods &amp; Cuisine</a></li>
      <li><a href="/explore/festivals">Tamil Festivals</a> — Pongal, Chithirai, Karthigai Deepam</li>
      <li><a href="/explore/clothing">Traditional Tamil Clothing</a></li>
      <li><a href="/explore/ancientscience">Ancient Tamil Science &amp; Technology</a></li>
      <li><a href="/explore/lands/marutham">Five Tamil Lands — Marutham (Fertile Plains)</a></li>
      <li><a href="/explore/lands/kurinji">Five Tamil Lands — Kurinji (Mountain Highlands)</a></li>
      <li><a href="/explore/lands/mullai">Five Tamil Lands — Mullai (Pastoral Forests)</a></li>
      <li><a href="/explore/lands/neithal">Five Tamil Lands — Neithal (Coastal Lagoons)</a></li>
      <li><a href="/explore/lands/palai">Five Tamil Lands — Palai (Arid Heartlands)</a></li>
    </ul>
  </nav>
</main>`;
}

function faqHtml() {
  return `
<main>
  <h1>Frequently Asked Questions — Tamil Heritage | Meenkodi</h1>
  <section>
    <h2>What is Meenkodi?</h2>
    <p>Meenkodi (மீன்கொடி) is the fish flag symbol of the ancient Pandiya Dynasty and the official Tamil heritage portal documenting Pandiya history, Pallar Mallar warrior heritage, and Devendra Kula Vellalar (DKV) culture.</p>
  </section>
  <section>
    <h2>What is the Pandiya Dynasty?</h2>
    <p>The Pandiya (Pandiyar) Dynasty is one of the three great ancient Tamil kingdoms (Moovendhar), along with the Chola and Chera dynasties. Based in Madurai, the Pandiya kings patronized Tamil Sangam literature, maritime trade, and Dravidian temple architecture for over 2000 years.</p>
  </section>
  <section>
    <h2>What are the Five Tamil Lands (Tinai)?</h2>
    <p>The Five Tamil Lands are Kurinji (mountains), Mullai (forests), Marutham (fertile plains), Neithal (coastal), and Palai (arid). Each land has its own deity, flora, fauna, and cultural traditions documented in Sangam literature.</p>
  </section>
  <section>
    <h2>Who are the Pallar and Mallar communities?</h2>
    <p>Pallar and Mallar are ancient Tamil communities with deep roots in Marutham land agriculture and Pandiya Dynasty warrior traditions. Together with other communities, they form the Devendra Kula Vellalar (DKV) heritage group.</p>
  </section>
</main>`;
}

function resourcesHtml() {
  return `
<main>
  <h1>Tamil Heritage Educational Resources | Meenkodi</h1>
  <p>
    Explore books, academic papers, primary sources, and educational materials on Tamil civilization,
    Pandiya dynasty history, Sangam literature, Dravidian temple architecture, and Tamil cultural traditions.
  </p>
  <p><a href="/articles">Read our Articles</a> · <a href="/gallery">Browse the Gallery</a> · <a href="/events">Upcoming Events</a></p>
</main>`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🖥️  Meenkodi Pre-render Script\n');

  if (!fs.existsSync(BASE_HTML)) {
    console.error('❌  client/dist/index.html not found — run `npm run build` first');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(BASE_HTML, 'utf8');
  console.log(`📄  Base HTML loaded (${(baseHtml.length / 1024).toFixed(1)} KB)\n`);
  console.log(`📡  API: ${API_BASE}\n`);

  // ── Homepage — update the root index.html itself ──────────────────────────
  {
    const [articles, events] = await Promise.all([
      apiFetch('/api/articles?status=published'),
      apiFetch('/api/events'),
    ]);
    const artList = (Array.isArray(articles) ? articles : []).slice(0, 8);
    const evtList = (Array.isArray(events) ? events : []).slice(0, 5);

    const artRows = artList.map(a => {
      const t = escapeHtml(pick(a.title));
      const d = escapeHtml(truncate(pick(a.content)));
      const img = a.image ? `<img src="${escapeHtml(a.image)}" alt="${escapeHtml(pick(a.title))} — Tamil heritage article" loading="lazy" />` : '';
      return `<article><h2><a href="/articles/${a._id}">${t}</a></h2>${img}${d ? `<p>${d}</p>` : ''}</article>`;
    }).join('\n');

    const evtRows = evtList.map(e => {
      const t = escapeHtml(pick(e.title));
      const d = e.date ? new Date(e.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
      return `<li><a href="/events/${e._id}">${t}</a>${d ? ` — ${d}` : ''}</li>`;
    }).join('\n');

    const bodyHtml = `
<main>
  <h1>Meenkodi — Tamil Heritage: 5000+ Years of Tamil Civilization</h1>
  <p>
    Meenkodi preserves and shares 5000+ years of Tamil civilization — history, temples, dynasties
    (Pandiya, Chola, Chera), cultural traditions, and archaeological discoveries.
    Explore the stories of the Southerns (தென்புலத்தார்), Pandiyargal,
    temple architecture, Sangam literature, festivals, and living heritage.
  </p>
  <nav aria-label="Site sections">
    <ul>
      <li><a href="/explore">Explore Tamil Heritage</a></li>
      <li><a href="/explore/temples">Tamil Temples &amp; Architecture</a></li>
      <li><a href="/explore/literature">Sangam Literature</a></li>
      <li><a href="/explore/dance">Tamil Dance &amp; Performing Arts</a></li>
      <li><a href="/explore/foods">Tamil Foods &amp; Cuisine</a></li>
      <li><a href="/explore/festivals">Tamil Festivals</a></li>
      <li><a href="/articles">Articles on Tamil History</a></li>
      <li><a href="/gallery">Photo Gallery</a></li>
      <li><a href="/events">Tamil Heritage Events</a></li>
    </ul>
  </nav>
  ${artRows ? `<section><h2>Latest Articles</h2>\n${artRows}</section>` : ''}
  ${evtRows ? `<section><h2>Upcoming Events</h2><ul>${evtRows}</ul></section>` : ''}
</main>`;

    const html = inject(baseHtml, {
      title: 'Meenkodi | Tamil Heritage | Pandiya, Chola, Chera Dynasties | தென்புலத்தார்',
      description: 'Meenkodi preserves 5000+ years of Tamil civilization — Pandiya dynasty history, Chola temples, Sangam literature, and cultural traditions of the Southerns (தென்புலத்தார்).',
      canonicalUrl: `${BASE_URL}/`,
      bodyHtml,
    });
    fs.writeFileSync(BASE_HTML, html, 'utf8');
    console.log(`  ✅  / → dist/index.html (homepage updated)`);
  }

  // ── Gallery list ──────────────────────────────────────────────────────────
  {
    const data = await apiFetch('/api/gallery');
    const items = Array.isArray(data) ? data : [];
    const nonFolders = items.filter(i => !i.isFolder);
    const html = inject(baseHtml, {
      title: `Gallery — Tamil Heritage Photos, Kings, Temples & Culture | Meenkodi`,
      description: `Browse ${nonFolders.length}+ Tamil heritage photos: Pandiya kings, Dravidian temples, traditional festivals, and cultural events. Each image is named and captioned.`,
      canonicalUrl: `${BASE_URL}/gallery`,
      bodyHtml: galleryListHtml(items),
    });
    writeRoute('/gallery', html);

    // Gallery detail pages
    console.log(`  🖼️   Pre-rendering ${nonFolders.length} gallery detail pages…`);
    for (const item of nonFolders) {
      const name    = pick(item.name) || 'Tamil Heritage Image';
      const seoT    = pick(item.seoTitle) || name;
      const seoD    = truncate(pick(item.seoDescription) || pick(item.description) || `${name} — Tamil heritage gallery on Meenkodi`, 200);
      const html    = inject(baseHtml, {
        title: `${seoT} | Meenkodi Tamil Heritage Gallery`,
        description: seoD,
        canonicalUrl: `${BASE_URL}/gallery/${item._id}`,
        bodyHtml: galleryDetailHtml(item),
      });
      writeRoute(`/gallery/${item._id}`, html);
    }
  }

  // ── Articles list ─────────────────────────────────────────────────────────
  {
    const data = await apiFetch('/api/articles?status=published');
    const articles = Array.isArray(data) ? data : [];
    const html = inject(baseHtml, {
      title: 'Articles on Tamil Heritage, History & Culture | Meenkodi',
      description: 'Read in-depth articles on Tamil civilization, Pandiya dynasty, Sangam literature, temple architecture, and cultural traditions. Updated regularly by Tamil heritage researchers.',
      canonicalUrl: `${BASE_URL}/articles`,
      bodyHtml: articlesListHtml(articles),
    });
    writeRoute('/articles', html);

    // Article detail pages
    console.log(`  📝  Pre-rendering ${articles.length} article detail pages…`);
    for (const article of articles) {
      if (article.status !== 'published') continue;
      const title   = pick(article.title) || 'Tamil Heritage Article';
      const content = truncate(pick(article.content), 200);
      const html = inject(baseHtml, {
        title: `${title} | Meenkodi Tamil Heritage`,
        description: content || `${title} — read on Meenkodi, the Tamil heritage portal.`,
        canonicalUrl: `${BASE_URL}/articles/${article._id}`,
        bodyHtml: articleDetailHtml(article),
      });
      writeRoute(`/articles/${article._id}`, html);
    }
  }

  // ── Events list & detail pages ────────────────────────────────────────────
  {
    const data = await apiFetch('/api/events');
    const events = Array.isArray(data) ? data : [];
    const html = inject(baseHtml, {
      title: 'Tamil Heritage Events & Workshops | Meenkodi',
      description: 'Join upcoming Tamil heritage events, cultural workshops, and community gatherings. Celebrating Pandiya dynasty history, Sangam literature, and 5000+ years of Tamil civilization.',
      canonicalUrl: `${BASE_URL}/events`,
      bodyHtml: eventsListHtml(events),
    });
    writeRoute('/events', html);

    console.log(`  📅  Pre-rendering ${events.length} event detail pages…`);
    for (const event of events) {
      const title = pick(event.title) || 'Tamil Heritage Event';
      const desc  = truncate(pick(event.description), 200) || `${title} — Tamil heritage event on Meenkodi`;
      const html = inject(baseHtml, {
        title: `${title} | Meenkodi Events`,
        description: desc,
        canonicalUrl: `${BASE_URL}/events/${event._id}`,
        bodyHtml: eventDetailHtml(event),
      });
      writeRoute(`/events/${event._id}`, html);
    }
  }

  // ── Static content routes ─────────────────────────────────────────────────
  const staticRoutes = [
    {
      path: '/explore',
      title: 'Explore Tamil Heritage — Temples, Literature, Dance & More | Meenkodi',
      description: 'Explore Tamil heritage: Dravidian temples, Sangam literature, classical dance, traditional foods, festivals, clothing, ancient science, and the Five Tamil Lands.',
      bodyHtml: exploreHtml(),
    },
    {
      path: '/seeds-and-footprints',
      title: 'Seeds & Footprints — Tamil Heritage Research | Meenkodi',
      description: 'Meenkodi Seeds & Footprints: research section documenting archaeological findings, ancient manuscripts, Sangam poetry, and linguistic evidence of Tamil civilization.',
      bodyHtml: seedsHtml(),
    },
    {
      path: '/faq',
      title: 'FAQ — Tamil Heritage & Meenkodi | Frequently Asked Questions',
      description: 'Answers to frequently asked questions about Meenkodi, the Pandiya dynasty, the Five Tamil Lands, Pallar Mallar communities, and Devendra Kula Vellalar (DKV) heritage.',
      bodyHtml: faqHtml(),
    },
    {
      path: '/resources',
      title: 'Tamil Heritage Educational Resources | Meenkodi',
      description: 'Books, papers, primary sources, and educational materials on Tamil civilization, Pandiya dynasty, Sangam literature, and Dravidian temple architecture.',
      bodyHtml: resourcesHtml(),
    },
  ];

  for (const r of staticRoutes) {
    const html = inject(baseHtml, { ...r, canonicalUrl: `${BASE_URL}${r.path}` });
    writeRoute(r.path, html);
  }

  console.log('\n✅  Pre-render complete!\n');
}

main().catch(err => {
  console.error('❌  Pre-render failed:', err);
  process.exit(1);
});
