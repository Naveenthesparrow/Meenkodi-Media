// Converts between the stored article text format and the visual editor.
//
// Stored format (unchanged, so existing articles, the article page and SEO keep
// working): one block per line —
//   "# ", "## ", "### "   headings
//   "- "                  bullet item
//   "1. "                 numbered item
//   "![alt](url)"         image
//   anything else         paragraph (an empty line = an empty paragraph)
// with inline **bold**, *italic*, `code` and [text](url) links.

import { stripCloudinarySizing } from './cloudinaryImage';

const escapeHtml = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const safeUrl = (url) => {
  const u = String(url || '').trim();
  return /^(https?:|mailto:)/i.test(u) || u.startsWith('/') ? u : '';
};

// Inline formatting of one line (text is escaped first)
function inlineToHtml(text) {
  let html = escapeHtml(text);
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
    const href = safeUrl(url.replace(/&amp;/g, '&'));
    return href ? `<a href="${escapeHtml(href)}">${label}</a>` : label;
  });
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  return html;
}

/** Stored text -> HTML for the editor */
export function articleTextToHtml(text) {
  const isImage = (line) => /^!\[[^\]]*\]\([^)\s]+\)$/.test((line || '').trim());
  const all = String(text || '').replace(/\r\n/g, '\n').split('\n');
  // Drop empty lines that only separate two photos, so photos sit together without gaps
  const lines = all.filter((line, i) => {
    if (line.trim()) return true;
    let prev = i - 1;
    while (prev >= 0 && !all[prev].trim()) prev--;
    let next = i + 1;
    while (next < all.length && !all[next].trim()) next++;
    return !(isImage(all[prev]) && isImage(all[next]));
  });
  const out = [];
  let list = null; // 'ul' | 'ol'
  const closeList = () => { if (list) { out.push(`</${list}>`); list = null; } };

  for (const line of lines) {
    const image = line.trim().match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    const heading = line.match(/^(#{1,3}) (.*)$/);
    const bullet = line.match(/^-\s+(.*)$/);
    const numbered = line.match(/^\d+\.\s+(.*)$/);

    if (bullet || numbered) {
      const type = bullet ? 'ul' : 'ol';
      if (list !== type) { closeList(); out.push(`<${type}>`); list = type; }
      out.push(`<li><p>${inlineToHtml((bullet || numbered)[1])}</p></li>`);
      continue;
    }
    closeList();
    if (image) {
      // photos stay a plain text line in the editor, so they can be cut and pasted anywhere
      out.push(`<p>${escapeHtml(line.trim())}</p>`);
    } else if (heading) {
      out.push(`<h${heading[1].length}>${inlineToHtml(heading[2])}</h${heading[1].length}>`);
    } else {
      out.push(`<p>${inlineToHtml(line)}</p>`);
    }
  }
  closeList();
  return out.join('');
}

// Editor JSON (TipTap/ProseMirror) inline content -> stored inline text
function inlineToText(nodes = []) {
  return nodes.map((node) => {
    if (node.type === 'hardBreak') return ' ';
    if (node.type !== 'text') return '';
    let text = node.text || '';
    const marks = node.marks || [];
    if (marks.some((m) => m.type === 'code')) text = `\`${text}\``;
    if (marks.some((m) => m.type === 'italic')) text = `*${text}*`;
    if (marks.some((m) => m.type === 'bold')) text = `**${text}**`;
    const link = marks.find((m) => m.type === 'link');
    if (link && safeUrl(link.attrs?.href)) text = `[${text}](${link.attrs.href})`;
    return text;
  }).join('');
}

/** Editor JSON -> stored text */
export function editorJsonToArticleText(doc) {
  const lines = [];
  for (const block of doc?.content || []) {
    switch (block.type) {
      case 'heading':
        lines.push(`${'#'.repeat(Math.min(3, block.attrs?.level || 1))} ${inlineToText(block.content)}`);
        break;
      case 'bulletList':
      case 'orderedList':
        (block.content || []).forEach((item, i) => {
          const text = (item.content || []).map((p) => inlineToText(p.content)).join(' ');
          lines.push(block.type === 'bulletList' ? `- ${text}` : `${i + 1}. ${text}`);
        });
        break;
      case 'image':
        // stripCloudinarySizing: always save the full photo, never a resized copy
        if (safeUrl(block.attrs?.src)) lines.push(`![${block.attrs?.alt || 'image'}](${stripCloudinarySizing(block.attrs.src)})`);
        break;
      case 'blockquote':
        (block.content || []).forEach((p) => lines.push(inlineToText(p.content)));
        break;
      default: { // paragraph (and anything unexpected) as plain text
        // a photo line is kept exactly as typed (ignoring any link styling the editor added)
        const plain = (block.content || []).map((n) => n.text || '').join('').trim();
        const photo = plain.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
        lines.push(photo ? `![${photo[1]}](${stripCloudinarySizing(photo[2])})` : inlineToText(block.content));
      }
    }
  }
  // drop trailing empty lines
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  return lines.join('\n');
}
