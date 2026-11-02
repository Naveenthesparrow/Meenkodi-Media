import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowForward from '@mui/icons-material/ArrowForward';
import Edit from '@mui/icons-material/Edit';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../../utils/api';
import cldImg from '../../utils/cloudinaryImage';
import { useBilingualContent } from '../../utils/bilingualContent';
import HomeShowcaseEditor from './HomeShowcaseEditor';

/**
 * Home page "Heritage in Pictures" band (dark, like "Explore Tamil Heritage").
 * Its photos are chosen by admins (Edit button), separately from the Gallery:
 * the first photo is the large tile. Shapes: all tiles are 3:2 landscape.
 */
export default function HomeGallerySection({ user }) {
  const { i18n } = useTranslation();
  const getContent = useBilingualContent();
  const ta = i18n.language === 'ta';
  const isAdmin = user && user.role === 'admin';
  const [photos, setPhotos] = useState([]);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE_URL}/api/home-showcase`)
      .then((res) => (res.ok ? res.json() : { photos: [] }))
      .then((data) => { if (active) setPhotos(Array.isArray(data.photos) ? data.photos : []); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  // Visitors see nothing until photos are chosen; admins see the empty band with the Edit button
  if (!photos.length && !isAdmin) return null;

  return (
    <Box sx={{ bgcolor: '#0a0908', py: { xs: 10, md: 12 }, position: 'relative' }}>
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
          {isAdmin && (
            <Button
              onClick={() => setEditing(true)}
              startIcon={<Edit />}
              variant="outlined"
              size="small"
              sx={{ mt: 2.5, color: '#daa520', borderColor: 'rgba(218,165,32,0.6)', textTransform: 'none', '&:hover': { borderColor: '#daa520' } }}
            >
              {ta ? 'புகைப்படங்களை மாற்று' : 'Edit photos'}
            </Button>
          )}
        </Box>

        {photos.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gridAutoRows: { xs: 150, sm: 190, md: 210 },
              gap: { xs: 1.2, md: 2 },
            }}
          >
            {photos.map((photo, index) => {
              const name = getContent(photo.title);
              const tile = (
                <>
                  <Box
                    component="img"
                    src={cldImg(photo.image, index === 0 ? 1200 : 700)}
                    alt={name || 'Meenkodi heritage photo'}
                    loading="lazy"
                    decoding="async"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: photo.focus || 'center 20%', display: 'block', transition: 'transform 0.5s ease' }}
                  />
                  {name && (
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
                  )}
                </>
              );
              const tileSx = {
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
                bgcolor: '#1c1a18',
                display: 'block',
                gridColumn: index === 0 ? 'span 2' : 'span 1',
                gridRow: index === 0 ? 'span 2' : 'span 1',
                '&:hover img': { transform: 'scale(1.06)' },
                '&:hover .photo-name': { opacity: 1, transform: 'translateY(0)' },
              };
              // Own link if set, otherwise the photo's copy in the Gallery folder
              const href = photo.link || (photo.gallerySlug ? `/gallery/${photo.gallerySlug}` : '');
              return href ? (
                <Box key={index} component={Link} to={href} aria-label={name} sx={tileSx}>{tile}</Box>
              ) : (
                <Box key={index} sx={tileSx}>{tile}</Box>
              );
            })}
          </Box>
        )}

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

      {isAdmin && (
        <HomeShowcaseEditor
          open={editing}
          photos={photos}
          onClose={() => setEditing(false)}
          onSaved={(saved) => { setPhotos(saved); setEditing(false); }}
        />
      )}
    </Box>
  );
}
