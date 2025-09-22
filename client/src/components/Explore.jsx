import React, { useEffect, useMemo, useRef, useState, useLayoutEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
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

function Explore() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const GOLD_CENTER = "#FFBF00"; // bright gold per reference
  const GOLD_SIDE = "#E6B800"; // slightly deeper side gold

  const categories = useMemo(
    () => [
      { icon: Home, title: t('nav.temples', 'Temples'), path: "temples" },
      { icon: AccountBalance, title: t('nav.kings', 'Kings'), path: "kings" },
      { icon: MenuBook, title: t('nav.literature', 'Literature'), path: "literature" },
      { icon: SportsKabaddi, title: t('nav.dance', 'Dance'), path: "dance" },
      { icon: RestaurantMenu, title: t('nav.foods', 'Foods'), path: "foods" },
      { icon: Celebration, title: t('nav.festivals', 'Festivals'), path: "festivals" },
      { icon: Checkroom, title: t('nav.clothing', 'Clothing'), path: "clothing" },
      { icon: Science, title: t('nav.ancientScience', 'Ancient Science'), path: "ancientscience" },
    ],
    [t]
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
  const visibleCount = 7; // center + 3 per side
  const half = Math.floor(visibleCount / 2);
  const radius = 500; // Z distance component for side cards perspective
  const gap = 170; // keep a little space between smaller cards

  const getCardStyle = (pos) => {
    // pos: 0 is center, +/-1, +/-2 are sides
  const baseOffsetX = -14; // slight nudge to the left as requested
  const scale = pos === 0 ? 1.05 : 0.98 - Math.abs(pos) * 0.035;
  // add a subtle dynamic tilt based on drag direction for more lively feel
  const tiltExtra = isDragging ? clamp(-dragDelta.current * 0.04, -6, 6) : 0; // deg
  const rotateY = pos * -16 + tiltExtra; // slightly softer tilt
    const translateX = pos * gap;
  const translateZ = pos === 0 ? 0 : -Math.abs(pos) * radius * 0.22;
  const opacity = clamp(1 - Math.abs(pos) * 0.12, 0.78, 1);
    const dragOffset = isDragging ? dragDelta.current * 0.5 : 0; // follow finger softly
    return {
      transform: `translate(-50%, -50%) translateX(${baseOffsetX + translateX + dragOffset}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      zIndex: 1000 + (pos === 0 ? 100 : -Math.abs(pos)),
      opacity,
    };
  };

  return (
    <Box
      ref={rootRef}
      sx={{
        backgroundColor: "#fff",
        minHeight: "100vh",
        display: "grid",
        gridAutoRows: "max-content",
        justifyItems: "center",
        alignContent: "start",
        rowGap: { xs: 1.5, sm: 2 },
        px: 0,
        pt: { xs: 2, sm: 3 },
        pb: { xs: 3, sm: 4 },
      }}
    >
      <Typography
        variant="h3"
        component="h1"
        sx={{ fontWeight: 900, color: "#000", textAlign: "center", fontSize: { xs: "1.8rem", sm: "3rem" } }}
      >
        {t('explore.title', 'Explore Everything')}
      </Typography>

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
          mt: { xs: 1, sm: 1.5 },
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
        onWheel={(e) => {
          e.preventDefault();
          onWheel(e);
        }}
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
                <Box
                  onClick={() => handleCardClick(itemIndex, categories[itemIndex].path, isCenter)}
                  sx={{
                    bgcolor: "#fff",
                    backgroundImage: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
                    borderRadius: 4,
                    height: "100%",
                    boxShadow: isCenter ? "0 16px 36px rgba(0,0,0,0.18)" : "0 10px 26px rgba(0,0,0,0.12)",
                    border: "1px solid #eaeaea",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    cursor: "pointer",
                    transition: "box-shadow 200ms ease",
                    position: "relative",
                    // Animated glowing border: only for center card; runs once slowly then leaves a glow
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      borderRadius: "inherit",
                      padding: "1.5px",
                      background: `linear-gradient(180deg, rgba(233, 232, 222, 0.35), rgba(166, 187, 166, 0.35))`,
                      WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                      WebkitMaskComposite: "xor",
                      maskComposite: "exclude",
                      pointerEvents: "none",
                      opacity: isCenter ? 0 : 0,
                      filter: "none",
                      animation: isCenter ? "borderSettle 0.7s ease-out 4.8s forwards" : "none",
                      transition: "opacity 240ms ease",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      borderRadius: "inherit",
                      padding: "1.5px",
                      background: `linear-gradient(90deg,
                          rgba(255,191,0,0) 0%,
                          rgba(255, 191, 0, 1) 30%,
                          rgba(255, 221, 0, 0.91) 50%,
                          rgba(255,191,0,0.14) 70%,
                          rgba(255,191,0,0) 100%)`,
                      backgroundSize: "200% 100%",
                      backgroundRepeat: "no-repeat",
                      WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                      WebkitMaskComposite: "xor",
                      maskComposite: "exclude",
                      pointerEvents: "none",
                      animation: isCenter ? "borderSweep 4.8s linear 1 forwards" : "none",
                      filter: isCenter ? "drop-shadow(0 0 12px rgba(255,191,0,0.6))" : "none",
                      opacity: isCenter ? 1 : 0,
                    },
                    "@keyframes borderSweep": {
                      "0%": {
                        backgroundPosition: "0% 0%",
                        filter: "drop-shadow(0 0 16px rgba(255,191,0,0.95))",
                      },
                      "8%": {
                        filter: "drop-shadow(0 0 9px rgba(255,191,0,0.45))",
                      },
                      "92%": {
                        filter: "drop-shadow(0 0 9px rgba(255,191,0,0.45))",
                      },
                      "100%": {
                        backgroundPosition: "100% 0%",
                        filter: "drop-shadow(0 0 16px rgba(255,191,0,0.95))",
                        opacity: 0,
                      },
                    },
                    "@keyframes borderSettle": {
                      "0%": {
                        opacity: 0,
                        padding: "1.5px",
                        filter: "none",
                      },
                      "100%": {
                        opacity: 1,
                        padding: "4px",
                        filter: "drop-shadow(0 0 36px rgba(255,191,0,0.95)) drop-shadow(0 0 84px rgba(255,191,0,0.55))",
                      },
                    },
                  }}
                >
                  <Cat
                    sx={{
                      fontSize: { xs: 56, sm: 80 },
                      color: isCenter ? GOLD_CENTER : GOLD_SIDE,
                      // increase brightness; no shadows
                      filter: isCenter
                        ? "brightness(1.12) saturate(1.12)"
                        : "brightness(1.06) saturate(1.08)",
                      "& path": {
                        stroke: "rgba(255,255,255,0.25)",
                        strokeWidth: 0.2,
                      },
                    }}
                  />
                  <Typography sx={{ fontWeight: 800, letterSpacing: 0.3, color: "#000", fontSize: { xs: 15, sm: 18 } }}>
                    {categories[itemIndex].title}
                  </Typography>
                </Box>
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
                backgroundColor: isActive ? GOLD_CENTER : "#cfcfcf",
                transition: "all 180ms ease",
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}

export default Explore;
