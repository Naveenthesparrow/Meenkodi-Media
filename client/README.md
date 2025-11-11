# Meenkodi client

React + Vite app using MUI, Tailwind CSS, and shadcn-style UI primitives.

## New: Radial Orbital Timeline for Five Lands

- Component: `src/components/ui/radial-orbital-timeline.tsx`
- Demo: `src/components/ui/radial-orbital-timeline-demo.tsx`
- Data adapter: `src/components/FiveLandsTimeline.jsx`
- Embedded In: `src/components/Explore.jsx` (scroll below the category carousel)

### Use it elsewhere

```
import FiveLandsTimeline from '@/components/FiveLandsTimeline';

export default function SomePage() {
	return (
		<div style={{ background: '#111', color: '#fff', borderRadius: 16, padding: 16 }}>
			<FiveLandsTimeline />
		</div>
	);
}
```

The adapter fetches `/api/lands?lang=en|ta` and maps the first five records to timeline items without modifying server data. It respects the current i18n language and will show Tamil or English.

### Tailwind & shadcn

- Tailwind config: `tailwind.config.cjs` and `postcss.config.cjs`
- Global styles: `src/styles/globals.css` (includes timeline animations)
- UI primitives: `src/components/ui/{button,badge,card}.tsx`

## Develop

Run the dev server from this `client` folder.

```
pnpm dev # or npm run dev / yarn dev
```
