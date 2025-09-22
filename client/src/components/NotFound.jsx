import React from "react";
import { useTranslation } from 'react-i18next';
import { Box, Typography } from "@mui/material";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        textAlign: "center",
        mt: 8,
        bgcolor: "#fff",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <Typography
        variant="h2"
        sx={{
          color: "#111",
          fontWeight: 800,
        }}
      >
        404
      </Typography>
      <Typography variant="h5" sx={{ color: "#111", mb: 2 }}>
        {t('errors.notFound')}
      </Typography>
    </Box>
  );
}
