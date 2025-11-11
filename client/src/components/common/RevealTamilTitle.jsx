import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

// Robust grapheme splitter using Intl.Segmenter when available; fallback to Array.from
function splitGraphemes(text, locale = "ta") {
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    try {
      const segmenter = new Intl.Segmenter(locale, { granularity: "grapheme" });
      return Array.from(segmenter.segment(text), (s) => s.segment);
    } catch {}
  }
  // Fallback: better than .split("") for most unicode
  return Array.from(text);
}

/**
 * Animated big-title reveal designed specifically for the Tamil title
 * "மீண்டெழும் பாண்டியம்". It animates each grapheme with a spring-in,
 * shows an image-text hover reveal, and a sweeping overlay color pass
 * once all letters have entered.
 */
export default function RevealTamilTitle({
  text = "மீண்டெழும் பாண்டியம்",
  textColor = "text-white",
  overlayColor = "text-red-500",
  // Use CSS clamp to keep the title tasteful across sizes (smaller, per request)
  fontSizeClamp = "clamp(1.0rem, 3.6vw, 2.2rem)",
  letterDelay = 0.12, // slower staggering for gentle load
  overlayDelay = 0.06, // seconds between overlay sweeps per letter
  overlayDuration = 0.45, // seconds overlay visibility
  springDuration = 600, // ms to wait after last letter before overlay
  autoFit = true, // scale down to fit container if needed
  minScale = 0.8, // don't shrink below this
  letterImages = [
    // Curated unsplash textures; cycles through for each letter
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=60",
    "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=60",
    "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=60",
    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=60",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=60",
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=60",
    "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&w=1200&q=60",
    "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?auto=format&fit=crop&w=1200&q=60",
  ],
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showOverlaySweep, setShowOverlaySweep] = useState(false);

  const letters = useMemo(() => splitGraphemes(text, "ta"), [text]);

  // Reduced motion support
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(!!mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced) return; // no overlay in reduced motion mode
    // Calculate when the last letter animation completes, then trigger overlay
    const lastLetterDelay = (letters.length - 1) * letterDelay; // seconds
    const totalDelayMs = lastLetterDelay * 1000 + springDuration;
    const id = setTimeout(() => setShowOverlaySweep(true), totalDelayMs);
    return () => clearTimeout(id);
  }, [letters.length, letterDelay, springDuration, reduced]);

  // Auto-fit: measure and scale down content if it overflows container width
  const containerRef = React.useRef(null);
  const contentRef = React.useRef(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    if (!autoFit) return;
    const el = containerRef.current;
    const content = contentRef.current;
    if (!el || !content) return;
    const compute = () => {
      const cw = el.clientWidth;
      const iw = content.scrollWidth;
      if (cw && iw) {
        const s = Math.min(1, Math.max(minScale, (cw * 0.98) / iw));
        setScale(s);
      }
    };
    compute();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(compute) : null;
    ro?.observe(el);
    window.addEventListener('resize', compute);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, [autoFit, minScale, text]);

  if (reduced) {
    // Accessible fallback: static text without animations
    return (
      <div className="flex items-center justify-center" style={{ fontSize: fontSizeClamp }}>
        <span className={`font-black tracking-tight ${textColor}`}>
          {text}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: 'easeOut' }}
      ref={containerRef}
      className="flex items-center justify-center relative select-none w-full"
      style={{ fontSize: fontSizeClamp }}
    >
      <div
        ref={contentRef}
        className="flex flex-wrap gap-x-0.5 sm:gap-x-1 leading-[1.15]"
        style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
      >
        {letters.map((letter, index) => (
          <motion.span
            key={`${letter}-${index}`}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`font-black tracking-tight cursor-pointer relative inline-block py-[0.05em]`}
            initial={{ scale: 0.8, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{
              delay: index * letterDelay,
              type: "spring",
              damping: 18,
              stiffness: 120,
              mass: 0.9,
            }}
          >
            {/* Sizer to ensure full glyph extents (avoid clipping diacritics) */}
            <span aria-hidden="true" className="invisible select-none">{letter}</span>
            {/* Base text layer */}
            <motion.span
              className={`absolute inset-0 ${textColor}`}
              animate={{ opacity: hoveredIndex === index ? 0 : 1 }}
              transition={{ duration: 0.12 }}
            >
              {letter}
            </motion.span>

            {/* Image text layer with gentle pan on hover */}
            <motion.span
              className="absolute inset-0 text-transparent bg-clip-text bg-cover bg-no-repeat"
              animate={{
                opacity: hoveredIndex === index ? 1 : 0,
                backgroundPosition: hoveredIndex === index ? "10% center" : "0% center",
              }}
              transition={{
                opacity: { duration: 0.2 },
                backgroundPosition: { duration: 3.2, ease: "easeInOut" },
              }}
              style={{
                backgroundImage: `url('${letterImages[index % letterImages.length]}')`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {letter}
            </motion.span>

            {/* Overlay sweep layer */}
            {showOverlaySweep && (
              <motion.span
                className={`absolute inset-0 ${overlayColor} pointer-events-none`}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{
                  delay: index * overlayDelay,
                  duration: overlayDuration,
                  times: [0, 0.12, 0.72, 1],
                  ease: "easeInOut",
                }}
              >
                {letter}
              </motion.span>
            )}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
