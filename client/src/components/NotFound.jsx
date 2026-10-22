import React from "react";
import { Box, Typography } from "@mui/material";
import { Helmet } from "react-helmet-async";

export default function NotFound() {
  return (
    <Box
      sx={{
        textAlign: "center",
        mt: 8,
        bgcolor: "#fff",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      {/* The static host answers 200 for unknown URLs, so tell search engines this is a 404 */}
      <Helmet>
        <title>Page Not Found | Meenkodi</title>
        <meta name="robots" content="noindex, follow" />
      </Helmet>
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
        Page Not Found
      </Typography>
    </Box>
  );
}
