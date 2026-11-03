import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import DeleteIcon from "@mui/icons-material/Delete";
import AddPhotoAlternate from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../utils/api';
import RichTextEditor from './common/RichTextEditor';
import { renderArticleHtml, articleBodySx } from '../utils/articleRender';
import cldImg, { canCropImage } from '../utils/cloudinaryImage';
import ImageCropDialog from './common/ImageCropDialog';
import CropIcon from '@mui/icons-material/Crop';

// Upload a picked image file; returns its full URL (Cloudinary) or null
async function uploadImageFile(file) {
  const formData = new FormData();
  formData.append('image', file);
  const response = await fetch(`${API_BASE_URL}/api/upload/image`, { method: 'POST', body: formData, credentials: 'include' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || data.details || 'Upload failed');
  const url = data.imageUrl || data.url || data.fullPath;
  if (!url) throw new Error('No image URL returned from server');
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? url : `/uploads/gallery/${url}`}`;
}

// Editor and preview boxes share this height on computers (each scrolls inside)
const PANE_HEIGHT = 'max(420px, calc(100vh - 230px))';

const pickFiles = (multiple = false) => new Promise((resolve) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = multiple;
  // Windows hands files over in its own order; use file-name order (1, 2, … 10)
  input.onchange = () => resolve(Array.from(input.files || []).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })));
  input.click();
});

/**
 * Article writing screen, used both for new articles and for editing
 * (pass `article`; saving then updates it and calls onSaved).
 */
export default function ArticleComposer({ user, onPostCreated, article = null, onSaved, onCancel, onDelete }) {
  const { t, i18n } = useTranslation();
  const editing = Boolean(article);
  const [composerLanguage, setComposerLanguage] = useState(() => (article && !article.content?.ta && article.content?.en ? 'en' : 'ta'));
  const [titleEn, setTitleEn] = useState(article?.title?.en || '');
  const [titleTa, setTitleTa] = useState(article?.title?.ta || '');
  const [contentEn, setContentEn] = useState(article?.content?.en || '');
  const [contentTa, setContentTa] = useState(article?.content?.ta || '');
  // Cover photo: an uploaded (and cropped) image, or a pasted image link
  const [image, setImage] = useState(article?.image || '');
  const [imageLink, setImageLink] = useState(article?.imageLink || '');
  const cover = image || imageLink;
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [mobileView, setMobileView] = useState('write'); // phones: 'write' | 'preview'
  const ta = composerLanguage === 'ta';
  const uiTa = i18n.language === 'ta'; // labels follow the site language, not the writing language
  const currentTitle = ta ? titleTa : titleEn;
  const currentContent = ta ? contentTa : contentEn;

  // Pick and upload photos; returns their URLs (several at once for the article text)
  const uploadPhotos = async (multiple) => {
    const files = await pickFiles(multiple);
    if (!files.length) return [];
    setUploading(true);
    setError(null);
    const urls = [];
    try {
      for (const file of files) urls.push(await uploadImageFile(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
    return urls;
  };
  const uploadForEditor = () => uploadPhotos(true);

  const chooseThumbnail = async () => {
    const [url] = await uploadPhotos(false);
    if (url) {
      setImage(url);
      setImageLink('');
      if (canCropImage(url)) setAdjustOpen(true); // pick the part to show right away
    }
  };

  const handleSubmit = async () => {
    // Both languages are sent; at least one of them must be filled in
    if (!titleEn.trim() && !titleTa.trim()) {
      setError(t('articles.error.titleRequired', 'Title is required'));
      return;
    }
    if (!contentEn.trim() && !contentTa.trim()) {
      setError(t('articles.error.contentRequired', 'Content is required'));
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const body = {
        title: { en: titleEn, ta: titleTa },
        content: { en: contentEn, ta: contentTa },
        image,
        imageLink,
      };
      const response = await fetch(`${API_BASE_URL}/api/articles${editing ? `/${article._id}` : ''}`, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || (editing ? 'Failed to save the article' : 'Failed to create article'));

      if (editing) {
        if (onSaved) onSaved(data);
        return;
      }
      setSuccess(true);
      setTitleEn('');
      setTitleTa('');
      setContentEn('');
      setContentTa('');
      setImage('');
      setImageLink('');
      setTimeout(() => setSuccess(false), 3000);
      if (onPostCreated) onPostCreated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Card sx={{ p: { xs: 2, md: 3 }, mb: 4, border: '2px solid #000', borderRadius: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'visible' }}>
      {editing && (
        <Typography sx={{ fontWeight: 800, fontFamily: 'Georgia, serif', color: '#8B0000', fontSize: '1.3rem', mb: 2 }}>
          {i18n.language === 'ta' ? 'கட்டுரையைத் திருத்து' : 'Edit article'}
        </Typography>
      )}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>
          {user.role === 'admin'
            ? t('articles.composer.published', 'Article published successfully!')
            : t('articles.composer.submitted', 'Article submitted for review!')}
        </Alert>
      )}

      {/* Language */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#555' }}>
          {i18n.language === 'ta' ? 'எழுதும் மொழி:' : 'Writing in:'}
        </Typography>
        <ToggleButtonGroup
          value={composerLanguage}
          exclusive
          size="small"
          onChange={(e, lang) => lang && setComposerLanguage(lang)}
          sx={{
            '& .MuiToggleButton-root': {
              px: 2.5, border: '2px solid #8B0000', color: '#8B0000', fontWeight: 700,
              '&.Mui-selected': { bgcolor: '#8B0000', color: '#fff', '&:hover': { bgcolor: '#6B0000' } },
            },
          }}
        >
          <ToggleButton value="ta">தமிழ் {contentTa.trim() ? '✓' : ''}</ToggleButton>
          <ToggleButton value="en">ENGLISH {contentEn.trim() ? '✓' : ''}</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Title */}
      <TextField
        fullWidth
        placeholder={ta ? 'தலைப்பு (தமிழ்)…' : 'Title (English)…'}
        value={ta ? titleTa : titleEn}
        onChange={(e) => (ta ? setTitleTa(e.target.value) : setTitleEn(e.target.value))}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            fontSize: { xs: '1.25rem', md: '1.5rem' }, fontWeight: 700, fontFamily: 'Georgia, serif',
            '&.Mui-focused fieldset': { borderColor: '#8B0000', borderWidth: 2 },
          },
        }}
      />

      {/* Thumbnail: one compact row — upload a photo or paste an image link */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5, flexWrap: 'wrap' }}>
        <Box sx={{ position: 'relative', width: 88, height: 56, flexShrink: 0, borderRadius: 1, border: '1px dashed #ccc', bgcolor: '#f7f5f1', overflow: 'visible', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {cover ? (
            <>
              <Box component="img" src={cldImg(cover, 200)} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1, display: 'block' }} />
              <IconButton size="small" onClick={() => { setImage(''); setImageLink(''); }} aria-label="Remove thumbnail" sx={{ position: 'absolute', top: -9, right: -9, p: 0.25, bgcolor: '#fff', border: '1px solid #ddd', '&:hover': { bgcolor: '#fee' } }}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </>
          ) : (
            <AddPhotoAlternate sx={{ color: '#bbb' }} />
          )}
        </Box>
        <Button size="small" onClick={chooseThumbnail} disabled={uploading} startIcon={uploading ? <CircularProgress size={14} /> : null} variant="outlined" sx={{ color: '#8B0000', borderColor: '#8B0000', textTransform: 'none', whiteSpace: 'nowrap' }}>
          {cover ? (uiTa ? 'முகப்புப் படத்தை மாற்று' : 'Change thumbnail') : (uiTa ? 'முகப்புப் படம் சேர்' : 'Add thumbnail')}
        </Button>
        <TextField
          size="small"
          placeholder={uiTa ? 'அல்லது பட இணைப்பை ஒட்டவும் (https://…)' : 'or paste image link (https://…)'}
          value={imageLink}
          onChange={(e) => { setImageLink(e.target.value); if (e.target.value) setImage(''); }}
          sx={{ flex: 1, minWidth: 200, maxWidth: 420 }}
        />
        {canCropImage(cover) && (
          <Button size="small" onClick={() => setAdjustOpen(true)} startIcon={<CropIcon />} sx={{ color: '#8B0000', textTransform: 'none', whiteSpace: 'nowrap' }}>
            {uiTa ? 'காட்டும் பகுதியைச் சரிசெய்' : 'Adjust what shows'}
          </Button>
        )}
      </Box>
      <ImageCropDialog
        open={adjustOpen}
        src={cover}
        onClose={() => setAdjustOpen(false)}
        onSave={(url) => {
          if (image) setImage(url); else setImageLink(url);
          setAdjustOpen(false);
        }}
        labels={uiTa ? {
          title: 'முகப்புப் படத்தைச் சரிசெய்',
          hint: 'காட்ட வேண்டிய பகுதிக்குப் பெட்டியை இழுக்கவும். பெரிதாக்க ஸ்லைடரைப் பயன்படுத்தவும்.',
          zoom: 'பெரிதாக்கு',
          cancel: 'ரத்து',
          save: 'இந்தப் பகுதியைப் பயன்படுத்து',
        } : {}}
      />

      {/* Phones: switch between writing and the preview */}
      <Tabs
        value={mobileView}
        onChange={(e, v) => setMobileView(v)}
        variant="fullWidth"
        sx={{ display: { xs: 'flex', md: 'none' }, mb: 1.5, '& .Mui-selected': { color: '#8B0000 !important' }, '& .MuiTabs-indicator': { bgcolor: '#8B0000' } }}
      >
        <Tab value="write" label={uiTa ? 'எழுது' : 'Write'} />
        <Tab value="preview" label={uiTa ? 'முன்னோட்டம்' : 'Preview'} />
      </Tabs>

      {/* Editor on the left, live preview of the published article on the right */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, alignItems: 'start' }}>
        <Box sx={{ display: { xs: mobileView === 'write' ? 'block' : 'none', md: 'block' }, minWidth: 0 }}>
          <RichTextEditor
            key={composerLanguage}
            value={currentContent}
            onChange={ta ? setContentTa : setContentEn}
            placeholder={ta ? 'உங்கள் கட்டுரையை இங்கே எழுதுங்கள்…' : 'Write your article here…'}
            onUploadImage={uploadForEditor}
            uploading={uploading}
            height={{ md: PANE_HEIGHT }}
          />
        </Box>

        <Box sx={{ display: { xs: mobileView === 'preview' ? 'block' : 'none', md: 'block' }, minWidth: 0 }}>
          {/* Header bar, same height as the editor toolbar so both boxes line up */}
          <Box sx={{ minHeight: 50, boxSizing: 'border-box', display: 'flex', alignItems: 'center', px: 2, border: '1px solid #e0dcd3', borderBottom: 'none', borderRadius: '6px 6px 0 0', bgcolor: '#faf8f5' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#8B0000', letterSpacing: 1 }}>
              {uiTa ? 'வெளியிட்ட பின் இப்படித் தோன்றும்' : 'PREVIEW — HOW IT WILL LOOK WHEN PUBLISHED'}
            </Typography>
          </Box>
          <Paper
            elevation={0}
            sx={{ border: '1px solid #e0dcd3', borderRadius: '0 0 6px 6px', bgcolor: '#fff', p: { xs: 2, md: 3 }, overflowWrap: 'anywhere', overflowX: 'hidden', height: { md: PANE_HEIGHT }, overflowY: { md: 'auto' } }}
          >
            {cover && (
              <Box component="img" src={cldImg(cover, 900)} alt="" sx={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', borderRadius: 1, mb: 2, display: 'block' }} />
            )}
            <Typography sx={{ fontFamily: 'Georgia, serif', fontWeight: 700, color: '#000', fontSize: { xs: '1.5rem', md: '1.8rem' }, lineHeight: 1.3, mb: 2 }}>
              {currentTitle || <Box component="span" sx={{ color: '#bbb' }}>{ta ? 'தலைப்பு' : 'Your title'}</Box>}
            </Typography>
            {currentContent.trim() ? (
              <Box sx={articleBodySx} dangerouslySetInnerHTML={{ __html: renderArticleHtml(currentContent) }} />
            ) : (
              <Typography sx={{ color: '#aaa', fontStyle: 'italic' }}>
                {uiTa ? 'எழுதத் தொடங்கியதும் இங்கே தெரியும்…' : 'Start writing and your article appears here…'}
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        {editing && onDelete && (
          <Button onClick={onDelete} disabled={submitting} color="error" variant="outlined" startIcon={<DeleteIcon />} sx={{ mr: 'auto', fontWeight: 600 }}>
            {i18n.language === 'ta' ? 'கட்டுரையை நீக்கு' : 'Delete article'}
          </Button>
        )}
        {editing && onCancel && (
          <Button onClick={onCancel} disabled={submitting} sx={{ color: '#555' }}>
            {i18n.language === 'ta' ? 'ரத்து' : 'Cancel'}
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || uploading}
          sx={{ bgcolor: '#8B0000', color: '#fff', borderRadius: 0, px: { xs: 4, md: 6 }, py: 1.5, fontWeight: 700, minWidth: 140, '&:hover': { bgcolor: '#6B0000' } }}
        >
          {submitting
            ? <><CircularProgress size={20} sx={{ mr: 1, color: '#fff' }} />{editing ? 'Saving…' : t('actions.posting', 'Posting...')}</>
            : (editing ? (i18n.language === 'ta' ? 'சேமி' : 'Save changes') : t('actions.post', 'POST'))}
        </Button>
      </Box>
    </Card>
  );
}
