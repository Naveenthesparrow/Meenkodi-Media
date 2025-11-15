import React from 'react';
import { Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import logoImage from '../../assests/meenkodi.png';

export default function SiteLogo({ height = { xs: 36, md: 44 }, width = 'auto' }) {
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
      <Box
        component="img"
        src={logoImage}
        alt="Meenkodi Logo"
        sx={{
          height,
          width,
          objectFit: 'contain',
          display: 'block',
          filter: 'drop-shadow(0 1.5px 3px rgba(0,0,0,0.22))'
        }}
      />
    </Box>
  );
}
