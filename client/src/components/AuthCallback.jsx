import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying authentication...");

  useEffect(() => {
    // Verify authentication and then redirect
    const verifyAuth = async () => {
      try {
        setStatus("Checking authentication...");
        
        // Wait a moment for session to be established
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await fetch(`${API_BASE_URL}/auth/user`, {
          credentials: "include",
          headers: {
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          console.log("Authentication verified:", userData);
          setStatus("Success! Redirecting...");
          
          // Trigger event FIRST to update user state
          window.dispatchEvent(new CustomEvent('auth-success', { detail: userData }));
          
          // Wait for state to update
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Redirect based on user role
          if (userData.role === 'admin' || userData.role === 'user') {
            navigate("/profile", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        } else {
          console.error("Auth verification failed:", response.status);
          setStatus("Authentication failed. Redirecting...");
          // Don't redirect immediately on failure - stay on this page
          await new Promise(resolve => setTimeout(resolve, 2000));
          navigate("/", { replace: true });
        }
      } catch (error) {
        console.error("Auth verification error:", error);
        setStatus("Error verifying authentication. Redirecting...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        navigate("/", { replace: true });
      }
    };

    verifyAuth();
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
      <Typography variant="h6">{status}</Typography>
    </Box>
  );
}
