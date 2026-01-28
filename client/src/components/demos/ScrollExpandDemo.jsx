import React, { useState, useEffect } from 'react';
import { Box, Button, ButtonGroup, Container, Typography } from '@mui/material';
import ScrollExpandMedia from '../common/ScrollExpandMedia';
import API_BASE_URL from '../../utils/api';

const ScrollExpandDemo = () => {
  const [lands, setLands] = useState([]);
  const [selectedLand, setSelectedLand] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/lands`)
      .then((res) => res.json())
      .then((data) => {
        setLands(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch lands:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedLand]);

  if (loading || lands.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const currentLand = lands[selectedLand];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Land Switcher */}
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <ButtonGroup orientation="vertical" variant="contained">
          {lands.map((land, index) => (
            <Button
              key={land._id}
              onClick={() => setSelectedLand(index)}
              sx={{
                bgcolor: selectedLand === index ? '#fff' : 'rgba(0,0,0,0.6)',
                color: selectedLand === index ? '#000' : '#fff',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                '&:hover': {
                  bgcolor: selectedLand === index ? '#fff' : 'rgba(0,0,0,0.8)',
                },
              }}
            >
              {land.type}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* ScrollExpandMedia */}
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc={currentLand.image}
        bgImageSrc={currentLand.image}
        title={currentLand.name?.en || currentLand.name}
        date={currentLand.type?.toUpperCase()}
        scrollToExpand="Scroll to Explore the Ancient Tamil Lands ↓"
        textBlend={true}
      >
        <Container maxWidth="lg">
          <Box sx={{ bgcolor: '#fff', p: 6, borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 4, fontFamily: '"Playfair Display", serif' }}>
              About {currentLand.type}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.2rem', lineHeight: 1.8, mb: 4 }}>
              {currentLand.description?.en || currentLand.description}
            </Typography>

            {currentLand.gods && currentLand.gods.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Deity
                </Typography>
                <Typography variant="body1">{currentLand.gods.join(', ')}</Typography>
              </Box>
            )}

            {currentLand.people && currentLand.people.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  People
                </Typography>
                <Typography variant="body1">{currentLand.people.join(', ')}</Typography>
              </Box>
            )}

            {currentLand.flora && currentLand.flora.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Flora
                </Typography>
                <Typography variant="body1">{currentLand.flora.join(', ')}</Typography>
              </Box>
            )}

            {currentLand.fauna && currentLand.fauna.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Fauna
                </Typography>
                <Typography variant="body1">{currentLand.fauna.join(', ')}</Typography>
              </Box>
            )}

            {currentLand.poetry && currentLand.poetry.length > 0 && (
              <Box
                sx={{
                  mt: 6,
                  p: 4,
                  bgcolor: '#f5f5f5',
                  borderRadius: 3,
                  borderLeft: '4px solid #000',
                }}
              >
                <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: 2 }}>
                  Classical Poetry
                </Typography>
                {currentLand.poetry.map((line, idx) => (
                  <Typography
                    key={idx}
                    variant="h6"
                    sx={{
                      fontFamily: '"Playfair Display", serif',
                      fontStyle: 'italic',
                      mt: 2,
                    }}
                    dangerouslySetInnerHTML={{ __html: line }}
                  />
                ))}
              </Box>
            )}

            <Typography variant="body2" sx={{ mt: 6, color: '#666', fontStyle: 'italic' }}>
              This is a demonstration of the ScrollExpandMedia component showcasing the Five Tamil Lands (Ainthinai).
              Switch between different lands using the buttons on the right.
            </Typography>
          </Box>
        </Container>
      </ScrollExpandMedia>
    </Box>
  );
};

export default ScrollExpandDemo;
