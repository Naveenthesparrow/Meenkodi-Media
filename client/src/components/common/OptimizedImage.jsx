import React, { useState, useEffect, useRef } from 'react';
import { Box, Skeleton } from '@mui/material';

/**
 * OptimizedImage Component
 * - Loads images immediately (eager) for fast loading
 * - Checks initial cache status to prevent skeleton flashing
 * - Smoothly transitions image in once loaded
 */
const OptimizedImage = ({ 
  src, 
  alt, 
  sx = {}, 
  skeletonSx = {},
  onError,
  className,
  ...props 
}) => {
  const imgRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(() => {
    if (typeof window !== 'undefined' && src) {
      const img = new Image();
      img.src = src;
      return img.complete && img.naturalWidth > 0;
    }
    return false;
  });

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    } else if (!isLoaded) {
      setIsLoaded(false);
    }
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <Box 
      sx={{ 
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
      {...props}
    >
      {/* Skeleton Placeholder behind the image */}
      {!isLoaded && (
        <Skeleton
          variant="rectangular"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0, 0, 0, 0.08)',
            zIndex: 1,
            ...skeletonSx
          }}
        />
      )}
      
      {/* Actual Image - loaded immediately */}
      <Box
        component="img"
        ref={imgRef}
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        onLoad={handleLoad}
        onError={onError}
        className={className}
        sx={{
          ...sx,
          position: 'relative',
          zIndex: 2,
          display: 'block',
          opacity: isLoaded ? 1 : 0.85,
          transition: 'opacity 0.25s ease, transform 0.35s ease, filter 0.35s ease',
          backgroundColor: isLoaded ? (sx.backgroundColor || 'transparent') : 'transparent',
        }}
      />
    </Box>
  );
};

export default OptimizedImage;
