// Free Cloudflare Worker (workers/archive-download/worker.js) that passes an
// archive.org PDF through as a download: archive.org always tells browsers to
// *show* PDFs, and browsers won't force-download another site's file.
const ARCHIVE_DOWNLOAD_HELPER = 'https://meenkodi-download.ranadheerapandiyan07.workers.dev';

// Props for a "Download PDF" link.
// Our own files (/api/resources/pdf/...) are served with ?download=1, which makes
// the server send them as an attachment, so the browser saves instead of opening.
// archive.org files go through the download helper above.
export function downloadLinkProps(link) {
  if (!link) return {};
  if (link.startsWith('/')) {
    return { href: `${link}${link.includes('?') ? '&' : '?'}download=1`, download: true };
  }
  const archive = link.match(/^https:\/\/archive\.org\/download\/([^/]+)\/([^?#]+\.pdf)$/i);
  if (archive) {
    const file = decodeURIComponent(archive[2]);
    return { href: `${ARCHIVE_DOWNLOAD_HELPER}/?id=${encodeURIComponent(archive[1])}&file=${encodeURIComponent(file)}` };
  }
  return { href: link, target: '_blank', rel: 'noopener noreferrer' };
}

// Older uploads stored Tamil file names as UTF-8 bytes read as Latin-1
// ("à®à®¤à¯..."); show the real name
export function fixFileName(name) {
  if (!name || !/[À-ÿ]/.test(name)) return name || '';
  try {
    const bytes = Uint8Array.from([...name].map((c) => c.charCodeAt(0) & 0xff));
    const fixed = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    return fixed;
  } catch {
    return name;
  }
}
