import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Divider,
  Chip,
  Fade,
  Paper,
  IconButton,
  Modal,
  Tooltip,
  Snackbar,
  Button,
  Container,
  Dialog,
  DialogContent,
  Avatar,
  TextField,
  Stack,
  Zoom,
} from "@mui/material";
import {
  AutoAwesome,
  ArrowForward,
  Architecture,
  Landscape,
  Article,
  PhotoCamera,
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

          {/* Featured Thirukkural Card */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 2,
              mt: { xs: 4, md: 6 },
              mb: { xs: 4, md: 6 }
            }}
          >
            <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 4, md: 6, lg: 8 } }}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: '28px',
                  p: { xs: 3.5, md: 5 },
                  background: 'linear-gradient(140deg, rgba(255,248,238,0.96), rgba(255,232,210,0.96))',
                  border: '1px solid rgba(210,140,70,0.22)',
                  boxShadow: '0 32px 80px rgba(90,40,12,0.18)',
                  display: 'grid',
                  gap: { xs: 3, md: 4 },
                  gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 0.95fr) minmax(0, 1.05fr)' },
                  alignItems: 'stretch'
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    <Box 
                      sx={{ 
                        position: 'relative',
                        zIndex: 2,
                        p: { xs: 4, md: 5 }, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2.5,
                        height: '100%',
                        justifyContent: 'flex-end'
                      }}
                    >
                      {/* Badge at top (no background) */}
                      <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ 
                            fontWeight: 900,
                            color: '#FFFFFF',
                            letterSpacing: 2.5,
                            fontSize: '0.85rem',
                            fontFamily: '"Inter", "Roboto", sans-serif'
                          }}
                        >
                          {i18n.language === 'ta'
                            ? `திணை ${originalIndex + 1}`
                            : `TINAI ${String(originalIndex + 1).padStart(2, '0')}`}
                        </Typography>
                      </Box>

                      {/* Title */}
                      <Box>
                        <Typography
                          variant="h4"
                          sx={{ 
                            fontWeight: 900, 
                            color: '#FFFFFF', 
                            letterSpacing: '-0.03em',
                            textShadow: '0 3px 16px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.5)',
                            fontFamily: i18n.language === 'ta' ? '"Noto Serif Tamil", serif' : '"Playfair Display", serif',
                            fontSize: { xs: '1.75rem', md: '2rem' }
                          }}
                        >
                          {getContent(land.name)}
                        </Typography>
                      </Box>

                      {/* Poetic Quote */}
                      <Typography
                        variant="body1"
                        sx={{
                          fontStyle: 'italic',
                          color: 'rgba(255,255,255,0.98)',
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          lineHeight: 1.7,
                          textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.6)',
                          maxWidth: '95%',
                          fontWeight: 400,
                          fontFamily: '"Georgia", "Noto Serif Tamil", serif'
                        }}
                      >
                        {getContent(land.poetic)}
                      </Typography>

                      {/* Tags removed */}

                      {/* CTA Button */}
                      <Button
                        variant="contained"
                        endIcon={<ArrowForward fontSize="small" />}
                        onClick={() => navigate(land.route)}
                        sx={{
                          alignSelf: 'flex-start',
                          mt: 1.5,
                          borderRadius: '999px',
                          px: 4,
                          py: 1.4,
                          fontWeight: 900,
                          fontSize: '0.95rem',
                          letterSpacing: 1.2,
                          textTransform: 'uppercase',
                          background: 'transparent',
                          color: '#FFFFFF',
                          boxShadow: '0 10px 28px rgba(0,0,0,0.4)',
                          fontFamily: '"Inter", "Roboto", sans-serif',
                          border: '2px solid #FFFFFF',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.1)',
                            color: '#FFFFFF',
                            transform: 'translateX(8px) scale(1.05)',
                            boxShadow: '0 14px 36px rgba(255,255,255,0.3)',
                            border: '2px solid #FFFFFF'
                          }
                        }}
                      >
                        {getContent(land.cta)}
                      </Button>
                    </Box>
                  </Paper>
                );
              })()}

              {/* Marutham - LEFT */}
              {(() => {
                const land = FIVE_LANDS.find((item) => item.key === 'marutham');
                if (!land) return null;
                const originalIndex = FIVE_LANDS.findIndex((item) => item.key === 'marutham');
                return (
                  <Paper
                    key="five-lands-card-marutham"
                    elevation={0}
                    sx={{
                      alignSelf: { xs: 'stretch', md: 'flex-start' },
                      width: { xs: '100%', md: '65%' },
                      ml: { md: 0 },
                      position: 'relative',
                      borderRadius: 4,
                      overflow: 'hidden',
                      height: { xs: 420, md: 460 },
                      border: `2px solid ${land.accent}40`,
                      boxShadow: `0 16px 48px ${land.accent}25`,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: `0 24px 64px ${land.accent}35`,
                        borderColor: `${land.accent}60`
                      }
                    }}
                  >
                    {/* Full Background Image */}
                    <Box
                      component="img"
                      src="/src/assests/marutham.avif"
                      alt="Marutham Landscape"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 0
                      }}
                    />
                    
                    {/* Gradient Overlays for readability */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)`,
                        zIndex: 1
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at 30% 40%, ${land.accent}25 0%, transparent 60%)`,
                        zIndex: 1
                      }}
                    />

                    {/* Content Overlay */}
                    <Box 
                      sx={{ 
                        position: 'relative',
                        zIndex: 2,
                        p: { xs: 4, md: 5 }, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2.5,
                        height: '100%',
                        justifyContent: 'flex-end'
                      }}
                    >
                      {/* Badge at top (no background) */}
                      <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ 
                            fontWeight: 900,
                            color: '#FFFFFF',
                            letterSpacing: 2.5,
                            fontSize: '0.85rem',
                            fontFamily: '"Inter", "Roboto", sans-serif'
                          }}
                        >
                          {i18n.language === 'ta'
                            ? `திணை ${originalIndex + 1}`
                            : `TINAI ${String(originalIndex + 1).padStart(2, '0')}`}
                        </Typography>
                      </Box>

                      {/* Title */}
                      <Box>
                        <Typography
                          variant="h4"
                          sx={{ 
                            fontWeight: 900, 
                            color: '#FFFFFF', 
                            letterSpacing: '-0.03em',
                            textShadow: '0 3px 16px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.5)',
                            fontFamily: i18n.language === 'ta' ? '"Noto Serif Tamil", serif' : '"Playfair Display", serif',
                            fontSize: { xs: '1.75rem', md: '2rem' }
                          }}
                        >
                          {getContent(land.name)}
                        </Typography>
                      </Box>

                      {/* Poetic Quote */}
                      <Typography
                        variant="body1"
                        sx={{
                          fontStyle: 'italic',
                          color: 'rgba(255,255,255,0.98)',
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          lineHeight: 1.7,
                          textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.6)',
                          maxWidth: '95%',
                          fontWeight: 400,
                          fontFamily: '"Georgia", "Noto Serif Tamil", serif'
                        }}
                      >
                        {getContent(land.poetic)}
                      </Typography>

                      {/* Tags removed */}

                      {/* CTA Button */}
                      <Button
                        variant="contained"
                        endIcon={<ArrowForward fontSize="small" />}
                        onClick={() => navigate(land.route)}
                        sx={{
                          alignSelf: 'flex-start',
                          mt: 1.5,
                          borderRadius: '999px',
                          px: 4,
                          py: 1.4,
                          fontWeight: 900,
                          fontSize: '0.95rem',
                          letterSpacing: 1.2,
                          textTransform: 'uppercase',
                          background: 'transparent',
                          color: '#FFFFFF',
                          boxShadow: '0 10px 28px rgba(0,0,0,0.4)',
                          fontFamily: '"Inter", "Roboto", sans-serif',
                          border: '2px solid #FFFFFF',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.1)',
                            color: '#FFFFFF',
                            transform: 'translateX(8px) scale(1.05)',
                            boxShadow: '0 14px 36px rgba(255,255,255,0.3)',
                            border: '2px solid #FFFFFF'
                          }
                        }}
                      >
                        {getContent(land.cta)}
                      </Button>
                    </Box>
                  </Paper>
                );
              })()}

              {/* Neithal - RIGHT */}
              {(() => {
                const land = FIVE_LANDS.find((item) => item.key === 'neithal');
                if (!land) return null;
                const originalIndex = FIVE_LANDS.findIndex((item) => item.key === 'neithal');
                return (
                  <Paper
                    key="five-lands-card-neithal"
                    elevation={0}
                    sx={{
                      alignSelf: { xs: 'stretch', md: 'flex-end' },
                      width: { xs: '100%', md: '65%' },
                      mr: { md: 0 },
                      position: 'relative',
                      borderRadius: 4,
                      overflow: 'hidden',
                      height: { xs: 420, md: 460 },
                      border: `2px solid ${land.accent}40`,
                      boxShadow: `0 16px 48px ${land.accent}25`,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: `0 24px 64px ${land.accent}35`,
                        borderColor: `${land.accent}60`
                      }
                    }}
                  >
                    {/* Full Background Image */}
                    <Box
                      component="img"
                      src="/src/assests/neithal.avif"
                      alt="Neithal Landscape"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 0
                      }}
                    />
                    
                    {/* Gradient Overlays for readability */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)`,
                        zIndex: 1
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at 30% 40%, ${land.accent}25 0%, transparent 60%)`,
                        zIndex: 1
                      }}
                    />

                    {/* Content Overlay */}
                    <Box 
                      sx={{ 
                        position: 'relative',
                        zIndex: 2,
                        p: { xs: 4, md: 5 }, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2.5,
                        height: '100%',
                        justifyContent: 'flex-end'
                      }}
                    >
                      {/* Badge at top (no background) */}
                      <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ 
                            fontWeight: 900,
                            color: '#FFFFFF',
                            letterSpacing: 2.5,
                            fontSize: '0.85rem',
                            fontFamily: '"Inter", "Roboto", sans-serif'
                          }}
                        >
                          {i18n.language === 'ta'
                            ? `திணை ${originalIndex + 1}`
                            : `TINAI ${String(originalIndex + 1).padStart(2, '0')}`}
                        </Typography>
                      </Box>

                      {/* Title */}
                      <Box>
                        <Typography
                          variant="h4"
                          sx={{ 
                            fontWeight: 900, 
                            color: '#FFFFFF', 
                            letterSpacing: '-0.03em',
                            textShadow: '0 3px 16px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.5)',
                            fontFamily: i18n.language === 'ta' ? '"Noto Serif Tamil", serif' : '"Playfair Display", serif',
                            fontSize: { xs: '1.75rem', md: '2rem' }
                          }}
                        >
                          {getContent(land.name)}
                        </Typography>
                      </Box>

                      {/* Poetic Quote */}
                      <Typography
                        variant="body1"
                        sx={{
                          fontStyle: 'italic',
                          color: 'rgba(255,255,255,0.98)',
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          lineHeight: 1.7,
                          textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.6)',
                          maxWidth: '95%',
                          fontWeight: 400,
                          fontFamily: '"Georgia", "Noto Serif Tamil", serif'
                        }}
                      >
                        {getContent(land.poetic)}
                      </Typography>

                      {/* Tags removed */}

                      {/* CTA Button */}
                      <Button
                        variant="contained"
                        endIcon={<ArrowForward fontSize="small" />}
                        onClick={() => navigate(land.route)}
                        sx={{
                          alignSelf: 'flex-start',
                          mt: 1.5,
                          borderRadius: '999px',
                          px: 4,
                          py: 1.4,
                          fontWeight: 900,
                          fontSize: '0.95rem',
                          letterSpacing: 1.2,
                          textTransform: 'uppercase',
                          background: 'transparent',
                          color: '#FFFFFF',
                          boxShadow: '0 10px 28px rgba(0,0,0,0.4)',
                          fontFamily: '"Inter", "Roboto", sans-serif',
                          border: '2px solid #FFFFFF',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.1)',
                            color: '#FFFFFF',
                            transform: 'translateX(8px) scale(1.05)',
                            boxShadow: '0 14px 36px rgba(255,255,255,0.3)',
                            border: '2px solid #FFFFFF'
                          }
                        }}
                      >
                        {getContent(land.cta)}
                      </Button>
                    </Box>
                  </Paper>
                );
              })()}

              {/* Palai - LEFT */}
              {(() => {
                const land = FIVE_LANDS.find((item) => item.key === 'palai');
                if (!land) return null;
                const originalIndex = FIVE_LANDS.findIndex((item) => item.key === 'palai');
                return (
                  <Paper
                    key="five-lands-card-palai"
                    elevation={0}
                    sx={{
                      alignSelf: { xs: 'stretch', md: 'flex-start' },
                      width: { xs: '100%', md: '65%' },
                      ml: { md: 0 },
                      position: 'relative',
                      borderRadius: 4,
                      overflow: 'hidden',
                      height: { xs: 420, md: 460 },
                      border: `2px solid ${land.accent}40`,
                      boxShadow: `0 16px 48px ${land.accent}25`,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: `0 24px 64px ${land.accent}35`,
                        borderColor: `${land.accent}60`
                      }
                    }}
                  >
                    {/* Full Background Image */}
                    <Box
                      component="img"
                      src="/src/assests/palai.avif"
                      alt="Palai Landscape"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 0
                      }}
                    />
                    
                    {/* Gradient Overlays for readability */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)`,
                        zIndex: 1
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at 30% 40%, ${land.accent}25 0%, transparent 60%)`,
                        zIndex: 1
                      }}
                    />

                    {/* Content Overlay */}
                    <Box 
                      sx={{ 
                        position: 'relative',
                        zIndex: 2,
                        p: { xs: 4, md: 5 }, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2.5,
                        height: '100%',
                        justifyContent: 'flex-end'
                      }}
                    >
                      {/* Badge at top (no background) */}
                      <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ 
                            fontWeight: 900,
                            color: '#FFFFFF',
                            letterSpacing: 2.5,
                            fontSize: '0.85rem',
                            fontFamily: '"Inter", "Roboto", sans-serif'
                          }}
                        >
                          {i18n.language === 'ta'
                            ? `திணை ${originalIndex + 1}`
                            : `TINAI ${String(originalIndex + 1).padStart(2, '0')}`}
                        </Typography>
                      </Box>

                      {/* Title */}
                      <Box>
                        <Typography
                          variant="h4"
                          sx={{ 
                            fontWeight: 900, 
                            color: '#FFFFFF', 
                            letterSpacing: '-0.03em',
                            textShadow: '0 3px 16px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.5)',
                            fontFamily: i18n.language === 'ta' ? '"Noto Serif Tamil", serif' : '"Playfair Display", serif',
                            fontSize: { xs: '1.75rem', md: '2rem' }
                          }}
                        >
                          {getContent(land.name)}
                        </Typography>
                      </Box>

                      {/* Poetic Quote */}
                      <Typography
                        variant="body1"
                        sx={{
                          fontStyle: 'italic',
                          color: 'rgba(255,255,255,0.98)',
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          lineHeight: 1.7,
                          textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.6)',
                          maxWidth: '95%',
                          fontWeight: 400,
                          fontFamily: '"Georgia", "Noto Serif Tamil", serif'
                        }}
                      >
                        {getContent(land.poetic)}
                      </Typography>

                      {/* Tags removed */}

                      {/* CTA Button */}
                      <Button
                        variant="contained"
                        endIcon={<ArrowForward fontSize="small" />}
                        onClick={() => navigate(land.route)}
                        sx={{
                          alignSelf: 'flex-start',
                          mt: 1.5,
                          borderRadius: '999px',
                          px: 4,
                          py: 1.4,
                          fontWeight: 900,
                          fontSize: '0.95rem',
                          letterSpacing: 1.2,
                          textTransform: 'uppercase',
                          background: 'transparent',
                          color: '#FFFFFF',
                          boxShadow: '0 10px 28px rgba(0,0,0,0.4)',
                          fontFamily: '"Inter", "Roboto", sans-serif',
                          border: '2px solid #FFFFFF',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.1)',
                            color: '#FFFFFF',
                            transform: 'translateX(8px) scale(1.05)',
                            boxShadow: '0 14px 36px rgba(255,255,255,0.3)',
                            border: '2px solid #FFFFFF'
                          }
                        }}
                      >
                        {getContent(land.cta)}
                      </Button>
                    </Box>
                  </Paper>
                );
              })()}
            </Box>
          </Box>
        </Container>
      </Box>


      {/* HERITAGE STEPS SECTION */}
      <Box sx={{ bgcolor: "#f8f6f2", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 4, md: 6, lg: 8 } }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}> {/* Centered text, increased margin-bottom */}
            <Typography
              variant="overline"
              sx={{
                letterSpacing: 2, // Slightly reduced letter spacing
                fontSize: 13, // Slightly larger font size
                fontWeight: 600,
                textTransform: 'uppercase',
                color: '#8B0000' // Changed to primary red
              }}
            >
              {t('home.timeline.subtitle')}
            </Typography>
            <Typography
              variant="h2" // Changed to h2 for more prominence
              sx={{
                fontWeight: 800, // Bolder
                fontSize: { xs: '2.2rem', md: '3rem' }, // Larger font size
                mt: 1.5, // Increased margin-top
                color: '#1a1a1a' // Darker color
              }}
            >
              {t('home.timeline.title')}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gap: { xs: 2.5, md: 3 },
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }
            }}
          >
            {heritageSteps.map((step) => (
              <Paper
                key={step.number}
                elevation={0}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '20px',
                  p: { xs: 3, md: 3.5 },
                  bgcolor: '#fff',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  minHeight: { xs: 260, md: 320 },
                  height: '100%',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 22px 44px rgba(0,0,0,0.08)'
                  }
                }}
              >
                <Stack spacing={1.75}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: '#8B0000',
                      fontSize: '2.6rem',
                      letterSpacing: -1
                    }}
                  >
                    {step.number}
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      fontSize: '1.3rem',
                      color: '#1f1f1f'
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: '#555',
                      lineHeight: 1.65,
                      fontSize: '1rem'
                    }}
                  >
                    {step.description}
                  </Typography>
                </Stack>

                <Button
                  variant="text"
                  onClick={step.action}
                  sx={{
                    mt: 2,
                    color: '#8B0000',
                    fontWeight: 600,
                    px: 0,
                    '&:hover': {
                      bgcolor: 'transparent',
                      color: '#A52A2A'
                    }
                  }}
                >
                  {step.actionLabel}
                </Button>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>


          {/* COLLABORATIONS SECTION */}
          <Box sx={{ bgcolor: "#1b1814", color: '#f4f1ed', py: { xs: 6, md: 8 } }}>
            <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 4, md: 6, lg: 8 } }}>
              <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
                <Typography
                  variant="overline"
                  sx={{
                    letterSpacing: 2,
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }}
                >
                  {t('home.collaborations.subtitle')}
                </Typography>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    mt: 1.5,
                    color: '#fff'
                  }}
                >
                  {t('home.collaborations.title')}
                </Typography>
              </Box>

              <Grid
                container
                spacing={{ xs: 3, sm: 4, md: 4.5 }}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    lg: 'repeat(3, minmax(0, 1fr))'
                  },
                  gap: { xs: 3, sm: 4, md: 4.5 }
                }}
              >
                {collaborationPartners.map((partner, index) => (
                  <Paper
                    key={partner.name}
                    elevation={0}
                    sx={{
                      borderRadius: 4,
                      p: { xs: 3, md: 3.5 },
                      bgcolor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(244,241,237,0.12)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.8,
                      minHeight: 220,
                      boxShadow: '0 22px 40px rgba(12,10,8,0.25)',
                      backdropFilter: 'blur(6px)',
                      position: 'relative'
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 'inherit',
                        border: '1px solid rgba(244,241,237,0.1)',
                        opacity: 0.4
                      }}
                    />

                    <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography
                          variant="caption"
                          sx={{ color: 'rgba(244,241,237,0.6)', letterSpacing: 0.6, textTransform: 'uppercase' }}
                        >
                          {partner.region}
                        </Typography>
                      </Stack>

                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          fontSize: '1.25rem',
                          color: '#f8f6f2'
                        }}
                      >
                        {partner.name}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ color: 'rgba(244,241,237,0.82)', lineHeight: 1.65 }}
                      >
                        {partner.focus}
                      </Typography>

                      <Button
                        variant="text"
                        onClick={() => navigate('/resources')}
                        sx={{
                          alignSelf: 'flex-start',
                          mt: 1,
                          color: '#f4f1ed',
                          px: 0,
                          fontWeight: 600,
                          '&:hover': {
                            bgcolor: 'transparent',
                            color: '#ffe9c7'
                          }
                        }}
                      >
                        {defaultCardCta}
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Grid>

              <Box sx={{ mt: { xs: 5, md: 6 }, textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/resources')}
                  sx={{
                    borderColor: 'rgba(244,241,237,0.5)',
                    color: '#f4f1ed',
                    px: 4,
                    py: 1,
                    fontWeight: 600,
                    borderRadius: '999px',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#f4f1ed',
                      bgcolor: 'rgba(244,241,237,0.08)'
                    }
                  }}
                >
                  {t('home.collaborations.cta')}
                </Button>
              </Box>
            </Container>
          </Box>


          {/* RECOGNITION SECTION removed as requested */}


          {/* SIGNATURE INITIATIVES SECTION */}
          <Box sx={{ bgcolor: '#fdf7f2', py: { xs: 6, md: 8 } }}>
            <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 4, md: 6, lg: 8 } }}>
              <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 5 } }}>
                <Typography
                  variant="overline"
                  sx={{
                    letterSpacing: 3,
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: '#b2610b'
                  }}
                >
                  {t('home.initiatives.subtitle')}
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '1.9rem', md: '2.4rem' }
                  }}
                >
                  {t('home.initiatives.title')}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    xl: 'repeat(4, minmax(0, 1fr))'
                  },
                  gap: { xs: 3, md: 4 },
                  alignItems: 'stretch'
                }}
              >
                {signatureInitiatives.map((initiative, index) => (
                  <Paper
                    key={`${initiative.title}-${index}`}
                    elevation={0}
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 3,
                      height: '100%',
                      borderRadius: 5,
                      p: { xs: 3, md: 3.75 },
                      bgcolor: '#fff',
                      border: '1px solid rgba(34,22,12,0.1)',
                      boxShadow: '0 22px 40px rgba(31,19,12,0.08)',
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 'inherit',
                        background: 'linear-gradient(160deg, rgba(182,28,28,0.07), rgba(178,97,11,0.05))',
                        opacity: 0.85
                      }}
                    />

                    <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 2.5, flexGrow: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 2
                        }}
                      >
                        <Box
                          sx={{
                            width: 54,
                            height: 54,
                            borderRadius: '18px',
                            border: '1px solid rgba(182,28,28,0.28)',
                            background: 'rgba(182,28,28,0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 10px 20px rgba(31,19,12,0.1)'
                          }}
                        >
                          {initiative.icon}
                        </Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: '#b2610b',
                            letterSpacing: 1,
                            textTransform: 'uppercase'
                          }}
                        >
                          {`0${index + 1}`.slice(-2)}
                        </Typography>
                      </Box>

                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: '1.18rem', md: '1.28rem' },
                          color: '#22140c',
                          letterSpacing: '-0.01em'
                        }}
                      >
                        {initiative.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(34,20,12,0.82)',
                          lineHeight: 1.78,
                          flexGrow: 1
                        }}
                      >
                        {initiative.description}
                      </Typography>
                    </Box>

                    <Button
                      variant="text"
                      onClick={initiative.action}
                      endIcon={<ArrowForward fontSize="small" />}
                      sx={{
                        position: 'relative',
                        zIndex: 1,
                        alignSelf: 'flex-start',
                        color: '#b61c1c',
                        fontWeight: 700,
                        px: 0,
                        letterSpacing: 0.6,
                        textTransform: 'uppercase',
                        '&:hover': {
                          bgcolor: 'transparent',
                          color: '#cf2a2a'
                        }
                      }}
                    >
                      {initiative.actionLabel}
                    </Button>
                  </Paper>
                ))}
              </Box>
            </Container>
          </Box>

          {/* COMMUNITY ENGAGEMENT CTA */}
          <Box sx={{ bgcolor: '#1f120c', color: '#fdf7f2', py: { xs: 6, md: 8 } }}>
            <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 4, md: 6, lg: 8 } }}>
              <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Box sx={{ maxWidth: 440 }}>
                    <Typography
                      variant="overline"
                      sx={{
                        letterSpacing: 3,
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: 'rgba(253,247,242,0.7)'
                      }}
                    >
                      {t('home.community.title')}
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: '2rem', md: '2.5rem' },
                        mt: 1
                      }}
                    >
                      {t('home.community.heading')}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        mt: 2,
                        lineHeight: 1.7,
                        color: 'rgba(253,247,242,0.78)'
                      }}
                    >
                      {t('home.community.description')}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Grid container spacing={{ xs: 2.5, md: 3 }}>
                    {communityActions.map((item) => (
                      <Grid item xs={12} key={item.heading}>
                        <Paper
                          elevation={0}
                          sx={{
                            borderRadius: 3,
                            p: { xs: 3, md: 3.5 },
                            bgcolor: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                            backdropFilter: 'blur(6px)'
                          }}
                        >
                          <Typography
                            variant="h5"
                            sx={{ fontWeight: 600, fontSize: '1.2rem', color: '#fff' }}
                          >
                            {item.heading}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ lineHeight: 1.7, color: 'rgba(255,255,255,0.78)' }}
                          >
                            {item.description}
                          </Typography>
                          <Button
                            variant="outlined"
                            onClick={item.action}
                            sx={{
                              alignSelf: 'flex-start',
                              borderColor: 'rgba(255,255,255,0.45)',
                              color: '#fff',
                              textTransform: 'none',
                              fontWeight: 600,
                              borderRadius: '999px',
                              px: 3,
                              '&:hover': {
                                borderColor: '#fff',
                                bgcolor: 'rgba(255,255,255,0.12)'
                              }
                            }}
                          >
                            {item.actionLabel}
                          </Button>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Container>
          </Box>

      
      {/* WHAT WE DO SECTION removed as requested */}

      
      {/* DIRECTORS & HERITAGE SPECIALISTS */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "#fff" }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 5, lg: 6, xl: 8 } }}>
          <Typography 
            variant="h2" 
            align="center" 
            sx={{ 
              fontWeight: 800, 
              mb: 1.5,
              fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem", lg: "2.8rem" },
              color: "#000",
              letterSpacing: "-0.02em"
            }}
          >
            {t('home.team.directors.title')}
          </Typography>
          <Divider sx={{ width: 60, height: 3, bgcolor: "#8B0000", mx: "auto", mb: 6, borderRadius: 2 }} />
          
          <Grid container spacing={{ xs: 2.5, sm: 3, md: 3.5, lg: 4 }} sx={{ maxWidth: "1400px", mx: "auto" }}>
            {TEAM_DIRECTORS.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    px: { xs: 2.5, md: 3 },
                    py: { xs: 3, md: 3.5 },
                    height: "100%",
                    borderRadius: "18px",
                    bgcolor: "#f9fafb",
                    border: "1px solid #e4e7eb",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: 2,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 18px 40px rgba(16,24,40,0.12)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: { xs: 92, md: 104 },
                      height: { xs: 92, md: 104 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        background: "linear-gradient(145deg, rgba(139,0,0,0.18), rgba(139,0,0,0.06))",
                      }}
                    />
                    <Avatar
                      src={member.image}
                      sx={{
                        width: { xs: 80, md: 90 },
                        height: { xs: 80, md: 90 },
                        border: "4px solid #fff",
                        boxShadow: "0 6px 16px rgba(15,23,42,0.15)",
                      }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        color: "#1f2933",
                        fontSize: { xs: "1.05rem", md: "1.15rem" },
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {member.name[i18n.language] || member.name.en}
                    </Typography>
                    <Divider sx={{ width: 56, height: 3, bgcolor: "#8B0000", borderRadius: 2 }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#52616b",
                        fontSize: { xs: "0.92rem", md: "0.95rem" },
                        lineHeight: 1.6,
                      }}
                    >
                      {member.title[i18n.language] || member.title.en}
                    </Typography>
                  </Box>

                  <Box sx={{ mt: "auto", pt: 1 }}>
                    <IconButton
                      size="small"
                      sx={{
                        color: "#8B0000",
                        border: "2px solid rgba(139,0,0,0.4)",
                        width: 40,
                        height: 40,
                        transition: "all 0.25s ease",
                        "&:hover": {
                          bgcolor: "#8B0000",
                          color: "#fff",
                          borderColor: "#8B0000",
                        },
                      }}
                    >
                      <Twitter sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      {/* MUSEUM ARCHIVES TEAM */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "#1a1a1a" }}>
        <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 4, md: 6, lg: 8 } }}>
          <Typography 
            variant="h2" 
            align="center" 
            sx={{ 
              fontWeight: 800, 
              mb: 1.5,
              fontSize: { xs: "2rem", md: "2.8rem" },
              color: "#fff",
              letterSpacing: "-0.01em"
            }}
          >
            {t('home.team.museum.title')}
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            sx={{ 
              mb: 2, 
              color: "#ccc",
              maxWidth: 900,
              mx: "auto",
              fontSize: { xs: "1rem", md: "1.1rem" },
              lineHeight: 1.6
            }}
          >
            {t('home.team.museum.subtitle')}
          </Typography>
          <Divider sx={{ width: 80, height: 4, bgcolor: "#8B0000", mx: "auto", mb: 8, borderRadius: 2 }} />
          
          <Grid container spacing={{ xs: 3, sm: 4, md: 4, lg: 5 }} justifyContent="center">
            {TEAM_MUSEUM.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
                <Card 
                  elevation={0}
                  sx={{ 
                    textAlign: "center",
                    p: 3.5,
                    minHeight: "320px",
                    borderRadius: "20px",
                    bgcolor: "#2a2a2a",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    border: "2px solid #3a3a3a",
                    position: "relative",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      bgcolor: "#8B0000",
                      transform: "scaleX(0)",
                      transition: "transform 0.4s ease"
                    },
                    "&:hover": {
                      transform: "translateY(-12px)",
                      boxShadow: "0 20px 60px rgba(139,0,0,0.4)",
                      bgcolor: "#333",
                      borderColor: "#8B0000",
                      "&::before": {
                        transform: "scaleX(1)"
                      }
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 160,
                      height: 160,
                      mx: "auto",
                      mb: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%",
                      border: "4px solid #8B0000",
                      bgcolor: "#fff",
                      overflow: "hidden",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0 12px 32px rgba(139,0,0,0.5)"
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src={member.flag}
                      alt={member.name[i18n.language] || member.name.en}
                      sx={{
                        width: "85%",
                        height: "85%",
                        objectFit: "contain"
                      }}
                    />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5, color: "#fff", fontSize: { xs: "1.2rem", md: "1.25rem" }, lineHeight: 1.3 }}>
                    {member.name[i18n.language] || member.name.en}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#aaa", fontWeight: 500, fontSize: "0.95rem", lineHeight: 1.5, px: 1 }}>
                    {member.title[i18n.language] || member.title.en}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* MAGNIFICENT TEMPLES & PALACES */}
      <Box 
        sx={{ 
          py: { xs: 10, md: 14 }, 
          background: "linear-gradient(180deg, #0a0908 0%, #1a1512 100%)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Decorative background elements */}
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            right: "-5%",
            width: "40%",
            height: "60%",
            background: "radial-gradient(circle, rgba(139,0,0,0.15) 0%, transparent 70%)",
            filter: "blur(80px)",
            pointerEvents: "none"
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: "5%",
            left: "-8%",
            width: "45%",
            height: "50%",
            background: "radial-gradient(circle, rgba(218,165,32,0.12) 0%, transparent 70%)",
            filter: "blur(90px)",
            pointerEvents: "none"
          }}
        />

        <Container maxWidth="xl" sx={{ px: { xs: 3, sm: 4, md: 6, lg: 8 }, position: "relative", zIndex: 1 }}>
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: { xs: 7, md: 9 } }}>
            <Typography 
              variant="overline"
              sx={{
                color: "#daa520",
                letterSpacing: 3,
                fontWeight: 700,
                fontSize: "0.85rem",
                mb: 2,
                display: "block"
              }}
            >
              {i18n.language === 'ta' ? 'தமிழ் கட்டிடக்கலை' : 'ARCHITECTURAL HERITAGE'}
            </Typography>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 900, 
                mb: 2,
                fontSize: { xs: "2.2rem", md: "3.5rem" },
                letterSpacing: "-0.02em",
                background: "linear-gradient(135deg, #fff 0%, #e0e0e0 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              {t('home.palaces.title')}
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                maxWidth: 800,
                mx: "auto",
                fontSize: { xs: "1rem", md: "1.15rem" },
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.7,
                fontWeight: 400
              }}
            >
              {t('home.palaces.subtitle')}
            </Typography>
          </Box>
          
          <Grid container spacing={{ xs: 3, md: 4, lg: 5 }}>
            {FEATURED_TEMPLES.map((temple, index) => {
              const getLocale = (content) => (content?.[i18n.language] || content?.en || "");
              return (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      borderRadius: "24px",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      bgcolor: "#1a1614",
                      border: "1px solid rgba(218,165,32,0.2)",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        inset: 0,
                        borderRadius: "24px",
                        padding: "2px",
                        background: "linear-gradient(135deg, rgba(218,165,32,0.3), rgba(139,0,0,0.3))",
                        WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                        opacity: 0,
                        transition: "opacity 0.4s ease"
                      },
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 32px 64px rgba(0,0,0,0.5)",
                        borderColor: "rgba(218,165,32,0.4)",
                        "&::before": {
                          opacity: 1
                        },
                        "& .temple-image": {
                          transform: "scale(1.1)"
                        },
                        "& .temple-overlay": {
                          opacity: 0.4
                        },
                        "& .temple-number": {
                          transform: "rotate(360deg)",
                          bgcolor: "#daa520"
                        }
                      }
                    }}
                  >
                    {/* Image Section */}
                    <Box sx={{ position: "relative", height: 280, overflow: "hidden" }}>
                      <Box
                        component="img"
                        className="temple-image"
                        src={temple.image}
                        alt={getLocale(temple.name)}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
                        }}
                      />
                      <Box
                        className="temple-overlay"
                        sx={{
                          position: "absolute",
                          inset: 0,
                          background: "linear-gradient(180deg, rgba(10,9,8,0.3) 0%, rgba(10,9,8,0.9) 100%)",
                          opacity: 0.6,
                          transition: "opacity 0.4s ease"
                        }}
                      />
                      
                      {/* Number Badge */}
                      <Box
                        className="temple-number"
                        sx={{
                          position: "absolute",
                          top: 20,
                          right: 20,
                          width: 48,
                          height: 48,
                          borderRadius: "50%",
                          bgcolor: "rgba(218,165,32,0.9)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 900,
                          fontSize: "1.1rem",
                          color: "#000",
                          transition: "all 0.6s ease",
                          boxShadow: "0 4px 12px rgba(218,165,32,0.4)"
                        }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </Box>

                      {/* Location & Era Tags */}
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 16,
                          left: 16,
                          right: 16,
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap"
                        }}
                      >
                        <Chip
                          icon={<LocationOn />}
                          label={getLocale(temple.location)}
                          size="small"
                          sx={{
                            bgcolor: "rgba(0,0,0,0.7)",
                            backdropFilter: "blur(10px)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.2)",
                            fontWeight: 600,
                            "& .MuiChip-icon": { color: "#daa520" }
                          }}
                        />
                        <Chip
                          icon={<Landscape />}
                          label={getLocale(temple.era)}
                          size="small"
                          sx={{
                            bgcolor: "rgba(0,0,0,0.7)",
                            backdropFilter: "blur(10px)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.2)",
                            fontWeight: 600,
                            "& .MuiChip-icon": { color: "#8B0000" }
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Content Section */}
                    <CardContent
                      sx={{
                        p: 3.5,
                        display: "flex",
                        flexDirection: "column",
                        gap: 2.5,
                        flexGrow: 1,
                        bgcolor: "#1a1614"
                      }}
                    >
                      {/* Title */}
                      <Box>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            fontWeight: 800, 
                            color: "#fff",
                            mb: 0.5,
                            fontSize: "1.4rem",
                            letterSpacing: "-0.01em"
                          }}
                        >
                          {getLocale(temple.name)}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: "#daa520",
                            fontWeight: 600,
                            fontSize: "0.95rem"
                          }}
                        >
                          {getLocale(temple.feature)}
                        </Typography>
                      </Box>

                      {/* Description */}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: "rgba(255,255,255,0.7)", 
                          lineHeight: 1.7,
                          fontSize: "0.95rem"
                        }}
                      >
                        {getLocale(temple.description)}
                      </Typography>

                      {/* Highlights */}
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                        {temple.highlights?.slice(0, 2).map((highlight, highlightIndex) => (
                          <Box 
                            key={highlightIndex} 
                            sx={{ 
                              display: "flex", 
                              gap: 1.5, 
                              alignItems: "flex-start",
                              p: 1.5,
                              borderRadius: "12px",
                              bgcolor: "rgba(218,165,32,0.05)",
                              border: "1px solid rgba(218,165,32,0.1)"
                            }}
                          >
                            <Star sx={{ fontSize: 18, color: "#daa520", mt: "2px", flexShrink: 0 }} />
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: "rgba(255,255,255,0.8)", 
                                lineHeight: 1.6,
                                fontSize: "0.9rem"
                              }}
                            >
                              {getLocale(highlight)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      {/* CTA Button */}
                      <Button
                        variant="contained"
                        onClick={() => temple.route && navigate(temple.route)}
                        endIcon={<ArrowForward />}
                        fullWidth
                        sx={{
                          mt: "auto",
                          borderRadius: "12px",
                          py: 1.5,
                          fontWeight: 700,
                          fontSize: "0.95rem",
                          textTransform: "none",
                          background: "linear-gradient(135deg, #daa520 0%, #b8860b 100%)",
                          color: "#000",
                          boxShadow: "0 4px 14px rgba(218,165,32,0.3)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #f0b840 0%, #daa520 100%)",
                            boxShadow: "0 6px 20px rgba(218,165,32,0.4)",
                            transform: "translateY(-2px)"
                          }
                        }}
                      >
                        {getLocale(temple.cta)}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* Five Lands Atlas */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 9, md: 12 },
          background: 'radial-gradient(140% 140% at 0% 10%, #fff8f0 0%, #fffaf5 45%, #ffffff 100%)',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -180,
            right: -140,
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, rgba(211,47,47,0.22), transparent 65%)',
            filter: 'blur(32px)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -220,
            left: -160,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 70% 70%, rgba(245,124,0,0.20), transparent 60%)',
            filter: 'blur(36px)'
          }}
        />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, px: { xs: 3, sm: 4, md: 6, lg: 7 } }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography
              variant="overline"
              sx={{
                letterSpacing: 4,
                fontWeight: 600,
                textTransform: 'uppercase',
                color: '#b1560f'
              }}
            >
              {i18n.language === 'ta' ? 'தமிழின் திணைகள் வரைபடம்' : 'Tamil Tinai Atlas'}
            </Typography>
            
            <Typography
              variant="h6"
              sx={{
                maxWidth: 940,
                mx: 'auto',
                mt: 2,
                color: 'rgba(34,14,4,0.78)',
                lineHeight: 1.7,
                fontSize: { xs: '1rem', md: '1.08rem' }
              }}
            >
              {i18n.language === 'ta'
                ? 'தமிழரின் அடையாளத்தை வடிவமைக்கும் பண்டைய ஐந்து திணைகளைச் சுற்றி இயங்கும் உயிர்த்துடிப்பு கொண்ட சுற்றுச்சுழல் காட்சி. திணை மாற்றங்களின் பருவம், தெய்வங்கள், வாழ்வியல் அனைத்தையும் ஒருங்கிணைத்து பாரம்பரியத்தை உயிர்ப்பிக்கிறது.'
                : 'An immersive atlas of the classical eco-cultural tinai regions. Explore how landscape, deity, mood, and livelihoods cycle to keep Tamil heritage living and interlinked.'}
            </Typography>
          </Box>

          <Box sx={{ position: 'relative' }}>
            {/* Curved SVG Path connecting the lands in zigzag - visible only on desktop */}
            <Box
              component="svg"
              sx={{
                display: { xs: 'none', md: 'block' },
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none'
              }}
              viewBox="0 0 900 5500"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Kurinji (right center) to Mullai (top center) - inverted S curve */}
              <path
                d="M 585 460 L 620 460 Q 680 460, 720 500 Q 760 560, 760 640 Q 760 740, 720 820 Q 680 900, 600 980 Q 520 1060, 450 1120 L 450 1190"
                fill="none"
                stroke="#C0C0C0"
                strokeWidth="4"
                strokeDasharray="15,10"
                strokeLinecap="round"
                opacity="0.8"
              />
              {/* Mullai (left center) to Marutham (top center) - sideways S */}
              <path
                d="M 315 1420 L 280 1420 Q 220 1420, 180 1480 Q 140 1560, 140 1660 Q 140 1780, 180 1880 Q 220 1980, 280 2060 Q 340 2140, 400 2220 Q 440 2270, 450 2270"
                fill="none"
                stroke="#C0C0C0"
                strokeWidth="4"
                strokeDasharray="15,10"
                strokeLinecap="round"
                opacity="0.8"
              />
              {/* Marutham (right center) to Neithal (top center) - soft reverse S */}
              <path
                d="M 585 2730 L 620 2730 Q 680 2730, 720 2790 Q 760 2870, 760 2980 Q 760 3110, 720 3220 Q 680 3330, 600 3430 Q 520 3530, 450 3600 L 450 3680"
                fill="none"
                stroke="#C0C0C0"
                strokeWidth="4"
                strokeDasharray="15,10"
                strokeLinecap="round"
                opacity="0.8"
              />
              {/* Neithal (left center) to Palai (top center) - vertical cascading */}
              <path
                d="M 315 3910 L 280 3910 Q 220 3910, 180 3990 Q 140 4100, 140 4240 Q 140 4400, 180 4540 Q 220 4680, 280 4800 Q 340 4920, 400 5020 Q 440 5080, 450 5080"
                fill="none"
                stroke="#C0C0C0"
                strokeWidth="4"
                strokeDasharray="15,10"
                strokeLinecap="round"
                opacity="0.8"
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: { xs: 12, md: 20 },
                position: 'relative',
                zIndex: 1
              }}
            >
              {/* Kurinji - TOP LEFT */}
              {(() => {
                const land = FIVE_LANDS.find((item) => item.key === 'kurinji');
                if (!land) return null;
                const originalIndex = FIVE_LANDS.findIndex((item) => item.key === 'kurinji');
                return (
                  <Paper
                    key="five-lands-card-kurinji"
                    elevation={0}
                    sx={{
                      alignSelf: { xs: 'stretch', md: 'flex-start' },
                      width: { xs: '100%', md: '65%' },
                      ml: { md: 0 },
                      position: 'relative',
                      borderRadius: 4,
                      overflow: 'hidden',
                      height: { xs: 420, md: 460 },
                      border: `2px solid ${land.accent}40`,
                      boxShadow: `0 16px 48px ${land.accent}25`,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: `0 24px 64px ${land.accent}35`,
                        borderColor: `${land.accent}60`
                      }
                    }}
                  >
                    {/* Full Background Image */}
                    <Box
                      component="img"
                      src="/src/assests/Kurnji.avif"
                      alt="Kurinji Landscape"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 0
                      }}
                    />
                    
                    {/* Gradient Overlays for readability */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)`,
                        zIndex: 1
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at 30% 40%, ${land.accent}25 0%, transparent 60%)`,
                        zIndex: 1
                      }}
                    />

                    {/* Content Overlay */}
                    <Box 
                      sx={{ 
                        position: 'relative',
                        zIndex: 2,
                        p: { xs: 4, md: 5 }, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2.5,
                        height: '100%',
                        justifyContent: 'flex-end'
                      }}
                    >
                      {/* Badge at top (no background) */}
                      <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ 
                            fontWeight: 900,
                            color: '#FFFFFF',
                            letterSpacing: 2.5,
                            fontSize: '0.85rem',
                            fontFamily: '"Inter", "Roboto", sans-serif'
                          }}
                        >
                          {i18n.language === 'ta'
                            ? `திணை ${originalIndex + 1}`
                            : `TINAI ${String(originalIndex + 1).padStart(2, '0')}`}
                        </Typography>
                      </Box>

                      {/* Title */}
                      <Box>
                        <Typography
                          variant="h4"
                          sx={{ 
                            fontWeight: 900, 
                            color: '#FFFFFF', 
                            letterSpacing: '-0.03em',
                            textShadow: '0 3px 16px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.5)',
                            fontFamily: i18n.language === 'ta' ? '"Noto Serif Tamil", serif' : '"Playfair Display", serif',
                            fontSize: { xs: '1.75rem', md: '2rem' }
                          }}
                        >
                          {getContent(land.name)}
                        </Typography>
                      </Box>

                      {/* Poetic Quote */}
                      <Typography
                        variant="body1"
                        sx={{
                          fontStyle: 'italic',
                          color: 'rgba(255,255,255,0.98)',
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          lineHeight: 1.7,
                          textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.6)',
                          maxWidth: '95%',
                          fontWeight: 400,
                          fontFamily: '"Georgia", "Noto Serif Tamil", serif'
                        }}
                      >
                        {getContent(land.poetic)}
                      </Typography>

                      {/* Tags removed */}

                      {/* CTA Button */}
                      <Button
                        variant="contained"
                        endIcon={<ArrowForward fontSize="small" />}
                        onClick={() => navigate(land.route)}
                        sx={{
                          alignSelf: 'flex-start',
                          mt: 1.5,
                          borderRadius: '999px',
                          px: 4,
                          py: 1.4,
                          fontWeight: 900,
                          fontSize: '0.95rem',
                          letterSpacing: 1.2,
                          textTransform: 'uppercase',
                          background: 'transparent',
                          color: '#FFFFFF',
                          boxShadow: '0 10px 28px rgba(0,0,0,0.4)',
                          fontFamily: '"Inter", "Roboto", sans-serif',
                          border: '2px solid #FFFFFF',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.1)',
                            color: '#FFFFFF',
                            transform: 'translateX(8px) scale(1.05)',
                            boxShadow: '0 14px 36px rgba(255,255,255,0.3)',
                            border: '2px solid #FFFFFF'
                          }
                        }}
                      >
                        {getContent(land.cta)}
                      </Button>
                    </Box>
                  </Paper>
                );
              })()}

              {/* Mullai - RIGHT */}
              {(() => {
                const land = FIVE_LANDS.find((item) => item.key === 'mullai');
                if (!land) return null;
                const originalIndex = FIVE_LANDS.findIndex((item) => item.key === 'mullai');
                return (
                  <Paper
                    key="five-lands-card-mullai"
                    elevation={0}
                    sx={{
                      alignSelf: { xs: 'stretch', md: 'flex-end' },
                      width: { xs: '100%', md: '65%' },
                      mr: { md: 0 },
                      position: 'relative',
                      borderRadius: 4,
                      overflow: 'hidden',
                      height: { xs: 420, md: 460 },
                      border: `2px solid ${land.accent}40`,
                      boxShadow: `0 16px 48px ${land.accent}25`,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: `0 24px 64px ${land.accent}35`,
                        borderColor: `${land.accent}60`
                      }
                    }}
                  >
                    {/* Full Background Image */}
                    <Box
                      component="img"
                      src="/src/assests/mullai.avif"
                      alt="Mullai Landscape"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 0
                      }}
                    />
                    
                    {/* Gradient Overlays for readability */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)`,
                        zIndex: 1
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at 30% 40%, ${land.accent}25 0%, transparent 60%)`,
                        zIndex: 1
                      }}
                    />

                    {/* Content Overlay */}
                    <Box 
                      sx={{ 
                        position: 'relative',
                        zIndex: 2,
                        p: { xs: 4, md: 5 }, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2.5,
                        height: '100%',
                        justifyContent: 'flex-end'
                      }}
                    >
                      {/* Badge at top (no background) */}
                      <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ 
                            fontWeight: 900,
                            color: '#FFFFFF',
                            letterSpacing: 2.5,
                            fontSize: '0.85rem',
                            fontFamily: '"Inter", "Roboto", sans-serif'
                          }}
                        >
                          {i18n.language === 'ta'
                            ? `திணை ${originalIndex + 1}`
                            : `TINAI ${String(originalIndex + 1).padStart(2, '0')}`}
                        </Typography>
                      </Box>

                      {/* Title */}
                      <Box>
                        <Typography
                          variant="h4"
                          sx={{ 
                            fontWeight: 900, 
                            color: '#FFFFFF', 
                            letterSpacing: '-0.03em',
                            textShadow: '0 3px 16px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.5)',
                            fontFamily: i18n.language === 'ta' ? '"Noto Serif Tamil", serif' : '"Playfair Display", serif',
                            fontSize: { xs: '1.75rem', md: '2rem' }
                          }}
                        >
                          {getContent(land.name)}
                        </Typography>
                      </Box>

                      {/* Poetic Quote */}
                      <Typography
                        variant="body1"
                        sx={{
                          fontStyle: 'italic',
                          color: 'rgba(255,255,255,0.98)',
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          lineHeight: 1.7,
                          textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.6)',
                          maxWidth: '95%',
                          fontWeight: 400,
                          fontFamily: '"Georgia", "Noto Serif Tamil", serif'
                        }}
                      >
                        {getContent(land.poetic)}
                      </Typography>

                      {/* Tags removed */}

                      {/* CTA Button */}
                      <Button
                        variant="contained"
                        endIcon={<ArrowForward fontSize="small" />}
                        onClick={() => navigate(land.route)}
                        sx={{
                          alignSelf: 'flex-start',
                          mt: 1.5,
                          borderRadius: '999px',
                          px: 4,
                          py: 1.4,
                          fontWeight: 900,
                          fontSize: '0.95rem',
                          letterSpacing: 1.2,
                          textTransform: 'uppercase',
                          background: 'transparent',
                          color: '#FFFFFF',
                          boxShadow: '0 10px 28px rgba(0,0,0,0.4)',
                          fontFamily: '"Inter", "Roboto", sans-serif',
                          border: '2px solid #FFFFFF',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.1)',
                            color: '#FFFFFF',
                            transform: 'translateX(8px) scale(1.05)',
                            boxShadow: '0 14px 36px rgba(255,255,255,0.3)',
                            border: '2px solid #FFFFFF'
                          }
                        }}
                      >
                        {getContent(land.cta)}
                      </Button>
                    </Box>
                  </Paper>
                );
              })()}

              {/* Marutham - LEFT */}
              {(() => {
                const land = FIVE_LANDS.find((item) => item.key === 'marutham');
                if (!land) return null;
                const originalIndex = FIVE_LANDS.findIndex((item) => item.key === 'marutham');
                return (
                  <Paper
                    key="five-lands-card-marutham"
                    elevation={0}
                    sx={{
                      alignSelf: { xs: 'stretch', md: 'flex-start' },
                      width: { xs: '100%', md: '65%' },
                      ml: { md: 0 },
                      position: 'relative',
                      borderRadius: 4,
                      overflow: 'hidden',
                      height: { xs: 420, md: 460 },
                      border: `2px solid ${land.accent}40`,
                      boxShadow: `0 16px 48px ${land.accent}25`,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: `0 24px 64px ${land.accent}35`,
                        borderColor: `${land.accent}60`
                      }
                    }}
                  >
                    {/* Full Background Image */}
                    <Box
                      component="img"
                      src="/src/assests/marutham.avif"
                      alt="Marutham Landscape"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 0
                      }}
                    />
                    
                    {/* Gradient Overlays for readability */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)`,
                        zIndex: 1
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at 30% 40%, ${land.accent}25 0%, transparent 60%)`,
                        zIndex: 1
                      }}
                    />

                    {/* Content Overlay */}
                    <Box 
                      sx={{ 
                        position: 'relative',
                        zIndex: 2,
                        p: { xs: 4, md: 5 }, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2.5,
                        height: '100%',
                        justifyContent: 'flex-end'
                      }}
                    >
                      {/* Badge at top (no background) */}
                      <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ 
                            fontWeight: 900,
                            color: '#FFFFFF',
                            letterSpacing: 2.5,
                            fontSize: '0.85rem',
                            fontFamily: '"Inter", "Roboto", sans-serif'
                          }}
                        >
                          {i18n.language === 'ta'
                            ? `திணை ${originalIndex + 1}`
                            : `TINAI ${String(originalIndex + 1).padStart(2, '0')}`}
                        </Typography>
                      </Box>

                      {/* Title */}
                      <Box>
                        <Typography
                          variant="h4"
                          sx={{ 
                            fontWeight: 900, 
                            color: '#FFFFFF', 
                            letterSpacing: '-0.03em',
                            textShadow: '0 3px 16px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.5)',
                            fontFamily: i18n.language === 'ta' ? '"Noto Serif Tamil", serif' : '"Playfair Display", serif',
                            fontSize: { xs: '1.75rem', md: '2rem' }
                          }}
                        >
                          {getContent(land.name)}
                        </Typography>
                      </Box>

                      {/* Poetic Quote */}
                      <Typography
                        variant="body1"
                        sx={{
                          fontStyle: 'italic',
                          color: 'rgba(255,255,255,0.98)',
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          lineHeight: 1.7,
                          textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.6)',
                          maxWidth: '95%',
                          fontWeight: 400,
                          fontFamily: '"Georgia", "Noto Serif Tamil", serif'
                        }}
                      >
                        {getContent(land.poetic)}
                      </Typography>

                      {/* Tags removed */}

                      {/* CTA Button */}
                      <Button
                        variant="contained"
                        endIcon={<ArrowForward fontSize="small" />}
                        onClick={() => navigate(land.route)}
                        sx={{
                          alignSelf: 'flex-start',
                          mt: 1.5,
                          borderRadius: '999px',
                          px: 4,
                          py: 1.4,
                          fontWeight: 900,
                          fontSize: '0.95rem',
                          letterSpacing: 1.2,
                          textTransform: 'uppercase',
                          background: 'transparent',
                          color: '#FFFFFF',
                          boxShadow: '0 10px 28px rgba(0,0,0,0.4)',
                          fontFamily: '"Inter", "Roboto", sans-serif',
                          border: '2px solid #FFFFFF',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.1)',
                            color: '#FFFFFF',
                            transform: 'translateX(8px) scale(1.05)',
                            boxShadow: '0 14px 36px rgba(255,255,255,0.3)',
                            border: '2px solid #FFFFFF'
                          }
                        }}
                      >
                        {getContent(land.cta)}
                      </Button>
                    </Box>
                  </Paper>
                );
              })()}

              {/* Neithal - RIGHT */}
              {(() => {
                const land = FIVE_LANDS.find((item) => item.key === 'neithal');
                if (!land) return null;
                const originalIndex = FIVE_LANDS.findIndex((item) => item.key === 'neithal');
                return (
                  <Paper
                    key="five-lands-card-neithal"
                    elevation={0}
                    sx={{
                      alignSelf: { xs: 'stretch', md: 'flex-end' },
                      width: { xs: '100%', md: '65%' },
                      mr: { md: 0 },
                      position: 'relative',
                      borderRadius: 4,
                      overflow: 'hidden',
                      height: { xs: 420, md: 460 },
                      border: `2px solid ${land.accent}40`,
                      boxShadow: `0 16px 48px ${land.accent}25`,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: `0 24px 64px ${land.accent}35`,
                        borderColor: `${land.accent}60`
                      }
                    }}
                  >
                    {/* Full Background Image */}
                    <Box
                      component="img"
                      src="/src/assests/neithal.avif"
                      alt="Neithal Landscape"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 0
                      }}
                    />
                    
                    {/* Gradient Overlays for readability */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)`,
                        zIndex: 1
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at 30% 40%, ${land.accent}30 0%, transparent 70%)`,
                        zIndex: 1
                      }}
                    />

                    {/* Content Overlay */}
                    <Box 
                      sx={{ 
                        position: 'relative',
                        zIndex: 2,
                        p: { xs: 4, md: 5 }, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2.5,
                        height: '100%',
                        justifyContent: 'flex-end'
                      }}
                    >
                      {/* Badge at top (no background) */}
                      <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ 
                            fontWeight: 900,
                            color: '#FFFFFF',
                            letterSpacing: 2.5,
                            fontSize: '0.85rem',
                            fontFamily: '"Inter", "Roboto", sans-serif'
                          }}
                        >
                          {i18n.language === 'ta'
                            ? `திணை ${originalIndex + 1}`
                            : `TINAI ${String(originalIndex + 1).padStart(2, '0')}`}
                        </Typography>
                      </Box>

                      {/* Title */}
                      <Box>
                        <Typography
                          variant="h4"
                          sx={{ 
                            fontWeight: 900, 
                            color: '#FFFFFF', 
                            letterSpacing: '-0.03em',
                            textShadow: '0 3px 16px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.5)',
                            fontFamily: i18n.language === 'ta' ? '"Noto Serif Tamil", serif' : '"Playfair Display", serif',
                            fontSize: { xs: '1.75rem', md: '2rem' }
                          }}
                        >
                          {getContent(land.name)}
                        </Typography>
                      </Box>

                      {/* Poetic Quote */}
                      <Typography
                        variant="body1"
                        sx={{
                          fontStyle: 'italic',
                          color: 'rgba(255,255,255,0.98)',
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          lineHeight: 1.7,
                          textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.6)',
                          maxWidth: '95%',
                          fontWeight: 400,
                          fontFamily: '"Georgia", "Noto Serif Tamil", serif'
                        }}
                      >
                        {getContent(land.poetic)}
                      </Typography>

                      {/* Tags removed */}

                      {/* CTA Button */}
                      <Button
                        variant="contained"
                        endIcon={<ArrowForward fontSize="small" />}
                        onClick={() => navigate(land.route)}
                        sx={{
                          alignSelf: 'flex-start',
                          mt: 1.5,
                          borderRadius: '999px',
                          px: 4,
                          py: 1.4,
                          fontWeight: 900,
                          fontSize: '0.95rem',
                          letterSpacing: 1.2,
                          textTransform: 'uppercase',
                          background: 'transparent',
                          color: '#FFFFFF',
                          boxShadow: '0 10px 28px rgba(0,0,0,0.4)',
                          fontFamily: '"Inter", "Roboto", sans-serif',
                          border: '2px solid #FFFFFF',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.1)',
                            color: '#FFFFFF',
                            transform: 'translateX(8px) scale(1.05)',
                            boxShadow: '0 14px 36px rgba(255,255,255,0.3)',
                            border: '2px solid #FFFFFF'
                          }
                        }}
                      >
                        {getContent(land.cta)}
                      </Button>
                    </Box>
                  </Paper>
                );
              })()}

              {/* Palai - LEFT */}
              {(() => {
                const land = FIVE_LANDS.find((item) => item.key === 'palai');
                if (!land) return null;
                const originalIndex = FIVE_LANDS.findIndex((item) => item.key === 'palai');
                return (
                  <Paper
                    key="five-lands-card-palai"
                    elevation={0}
                    sx={{
                      alignSelf: { xs: 'stretch', md: 'flex-start' },
                      width: { xs: '100%', md: '65%' },
                      ml: { md: 0 },
                      position: 'relative',
                      borderRadius: 4,
                      overflow: 'hidden',
                      height: { xs: 420, md: 460 },
                      border: `2px solid ${land.accent}40`,
                      boxShadow: `0 16px 48px ${land.accent}25`,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: `0 24px 64px ${land.accent}35`,
                        borderColor: `${land.accent}60`
                      }
                    }}
                  >
                    {/* Full Background Image */}
                    <Box
                      component="img"
                      src="/src/assests/palai.avif"
                      alt="Palai Landscape"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: 0
                      }}
                    />
                    
                    {/* Gradient Overlays for readability */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)`,
                        zIndex: 1
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(circle at 30% 40%, ${land.accent}25 0%, transparent 60%)`,
                        zIndex: 1
                      }}
                    />

                    {/* Content Overlay */}
                    <Box 
                      sx={{ 
                        position: 'relative',
                        zIndex: 2,
                        p: { xs: 4, md: 5 }, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 2.5,
                        height: '100%',
                        justifyContent: 'flex-end'
                      }}
                    >
                      {/* Badge at top (no background) */}
                      <Box sx={{ position: 'absolute', top: 24, right: 24 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ 
                            fontWeight: 900,
                            color: '#FFFFFF',
                            letterSpacing: 2.5,
                            fontSize: '0.85rem',
                            fontFamily: '"Inter", "Roboto", sans-serif'
                          }}
                        >
                          {i18n.language === 'ta'
                            ? `திணை ${originalIndex + 1}`
                            : `TINAI ${String(originalIndex + 1).padStart(2, '0')}`}
                        </Typography>
                      </Box>

                      {/* Title */}
                      <Box>
                        <Typography
                          variant="h4"
                          sx={{ 
                            fontWeight: 900, 
                            color: '#FFFFFF', 
                            letterSpacing: '-0.03em',
                            textShadow: '0 3px 16px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.5)',
                            fontFamily: i18n.language === 'ta' ? '"Noto Serif Tamil", serif' : '"Playfair Display", serif',
                            fontSize: { xs: '1.75rem', md: '2rem' }
                          }}
                        >
                          {getContent(land.name)}
                        </Typography>
                      </Box>

                      {/* Poetic Quote */}
                      <Typography
                        variant="body1"
                        sx={{
                          fontStyle: 'italic',
                          color: 'rgba(255,255,255,0.98)',
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          lineHeight: 1.7,
                          textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.6)',
                          maxWidth: '95%',
                          fontWeight: 400,
                          fontFamily: '"Georgia", "Noto Serif Tamil", serif'
                        }}
                      >
                        {getContent(land.poetic)}
                      </Typography>

                      {/* Tags removed */}

                      {/* CTA Button */}
                      <Button
                        variant="contained"
                        endIcon={<ArrowForward fontSize="small" />}
                        onClick={() => navigate(land.route)}
                        sx={{
                          alignSelf: 'flex-start',
                          mt: 1.5,
                          borderRadius: '999px',
                          px: 4,
                          py: 1.4,
                          fontWeight: 900,
                          fontSize: '0.95rem',
                          letterSpacing: 1.2,
                          textTransform: 'uppercase',
                          background: 'transparent',
                          color: '#FFFFFF',
                          boxShadow: '0 10px 28px rgba(0,0,0,0.4)',
                          fontFamily: '"Inter", "Roboto", sans-serif',
                          border: '2px solid #FFFFFF',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.1)',
                            color: '#FFFFFF',
                            transform: 'translateX(8px) scale(1.05)',
                            boxShadow: '0 14px 36px rgba(255,255,255,0.3)',
                            border: '2px solid #FFFFFF'
                          }
                        }}
                      >
                        {getContent(land.cta)}
                      </Button>
                    </Box>
                  </Paper>
                );
              })()}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* CONTACT US SECTION */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          py: { xs: 9, md: 12 },
          color: "#fff",
          background: "radial-gradient(120% 120% at 50% 0%, #31160d 0%, #120705 58%, #070302 100%)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "linear-gradient(140deg, rgba(248,198,143,0.18), rgba(143,64,29,0.08))",
            filter: "blur(12px)",
            opacity: 0.9,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -160,
            left: -120,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "linear-gradient(180deg, rgba(255,221,169,0.14), rgba(143,64,29,0.05))",
            filter: "blur(18px)",
            opacity: 0.8,
          }}
        />

        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, px: { xs: 3, sm: 4, md: 6, lg: 8 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }}>
            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: "relative",
                  height: "100%",
                  borderRadius: "24px",
                  p: { xs: 3.5, md: 4.5 },
                  background: "linear-gradient(165deg, rgba(12,5,3,0.88) 0%, rgba(32,14,7,0.72) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 36px 90px rgba(0,0,0,0.4)",
                  backdropFilter: "blur(12px)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(120% 140% at 0% 0%, rgba(255,184,122,0.18) 0%, transparent 45%)",
                    opacity: 0.85,
                    pointerEvents: "none",
                  }}
                />

                <Box sx={{ position: "relative", zIndex: 1 }}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography
                        variant="overline"
                        sx={{
                          letterSpacing: 4,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          color: "rgba(255,220,170,0.85)",
                        }}
                      >
                        {t('home.contact.infoHeading')}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>
                        {t('home.contact.title')}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "rgba(255,255,255,0.82)",
                        lineHeight: 1.7,
                      }}
                    >
                      {t('home.contact.subtitle')}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.7)",
                        lineHeight: 1.7,
                      }}
                    >
                      {t('home.contact.infoDescription')}
                    </Typography>
                  </Stack>

                  <Divider sx={{ mt: 4, mb: 3, borderColor: "rgba(255,255,255,0.08)" }} />

                  <Stack direction="row" spacing={2}>
                    {contactSocials.map(({ Icon, label, href }) => (
                      <IconButton
                        key={`contact-social-${label}`}
                        component="a"
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        sx={{
                          color: "#f8d8a8",
                          borderRadius: "14px",
                          border: "1px solid rgba(255,255,255,0.16)",
                          backgroundColor: "rgba(255,255,255,0.04)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            backgroundColor: "rgba(255,214,159,0.16)",
                          },
                        }}
                      >
                        <Icon fontSize="small" />
                      </IconButton>
                    ))}
                  </Stack>
                </Box>
              </Box>
            </Grid>

            {/* Contact Form */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: "relative",
                  height: "100%",
                  borderRadius: "24px",
                  p: { xs: 3.5, md: 4.5 },
                  background: "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 36px 90px rgba(0,0,0,0.35)",
                  backdropFilter: "blur(14px)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(80% 120% at 100% 0%, rgba(255,214,159,0.16) 0%, transparent 60%)",
                    pointerEvents: "none",
                    opacity: 0.9,
                  }}
                />

                <Box component="form" sx={{ position: "relative", zIndex: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 1.5 }}>
                    {t('home.contact.formHeading')}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255,255,255,0.7)",
                      mb: 3,
                      lineHeight: 1.6,
                    }}
                  >
                    {t('home.contact.formSubtitle')}
                  </Typography>

                  <TextField
                    fullWidth
                    label={t('home.contact.formName')}
                    variant="outlined"
                    margin="normal"
                    sx={{
                      mt: 1.5,
                      '& .MuiInputBase-root': {
                        borderRadius: 3,
                        backgroundColor: 'rgba(16,7,4,0.45)',
                        color: '#fff',
                        backdropFilter: 'blur(8px)',
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255,255,255,0.65)',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.18)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,214,159,0.45)',
                      },
                      '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#f4cfa0',
                      },
                      '& .MuiInputBase-input': {
                        color: '#fff',
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label={t('home.contact.formEmail')}
                    type="email"
                    variant="outlined"
                    margin="normal"
                    sx={{
                      mt: 1.5,
                      '& .MuiInputBase-root': {
                        borderRadius: 3,
                        backgroundColor: 'rgba(16,7,4,0.45)',
                        color: '#fff',
                        backdropFilter: 'blur(8px)',
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255,255,255,0.65)',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.18)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,214,159,0.45)',
                      },
                      '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#f4cfa0',
                      },
                      '& .MuiInputBase-input': {
                        color: '#fff',
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label={t('home.contact.formMessage')}
                    variant="outlined"
                    margin="normal"
                    multiline
                    rows={5}
                    sx={{
                      mt: 1.5,
                      '& .MuiInputBase-root': {
                        borderRadius: 3,
                        backgroundColor: 'rgba(16,7,4,0.45)',
                        color: '#fff',
                        backdropFilter: 'blur(8px)',
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255,255,255,0.65)',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.18)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,214,159,0.45)',
                      },
                      '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#f4cfa0',
                      },
                      '& .MuiInputBase-input': {
                        color: '#fff',
                      },
                    }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{
                      mt: 3.5,
                      borderRadius: 999,
                      py: 1.4,
                      fontWeight: 700,
                      fontSize: "1rem",
                      letterSpacing: 0.8,
                      textTransform: "uppercase",
                      background: "linear-gradient(135deg, #f4cfa0 0%, #b86a3a 100%)",
                      color: "#261208",
                      boxShadow: "0 16px 40px rgba(244,207,160,0.35)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #ffddb4 0%, #d27f48 100%)",
                        boxShadow: "0 20px 50px rgba(244,207,160,0.45)",
                      },
                    }}
                  >
                    {t('home.contact.formSend')}
                  </Button>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: "center",
                      mt: 2.5,
                      color: "rgba(255,255,255,0.55)",
                    }}
                  >
                    {t('home.contact.formConsent')}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          mt: 8,
          py: 4,
          bgcolor: "#fff",
          textAlign: "center",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          boxShadow: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "#111",
            fontWeight: 900,
            mb: 1,
          }}
        >
          மீன்கொடி | Meenkodi
        </Typography>
        <Typography variant="body2" sx={{ color: "#111", mb: 1 }}>
          © {new Date().getFullYear()} Meenkodi. All rights reserved.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 1 }}>
          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg"
              alt="Facebook"
              style={{ width: 28, filter: "grayscale(1) brightness(0.7)" }}
            />
          </a>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg"
              alt="Instagram"
              style={{ width: 28, filter: "grayscale(1) brightness(0.7)" }}
            />
          </a>
          <a
            href="https://www.youtube.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg"
              alt="YouTube"
              style={{ width: 28, filter: "grayscale(1) brightness(0.7)" }}
            />
          </a>
        </Box>
      </Box>
    </Box>
  );
}