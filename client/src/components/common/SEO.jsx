import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

/**
 * SEO Component - Dynamically updates meta tags for each page using react-helmet-async
 * Usage: <SEO title="Page Title" description="Page Description" keywords="key1, key2" />
 */
export default function SEO({ 
  title, 
  description, 
  keywords, 
  image, 
  url,
  type = 'website',
  author = 'Meenkodi Tamil Heritage Foundation',
  schema,
  tags = []
}) {
  const location = useLocation();
  const baseUrl = 'https://www.meenkodi.com';
  
  const fullUrl = url || `${baseUrl}${location.pathname}`;
  const fullTitle = title ? `${title} | Meenkodi Tamil Heritage` : 'Meenkodi - Tamil Heritage Foundation | 5000+ Years of Tamil Culture';
  const defaultDescription = 'Meenkodi preserves and shares 5000+ years of Tamil civilization — history, temples, dynasties (Pandiya, Chola, Chera , Pallava), cultural traditions, and archaeological discoveries. Explore the stories of the Southerns (தென்புலத்தார் / தென்னவர்), Pandiyargal, temple architecture, Sangam literature, festivals, and living heritage across International and the Tamil diaspora.';
  const metaDescription = description || defaultDescription;
  const metaImage = image || `${baseUrl}/logo.png`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content={author} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content="Meenkodi - Pandiya Heritage" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="ta_IN" />

      {/* Article Tags for content pages */}
      {tags.length > 0 && tags.map((tag, index) => (
        <meta key={`article-tag-${index}`} property="article:tag" content={tag} />
      ))}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={metaDescription} />
      <meta property="twitter:image" content={metaImage} />
      <meta property="twitter:image:alt" content={fullTitle} />
      <meta name="twitter:site" content="@meenkodi" />
      <meta name="twitter:creator" content="@meenkodi" />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />

      {/* Custom JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
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
  
  seedsandfootprints: {
    title: 'Seeds & Footprints',
    description: 'Archaeological discoveries, historical evidence, and Tamil heritage traces across different countries and continents. Documenting the seeds of Tamil civilization and footprints of our ancestors.',
    keywords: 'Tamil Archaeology, Heritage Discoveries, Tamil History, Cultural Evidence, Archaeological Finds, Tamil Diaspora, Heritage Documentation'
  },

  lands: {
    title: 'Five Tinai Lands of Tamil Heritage',
    description: 'Explore the five classical eco-cultural regions: Kurinji (mountains), Mullai (forests), Marutham (plains), Neithal (coast), and Palai (desert). Discover ancient Tamil geography.',
    keywords: 'Tamil Tinai, Kurinji, Mullai, Marutham, Neithal, Palai, Tamil Geography, Sangam Landscape'
  },

  ancientScience: {
    title: 'Ancient Tamil Science & Technology',
    description: 'Discover Tamil contributions to astronomy, mathematics, medicine, metallurgy, and engineering. Explore ancient scientific innovations and technological achievements.',
    keywords: 'Tamil Science, Ancient Technology, Tamil Astronomy, Siddha Medicine, Tamil Mathematics, Ancient Engineering'
  },

  clothing: {
    title: 'Traditional Tamil Clothing & Textiles',
    description: 'Explore traditional Tamil attire, weaving techniques, and textile heritage. From silk sarees to cotton veshtis, discover the rich fabric traditions of Tamil Nadu.',
    keywords: 'Tamil Clothing, Traditional Dress, Tamil Textiles, Kanchipuram Silk, Tamil Sarees, Traditional Attire'
  },

  articles: {
    title: 'Tamil Heritage Articles & Stories',
    description: 'Read in-depth articles, research papers, and stories about Tamil culture, history, traditions, and heritage. Educational content for learners and enthusiasts.',
    keywords: 'Tamil Articles, Heritage Stories, Tamil History, Cultural Research, Tamil Education, Heritage Articles'
  },

  dynasties: {
    title: 'Tamil Dynasties & Royal Lineages',
    description: 'Explore the great Tamil dynasties, their rulers, achievements, and legacy. From ancient kingdoms to medieval empires that shaped South Indian history.',
    keywords: 'Tamil Dynasties, Chola Kings, Pandya Kings, Pallava Dynasty, Tamil Rulers, Royal Lineages, Tamil Kingdoms'
  }
};
