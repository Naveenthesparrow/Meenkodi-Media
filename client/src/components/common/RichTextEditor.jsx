import React, { useEffect, useRef } from 'react';
import { Box, Button, CircularProgress, Divider, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import FormatBold from '@mui/icons-material/FormatBold';
import FormatItalic from '@mui/icons-material/FormatItalic';
import FormatListBulleted from '@mui/icons-material/FormatListBulleted';
import FormatListNumbered from '@mui/icons-material/FormatListNumbered';
import LinkIcon from '@mui/icons-material/Link';
import LinkOff from '@mui/icons-material/LinkOff';
import ImageIcon from '@mui/icons-material/Image';
import Undo from '@mui/icons-material/Undo';
import Redo from '@mui/icons-material/Redo';
import { articleTextToHtml, editorJsonToArticleText } from '../../utils/articleFormat';

/**
 * Word-like editor for articles: what you see is what gets published.
 * `value` / `onChange` use the stored article text format (see utils/articleFormat),
 * so nothing changes for existing articles or the article page.
 */
export default function RichTextEditor({ value, onChange, placeholder, onUploadImage, uploading = false, minHeight = 420, height }) {
  const lastEmitted = useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, codeBlock: false, horizontalRule: false, strike: false }),
      Link.configure({ openOnClick: false, autolink: true, protocols: ['http', 'https', 'mailto'] }),
      Image.configure({ inline: false }), // only for photos pasted from elsewhere; saved as a photo line
      Placeholder.configure({ placeholder }),
    ],
    content: articleTextToHtml(value),
    // re-render on every change so Undo/Redo and the active buttons stay up to date
    shouldRerenderOnTransaction: true,
    // Opening tidies the text (e.g. no empty lines between photos); pass that on so
    // the preview and Save use it straight away
    onCreate: ({ editor: ed }) => {
      const text = editorJsonToArticleText(ed.getJSON());
      if (text !== (value || '').replace(/\r\n/g, '\n').replace(/\s+$/, '')) {
        lastEmitted.current = text;
        onChange(text);
      }
    },
    onUpdate: ({ editor: ed }) => {
      const text = editorJsonToArticleText(ed.getJSON());
      lastEmitted.current = text;
      onChange(text);
    },
  });

  // Load new content when the value changes from outside (e.g. switching language)
  useEffect(() => {
    if (editor && value !== lastEmitted.current) {
      lastEmitted.current = value;
      editor.commands.setContent(articleTextToHtml(value), false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const button = (title, icon, action, active = false, disabled = false) => (
    <Tooltip title={title}>
      <span>
        <IconButton
          size="small"
          onMouseDown={(e) => e.preventDefault()} // keep the text selection
          onClick={action}
          disabled={disabled}
          sx={{
            borderRadius: 1,
            color: active ? '#fff' : '#333',
            bgcolor: active ? '#8B0000' : 'transparent',
            '&:hover': { bgcolor: active ? '#6B0000' : 'rgba(139,0,0,0.08)' },
          }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
  const headingButton = (level) => button(
    `Heading ${level}`,
    <Typography sx={{ fontWeight: 800, fontSize: level === 1 ? '1.05rem' : level === 2 ? '0.95rem' : '0.85rem', lineHeight: 1, px: 0.3 }}>H{level}</Typography>,
    () => editor.chain().focus().toggleHeading({ level }).run(),
    editor.isActive('heading', { level }),
  );

  const setLink = () => {
    const previous = editor.getAttributes('link').href || '';
    const url = window.prompt('Link address (https://…)', previous);
    if (url === null) return;
    if (!url.trim()) { editor.chain().focus().unsetLink().run(); return; }
    const href = /^(https?:|mailto:|\/)/i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  };

  const addImage = async () => {
    if (!onUploadImage) return;
    const sources = await onUploadImage(); // one or more photo URLs
    const urls = (Array.isArray(sources) ? sources : [sources]).filter(Boolean);
    if (!urls.length) return;
    // Each photo is a plain text line "![image](link)" (cut / paste it anywhere);
    // the preview shows the photo. Added after the current line, plus an empty line to keep typing.
    const lines = urls.map((src) => ({ type: 'paragraph', content: [{ type: 'text', text: `![image](${src})` }] }));
    const { $to } = editor.state.selection;
    const at = $to.depth > 0 ? $to.after(1) : $to.pos;
    editor.chain().focus().insertContentAt(at, [...lines, { type: 'paragraph' }]).run();
  };

  const words = editor.getText().split(/\s+/).filter(Boolean).length;

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 0.75, minHeight: 50, boxSizing: 'border-box', display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center',
          border: '1px solid #e0dcd3', borderBottom: 'none', borderRadius: '6px 6px 0 0', bgcolor: '#faf8f5',
          position: 'sticky', top: { xs: 56, sm: 64 }, zIndex: 5,
        }}
      >
        {headingButton(1)}
        {headingButton(2)}
        {headingButton(3)}
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        {button('Bold (Ctrl+B)', <FormatBold fontSize="small" />, () => editor.chain().focus().toggleBold().run(), editor.isActive('bold'))}
        {button('Italic (Ctrl+I)', <FormatItalic fontSize="small" />, () => editor.chain().focus().toggleItalic().run(), editor.isActive('italic'))}
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        {button('Bullet list', <FormatListBulleted fontSize="small" />, () => editor.chain().focus().toggleBulletList().run(), editor.isActive('bulletList'))}
        {button('Numbered list', <FormatListNumbered fontSize="small" />, () => editor.chain().focus().toggleOrderedList().run(), editor.isActive('orderedList'))}
        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
        {button('Add link', <LinkIcon fontSize="small" />, setLink, editor.isActive('link'))}
        {editor.isActive('link') && button('Remove link', <LinkOff fontSize="small" />, () => editor.chain().focus().unsetLink().run())}
        {onUploadImage && button('Insert images (you can pick several)', uploading ? <CircularProgress size={18} /> : <ImageIcon fontSize="small" />, addImage, false, uploading)}
        <Box sx={{ flex: 1 }} />
        {[
          ['Undo', 'Ctrl+Z', <Undo fontSize="small" />, () => editor.chain().focus().undo().run(), editor.can().undo()],
          ['Redo', 'Ctrl+Y', <Redo fontSize="small" />, () => editor.chain().focus().redo().run(), editor.can().redo()],
        ].map(([label, keys, icon, run, enabled]) => (
          <Tooltip key={label} title={`${label} (${keys})`}>
            <span>
              <Button
                size="small"
                startIcon={icon}
                onMouseDown={(e) => e.preventDefault()}
                onClick={run}
                disabled={!enabled}
                sx={{ textTransform: 'none', color: '#8B0000', fontWeight: 600, minWidth: 0, px: 1 }}
              >
                {label}
              </Button>
            </span>
          </Tooltip>
        ))}
      </Paper>

      <Box
        onClick={() => editor.chain().focus().run()}
        sx={{
          border: '1px solid #e0dcd3', borderRadius: '0 0 6px 6px', bgcolor: '#fff', cursor: 'text',
          // fixed height (when given): the text scrolls inside the box
          ...(height && { height, overflowY: 'auto' }),
          '&:focus-within': { borderColor: '#8B0000', boxShadow: '0 0 0 1px #8B0000' },
          '& .ProseMirror': {
            minHeight, outline: 'none', p: { xs: 2, md: 3 },
            fontFamily: 'Georgia, serif', fontSize: '1.08rem', lineHeight: 1.85, color: '#222', overflowWrap: 'anywhere',
          },
          '& .ProseMirror p': { m: '0 0 0.6em' },
          '& .ProseMirror h1': { fontSize: '1.9rem', fontWeight: 700, m: '0.8em 0 0.4em' },
          '& .ProseMirror h2': { fontSize: '1.5rem', fontWeight: 700, m: '0.8em 0 0.4em' },
          '& .ProseMirror h3': { fontSize: '1.25rem', fontWeight: 600, m: '0.8em 0 0.4em' },
          '& .ProseMirror ul, & .ProseMirror ol': { pl: 3, m: '0 0 0.6em' },
          '& .ProseMirror li p': { m: 0 },
          '& .ProseMirror a': { color: '#8B0000', textDecoration: 'underline', fontWeight: 600 },
          '& .ProseMirror code': { bgcolor: '#f5f5f5', px: 0.6, borderRadius: 0.5, fontSize: '0.9em' },
          '& .ProseMirror p.is-editor-empty:first-of-type::before': {
            content: 'attr(data-placeholder)', color: '#aaa', float: 'left', height: 0, pointerEvents: 'none',
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
      <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: '#888' }}>
        {words} words · Select text, then use the buttons above. Ctrl+B bold, Ctrl+I italic, Ctrl+Z undo.
      </Typography>
    </Box>
  );
}
