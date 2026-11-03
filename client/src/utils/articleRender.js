// Renders stored article text to HTML for the article page and the editor's
// live preview (one copy, so the preview always matches what is published).
// The author's text is escaped first, so it can never become HTML.
import cldImg from './cloudinaryImage';

const escapeHtml = (s) => s
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

// Only http(s), mailto and site-relative URLs may become links/images
const safeUrl = (url) => {
  const u = url.trim();
  return /^(https?:|mailto:)/i.test(u) || u.startsWith('/') ? u : null;
};

// Bold, italic and inline code on already-escaped text
const formatInline = (text) => text
  // Bold (must be before italic)
  .replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight: 700; color: #000;">$1</strong>')
  // Italic
  .replace(/\*([^*]+)\*/g, '<em style="font-style: italic; color: #333;">$1</em>')
  // Code
  .replace(/`([^`]+)`/g, '<code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 0.9em; color: #d63384;">$1</code>');

// A line that is only a photo: ![alt](url)
const IMAGE_LINE = /^!\[([^\]]*)\]\(([^)\s]+)\)$/;

// Photo tag; the page opens data-full in the full-size viewer on click (see ArticleDetail)
const photoTag = (rawUrl, rawAlt, className) => {
  const src = safeUrl(escapeHtml(rawUrl));
  if (!src) return '';
  return `<img class="${className}" src="${cldImg(src, 1200)}" data-full="${src}" alt="${escapeHtml(rawAlt)}" loading="lazy" />`;
};

// Parse markdown-like formatting to HTML
export function renderArticleHtml(content) {
  if (!content) return '';
  
  // Split content into lines for better processing
  let lines = content.split('\n');
  let html = '';
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Photos on their own lines: several in a row -> grid (up to 3 per row);
    // one photo with text after it -> beside the text; otherwise centred
    if (IMAGE_LINE.test(line.trim())) {
      const run = [];
      let j = i;
      while (j < lines.length) {
        const m = lines[j].trim().match(IMAGE_LINE);
        if (m) { run.push(m); j++; continue; }
        if (!lines[j].trim()) {
          // skip empty lines only when another photo follows them
          let k = j;
          while (k < lines.length && !lines[k].trim()) k++;
          if (k < lines.length && IMAGE_LINE.test(lines[k].trim())) { j = k; continue; }
        }
        break;
      }
      const textFollows = lines.slice(j).some((l) => l.trim() && !IMAGE_LINE.test(l.trim()));
      if (run.length > 1) {
        html += `<div class="article-gallery">${run.map((m) => photoTag(m[2], m[1], 'article-photo')).join('')}</div>`;
      } else {
        html += photoTag(run[0][2], run[0][1], textFollows ? 'article-photo article-photo-side' : 'article-photo');
      }
      i = j - 1;
      continue;
    }

    // Skip empty lines
    if (!line.trim()) {
      html += '<br />';
      continue;
    }

    // Escape the author's raw text first so it can never become HTML
    line = escapeHtml(line.replace(/\u0000/g, ''));
    
    // Headers (must be at start of line)
    if (line.match(/^### /)) {
      line = line.replace(/^### (.*)$/, '<h3 style="font-size: 1.3rem; font-weight: 600; margin: 16px 0 8px; color: #333;">$1</h3>');
    } else if (line.match(/^## /)) {
      line = line.replace(/^## (.*)$/, '<h2 style="font-size: 1.6rem; font-weight: 700; margin: 20px 0 12px; color: #1a1a1a;">$1</h2>');
    } else if (line.match(/^# /)) {
      line = line.replace(/^# (.*)$/, '<h1 style="font-size: 2rem; font-weight: 700; margin: 24px 0 16px; color: #000;">$1</h1>');
    }
    // Numbered lists
    else if (line.match(/^\d+\.\s+/)) {
      line = line.replace(/^(\d+)\.\s+(.*)$/, '<li style="margin-left: 20px; list-style-type: decimal; margin-bottom: 8px;">$2</li>');
    }
    // Bullet lists
    else if (line.match(/^-\s+/)) {
      line = line.replace(/^-\s+(.*)$/, '<li style="margin-left: 20px; list-style-type: disc; margin-bottom: 8px;">$1</li>');
    }
    // Regular paragraph
    else {
      line = '<p style="margin-bottom: 12px;">' + line + '</p>';
    }
    
    // Now apply inline formatting (bold, italic, code, links, images).
    // Finished images/links are parked as placeholders so the bold/italic/code
    // pass can't inject tags into their attributes.
    const tokens = [];
    const keep = (tag) => `\u0000${tokens.push(tag) - 1}\u0000`;

    // Images (must be before links)
    line = line.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, url) => {
      const src = safeUrl(url);
      // Reader-friendly size (click opens the full photo, see ArticleDetail)
      return src ? keep(`<img class="article-photo" src="${cldImg(src, 1200)}" data-full="${src}" alt="${alt}" loading="lazy" />`) : alt;
    });

    // Links
    line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, url) => {
      const href = safeUrl(url);
      return href ? keep(`<a href="${href}" style="color: #8B0000; text-decoration: underline; font-weight: 600;">${formatInline(text)}</a>`) : text;
    });

    line = formatInline(line);
    line = line.replace(/\u0000(\d+)\u0000/g, (m, n) => tokens[n]);

    html += line;
  }
  
  return html;
}

// Text styling of a published article (MUI sx), shared with the editor preview
export const articleBodySx = {
  lineHeight: 1.9,
  fontSize: { xs: '1.05rem', md: '1.15rem' },
  color: '#333',
  fontFamily: 'Georgia, serif',
  '& p': { mb: 2 },
  // headings left-aligned: justify stretches the spaces between long Tamil words
  '& h1, & h2, & h3': { fontFamily: 'Georgia, serif', textAlign: 'left' },
  '& strong': { fontWeight: 700, color: '#000' },
  '& em': { fontStyle: 'italic' },
  '& a': { color: '#8B0000', textDecoration: 'underline', fontWeight: 600 },
  textAlign: 'justify',
  // Photos: reader-friendly size, click opens the full photo
  '& img.article-photo': {
    display: 'block', maxWidth: '100%', maxHeight: 400, width: 'auto', height: 'auto', m: '20px auto',
    borderRadius: '6px', cursor: 'zoom-in', boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
  },
  // One photo with text after it: on the right, text flows beside it (full width on phones).
  // Height is capped; the width follows the photo's shape.
  '& img.article-photo-side': {
    float: { md: 'right' }, maxWidth: { md: '36%' }, maxHeight: { xs: 400, md: 300 },
    m: { xs: '20px auto', md: '6px 0 16px 28px' },
  },
  // Several photos together: grid of up to 3 per row, each shown whole
  '& .article-gallery': {
    clear: 'both', display: 'grid', gap: '12px', my: 3,
    gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(max(180px, 30%), 1fr))' },
  },
  '& .article-gallery img.article-photo': {
    width: '100%', height: { xs: 'auto', sm: 240 }, maxHeight: { xs: 400, sm: 240 }, m: 0,
    objectFit: 'contain', bgcolor: '#f7f5f1',
  },
  '&::after': { content: '""', display: 'table', clear: 'both' }, // keep a side photo inside the article
};
