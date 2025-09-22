import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import "@fontsource/poppins";
import "@fontsource/noto-serif-tamil";
import "@fontsource/noto-sans-tamil";
// Initialize i18n
import "./utils/i18n";

const theme = createTheme({
  palette: {
    primary: {
      main: "#111",
      contrastText: "#fff",
    },
    secondary: {
      main: "#fff",
      contrastText: "#111",
    },
    background: {
      default: "#fff",
    },
  },
  typography: {
    fontFamily: "Inter, 'Noto Sans Tamil', 'Noto Serif Tamil', Arial, sans-serif",
    h1: { fontFamily: "Poppins, 'Noto Sans Tamil', 'Noto Serif Tamil', Arial, sans-serif" },
    h2: { fontFamily: "Poppins, 'Noto Sans Tamil', 'Noto Serif Tamil', Arial, sans-serif" },
    h3: { fontFamily: "Poppins, 'Noto Sans Tamil', 'Noto Serif Tamil', Arial, sans-serif" },
    h4: { fontFamily: "Poppins, 'Noto Sans Tamil', 'Noto Serif Tamil', Arial, sans-serif" },
    h5: { fontFamily: "Poppins, 'Noto Sans Tamil', 'Noto Serif Tamil', Arial, sans-serif" },
    h6: { fontFamily: "Poppins, 'Noto Sans Tamil', 'Noto Serif Tamil', Arial, sans-serif" },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
);
