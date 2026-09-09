/**
 * generate-sitemap.js
 *
 * Connects to MongoDB and generates all sitemap XML files from live data.
 * Writes them to client/public/ so they are served by Express/Render.
 *
 * Usage (from project root or server/):
 *   node server/scripts/generate-sitemap.js
 *
 * Or trigger via the API endpoint (admin only):
 *   POST /api/sitemap/refresh
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: new URL('../../server/.env', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Public directory (where sitemap files live)
const PUBLIC_DIR = path.resolve(__dirname, '../../client/public');

// Base URL for all sitemap entries
const BASE_URL = 'https://www.meenkodi.com';

// Today's date in YYYY-MM-DD format
function today() {
  return new Date().toISOString().split('T')[0];
}

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Build a <url> entry
function urlEntry(loc, opts = {}) {
  const { lastmod = today(), changefreq = 'monthly', priority = '0.7', images = [] } = opts;
  const imageXml = images.map(img => `
    <image:image>
      <image:loc>${escapeXml(img.url)}</image:loc>
      ${img.title ? `<image:title>${escapeXml(img.title)}</image:title>` : ''}
      ${img.caption ? `<image:caption>${escapeXml(img.caption)}</image:caption>` : ''}
    </image:image>`).join('');
  return `  <url>
    <loc>${BASE_URL}${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>${imageXml}
  </url>`;
}

function wrapUrlset(urls, includeImageNs = false) {
  const ns = [
    'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    includeImageNs ? 'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"' : ''
  ].filter(Boolean).join(' ');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset ${ns}>\n${urls.join('\n')}\n</urlset>`;
}

function write(filename, content) {
  const filePath = path.join(PUBLIC_DIR, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`  ✅ Written: ${filename} (${content.length} bytes)`);
}

// ─── Main Generator ───────────────────────────────────────────────────────────

export async function generateAllSitemaps() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  let connected = false;

  if (mongoUri && mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(mongoUri);
      connected = true;
      console.log('  MongoDB connected for sitemap generation');
    } catch (err) {
      console.warn('  MongoDB not available, generating static sitemaps only:', err.message);
    }
  } else if (mongoose.connection.readyState === 1) {
    console.log('  Using existing MongoDB connection');
  }

  let Article, Gallery, Event, Resource, Land, Temple, Literature, Dance, Food, Festival,
      AncientScience, Clothing, Dynasty, Poet;

  try {
    ({ default: Article }        = await import('../models/Article.js'));
    ({ default: Gallery }        = await import('../models/Gallery.js'));
    ({ default: Event }          = await import('../models/Event.js'));
    ({ default: Resource }       = await import('../models/Resource.js'));
    ({ default: Land }           = await import('../models/Land.js'));
    ({ default: Temple }         = await import('../models/Temple.js'));
    ({ default: Literature }     = await import('../models/Literature.js'));
    ({ default: Dance }          = await import('../models/Dance.js'));
    ({ default: Food }           = await import('../models/Food.js'));
    ({ default: Festival }       = await import('../models/Festival.js'));
    ({ default: AncientScience } = await import('../models/AncientScience.js'));
    ({ default: Clothing }       = await import('../models/Clothing.js'));
    ({ default: Dynasty }        = await import('../models/Dynasty.js'));
    ({ default: Poet }           = await import('../models/Poet.js'));
  } catch (e) {
    console.warn('  Could not load all models:', e.message);
  }

  const generated = [];

  // 1. Main sitemap.xml (static pages)
  const staticUrls = [
    urlEntry('/', { changefreq: 'weekly', priority: '1.0' }),
    urlEntry('/explore', { changefreq: 'weekly', priority: '0.9' }),
    urlEntry('/gallery', { changefreq: 'daily', priority: '0.85' }),
    urlEntry('/articles', { changefreq: 'daily', priority: '0.85' }),
    urlEntry('/events', { changefreq: 'weekly', priority: '0.8' }),
    urlEntry('/resources', { changefreq: 'weekly', priority: '0.75' }),
    urlEntry('/seeds-and-footprints', { changefreq: 'weekly', priority: '0.75' }),
    urlEntry('/faq', { changefreq: 'monthly', priority: '0.5' }),
    urlEntry('/explore/temples', { changefreq: 'monthly', priority: '0.8' }),
    urlEntry('/explore/literature', { changefreq: 'monthly', priority: '0.8' }),
    urlEntry('/explore/dance', { changefreq: 'monthly', priority: '0.75' }),
    urlEntry('/explore/foods', { changefreq: 'monthly', priority: '0.75' }),
    urlEntry('/explore/festivals', { changefreq: 'monthly', priority: '0.75' }),
    urlEntry('/explore/clothing', { changefreq: 'monthly', priority: '0.7' }),
    urlEntry('/explore/ancientscience', { changefreq: 'monthly', priority: '0.75' }),
    urlEntry('/explore/lands/kurinji', { changefreq: 'monthly', priority: '0.85' }),
    urlEntry('/explore/lands/mullai', { changefreq: 'monthly', priority: '0.85' }),
    urlEntry('/explore/lands/marutham', { changefreq: 'monthly', priority: '0.9' }),
    urlEntry('/explore/lands/neithal', { changefreq: 'monthly', priority: '0.85' }),
    urlEntry('/explore/lands/palai', { changefreq: 'monthly', priority: '0.85' }),
  ];
  write('sitemap.xml', wrapUrlset(staticUrls));
  generated.push('sitemap.xml');

  // 2. Articles
  let articleUrls = [];
  if (Article) {
    try {
      const articles = await Article.find({ status: 'published' }).select('_id updatedAt publishedAt title image').lean();
      articleUrls = articles.map(a => {
        const lastmod = a.updatedAt || a.publishedAt || new Date();
        const images = a.image ? [{ url: a.image, title: (a.title && a.title.en) || 'Tamil heritage article' }] : [];
        return urlEntry(`/articles/${a._id}`, { lastmod: new Date(lastmod).toISOString().split('T')[0], changefreq: 'weekly', priority: '0.8', images });
      });
      console.log(`  Articles: ${articleUrls.length}`);
    } catch (e) { console.warn('  Articles error:', e.message); }
  }
  write('sitemap-articles.xml', wrapUrlset(articleUrls, true));
  generated.push('sitemap-articles.xml');

  // 3. Events
  let eventUrls = [];
  if (Event) {
    try {
      const events = await Event.find().select('_id updatedAt createdAt title imageUrl').lean();
      eventUrls = events.map(e => {
        const images = e.imageUrl ? [{ url: e.imageUrl, title: (e.title && e.title.en) || 'Tamil heritage event' }] : [];
        return urlEntry(`/events/${e._id}`, { lastmod: new Date(e.updatedAt || e.createdAt || new Date()).toISOString().split('T')[0], changefreq: 'weekly', priority: '0.75', images });
      });
      console.log(`  Events: ${eventUrls.length}`);
    } catch (e) { console.warn('  Events error:', e.message); }
  }
  write('sitemap-events.xml', wrapUrlset(eventUrls, true));
  generated.push('sitemap-events.xml');

  // 4. Gallery
  let galleryUrls = [];
  if (Gallery) {
    try {
      const items = await Gallery.find({ isFolder: { $ne: true } }).select('_id updatedAt createdAt name imageUrl imageAlt').lean();
      galleryUrls = items.map(item => {
        const altText = (item.imageAlt && item.imageAlt.en) || (item.name && item.name.en) || 'Tamil heritage image';
        const images = item.imageUrl ? [{ url: item.imageUrl, title: altText }] : [];
        return urlEntry(`/gallery/${item._id}`, { lastmod: new Date(item.updatedAt || item.createdAt || new Date()).toISOString().split('T')[0], changefreq: 'monthly', priority: '0.7', images });
      });
      console.log(`  Gallery items: ${galleryUrls.length}`);
    } catch (e) { console.warn('  Gallery error:', e.message); }
  }
  write('sitemap-gallery.xml', wrapUrlset(galleryUrls, true));
  generated.push('sitemap-gallery.xml');

  // 5. Resources
  let resourceUrls = [];
  if (Resource) {
    try {
      const resources = await Resource.find().select('_id updatedAt createdAt').lean();
      resourceUrls = resources.map(r => urlEntry(`/resources/${r._id}`, { lastmod: new Date(r.updatedAt || r.createdAt || new Date()).toISOString().split('T')[0], changefreq: 'monthly', priority: '0.6' }));
      console.log(`  Resources: ${resourceUrls.length}`);
    } catch (e) { console.warn('  Resources error:', e.message); }
  }
  write('sitemap-resources.xml', wrapUrlset(resourceUrls));
  generated.push('sitemap-resources.xml');

  // 6. Lands
  const LAND_SLUGS = ['kurinji', 'mullai', 'marutham', 'neithal', 'palai'];
  const landUrls = LAND_SLUGS.map(slug => urlEntry(`/explore/lands/${slug}`, { changefreq: 'monthly', priority: '0.85' }));
  write('sitemap-lands.xml', wrapUrlset(landUrls));
  generated.push('sitemap-lands.xml');

  // 7–14. Remaining collections (temples, literature, dance, foods, festivals, clothing, science, dynasties, poets)
  const collectionMap = [
    { model: Temple, path: (i) => `/explore/temples/${i.slug || i._id}`, file: 'sitemap-temples.xml', label: 'Temples', priority: '0.8' },
    { model: Literature, path: (i) => `/explore/literature/${i.slug || i._id}`, file: 'sitemap-literature.xml', label: 'Literature', priority: '0.75' },
    { model: Dance, path: (i) => `/explore/dance/${i.slug || i._id}`, file: 'sitemap-dance.xml', label: 'Dance', priority: '0.7' },
    { model: Food, path: (i) => `/explore/foods/${i.slug || i._id}`, file: 'sitemap-foods.xml', label: 'Foods', priority: '0.7' },
    { model: Festival, path: (i) => `/explore/festivals/${i.slug || i._id}`, file: 'sitemap-festivals.xml', label: 'Festivals', priority: '0.7' },
    { model: Clothing, path: (i) => `/explore/clothing/${i.slug || i._id}`, file: 'sitemap-clothing.xml', label: 'Clothing', priority: '0.65' },
    { model: AncientScience, path: (i) => `/explore/ancientscience/${i.slug || i._id}`, file: 'sitemap-science.xml', label: 'AncientScience', priority: '0.7' },
    { model: Dynasty, path: (i) => `/dynasties/${i.slug || i._id}`, file: 'sitemap-dynasties.xml', label: 'Dynasties', priority: '0.8' },
    { model: Poet, path: (i) => `/poets/${i.slug || i._id}`, file: 'sitemap-poets.xml', label: 'Poets', priority: '0.75' },
  ];

  for (const col of collectionMap) {
    let urls = [];
    if (col.model) {
      try {
        const items = await col.model.find().select('_id slug updatedAt').lean();
        urls = items.map(i => urlEntry(col.path(i), { lastmod: new Date(i.updatedAt || new Date()).toISOString().split('T')[0], changefreq: 'monthly', priority: col.priority }));
        console.log(`  ${col.label}: ${urls.length}`);
      } catch (e) { console.warn(`  ${col.label} error:`, e.message); }
    }
    write(col.file, wrapUrlset(urls));
    generated.push(col.file);
  }

  // Static placeholder sitemaps
  write('sitemap-seeds.xml', wrapUrlset([urlEntry('/seeds-and-footprints', { changefreq: 'weekly', priority: '0.75' })]));
  write('sitemap-kings.xml', wrapUrlset([]));
  write('sitemap-images.xml', wrapUrlset([])); // images are now inside individual sitemaps
  generated.push('sitemap-seeds.xml', 'sitemap-kings.xml', 'sitemap-images.xml');

  // Sitemap Index
  const sitemapIndexEntries = generated.map(filename => `
  <sitemap>
    <loc>${BASE_URL}/${filename}</loc>
    <lastmod>${today()}</lastmod>
  </sitemap>`).join('\n');

  write('sitemap-index.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapIndexEntries}\n</sitemapindex>`);

  if (connected) {
    await mongoose.disconnect();
    console.log('  MongoDB disconnected');
  }

  const total = generated.length + 1;
  console.log(`\n✅ Generated ${total} sitemaps (including index)`);
  return { generated: [...generated, 'sitemap-index.xml'] };
}

// Run directly if called as a script
if (process.argv[1] && process.argv[1].includes('generate-sitemap')) {
  console.log('\n🗺️  Generating sitemaps from live database...\n');
  generateAllSitemaps()
    .then(() => process.exit(0))
    .catch(err => { console.error('Error generating sitemaps:', err); process.exit(1); });
}
