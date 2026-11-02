import React, { useEffect, useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, MenuItem, TextField, Typography,
} from '@mui/material';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import Delete from '@mui/icons-material/Delete';
import AddPhotoAlternate from '@mui/icons-material/AddPhotoAlternate';
import API_BASE_URL from '../../utils/api';
import cldImg from '../../utils/cloudinaryImage';

const MAX = 5;
const FOCUS_OPTIONS = [
  { value: 'center 20%', label: 'Top (faces)' },
  { value: 'center center', label: 'Middle' },
  { value: 'center bottom', label: 'Bottom' },
];
const emptyPhoto = () => ({ image: '', title: { en: '', ta: '' }, link: '', focus: 'center 20%' });

/** Admin dialog for the home page "Heritage in Pictures" photos (max 5, first = large tile). */
export default function HomeShowcaseEditor({ open, photos, onClose, onSaved }) {
  const [items, setItems] = useState([]);
  const [uploading, setUploading] = useState(-1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setItems(photos.map((p) => ({ ...emptyPhoto(), ...p, title: { en: p.title?.en || '', ta: p.title?.ta || '' } })));
      setError('');
    }
  }, [open, photos]);

  const update = (index, patch) => setItems((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  const move = (from, to) => setItems((prev) => {
    if (to < 0 || to >= prev.length) return prev;
    const next = [...prev];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  });

  const upload = async (index, file) => {
    if (!file) return;
    setUploading(index);
    setError('');
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await fetch(`${API_BASE_URL}/api/upload/image`, { method: 'POST', body: form, credentials: 'include' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      update(index, { image: data.imageUrl || data.url });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(-1);
    }
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/home-showcase`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ photos: items.filter((p) => p.image) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save');
      onSaved(data.photos || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ borderBottom: '1px solid #eee' }}>Home page photos (Heritage in Pictures)</DialogTitle>
      <DialogContent sx={{ pt: '16px !important' }}>
        <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
          Up to {MAX} photos. The <b>first photo is the large one</b>. Best shape: <b>3:2 landscape</b> — about
          1800×1200 px for the first, 1200×800 px for the others (JPG under 2 MB).
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {items.map((photo, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', p: 1.5, mb: 1.5, border: '1px solid #e5e0d8', borderRadius: 1, bgcolor: index === 0 ? '#fffaf0' : '#fff', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
            <Box sx={{ width: { xs: '100%', sm: 180 }, flexShrink: 0 }}>
              <Box sx={{ aspectRatio: '3 / 2', bgcolor: '#f1ede6', borderRadius: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {photo.image
                  ? <Box component="img" src={cldImg(photo.image, 400)} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: photo.focus }} />
                  : <Typography variant="caption" sx={{ color: '#999' }}>No photo</Typography>}
              </Box>
              <Button component="label" size="small" fullWidth startIcon={uploading === index ? <CircularProgress size={14} /> : <AddPhotoAlternate />} disabled={uploading !== -1} sx={{ mt: 0.5, textTransform: 'none', color: '#8B0000' }}>
                {photo.image ? 'Change photo' : 'Upload photo'}
                <input type="file" hidden accept="image/*" onChange={(e) => upload(index, e.target.files?.[0])} />
              </Button>
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: index === 0 ? '#8B0000' : '#888', fontWeight: 700 }}>
                {index === 0 ? 'LARGE PHOTO' : `Small photo ${index}`}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
              <TextField size="small" label="Title (English)" value={photo.title.en} onChange={(e) => update(index, { title: { ...photo.title, en: e.target.value } })} />
              <TextField size="small" label="தலைப்பு (Tamil)" value={photo.title.ta} onChange={(e) => update(index, { title: { ...photo.title, ta: e.target.value } })} />
              <TextField size="small" label="Link when clicked (optional)" placeholder="/gallery or /dynasties/pandiya" value={photo.link} onChange={(e) => update(index, { link: e.target.value })} />
              <TextField size="small" select label="Keep in view" value={photo.focus} onChange={(e) => update(index, { focus: e.target.value })}>
                {FOCUS_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'row', sm: 'column' }, gap: 0.5 }}>
              <IconButton size="small" onClick={() => move(index, index - 1)} disabled={index === 0} aria-label="Move up"><ArrowUpward fontSize="small" /></IconButton>
              <IconButton size="small" onClick={() => move(index, index + 1)} disabled={index === items.length - 1} aria-label="Move down"><ArrowDownward fontSize="small" /></IconButton>
              <IconButton size="small" onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))} aria-label="Remove" sx={{ color: '#b00020' }}><Delete fontSize="small" /></IconButton>
            </Box>
          </Box>
        ))}

        {items.length < MAX && (
          <Button onClick={() => setItems((prev) => [...prev, emptyPhoto()])} startIcon={<AddPhotoAlternate />} variant="outlined" sx={{ color: '#8B0000', borderColor: '#8B0000', textTransform: 'none' }}>
            Add a photo ({items.length}/{MAX})
          </Button>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#666' }}>Cancel</Button>
        <Button onClick={save} variant="contained" disabled={saving || uploading !== -1} sx={{ bgcolor: '#8B0000', '&:hover': { bgcolor: '#6B0000' } }}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
