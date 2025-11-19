import React, { useEffect } from "react";
import API_BASE_URL from "../utils/api";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Alert } from "@mui/material";

export default function AuthFailure() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect to home after 5 seconds
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleRetry = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        gap: 3,
        p: 4,
      }}
    >
      <Alert severity="error" sx={{ mb: 2 }}>
        Authentication Failed
      </Alert>

      <Typography variant="h4" align="center">
        Oops! Something went wrong with authentication.
      </Typography>

      <Typography variant="body1" align="center" color="text.secondary">
        There was an issue logging you in with Google. This might be due to:
      </Typography>

      <Box component="ul" sx={{ textAlign: "left", color: "text.secondary" }}>
        <li>Permission was denied in Google OAuth</li>
        <li>Network connectivity issues</li>
        <li>Server configuration problems</li>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleRetry}
          sx={{
            bgcolor: "#000",
            color: "#fff",
            "&:hover": { bgcolor: "#333" },
          }}
        >
          Try Again
        </Button>
        <Button variant="outlined" onClick={() => navigate("/")}>
          Go Home
        </Button>
      </Box>

      <Typography variant="caption" color="text.secondary">
        Redirecting to home page in 5 seconds...
      </Typography>
    </Box>
  );
}
