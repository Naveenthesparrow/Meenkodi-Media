import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Box, Typography, Avatar, IconButton, Button } from '@mui/material';
import ArrowForward from "@mui/icons-material/ArrowForward";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import Add from "@mui/icons-material/Add";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import cldImg from "../utils/cloudinaryImage";

const DirectorsSlider = ({ directors, onNavigate, user, onEdit, onDelete }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const CARD_WIDTH = 300;
  const AUTO_SPEED = 45; // px per second when nobody is touching it
  const RESUME_AFTER_MS = 2500; // pause after a swipe / drag / wheel before auto-scroll resumes

  // One "lap" of cards must be at least as wide as a large screen; the lap is
  // rendered twice and the strip slides by exactly one lap, so the loop is seamless.
  const lap = useMemo(() => {
    if (!directors.length) return [];
    const repeats = Math.max(1, Math.ceil(2200 / (directors.length * CARD_WIDTH)));
    return Array.from({ length: repeats }, () => directors).flat();
  }, [directors]);
  // Three laps: we keep the scroll position inside the middle one, so you can
  // scroll freely in either direction forever.
  const trackItems = useMemo(() => [...lap, ...lap, ...lap], [lap]);

  const scrollerRef = useRef(null);
  const hovering = useRef(false);
  const resumeAt = useRef(0);
  const mouseDrag = useRef(null); // { x, left, moved }
  const suppressClick = useRef(false);

  // Auto-scroll + infinite wrap. Native scrolling does the rest (momentum, trackpad, touch).
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !lap.length) return undefined;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lapWidth = () => el.scrollWidth / 3;
    el.scrollLeft = lapWidth(); // start in the middle lap

    // keep the position inside the middle lap (the laps are identical, so the jump is invisible)
    const wrap = () => {
      const w = lapWidth();
      if (!w) return;
      if (el.scrollLeft < w * 0.5) el.scrollLeft += w;
      else if (el.scrollLeft > w * 1.5) el.scrollLeft -= w;
    };
    const pauseForUser = () => { resumeAt.current = performance.now() + RESUME_AFTER_MS; };

    let pos = el.scrollLeft;
    let last = performance.now();
    let frame = requestAnimationFrame(function step(now) {
      const dt = Math.min(now - last, 100);
      last = now;
      const visible = document.visibilityState === 'visible';
      if (!reduceMotion && visible && !hovering.current && !mouseDrag.current && now > resumeAt.current) {
        if (Math.abs(el.scrollLeft - pos) > 2) pos = el.scrollLeft; // the user moved it: continue from there
        pos += (AUTO_SPEED * dt) / 1000;
        el.scrollLeft = pos;
        if (Math.abs(el.scrollLeft - pos) > 2) pos = el.scrollLeft;
      } else {
        pos = el.scrollLeft;
      }
      frame = requestAnimationFrame(step);
    });

    el.addEventListener('scroll', wrap, { passive: true });
    el.addEventListener('wheel', pauseForUser, { passive: true });
    el.addEventListener('touchstart', pauseForUser, { passive: true });
    el.addEventListener('touchmove', pauseForUser, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('scroll', wrap);
      el.removeEventListener('wheel', pauseForUser);
      el.removeEventListener('touchstart', pauseForUser);
      el.removeEventListener('touchmove', pauseForUser);
    };
  }, [lap]);

  // Mouse: click-and-drag to scroll (touch and trackpads scroll natively)
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    mouseDrag.current = { x: e.clientX, left: scrollerRef.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e) => {
    const d = mouseDrag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 6) return;
    if (!d.moved) {
      d.moved = true;
      scrollerRef.current.classList.add('dragging');
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    scrollerRef.current.scrollLeft = d.left - dx;
  };
  const endMouseDrag = () => {
    const d = mouseDrag.current;
    mouseDrag.current = null;
    if (!d) return;
    scrollerRef.current.classList.remove('dragging');
    resumeAt.current = performance.now() + RESUME_AFTER_MS;
    if (d.moved) {
      suppressClick.current = true; // the drag shouldn't also open the card under the mouse
      setTimeout(() => { suppressClick.current = false; }, 0);
    }
  };
  const onClickCapture = (e) => {
    if (suppressClick.current) { e.preventDefault(); e.stopPropagation(); }
  };

  const handleCardClick = useCallback((slug) => {
    if (slug) {
      if (onNavigate) onNavigate();
      navigate(`/poets/${slug}`);
    }
  }, [navigate, onNavigate]);

  // Enhanced gradient colors for each card
  const cardGradients = useMemo(() => [
    'linear-gradient(135deg, #8B0000 0%, #DC143C 50%, #FF6B6B 100%)', // Deep Red to Crimson
    'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)', // Royal Blue
    'linear-gradient(135deg, #115e59 0%, #14b8a6 50%, #5eead4 100%)', // Teal
    'linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #fb923c 100%)', // Heritage Orange
  ], []);

  return (
    <FadeEdges>
    <SliderContainer
      ref={scrollerRef}
      style={{ '--width': `${CARD_WIDTH}px`, '--height': '400px' }}
      onMouseEnter={() => { hovering.current = true; }}
      onMouseLeave={() => { hovering.current = false; endMouseDrag(); }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endMouseDrag}
      onPointerCancel={endMouseDrag}
      onClickCapture={onClickCapture}
    >
      <div className="list">
        {trackItems.map((member, index) => (
          <div
            className="item"
            key={`${member._id || member.slug}-${index}`}
            aria-hidden={index >= directors.length ? true : undefined}
          >
            <div 
              className="card" 
              onClick={() => handleCardClick(member.slug)}
              style={{ 
                cursor: member.slug ? 'pointer' : 'default',
                '--card-gradient': cardGradients[(index % directors.length) % cardGradients.length]
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
                    transition: "transform 0.4s ease"
                  }}
                  className="middle-ring"
                />

                <Avatar
                  src={cldImg(member.image, 800)}
                  imgProps={{ loading: 'lazy', decoding: 'async', draggable: false }}
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
                <Box sx={{ minHeight: '3.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                </Box>

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

                <Box sx={{ minHeight: '4.4rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
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
              </Box>

              {/* Profile link (the whole card is clickable too) */}
              {member.slug && (
                <Box sx={{ pt: 1.5, zIndex: 2 }}>
                  <Button
                    size="small"
                    className="profile-btn"
                    endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                    tabIndex={-1}
                    sx={{
                      background: `var(--card-gradient)`,
                      color: "#fff",
                      borderRadius: 999,
                      px: 2,
                      py: 0.5,
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      letterSpacing: 0.3,
                      textTransform: 'none',
                      boxShadow: "0 4px 14px rgba(139,0,0,0.18)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": { transform: "translateY(-2px)", boxShadow: "0 8px 22px rgba(139,0,0,0.3)" },
                    }}
                  >
                    {i18n.language === 'ta' ? 'மேலும் அறிய' : 'View profile'}
                  </Button>
                </Box>
              )}
            </div>
          </div>
        ))}
      </div>
    </SliderContainer>
    </FadeEdges>
  );
};

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(5deg); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// The soft fade at both edges lives on this still frame, not on the scrolling strip,
// so the browser can scroll the strip without repainting it every frame.
const FadeEdges = styled.div`
  mask-image: linear-gradient(to right, transparent, #000 6% 94%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, #000 6% 94%, transparent);
  @media (prefers-reduced-motion: reduce) {
    mask-image: none;
    -webkit-mask-image: none;
  }
`;

const SliderContainer = styled.div`
  width: 100%;
  /* A real horizontal scroller: swipe, trackpad and drag all move it freely */
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain; /* sideways swipes never trigger browser back/forward */
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  cursor: grab;
  &.dragging { cursor: grabbing; user-select: none; }
  padding: 24px 0 32px; /* room for the hover lift and shadows */

  .list {
    display: flex;
    width: max-content;
  }

  .item {
    flex: 0 0 var(--width);
    width: var(--width);
    height: var(--height);
    padding: 0 12px;
    transition: opacity 0.4s ease;
  }

  /* gently fade the other cards (opacity is cheap; the old blur filter was not) */
  &:hover .item:not(:hover) {
    opacity: 0.6;
  }

  .card {
    width: 100%;
    height: 100%;
    padding: 28px 20px 24px;
    background: linear-gradient(135deg, #ffffff 0%, #fefdfb 50%, #fff9f0 100%);
    border: 2px solid transparent;
    border-radius: 20px;
    box-shadow:
      0 8px 28px rgba(139, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    transition: transform 0.45s cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 0.45s ease;
    position: relative;
    overflow: hidden;
  }

  .bg-ornament {
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, var(--card-gradient) 0%, transparent 70%);
    opacity: 0.03;
    pointer-events: none;
    z-index: 0;
  }

  .top-strip {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: var(--card-gradient);
    border-radius: 20px 20px 0 0;
    z-index: 1;
  }

  .card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    padding: 2px;
    background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.8) 100%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: 1;
  }

  /* the profile button sits at the bottom of every card, so all cards line up */
  .profile-btn { margin-top: auto; }
  .card > :last-child { margin-top: auto; }

  .item:hover .card {
    transform: translateY(-10px);
    box-shadow:
      0 22px 50px rgba(139, 0, 0, 0.16),
      inset 0 1px 0 rgba(255, 255, 255, 1);
  }

  .item:hover .admin-controls-overlay {
    opacity: 1;
    transform: translateY(0);
  }

  .item:hover .card::after { opacity: 1; }
  .item:hover .glow-ring { opacity: 0.3; }
  .item:hover .rotating-ring { animation: ${rotate} 3s linear infinite; }
  .item:hover .middle-ring { transform: scale(1.06); }
  .item:hover .avatar { transform: scale(1.04); }

  .item:hover .sparkle-1,
  .item:hover .sparkle-2 {
    opacity: 1;
    animation: ${float} 2s ease-in-out infinite;
  }

  .profile-btn { position: relative; overflow: hidden; }
  .profile-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
    background-size: 200% 100%;
  }
  .item:hover .profile-btn::before { animation: ${shimmer} 3s infinite; }

  @media (max-width: 768px) {
    --width: 260px !important;
    .card { padding: 22px 16px 20px; }
  }

`;

export default React.memo(DirectorsSlider);
