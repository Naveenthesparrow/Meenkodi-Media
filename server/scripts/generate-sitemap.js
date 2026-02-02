/**
 * Dynamic Sitemap Generator for Meenkodi Tamil Heritage
 * 
 * This script generates multiple sitemaps for better SEO:
 * - sitemap-index.xml (main sitemap index)
 * - sitemap.xml (static pages)
 * - sitemap-articles.xml (all articles)
 * - sitemap-events.xml (all events)
 * - sitemap-resources.xml (all resources)
 * - sitemap-lands.xml (all lands/explore pages)
 * - sitemap-images.xml (gallery images)
 * - sitemap-kings.xml (Tamil kings and rulers)
 * - sitemap-poets.xml (Tamil poets and authors)
 * - sitemap-literature.xml (Tamil literature works)
 * - sitemap-dance.xml (Tamil dance forms)
 * - sitemap-temples.xml (Tamil temples)
 * - sitemap-foods.xml (Tamil cuisine)
 * - sitemap-festivals.xml (Tamil festivals)
 * - sitemap-clothing.xml (Tamil traditional clothing)
 * - sitemap-science.xml (Ancient Tamil science)
 * - sitemap-dynasties.xml (Tamil dynasties)
 * 
 * Run this script after adding new content to update all sitemaps:
 * node server/scripts/generate-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// ES module setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import Gallery from '../models/Gallery.js';
import Article from '../models/Article.js';
import Event from '../models/Event.js';
import Resource from '../models/Resource.js';
import Land from '../models/Land.js';
import King from '../models/King.js';
import Poet from '../models/Poet.js';
import Literature from '../models/Literature.js';
import Dance from '../models/Dance.js';
import Temple from '../models/Temple.js';
import Food from '../models/Food.js';
import Festival from '../models/Festival.js';
import Clothing from '../models/Clothing.js';
import AncientScience from '../models/AncientScience.js';
import Dynasty from '../models/Dynasty.js';

const BASE_URL = 'https://www.meenkodi.com';

// Static pages with their priorities and change frequencies
const staticPages = [
  { url: '/', priority: 1.0, changefreq: 'weekly' },
  { url: '/explore', priority: 0.9, changefreq: 'weekly' },
  { url: '/gallery', priority: 0.85, changefreq: 'daily' },
  { url: '/articles', priority: 0.85, changefreq: 'daily' },
  { url: '/events', priority: 0.8, changefreq: 'weekly' },
  { url: '/resources', priority: 0.75, changefreq: 'weekly' },
  { url: '/faq', priority: 0.5, changefreq: 'monthly' },
  { url: '/about', priority: 0.6, changefreq: 'monthly' },
  { url: '/contact', priority: 0.6, changefreq: 'monthly' },
  { url: '/explore/kings', priority: 0.8, changefreq: 'monthly' },
  { url: '/explore/poets', priority: 0.8, changefreq: 'monthly' },
  { url: '/explore/literature', priority: 0.8, changefreq: 'monthly' },
  { url: '/explore/dance', priority: 0.75, changefreq: 'monthly' },
  { url: '/explore/temples', priority: 0.8, changefreq: 'monthly' },
  { url: '/explore/foods', priority: 0.75, changefreq: 'monthly' },
  { url: '/explore/festivals', priority: 0.75, changefreq: 'monthly' },
  { url: '/explore/clothing', priority: 0.7, changefreq: 'monthly' },
  { url: '/explore/ancientscience', priority: 0.75, changefreq: 'monthly' },
  { url: '/explore/dynasties', priority: 0.8, changefreq: 'monthly' },
  { url: '/explore/lands/kurinji', priority: 0.85, changefreq: 'monthly' },
  { url: '/explore/lands/mullai', priority: 0.85, changefreq: 'monthly' },
  { url: '/explore/lands/marutham', priority: 0.9, changefreq: 'monthly' },
  { url: '/explore/lands/neithal', priority: 0.85, changefreq: 'monthly' },
  { url: '/explore/lands/palai', priority: 0.85, changefreq: 'monthly' },
];

function formatDate(date) {
  if (!date) return new Date().toISOString().split('T')[0];
  return new Date(date).toISOString().split('T')[0];
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateImageSitemap(galleryItems) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  // Add gallery items with image data
  galleryItems.forEach(item => {
    const name = item.name?.en || item.name?.ta || 'Untitled';
    const description = item.description?.en || item.description?.ta || '';
    const keywords = item.keywords ? item.keywords.join(', ') : '';
    
    if (item.imageUrl) {
      const imageUrl = item.imageUrl.startsWith('http') 
        ? item.imageUrl 
        : `${BASE_URL}${item.imageUrl}`;
      
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}/gallery/${item._id}</loc>\n`;
      xml += `    <lastmod>${formatDate(item.updatedAt || item.createdAt)}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '    <image:image>\n';
      xml += `      <image:loc>${escapeXml(imageUrl)}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(name)}</image:title>\n`;
      if (description) {
        xml += `      <image:caption>${escapeXml(description.substring(0, 200))}</image:caption>\n`;
      }
      if (keywords) {
        xml += `      <image:license>${BASE_URL}/gallery/${item._id}</image:license>\n`;
      }
      xml += '    </image:image>\n';
      xml += '  </url>\n';
    }
  });

  xml += '</urlset>';
  return xml;
}

function generateArticlesSitemap(articles) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n';

  articles.forEach(article => {
    const slug = article.slug || article._id;
    const title = article.title_en || article.title?.en || 'Untitled';
    const category = article.category_en || article.category?.en || 'Tamil Heritage';
    
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/articles/${slug}</loc>\n`;
    xml += `    <lastmod>${formatDate(article.updatedAt || article.createdAt)}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.8</priority>\n';
    xml += '    <news:news>\n';
    xml += '      <news:publication>\n';
    xml += '        <news:name>Meenkodi Tamil Heritage</news:name>\n';
    xml += '        <news:language>en</news:language>\n';
    xml += '      </news:publication>\n';
    xml += `      <news:publication_date>${new Date(article.createdAt).toISOString()}</news:publication_date>\n`;
    xml += `      <news:title>${escapeXml(title)}</news:title>\n`;
    xml += `      <news:keywords>${escapeXml(category)}, Tamil Heritage, Tamil Culture</news:keywords>\n`;
    xml += '    </news:news>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

function generateEventsSitemap(events) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  events.forEach(event => {
    const slug = event.slug || event._id;
    const title = event.title_en || event.title?.en || 'Untitled Event';
    
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/events/${slug}</loc>\n`;
    xml += `    <lastmod>${formatDate(event.updatedAt || event.createdAt)}</lastmod>\n`;
    xml += '    <changefreq>weekly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

function generateResourcesSitemap(resources) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  resources.forEach(resource => {
    const slug = resource.slug || resource._id;
    
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/resources/${slug}</loc>\n`;
    xml += `    <lastmod>${formatDate(resource.updatedAt || resource.createdAt)}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

function generateLandsSitemap() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  const lands = [
    { url: '/explore/lands/kurinji', name: 'Kurinji', priority: 0.8 },
    { url: '/explore/lands/mullai', name: 'Mullai', priority: 0.8 },
    { url: '/explore/lands/marutham', name: 'Marutham', priority: 0.9 },
    { url: '/explore/lands/neithal', name: 'Neithal', priority: 0.8 },
    { url: '/explore/lands/palai', name: 'Palai', priority: 0.8 },
  ];

  const exploreCategories = [
    { url: '/explore/kings', name: 'Tamil Kings', priority: 0.8 },
    { url: '/explore/literature', name: 'Tamil Literature', priority: 0.8 },
    { url: '/explore/dance', name: 'Tamil Dance', priority: 0.75 },
    { url: '/explore/temples', name: 'Tamil Temples', priority: 0.8 },
    { url: '/explore/foods', name: 'Tamil Food', priority: 0.75 },
    { url: '/explore/festivals', name: 'Tamil Festivals', priority: 0.75 },
    { url: '/explore/clothing', name: 'Tamil Clothing', priority: 0.7 },
    { url: '/explore/ancientscience', name: 'Ancient Science', priority: 0.7 },
  ];

  [...lands, ...exploreCategories].forEach(item => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${item.url}</loc>\n`;
    xml += `    <lastmod>${formatDate()}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += `    <priority>${item.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

function generateKingsSitemap(kings) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  kings.forEach(king => {
    const slug = king.slug || king._id;
    
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/explore/kings/${slug}</loc>\n`;
    xml += `    <lastmod>${formatDate(king.updatedAt || king.createdAt)}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.75</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

function generatePoetsSitemap(poets) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  poets.forEach(poet => {
    const slug = poet.slug || poet._id;
    
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/explore/poets/${slug}</loc>\n`;
    xml += `    <lastmod>${formatDate(poet.updatedAt || poet.createdAt)}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.75</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

function generateLiteratureSitemap(literature) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  literature.forEach(work => {
    const slug = work.slug || work._id;
    
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/explore/literature/${slug}</loc>\n`;
    xml += `    <lastmod>${formatDate(work.updatedAt || work.createdAt)}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.75</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

function generateDanceSitemap(dances) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  dances.forEach(dance => {
    const slug = dance.slug || dance._id;
    
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/explore/dance/${slug}</loc>\n`;
    xml += `    <lastmod>${formatDate(dance.updatedAt || dance.createdAt)}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

function generateTemplesSitemap(temples) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  temples.forEach(temple => {
    const slug = temple.slug || temple._id;
    
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/explore/temples/${slug}</loc>\n`;
    xml += `    <lastmod>${formatDate(temple.updatedAt || temple.createdAt)}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.75</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

function generateFoodsSitemap(foods) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  foods.forEach(food => {
    const slug = food.slug || food._id;
    
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/explore/foods/${slug}</loc>\n`;
    xml += `    <lastmod>${formatDate(food.updatedAt || food.createdAt)}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

function generateFestivalsSitemap(festivals) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  festivals.forEach(festival => {
    const slug = festival.slug || festival._id;
    
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/explore/festivals/${slug}</loc>\n`;
    xml += `    <lastmod>${formatDate(festival.updatedAt || festival.createdAt)}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

function generateClothingSitemap(clothing) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  clothing.forEach(item => {
    const slug = item.slug || item._id;
    
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/explore/clothing/${slug}</loc>\n`;
    xml += `    <lastmod>${formatDate(item.updatedAt || item.createdAt)}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.65</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

function generateScienceSitemap(sciences) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  sciences.forEach(science => {
    const slug = science.slug || science._id;
    
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/explore/ancientscience/${slug}</loc>\n`;
    xml += `    <lastmod>${formatDate(science.updatedAt || science.createdAt)}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.7</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

function generateDynastiesSitemap(dynasties) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  dynasties.forEach(dynasty => {
    const slug = dynasty.slug || dynasty._id;
    
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/explore/dynasties/${slug}</loc>\n`;
    xml += `    <lastmod>${formatDate(dynasty.updatedAt || dynasty.createdAt)}</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.75</priority>\n';
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

function generateSitemapIndex() {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  const sitemaps = [
    { file: 'sitemap.xml', name: 'Main Pages' },
    { file: 'sitemap-articles.xml', name: 'Articles' },
    { file: 'sitemap-events.xml', name: 'Events' },
    { file: 'sitemap-resources.xml', name: 'Resources' },
    { file: 'sitemap-lands.xml', name: 'Lands & Explore' },
    { file: 'sitemap-images.xml', name: 'Images' },
    { file: 'sitemap-kings.xml', name: 'Kings' },
    { file: 'sitemap-poets.xml', name: 'Poets' },
    { file: 'sitemap-literature.xml', name: 'Literature' },
    { file: 'sitemap-dance.xml', name: 'Dance' },
    { file: 'sitemap-temples.xml', name: 'Temples' },
    { file: 'sitemap-foods.xml', name: 'Foods' },
    { file: 'sitemap-festivals.xml', name: 'Festivals' },
    { file: 'sitemap-clothing.xml', name: 'Clothing' },
    { file: 'sitemap-science.xml', name: 'Ancient Science' },
    { file: 'sitemap-dynasties.xml', name: 'Dynasties' },
  ];

  sitemaps.forEach(sitemap => {
    xml += '  <sitemap>\n';
    xml += `    <loc>${BASE_URL}/${sitemap.file}</loc>\n`;
    xml += `    <lastmod>${formatDate()}</lastmod>\n`;
    xml += '  </sitemap>\n';
  });

  xml += '</sitemapindex>';
  return xml;
}

async function generateSitemap() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Fetch dynamic content
    const galleryItems = await Gallery.find({}).select('_id name description keywords imageUrl createdAt updatedAt').lean();
    const articles = await Article.find({ status: 'published' }).select('_id slug title_en title category_en category createdAt updatedAt').lean();
    const events = await Event.find({}).select('_id slug title_en title createdAt updatedAt').lean();
    const resources = await Resource.find({}).select('_id slug title_en title createdAt updatedAt').lean();
    const kings = await King.find({}).select('_id slug name_en name createdAt updatedAt').lean();
    const poets = await Poet.find({}).select('_id slug name_en name createdAt updatedAt').lean();
    const literature = await Literature.find({}).select('_id slug title_en title createdAt updatedAt').lean();
    const dances = await Dance.find({}).select('_id slug name_en name createdAt updatedAt').lean();
    const temples = await Temple.find({}).select('_id slug name_en name createdAt updatedAt').lean();
    const foods = await Food.find({}).select('_id slug name_en name createdAt updatedAt').lean();
    const festivals = await Festival.find({}).select('_id slug name_en name createdAt updatedAt').lean();
    const clothing = await Clothing.find({}).select('_id slug name_en name createdAt updatedAt').lean();
    const sciences = await AncientScience.find({}).select('_id slug title_en title createdAt updatedAt').lean();
    const dynasties = await Dynasty.find({}).select('_id slug name_en name createdAt updatedAt').lean();

    console.log(`\n📊 Content Summary:`);
    console.log(`   - ${galleryItems.length} gallery items`);
    console.log(`   - ${articles.length} published articles`);
    console.log(`   - ${events.length} events`);
    console.log(`   - ${resources.length} resources`);
    console.log(`   - ${kings.length} kings`);
    console.log(`   - ${poets.length} poets`);
    console.log(`   - ${literature.length} literature works`);
    console.log(`   - ${dances.length} dance forms`);
    console.log(`   - ${temples.length} temples`);
    console.log(`   - ${foods.length} foods`);
    console.log(`   - ${festivals.length} festivals`);
    console.log(`   - ${clothing.length} clothing items`);
    console.log(`   - ${sciences.length} ancient sciences`);
    console.log(`   - ${dynasties.length} dynasties\n`);

    // Start building main sitemap (static pages only)
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}${page.url}</loc>\n`;
      xml += `    <lastmod>${formatDate()}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    // Write main sitemap (static pages)
    const sitemapPath = path.join(__dirname, '../../client/public/sitemap.xml');
    fs.writeFileSync(sitemapPath, xml, 'utf8');
    console.log(`✅ Main sitemap generated: sitemap.xml`);

    // Generate and write articles sitemap
    if (articles.length > 0) {
      const articlesSitemap = generateArticlesSitemap(articles);
      const articlesSitemapPath = path.join(__dirname, '../../client/public/sitemap-articles.xml');
      fs.writeFileSync(articlesSitemapPath, articlesSitemap, 'utf8');
      console.log(`✅ Articles sitemap generated: sitemap-articles.xml (${articles.length} articles)`);
    }

    // Generate and write events sitemap
    if (events.length > 0) {
      const eventsSitemap = generateEventsSitemap(events);
      const eventsSitemapPath = path.join(__dirname, '../../client/public/sitemap-events.xml');
      fs.writeFileSync(eventsSitemapPath, eventsSitemap, 'utf8');
      console.log(`✅ Events sitemap generated: sitemap-events.xml (${events.length} events)`);
    }

    // Generate and write resources sitemap
    if (resources.length > 0) {
      const resourcesSitemap = generateResourcesSitemap(resources);
      const resourcesSitemapPath = path.join(__dirname, '../../client/public/sitemap-resources.xml');
      fs.writeFileSync(resourcesSitemapPath, resourcesSitemap, 'utf8');
      console.log(`✅ Resources sitemap generated: sitemap-resources.xml (${resources.length} resources)`);
    }

    // Generate and write lands/explore sitemap
    const landsSitemap = generateLandsSitemap();
    const landsSitemapPath = path.join(__dirname, '../../client/public/sitemap-lands.xml');
    fs.writeFileSync(landsSitemapPath, landsSitemap, 'utf8');
    console.log(`✅ Lands sitemap generated: sitemap-lands.xml`);

    // Generate and write image sitemap
    const imageSitemap = generateImageSitemap(galleryItems);
    const imageSitemapPath = path.join(__dirname, '../../client/public/sitemap-images.xml');
    fs.writeFileSync(imageSitemapPath, imageSitemap, 'utf8');
    console.log(`✅ Image sitemap generated: sitemap-images.xml (${galleryItems.length} images)`);

    // Generate and write kings sitemap
    if (kings.length > 0) {
      const kingsSitemap = generateKingsSitemap(kings);
      const kingsSitemapPath = path.join(__dirname, '../../client/public/sitemap-kings.xml');
      fs.writeFileSync(kingsSitemapPath, kingsSitemap, 'utf8');
      console.log(`✅ Kings sitemap generated: sitemap-kings.xml (${kings.length} kings)`);
    }

    // Generate and write poets sitemap
    if (poets.length > 0) {
      const poetsSitemap = generatePoetsSitemap(poets);
      const poetsSitemapPath = path.join(__dirname, '../../client/public/sitemap-poets.xml');
      fs.writeFileSync(poetsSitemapPath, poetsSitemap, 'utf8');
      console.log(`✅ Poets sitemap generated: sitemap-poets.xml (${poets.length} poets)`);
    }

    // Generate and write literature sitemap
    if (literature.length > 0) {
      const literatureSitemap = generateLiteratureSitemap(literature);
      const literatureSitemapPath = path.join(__dirname, '../../client/public/sitemap-literature.xml');
      fs.writeFileSync(literatureSitemapPath, literatureSitemap, 'utf8');
      console.log(`✅ Literature sitemap generated: sitemap-literature.xml (${literature.length} works)`);
    }

    // Generate and write dance sitemap
    if (dances.length > 0) {
      const danceSitemap = generateDanceSitemap(dances);
      const danceSitemapPath = path.join(__dirname, '../../client/public/sitemap-dance.xml');
      fs.writeFileSync(danceSitemapPath, danceSitemap, 'utf8');
      console.log(`✅ Dance sitemap generated: sitemap-dance.xml (${dances.length} dances)`);
    }

    // Generate and write temples sitemap
    if (temples.length > 0) {
      const templesSitemap = generateTemplesSitemap(temples);
      const templesSitemapPath = path.join(__dirname, '../../client/public/sitemap-temples.xml');
      fs.writeFileSync(templesSitemapPath, templesSitemap, 'utf8');
      console.log(`✅ Temples sitemap generated: sitemap-temples.xml (${temples.length} temples)`);
    }

    // Generate and write foods sitemap
    if (foods.length > 0) {
      const foodsSitemap = generateFoodsSitemap(foods);
      const foodsSitemapPath = path.join(__dirname, '../../client/public/sitemap-foods.xml');
      fs.writeFileSync(foodsSitemapPath, foodsSitemap, 'utf8');
      console.log(`✅ Foods sitemap generated: sitemap-foods.xml (${foods.length} foods)`);
    }

    // Generate and write festivals sitemap
    if (festivals.length > 0) {
      const festivalsSitemap = generateFestivalsSitemap(festivals);
      const festivalsSitemapPath = path.join(__dirname, '../../client/public/sitemap-festivals.xml');
      fs.writeFileSync(festivalsSitemapPath, festivalsSitemap, 'utf8');
      console.log(`✅ Festivals sitemap generated: sitemap-festivals.xml (${festivals.length} festivals)`);
    }

    // Generate and write clothing sitemap
    if (clothing.length > 0) {
      const clothingSitemap = generateClothingSitemap(clothing);
      const clothingSitemapPath = path.join(__dirname, '../../client/public/sitemap-clothing.xml');
      fs.writeFileSync(clothingSitemapPath, clothingSitemap, 'utf8');
      console.log(`✅ Clothing sitemap generated: sitemap-clothing.xml (${clothing.length} items)`);
    }

    // Generate and write science sitemap
    if (sciences.length > 0) {
      const scienceSitemap = generateScienceSitemap(sciences);
      const scienceSitemapPath = path.join(__dirname, '../../client/public/sitemap-science.xml');
      fs.writeFileSync(scienceSitemapPath, scienceSitemap, 'utf8');
      console.log(`✅ Science sitemap generated: sitemap-science.xml (${sciences.length} topics)`);
    }

    // Generate and write dynasties sitemap
    if (dynasties.length > 0) {
      const dynastiesSitemap = generateDynastiesSitemap(dynasties);
      const dynastiesSitemapPath = path.join(__dirname, '../../client/public/sitemap-dynasties.xml');
      fs.writeFileSync(dynastiesSitemapPath, dynastiesSitemap, 'utf8');
      console.log(`✅ Dynasties sitemap generated: sitemap-dynasties.xml (${dynasties.length} dynasties)`);
    }

    // Generate sitemap index
    const sitemapIndex = generateSitemapIndex();
    const sitemapIndexPath = path.join(__dirname, '../../client/public/sitemap-index.xml');
    fs.writeFileSync(sitemapIndexPath, sitemapIndex, 'utf8');
    console.log(`✅ Sitemap index generated: sitemap-index.xml`);

    // Update robots.txt to point to sitemap index
    const robotsPath = path.join(__dirname, '../../client/public/robots.txt');
    let robotsTxt = `User-agent: *\nAllow: /\n\n`;
    robotsTxt += `# Main Sitemap Index\n`;
    robotsTxt += `Sitemap: ${BASE_URL}/sitemap-index.xml\n\n`;
    robotsTxt += `# Individual Sitemaps\n`;
    robotsTxt += `Sitemap: ${BASE_URL}/sitemap.xml\n`;
    robotsTxt += `Sitemap: ${BASE_URL}/sitemap-articles.xml\n`;
    robotsTxt += `Sitemap: ${BASE_URL}/sitemap-events.xml\n`;
    robotsTxt += `Sitemap: ${BASE_URL}/sitemap-resources.xml\n`;
    robotsTxt += `Sitemap: ${BASE_URL}/sitemap-lands.xml\n`;
    robotsTxt += `Sitemap: ${BASE_URL}/sitemap-images.xml\n`;
    robotsTxt += `Sitemap: ${BASE_URL}/sitemap-kings.xml\n`;
    robotsTxt += `Sitemap: ${BASE_URL}/sitemap-poets.xml\n`;
    robotsTxt += `Sitemap: ${BASE_URL}/sitemap-literature.xml\n`;
    robotsTxt += `Sitemap: ${BASE_URL}/sitemap-dance.xml\n`;
    robotsTxt += `Sitemap: ${BASE_URL}/sitemap-temples.xml\n`;
    robotsTxt += `Sitemap: ${BASE_URL}/sitemap-foods.xml\n`;
    robotsTxt += `Sitemap: ${BASE_URL}/sitemap-festivals.xml\n`;
    robotsTxt += `Sitemap: ${BASE_URL}/sitemap-clothing.xml\n`;
    robotsTxt += `Sitemap: ${BASE_URL}/sitemap-science.xml\n`;
    robotsTxt += `Sitemap: ${BASE_URL}/sitemap-dynasties.xml\n`;
    
    fs.writeFileSync(robotsPath, robotsTxt, 'utf8');
    console.log(`✅ Updated robots.txt with all sitemaps\n`);

    await mongoose.disconnect();
    console.log('🎉 All sitemaps generated successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Submit sitemap-index.xml to Google Search Console');
    console.log('   2. Submit to Bing Webmaster Tools');
    console.log('   3. Monitor indexing status\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the generator
generateSitemap();
