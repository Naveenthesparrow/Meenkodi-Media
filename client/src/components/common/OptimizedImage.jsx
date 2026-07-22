import React, { useState, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';

/**
 * OptimizedImage Component
 * - Loads images immediately (eager) for fast loading
 * - Renders the image on top of a skeleton loader (progressive rendering)
 * - Once fully loaded, hides the skeleton
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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
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
        src={src}
        alt={alt}
        loading="eager" // Load immediately for maximum speed
        decoding="async"
        onLoad={handleLoad}
        onError={onError}
        className={className}
        sx={{
          ...sx,
          position: 'relative',
          zIndex: 2,
          display: 'block',
          // Keep background transparent while loading so the skeleton shows through
          backgroundColor: isLoaded ? (sx.backgroundColor || 'transparent') : 'transparent',
        }}
      />
    </Box>
  );
};

export default OptimizedImage;
