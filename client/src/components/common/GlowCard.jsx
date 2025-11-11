import React, { useEffect, useRef } from "react";

const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
  silver: { base: 220, spread: 4, saturation: 5, lightness: 82 },
};

const sizeMap = {
  sm: "w-48 h-64",
  md: "w-64 h-80",
  lg: "w-80 h-96",
};

export function GlowCard({
  children,
  className = "",
  glowColor = "silver",
  size = "md",
  width,
  height,
  customSize = false,
  style,
  ...rest
}) {
  const cardRef = useRef(null);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return undefined;

    const update = (e) => {
      const rect = node.getBoundingClientRect();
      const x = e?.clientX !== undefined ? e.clientX - rect.left : rect.width / 2;
      const y = e?.clientY !== undefined ? e.clientY - rect.top : rect.height / 2;
      const clampedX = Math.max(0, Math.min(rect.width, x));
      const clampedY = Math.max(0, Math.min(rect.height, y));
      node.style.setProperty("--x", clampedX.toFixed(2));
      node.style.setProperty("--y", clampedY.toFixed(2));
      node.style.setProperty("--xp", (clampedX / Math.max(1, rect.width)).toFixed(3));
      node.style.setProperty("--yp", (clampedY / Math.max(1, rect.height)).toFixed(3));
    };

    const activateGlow = () => {
      node.style.setProperty("--bg-spot-opacity", "0.18");
      node.style.setProperty("--border-spot-opacity", "1");
      node.style.setProperty("--border-light-opacity", "0.8");
    };

    const fadeGlow = () => {
      node.style.setProperty("--bg-spot-opacity", "0");
      node.style.setProperty("--border-spot-opacity", "0");
      node.style.setProperty("--border-light-opacity", "0");
    };

    const handlePointerMove = (e) => {
      update(e);
    };

    const handlePointerDown = (e) => {
      update(e);
      activateGlow();
      node.setPointerCapture?.(e.pointerId);
    };

    const handlePointerUp = (e) => {
      update(e);
      activateGlow();
      node.releasePointerCapture?.(e.pointerId);
    };

    const handlePointerEnter = (e) => {
      update(e);
      activateGlow();
    };

    const handlePointerLeave = () => {
      fadeGlow();
    };

    // Initial center placement
    update();
    fadeGlow();

    node.addEventListener("pointermove", handlePointerMove);
    node.addEventListener("pointerdown", handlePointerDown);
    node.addEventListener("pointerup", handlePointerUp);
    node.addEventListener("pointercancel", handlePointerLeave);
    node.addEventListener("pointerenter", handlePointerEnter);
    node.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      node.removeEventListener("pointermove", handlePointerMove);
      node.removeEventListener("pointerdown", handlePointerDown);
      node.removeEventListener("pointerup", handlePointerUp);
      node.removeEventListener("pointercancel", handlePointerLeave);
      node.removeEventListener("pointerenter", handlePointerEnter);
      node.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  const colorConfig = glowColorMap[glowColor] || glowColorMap.silver;
  const { base, spread, saturation = 100, lightness = 70 } = colorConfig;

  const getSizeClasses = () => {
    if (customSize) return "";
    return sizeMap[size] || sizeMap.md;
  };

  const inlineStyles = {
    "--base": `${base}`,
    "--spread": `${spread}`,
    "--radius": "14",
    "--border": "3",
    "--backdrop": "hsl(0 0% 60% / 0.12)",
    "--backup-border": "var(--backdrop)",
    "--size": "200",
    "--outer": "1",
    "--border-size": "calc(var(--border, 2) * 1px)",
    "--spotlight-size": "calc(var(--size, 150) * 1px)",
    "--bg-spot-opacity": "0",
    "--border-spot-opacity": "0",
    "--border-light-opacity": "0",
  "--saturation": `${saturation}`,
  "--lightness": `${lightness}`,
    "--hue": "calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",
    backgroundImage: `radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(var(--hue, 210) calc(var(--saturation, 20) * 1%) calc(var(--lightness, 85) * 1%) / var(--bg-spot-opacity, 0.14)), transparent
    )`,
    backgroundColor: "var(--backdrop, transparent)",
    backgroundSize: "calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",
    backgroundPosition: "50% 50%",
    backgroundAttachment: "fixed",
    border: "var(--border-size) solid var(--backup-border)",
    position: "relative",
    touchAction: "manipulation",
  };

  if (width !== undefined) {
    inlineStyles.width = typeof width === "number" ? `${width}px` : width;
  }
  if (height !== undefined) {
    inlineStyles.height = typeof height === "number" ? `${height}px` : height;
  }

  const beforeAfterStyles = `
    [data-glow]::before,
    [data-glow]::after {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: calc(var(--border-size) * -1);
      border: var(--border-size) solid transparent;
      border-radius: calc(var(--radius) * 1px);
      background-attachment: fixed;
      background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
    background-repeat: no-repeat;
      background-position: 50% 50%;
      mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
      mask-clip: padding-box, border-box;
      mask-composite: intersect;
    }
    
    [data-glow]::before {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(var(--hue, 210) calc(var(--saturation, 15) * 1%) calc(var(--lightness, 70) * 1%) / var(--border-spot-opacity, 1)), transparent 100%
      );
      filter: brightness(2);
    }
    
    [data-glow]::after {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
        calc(var(--x, 0) * 1px)
        calc(var(--y, 0) * 1px),
        hsl(0 0% 100% / var(--border-light-opacity, 1)), transparent 100%
      );
    }
    
    [data-glow] [data-glow] {
      position: absolute;
      inset: 0;
      will-change: filter;
      opacity: var(--outer, 1);
      border-radius: calc(var(--radius) * 1px);
      border-width: calc(var(--border-size) * 20);
      filter: blur(calc(var(--border-size) * 10));
      background: none;
      pointer-events: none;
      border: none;
    }
    
    [data-glow] > [data-glow]::before {
      inset: -10px;
      border-width: 10px;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: beforeAfterStyles }} />
      <div
        ref={cardRef}
        data-glow
        style={{ ...inlineStyles, ...style }}
        className={`
          ${getSizeClasses()}
          ${!customSize ? "aspect-[3/4]" : ""}
          rounded-2xl
          relative
          flex
          flex-col
          shadow-[0_1rem_2rem_-1rem_black]
          p-4
          gap-4
          backdrop-blur-[5px]
          ${className}
        `}
        {...rest}
      >
        {children}
      </div>
    </>
  );
}

export default GlowCard;
