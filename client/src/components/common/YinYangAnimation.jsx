import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";

/**
 * YinYangAnimation
 * - Stroke draws over 3s
 * - Yin/Yang halves and dots fade in with delays
 * - One-time 360° rotation using transform + transition (no infinite)
 * - Adapted to this codebase (no Tailwind, no styled-jsx)
 */
export default function YinYangAnimation({ size = 288, bg = "#f5f5f5" }) {
  const [spin, setSpin] = useState(false);

  // Responsive size: allow size to be an object { xs, sm, md }
  const getSize = () => {
    if (typeof size === "object") {
      if (window.innerWidth < 600) return size.xs || 200;
      if (window.innerWidth < 900) return size.sm || size.xs || 240;
      return size.md || size.sm || size.xs || 288;
    }
    return size;
  };
  const [responsiveSize, setResponsiveSize] = useState(getSize());
  useEffect(() => {
    const handleResize = () => setResponsiveSize(getSize());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line
  }, [size]);

  useEffect(() => {
    // Start rotation after a small delay to mimic provided sample
    const timer = setTimeout(() => setSpin(true), 200); // 200ms like the sample
    return () => clearTimeout(timer);
  }, []);

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: responsiveSize + 24,
          height: responsiveSize + 24,
          background: bg,
          borderRadius: 2,
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 100 100"
          sx={{
            width: responsiveSize,
            height: responsiveSize,
            transition: "transform 3000ms linear",
            transform: spin ? "rotate(360deg)" : "rotate(0deg)",
            "& .outline": {
              fill: "none",
              stroke: "#000",
              strokeWidth: 4,
              strokeDasharray: 1000,
              strokeDashoffset: 1000,
              animation: "yyDraw 3s ease forwards",
            },
            "& .yin, & .yang, & .dot": {
              opacity: 0,
              animation: "yyFade 1.5s ease forwards",
            },
            "& .yin": { animationDelay: "1500ms" },
            "& .yang": { animationDelay: "2000ms" },
            "& .dot": { animationDelay: "2500ms" },
            "@keyframes yyDraw": {
              to: { strokeDashoffset: 0 },
            },
            "@keyframes yyFade": {
              to: { opacity: 1 },
            },
          }}
        >
          <g>
            <circle cx="50" cy="50" r="48" className="outline" />
            <path
              d="M50,2 A48,48 0 0,0 50,98 A24,24 0 0,1 50,50 A24,24 0 0,0 50,2 Z"
              className="yin"
              fill="#000"
            />
            <path
              d="M50,98 A48,48 0 0,0 50,2 A24,24 0 0,1 50,50 A24,24 0 0,0 50,98 Z"
              className="yang"
              fill="#fff"
            />
            <circle cx="50" cy="25" r="6" className="dot" fill="#fff" />
            <circle cx="50" cy="75" r="6" className="dot" fill="#000" />
          </g>
        </Box>
      </Box>
    </Box>
  );
}
