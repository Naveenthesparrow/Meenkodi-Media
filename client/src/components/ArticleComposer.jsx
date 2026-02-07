import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Avatar,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Tabs,
  Tab,
  Paper,
  Tooltip,
} from '@mui/material';
import { 
  Image as ImageIcon, 
  VideoLibrary as VideoIcon, 
  Close as CloseIcon, 
  Share as ShareIcon,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  Link as LinkIcon,
  Code as CodeIcon,
  Title as TitleIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../utils/api';

export default function ArticleComposer({ user, onPostCreated }) {
  const { t, i18n } = useTranslation();
  const [composerLanguage, setComposerLanguage] = useState('en'); // 'en' or 'ta'
  const [titleEn, setTitleEn] = useState('');
  const [titleTa, setTitleTa] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [contentTa, setContentTa] = useState('');
  const [image, setImage] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [socialMediaLink, setSocialMediaLink] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const contentRef = useRef(null);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');

      const imageUrl = data.imageUrl || data.fullPath;
      const normalizedUrl = imageUrl.startsWith('/') ? imageUrl : `/uploads/gallery/${imageUrl}`;
      setImage(`${API_BASE_URL}${normalizedUrl}`);
    } catch (err) {
      setError(err.message);
      setImagePreview('');
    } finally {
      setUploading(false);
    }
  };

  // Rich text formatting functions
  const insertFormatting = (before, after = '') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = composerLanguage === 'en' ? contentEn.substring(start, end) : contentTa.substring(start, end);
    const currentContent = composerLanguage === 'en' ? contentEn : contentTa;
    
    const newText = currentContent.substring(0, start) + before + selectedText + after + currentContent.substring(end);
    
    if (composerLanguage === 'en') {
      setContentEn(newText);
    } else {
      setContentTa(newText);
    }

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertHeading = (level) => {
    const hashes = '#'.repeat(level);
    insertFormatting(`${hashes} `, '\n');
  };

  const insertBold = () => insertFormatting('**', '**');
  const insertItalic = () => insertFormatting('*', '*');
  const insertList = () => insertFormatting('\n- ');
  const insertNumberedList = () => insertFormatting('\n1. ');
  const insertCode = () => insertFormatting('`', '`');

  const insertImageLink = () => {
    const url = prompt(composerLanguage === 'en' 
      ? 'Enter image URL:' 
      : 'படத்தின் URL ஐ உள்ளிடவும்:'
    );
    if (url) {
      insertFormatting(`![Image](${url})\n`);
    }
  };

  const insertLink = () => {
    const url = prompt(composerLanguage === 'en' 
      ? 'Enter link URL:' 
      : 'இணைப்பு URL ஐ உள்ளிடவும்:'
    );
    if (url) {
      insertFormatting('[', `](${url})`);
    }
  };

  // Parse markdown-like content for preview
  const parseContent = (content) => {
    if (!content) return '';
    
    // Split content into lines for better processing
    let lines = content.split('\n');
    let html = '';
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Skip empty lines
      if (!line.trim()) {
        html += '<br />';
        continue;
      }
      
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
      
      // Now apply inline formatting (bold, italic, code, links, images)
      // Images (must be before links)
      line = line.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 16px 0; border-radius: 8px; display: block;" />');
      
      // Links
      line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #8B0000; text-decoration: underline; font-weight: 600;">$1</a>');
      
      // Bold (must be before italic)
      line = line.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight: 700; color: #000;">$1</strong>');
      
      // Italic
      line = line.replace(/\*([^*]+)\*/g, '<em style="font-style: italic; color: #333;">$1</em>');
      
      // Code
      line = line.replace(/`([^`]+)`/g, '<code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 0.9em; color: #d63384;">$1</code>');
      
      html += line;
    }
    
    return html;
  };

  const handleSubmit = async () => {
    const currentTitle = composerLanguage === 'en' ? titleEn : titleTa;
    const currentContent = composerLanguage === 'en' ? contentEn : contentTa;

    if (!currentTitle.trim()) {
      setError(t('articles.error.titleRequired', 'Title is required'));
      return;
    }

    if (!currentContent.trim()) {
      setError(t('articles.error.contentRequired', 'Content is required'));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: { 
            en: composerLanguage === 'en' ? titleEn : '', 
            ta: composerLanguage === 'ta' ? titleTa : '' 
          },
          content: { 
            en: composerLanguage === 'en' ? contentEn : '', 
            ta: composerLanguage === 'ta' ? contentTa : '' 
          },
          image,
          videoUrl,
          socialMediaLink,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create article');

      setSuccess(true);
      setTitleEn('');
      setTitleTa('');
      setContentEn('');
      setContentTa('');
      setImage('');
      setVideoUrl('');
      setSocialMediaLink('');
      setImagePreview('');

      setTimeout(() => setSuccess(false), 3000);

      if (onPostCreated) onPostCreated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  const currentContent = composerLanguage === 'en' ? contentEn : contentTa;
  const currentTitle = composerLanguage === 'en' ? titleEn : titleTa;

  return (
    <Card sx={{ p: { xs: 2, md: 3 }, mb: 4, border: '2px solid #000', borderRadius: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
          {user.role === 'admin' 
            ? t('articles.composer.published', 'Article published successfully!') 
            : t('articles.composer.submitted', 'Article submitted for review!')}
        </Alert>
      )}

      {/* Language Toggle */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3, p: 2, bgcolor: '#fafafa', borderRadius: 1 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ mb: 1.5, fontWeight: 600, color: '#333', fontSize: '0.9rem' }}
        >
          {i18n.language === 'ta' ? 'எழுத மொழியைத் தேர்ந்தெடுக்கவும்:' : 'Select Language to Write:'}
        </Typography>
        <ToggleButtonGroup
          value={composerLanguage}
          exclusive
          onChange={(e, newLang) => newLang && setComposerLanguage(newLang)}
          sx={{
            '& .MuiToggleButton-root': {
              px: { xs: 2.5, md: 3.5 },
              py: 1,
              border: '2px solid #8B0000',
              color: '#8B0000',
              fontWeight: 700,
              fontSize: { xs: '0.85rem', md: '0.9rem' },
              '&.Mui-selected': {
                bgcolor: '#8B0000',
                color: '#fff',
                '&:hover': { bgcolor: '#6B0000' },
              },
            },
          }}
        >
          <ToggleButton value="en">ENGLISH</ToggleButton>
          <ToggleButton value="ta">தமிழ்</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Title Field */}
      <TextField
        fullWidth
        placeholder={composerLanguage === 'en' ? 'Add a title (English)...' : 'தலைப்பு சேர்க்கவும் (தமிழ்)...'}
        value={currentTitle}
        onChange={(e) => composerLanguage === 'en' ? setTitleEn(e.target.value) : setTitleTa(e.target.value)}
        variant="outlined"
        sx={{ 
          mb: 2,
          '& .MuiOutlinedInput-root': {
            fontSize: { xs: '1.1rem', md: '1.3rem' },
            fontWeight: 600,
            '&:hover fieldset': { borderColor: '#8B0000' },
            '&.Mui-focused fieldset': { borderColor: '#8B0000', borderWidth: 2 },
          }
        }}
      />

      {/* Formatting Toolbar */}
      <Paper elevation={0} sx={{ p: 1, mb: 2, bgcolor: '#f5f5f5', display: 'flex', gap: 0.5, flexWrap: 'wrap', border: '1px solid #e0e0e0' }}>
          <Tooltip title="Heading 1">
            <IconButton size="small" onClick={() => insertHeading(1)} sx={{ '&:hover': { bgcolor: '#8B0000', color: '#fff' } }}>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 700 }}>H1</Typography>
            </IconButton>
          </Tooltip>
          <Tooltip title="Heading 2">
            <IconButton size="small" onClick={() => insertHeading(2)} sx={{ '&:hover': { bgcolor: '#8B0000', color: '#fff' } }}>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>H2</Typography>
            </IconButton>
          </Tooltip>
          <Tooltip title="Heading 3">
            <IconButton size="small" onClick={() => insertHeading(3)} sx={{ '&:hover': { bgcolor: '#8B0000', color: '#fff' } }}>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700 }}>H3</Typography>
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Tooltip title="Bold">
            <IconButton size="small" onClick={insertBold} sx={{ '&:hover': { bgcolor: '#8B0000', color: '#fff' } }}>
              <FormatBold fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton size="small" onClick={insertItalic} sx={{ '&:hover': { bgcolor: '#8B0000', color: '#fff' } }}>
              <FormatItalic fontSize="small" />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Tooltip title="Bullet List">
            <IconButton size="small" onClick={insertList} sx={{ '&:hover': { bgcolor: '#8B0000', color: '#fff' } }}>
              <FormatListBulleted fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Numbered List">
            <IconButton size="small" onClick={insertNumberedList} sx={{ '&:hover': { bgcolor: '#8B0000', color: '#fff' } }}>
              <FormatListNumbered fontSize="small" />
            </IconButton>
          </Tooltip>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Tooltip title="Insert Image Link">
            <IconButton size="small" onClick={insertImageLink} sx={{ '&:hover': { bgcolor: '#8B0000', color: '#fff' } }}>
              <ImageIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Insert Link">
            <IconButton size="small" onClick={insertLink} sx={{ '&:hover': { bgcolor: '#8B0000', color: '#fff' } }}>
              <LinkIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Code">
            <IconButton size="small" onClick={insertCode} sx={{ '&:hover': { bgcolor: '#8B0000', color: '#fff' } }}>
              <CodeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Paper>

      {/* Content Area - Split Mode */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        gap: 2,
        mb: 2 
      }}>
        {/* Editor */}
        <Box>
            <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 600, color: '#666' }}>
              ✍️ {composerLanguage === 'en' ? 'EDITOR' : 'எழுத்தாளர்'}
            </Typography>
            <TextField
              fullWidth
              multiline
              minRows={14}
              placeholder={composerLanguage === 'en' 
                ? 'Write your article here...\n\nTips:\n- Use # for headings (# H1, ## H2, ### H3)\n- Use **text** for bold\n- Use *text* for italic\n- Use formatting buttons above' 
                : 'உங்கள் கட்டுரையை இங்கே எழுதவும்...\n\nஉதவிக்குறிப்புகள்:\n- தலைப்புகளுக்கு # பயன்படுத்தவும்\n- அடித்துக் காட்ட **உரை** பயன்படுத்தவும்\n- சாய்வுக்கு *உரை* பயன்படுத்தவும்'
              }
              value={currentContent}
              onChange={(e) => composerLanguage === 'en' ? setContentEn(e.target.value) : setContentTa(e.target.value)}
              variant="outlined"
              inputRef={contentRef}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontFamily: 'Georgia, serif',
                  fontSize: '1rem',
                  lineHeight: 1.8,
                  '&:hover fieldset': { borderColor: '#8B0000' },
                  '&.Mui-focused fieldset': { borderColor: '#8B0000', borderWidth: 2 },
                },
                '& textarea': {
                  fontFamily: 'Georgia, serif !important',
                }
              }}
            />
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#666', fontStyle: 'italic' }}>
              {currentContent.length} characters • {currentContent.split(/\s+/).filter(w => w).length} words
            </Typography>
          </Box>

        {/* Preview */}
        <Box>
            <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 600, color: '#666' }}>
              👁️ {composerLanguage === 'en' ? 'LIVE PREVIEW' : 'நேரடி முன்னோட்டம்'}
            </Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                minHeight: 400,
                maxHeight: 600,
                overflowY: 'auto',
                border: '2px solid #e0e0e0',
                bgcolor: '#fafafa',
                fontFamily: 'Georgia, serif',
              }}
            >
              {currentTitle && (
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 3, 
                    pb: 2, 
                    borderBottom: '2px solid #8B0000',
                    color: '#000',
                    fontFamily: 'Georgia, serif'
                  }}
                >
                  {currentTitle}
                </Typography>
              )}
              {currentContent ? (
                <Box 
                  sx={{ 
                    '& > *': { fontFamily: 'Georgia, serif' },
                    lineHeight: 1.8,
                    color: '#333',
                    fontSize: '1.05rem',
                  }}
                  dangerouslySetInnerHTML={{ __html: parseContent(currentContent) }}
                />
              ) : (
                <Typography sx={{ color: '#999', fontStyle: 'italic', textAlign: 'center', mt: 4 }}>
                  {composerLanguage === 'en' 
                    ? 'Your article preview will appear here...' 
                    : 'உங்கள் கட்டுரை முன்னோட்டம் இங்கே தோன்றும்...'}
                </Typography>
              )}
            </Paper>
          </Box>
      </Box>

      {/* Action Buttons */}
      <Divider sx={{ my: 3 }} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{
            bgcolor: '#8B0000',
            color: '#fff',
            borderRadius: 0,
            px: { xs: 4, md: 6 },
            py: 1.5,
            fontWeight: 700,
            fontSize: { xs: '0.95rem', md: '1rem' },
            '&:hover': { 
              bgcolor: '#6B0000',
              boxShadow: '0 4px 12px rgba(139,0,0,0.4)'
            },
            minWidth: 140,
          }}
        >
          {submitting ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: '#fff' }} />
              {t('actions.posting', 'Posting...')}
            </>
          ) : (
            t('actions.post', 'POST')
          )}
        </Button>
      </Box>

      {/* Formatting Guide */}
      <Box sx={{ mt: 3, p: 2, bgcolor: '#f9f9f9', borderRadius: 1, border: '1px dashed #ccc' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: '#8B0000', display: 'block', mb: 1 }}>
          💡 {composerLanguage === 'en' ? 'Formatting Guide:' : 'வடிவமைப்பு வழிகாட்டி:'}
        </Typography>
        <Typography variant="caption" sx={{ color: '#666', display: 'block', lineHeight: 1.6 }}>
          {composerLanguage === 'en' ? (
            <>
              • <strong>**Bold text**</strong> for bold • <em>*Italic text*</em> for italic<br />
              • <strong># Heading 1</strong>, <strong>## Heading 2</strong>, <strong>### Heading 3</strong><br />
              • Use toolbar buttons or type manually • Click image button to insert image links
            </>
          ) : (
            <>
              • <strong>**தடிமன் உரை**</strong> தடிமனாக • <em>*சாய்வு உரை*</em> சாய்வாக<br />
              • <strong># தலைப்பு 1</strong>, <strong>## தலைப்பு 2</strong>, <strong>### தலைப்பு 3</strong><br />
              • கருவிப்பட்டை பொத்தான்களைப் பயன்படுத்தவும் • படங்களைச் சேர்க்க பொத்தானைக் கிளிக் செய்யவும்
            </>
          )}
        </Typography>
      </Box>
    </Card>
  );
}
