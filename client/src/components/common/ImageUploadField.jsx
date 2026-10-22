import React, { useId, useState } from 'react';
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import CloudUpload from '@mui/icons-material/CloudUpload';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../../utils/api';
import cldImg from '../../utils/cloudinaryImage';
import { fieldSx } from './formStyles';

const MAX_SIZE_MB = 10; // matches the server's upload limit

/**
 * Image picker: upload a file from the device (sent to /api/upload/image) or
 * paste a link. Shows a preview and reports uploads so the form can wait.
 */
export default function ImageUploadField({ label, value, onChange, onUploadingChange, t: tOverride }) {
  const { t: siteT } = useTranslation();
  const t = tOverride || siteT; // a form can pass its own language
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const setBusy = (busy) => {
    setUploading(busy);
    if (onUploadingChange) onUploadingChange(busy);
  };

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = ''; // allow picking the same file again
    if (!file) return;
    setError('');
    if (!file.type.startsWith('image/')) {
      setError(t('form.imageTypeError', 'Please choose an image file (JPG, PNG, WebP…).'));
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(t('form.imageSizeError', `Image is too large — maximum ${MAX_SIZE_MB} MB.`));
      return;
    }
    const formData = new FormData();
    formData.append('image', file);
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/upload/image`, { method: 'POST', body: formData, credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const url = data.imageUrl || data.url;
      if (!url) throw new Error('No image URL returned');
      onChange(url);
    } catch (err) {
      console.error('Image upload failed:', err);
      setError(t('form.imageUploadError', 'Upload failed. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box>
      <FieldLabel>{label || t('form.image', 'Image')}</FieldLabel>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', sm: 'center' },
          p: 2,
          border: '1px dashed rgba(139,0,0,0.35)',
          bgcolor: '#FFFBF5',
        }}
      >
        {/* Preview */}
        <Box
          sx={{
            width: { xs: '100%', sm: 160 },
            height: 120,
            flexShrink: 0,
            bgcolor: '#f3ece4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {value ? (
            <Box component="img" src={cldImg(value, 400)} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <ImageOutlined sx={{ fontSize: 40, color: 'rgba(139,0,0,0.35)' }} />
          )}
          {uploading && (
            <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CircularProgress size={28} sx={{ color: '#8B0000' }} />
            </Box>
          )}
        </Box>

        {/* Actions */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <input accept="image/*" id={inputId} type="file" hidden onChange={handleFile} />
            <Button
              component="label"
              htmlFor={inputId}
              variant="contained"
              disableElevation
              disabled={uploading}
              startIcon={<CloudUpload />}
              sx={{ bgcolor: '#8B0000', borderRadius: 0, '&:hover': { bgcolor: '#6B0000' } }}
            >
              {uploading
                ? t('form.uploading', 'Uploading…')
                : value ? t('form.replaceImage', 'Replace image') : t('form.uploadImage', 'Upload image')}
            </Button>
            {value && !uploading && (
              <Button
                onClick={() => onChange('')}
                variant="outlined"
                startIcon={<DeleteOutline />}
                sx={{ borderRadius: 0, color: '#8B0000', borderColor: 'rgba(139,0,0,0.5)', '&:hover': { borderColor: '#8B0000', bgcolor: 'rgba(139,0,0,0.04)' } }}
              >
                {t('form.removeImage', 'Remove')}
              </Button>
            )}
          </Box>
          <TextField
            size="small"
            fullWidth
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t('form.imageLinkPlaceholder', 'or paste an image link (https://…)')}
            sx={fieldSx}
          />
          {error ? (
            <Typography variant="caption" sx={{ color: '#c62828' }}>{error}</Typography>
          ) : (
            <Typography variant="caption" sx={{ color: '#888' }}>
              {t('form.imageHint', `JPG, PNG or WebP, up to ${MAX_SIZE_MB} MB.`)}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export function FieldLabel({ children, required }) {
  return (
    <Typography
      component="label"
      sx={{ display: 'block', mb: 0.75, fontWeight: 700, fontSize: '0.85rem', letterSpacing: 0.3, color: '#5a1a1a' }}
    >
      {children}
      {required && <Box component="span" sx={{ color: '#8B0000', ml: 0.5 }}>*</Box>}
    </Typography>
  );
}
