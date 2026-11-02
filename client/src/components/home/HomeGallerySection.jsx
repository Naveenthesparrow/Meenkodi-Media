import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../../utils/api';
import cldImg from '../../utils/cloudinaryImage';
import { useBilingualContent } from '../../utils/bilingualContent';

// 1 large (2x2) + 4 small fills the grid exactly: 2 rows on desktop, 4 on phones
const PHOTO_COUNT = 5;

/**
 * Home page "Gallery" band (dark, like "Explore Tamil Heritage"): a mosaic of the
 * gallery's own photos that links to the photos and to /gallery.
 */
export default function HomeGallerySection() {
  const { i18n } = useTranslation();
  const getContent = useBilingualContent();
  const ta = i18n.language === 'ta';
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE_URL}/api/gallery`)
      .then((res) => (res.ok ? res.json() : []))
      .then((items) => {
        if (!active || !Array.isArray(items)) return;
        // One photo per gallery folder (first in the gallery's own order), so the
        // showcase is varied; topped up with further photos if there are few folders
        const all = items.filter((i) => !i.isFolder && i.imageUrl);
        const folderKey = (i) => {
          const name = i.customCategoryName;
          const text = typeof name === 'string' ? name : (name?.en || name?.ta || '');
          return (text || i.category || '').trim().toLowerCase().replace(/[\s_-]+/g, '-');
        };
        const seen = new Set();
        const picked = all.filter((i) => {
          const key = folderKey(i);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        const rest = all.filter((i) => !picked.includes(i));
        setPhotos([...picked, ...rest].slice(0, PHOTO_COUNT));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  if (!photos.length) return null;

  return (
    <Box sx={{ bgcolor: '#0a0908', py: { xs: 10, md: 12 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, md: 6, lg: 8 } }}>
        <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
          <Typography variant="overline" sx={{ color: '#daa520', letterSpacing: 3, fontWeight: 700, fontSize: '0.85rem', mb: 1, display: 'block' }}>
            {ta ? 'காட்சிக் கூடம்' : 'PHOTO GALLERY'}
          </Typography>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.3rem', md: '2.7rem' },
              background: 'linear-gradient(135deg, #fff 0%, #e0e0e0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: -0.5,
            }}
          >
            {ta ? 'நம் மரபின் காட்சிகள்' : 'Heritage in Pictures'}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.65)', mt: 1.5, maxWidth: 620, mx: 'auto', fontSize: { xs: '0.98rem', md: '1.05rem' } }}>
            {ta
              ? 'தலைவர்கள், கோவில்கள், நிகழ்வுகள் மற்றும் நம் மரபின் அரிய புகைப்படங்கள்.'
              : 'Leaders, temples, events and rare photographs of our heritage.'}
          </Typography>
        </Box>

        {/* Mosaic: first photo large, the rest in a grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            gridAutoRows: { xs: 150, sm: 190, md: 210 },
            gap: { xs: 1.2, md: 2 },
          }}
        >
          {photos.map((photo, index) => {
            const name = getContent(photo.name);
            return (
              <Box
                key={photo._id}
                component={Link}
                to={`/gallery/${photo.slug || photo._id}`}
                aria-label={name}
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 2,
                  bgcolor: '#1c1a18',
                  gridColumn: index === 0 ? 'span 2' : 'span 1',
                  gridRow: index === 0 ? 'span 2' : 'span 1',
                  '&:hover img': { transform: 'scale(1.06)' },
                  '&:hover .photo-name': { opacity: 1, transform: 'translateY(0)' },
                }}
              >
                <Box
                  component="img"
                  src={cldImg(photo.imageUrl, index === 0 ? 900 : 500)}
                  alt={name}
                  loading="lazy"
                  decoding="async"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', display: 'block', transition: 'transform 0.5s ease' }}
                />
                <Box
                  className="photo-name"
                  sx={{
                    position: 'absolute',
                    inset: 'auto 0 0 0',
                    p: { xs: 1, md: 1.5 },
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: { xs: '0.8rem', md: '0.95rem' },
                    opacity: { xs: 1, md: 0 },
                    transform: { xs: 'none', md: 'translateY(8px)' },
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {name}
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ textAlign: 'center', mt: { xs: 5, md: 6 } }}>
          <Button
            component={Link}
            to="/gallery"
            variant="outlined"
            endIcon={<ArrowForward />}
            sx={{
              borderRadius: '999px',
              px: 4.6,
              py: 1.1,
              fontWeight: 700,
              letterSpacing: 0.7,
              textTransform: 'none',
              borderWidth: 2,
              borderColor: '#daa520',
              color: '#daa520',
              '&:hover': { borderWidth: 2, borderColor: '#daa520', bgcolor: '#daa520', color: '#0a0908' },
            }}
          >
            {ta ? 'காட்சிக் கூடத்தைக் காண்க' : 'View the Gallery'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
