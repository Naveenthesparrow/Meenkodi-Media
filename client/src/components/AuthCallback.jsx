import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // This component handles the OAuth callback
    // The actual authentication is handled by the server
    // We just need to redirect to home and refresh auth status
    const timer = setTimeout(() => {
      navigate("/");
      // Force a page reload to refresh auth state
      window.location.reload();
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="h6">Completing authentication...</Typography>
    </Box>
  );
}
