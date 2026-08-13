import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from "react-router-dom";
import SEO, { pageSEO } from '../common/SEO';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Container,
  Fade,
  CircularProgress,
} from "@mui/material";
import {
  Add,
} from "@mui/icons-material";
import { useBilingualContent } from "../../utils/bilingualContent";

export default function Kings({ user }) {
  const navigate = useNavigate();
  const getContent = useBilingualContent();
  const { t } = useTranslation();
  const [loading] = useState(false);

  // Dynasty data with emblems
  const dynasties = [
    {
      id: 'pandiya',
      name: { en: 'Pandiya Dynasty', ta: 'பாண்டியர் வம்சம்' },
      period: { en: 'Ancient Tamil Kingdom (600 BCE - 1650 CE)', ta: 'பண்டைய தமிழ் இராச்சியம் (600 கி.மு - 1650 கி.பி)' },
      emblem: '🐟',
      color: '#2E7D32',
      bgColor: '#F1F8E9',
      description: { en: 'Known for their pearl and fish trade', ta: 'முத்து மற்றும் மீன் வர்த்தகத்திற்கு பெயர் பெற்றவர்கள்' }
    },
    {
      id: 'chera',
      name: { en: 'Chera Dynasty', ta: 'சேரர் வம்சம்' },
      period: { en: 'Western Tamil Kingdom (300 BCE - 1102 CE)', ta: 'மேற்கு தமிழ் இராச்சியம் (300 கி.மு - 1102 கி.பி)' },
      emblem: '🏹',
      color: '#FFD700',
      bgColor: '#FFFEF0',
      description: { en: 'Masters of the Western Ghats', ta: 'மேற்கு தொடர்ச்சி மலையின் தலைவர்கள்' }
    },
    {
      id: 'chola',
      name: { en: 'Chola Dynasty', ta: 'சோழர் வம்சம்' },
      period: { en: 'Great Tamil Empire (300 BCE - 1279 CE)', ta: 'பெரும் தமிழ் பேரரசு (300 கி.மு - 1279 கி.பி)' },
      emblem: '🐅',
      color: '#8B0000',
      bgColor: '#FFF5F5',
      description: { en: 'Greatest naval power of ancient India', ta: 'பண்டைய இந்தியாவின் மிகப்பெரிய கடற்படை சக்தி' }
    },
    {
      id: 'pallava',
      name: { en: 'Pallava Dynasty', ta: 'பல்லவர் வம்சம்' },
      period: { en: 'Northern Tamil Kingdom (275 - 897 CE)', ta: 'வடக்கு தமிழ் இராச்சியம் (275 - 897 கி.பி)' },
      emblem: '🦁',
      color: '#DAA520',
      bgColor: '#FFF9E6',
      description: { en: 'Pioneers of Dravidian architecture', ta: 'திராவிட கட்டிடக்கலையின் முன்னோடிகள்' }
    }
  ];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress sx={{ color: "#DAA520" }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      <SEO {...pageSEO.kings} />
      <Box
        sx={{
          mb: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 0 },
          position: 'relative',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: "#8B0000",
              fontFamily: 'Georgia, serif',
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              letterSpacing: 2,
              mb: { xs: 0.5, md: 1 },
              position: 'relative',
              display: 'inline-block',
              textTransform: 'uppercase',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: '120px',
                height: '4px',
                background: 'linear-gradient(90deg, transparent, #DAA520, transparent)',
              },
            }}
          >
            {t('kings.title', 'Kings')}
          </Typography>
        </Box>

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: { xs: 'center', md: 'flex-end' },
          gap: 1
        }}>
          <Typography
            variant="subtitle1"
            sx={{
              color: '#666',
              fontStyle: 'italic',
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              textAlign: { xs: 'center', md: 'right' },
              fontFamily: 'Georgia, serif',
            }}
          >
            {t('kings.subtitle', 'Rulers of Tamil Glory')}
          </Typography>

          {user && user.role === "admin" && (
            <Box
              sx={{
                transition: 'all 0.3s ease',
                mt: 1,
                '&:hover': {
                  transform: 'scale(1.05)',
                  '& button': {
                    boxShadow: '0 8px 20px rgba(139,0,0,0.3)',
                  }
                }
              }}
            >
              <Button
                onClick={() => navigate('/explore/kings/manage')}
                variant="contained"
                startIcon={<Add />}
                sx={{
                  bgcolor: "#8B0000",
                  color: "#fff",
                  fontWeight: 700,
                  transition: 'all 0.3s ease',
                  "&:hover": {
                    bgcolor: "#6B0000",
                    boxShadow: '0 8px 20px rgba(139,0,0,0.3)',
                  },
                  borderRadius: 0,
                  px: 3,
                  py: 1,
                  letterSpacing: 0.5,
                  fontFamily: 'Georgia, serif',
                  whiteSpace: 'nowrap',
                }}
              >
                {t('kings.manage', 'Manage Kings')}
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)'
          },
          gap: { xs: 3, md: 4 },
        }}
      >
        {dynasties.map((dynasty, index) => (
          <Fade
            in={true}
            timeout={500 + index * 150}
            key={dynasty.id}
          >
            <Box
              sx={{
                width: '100%',
                transition: 'all 0.3s ease',
              }}
            >
              <Card
                component={Link}
                to={`/explore/kings/dynasty/${dynasty.id}`}
                sx={{
                  textDecoration: 'none',
                  width: '100%',
                  height: { xs: 460, md: 500 },
                  display: 'flex',
                  flexDirection: 'column',
                  border: 'none',
                  borderRadius: 0,
                  bgcolor: '#fff',
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  position: 'relative',
                  overflow: 'visible',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: -8,
                    left: -8,
                    right: -8,
                    bottom: -8,
                    border: `2px solid ${dynasty.color}`,
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                    zIndex: -1,
                  },
                  "&:hover": {
                    transform: "translateY(-16px)",
                    boxShadow: '0 25px 50px rgba(0,0,0,0.12)',
                    '&::after': {
                      opacity: 1,
                    },
                    "& .temple-image": {
                      transform: 'scale(1.1) rotate(2deg)',
                    },
                    "& .temple-overlay": {
                      opacity: 1,
                    },
                    "& .temple-title": {
                      color: dynasty.color,
                    },
                    "& .view-button": {
                      bgcolor: dynasty.color,
                      color: '#fff',
                      transform: 'translateY(-4px)',
                    },
                  },
                }}
              >
                <Box sx={{ position: 'relative', height: 240, overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                  {dynasty.image ? (
                    <CardMedia
                      component="img"
                      image={dynasty.image}
                      alt={getContent(dynasty.name)}
                      className="temple-image"
                      sx={{
                        objectFit: "cover",
                        width: '100%',
                        height: '100%',
                        transition: 'all 0.6s ease',
                      }}
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3E%3Crect fill='%23e0e0e0' width='400' height='240'%3E%3C/rect%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-size='18px' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: '100%',
                        width: '100%',
                        backgroundColor: '#e0e0e0',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ fontFamily: 'Georgia, serif', fontSize: '1rem' }}
                      >
                        No Image Available
                      </Typography>
                    </Box>
                  )}

                  {/* Gradient Overlay */}
                  <Box
                    className="temple-overlay"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '60%',
                      background: `linear-gradient(to top, ${dynasty.color} 0%, ${dynasty.color}66 50%, transparent 100%)`,
                      opacity: 0.7,
                      transition: 'opacity 0.4s ease',
                    }}
                  />
                </Box>

                <CardContent
                  sx={{
                    p: 3,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    bgcolor: '#fff',
                  }}
                >
                  <Box>
                    <Typography
                      className="temple-title"
                      variant="h5"
                      sx={{
                        fontFamily: 'Georgia, serif',
                        fontWeight: 700,
                        color: "#000",
                        mb: 1.25,
                        lineHeight: 1.12,
                        fontSize: { xs: '1.35rem', md: '1.6rem' },
                        transition: 'color 0.3s ease',
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: -8,
                          left: 0,
                          width: '48px',
                          height: '3px',
                          bgcolor: dynasty.color,
                          borderRadius: 1,
                        }
                      }}
                    >
                      {getContent(dynasty.name)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666",
                        fontStyle: "italic",
                        fontSize: { xs: '0.85rem', md: '0.9rem' },
                        mb: 2,
                        lineHeight: 1.6,
                        fontFamily: 'Georgia, serif',
                      }}
                    >
                      {getContent(dynasty.period)}
                    </Typography>
                  </Box>

                  <Button
                    variant="outlined"
                    fullWidth
                    className="view-button"
                    sx={{
                      bgcolor: 'transparent',
                      color: '#000',
                      borderColor: '#000',
                      borderWidth: 2,
                      borderRadius: 0,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      mt: 'auto',
                      py: 1.2,
                      transition: 'all 0.25s ease',
                      fontFamily: 'Georgia, serif',
                      fontSize: '0.95rem',
                      "&:hover": {
                        borderColor: dynasty.color,
                      }
                    }}
                  >
                    {t('actions.explore', 'Explore').toUpperCase()}
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Fade>
        ))}
      </Box>
    </Container>
  );
}
