import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import SEO, { pageSEO } from "./common/SEO";
import PageHeading from './common/PageHeading';
import {
  Home,
  AccountBalance,
  MenuBook,
  SportsKabaddi,
  RestaurantMenu,
  Science,
  Celebration,
  Checkroom,
} from "@mui/icons-material";
import GlowCard from "./common/GlowCard";

function Explore() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  // Removed gold accents; using neutral styling

  const categories = useMemo(
    () => [
      { icon: Home, titleKey: "explore.temples", path: "temples" },
      { icon: AccountBalance, titleKey: "explore.kings", path: "kings" },
      { icon: MenuBook, titleKey: "explore.literature", path: "literature" },
      { icon: SportsKabaddi, titleKey: "explore.dance", path: "dance" },
      { icon: RestaurantMenu, titleKey: "explore.foods", path: "foods" },
      { icon: Celebration, titleKey: "explore.festivals", path: "festivals" },
      { icon: Checkroom, titleKey: "explore.clothing", path: "clothing" },
      { icon: Science, titleKey: "explore.ancientscience", path: "ancientscience" },
    ],
    []
  );

  // Carousel state
  const [centerIndex, setCenterIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dragStartX = useRef(0);
  const dragStartY = useRef(0);
  const dragDelta = useRef(0);
  const clickGuard = useRef(false);
  const animTimerRef = useRef(null);
  const wheelCooldownRef = useRef(0);
  const indexRef = useRef(0);
  const animStepsRef = useRef(0);
  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const [availHeight, setAvailHeight] = useState(null);
  const lastMoveX = useRef(0);
  const lastMoveT = useRef(0);
  const velocityRef = useRef(0);

  // Measure available viewport height below the header so content centers truly in the visible area
  useLayoutEffect(() => {
    const measure = () => {
      if (!rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const padding = 24; // small safety padding
      const h = Math.max(340, Math.floor(vh - rect.top - padding));
      setAvailHeight(h);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Ensure browser doesn't horizontally scroll the page during wheel/touch interactions
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const wheelHandler = (ev) => {
      ev.preventDefault();
      onWheel(ev);
    };
    const touchMoveHandler = (ev) => {
      if (!isDragging) return;
      const t = ev.touches?.[0];
      if (!t) return;
      const dx = Math.abs(t.clientX - dragStartX.current);
      const dy = Math.abs(t.clientY - dragStartY.current);
      if (dx > dy) ev.preventDefault();
    };

    el.addEventListener("wheel", wheelHandler, { passive: false });
    el.addEventListener("touchmove", touchMoveHandler, { passive: false });
    return () => {
      el.removeEventListener("wheel", wheelHandler);
      el.removeEventListener("touchmove", touchMoveHandler);
    };
  }, [isDragging]);

  useEffect(() => {
    indexRef.current = centerIndex;
  }, [centerIndex]);

  const total = categories.length;
  const wrap = (i) => (i + total) % total;

  const shiftLeft = () => setCenterIndex((i) => wrap(i + 1));
  const shiftRight = () => setCenterIndex((i) => wrap(i - 1));

  const stopAnim = () => {
    if (animTimerRef.current) {
      clearTimeout(animTimerRef.current);
      animTimerRef.current = null;
    }
    setIsAnimating(false);
  };

  const animateTo = (targetIndex) => {
    if (targetIndex === centerIndex) return;
    stopAnim();
    setIsAnimating(true);
    animStepsRef.current = 0;

    const step = () => {
      // Compute shortest direction
      const curr = indexRef.current;
      const diff = (targetIndex - curr + total) % total; // 0..total-1
      if (diff === 0) {
        stopAnim();
        return;
      }
      // Hard guard: never exceed a full loop + buffer
      if (animStepsRef.current > total + 8) {
        stopAnim();
        return;
      }
      if (diff <= total / 2) {
        // move left (next index)
        setCenterIndex((i) => wrap(i + 1));
      } else {
        // move right (prev index)
        setCenterIndex((i) => wrap(i - 1));
      }
      animTimerRef.current = setTimeout(step, 150);
      animStepsRef.current += 1;
    };

    step();
  };

  // Cleanup any pending timers on unmount
  useEffect(() => {
    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, []);

  const onPointerDown = (e) => {
    setIsDragging(true);
    clickGuard.current = false;
    dragStartX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    dragStartY.current = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    dragDelta.current = 0;
    lastMoveX.current = dragStartX.current;
    lastMoveT.current = Date.now();
    velocityRef.current = 0;
  };
  const onPointerMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches?.[0];
    const x = e.clientX ?? touch?.clientX ?? 0;
    const y = e.clientY ?? touch?.clientY ?? 0;
    const now = Date.now();
    dragDelta.current = x - dragStartX.current;
    // If gesture is primarily horizontal, prevent page scroll
    const absX = Math.abs(x - dragStartX.current);
    const absY = Math.abs(y - dragStartY.current);
    if (absX > absY) {
      e.preventDefault();
    }
    // simple velocity estimate (px/ms)
    const dx = x - lastMoveX.current;
    const dt = Math.max(1, now - lastMoveT.current);
    velocityRef.current = dx / dt;
    lastMoveX.current = x;
    lastMoveT.current = now;
    if (Math.abs(dragDelta.current) > 6) clickGuard.current = true;
  };
  const onPointerUp = () => {
    if (!isDragging) return;
    const threshold = 40; // px to trigger slide
    const v = velocityRef.current; // px/ms
    const goLeft = dragDelta.current <= -threshold || v < -0.6;
    const goRight = dragDelta.current >= threshold || v > 0.6;

    // End drag first so CSS transition becomes active, then shift on next frame
    setIsDragging(false);
    if (goLeft || goRight) {
      requestAnimationFrame(() => {
        if (goLeft) shiftLeft();
        else if (goRight) shiftRight();
      });
    }
    dragDelta.current = 0;
    velocityRef.current = 0;
  };

  const handleCardClick = (itemIndex, path, isCenter) => {
    if (clickGuard.current || isAnimating) return; // treat as drag or animation, not click
    if (!isCenter) {
      animateTo(itemIndex);
      return;
    }
    navigate(`/explore/${path}`);
  };

  const onWheel = (e) => {
    const now = Date.now();
  if (now - wheelCooldownRef.current < 400 || isAnimating) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (delta > 6) {
      shiftLeft();
      wheelCooldownRef.current = now;
    } else if (delta < -6) {
      shiftRight();
      wheelCooldownRef.current = now;
    }
  };

  // Positioning logic for 3D look
  // Use responsive gap so cards center nicely on small viewports
  const computeGap = (w) => (w < 420 ? 110 : w < 600 ? 130 : w < 900 ? 170 : 220);
  const [gapX, setGapX] = useState(() => (typeof window !== 'undefined' ? computeGap(window.innerWidth) : 170));
  const [isLarge, setIsLarge] = useState(() => (typeof window !== 'undefined' ? window.innerWidth >= 900 : false));
  useEffect(() => {
    const onResize = () => {
      setGapX(computeGap(window.innerWidth));
      setIsLarge(window.innerWidth >= 900);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const visibleCount = 7; // center + 3 per side
  const half = Math.floor(visibleCount / 2);
  const radius = isLarge ? 380 : 500; // Z distance component for side cards perspective (flatter on large screens)

  const getCardStyle = (pos) => {
    // pos: 0 is center, +/-1, +/-2 are sides
    const baseOffsetX = 0; // no extra lateral nudge — center should be exact
    // Tuned center card scale for different screen sizes
    const centerScale = isLarge ? 1.1 : (gapX < 130 ? 1.08 : 1.05);
    const scale = pos === 0 ? centerScale : 0.98 - Math.abs(pos) * 0.035;
    // add a subtle dynamic tilt based on drag direction for more lively feel
    const tiltExtra = isDragging ? clamp(-dragDelta.current * 0.04, -6, 6) : 0; // deg
    const rotateY = pos * -16 + tiltExtra; // slightly softer tilt
    const translateX = pos * gapX;
    const translateZ = pos === 0 ? 0 : -Math.abs(pos) * radius * 0.22;
    // Move center card upward on large screens, slightly upward on small screens
    const translateY = pos === 0 ? (isLarge ? -14 : (gapX < 130 ? -6 : 0)) : 0;
    const opacity = clamp(1 - Math.abs(pos) * 0.12, 0.78, 1);
    const dragOffset = isDragging ? dragDelta.current * 0.5 : 0; // follow finger softly
    return {
      transform: `translate(-50%, -50%) translateY(${translateY}px) translateX(${baseOffsetX + translateX + dragOffset}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      zIndex: 1000 + (pos === 0 ? 100 : -Math.abs(pos)),
      opacity,
    };
  };

    return (
    <Box
      ref={rootRef}
      sx={{
        backgroundColor: "#fff",
        /* Repeating fish pattern (SVG data URI) in black;
           - Extremely subtle by default (tiny size + very low opacity)
           - Becomes visible on high-resolution / when users zoom (min-resolution:1.5dppx)
        */
        backgroundImage: {
          xs: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.02' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`,
          md: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.03' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`
        },
        backgroundSize: { xs: '8px 8px', md: '6px 6px' },
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center top',
        '@media (min-resolution: 1.5dppx)': {
          backgroundImage: {
            xs: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.12' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`,
            md: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.14' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`
          },
          backgroundSize: { xs: '18px 18px', md: '14px 14px' }
        },
        minHeight: "100vh",
        display: "grid",
        gridAutoRows: "max-content",
        justifyItems: "center",
        alignContent: "start",
        rowGap: { xs: 1.5, sm: 2 },
        px: 0,
        // Reduce top padding significantly so content moves higher on the page
        pt: { xs: 2, sm: 3, md: 3 },
        pb: { xs: 3, sm: 4 },
      }}
    >
      <SEO {...pageSEO.explore} />
      <PageHeading>
        {t('explore.title')}
      </PageHeading>

      <Box
        sx={{
          perspective: 1200,
          perspectiveOrigin: "50% 50%",
          position: "relative",
          width: "min(88vw, 1300px)",
          height: { xs: 300, sm: 460 },
          maxWidth: 1300,
          userSelect: isDragging ? "none" : "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mt: { xs: 2, sm: 3, md: 0 }, // move cards up on md+ screens
          overflow: "hidden",
          touchAction: "pan-y",
          overscrollBehaviorX: "none",
        }}
        ref={stageRef}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
      >
        {/* Left/Right invisible edges for tap to rotate on mobile if desired (optional) */}
        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {Array.from({ length: visibleCount }).map((_, i) => {
            const pos = i - half; // -2..2
            const itemIndex = wrap(centerIndex + pos);
            const Cat = categories[itemIndex].icon;
            const isCenter = pos === 0;
            return (
              <Box
                key={`item-${itemIndex}`}
                sx={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transformStyle: "preserve-3d",
                  transition: isDragging ? "none" : "transform 320ms cubic-bezier(.2,.6,.2,1), opacity 260ms ease-out",
                  width: { xs: 200, sm: 300 },
                  height: { xs: 260, sm: 360 },
                  willChange: "transform, opacity",
                }}
                style={getCardStyle(pos)}
              >
                <GlowCard
                  onClick={() => handleCardClick(itemIndex, categories[itemIndex].path, isCenter)}
                  customSize
                  width="100%"
                  height="100%"
                  className={`!flex !flex-col !items-center !justify-center gap-3 cursor-pointer transition-shadow duration-200 ${isCenter ? "shadow-[0_16px_36px_rgba(0,0,0,0.28)]" : "shadow-[0_10px_26px_rgba(0,0,0,0.18)]"}`}
                  style={{ borderRadius: "16px", backgroundColor: "rgba(255,255,255,0.86)", border: "1px solid rgba(255,255,255,0.4)" }}
                >
                  <Cat
                    sx={{
                      fontSize: { xs: 56, sm: 80 },
                      color: "#000",
                      position: "relative",
                      zIndex: 1,
                    }}
                  />
                  <Typography sx={{ fontWeight: 900, letterSpacing: 0.4, color: "#8B0000", fontSize: { xs: 15, sm: 18 }, textTransform: "uppercase", position: "relative", zIndex: 1 }}>
                    {t(categories[itemIndex].titleKey)}
                  </Typography>
                </GlowCard>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Pagination dots */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center", justifyContent: "center", mt: 1 }}>
        {categories.map((_, idx) => {
          const isActive = idx === centerIndex;
          return (
            <Box
              key={`dot-${idx}`}
              sx={{
                width: isActive ? 9 : 7,
                height: isActive ? 9 : 7,
                borderRadius: "50%",
                backgroundColor: isActive ? "#000" : "#cfcfcf",
                transition: "all 180ms ease",
              }}
            />
          );
        })}
      </Box>

      {/* Back Button */}
      <Box sx={{ mt: 6, mb: 4, textAlign: 'center' }}>
        <Button
          onClick={() => navigate('/')}
          variant="outlined"
          sx={{
            color: '#000',
            borderColor: '#000',
            borderWidth: 2,
            borderRadius: 0,
            px: 4,
            py: 1.5,
            fontWeight: 700,
            fontFamily: 'Georgia, serif',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            '&:hover': {
              bgcolor: '#000',
              borderColor: '#000',
              color: '#fff',
            }
          }}
        >
          ← {t('actions.backToHome', 'Back to Home')}
        </Button>
      </Box>
    </Box>
  );
}

export default Explore;
