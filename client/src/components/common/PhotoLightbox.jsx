import React, { useEffect } from 'react';
import { Box, Dialog, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import cldImg from '../../utils/cloudinaryImage';

const controlSx = {
  color: '#fff', bgcolor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)',
  '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
};

/**
 * Full-screen photo viewer: photo in the middle, close / previous / next
 * outside the photo, keyboard ← → and Esc. `photos` = list of URLs, `index` = shown one.
 */
export default function PhotoLightbox({ photos = [], index = 0, onIndexChange, onClose }) {
  const open = index !== null && index >= 0 && photos.length > 0;
  const many = photos.length > 1;
  const step = (dir) => onIndexChange?.((index + dir + photos.length) % photos.length);

  // Load the next and previous photos early, so switching feels instant
  useEffect(() => {
    if (!open || !many) return;
    [1, -1].forEach((d) => { new Image().src = cldImg(photos[(index + d + photos.length) % photos.length], 2000); });
  }, [open, many, index, photos]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      onKeyDown={(e) => {
        if (!many) return;
        if (e.key === 'ArrowLeft') step(-1);
        if (e.key === 'ArrowRight') step(1);
      }}
      onClick={(e) => e.stopPropagation()}
      PaperProps={{ sx: { bgcolor: 'rgba(10,10,10,0.94)', boxShadow: 'none' } }}
    >
      {/* clicking the dark area closes; the photo itself does not */}
      <Box
        onClick={onClose}
        sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 1, sm: 10 }, py: { xs: 7, sm: 6 }, boxSizing: 'border-box' }}
      >
        {open && (
          <Box
            component="img"
            key={photos[index]}
            src={cldImg(photos[index], 2000)}
            alt=""
            onClick={(e) => e.stopPropagation()}
            sx={{
              display: 'block', maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
              borderRadius: '4px', boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
              animation: 'lightboxIn 0.2s ease-out',
              '@keyframes lightboxIn': { from: { opacity: 0, transform: 'scale(0.98)' }, to: { opacity: 1, transform: 'none' } },
            }}
          />
        )}

        <IconButton onClick={onClose} aria-label="Close" sx={{ ...controlSx, position: 'absolute', top: 14, right: 14 }}>
          <CloseIcon />
        </IconButton>

        {many && (
          <>
            <IconButton
              onClick={(e) => { e.stopPropagation(); step(-1); }}
              aria-label="Previous photo"
              sx={{ ...controlSx, position: 'absolute', left: { xs: 6, sm: 18 }, top: '50%', transform: 'translateY(-50%)', width: 52, height: 52 }}
            >
              <ChevronLeft fontSize="large" />
            </IconButton>
            <IconButton
              onClick={(e) => { e.stopPropagation(); step(1); }}
              aria-label="Next photo"
              sx={{ ...controlSx, position: 'absolute', right: { xs: 6, sm: 18 }, top: '50%', transform: 'translateY(-50%)', width: 52, height: 52 }}
            >
              <ChevronRight fontSize="large" />
            </IconButton>
            <Typography sx={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', letterSpacing: 1 }}>
              {index + 1} / {photos.length}
            </Typography>
          </>
        )}
      </Box>
    </Dialog>
  );
}
