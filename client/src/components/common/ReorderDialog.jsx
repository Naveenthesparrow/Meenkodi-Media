import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, IconButton, Alert, CircularProgress,
} from '@mui/material';
import DragIndicator from '@mui/icons-material/DragIndicator';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';
import cldImg from '../../utils/cloudinaryImage';

/**
 * Admin dialog to arrange items (same behaviour as the Gallery reorder):
 * drag rows or use the up/down arrows, then Save.
 * items: [{ id, title, subtitle?, image? }]; onSave(orderedIds) returns a promise.
 */
export default function ReorderDialog({ open, onClose, items, onSave, title = 'Arrange order' }) {
  const [list, setList] = useState(items);
  const [dragIndex, setDragIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) { setList(items); setError(''); }
  }, [open, items]);

  const move = (from, to) => {
    if (to < 0 || to >= list.length || from === to) return;
    setList((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await onSave(list.map((item) => item.id));
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save the order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      sx={{ '& .MuiDialog-paper': { m: { xs: 1, sm: 2 }, width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' } } }}>
      <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>{title}</DialogTitle>
      <DialogContent sx={{ mt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DragIndicator sx={{ color: '#8B0000' }} />
          <Typography variant="body2" sx={{ color: '#666' }}>Drag rows to reorder, or use the up/down arrows. The first one shows first.</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {list.map((item, index) => (
            <Box
              key={item.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragIndex !== null) move(dragIndex, index); setDragIndex(null); }}
              sx={{
                display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.5 }, p: { xs: 1, md: 1.25 },
                border: '1px dashed #c4c4c4', borderRadius: 1, bgcolor: dragIndex === index ? '#faf6f6' : '#fff',
                cursor: 'grab', '&:active': { cursor: 'grabbing' }, '&:hover': { borderColor: '#8B0000', bgcolor: '#faf6f6' },
              }}
            >
              <Typography sx={{ width: 22, textAlign: 'right', color: '#999', fontSize: '0.85rem', flexShrink: 0 }}>{index + 1}</Typography>
              <DragIndicator sx={{ color: '#8B0000', flexShrink: 0 }} />
              {item.image ? (
                <Box component="img" src={cldImg(item.image, 120)} alt="" sx={{ width: 34, height: 50, objectFit: 'cover', borderRadius: 0.5, flexShrink: 0 }} />
              ) : (
                <Box sx={{ width: 34, height: 50, borderRadius: 0.5, bgcolor: '#8B0000', flexShrink: 0 }} />
              )}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, fontSize: { xs: '0.9rem', md: '0.95rem' }, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</Typography>
                {item.subtitle && <Typography sx={{ color: '#888', fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.subtitle}</Typography>}
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                <IconButton size="small" aria-label="Move up" onClick={() => move(index, index - 1)} disabled={index === 0} sx={{ bgcolor: '#f5f5f5' }}>
                  <ArrowUpward fontSize="small" />
                </IconButton>
                <IconButton size="small" aria-label="Move down" onClick={() => move(index, index + 1)} disabled={index === list.length - 1} sx={{ bgcolor: '#f5f5f5' }}>
                  <ArrowDownward fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Button onClick={onClose} sx={{ color: '#666' }}>Cancel</Button>
        <Button onClick={save} variant="contained" disabled={saving || list.length === 0}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          sx={{ bgcolor: '#8B0000', '&:hover': { bgcolor: '#6B0000' } }}>
          Save Order
        </Button>
      </DialogActions>
    </Dialog>
  );
}
