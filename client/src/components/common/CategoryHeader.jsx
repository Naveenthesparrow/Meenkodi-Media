import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import Add from '@mui/icons-material/Add';

/**
 * Shared page header for the Explore category pages (Temples, Foods, Dance…).
 * Title + gold underline + subtitle stacked on the left; the admin "Add" button
 * sits on the right in normal flow, so it can never cover the subtitle.
 */
export default function CategoryHeader({ title, subtitle, addLabel, onAdd }) {
  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'flex-end' },
        justifyContent: 'space-between',
        gap: { xs: 2.5, sm: 3 },
        mb: { xs: 4, md: 6 },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 700,
            color: '#8B0000',
            fontFamily: 'Georgia, serif',
            fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.5rem' },
            letterSpacing: { xs: 1, md: 2 },
            lineHeight: 1.1,
            textTransform: 'uppercase',
            overflowWrap: 'anywhere',
          }}
        >
          {title}
        </Typography>
        <Box
          aria-hidden
          sx={{
            width: 120,
            height: 4,
            mt: 1.5,
            mb: subtitle ? 1.5 : 0,
            background: 'linear-gradient(90deg, #DAA520, rgba(218,165,32,0))',
          }}
        />
        {subtitle && (
          <Typography
            sx={{
              color: '#666',
              fontStyle: 'italic',
              fontFamily: 'Georgia, serif',
              fontSize: { xs: '0.95rem', md: '1.1rem' },
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {onAdd && (
        <Button
          onClick={onAdd}
          variant="contained"
          disableElevation
          startIcon={<Add />}
          sx={{
            flexShrink: 0,
            bgcolor: '#8B0000',
            color: '#fff',
            borderRadius: 0,
            px: 3,
            height: 44,
            fontWeight: 700,
            letterSpacing: 0.5,
            fontFamily: 'Georgia, serif',
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: '#6B0000', boxShadow: '0 8px 20px rgba(139,0,0,0.25)' },
          }}
        >
          {addLabel}
        </Button>
      )}
    </Box>
  );
}
