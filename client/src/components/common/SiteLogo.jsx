import React from 'react';
import { Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import logoImage from '../../assests/meenkodi.png';

export default function SiteLogo({ height = 48, width = 'auto' }) {
  return (
    <Box
      component={RouterLink}
      to="/"
      sx={{
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <img
        src={logoImage}
        alt="Meenkodi Logo"
        style={{
          height: `${height}px`,
          width: width,
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </Box>
  );
}
