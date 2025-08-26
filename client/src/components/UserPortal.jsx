import React from "react";
import { Box, Typography, Button } from "@mui/material";

export default function UserPortal({ user, logout }) {
  return (
    <Box
      sx={{
        maxWidth: 500,
        mx: "auto",
        mt: 4,
        p: 3,
        bgcolor: "#fff",
        borderRadius: 3,
        boxShadow: 2,
        textAlign: "center",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: "#111",
          fontWeight: 800,
          mb: 2,
        }}
      >
        User Portal
      </Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Welcome, {user.displayName}
      </Typography>
      <Button variant="contained" color="primary" onClick={logout}>
        Logout
      </Button>
    </Box>
  );
}
