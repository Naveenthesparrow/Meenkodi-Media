import React from "react";
import { Box, Paper, Typography } from "@mui/material";

/**
 * InkYinYang
 * - Hand-drawn ink style Yin-Yang appearing on white paper
 * - Sequence:
 *   1) Circle outline stroke is "drawn" with an animated stroke-dashoffset
 *   2) Black/white yin-yang fills fade in with a watercolor-like texture
 *   3) The symbol rotates 360° once and stops
 *
 * Pure CSS keyframes. No JS animation.
 */
export default function InkYinYang({ size = 220, subtitle = "" }) {
  const OUTLINE_LEN = 2 * Math.PI * 80; // circumference for r=80

  return (
    <Box sx={{ width: "100%", display: "flex", justifyContent: "center", px: 2 }}>
      <Paper
        elevation={10}
        sx={{
          width: { xs: size + 40, sm: size + 80 },
          maxWidth: 560,
          borderRadius: 4,
          p: { xs: 2.5, sm: 3.5 },
          background: "#fff",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          // subtle paper grain using overlay gradient
          "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(120% 80% at 0% 0%, rgba(0,0,0,0.03), transparent 60%), radial-gradient(100% 70% at 100% 10%, rgba(0,0,0,0.025), transparent 55%)",
            pointerEvents: "none",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: size,
              height: size,
              position: "relative",
              // Wrapper handles final spin once
              "& .yy-wrap": {
                width: "100%",
                height: "100%",
                animation: "yySpin 2.2s cubic-bezier(.2,.6,.2,1) 2.8s 1 forwards",
                transformOrigin: "50% 50%",
              },
              // Outline draw animation
              "& .yy-outline": {
                strokeDasharray: `${OUTLINE_LEN}`,
                strokeDashoffset: `${OUTLINE_LEN}`,
                animation: "yyDraw 1.6s ease-in-out 0s 1 forwards",
                filter: "url(#inkBleed)",
              },
              // Fill group fade in with watercolor
              "& .yy-fills": {
                opacity: 0,
                animation: "yyFade 1.2s ease-out 1.6s 1 forwards",
                filter: "url(#watercolor)",
              },
              // Small dots fade slightly after halves
              "& .yy-dots": {
                opacity: 0,
                animation: "yyFade 1s ease-out 1.8s 1 forwards",
                filter: "url(#watercolor)",
              },
              // Keyframes
              "@keyframes yyDraw": {
                "0%": { strokeDashoffset: `${OUTLINE_LEN}` },
                "100%": { strokeDashoffset: 0 },
              },
              "@keyframes yyFade": {
                "0%": { opacity: 0 },
                "100%": { opacity: 1 },
              },
              "@keyframes yySpin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 200 200" aria-label="Yin Yang ink animation">
              <defs>
                {/* Watercolor texture filter using turbulence + blur */}
                <filter id="watercolor">
                  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="noise" />
                  <feColorMatrix in="noise" type="saturate" values="0" result="desat" />
                  <feGaussianBlur in="desat" stdDeviation="0.35" result="smudge" />
                  <feBlend in="SourceGraphic" in2="smudge" mode="multiply" />
                </filter>
                {/* Ink bleed roughness for strokes */}
                <filter id="inkBleed">
                  <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" seed="7" result="turb" />
                  <feDisplacementMap in="SourceGraphic" in2="turb" scale="1.2" xChannelSelector="R" yChannelSelector="G" />
                </filter>
                {/* Clip to circle for interior painting */}
                <clipPath id="clipCircle">
                  <circle cx="100" cy="100" r="80" />
                </clipPath>
              </defs>

              {/* Final spin wrapper */}
              <g className="yy-wrap">
                {/* Outline - hand-drawn stroke */}
                <circle
                  className="yy-outline"
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="#111"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Fills (yin-yang) */}
                <g clipPath="url(#clipCircle)">
                  {/* Background neutral white */}
                  <rect x="20" y="20" width="160" height="160" fill="#fff" />

                  {/* Bottom half: black with S-curve achieved via two discs */}
                  <g className="yy-fills">
                    {/* Bottom black rectangle */}
                    <rect x="20" y="100" width="160" height="80" fill="#000" />
                    {/* Top blending circle (white bulge) */}
                    <circle cx="100" cy="60" r="40" fill="#fff" />
                    {/* Bottom blending circle (black bulge) */}
                    <circle cx="100" cy="140" r="40" fill="#000" />
                  </g>

                  {/* Dots */}
                  <g className="yy-dots">
                    <circle cx="100" cy="60" r="10" fill="#000" />
                    <circle cx="100" cy="140" r="10" fill="#fff" />
                  </g>
                </g>
              </g>
            </svg>
          </Box>
          {subtitle ? (
            <Typography sx={{ fontSize: 14, color: "#444", mt: 1 }}>{subtitle}</Typography>
          ) : null}
        </Box>
      </Paper>
    </Box>
  );
}
