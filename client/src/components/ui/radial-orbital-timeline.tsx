import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Sparkles, Mountain, Trees, Factory, Waves, Sun } from "lucide-react";

export type TimelineStatus = "planned" | "active" | "complete";

export interface TimelineItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  dateLabel?: string;
  category?: string;
  energy?: number;
  status?: TimelineStatus;
  icon?: React.ReactNode;
  relatedIds?: string[];
  /** Optional per-item node background color (CSS color string) */
  nodeColor?: string;
  /** Optional per-item aura RGB string e.g., "59,130,246" */
  auraColor?: string;
}

export interface RadialOrbitalTimelineProps {
  items: TimelineItem[];
  centerLabel?: string;
  ringRadius?: number;
  className?: string;
  onSelect?: (item: TimelineItem) => void;
  /** Enable richer interactive orbital behavior */
  interactive?: boolean;
  /** Rotation speed in degrees per frame (approx) */
  rotationSpeed?: number;
  /** Whether to start auto rotation by default */
  autoRotate?: boolean;
  /** When true, selected item is moved to top (12 o'clock) */
  centerSelected?: boolean;
  /** Override center gradient (CSS background value) */
  centerGradient?: string;
  /** Node base background color */
  nodeColor?: string;
  /** Aura radial gradient start color (rgba or hex) */
  auraColor?: string;
  /** Optional map of category => center gradient to use when that category is active */
  categoryGradients?: Record<string, string>;
}

function defaultIconFor(category?: string): React.ReactNode {
  switch ((category || '').toLowerCase()) {
    case "kurinji":
      return <Mountain className="h-4 w-4" />;
    case "mullai":
      return <Trees className="h-4 w-4" />;
    case "marutham":
      return <Factory className="h-4 w-4" />;
    case "neithal":
      return <Waves className="h-4 w-4" />;
    case "palai":
      return <Sun className="h-4 w-4" />;
    default:
      return <Sparkles className="h-4 w-4" />;
  }
}

function polarToCartesian(angleRad: number, radius: number) {
  return { x: Math.cos(angleRad) * radius, y: Math.sin(angleRad) * radius };
}

