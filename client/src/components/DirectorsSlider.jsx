import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Box, Typography, Avatar, IconButton, Divider } from '@mui/material';
import { Twitter } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const DirectorsSlider = ({ directors }) => {
  const { i18n } = useTranslation();
  const quantity = directors.length;

  return (
    <SliderContainer style={{ '--width': '280px', '--height': '340px', '--quantity': quantity }}>
      <div className="list">
        {directors.map((member, index) => (
          <div className="item" style={{ '--position': index + 1 }} key={index}>
            <div className="card">
              <Box
                sx={{
                  position: "relative",
                  width: 110,
                  height: 110,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1.5
                }}
              >
                {/* Double Ring Effect */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "1px solid rgba(218, 165, 32, 0.3)",
                    transform: "scale(1.1)",
                    transition: "transform 0.4s ease"
                  }}
                  className="outer-ring"
                />
                <Avatar
                  src={member.image}
                  sx={{
                    width: 96,
                    height: 96,
                    border: "3px solid #fff",
                    boxShadow: "0 8px 24px rgba(139,0,0,0.15)",
                    '& img': {
                      objectFit: 'cover',
                      objectPosition: member.imagePosition || 'center top'
                    }
                  }}
                />
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, flexGrow: 1, width: '100%' }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "'Playfair Display', serif", // Serif font for heritage feel
                    fontWeight: 700,
                    color: "#8B0000", // Dark Red
                    fontSize: "1.15rem",
                    textAlign: 'center',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {member.name[i18n.language] || member.name.en}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: "#DAA520", // Gold
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    mb: 0.5
                  }}
                >
                  {/* Decorative separator */}
                  ✦
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#4a4a4a",
                    fontSize: "0.85rem",
                    lineHeight: 1.5,
                    textAlign: 'center',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontFamily: "'Inter', sans-serif"
                  }}
                >
                  {member.title[i18n.language] || member.title.en}
                </Typography>
              </Box>

              <Box sx={{ pt: 1 }}>
                <IconButton
                  size="small"
                  sx={{
                    color: "#8B0000",
                    bgcolor: "rgba(139,0,0,0.05)",
                    width: 34,
                    height: 34,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "#8B0000",
                      color: "#fff",
                      transform: "translateY(-2px)"
                    },
                  }}
                >
                  <Twitter sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </div>
          </div>
        ))}
      </div>
    </SliderContainer>
  );
};

const autoRun = keyframes`
  from {
    left: 100%;
  }
  to {
    left: calc(var(--width) * -1);
  }
`;

const SliderContainer = styled.div`
  width: 100%;
  height: var(--height);
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent, #000 10% 90%, transparent);
  
  .list {
    display: flex;
    width: 100%;
    min-width: calc(var(--width) * var(--quantity));
    position: relative;
  }

  .item {
    width: var(--width);
    height: var(--height);
    position: absolute;
    left: 100%;
    animation: ${autoRun} 30s linear infinite; /* Adjusted duration for better readability */
    transition: filter 0.5s;
    animation-delay: calc(
      (30s / var(--quantity)) * (var(--position) - 1) - 30s
    ) !important;
    padding: 15px 8px; /* Balanced spacing */
  }

  .card {
    width: 100%;
    height: 100%;
    padding: 24px 20px;
    background: linear-gradient(180deg, #ffffff 0%, #fffbf2 100%); /* Warm off-white gradient */
    border: 1px solid rgba(218, 165, 32, 0.15);
    border-radius: 16px; /* Slightly sharper corners for a classic look */
    box-shadow: 0 4px 15px rgba(139, 0, 0, 0.03);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); /* Spring-like transition */
    position: relative;
    overflow: hidden;
  }

  /* Elegant top border */
  .card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: #8B0000;
    transform: scaleX(0);
    transition: transform 0.4s ease;
    transform-origin: left;
  }

  &:hover .item {
    animation-play-state: paused !important;
    filter: grayscale(1);
  }

  .item:hover {
    filter: grayscale(0);
    z-index: 10;
  }
  
  .item:hover .card {
    transform: translateY(-10px);
    box-shadow: 0 20px 50px rgba(139, 0, 0, 0.12);
    border-color: rgba(218, 165, 32, 0.5);
    background: #fff;
  }

  .item:hover .card::before {
    transform: scaleX(1);
  }
`;

export default DirectorsSlider;
