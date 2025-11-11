import React, { useEffect, useRef } from "react";

/**
 * Particles - Canvas-based background particles with an optional Yin-Yang watermark.
 * Props:
 * - particleColors: string[] (colors for particles)
 * - particleCount: number (how many particles)
 * - particleSpread: number (movement jitter scale)
 * - speed: number (base movement speed)
 * - particleBaseSize: number (used to derive particle radius)
 * - moveParticlesOnHover: boolean (mouse hover interaction)
 * - alphaParticles: boolean (whether particles have varied alpha)
 * - disableRotation: boolean (disable yin-yang rotation)
 */
export default function Particles({
  particleColors = ["#ffffff", "#f2f2f2", "#d9d9d9"],
  particleCount = 380,
  particleSpread = 10,
  speed = 0.15,
  particleBaseSize = 80,
  moveParticlesOnHover = true,
  alphaParticles = true,
  disableRotation = false,
  showWatermark = false,
  densityMultiplier = 1, // multiply overall count without touching parents
  // Interactions
  enableDrag = true, // click-drag to attract and create flow
  enableClickBurst = true, // click to push nearby particles outward
  burstRadius = 120,
  burstForce = 0.6,
  hoverForce = 0.004,
  dragForce = 0.36,
  flowForce = 0.12,
  directFollow = true, // extra pull so dots stay near the cursor while dragging
  followStrength = 0.14,
  speedBoost = 1.2, // slightly faster overall motion
  influenceRadius = 200, // reduce a bit so forces feel tighter
  panOnDrag = false, // disabled by default to avoid "sliding away" feel
  panFactor = 0.2,
  maxSpeedFactor = 8, // allow higher max speed so dots can catch up
  style = {},
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, px: 0, py: 0, dx: 0, dy: 0, active: false, dragging: false });
  const rotationRef = useRef(0);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const parent = canvas.parentElement;
      width = parent?.clientWidth || window.innerWidth;
      height = parent?.clientHeight || window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Re-seed particles to fill new space if empty
      if (!particlesRef.current.length) seedParticles();
    };

    const rand = (min, max) => Math.random() * (max - min) + min;

    const seedParticles = () => {
      // Scale particle count with area for better mobile performance
      const area = Math.max(1, width * height);
      const baseline = 1100 * 700; // ~ desktop hero size
      const scale = Math.min(1, area / baseline);
      const count = Math.max(50, Math.round(particleCount * scale * densityMultiplier));
      const arr = new Array(count).fill(0).map(() => {
        const rMin = Math.max(0.5, particleBaseSize * 0.008);
        const rMax = Math.max(rMin + 0.25, particleBaseSize * 0.024);
        const radius = rand(rMin, rMax); // slightly larger than before
        const angle = rand(0, Math.PI * 2);
        const speedScale = speed * speedBoost * rand(0.6, 1.4);
        const color = particleColors[Math.floor(Math.random() * particleColors.length)] || "#ffffff";
        const alpha = alphaParticles ? rand(0.5, 1) : 1; // a bit brighter overall
        return {
          x: rand(0, width),
          y: rand(0, height),
          vx: Math.cos(angle) * speedScale,
          vy: Math.sin(angle) * speedScale,
          radius,
          color,
          alpha,
        };
      });
      particlesRef.current = arr;
    };

    const wrap = (p) => {
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;
    };

    const drawYinYang = (timeDelta) => {
      if (!showWatermark) return;
      const size = Math.min(width, height) * 0.75; // watermark size
      const x = width / 2;
      const y = height / 2;
      const rotSpeed = disableRotation ? 0 : 0.0006; // radians per ms
      rotationRef.current += rotSpeed * timeDelta;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotationRef.current);

      // Subtle lines and fills
  const lineColor = "rgba(0,0,0,0.10)";
  const fillBlack = "rgba(0,0,0,0.06)";
      const r = size / 2;

      // Outer circle stroke
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Black half
      ctx.beginPath();
      ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2, false);
      ctx.arc(0, r / 2, r / 2, Math.PI / 2, (Math.PI * 3) / 2, true);
      ctx.arc(0, -r / 2, r / 2, (Math.PI * 3) / 2, Math.PI / 2, false);
      ctx.closePath();
      ctx.fillStyle = fillBlack;
      ctx.fill();

      // Dots
      ctx.beginPath();
      ctx.arc(0, -r / 2, r / 10, 0, Math.PI * 2);
      ctx.fillStyle = fillBlack;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, r / 2, r / 10, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.6)"; // subtle white
      ctx.fill();

      ctx.restore();
    };

    let lastTs = performance.now();
    const tick = (ts) => {
      const dt = ts - lastTs;
      lastTs = ts;
      ctx.clearRect(0, 0, width, height);

      // Optional: pan entire field a bit when dragging to mimic world movement
      const m = mouseRef.current;
      if (panOnDrag && m.dragging) {
        for (const p of particlesRef.current) {
          p.x += m.dx * panFactor;
          p.y += m.dy * panFactor;
          wrap(p);
        }
      }

      // Draw watermark
      drawYinYang(dt);

  // Update and draw particles
  const jitter = particleSpread * 0.0018; // calmer jitter to avoid pushing away
  const fadeRepelRadius = 60; // fade out repel as we get close
  const attractRadius = 22; // within this, add slight attraction on hover (no drag)
      for (const p of particlesRef.current) {
        // mouse interaction (repel slightly)
        if (moveParticlesOnHover && m.active) {
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          const dist2 = dx * dx + dy * dy;
          const influence = influenceRadius * influenceRadius; // radius^2
          if (dist2 < influence) {
            const f = (influence - dist2) / influence; // 0..1
            const len = Math.sqrt(dist2) || 1;
            if (enableDrag && m.dragging) {
              // attract towards cursor
              p.vx -= (dx / len) * f * dragForce;
              p.vy -= (dy / len) * f * dragForce;
              // flow along mouse direction
              p.vx += m.dx * flowForce * f;
              p.vy += m.dy * flowForce * f;
              // optional direct follow acceleration to keep dots near cursor
              if (directFollow) {
                const tx = -dx; // toward cursor
                const ty = -dy;
                p.vx += tx * followStrength * f;
                p.vy += ty * followStrength * f;
              }
            } else {
              // On hover without dragging:
              // - Inside attractRadius: slight attraction to remove the "gap" around the cursor
              // - Outside: gentle repel that fades as we approach the cursor
              if (len < attractRadius) {
                const af = (1 - len / attractRadius) * (hoverForce * 0.75 + 0.004);
                p.vx -= (dx / len) * f * af;
                p.vy -= (dy / len) * f * af;
              } else {
                const nearScale = Math.min(1, len / fadeRepelRadius); // 0..1
                const hf = hoverForce * nearScale;
                p.vx += (dx / len) * f * hf;
                p.vy += (dy / len) * f * hf;
              }
            }
          }
        }

        // random jitter and integration
        p.vx += (Math.random() - 0.5) * jitter;
        p.vy += (Math.random() - 0.5) * jitter;
        // clamp velocity to avoid sudden "vanishing" off-screen
        const maxV = speed * speedBoost * maxSpeedFactor;
        const mag = Math.hypot(p.vx, p.vy);
        if (mag > maxV) {
          const s = maxV / (mag || 1);
          p.vx *= s;
          p.vy *= s;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.997; // a little damping
        p.vy *= 0.997;
        wrap(p);

        // draw
        ctx.beginPath();
        ctx.fillStyle = p.alpha !== 1 ? withAlpha(p.color, p.alpha) : p.color;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const withAlpha = (hex, a) => {
      // accept #rgb, #rrggbb or named colors; fall back to rgba(255,255,255,a)
      let r = 255, g = 255, b = 255;
      const c = hex.trim();
      if (/^#([\da-f]{3})$/i.test(c)) {
        const m = c.slice(1);
        r = parseInt(m[0] + m[0], 16);
        g = parseInt(m[1] + m[1], 16);
        b = parseInt(m[2] + m[2], 16);
      } else if (/^#([\da-f]{6})$/i.test(c)) {
        r = parseInt(c.slice(1, 3), 16);
        g = parseInt(c.slice(3, 5), 16);
        b = parseInt(c.slice(5, 7), 16);
      } else if (c.startsWith("rgb")) {
        // rgb or rgba already
        return c.replace(/rgba?\(([^)]+)\)/, (match, inner) => {
          const parts = inner.split(",").map((s) => s.trim());
          if (parts.length >= 3) {
            const [rr, gg, bb] = parts;
            return `rgba(${rr}, ${gg}, ${bb}, ${a})`;
          }
          return `rgba(255,255,255,${a})`;
        });
      }
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    };

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const mr = mouseRef.current;
  mr.dx = (x - (mr.px || x)) * 0.22; // more responsive drag delta
  mr.dy = (y - (mr.py || y)) * 0.22;
      mr.px = x; mr.py = y;
      mr.x = x; mr.y = y;
      mouseRef.current.active = true;
    };
    const onMouseLeave = () => { mouseRef.current.active = false; mouseRef.current.dragging = false; };
  const onMouseDown = () => { mouseRef.current.dragging = true; };
    const onMouseUp = () => { mouseRef.current.dragging = false; };
    const onClick = (e) => {
      if (!enableClickBurst) return;
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      for (const p of particlesRef.current) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 < burstRadius * burstRadius) {
          const len = Math.sqrt(d2) || 1;
          const f = 1 - d2 / (burstRadius * burstRadius);
          p.vx += (dx / len) * burstForce * f;
          p.vy += (dy / len) * burstForce * f;
        }
      }
    };

    window.addEventListener("resize", resize);
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mouseleave", onMouseLeave);
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("click", onClick);
    resize();
    seedParticles();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("click", onClick);
    };
  }, [alphaParticles, disableRotation, moveParticlesOnHover, particleBaseSize, particleColors, particleCount, particleSpread, speed]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        ...style,
      }}
      aria-hidden
    />
  );
}
