import React from "react";
import { Box } from "@mui/material";
import { keyframes } from "@emotion/react";

/* ---------- animated scenes (transform / opacity only, so they stay smooth) ---------- */

const slide = keyframes`from { transform: translateX(0); } to { transform: translateX(-1440px); }`;
const sway = keyframes`0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); }`;
const drift = keyframes`0% { transform: translateX(-120px); opacity: 0; } 15%, 85% { opacity: 0.45; } 100% { transform: translateX(1500px); opacity: 0; }`;
const bob = keyframes`0%, 100% { transform: translate(0, 0) rotate(-2deg); } 50% { transform: translate(0, 6px) rotate(2deg); }`;
const pulse = keyframes`0%, 100% { transform: scale(1); opacity: 0.55; } 50% { transform: scale(1.12); opacity: 0.85; }`;
const twinkle = keyframes`0%, 100% { opacity: 0.2; } 50% { opacity: 1; }`;
const shimmer = keyframes`0%, 100% { transform: translateY(0); opacity: 0.35; } 50% { transform: translateY(-4px); opacity: 0.6; }`;

const anim = (k, s, extra = "") => ({ animation: `${k} ${s} ${extra}`, "@media (prefers-reduced-motion: reduce)": { animation: "none" } });

// Repeating wave path across 2 × 1440 units so it can slide forever
const wavePath = (y, amp, len) => {
  let d = `M0 ${y}`;
  for (let x = 0; x < 2880; x += len) d += ` q ${len / 4} ${-amp} ${len / 2} 0 t ${len / 2} 0`;
  return `${d} V160 H0 Z`;
};

function Scene({ children, page }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 1440 160"
      preserveAspectRatio="none"
      aria-hidden
      sx={{ position: "absolute", zIndex: 2, left: 0, right: 0, bottom: -1, width: "100%", height: { xs: 90, md: 150 }, display: "block", overflow: "hidden", "& *": { transformBox: "fill-box" } }}
    >
      {children}
      {/* the front edge melts into the page colour */}
      <rect x="0" y="152" width="1440" height="10" fill={page} />
    </Box>
  );
}

function MaruthamScene({ t }) {
  const stalks = Array.from({ length: 46 }, (_, i) => i * 32 + 6);
  return (
    <Scene page={t.page}>
      <Box component="path" d={wavePath(98, 10, 240)} fill={t.accent2} opacity="0.45" sx={anim(slide, "22s", "linear infinite")} />
      <Box component="path" d={wavePath(112, 8, 180)} fill={t.accent2} opacity="0.35" sx={anim(slide, "14s", "linear infinite")} />
      <path d="M0 128 Q 720 112 1440 128 V160 H0 Z" fill={t.page} />
      {stalks.map((x, i) => (
        <Box component="g" key={x} sx={{ transformOrigin: "bottom center", ...anim(sway, `${3 + (i % 5) * 0.4}s`, `ease-in-out ${(i % 7) * -0.5}s infinite`) }}>
          <path d={`M${x} 140 Q ${x + 3} 118 ${x + 1} ${96 + (i % 4) * 4}`} stroke={t.accent} strokeWidth="2.2" fill="none" />
          <ellipse cx={x + 3} cy={98 + (i % 4) * 4} rx="3.2" ry="7" fill="#C9A227" opacity="0.9" />
        </Box>
      ))}
    </Scene>
  );
}

function KurinjiScene({ t }) {
  return (
    <Scene page={t.page}>
      <path d="M0 90 L160 40 L300 86 L470 30 L640 92 L820 44 L990 88 L1160 36 L1320 80 L1440 56 V160 H0 Z" fill={t.accent2} opacity="0.35" />
      <path d="M0 112 L120 70 L260 108 L420 62 L600 112 L760 74 L930 116 L1100 70 L1280 110 L1440 80 V160 H0 Z" fill={t.accent} opacity="0.45" />
      {[0, 1, 2].map((i) => (
        <Box component="ellipse" key={i} cx="0" cy={70 + i * 18} rx="160" ry="10" fill="#fff" opacity="0.7" sx={anim(drift, `${26 + i * 8}s`, `linear ${i * -9}s infinite`)} />
      ))}
      <path d="M0 136 L140 108 L300 134 L480 104 L660 136 L840 110 L1020 138 L1200 108 L1440 132 V160 H0 Z" fill={t.page} />
      {[180, 520, 880, 1240].map((x, i) => (
        <Box component="circle" key={x} cx={x} cy={126 - (i % 2) * 6} r="4" fill={t.accent} sx={anim(twinkle, "3s", `ease-in-out ${i * 0.7}s infinite`)} />
      ))}
    </Scene>
  );
}

