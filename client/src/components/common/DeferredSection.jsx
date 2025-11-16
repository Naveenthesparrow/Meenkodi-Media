import React, { useState, useEffect, useRef } from 'react';
import { Box, Skeleton } from '@mui/material';

/**
 * DeferredSection - Delays rendering of heavy sections until they're near viewport
 * Reduces initial render time and improves page load performance
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to defer
 * @param {string} props.fallback - Optional fallback type ('skeleton' or 'none')
 * @param {number} props.rootMargin - Distance from viewport to trigger (default: 400px)
 * @param {Object} props.skeletonProps - Props for skeleton loader
 */
const DeferredSection = ({ 
  children, 
  fallback = 'skeleton', 
  rootMargin = '400px',
  skeletonProps = {}
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldRender) {
            setShouldRender(true);
            // Disconnect after first intersection to save resources
            observer.disconnect();
          }
        });
      },
      {
        rootMargin, // Start loading before section enters viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [rootMargin, shouldRender]);

  if (!shouldRender) {
    if (fallback === 'skeleton') {
      return (
        <Box ref={containerRef} sx={{ py: 10 }}>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={500}
            sx={{
              bgcolor: 'rgba(0, 0, 0, 0.05)',
              borderRadius: 2,
              ...skeletonProps
            }}
          />
        </Box>
      );
    }
    // Invisible placeholder to maintain scroll position
    return <div ref={containerRef} style={{ minHeight: '100px' }} />;
  }

  return <div ref={containerRef}>{children}</div>;
};

export default DeferredSection;
