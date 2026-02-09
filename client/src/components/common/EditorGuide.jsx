import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';

export default function EditorGuide() {
  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 2, 
        bgcolor: '#f0f7ff', 
        border: '1px solid #bdd7f5',
        borderRadius: 1,
        mb: 2
      }}
    >
      <Typography 
        variant="subtitle2" 
        sx={{ 
          fontWeight: 700, 
          color: '#1976d2',
          mb: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        📝 Editor Quick Guide
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="**bold**" size="small" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }} />
          <Typography variant="caption">→ <strong>bold</strong> text</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="*italic*" size="small" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }} />
          <Typography variant="caption">→ <em>italic</em> text</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="# Heading" size="small" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }} />
          <Typography variant="caption">→ Main heading</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="## Subheading" size="small" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }} />
          <Typography variant="caption">→ Subheading</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="- List item" size="small" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }} />
          <Typography variant="caption">→ Bullet point</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="🖼️ Image button" size="small" sx={{ fontSize: '0.7rem' }} />
          <Typography variant="caption">→ Add images with URL</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="🔗 Link button" size="small" sx={{ fontSize: '0.7rem' }} />
          <Typography variant="caption">→ Add clickable links</Typography>
        </Box>
      </Box>
    </Paper>
  );
}
