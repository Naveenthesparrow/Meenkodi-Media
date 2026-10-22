import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, IconButton, Card, CardMedia, CardContent, Chip, Button } from "@mui/material";
import ArrowBackIosNew from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIos from "@mui/icons-material/ArrowForwardIos";
import PlayArrow from "@mui/icons-material/PlayArrow";
import { useBilingualContent } from "../utils/bilingualContent";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const AUTO_INTERVAL = 4500;
const SLIDE_MS = 550;
const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";
const DRAG_START_PX = 8; // movement before we decide it's a horizontal swipe

export default function CourseSyllabusSlider({ slides = [], ctaLabel, ctaRoute, onNavigate }) {
  const getContent = useBilingualContent();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const slidesPerView = isMdUp ? 4 : isSmUp ? 2 : 1;
  const preparedSlides = useMemo(() => slides.filter(Boolean), [slides]);
  const slideCount = preparedSlides.length;

  // Three copies of the slides so the track can loop forever: we always sit in the
  // middle copy and silently jump back by one copy after crossing its edges.
  const extendedSlides = useMemo(() => {
    if (!slideCount) return [];
    return [...preparedSlides, ...preparedSlides, ...preparedSlides];
  }, [preparedSlides, slideCount]);

  const middleStart = slideCount;
  const maxIndex = Math.max(slideCount * 3 - slidesPerView, 0);

  const [activeIndex, setActiveIndex] = useState(middleStart);
  const [animate, setAnimate] = useState(true);
  const [dragPx, setDragPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const viewportRef = React.useRef(null);
  const drag = React.useRef(null); // { id, x, y, t, horizontal }
  const suppressClick = React.useRef(false);

  const indexRef = React.useRef(activeIndex);
  indexRef.current = activeIndex;
  const pendingMove = React.useRef(0);

  // Same card in the middle copy (the three copies look identical)
  const toMiddle = React.useCallback((i) => {
    if (!slideCount) return i;
    return middleStart + ((((i - middleStart) % slideCount) + slideCount) % slideCount);
  }, [middleStart, slideCount]);

  const moveBy = React.useCallback((steps) => {
    if (!steps) return;
    const current = indexRef.current;
    const centred = toMiddle(current);
    if (centred !== current) {
      // A quick repeat before the last move re-centred (fast swipes / clicks):
      // snap to the identical card in the middle copy first, then move from there,
      // so the track never runs out of cards on either side.
      cancelAnimationFrame(pendingMove.current);
      setAnimate(false);
      setActiveIndex(centred);
      pendingMove.current = requestAnimationFrame(() => requestAnimationFrame(() => {
        setAnimate(true);
        setActiveIndex(Math.min(Math.max(centred + steps, 0), maxIndex));
      }));
      return;
    }
    setAnimate(true);
    setActiveIndex(Math.min(Math.max(current + steps, 0), maxIndex));
  }, [maxIndex, toMiddle]);

  // Trackpad two-finger sideways swipes: handle them here and stop the browser
  // from treating them as "go back / forward a page". Needs a non-passive listener.
  const moveByRef = React.useRef(moveBy);
  moveByRef.current = moveBy;
  const wheelLock = React.useRef(0);
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return; // vertical: normal page scroll
      e.preventDefault();
      if (Math.abs(e.deltaX) < 25) return;
      const now = Date.now();
      if (now - wheelLock.current < SLIDE_MS) return;
      wheelLock.current = now;
      moveByRef.current(e.deltaX > 0 ? 1 : -1);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [slideCount]);

  // Auto-advance, paused on hover, while dragging, when the tab is hidden,
  // and for visitors who asked for reduced motion.
  useEffect(() => {
    if (!slideCount || slideCount <= slidesPerView || isPaused || isDragging || prefersReducedMotion) return undefined;
    const timer = setTimeout(() => {
      if (document.visibilityState === "visible") moveBy(1);
    }, AUTO_INTERVAL);
    return () => clearTimeout(timer);
  }, [activeIndex, isPaused, isDragging, slideCount, slidesPerView, prefersReducedMotion, moveBy]);

  // Re-centre when the number of visible cards changes (screen resize)
  useEffect(() => {
    setAnimate(false);
    setActiveIndex(middleStart);
  }, [middleStart, slidesPerView, slideCount]);

  // After an instant jump, turn the animation back on for the next move
  useEffect(() => {
    if (animate) return undefined;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(id);
  }, [animate]);

  if (!slideCount) {
    return null;
  }

  const slideWidth = 100 / slidesPerView;
  const showDots = slideCount > slidesPerView;
  const dotCount = Math.max(slideCount - slidesPerView + 1, 1);

  const handlePrev = () => moveBy(-1);
  const handleNext = () => moveBy(1);

  const handleDotClick = (index) => {
    setAnimate(true);
    setActiveIndex(middleStart + index);
  };

  // Only the track's own transform finishing counts — card hover animations bubble up too
  const handleTrackTransitionEnd = (e) => {
    if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
    if (activeIndex >= middleStart + slideCount) {
      setAnimate(false);
      setActiveIndex(activeIndex - slideCount);
    } else if (activeIndex < middleStart) {
      setAnimate(false);
      setActiveIndex(activeIndex + slideCount);
    }
  };

  // ---- Swipe / drag (touch, pen and mouse) ----
  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), horizontal: false };
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.horizontal) {
      if (Math.abs(dy) > DRAG_START_PX && Math.abs(dy) > Math.abs(dx)) { drag.current = null; return; } // vertical page scroll
      if (Math.abs(dx) < DRAG_START_PX) return;
      d.horizontal = true;
      cancelAnimationFrame(pendingMove.current);
      setActiveIndex((i) => toMiddle(i));
      setIsDragging(true);
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    setDragPx(dx);
  };

  const endDrag = (e) => {
    const d = drag.current;
    drag.current = null;
    if (!d || !d.horizontal) return;
    const dx = e.clientX - d.x;
    const width = (viewportRef.current?.clientWidth || 1) / slidesPerView;
    const velocity = dx / Math.max(performance.now() - d.t, 1); // px per ms
    let steps = Math.round(-dx / width);
    if (steps === 0 && (Math.abs(dx) > width * 0.15 || Math.abs(velocity) > 0.35)) steps = dx < 0 ? 1 : -1;
    steps = Math.max(-slidesPerView, Math.min(slidesPerView, steps));
    setIsDragging(false);
    setDragPx(0);
    moveBy(steps);
    if (steps === 0) setAnimate(true);
    // a drag should never also count as a click on the card under the pointer
    suppressClick.current = true;
    setTimeout(() => { suppressClick.current = false; }, 0);
  };

  const onClickCapture = (e) => {
    if (suppressClick.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleCourseClick = (route) => {
    if (route) {
      if (onNavigate) onNavigate();
      navigate(route);
    }
  };

  const handleCTA = () => {
    if (ctaRoute) {
      if (onNavigate) onNavigate();
      navigate(ctaRoute);
    }
  };

  return (
    <Box sx={{ position: "relative", mt: 2 }}>
      {/* Navigation Arrows */}
      {slideCount > slidesPerView && (
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
        ref={viewportRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        sx={{
          overflow: "hidden",
          px: { xs: 0, sm: 0.5 },
          touchAction: "pan-y", // let the page scroll vertically; we handle sideways swipes
          overscrollBehaviorX: "contain", // sideways swipes stay in the slider (no browser back/forward)
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: isDragging ? "none" : "auto",
        }}
      >
        <Box
          onTransitionEnd={handleTrackTransitionEnd}
          sx={{
            display: "flex",
            transition: animate && !isDragging ? `transform ${SLIDE_MS}ms ${EASE}` : "none",
            transform: `translate3d(calc(${-activeIndex * slideWidth}% + ${dragPx}px), 0, 0)`,
            willChange: "transform",
          }}
        >
          {extendedSlides.map((slide, index) => {
            const title = getContent(slide.title);
            const duration = getContent(slide.duration);
            // number should follow logical slide index within single copy
            const logicalIndex = index % slideCount;
            const number = slide.number || String(logicalIndex + 1).padStart(2, "0");
            const isHovered = hoveredIndex === (index % slideCount);

            return (
              <Box
                key={index}
                sx={{
                  flexShrink: 0,
                  width: `${slideWidth}%`,
                  px: { xs: 1, md: 1.5 },
                }}
                onMouseEnter={() => setHoveredIndex(index % slideCount)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Card
                  onClick={() => handleCourseClick(slide.route)}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCourseClick(slide.route); } }}
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
                      loading="lazy"
                      draggable={false}
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
                      onClick={(e) => { e.stopPropagation(); handleCourseClick(slide.route); }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); handleCourseClick(slide.route); } }}
                      sx={{
                        color: isHovered ? "#8B0000" : "#666",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        transition: "color 0.3s ease",
                        cursor: 'pointer',
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
          {(() => {
            // compute active logical position for dots
            const normalized = ((activeIndex - middleStart) % slideCount + slideCount) % slideCount;
            const activeDot = Math.min(normalized, Math.max(slideCount - slidesPerView, 0));
            return Array.from({ length: dotCount }).map((_, index) => (
              <Box
                key={index}
                onClick={() => handleDotClick(index)}
                sx={{
                  width: activeDot === index ? 40 : 8,
                  height: 8,
                  borderRadius: "4px",
                  bgcolor: activeDot === index ? "#8B0000" : "rgba(139,0,0,0.25)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: activeDot === index ? "#8B0000" : "rgba(139,0,0,0.5)",
                  },
                }}
              />
            ));
          })()}
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
