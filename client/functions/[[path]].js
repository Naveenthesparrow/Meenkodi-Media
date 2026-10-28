/**
 * Cloudflare Pages router for www.meenkodi.com (replaces Render's rewrite rules).
 *
 * - /api, /auth, /uploads, sitemaps, robots.txt  -> backend
 * - page URLs (/, /gallery, /articles/x ...)     -> backend (page-specific HTML for SEO
 *                                                   and link previews); if the backend is
 *                                                   down, the plain app (index.html) instead
 * - /__template                                   -> this site's index.html, which the backend
 *                                                   uses as its HTML template
 * - everything else (JS, CSS, images)            -> static files served by Pages
 *
 * Set BACKEND_ORIGIN in Pages > Settings > Variables, e.g. https://meenkodi-xxxx.onrender.com
 * (_routes.json keeps /assets/* and other static files from running this function at all.)
 */
const BACKEND_PATHS = /^\/(api|auth|uploads)(\/|$)|^\/(sitemap[^/]*\.xml|robots\.txt)$/;

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const backend = (env.BACKEND_ORIGIN || '').replace(/\/+$/, '');

  // HTML template for the backend's server-rendered pages
  if (url.pathname === '/__template') {
    return env.ASSETS.fetch(new Request(new URL('/', url), request));
  }

  const isPage = request.method === 'GET' && !/\.[a-z0-9]{2,5}$/i.test(url.pathname);
  if (!backend || (!BACKEND_PATHS.test(url.pathname) && !isPage)) {
    return env.ASSETS.fetch(request);
  }

  const target = new URL(url.pathname + url.search, backend);
  const headers = new Headers(request.headers);
  headers.set('X-Forwarded-Host', url.host);
  headers.set('X-Forwarded-Proto', 'https');
  try {
    const response = await fetch(new Request(target, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual', // login redirects (Google) must reach the browser unchanged
    }));
    if (isPage && !BACKEND_PATHS.test(url.pathname) && response.status >= 500) {
      return env.ASSETS.fetch(new Request(new URL('/', url), request));
    }
    return response;
  } catch {
    // Backend asleep/down: pages still open as the normal app; API calls fail visibly
    if (isPage && !BACKEND_PATHS.test(url.pathname)) {
      return env.ASSETS.fetch(new Request(new URL('/', url), request));
    }
    return new Response('Backend unavailable', { status: 502 });
  }
}