function MullaiScene({ t }) {
  const trees = Array.from({ length: 24 }, (_, i) => ({ x: i * 62 + 10, h: 34 + ((i * 37) % 30) }));
  return (
    <Scene page={t.page}>
      {trees.map(({ x, h }, i) => (
        <g key={x} opacity={i % 2 ? 0.45 : 0.6}>
          <rect x={x + 9} y={130 - 8} width="4" height="14" fill={t.ink} opacity="0.5" />
          <circle cx={x + 11} cy={128 - h} r={h / 2.2} fill={t.accent} />
        </g>
      ))}
      <path d="M0 130 Q 360 116 720 130 T 1440 128 V160 H0 Z" fill={t.page} />
      {Array.from({ length: 14 }, (_, i) => (
        <Box component="circle" key={i} cx={60 + i * 100} cy={140 + (i % 3) * 4} r="3.2" fill="#fff" stroke={t.accent2} strokeWidth="1"
          sx={anim(twinkle, `${2.4 + (i % 4) * 0.5}s`, `ease-in-out ${i * 0.3}s infinite`)} />
      ))}
    </Scene>
  );
}

function NeithalScene({ t }) {
  return (
    <Scene page={t.page}>
      <Box component="g" sx={{ transformOrigin: "center", ...anim(bob, "5s", "ease-in-out infinite") }}>
        <path d="M1080 92 L1080 52 L1110 88 Z" fill="#fff" opacity="0.9" />
        <path d="M1062 94 L1124 94 L1114 102 L1070 102 Z" fill={t.ink} opacity="0.7" />
      </Box>
      <Box component="path" d={wavePath(100, 12, 220)} fill={t.accent} opacity="0.35" sx={anim(slide, "18s", "linear infinite")} />
      <Box component="path" d={wavePath(116, 10, 160)} fill={t.accent} opacity="0.5" sx={anim(slide, "11s", "linear infinite")} />
      <Box component="path" d={wavePath(132, 8, 120)} fill={t.page} sx={anim(slide, "7s", "linear infinite")} />
    </Scene>
  );
}

function PalaiScene({ t }) {
  return (
    <Scene page={t.page}>
      <Box component="circle" cx="1180" cy="58" r="46" fill={t.accent2} sx={{ transformOrigin: "center", ...anim(pulse, "6s", "ease-in-out infinite") }} />
      <circle cx="1180" cy="58" r="30" fill="#F6C760" />
      <path d="M0 104 Q 240 72 480 102 T 960 98 T 1440 92 V160 H0 Z" fill={t.accent2} opacity="0.45" />
      <path d="M0 124 Q 300 96 620 122 T 1440 116 V160 H0 Z" fill={t.accent} opacity="0.45" />
      {[0, 1, 2].map((i) => (
        <Box component="path" key={i} d={`M${200 + i * 380} ${92 + i * 6} q 30 -6 60 0 t 60 0`} stroke="#fff" strokeWidth="1.5" fill="none"
          sx={anim(shimmer, `${2.6 + i * 0.6}s`, `ease-in-out ${i * 0.5}s infinite`)} />
      ))}
      <path d="M0 140 Q 360 124 760 140 T 1440 136 V160 H0 Z" fill={t.page} />
    </Scene>
  );
}

const SCENES = { marutham: MaruthamScene, kurinji: KurinjiScene, mullai: MullaiScene, neithal: NeithalScene, palai: PalaiScene };

export default function TinaiScene({ slug, theme }) {
  const S = SCENES[slug] || KurinjiScene;
  return <S t={theme} />;
}
