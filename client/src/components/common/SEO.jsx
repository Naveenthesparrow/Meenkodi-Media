import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * SEO Component - Dynamically updates meta tags for each page
 * Usage: <SEO title="Page Title" description="Page Description" />
 */
export default function SEO({ 
  title, 
  description, 
  keywords, 
  image, 
  url,
  type = 'website',
  author,
  schema
}) {
  const location = useLocation();
  const baseUrl = 'https://meenkodi.com';
  
  const fullUrl = url || `${baseUrl}${location.pathname}`;
  const fullTitle = title ? `${title} | Meenkodi Tamil Heritage` : 'Meenkodi - Tamil Heritage Foundation | 5000+ Years of Tamil Culture';
  const defaultDescription = 'Explore 5000+ years of Tamil civilization from Attirampakkam stone tools to Sangam ports. Discover ancient temples, Chola art, Thirukkural wisdom, and living Tamil heritage.';
  const metaDescription = description || defaultDescription;
  const metaImage = image || `${baseUrl}/src/assests/meenkodi.png`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (property, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Primary meta tags
    updateMetaTag('title', fullTitle);
    updateMetaTag('description', metaDescription);
    
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }
    
    if (author) {
      updateMetaTag('author', author);
    }

    // Open Graph meta tags
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', fullUrl, true);
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', metaDescription, true);
    updateMetaTag('og:image', metaImage, true);
    updateMetaTag('og:site_name', 'Meenkodi Tamil Heritage', true);

    // Twitter meta tags
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:url', fullUrl, true);
    updateMetaTag('twitter:title', fullTitle, true);
    updateMetaTag('twitter:description', metaDescription, true);
    updateMetaTag('twitter:image', metaImage, true);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', fullUrl);

    // Add custom JSON-LD schema if provided
    if (schema) {
      const scriptId = 'custom-schema-' + location.pathname.replace(/\//g, '-');
      let schemaScript = document.getElementById(scriptId);
      
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = scriptId;
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      
      schemaScript.textContent = JSON.stringify(schema);
    }

  }, [fullTitle, metaDescription, fullUrl, metaImage, type, keywords, author, schema, location.pathname]);

  return null; // This component doesn't render anything
}

// Predefined SEO configurations for common pages
export const pageSEO = {
  home: {
    title: 'Home',
    description: 'Explore 5000+ years of Tamil civilization from Attirampakkam stone tools to Sangam ports. Discover ancient temples, Chola art, Thirukkural wisdom, classical dance, and living Tamil heritage.',
    keywords: 'Tamil Heritage, Tamil Culture, Tamil History, Chola Dynasty, Pandya Dynasty, Tamil Temples, Sangam Literature'
  },
  
  explore: {
    title: 'Explore Tamil Heritage',
    description: 'Discover Tamil temples, kings, literature, classical dance, traditional cuisine, festivals, clothing, and ancient science. Explore the rich cultural tapestry of Tamil Nadu.',
    keywords: 'Tamil Temples, Tamil Kings, Tamil Literature, Bharatanatyam, Tamil Food, Tamil Festivals, Traditional Clothing'
  },
  
  temples: {
    title: 'Ancient Tamil Temples',
    description: 'Explore magnificent Dravidian temple architecture from Brihadeeswarar to Meenakshi Temple. Discover 1000+ years of granite artistry, bronze casting, and sacred traditions.',
    keywords: 'Tamil Temples, Brihadeeswarar Temple, Meenakshi Temple, Dravidian Architecture, Chola Temples, Temple Art'
  },
  
  kings: {
    title: 'Tamil Kings & Dynasties',
    description: 'Trace the legacy of Chola, Pandya, Pallava, and Chera dynasties. Explore maritime empires, architectural marvels, and administrative innovations that shaped South India.',
    keywords: 'Chola Dynasty, Pandya Dynasty, Pallava Dynasty, Tamil Kings, Tamil Empire, South Indian History'
  },
  
  literature: {
    title: 'Tamil Literature & Sangam Poetry',
    description: 'Dive into Thirukkural wisdom, Sangam poetry, and Tamil literary classics. Explore 2000+ years of philosophical thought and poetic excellence.',
    keywords: 'Thirukkural, Sangam Literature, Tamil Poetry, Kambaramayanam, Tamil Classics, Ancient Tamil Literature'
  },
  
  dance: {
    title: 'Tamil Classical Dance & Performing Arts',
    description: 'Experience Bharatanatyam, Karagattam, and traditional Tamil performing arts. Learn about temple dance traditions, rhythmic patterns, and cultural expressions.',
    keywords: 'Bharatanatyam, Tamil Dance, Classical Dance, Karagattam, Temple Dance, Tamil Performing Arts'
  },
  
  foods: {
    title: 'Traditional Tamil Cuisine',
    description: 'Savor authentic Tamil recipes, traditional cooking methods, and regional specialties. Explore the culinary heritage of Tamil Nadu from ancient to modern times.',
    keywords: 'Tamil Food, Tamil Cuisine, South Indian Food, Tamil Recipes, Traditional Cooking, Tamil Culinary Heritage'
  },
  
  festivals: {
    title: 'Tamil Festivals & Celebrations',
    description: 'Celebrate Pongal, Chithirai, and other vibrant Tamil festivals. Discover rituals, customs, and cultural significance of Tamil celebrations throughout the year.',
    keywords: 'Tamil Festivals, Pongal, Chithirai Festival, Tamil Celebrations, Tamil Traditions, Cultural Festivals'
  },
  
  events: {
    title: 'Cultural Events & Workshops',
    description: 'Join workshops, lectures, and cultural events celebrating Tamil heritage. Participate in hands-on learning experiences and community gatherings.',
    keywords: 'Tamil Events, Cultural Workshops, Heritage Events, Tamil Lectures, Community Programs'
  },
  
  gallery: {
    title: 'Heritage Photo Gallery',
    description: 'Browse stunning photography of Tamil temples, landscapes, festivals, and cultural moments. Visual journey through Tamil Nadu\'s living heritage.',
    keywords: 'Tamil Photos, Temple Photography, Tamil Culture Photos, Heritage Gallery, Tamil Nadu Images'
  },
  
  resources: {
    title: 'Learning Resources & Archives',
    description: 'Access educational materials, research papers, manuscripts, and archival content about Tamil heritage, history, and culture.',
    keywords: 'Tamil Resources, Heritage Archives, Tamil Research, Educational Materials, Tamil Manuscripts'
  },
  
  lands: {
    title: 'Five Tinai Lands of Tamil Heritage',
    description: 'Explore the five classical eco-cultural regions: Kurinji (mountains), Mullai (forests), Marutham (plains), Neithal (coast), and Palai (desert). Discover ancient Tamil geography.',
    keywords: 'Tamil Tinai, Kurinji, Mullai, Marutham, Neithal, Palai, Tamil Geography, Sangam Landscape'
  }
};
