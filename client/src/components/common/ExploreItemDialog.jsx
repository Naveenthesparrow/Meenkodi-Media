import React, { useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, IconButton, TextField,
  ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import Close from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import ImageUploadField, { FieldLabel } from './ImageUploadField';
import { fieldSx } from './formStyles';

/**
 * Add / edit form shared by the Explore category pages.
 *
 * title: string, or (t) => string to translate it in the form's language
 * fields: [{ name, labelKey, label (fallback), multiline?, minRows?, required? }]
 *   bilingual pages read/write formData[`${name}_en`] / formData[`${name}_ta`]
 *   single-language pages read/write formData[name]
 * imageField: formData key holding the image URL (omit to hide the picker)
 * children: extra content rendered after the fields (e.g. a custom media uploader)
 */
export default function ExploreItemDialog({
  open, onClose, title, isEdit, onSave,
  fields, formData, setFormData,
  bilingual = true, language, onLanguageChange,
  imageField, imageLabel, children,
}) {
  const { i18n } = useTranslation();
  const [uploading, setUploading] = useState(false);
  // Texts follow the language being filled in (the தமிழ் / English switch),
  // not the site's language — single-language forms use the site language.
  const t = i18n.getFixedT(bilingual && language ? language : i18n.language);

  const keyFor = (name) => (bilingual ? `${name}_${language}` : name);
  const setValue = (key, value) => setFormData({ ...formData, [key]: value });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{ '& .MuiDialog-paper': { borderRadius: 0, borderTop: '4px solid #DAA520', overflow: 'hidden' } }}
    >
      {/* Header */}
      <Box sx={{ bgcolor: '#8B0000', color: '#fff', px: { xs: 2.5, sm: 3.5 }, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography sx={{ flex: 1, fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: { xs: '1.2rem', sm: '1.45rem' }, letterSpacing: 0.3 }}>
          {typeof title === 'function' ? title(t) : title}
        </Typography>
        <IconButton onClick={onClose} aria-label={t('actions.cancel', 'Cancel')} sx={{ color: '#fff', '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}>
          <Close />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: { xs: 2.5, sm: 3.5 }, py: 3, bgcolor: '#FFFDF9' }}>
        {bilingual && (
          <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 1.5 }}>
            <Typography sx={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
              {language === 'ta'
                ? t('form.editingTamil', 'You are filling in the Tamil version')
                : t('form.editingEnglish', 'You are filling in the English version')}
            </Typography>
            <ToggleButtonGroup
              value={language}
              exclusive
              size="small"
              onChange={(e, lang) => lang && onLanguageChange(lang)}
              sx={{
                '& .MuiToggleButton-root': {
                  px: 2.5,
                  borderRadius: 0,
                  border: '1px solid #8B0000',
                  color: '#8B0000',
                  fontWeight: 700,
                  '&.Mui-selected': { bgcolor: '#8B0000', color: '#fff', '&:hover': { bgcolor: '#6B0000' } },
                },
              }}
            >
              <ToggleButton value="ta">தமிழ்</ToggleButton>
              <ToggleButton value="en">English</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {fields.map((f) => {
            const key = keyFor(f.name);
            return (
              <Box key={f.name}>
                <FieldLabel required={f.required}>{f.labelKey ? t(f.labelKey, f.label) : f.label}</FieldLabel>
                <TextField
                  fullWidth
                  value={formData[key] || ''}
                  onChange={(e) => setValue(key, e.target.value)}
                  multiline={!!f.multiline}
                  minRows={f.multiline ? f.minRows || 4 : undefined}
                  inputProps={{ lang: bilingual ? language : undefined }}
                  sx={fieldSx}
                />
              </Box>
            );
          })}

          {imageField && (
            <ImageUploadField
              label={imageLabel}
              value={formData[imageField]}
              onChange={(url) => setValue(imageField, url)}
              onUploadingChange={setUploading}
              t={t}
            />
          )}

          {children}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2.5, sm: 3.5 }, py: 2, bgcolor: '#F7F1EA', borderTop: '1px solid rgba(139,0,0,0.12)', gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 0, color: '#8B0000', borderColor: 'rgba(139,0,0,0.5)', '&:hover': { borderColor: '#8B0000', bgcolor: 'rgba(139,0,0,0.04)' } }}
        >
          {t('actions.cancel', 'Cancel')}
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          disableElevation
          disabled={uploading}
          sx={{ borderRadius: 0, bgcolor: '#8B0000', px: 3, fontWeight: 700, '&:hover': { bgcolor: '#6B0000' } }}
        >
          {uploading
            ? t('form.waitForUpload', 'Uploading image…')
            : isEdit
              ? t('actions.update', 'Update')
              : t('actions.add', 'Add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
