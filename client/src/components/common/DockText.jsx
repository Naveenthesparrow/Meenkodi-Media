import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

/**
 * DockText – macOS-dock style magnification, per-letter.
 * Props:
 * - text: string
 * - to?: string (router link) or onClick?: Function
 * - baseSize?: number (px font-size)
 * - magnification?: number (percent increase at cursor, e.g., 70)
 * - letterGap?: number (px gap between letters)
 * - color?: string
 */
// Grapheme-safe splitter for Indic scripts (Tamil, etc.) and all locales.
// Prefers Intl.Segmenter; falls back to a minimal joiner that keeps combining marks
// and ZWJ/ZWNJ attached to the preceding base character.
function splitGraphemesSafe(str) {
  if (!str) return [];
  try {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
      return Array.from(seg.segment(str), (s) => s.segment);
    }
  } catch (_) {
    // ignore and use fallback
  }
  const out = [];
  const it = str.normalize("NFC")[Symbol.iterator]();
  let step = it.next();
  while (!step.done) {
    let cluster = step.value;
    let next = it.next();
    // Attach marks (Mn/Mc), variation selectors, and joiners to previous char
    while (
      !next.done &&
      /[\p{Mark}\u200C\u200D\uFE0E\uFE0F]/u.test(next.value)
    ) {
      cluster += next.value;
      next = it.next();
    }
    out.push(cluster);
    step = next;
  }
  return out;
}

export default function DockText({
  text = "",
  to,
  onClick,
  baseSize = 16,
  magnification = 70, // kept for API compatibility, not used for scaling
  letterGap = 2,
  color = "#fff",
  riseMax: riseMaxProp,
  sx = {},
}) {
  const containerRef = useRef(null);
  const charRefs = useRef([]);
  const [mouseX, setMouseX] = useState(null);
  const [centers, setCenters] = useState([]);

  const chars = useMemo(
    () => splitGraphemesSafe(text).map((c, i) => ({ c, i })),
    [text]
  );

  const computeCenters = () => {
    const arr = charRefs.current.map((el) => {
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      return r.left + r.width / 2;
    });
    setCenters(arr);
  };

  useEffect(() => {
    computeCenters();
    const ro = new ResizeObserver(() => computeCenters());
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", computeCenters);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", computeCenters);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const handleMove = (e) => setMouseX(e.clientX);
  const handleLeave = () => setMouseX(null);

  // Influence factor per letter: 0..1 based on cursor proximity
  const influence = useMemo(() => {
    const sigma = 60; // width of influence in px
    return centers.map((cx) => {
      if (mouseX == null) return 0;
      const d = Math.abs(mouseX - cx);
      return Math.exp(-(d * d) / (2 * sigma * sigma));
    });
  }, [centers, mouseX]);

  const Wrapper = to ? RouterLink : "button";
  const wrapperProps = to ? { to } : { type: "button", onClick };

  return (
    <Wrapper
      ref={containerRef}
      {...wrapperProps}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        display: "inline-flex",
        alignItems: "flex-end", // anchor at baseline like a real dock
        gap: letterGap,
        background: "transparent",
        border: "none",
        color,
        textDecoration: "none",
        cursor: "pointer",
        padding: 0,
        ...sx,
      }}
    >
      {chars.map(({ c }, idx) => {
        const factor = influence[idx] ?? 0; // 0..1
        const riseMax = riseMaxProp ?? baseSize * 0.5; // default subtle rise
        const rise = -riseMax * factor; // move upward
        // nudge horizontally away from cursor to create the "wave"
        let nudgeX = 0;
        if (mouseX != null && centers[idx] != null) {
          const dir = centers[idx] - mouseX; // negative = cursor is right side
          const sign = dir === 0 ? 0 : dir > 0 ? 1 : -1;
          nudgeX = sign * baseSize * 0.16 * factor;
        }
        return (
          <span
            key={idx}
            ref={(el) => (charRefs.current[idx] = el)}
            style={{
              // Inherit font-family so Tamil text uses proper script fonts
              fontWeight: 700,
              lineHeight: 1,
              fontSize: baseSize,
              transformOrigin: "bottom center",
              transform: `translate(${nudgeX}px, ${rise}px) translateZ(0)`,
              transition: "transform 80ms ease-out",
              willChange: "transform",
              display: "inline-block",
            }}
          >
            {c}
          </span>
        );
      })}
    </Wrapper>
  );
}
