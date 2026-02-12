import React from 'react';
import { Box, Typography } from '@mui/material';

export default function PageHeading({ children, actions, leftActions, typographySx }) {
  return (
    <Box
      sx={{
        mb: { xs: 6, md: 5 },
        mt: { xs: 2, md: 2 },
        textAlign: 'center',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontWeight: 700,
          color: '#8B0000',
          position: 'relative',
          display: 'inline-block',
          letterSpacing: -1,
          fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.0rem' },
          padding: '0 10px',
          transition: 'all 0.3s ease',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '-50px',
            width: '40px',
            height: '3px',
            backgroundColor: '#DAA520',
            transform: 'translateY(-50%)',
            transition: 'all 0.3s ease'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            right: '-50px',
            width: '40px',
            height: '3px',
            backgroundColor: '#DAA520',
            transform: 'translateY(-50%)',
            transition: 'all 0.3s ease'
          },
          '&:hover': {
            transform: 'scale(1.05)',
            '&::before': {
              width: '60px',
              left: '-70px'
            },
            '&::after': {
              width: '60px',
              right: '-70px'
            }
          },
          ...typographySx,
        }}
      >
        {children}
      </Typography>

      {leftActions && (
        <Box
          sx={{
            position: { xs: 'static', md: 'absolute' },
            left: { md: 0 },
            top: { md: '50%' },
            transform: { xs: 'none', md: 'translateY(-50%)' }
          }}
        >
          {leftActions}
        </Box>
      )}

      {actions && (
        <Box
          sx={{
            position: { xs: 'static', md: 'absolute' },
            right: { md: 0 },
            top: { md: '50%' },
            transform: { xs: 'none', md: 'translateY(-50%)' }
          }}
        >
          {actions}
        </Box>
      )}
    </Box>
  );
}
