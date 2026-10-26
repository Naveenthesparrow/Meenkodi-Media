/**
 * Meenkodi book download helper (Cloudflare Worker, free plan).
 *
 * Books are stored on archive.org, whose server always tells browsers to *show*
 * a PDF. Browsers only download in one click when the file's server says
 * "attachment", so this Worker fetches the PDF from archive.org and passes it
 * on with that instruction (and the real file name).
 *
 * Usage: https://<worker>.workers.dev/?id=<archive.org identifier>&file=<file name.pdf>
 * Only PDF files from archive.org are allowed, so it can't be used as an open proxy.
 */
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const id = url.searchParams.get('id') || '';
    const file = url.searchParams.get('file') || '';

    if (!/^[A-Za-z0-9._-]{3,100}$/.test(id) || !/\.pdf$/i.test(file) || file.includes('/') || file.includes('..')) {
      return new Response('Invalid book link', { status: 400 });
    }

    const upstream = await fetch(
      `https://archive.org/download/${encodeURIComponent(id)}/${encodeURIComponent(file)}`,
      { redirect: 'follow' }
    );
    if (!upstream.ok) {
      return new Response('Book not found on archive.org', { status: upstream.status === 404 ? 404 : 502 });
    }

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    const length = upstream.headers.get('Content-Length');
    if (length) headers.set('Content-Length', length);
    // ASCII fallback name plus the real (e.g. Tamil) name for modern browsers
    const asciiName = file.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '');
    headers.set('Content-Disposition', `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(file)}`);
    headers.set('Cache-Control', 'public, max-age=86400');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(upstream.body, { status: 200, headers });
  },
};
