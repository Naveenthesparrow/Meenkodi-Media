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

const BASE_URL = 'https://www.meenkodi.com';

// Static pages with their priorities and change frequencies
const staticPages = [
  { url: '/', priority: 1.0, changefreq: 'weekly' },
  { url: '/explore', priority: 0.8, changefreq: 'weekly' },
  { url: '/gallery', priority: 0.8, changefreq: 'daily' },
  { url: '/articles', priority: 0.8, changefreq: 'daily' },
  { url: '/events', priority: 0.7, changefreq: 'weekly' },
  { url: '/resources', priority: 0.7, changefreq: 'weekly' },
  { url: '/faq', priority: 0.5, changefreq: 'monthly' },
  { url: '/explore/kings', priority: 0.64, changefreq: 'monthly' },
  { url: '/explore/literature', priority: 0.64, changefreq: 'monthly' },
  { url: '/explore/dance', priority: 0.64, changefreq: 'monthly' },
  { url: '/explore/temples', priority: 0.64, changefreq: 'monthly' },
  { url: '/explore/foods', priority: 0.64, changefreq: 'monthly' },
  { url: '/explore/festivals', priority: 0.64, changefreq: 'monthly' },
  { url: '/explore/clothing', priority: 0.64, changefreq: 'monthly' },
  { url: '/explore/ancientscience', priority: 0.64, changefreq: 'monthly' },
  { url: '/explore/lands/kurinji', priority: 0.64, changefreq: 'monthly' },
  { url: '/explore/lands/mullai', priority: 0.64, changefreq: 'monthly' },
  { url: '/explore/lands/marutham', priority: 0.9, changefreq: 'monthly' },
  { url: '/explore/lands/neithal', priority: 0.64, changefreq: 'monthly' },
  { url: '/explore/lands/palai', priority: 0.64, changefreq: 'monthly' },
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

    console.log(`\n📊 Content Summary:`);
    console.log(`   - ${galleryItems.length} gallery items`);
    console.log(`   - ${articles.length} published articles`);
    console.log(`   - ${events.length} events`);
    console.log(`   - ${resources.length} resources\n`);

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
