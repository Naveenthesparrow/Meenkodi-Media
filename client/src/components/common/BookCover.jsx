import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import cldImg from '../../utils/cloudinaryImage';

/**
 * Book cover in a fixed book shape (2:3). Without an image (or if it fails to
 * load) it shows a designed title cover in the site's maroon/gold, so every
 * book on the shelf looks finished.
 */
export default function BookCover({ image, title, author, width = 600, sx = {}, imgProps = {}, className }) {
  const [failed, setFailed] = useState(false);
  const showImage = image && !failed;

  return (
    <Box
      className={className}
      sx={{
        position: 'relative',
        aspectRatio: '2 / 3',
        width: '100%',
        overflow: 'hidden',
        borderRadius: '4px 10px 10px 4px',
        boxShadow: '0 10px 24px rgba(0,0,0,0.18), inset 4px 0 0 rgba(0,0,0,0.12)',
        bgcolor: '#f4f1ea',
        ...sx,
      }}
    >
      {showImage ? (
        <Box
          component="img"
          src={cldImg(image, width)}
          alt={title}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          {...imgProps}
        />
      ) : (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            p: 2,
            background: 'linear-gradient(160deg, #8B0000 0%, #5c0000 100%)',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 10,
              border: '1.5px solid rgba(218,165,32,0.7)',
              borderRadius: '2px 6px 6px 2px',
            },
          }}
        >
          <Typography
            sx={{
              color: '#f5e6c8',
              fontFamily: 'Georgia, serif',
              fontWeight: 700,
              fontSize: 'clamp(0.85rem, 2.2vw, 1.25rem)',
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 5,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </Typography>
          <Box sx={{ width: 36, height: 2, bgcolor: '#DAA520', my: 1.5 }} />
          {author && (
            <Typography sx={{ color: 'rgba(245,230,200,0.85)', fontSize: 'clamp(0.7rem, 1.6vw, 0.85rem)', fontStyle: 'italic' }}>
              {author}
            </Typography>
          )}
        </Box>
      )}
      {/* Spine highlight */}
      <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 6, background: 'linear-gradient(90deg, rgba(255,255,255,0.25), transparent)', pointerEvents: 'none' }} />
    </Box>
  );
}
