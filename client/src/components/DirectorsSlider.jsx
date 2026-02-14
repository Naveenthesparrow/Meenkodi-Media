import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Box, Typography, Avatar, IconButton, Divider } from '@mui/material';
import { Twitter, AutoAwesome, Edit, Delete, Add } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const DirectorsSlider = ({ directors, onNavigate, user, onEdit, onDelete }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const quantity = directors.length;

  const handleCardClick = (slug) => {
    if (slug) {
      if (onNavigate) onNavigate();
      navigate(`/poets/${slug}`);
    }
  };

  // Enhanced gradient colors for each card
  const cardGradients = [
    'linear-gradient(135deg, #8B0000 0%, #DC143C 50%, #FF6B6B 100%)', // Deep Red to Crimson
    'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)', // Royal Blue
    'linear-gradient(135deg, #115e59 0%, #14b8a6 50%, #5eead4 100%)', // Teal
    'linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #fb923c 100%)', // Heritage Orange
  ];

  return (
    <SliderContainer style={{ '--width': '300px', '--height': '380px', '--quantity': quantity }}>
      <div className="list">
        {directors.map((member, index) => (
          <div className="item" style={{ '--position': index + 1 }} key={index}>
            <div 
              className="card" 
              onClick={() => handleCardClick(member.slug)}
              style={{ 
                cursor: member.slug ? 'pointer' : 'default',
                '--card-gradient': cardGradients[index % cardGradients.length]
              }}
            >
              {/* Animated Background Ornament */}
              <Box className="bg-ornament" />
              
              {/* Top Gradient Strip */}
              <Box className="top-strip" />

              {/* Admin Controls - Top Right Overlay */}
              {user && user.role === 'admin' && (
                <Box
                  className="admin-controls-overlay"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 0.5,
                    zIndex: 10,
                    opacity: 0,
                    transform: 'translateY(-8px)',
                    transition: 'all 0.3s ease',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(member);
                    }}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.95)',
                      color: '#000',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        bgcolor: '#8B0000',
                        color: '#fff',
                      },
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(member._id);
                    }}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.95)',
                      color: '#000',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        bgcolor: '#8B0000',
                        color: '#fff',
                      },
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              )}

              {/* Avatar Section with Enhanced Effects */}
              <Box
                sx={{
                  position: "relative",
                  width: 130,
                  height: 130,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                  zIndex: 2
                }}
              >
                {/* Glowing Outer Ring */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: -8,
                    borderRadius: "50%",
                    background: `var(--card-gradient)`,
                    opacity: 0.15,
                    filter: "blur(12px)",
                    transition: "all 0.5s ease"
                  }}
                  className="glow-ring"
                />
                
                {/* Rotating Border Ring */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: -4,
                    borderRadius: "50%",
                    background: `conic-gradient(from 0deg, transparent 0deg 270deg, var(--card-gradient) 270deg 360deg)`,
                    transition: "all 0.6s ease"
                  }}
                  className="rotating-ring"
                />

                {/* Middle Ring */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: "2px solid rgba(255, 255, 255, 0.5)",
                    background: "rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(10px)",
                    transition: "transform 0.4s ease"
                  }}
                  className="middle-ring"
                />

                <Avatar
                  src={member.image}
                  sx={{
                    width: 110,
                    height: 110,
                    border: "4px solid #fff",
                    boxShadow: "0 12px 40px rgba(0,0,0,0.25), inset 0 2px 8px rgba(255,255,255,0.3)",
                    transition: "all 0.4s ease",
                    '& img': {
                      objectFit: 'cover',
                      objectPosition: member.imagePosition || 'center top'
                    }
                  }}
                  className="avatar"
                />

                {/* Corner Sparkle Elements */}
                <AutoAwesome 
                  sx={{ 
                    position: 'absolute', 
                    top: -5, 
                    right: 5, 
                    fontSize: 20,
                    color: '#FFD700',
                    filter: 'drop-shadow(0 0 4px rgba(255,215,0,0.6))',
                    opacity: 0,
                    transition: 'all 0.4s ease'
                  }} 
                  className="sparkle-1"
                />
                <AutoAwesome 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 5, 
                    left: -5, 
                    fontSize: 16,
                    color: '#FFD700',
                    filter: 'drop-shadow(0 0 4px rgba(255,215,0,0.6))',
                    opacity: 0,
                    transition: 'all 0.4s ease',
                    transitionDelay: '0.1s'
                  }} 
                  className="sparkle-2"
                />
              </Box>

              {/* Content Section */}
              <Box sx={{ 
                display: "flex", 
                flexDirection: "column", 
                alignItems: "center", 
                gap: 0.75, 
                flexGrow: 1, 
                width: '100%',
                px: 2,
                zIndex: 2
              }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 800,
                    background: `var(--card-gradient)`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: "1.25rem",
                    textAlign: 'center',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textShadow: "0 2px 10px rgba(139,0,0,0.1)",
                    letterSpacing: '0.5px',
                    mb: 0.5
                  }}
                >
                  {member.name[i18n.language] || member.name.en}
                </Typography>

                {/* Enhanced Decorative Divider */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 0.5,
                  opacity: 0.8
                }}>
                  <Box sx={{ 
                    width: 24, 
                    height: 1.5, 
                    background: `var(--card-gradient)`,
                    borderRadius: 2
                  }} />
                  <Typography
                    variant="caption"
                    sx={{
                      background: `var(--card-gradient)`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontSize: "1rem",
                      fontWeight: 700,
                      filter: "drop-shadow(0 0 8px rgba(255,215,0,0.3))"
                    }}
                  >
                    ✧
                  </Typography>
                  <Box sx={{ 
                    width: 24, 
                    height: 1.5, 
                    background: `var(--card-gradient)`,
                    borderRadius: 2
                  }} />
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#2c2c2c",
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    textAlign: 'center',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500,
                    letterSpacing: '0.3px'
                  }}
                >
                  {member.title[i18n.language] || member.title.en}
                </Typography>
              </Box>

              {/* Social Button */}
              <Box sx={{ pt: 2, zIndex: 2 }}>
                <IconButton
                  size="small"
                  className="social-btn"
                  sx={{
                    background: `var(--card-gradient)`,
                    color: "#fff",
                    width: 38,
                    height: 38,
                    transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    boxShadow: "0 4px 15px rgba(139,0,0,0.2)",
                    "&:hover": {
                      transform: "translateY(-3px) scale(1.1)",
                      boxShadow: "0 8px 25px rgba(139,0,0,0.35)"
                    },
                  }}
                >
                  <Twitter sx={{ fontSize: 18 }} />
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

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-10px) rotate(5deg);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
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
    animation: ${autoRun} 35s linear infinite;
    transition: filter 0.5s;
    animation-delay: calc(
      (35s / var(--quantity)) * (var(--position) - 1) - 35s
    ) !important;
    padding: 18px 10px;
  }

  .card {
    width: 100%;
    height: 100%;
    padding: 28px 22px;
    background: linear-gradient(135deg, #ffffff 0%, #fefdfb 50%, #fff9f0 100%);
    border: 2px solid transparent;
    border-radius: 20px;
    box-shadow: 
      0 8px 32px rgba(139, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
  }

  /* Animated Background Ornament */
  .bg-ornament {
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, var(--card-gradient) 0%, transparent 70%);
    opacity: 0.03;
    animation: ${rotate} 30s linear infinite;
    pointer-events: none;
    z-index: 0;
  }

  /* Top Gradient Strip */
  .top-strip {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: var(--card-gradient);
    border-radius: 20px 20px 0 0;
    box-shadow: 0 3px 15px rgba(139, 0, 0, 0.3);
    z-index: 1;
  }

  /* Glassmorphic Border Effect */
  .card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    padding: 2px;
    background: linear-gradient(135deg, 
      rgba(255,255,255,0.8) 0%, 
      rgba(255,255,255,0.2) 50%, 
      rgba(255,255,255,0.8) 100%
    );
    -webkit-mask: 
      linear-gradient(#fff 0 0) content-box, 
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: 1;
  }

  &:hover .item {
    animation-play-state: paused !important;
    filter: grayscale(0.7) blur(1px) brightness(0.7);
  }

  .item:hover {
    filter: grayscale(0) blur(0) brightness(1) !important;
    z-index: 100;
  }
  
  .item:hover .card {
    transform: translateY(-15px) scale(1.02);
    box-shadow: 
      0 25px 60px rgba(139, 0, 0, 0.18),
      0 0 0 1px rgba(255, 255, 255, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 1);
    border-color: rgba(255, 255, 255, 0.5);
    background: linear-gradient(135deg, #ffffff 0%, #fffef9 100%);
  }

  .item:hover .admin-controls-overlay {
    opacity: 1;
    transform: translateY(0);
  }

  .item:hover .card::after {
    opacity: 1;
  }

  .item:hover .top-strip {
    height: 6px;
    box-shadow: 0 5px 25px rgba(139, 0, 0, 0.5);
  }

  .item:hover .bg-ornament {
    opacity: 0.08;
  }

  /* Avatar Effects on Hover */
  .item:hover .glow-ring {
    opacity: 0.35;
    filter: blur(20px);
    inset: -15px;
  }

  .item:hover .rotating-ring {
    animation: ${rotate} 3s linear infinite;
  }

  .item:hover .middle-ring {
    transform: scale(1.08);
    border-color: rgba(255, 255, 255, 0.8);
  }

  .item:hover .avatar {
    transform: scale(1.05);
    box-shadow: 
      0 15px 50px rgba(0,0,0,0.35),
      inset 0 2px 12px rgba(255,255,255,0.5);
  }

  .item:hover .sparkle-1,
  .item:hover .sparkle-2 {
    opacity: 1;
    animation: ${float} 2s ease-in-out infinite;
  }

  /* Social Button Shimmer Effect */
  .social-btn {
    position: relative;
    overflow: hidden;
  }

  .social-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 3s infinite;
  }

  /* Mobile Responsiveness */
  @media (max-width: 768px) {
    height: calc(var(--height) * 0.9);
    
    .item {
      animation-duration: 40s;
      animation-delay: calc(
        (40s / var(--quantity)) * (var(--position) - 1) - 40s
      ) !important;
    }
    
    .card {
      padding: 22px 18px;
    }
  }
`;

export default DirectorsSlider;
