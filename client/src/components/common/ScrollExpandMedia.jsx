import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Box, Typography, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

const MediaWrapper = styled(Box)({
  position: 'relative',
  width: '100%',
  minHeight: '100vh',
  overflow: 'hidden',
});

const BackgroundImage = styled(motion.div)({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100vh',
  zIndex: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
});

const MediaContainer = styled(motion.div)({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 10,
  borderRadius: '24px',
  overflow: 'hidden',
  boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.6)',
  willChange: 'transform, width, height, border-radius',
  maxWidth: 'calc(100vw - 80px)',
});

const CardTextOverlay = styled(motion.div)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  zIndex: 20,
  transform: 'translate(-50%, -50%)',
  width: 'clamp(320px, 60vw, 700px)',
  maxWidth: '90vw',
  padding: 'clamp(2.2rem, 6vw, 3.8rem) clamp(1.5rem, 4vw, 3.2rem)',
  borderRadius: '32px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'auto',
});

const ContentSection = styled(Box)({
  position: 'relative',
  zIndex: 20,
  minHeight: '100vh',
  paddingTop: '100vh',
});

const ScrollExpandMedia = ({
  mediaType = 'image',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  landType, // pass landType prop (e.g., 'kurinji')
  scrollToExpand,
  textBlend = false,
  lang = 'en',
  children
}) => {
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Scroll progress tracking
    const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ['start start', 'end start'],
    });

    // Media expansion animation - more dramatic
    const initialWidth = Math.min(dimensions.width * 0.6, 800);
    const initialHeight = initialWidth * 0.5625; // 16:9 aspect ratio

  // Prevent the expanded media from touching viewport edges
  const endWidth = Math.max(dimensions.width - 80, initialWidth);
  const endHeight = Math.min(dimensions.height, endWidth * 0.5625);

  const mediaWidth = useTransform(
    scrollYProgress,
    [0, 0.6],
    [initialWidth, endWidth]
  );

  const mediaHeight = useTransform(
    scrollYProgress,
    [0, 0.6],
    [initialHeight, endHeight]
  );

  const mediaBorderRadius = useTransform(
    scrollYProgress,
    [0, 0.6],
    [24, 0]
  );

  // Text fade out animation - faster
  const titleOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
    const titleY = useTransform(scrollYProgress, [0, 0.25], [0, -30]);

    // Preserve translateX while animating Y: compose a transform string that keeps -50% baseline
    const overlayTransform = useTransform(titleY, (v) => `translate(-50%, calc(-50% + ${v}px))`);
    const bgOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
    const bgBlur = useTransform(scrollYProgress, [0, 0.6], [0, 20]);

    const subheading = t(`lands.${(landType || '').toLowerCase()}.subheading`);

    return (
      <Box ref={containerRef} sx={{ position: 'relative', minHeight: '200vh' }}>
        {/* Background Image */}
        <BackgroundImage
          style={{
            backgroundImage: `url(${bgImageSrc})`,
            opacity: bgOpacity,
            filter: useTransform(bgBlur, (v) => `blur(${v}px)`),
          }}
        />

        {/* Expanding Media with Text Overlay */}
        <MediaContainer
          style={{
            width: mediaWidth,
            height: mediaHeight,
            borderRadius: useTransform(mediaBorderRadius, (v) => `${v}px`),
          }}
        >
          {mediaType === 'video' ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              poster={posterSrc}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            >
              <source src={mediaSrc} type="video/mp4" />
            </video>
          ) : (
            <Box
              component="img"
              src={mediaSrc}
              alt={title}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          )}

          {/* Gradient overlay for text blend */}
          {textBlend && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '40%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Card Text Overlay */}
          <CardTextOverlay
            style={{
              opacity: titleOpacity,
              transform: overlayTransform,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontSize: 'clamp(3rem, 6vw, 7.2rem)',
                  fontWeight: 800,
                  color: 'rgba(255,255,255,0.98)',
                  mb: { xs: 1.5, md: 2.5 },
                  textShadow: '0 10px 30px rgba(0,0,0,0.8)',
                  fontFamily: '"Playfair Display", serif',
                  lineHeight: 0.92,
                  letterSpacing: '-0.02em',
                  overflowWrap: 'anywhere',
                  textAlign: 'center',
                }}
              >
                {title}
              </Typography>
              {subheading && (
                <Typography
                  variant={lang === 'ta' ? 'h5' : 'subtitle1'}
                  sx={{
                    fontSize: lang === 'ta' ? 'clamp(1.1rem, 2.2vw, 1.7rem)' : 'clamp(1.05rem, 2vw, 1.3rem)',
                    fontWeight: lang === 'ta' ? 600 : 500,
                    color: 'rgba(255,255,255,0.96)',
                    mb: { xs: 2.5, md: 4 },
                    letterSpacing: lang === 'ta' ? '0.04em' : '0.01em',
                    textShadow: '0 6px 18px rgba(0,0,0,0.65)',
                    fontFamily: lang === 'ta' ? 'Noto Sans Tamil, sans-serif' : undefined,
                    textAlign: 'center',
                  }}
                >
                  {subheading}
                </Typography>
              )}
            </motion.div>
          </CardTextOverlay>
          {/* Scroll to Explore below card */}
          <Box sx={{
            position: 'absolute',
            left: '50%',
            bottom: 24,
            transform: 'translateX(-50%)',
            zIndex: 30,
          }}>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.2rem' },
                color: 'rgba(255,255,255,0.93)',
                textTransform: 'capitalize',
                letterSpacing: '0.12em',
                fontWeight: 400,
                px: 2,
                borderRadius: '1.5rem',
                background: 'rgba(30,30,40,0.22)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                display: 'inline-block',
                animation: 'fadeUpDown 2.5s ease-in-out infinite',
                '@keyframes fadeUpDown': {
                  '0%, 100%': { opacity: 0.7, transform: 'translateY(0)' },
                  '50%': { opacity: 1, transform: 'translateY(-8px)' },
                },
              }}
            >
              {scrollToExpand}
            </Typography>
          </Box>
        </MediaContainer>

        {/* Content Section */}
        <ContentSection>
          <Box sx={{ width: '100%', py: { xs: 6, md: 10 } }}>
            {children}
          </Box>
        </ContentSection>
      </Box>
    );
  };

export default ScrollExpandMedia;