export const RadialOrbitalTimeline: React.FC<RadialOrbitalTimelineProps> = ({
  items,
  centerLabel = "Timeline",
  ringRadius = 140,
  className,
  onSelect,
  interactive = true,
  rotationSpeed = 0.25,
  autoRotate = true,
  centerSelected = true,
  centerGradient = 'linear-gradient(to bottom right,#6366f1,#3b82f6,#14b8a6)',
  nodeColor = 'rgba(0,0,0,0.9)',
  auraColor = '59,130,246', // RGB string for constructing gradients
  categoryGradients,
}) => {
  const count = items.length || 1;
  const [angle, setAngle] = React.useState(0); // degrees
  const [running, setRunning] = React.useState(autoRotate);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const frameRef = React.useRef<number | null>(null);

  // Animation loop for rotation
  React.useEffect(() => {
    if (!interactive || !running) return;
    const tick = () => {
      setAngle(prev => (prev + rotationSpeed) % 360);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [interactive, running, rotationSpeed]);

  // Center selected item to 12 o'clock (top)
  React.useEffect(() => {
    if (!interactive || !centerSelected || !activeId) return;
    const idx = items.findIndex(i => i.id === activeId);
    if (idx < 0) return;
    // With baseAngleDeg = (idx/count)*360 - 90, placing at top means
    // baseAngleDeg + angle = -90 => angle = - (idx/count) * 360
    setAngle(- (idx / count) * 360);
  }, [activeId, interactive, centerSelected, items, count]);

  const handleSelect = (item: TimelineItem) => {
    onSelect?.(item);
    if (!interactive) return;
    setActiveId(prev => {
      const next = prev === item.id ? null : item.id;
      // Pause when selecting an item, resume when deselecting
      setRunning(next ? false : true);
      return next;
    });
  };

  const clearSelection = () => {
    if (!interactive) return;
    setActiveId(null);
    setRunning(true);
  };

  const activeItem = activeId ? items.find(i => i.id === activeId) : undefined;

  const appliedCenterGradient = React.useMemo(() => {
    if (!categoryGradients || !activeId) return centerGradient;
    const cat = items.find(i => i.id === activeId)?.category?.toLowerCase() || '';
    return categoryGradients[cat] || centerGradient;
  }, [activeId, items, categoryGradients, centerGradient]);

  return (
  <div className={cn("w-full flex items-center justify-center py-8", className)} onClick={clearSelection}>
      <div
        className="relative"
        style={{ width: ringRadius * 2 + 160, height: ringRadius * 2 + 160 }}
        role="list"
        aria-label={centerLabel}
      >
        {/* Center core */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-28 w-28 rounded-full shadow-orbital border border-white/20 flex items-center justify-center text-white select-none" style={{ background: appliedCenterGradient }}>
            <span className="text-sm font-semibold text-center px-2 leading-tight" aria-label="timeline-center-label">{centerLabel}</span>
            <span className="absolute inset-0 rounded-full border border-white/20 animate-ping" />
            <span className="absolute inset-0 rounded-full border border-white/10" />
            {/* Removed pause/rotate control per request */}
          </div>
        </div>

        {/* Static ring outline */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20"
          style={{ width: ringRadius * 2, height: ringRadius * 2 }}
          aria-hidden="true"
        />

        {/* Items container (positions recalculated each frame) */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: ringRadius * 2, height: ringRadius * 2 }}
        >
          {items.map((item, idx) => {
            const baseAngleDeg = (idx / count) * 360 - 90; // -90 to start at top
            const theta = baseAngleDeg + angle; // apply rotation offset
            const rad = (theta * Math.PI) / 180;
            const { x, y } = polarToCartesian(rad, ringRadius);
            const energy = Math.max(0, Math.min(100, item.energy ?? 60));
            const glow = Math.round(4 + (energy / 100) * 8);
            const iconNode = item.icon ?? defaultIconFor(item.category);
            const active = activeId === item.id;
            const related = !!(activeItem?.relatedIds?.includes(item.id));
            const auraSize = 40 + energy * 0.4; // px diameter for aura
            const auraRGB = item.auraColor || auraColor;
            const nodeBG = item.nodeColor || nodeColor;

            return (
              <button
                key={item.id}
                type="button"
                className="group absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none"
                style={{ left: x + ringRadius, top: y + ringRadius, zIndex: active ? 20 : 10 }}
                onClick={(e) => { e.stopPropagation(); handleSelect(item); }}
                aria-label={item.title}
                role="listitem"
              >
                {/* Energy aura */}
                <span
                  className={cn(
                    "absolute -inset-[6px] rounded-full pointer-events-none transition-opacity",
                    active ? "opacity-100" : related ? "opacity-80 animate-pulse" : "opacity-50"
                  )}
                  style={{
                    width: auraSize,
                    height: auraSize,
                    left: `calc(50% - ${auraSize / 2}px)`,
                    top: `calc(50% - ${auraSize / 2}px)`,
                    background: `radial-gradient(circle, rgba(${auraRGB},0.35) 0%, rgba(${auraRGB},0.05) 65%, transparent 80%)`,
                    filter: `blur(${active ? 4 : 2}px)`,
                  }}
                  aria-hidden="true"
                />

                <div
                  className={cn(
                    "relative h-14 w-14 rounded-full border border-white/20 flex items-center justify-center text-white transition-all duration-300",
                    "hover:scale-110 hover:border-white/40",
                    active && "scale-125 border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                  )}
                  style={{ boxShadow: `0 0 ${glow}px rgba(${auraRGB},0.6)`, background: nodeBG }}
                >
                  <span className="opacity-80" aria-hidden="true">{iconNode}</span>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white/80">
                    {item.title}
                  </span>
                </div>

                {/* Hover or active detail card */}
                {(active || !interactive) && (
                  <div className="pointer-events-none absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-[calc(100%+20px)] w-[260px]">
                    <Card className="w-full bg-black/90 text-white border-white/20">
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 border border-white/20">
                            {iconNode}
                          </span>
                          {item.title}
                        </CardTitle>
                        {item.subtitle && (
                          <CardDescription className="text-white/70">{item.subtitle}</CardDescription>
                        )}
                        {(item.category || item.dateLabel || item.status) && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {item.category && <Badge variant="secondary">{item.category}</Badge>}
                            {item.dateLabel && <Badge variant="outline">{item.dateLabel}</Badge>}
                            {item.status && <Badge>{item.status}</Badge>}
                          </div>
                        )}
                      </CardHeader>
                      {(item.description || typeof item.energy === 'number') && (
                        <CardContent className="space-y-3">
                          {item.description && (
                            <p className="text-sm text-white/80 leading-relaxed">{item.description}</p>
                          )}
                          {typeof item.energy === 'number' && (
                            <div>
                              <div className="flex justify-between text-[10px] tracking-wide text-white/60">
                                <span>Energy</span>
                                <span>{item.energy}%</span>
                              </div>
                              <div className="mt-1 h-1 w-full bg-white/10 rounded">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                  style={{ width: `${item.energy}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RadialOrbitalTimeline;
