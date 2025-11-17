import React from 'react';
import { Box, Container, Grid, Typography, Stack, IconButton, Divider } from '@mui/material';
import { Instagram, Twitter, Facebook, YouTube } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { i18n } = useTranslation();
  const lang = i18n?.language === 'ta' ? 'ta' : 'en';

  const CONTENT = {
    en: {
      overline: 'Contact Information',
      title: 'Get in Touch',
      p1: "We'd love to hear from you! Whether you have a question, a collaboration proposal, or just want to say hello, our team is ready to assist.",
      p2: 'Visit any of our collaboration centres or reach us through the direct channels below. We actively support museums, archives, researchers, and community trusts across India.'
    },
    ta: {
      overline: 'தொடர்பு தகவல்கள்',
      title: 'எங்களைத் தொடர்புகொள்வது',
      p1: 'உங்களிடமிருந்து வாருங்கள்! கேள்வி, ஒருங்கிணைப்பு முன்மொழிவு அல்லது வணக்கம் சொல்ல விரும்பினால், எங்கள் குழு உதவ தயாராக உள்ளது.',
      p2: 'எமது ஒத்துழைப்பு மையங்களுக்குச் செல்லவோ கீழ்காணும் நேரடி சேனல்கள் மூலம் எங்களை அணுகவோ செய்யலாம். இந்தியாவின் அருங்காட்சியகங்கள், காணொளி நிலையங்கள், ஆராய்ச்சியாளர்கள் மற்றும் சமூக நம்பிக்கைகள் ஆகியவற்றுக்கு நாங்கள் ஆதரவளிக்கின்றோம்.'
    }
  };

  return (
    <Box sx={{ bgcolor: '#000', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            bgcolor: 'transparent',
            borderRadius: { xs: 3, md: 4 },
            p: { xs: 4, md: 6 },
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.02)'
          }}
        >
          <Grid container spacing={4} alignItems="flex-start">
            <Grid item xs={12} md={9}>
              <Typography
                variant="overline"
                sx={{
                  color: '#DAA520',
                  letterSpacing: 3,
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'block',
                  mb: 1
                }}
              >
                {CONTENT[lang].overline}
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: 'Playfair Display, serif',
                  fontWeight: 700,
                  color: '#fff',
                  fontSize: { xs: '1.9rem', md: '2.6rem' },
                  mb: 2
                }}
              >
                {CONTENT[lang].title}
              </Typography>
              <Typography variant="body1" sx={{ color: '#d0cfcf', mb: 1.5, maxWidth: 900 }}>
                {CONTENT[lang].p1}
              </Typography>
              <Typography variant="body2" sx={{ color: '#bdbbbb', mb: 2, maxWidth: 900 }}>
                {CONTENT[lang].p2}
              </Typography>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)', my: 2 }} />
            </Grid>

            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'center' }, alignItems: 'center', height: '100%' }}>
                <Stack direction="row" spacing={2}>
                  {[{
                    href: 'https://www.instagram.com/the_meenkodi/', Icon: Instagram
                  },{
                    href: 'https://twitter.com/', Icon: Twitter
                  },{
                    href: 'https://www.facebook.com/', Icon: Facebook
                  },{
                    href: 'https://www.youtube.com/@the_Meenkodi', Icon: YouTube
                  }].map((s, i) => (
                    <IconButton
                      key={i}
                      component="a"
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="social"
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: 'rgba(0,0,0,0.45)',
                        border: '1px solid rgba(218,165,32,0.14)',
                        color: '#DAA520',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          bgcolor: 'rgba(255,255,255,0.02)',
                          boxShadow: '0 8px 26px rgba(218,165,32,0.06)'
                        },
                        transition: 'all 200ms ease'
                      }}
                    >
                      <s.Icon fontSize="small" />
                    </IconButton>
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
