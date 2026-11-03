import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Slider, Typography } from '@mui/material';
import { cldImg, getCloudinaryCrop, getCloudinaryOriginal, withCloudinaryCrop } from '../../utils/cloudinaryImage';

/**
 * Pick which part of a Cloudinary photo is shown: drag the box, zoom with the slider.
 * The original photo is never changed — the crop is part of the image address,
 * so it can be adjusted again any time. Calls onSave(newUrl).
 */
export default function ImageCropDialog({ open, src, aspect = 16 / 9, onClose, onSave, labels = {} }) {
  const original = getCloudinaryOriginal(src || '');
  const imgRef = useRef(null);
  const drag = useRef(null);
  const [size, setSize] = useState(null); // displayed image size in px
  const [box, setBox] = useState(null); // crop box as fractions of the image: { x, y, w, h }

  useEffect(() => { if (!open) { setSize(null); setBox(null); } }, [open]);

  // Largest box of the right shape that fits, as fractions of the image
  const maxBox = (s) => {
    const w = Math.min(1, (s.h * aspect) / s.w);
    return { w, h: (w * s.w) / aspect / s.h };
  };

  const onImageLoad = () => {
    const el = imgRef.current;
    const s = { w: el.clientWidth, h: el.clientHeight };
    setSize(s);
    const saved = getCloudinaryCrop(src || '');
    const m = maxBox(s);
    if (saved) {
      const w = Math.min(saved.w, m.w);
      const h = (w * s.w) / aspect / s.h;
      setBox({ w, h, x: Math.min(saved.x, 1 - w), y: Math.min(saved.y, 1 - h) });
    } else {
      setBox({ ...m, x: (1 - m.w) / 2, y: (1 - m.h) / 2 });
    }
  };

  const clamp = (b) => ({ ...b, x: Math.max(0, Math.min(b.x, 1 - b.w)), y: Math.max(0, Math.min(b.y, 1 - b.h)) });

  const onPointerDown = (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, start: box };
  };
  const onPointerMove = (e) => {
    if (!drag.current || !size) return;
    const { px, py, start } = drag.current;
    setBox(clamp({ ...start, x: start.x + (e.clientX - px) / size.w, y: start.y + (e.clientY - py) / size.h }));
  };
  const onPointerUp = () => { drag.current = null; };

  // Slider: 100 = whole width that fits, smaller = zoom in (keeps the box centred)
  const zoom = size && box ? Math.round((box.w / maxBox(size).w) * 100) : 100;
  const setZoom = (value) => {
    const m = maxBox(size);
    const w = (m.w * value) / 100;
    const h = (m.h * value) / 100;
    const cx = box.x + box.w / 2;
    const cy = box.y + box.h / 2;
    setBox(clamp({ w, h, x: cx - w / 2, y: cy - h / 2 }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontFamily: 'Georgia, serif', fontWeight: 700 }}>{labels.title || 'Adjust photo'}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
          {labels.hint || 'Drag the box to the part you want to show. Use the slider to zoom.'}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', bgcolor: '#222', borderRadius: 1, p: 1 }}>
          <Box sx={{ position: 'relative', display: 'inline-block', lineHeight: 0, touchAction: 'none', userSelect: 'none' }}>
            <Box
              component="img"
              ref={imgRef}
              src={cldImg(original, 1200)}
              alt=""
              onLoad={onImageLoad}
              draggable={false}
              sx={{ maxWidth: '100%', maxHeight: '60vh', display: 'block' }}
            />
            {size && box && (
              <Box
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                sx={{
                  position: 'absolute',
                  left: box.x * size.w, top: box.y * size.h, width: box.w * size.w, height: box.h * size.h,
                  border: '2px solid #fff', cursor: 'move',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)', // darken everything outside the box
                }}
              />
            )}
          </Box>
        </Box>
        {size && box && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, px: 1 }}>
            <Typography variant="body2" sx={{ color: '#555', whiteSpace: 'nowrap' }}>{labels.zoom || 'Zoom'}</Typography>
            <Slider min={30} max={100} value={130 - zoom} onChange={(e, v) => setZoom(130 - v)} sx={{ color: '#8B0000' }} />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: '#555' }}>{labels.cancel || 'Cancel'}</Button>
        <Button
          variant="contained"
          disabled={!box}
          onClick={() => onSave(withCloudinaryCrop(original, box))}
          sx={{ bgcolor: '#8B0000', '&:hover': { bgcolor: '#6B0000' } }}
        >
          {labels.save || 'Use this part'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
