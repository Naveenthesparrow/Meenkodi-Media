import React from 'react';
import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline';
import API_BASE_URL, { apiRequest } from '@/utils/api';
import { useTranslation } from 'react-i18next';

// Adapter: fetch first five lands, map to timeline items without mutating data
export default function FiveLandsTimeline({ ringRadius = 170 }) {
  const { i18n } = useTranslation();
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const containerRef = React.useRef(null);
  const [width, setWidth] = React.useState(0);
  const [reducedMotion, setReducedMotion] = React.useState(false);
  const [pageVisible, setPageVisible] = React.useState(true);

  // Tinai color styles: aura RGB, node background, and center gradient
  const TINAI_STYLES = React.useMemo(() => ({
    kurinji: {
      auraRGB: '139,92,246', // #8B5CF6 violet
      node: 'rgba(24,16,48,0.92)',
      gradient: 'linear-gradient(135deg,#A78BFA,#6366F1,#22D3EE)'
    },
    mullai: {
      auraRGB: '34,197,94', // #22C55E emerald
      node: 'rgba(8,32,16,0.92)',
      gradient: 'linear-gradient(135deg,#4ADE80,#22C55E,#86EFAC)'
    },
    marutham: {
      auraRGB: '132,204,22', // #84CC16 lime
      node: 'rgba(20,30,10,0.92)',
      gradient: 'linear-gradient(135deg,#A3E635,#84CC16,#22C55E)'
    },
    neithal: {
      auraRGB: '56,189,248', // #38BDF8 sky
      node: 'rgba(6,24,36,0.92)',
      gradient: 'linear-gradient(135deg,#38BDF8,#0EA5E9,#22D3EE)'
    },
    palai: {
      auraRGB: '245,158,11', // #F59E0B amber
      node: 'rgba(40,16,4,0.92)',
      gradient: 'linear-gradient(135deg,#F59E0B,#F97316,#EF4444)'
    }
  }), []);

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError(null);
      try {
        const langParam = i18n.language === 'en' ? '?lang=en' : '?lang=ta';
        const lands = await apiRequest(`/api/lands${langParam}`);
        if (cancelled) return;
        const firstFive = lands.slice(0, 5);
        const mapped = firstFive.map((land, idx) => {
          // Land may have .translated wrapper when English requested
          const displayName = (land.translated?.name) || (land.name?.[i18n.language]) || land.name?.en || land.name?.ta || land.type;
          const description = (land.translated?.description) || (land.description?.[i18n.language]) || land.description?.en || land.description?.ta || '';
          const key = String(land.type || '').toLowerCase();
          const sty = TINAI_STYLES[key] || { auraRGB: '56,189,248', node: 'rgba(10,10,10,0.95)' };
          return {
            id: land._id || land.type || String(idx),
            title: displayName,
            description,
            category: land.type,
            dateLabel: new Date(land.createdAt).getFullYear().toString(),
            energy: 40 + (idx * 12), // simple stagger
            status: idx % 2 === 0 ? 'active' : 'planned',
            nodeColor: sty.node,
            auraColor: sty.auraRGB,
          };
        });
        setItems(mapped);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load lands');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [i18n.language]);

  // Responsive sizing using ResizeObserver
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      setWidth(640);
      return;
    }
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect?.width || el.clientWidth || 640;
        setWidth(w);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Respect prefers-reduced-motion
  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(!!mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  // Pause when page/tab is hidden
  React.useEffect(() => {
    const onVis = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Compute adaptive radius: clamp between 120 and 260
  const adaptiveRadius = React.useMemo(() => {
    const base = Math.min(width || 640, 680);
    const computed = Math.round(0.28 * base);
    return Math.max(120, Math.min(260, computed));
  }, [width]);

  // Determine rotation props
  const autoRotate = pageVisible && !reducedMotion;
  const rotationSpeed = reducedMotion ? 0 : 0.25;

  if (loading) return <div className="py-8 text-center text-sm text-white/70">Loading lands…</div>;
  if (error) return <div className="py-8 text-center text-sm text-red-500">{error}</div>;

  return (
    <div ref={containerRef} className="w-full flex items-center justify-center">
      <RadialOrbitalTimeline
        items={items}
        centerLabel={i18n.language === 'ta' ? 'ஐந்து நிலங்கள்' : 'Five Tamil Lands'}
        ringRadius={adaptiveRadius || ringRadius}
        autoRotate={autoRotate}
        rotationSpeed={rotationSpeed}
        centerGradient={'linear-gradient(135deg,#4ADE80,#38BDF8,#A78BFA)'}
        nodeColor={'rgba(10,10,10,0.95)'}
        auraColor={'56,189,248'}
        categoryGradients={Object.fromEntries(Object.entries(TINAI_STYLES).map(([k,v]) => [k, v.gradient]))}
      />
    </div>
  );
}
