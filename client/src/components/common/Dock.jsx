import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

/**
 * Dock – text-only macOS-style magnifying dock.
 * Props:
 * - items: Array<{ label: string, to?: string, onClick?: Function }>
 * - panelHeight: number (px)
 * - baseItemSize: number (px) – base font-size
 * - magnification: number (percent, e.g., 70 means +70% at cursor)
 * - gap: number (px) spacing between items
 * - color: string (text color)
 */
export default function Dock({
  items = [],
  panelHeight = 64,
  baseItemSize = 16,
  magnification = 70,
  gap = 16,
  color = "#fff",
}) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const [mouseX, setMouseX] = useState(null);
  const [centers, setCenters] = useState([]);

  // Compute element centers to avoid layout assumptions
  const computeCenters = () => {
    const arr = itemRefs.current.map((el) => {
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
  }, [items.length]);

  const handleMove = (e) => setMouseX(e.clientX);
  const handleLeave = () => setMouseX(null);

  // Gaussian-like falloff
  const scales = useMemo(() => {
    const base = 1;
    const add = magnification / 100; // at center -> base * (1 + add)
    const sigma = 90; // width of influence in px
    return centers.map((cx) => {
      if (mouseX == null) return base;
      const d = Math.abs(mouseX - cx);
      const factor = Math.exp(-(d * d) / (2 * sigma * sigma));
      return base + add * factor;
    });
  }, [centers, mouseX, magnification]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        height: panelHeight,
        gap,
        userSelect: "none",
        zIndex: 1,
      }}
    >
      {items.map((item, i) => {
        const scale = scales[i] ?? 1;
        const Comp = item.to ? RouterLink : "button";
        const props = item.to
          ? { to: item.to }
          : { type: "button", onClick: item.onClick };
        return (
          <Comp
            key={i}
            ref={(el) => (itemRefs.current[i] = el)}
            {...props}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              color,
              fontFamily: "Poppins, Arial, sans-serif",
              fontWeight: 700,
              textDecoration: "none",
              cursor: "pointer",
              transform: `scale(${scale}) translateZ(0)`,
              transition: "transform 80ms ease-out, color 120ms ease",
              fontSize: baseItemSize,
              lineHeight: 1,
              padding: 0,
              willChange: "transform",
              whiteSpace: "nowrap",
            }}
          >
            {item.label}
          </Comp>
        );
      })}
    </div>
  );
}
