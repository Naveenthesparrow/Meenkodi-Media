import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import "@fontsource/poppins";
import "@fontsource/noto-serif-tamil";

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
    fontFamily: "Inter, Arial, sans-serif",
    h1: { fontFamily: "Poppins, Arial, sans-serif" },
    h2: { fontFamily: "Poppins, Arial, sans-serif" },
    h3: { fontFamily: "Poppins, Arial, sans-serif" },
    h4: { fontFamily: "Poppins, Arial, sans-serif" },
    h5: { fontFamily: "Poppins, Arial, sans-serif" },
    h6: { fontFamily: "Poppins, Arial, sans-serif" },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
);
