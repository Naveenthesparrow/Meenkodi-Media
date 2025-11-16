import React, { useState, useEffect, useRef } from 'react';
import { Box, Skeleton } from '@mui/material';

/**
 * OptimizedImage Component
 * - Uses Intersection Observer for better lazy loading
 * - Shows skeleton loader while image loads
 * - Smooth fade-in transition
 * - Better performance than native lazy loading
 */
const OptimizedImage = ({ 
  src, 
  alt, 
  sx = {}, 
  skeletonSx = {},
  threshold = 0.01,
  rootMargin = '100px',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <Box 
      ref={imgRef} 
      sx={{ 
        position: 'relative',
        width: '100%',
        height: '100%',
        ...sx 
      }}
      {...props}
    >
      {/* Skeleton Placeholder */}
      {!isLoaded && (
        <Skeleton
          variant="rectangular"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0,0,0,0.08)',
            ...skeletonSx
          }}
        />
      )}
      
      {/* Actual Image - only load when in view */}
      {isInView && (
        <Box
          component="img"
          src={src}
          alt={alt}
          onLoad={handleLoad}
          sx={{
            ...sx,
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.4s ease-in-out',
            display: 'block'
          }}
        />
      )}
    </Box>
  );
};

export default OptimizedImage;
