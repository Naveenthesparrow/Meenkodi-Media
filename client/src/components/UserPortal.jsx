import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Article as ArticleIcon } from "@mui/icons-material";

export default function UserPortal({ user, logout }) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  return (
    <Box sx={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 6,
      backgroundImage: {
        xs: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.02' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`,
        md: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.03' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`
      },
      backgroundSize: { xs: '8px 8px', md: '6px 6px' },
      backgroundRepeat: 'repeat',
      backgroundPosition: 'center top',
      '@media (min-resolution: 1.5dppx)': {
        backgroundImage: {
          xs: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.12' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`,
          md: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.14' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`
        },
        backgroundSize: { xs: '18px 18px', md: '14px 14px' }
      }
    }}>
      <Box
        sx={{
          maxWidth: { xs: '90%', sm: 500 },
          mx: "auto",
          p: { xs: 2, md: 3 },
          bgcolor: "#fff",
          borderRadius: 3,
          boxShadow: 2,
          textAlign: "center",
          fontFamily: "Inter, Arial, sans-serif",
        }}>
        <Typography
          variant="h4"
          sx={{
            color: "#111",
            fontWeight: 800,
            mb: 2,
          }}>
          User Portal
        </Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Welcome, {user.displayName}
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: '#666' }}>
          {user.email}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <Button 
            variant="contained" 
            startIcon={<ArticleIcon />}
            onClick={() => navigate('/my-articles')}
            sx={{
              bgcolor: '#8B0000',
              '&:hover': { bgcolor: '#6B0000' }
            }}
          >
            {i18n.language === 'ta' ? 'என் கட்டுரைகள்' : 'My Articles'}
          </Button>
        </Box>

        <Button variant="outlined" color="error" onClick={logout}>
          {i18n.language === 'ta' ? 'வெளியேறு' : 'Logout'}
        </Button>
      </Box>
    </Box>
  );
}
