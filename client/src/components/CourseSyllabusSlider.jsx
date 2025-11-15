import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, IconButton, Card, CardMedia, CardContent, Chip, Button } from "@mui/material";
import { ArrowBackIosNew, ArrowForwardIos, PlayArrow } from "@mui/icons-material";
import { useBilingualContent } from "../utils/bilingualContent";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const AUTO_INTERVAL = 4500;

export default function CourseSyllabusSlider({ slides = [], ctaLabel, ctaRoute }) {
  const getContent = useBilingualContent();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));

  const slidesPerView = isMdUp ? 4 : isSmUp ? 2 : 1;
  const preparedSlides = useMemo(() => slides.filter(Boolean), [slides]);
  const slideCount = preparedSlides.length;
  const maxIndex = Math.max(slideCount - slidesPerView, 0);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    if (!slideCount || maxIndex === 0 || isPaused) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, AUTO_INTERVAL);

    return () => clearTimeout(timer);
  }, [activeIndex, isPaused, maxIndex, slideCount]);

  useEffect(() => {
    setActiveIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  if (!slideCount) {
    return null;
  }

  const slideWidth = 100 / slidesPerView;
  const showDots = maxIndex > 0;
  const dotCount = maxIndex + 1;

  const handlePrev = () => {
    if (!maxIndex) return;
    setActiveIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    if (!maxIndex) return;
    setActiveIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handleDotClick = (index) => setActiveIndex(index);

  const handleCourseClick = (route) => {
    if (route) {
      navigate(route);
    }
  };

  const handleCTA = () => {
    if (ctaRoute) {
      navigate(ctaRoute);
    }
  };

  return (
    <Box sx={{ position: "relative", mt: 2 }}>
      {/* Navigation Arrows */}
      {maxIndex > 0 && (
        <>
          <IconButton
            onClick={handlePrev}
            aria-label="Previous"
            sx={{
              position: "absolute",
              top: "40%",
              left: { xs: -12, md: -50 },
              transform: "translateY(-50%)",
              bgcolor: "rgba(255,255,255,0.95)",
              width: { xs: 40, md: 52 },
              height: { xs: 40, md: 52 },
              zIndex: 10,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(139,0,0,0.1)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                bgcolor: "#8B0000",
                transform: "translateY(-50%) translateX(-4px)",
                boxShadow: "0 12px 32px rgba(139,0,0,0.25)",
                "& svg": {
                  color: "#fff",
                },
              },
            }}
          >
            <ArrowBackIosNew sx={{ fontSize: { xs: 18, md: 20 }, color: "#8B0000" }} />
          </IconButton>

          <IconButton
            onClick={handleNext}
            aria-label="Next"
            sx={{
              position: "absolute",
              top: "40%",
              right: { xs: -12, md: -50 },
              transform: "translateY(-50%)",
              bgcolor: "rgba(255,255,255,0.95)",
              width: { xs: 40, md: 52 },
              height: { xs: 40, md: 52 },
              zIndex: 10,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(139,0,0,0.1)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                bgcolor: "#8B0000",
                transform: "translateY(-50%) translateX(4px)",
                boxShadow: "0 12px 32px rgba(139,0,0,0.25)",
                "& svg": {
                  color: "#fff",
                },
              },
            }}
          >
            <ArrowForwardIos sx={{ fontSize: { xs: 18, md: 20 }, color: "#8B0000" }} />
          </IconButton>
        </>
      )}

      {/* Slides Container */}
      <Box
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        sx={{
          overflow: "hidden",
          px: { xs: 0, sm: 0.5 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: `translateX(-${activeIndex * slideWidth}%)`,
          }}
        >
          {preparedSlides.map((slide, index) => {
            const title = getContent(slide.title);
            const duration = getContent(slide.duration);
            const number = slide.number || String(index + 1).padStart(2, "0");
            const isHovered = hoveredIndex === index;

            return (
              <Box
                key={index}
                sx={{
                  flexShrink: 0,
                  width: `${slideWidth}%`,
                  px: { xs: 1, md: 1.5 },
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Card
                  onClick={() => handleCourseClick(slide.route)}
                  sx={{
                    height: "100%",
                    borderRadius: "16px",
                    overflow: "hidden",
                    cursor: "pointer",
                    position: "relative",
                    bgcolor: "#fff",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 16px 48px rgba(139,0,0,0.15)",
                      "& .card-overlay": {
                        opacity: 1,
                      },
                      "& .play-button": {
                        opacity: 1,
                        transform: "translate(-50%, -50%) scale(1)",
                      },
                    },
                  }}
                >
                  {/* Image */}
                  <Box sx={{ position: "relative", paddingTop: "75%", overflow: "hidden" }}>
                    <CardMedia
                      component="img"
                      image={slide.image}
                      alt={title}
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.6s ease",
                      }}
                    />
                    
                    {/* Dark Overlay */}
                    <Box
                      className="card-overlay"
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)",
                        opacity: 0.6,
                        transition: "opacity 0.4s ease",
                      }}
                    />

                    {/* Number Badge */}
                    <Chip
                      label={number}
                      sx={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        bgcolor: "#8B0000",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "0.9rem",
                        height: 32,
                        borderRadius: "8px",
                        "& .MuiChip-label": {
                          px: 1.5,
                        },
                      }}
                    />

                    {/* Play Button (appears on hover) */}
                    <Box
                      className="play-button"
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%) scale(0.8)",
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        bgcolor: "rgba(255,255,255,0.95)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "all 0.3s ease",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                      }}
                    >
                      <PlayArrow sx={{ fontSize: 32, color: "#8B0000", ml: 0.5 }} />
                    </Box>
                  </Box>

                  {/* Content */}
                  <CardContent sx={{ p: 2.5 }}>
                    <Chip
                      label={duration}
                      size="small"
                      sx={{
                        mb: 1.5,
                        bgcolor: "rgba(139,0,0,0.08)",
                        color: "#8B0000",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        height: 24,
                      }}
                    />
                    
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#1a1a1a",
                        fontSize: "1rem",
                        lineHeight: 1.4,
                        minHeight: 44,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        mb: 1,
                      }}
                    >
                      {title}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: isHovered ? "#8B0000" : "#666",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        transition: "color 0.3s ease",
                      }}
                    >
                      View Details →
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Progress Dots */}
      {showDots && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 1,
            mt: 4,
          }}
        >
          {Array.from({ length: dotCount }).map((_, index) => (
            <Box
              key={index}
              onClick={() => handleDotClick(index)}
              sx={{
                width: activeIndex === index ? 40 : 8,
                height: 8,
                borderRadius: "4px",
                bgcolor: activeIndex === index ? "#8B0000" : "rgba(139,0,0,0.25)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: activeIndex === index ? "#8B0000" : "rgba(139,0,0,0.5)",
                },
              }}
            />
          ))}
        </Box>
      )}

      {/* CTA Button */}
      {ctaLabel && (
        <Box sx={{ textAlign: "center", mt: 5 }}>
          <Button
            variant="contained"
            onClick={handleCTA}
            sx={{
              borderRadius: "50px",
              px: 4,
              py: 1.5,
              fontWeight: 700,
              fontSize: "0.95rem",
              textTransform: "none",
              background: "linear-gradient(135deg, #8B0000 0%, #c41e3a 100%)",
              boxShadow: "0 4px 16px rgba(139,0,0,0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #a00000 0%, #d43446 100%)",
                boxShadow: "0 6px 24px rgba(139,0,0,0.4)",
                transform: "translateY(-2px)",
              },
            }}
          >
            {ctaLabel}
          </Button>
        </Box>
      )}
    </Box>
  );
}
