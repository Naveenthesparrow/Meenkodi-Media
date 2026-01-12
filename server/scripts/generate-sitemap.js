/**
 * Dynamic Sitemap Generator for Meenkodi Tamil Heritage
 * 
 * This script generates a comprehensive sitemap.xml including:
 * - Static pages (home, explore, gallery, etc.)
 * - Dynamic gallery items (for SEO indexing)
 * - Dynamic article pages
 * - Dynamic event pages
 * 
 * Run this script after adding new content to update the sitemap:
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

async function generateSitemap() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Fetch dynamic content
    const galleryItems = await Gallery.find({}).select('_id name description keywords imageUrl createdAt updatedAt').lean();
    const articles = await Article.find({}).select('_id slug createdAt updatedAt').lean();
    const events = await Event.find({}).select('_id slug createdAt updatedAt').lean();

    console.log(`Found ${galleryItems.length} gallery items, ${articles.length} articles, ${events.length} events`);

    // Start building sitemap
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

    // Add gallery items (main sitemap)
    galleryItems.forEach(item => {
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}/gallery/${item._id}</loc>\n`;
      xml += `    <lastmod>${formatDate(item.updatedAt || item.createdAt)}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });

    // Add articles
    articles.forEach(article => {
      const slug = article.slug || article._id;
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}/articles/${slug}</loc>\n`;
      xml += `    <lastmod>${formatDate(article.updatedAt || article.createdAt)}</lastmod>\n`;
      xml += '    <changefreq>monthly</changefreq>\n';
      xml += '    <priority>0.75</priority>\n';
      xml += '  </url>\n';
    });

    // Add events
    events.forEach(event => {
      const slug = event.slug || event._id;
      xml += '  <url>\n';
      xml += `    <loc>${BASE_URL}/events/${slug}</loc>\n`;
      xml += `    <lastmod>${formatDate(event.updatedAt || event.createdAt)}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    // Write main sitemap
    const sitemapPath = path.join(__dirname, '../../client/public/sitemap.xml');
    fs.writeFileSync(sitemapPath, xml, 'utf8');
    console.log(`✅ Sitemap generated: ${sitemapPath}`);

    // Generate image sitemap
    const imageSitemap = generateImageSitemap(galleryItems);
    const imageSitemapPath = path.join(__dirname, '../../client/public/sitemap-images.xml');
    fs.writeFileSync(imageSitemapPath, imageSitemap, 'utf8');
    console.log(`✅ Image sitemap generated: ${imageSitemapPath}`);

    // Update robots.txt to include both sitemaps
    const robotsPath = path.join(__dirname, '../../client/public/robots.txt');
    let robotsTxt = fs.readFileSync(robotsPath, 'utf8');
    
    if (!robotsTxt.includes('sitemap-images.xml')) {
      robotsTxt += `\nSitemap: ${BASE_URL}/sitemap-images.xml\n`;
      fs.writeFileSync(robotsPath, robotsTxt, 'utf8');
      console.log(`✅ Updated robots.txt with image sitemap`);
    }

    await mongoose.disconnect();
    console.log('✅ All done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

// Run the generator
generateSitemap();
