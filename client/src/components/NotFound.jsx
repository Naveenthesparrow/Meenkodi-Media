import React from "react";
import { Box, Typography } from "@mui/material";

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
