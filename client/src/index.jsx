import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './styles/globals.css';
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import i18n from "./i18n/i18n";
import ErrorBoundary from "./components/common/ErrorBoundary";

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
    // Global font stack: Latin-first, with high-quality Tamil fallbacks
    fontFamily:
      "Inter, 'Hind Madurai', 'Tiro Tamil', 'Noto Serif Tamil', 'Noto Sans Tamil', Arial, sans-serif",
    h1: {
      fontFamily:
        "Poppins, 'Tiro Tamil', 'Hind Madurai', 'Noto Serif Tamil', serif",
    },
    h2: {
      fontFamily:
        "Poppins, 'Tiro Tamil', 'Hind Madurai', 'Noto Serif Tamil', serif",
    },
    h3: {
      fontFamily:
        "Poppins, 'Tiro Tamil', 'Hind Madurai', 'Noto Serif Tamil', serif",
    },
    h4: {
      fontFamily:
        "Poppins, 'Tiro Tamil', 'Hind Madurai', 'Noto Serif Tamil', serif",
    },
    h5: {
      fontFamily:
        "Poppins, 'Tiro Tamil', 'Hind Madurai', 'Noto Serif Tamil', serif",
    },
    h6: {
      fontFamily:
        "Poppins, 'Tiro Tamil', 'Hind Madurai', 'Noto Serif Tamil', serif",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          textRendering: "optimizeLegibility",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          fontFeatureSettings: '"kern" 1, "liga" 1',
        },
        // When the active language is Tamil, ensure Tamil fonts are used across the UI
        ':lang(ta)': {
          fontFamily:
            "'Hind Madurai', 'Tiro Tamil', 'Noto Serif Tamil', 'Noto Sans Tamil', system-ui, sans-serif !important",
        },
        '::selection': {
          backgroundColor: '#ffe08a',
          color: '#111',
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
// Keep the <html lang> in sync with i18n so :lang(ta) rules apply
document.documentElement.setAttribute('lang', i18n.language || 'en');
i18n.on('languageChanged', (lng) => {
  document.documentElement.setAttribute('lang', lng || 'en');
});

root.render(
  <ErrorBoundary>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </ErrorBoundary>
);
