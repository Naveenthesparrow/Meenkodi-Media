import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Stack,
  Chip,
} from "@mui/material";
import {
  ArrowBackIosNew,
  ArrowForwardIos,
} from "@mui/icons-material";
import { useBilingualContent } from "../utils/bilingualContent";

const AUTO_ADVANCE_MS = 7000;

export default function HeritageHeroSlider({ slides = [], autoInterval = AUTO_ADVANCE_MS }) {
  const navigate = useNavigate();
  const getContent = useBilingualContent();
  const { i18n } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const preparedSlides = useMemo(
    () => slides.filter(Boolean),
    [slides]
  );
  const slideCount = preparedSlides.length;

  useEffect(() => {
    if (!slideCount || isPaused) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % slideCount);
    }, autoInterval);

    return () => clearTimeout(timer);
  }, [activeIndex, autoInterval, isPaused, slideCount]);

  if (!slideCount) {
    return null;
  }

  const handleNavigate = (route) => {
    if (route) {
      navigate(route);
    }
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + slideCount) % slideCount);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % slideCount);
  };

  const handleDotClick = (index) => {
    setActiveIndex(index);
  };

  return (
    <Box
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      sx={{
        position: "relative",
        borderRadius: 6,
        overflow: "hidden",
        height: { xs: 360, md: 460 },
        bgcolor: "#000",
        boxShadow: "0 28px 68px rgba(0,0,0,0.3)",
      }}
    >
      {preparedSlides.map((slide, index) => {
        const localizedTitle = getContent(slide.title);
        const localizedDescription = getContent(slide.description);
        const localizedCta = getContent(slide.cta);
        const localizedBadge = getContent(slide.badge);

        const isActive = index === activeIndex;

        return (
          <Box
            key={localizedTitle + index}
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `linear-gradient(120deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.68) 100%), url(${slide.image})`,
              backgroundSize: "cover",
              backgroundPosition: slide.backgroundPosition || "center",
              opacity: isActive ? 1 : 0,
              transform: isActive ? "scale(1)" : "scale(1.02)",
              transition: "opacity 0.8s ease, transform 0.8s ease",
              pointerEvents: isActive ? "auto" : "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box sx={{ px: { xs: 4, sm: 6, md: 8 }, maxWidth: 680 }}>
              {localizedBadge && (
                <Chip
                  label={localizedBadge}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.12)",
                    color: "#fff",
                    mb: 2,
                    fontWeight: 600,
                    letterSpacing: 0.6,
                  }}
                />
              )}
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: "#fff",
                  mb: 2,
                  fontSize: { xs: "2rem", md: "3rem" },
                  lineHeight: 1.2,
                }}
              >
                {localizedTitle}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255,255,255,0.82)",
                  mb: 3,
                  fontSize: { xs: "1rem", md: "1.1rem" },
                  maxWidth: 600,
                  lineHeight: 1.8,
                }}
              >
                {localizedDescription}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleNavigate(slide.route)}
                sx={{
                  px: 3,
                  py: 1.2,
                  borderRadius: "999px",
                  fontWeight: 700,
                  textTransform: "none",
                }}
              >
                {localizedCta}
              </Button>
            </Box>
          </Box>
        );
      })}

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
        }}
      >
        <IconButton
          onClick={handlePrev}
          sx={{
            bgcolor: "rgba(255,255,255,0.16)",
            color: "#fff",
            "&:hover": { bgcolor: "rgba(255,255,255,0.28)" },
          }}
          aria-label={i18n.language === "ta" ? "முந்தையது" : "Previous"}
        >
          <ArrowBackIosNew fontSize="small" />
        </IconButton>
        <IconButton
          onClick={handleNext}
          sx={{
            bgcolor: "rgba(255,255,255,0.16)",
            color: "#fff",
            "&:hover": { bgcolor: "rgba(255,255,255,0.28)" },
          }}
          aria-label={i18n.language === "ta" ? "அடுத்தது" : "Next"}
        >
          <ArrowForwardIos fontSize="small" />
        </IconButton>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        sx={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          bgcolor: "rgba(0,0,0,0.4)",
          borderRadius: "999px",
          px: 2,
          py: 1,
        }}
      >
        {preparedSlides.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <Box
              key={`dot-${index}`}
              component="button"
              onClick={() => handleDotClick(index)}
              aria-label={`Slide ${index + 1}`}
              style={{
                width: isActive ? 26 : 12,
                height: 12,
                borderRadius: 999,
                border: "none",
                backgroundColor: isActive ? "#fff" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            />
          );
        })}
      </Stack>
    </Box>
  );
}
