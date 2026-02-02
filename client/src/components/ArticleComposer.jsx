import React, { useState } from 'react';
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
} from '@mui/material';
import { Image as ImageIcon, VideoLibrary as VideoIcon, Close as CloseIcon, Share as ShareIcon } from '@mui/icons-material';
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

  return (
    <Card sx={{ p: 3, mb: 4, border: '2px solid #000', borderRadius: 0 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Avatar sx={{ bgcolor: '#8B0000' }}>
          {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user.name || user.email}
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            {user.role === 'admin' 
              ? t('articles.composer.publishImmediately', 'Post will be published immediately') 
              : t('articles.composer.pendingReview', 'Post will be pending admin approval')}
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {user.role === 'admin' 
            ? t('articles.composer.published', 'Article published successfully!') 
            : t('articles.composer.submitted', 'Article submitted for review!')}
        </Alert>
      )}

      {/* Language Toggle */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="subtitle2" 
          sx={{ 
            mb: 1.5, 
            fontWeight: 600, 
            color: '#333',
            fontSize: '0.9rem'
          }}
        >
          {i18n.language === 'ta' ? 'எழுத மொழியைத் தேர்ந்தெடுக்கவும்:' : 'Select Language to Write:'}
        </Typography>
        <ToggleButtonGroup
          value={composerLanguage}
          exclusive
          onChange={(e, newLang) => newLang && setComposerLanguage(newLang)}
          sx={{
            '& .MuiToggleButton-root': {
              px: 3,
              py: 1,
              border: '1px solid #8B0000',
              color: '#8B0000',
              fontWeight: 600,
              '&.Mui-selected': {
                bgcolor: '#8B0000',
                color: '#fff',
                '&:hover': {
                  bgcolor: '#6B0000',
                },
              },
            },
          }}
        >
          <ToggleButton value="en">ENGLISH</ToggleButton>
          <ToggleButton value="ta">தமிழ்</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <TextField
        fullWidth
        placeholder={composerLanguage === 'en' ? 'Add a title (English)...' : 'தலைப்பு (தமிழ்)...'}
        value={composerLanguage === 'en' ? titleEn : titleTa}
        onChange={(e) => composerLanguage === 'en' ? setTitleEn(e.target.value) : setTitleTa(e.target.value)}
        variant="outlined"
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        multiline
        minRows={4}
        placeholder={composerLanguage === 'en' ? 'What do you want to share? (English)' : 'உங்கள் கருத்துக்களை பகிருங்கள் (தமிழ்)'}
        value={composerLanguage === 'en' ? contentEn : contentTa}
        onChange={(e) => composerLanguage === 'en' ? setContentEn(e.target.value) : setContentTa(e.target.value)}
        variant="outlined"
        sx={{ mb: 2 }}
      />

      {imagePreview && (
        <Box sx={{ position: 'relative', mb: 2 }}>
          <img
            src={imagePreview}
            alt="Preview"
            style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 4 }}
          />
          <IconButton
            onClick={() => {
              setImage('');
              setImagePreview('');
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.6)',
              color: '#fff',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      )}

      {videoUrl && (
        <Box sx={{ position: 'relative', mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ wordBreak: 'break-all', mb: 1 }}>
            {videoUrl}
          </Typography>
          <IconButton
            onClick={() => setVideoUrl('')}
            size="small"
            sx={{ position: 'absolute', top: 4, right: 4 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="article-image-upload"
          type="file"
          onChange={handleImageUpload}
          disabled={uploading || !!image}
        />
        <label htmlFor="article-image-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={uploading ? <CircularProgress size={20} /> : <ImageIcon />}
            disabled={uploading || !!image}
            sx={{ borderColor: '#000', color: '#000', borderRadius: 0 }}
          >
            {t('articles.composer.addPhoto', 'Add Photo')}
          </Button>
        </label>

        <TextField
          placeholder={t('articles.composer.videoUrl', 'Paste video URL...')}
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: <VideoIcon sx={{ mr: 1, color: '#666' }} />,
          }}
        />

        <TextField
          placeholder={composerLanguage === 'en' ? 'Social media link (optional)...' : 'சமூக ஊடக இணைப்பு (விருப்பமானது)...'}
          value={socialMediaLink}
          onChange={(e) => setSocialMediaLink(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: <ShareIcon sx={{ mr: 1, color: '#666' }} />,
          }}
        />

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
          sx={{
            bgcolor: '#8B0000',
            color: '#fff',
            borderRadius: 0,
            px: 4,
            '&:hover': { bgcolor: '#6B0000' },
            ml: 'auto',
          }}
        >
          {submitting ? t('actions.posting', 'Posting...') : t('actions.post', 'Post')}
        </Button>
      </Box>
    </Card>
  );
}
