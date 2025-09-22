import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TempleDetail from "./components/details/TempleDetail";
import KingDetail from "./components/details/KingDetail";
import LiteratureDetail from "./components/details/LiteratureDetail";
import DanceDetail from "./components/details/DanceDetail";
import FoodDetail from "./components/details/FoodDetail";
import FestivalDetail from "./components/details/FestivalDetail";
import EventDetail from "./components/EventDetail";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link as RouterLink,
} from "react-router-dom";
import AdminPortal from "./components/AdminPortal";
import UserPortal from "./components/UserPortal";
import Home from "./components/Home";
import Articles from "./components/Articles";
import Gallery from "./components/Gallery";
import Events from "./components/Events";
import Resources from "./components/Resources";
import NotFound from "./components/NotFound";
import Explore from "./components/Explore";
import Lands from "./components/Lands";
import Kings from "./components/categories/Kings";
import Literature from "./components/categories/Literature";
import Dance from "./components/categories/Dance";
import Temples from "./components/categories/Temples";
import Clothing from "./components/categories/Clothing";
import Festivals from "./components/categories/Festivals";
import Foods from "./components/categories/Foods";
import AncientScience from "./components/categories/AncientScience";
import AuthCallback from "./components/AuthCallback";
import AuthFailure from "./components/AuthFailure";
import { 
  AppBar, 
  Toolbar, 
  Button, 
  Box, 
  Link, 
  Typography, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText 
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import GalleryDetail from "./components/GalleryDetail";
import ArticleDetail from "./components/ArticleDetail";
import ResourceDetail from "./components/ResourceDetail";
import AncientScienceDetail from "./components/details/AncientScienceDetail";
import ClothingDetail from "./components/details/ClothingDetail";
import LanguageSwitcher from './components/common/LanguageSwitcher';

// Debug function for tracking 404 errors
function setupResourceErrorLogging() {
  window.addEventListener('error', (event) => {
    if (event.target && (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK' || event.target.tagName === 'IMG')) {
      console.error('Failed to load resource:', {
        src: event.target.src || event.target.href,
        tagName: event.target.tagName,
        message: event.message
      });
    }
  });
}

function App() {
  const { t } = useTranslation();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const fetchUser = React.useCallback(() => {
    console.log("Fetching user authentication status...");
    fetch(`${import.meta.env.VITE_APP_API_URL || "http://localhost:5000"}/auth/user`, {
      credentials: "include",
    })
      .then((res) => {
        console.log("Auth response status:", res.status);
        console.log("Auth response headers:", res.headers.get("content-type"));

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.warn("Response is not JSON, likely HTML error page");
          return null;
        }

        return res.json();
      })
      .then((data) => {
        console.log("User data received:", data);
        setUser(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Auth check failed:", error);
        setUser(null);
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    // Log current URL for debugging
    console.log("Current URL:", window.location.href);
    console.log("Pathname:", window.location.pathname);
    console.log("Search params:", window.location.search);

    fetchUser();

    // Listen for focus events to re-check auth status when user returns to tab
    const handleFocus = () => {
      console.log("Window focused, re-checking auth status");
      fetchUser();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchUser]);

  // Call resource error logging on component mount
  useEffect(() => {
    setupResourceErrorLogging();
  }, []);

  const login = () => {
    console.log("Redirecting to Google OAuth...");
    window.location.href = `${
      import.meta.env.VITE_APP_API_URL || "http://localhost:5000"
    }/auth/google`;
  };

  const logout = () => {
    console.log("Logging out...");
    window.location.href = `${
      import.meta.env.VITE_APP_API_URL || "http://localhost:5000"
    }/auth/logout`;
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { text: t('nav.explore'), path: "/explore" },
    { text: t('nav.events'), path: "/events" },
    { text: t('nav.gallery'), path: "/gallery" },
    { text: t('nav.articles'), path: "/articles" },
    { text: t('nav.resources'), path: "/resources" },
  ];

  const userNavItems = user 
    ? [
        { text: t('app.profile'), path: "/profile" },
        { text: t('app.logout'), action: logout }
      ]
    : [
        { text: t('app.loginWithGoogle'), action: login }
      ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography>{t('app.loading')}</Typography>
      </Box>
    );
  }

  return (
    <Router>
      <AppBar
        position="static"
        elevation={0}
        sx={{ 
          bgcolor: "#fff", 
          color: "#111", 
          boxShadow: 1 
        }}
      >
        <Toolbar 
          sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 2 }
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              color: "#111",
              fontFamily: "Poppins, Arial, sans-serif",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            <Link
              component={RouterLink}
              to="/"
              color="#111"
              underline="none"
              sx={{
                fontWeight: 900,
                fontFamily: "Poppins, Arial, sans-serif",
                letterSpacing: 1,
                textTransform: "uppercase",
                fontSize: { xs: 20, sm: 24 },
              }}
            >
              {t('app.title')}
            </Link>
          </Typography>

          {/* Desktop Navigation */}
          <Box 
            sx={{ 
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: 2 
            }}
          >
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="text"
                component={RouterLink}
                to={item.path}
                sx={{
                  color: "#111",
                  fontFamily: "Poppins, Arial, sans-serif",
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
              >
                {item.text}
              </Button>
            ))}
            <LanguageSwitcher />
            {user && (
              <Button
                variant="text"
                component={RouterLink}
                to="/profile"
                sx={{
                  color: "#111",
                  fontFamily: "Poppins, Arial, sans-serif",
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
              >
                {t('app.profile')}
              </Button>
            )}
            {user ? (
              <Button
                variant="outlined"
                onClick={logout}
                sx={{
                  color: "#111",
                  borderColor: "#111",
                  fontFamily: "Poppins, Arial, sans-serif",
                }}
              >
                {t('app.logout')}
              </Button>
            ) : (
              <Button
                variant="outlined"
                onClick={login}
                sx={{
                  color: "#111",
                  borderColor: "#111",
                  fontFamily: "Poppins, Arial, sans-serif",
                }}
              >
                {t('app.login')}
              </Button>
            )}
          </Box>

          {/* Mobile Navigation Hamburger */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              display: { sm: 'none' }, 
              color: '#111' 
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Mobile Drawer */}
          <Drawer
            variant="temporary"
            anchor="right"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { 
                boxSizing: 'border-box', 
                width: 240,
                bgcolor: '#fff',
                color: '#111'
              },
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                p: 2 
              }}
            >
              <Typography variant="h6">{t('app.menu')}</Typography>
              <LanguageSwitcher size="small" />
              <IconButton onClick={handleDrawerToggle}>
                <CloseIcon />
              </IconButton>
            </Box>
            <List>
              {navItems.map((item) => (
                <ListItem 
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  onClick={handleDrawerToggle}
                  sx={{ 
                    color: '#111',
                    '&:hover': { 
                      bgcolor: '#f0f0f0' 
                    }
                  }}
                >
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      fontFamily: "Poppins, Arial, sans-serif",
                      fontWeight: 600,
                    }}
                  />
                </ListItem>
              ))}
              {user && (
                <ListItem 
                  component={RouterLink}
                  to="/profile"
                  onClick={handleDrawerToggle}
                  sx={{ 
                    color: '#111',
                    '&:hover': { 
                      bgcolor: '#f0f0f0' 
                    }
                  }}
                >
                  <ListItemText 
                    primary={t('app.profile')} 
                    primaryTypographyProps={{
                      fontFamily: "Poppins, Arial, sans-serif",
                      fontWeight: 600,
                    }}
                  />
                </ListItem>
              )}
              {user ? (
                <ListItem 
                  onClick={() => {
                    logout();
                    handleDrawerToggle();
                  }}
                  sx={{ 
                    color: '#111',
                    '&:hover': { 
                      bgcolor: '#f0f0f0' 
                    }
                  }}
                >
                  <ListItemText 
                    primary={t('app.logout')} 
                    primaryTypographyProps={{
                      fontFamily: "Poppins, Arial, sans-serif",
                      fontWeight: 600,
                    }}
                  />
                </ListItem>
              ) : (
                <ListItem 
                  onClick={() => {
                    login();
                    handleDrawerToggle();
                  }}
                  sx={{ 
                    color: '#111',
                    '&:hover': { 
                      bgcolor: '#f0f0f0' 
                    }
                  }}
                >
                  <ListItemText 
                    primary={t('app.login')} 
                    primaryTypographyProps={{
                      fontFamily: "Poppins, Arial, sans-serif",
                      fontWeight: 600,
                    }}
                  />
                </ListItem>
              )}
            </List>
          </Drawer>
        </Toolbar>
      </AppBar>
      <Box sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/google/callback" element={<AuthCallback />} />
          <Route path="/auth/failure" element={<AuthFailure />} />
          <Route path="/articles" element={<Articles user={user} />} />
          <Route path="/gallery" element={<Gallery user={user} />} />
          <Route path="/events" element={<Events user={user} />} />
          <Route path="/resources" element={<Resources user={user} />} />
          <Route path="/explore" element={<Explore user={user} />} />
          <Route path="/explore/lands" element={<Lands user={user} />} />
          <Route path="/explore/kings" element={<Kings user={user} />} />
          <Route
            path="/explore/literature"
            element={<Literature user={user} />}
          />
          <Route path="/explore/dance" element={<Dance user={user} />} />
          <Route path="/explore/temples" element={<Temples user={user} />} />
          <Route path="/explore/clothing" element={<Clothing user={user} />} />
          <Route
            path="/explore/festivals"
            element={<Festivals user={user} />}
          />
          <Route path="/explore/foods" element={<Foods user={user} />} />
          <Route
            path="/explore/ancientscience"
            element={<AncientScience user={user} />}
          />
          <Route path="/explore/temples/:id" element={<TempleDetail />} />
          <Route path="/explore/kings/:id" element={<KingDetail />} />
          <Route
            path="/explore/literature/:id"
            element={<LiteratureDetail />}
          />
          <Route path="/explore/dance/:id" element={<DanceDetail />} />
          <Route path="/explore/foods/:id" element={<FoodDetail />} />
          <Route path="/explore/festivals/:id" element={<FestivalDetail />} />
          <Route path="/events/:id" element={<EventDetail user={user} />} />
          <Route path="/gallery/:id" element={<GalleryDetail user={user} />} />
          <Route path="/articles/:id" element={<ArticleDetail user={user} />} />
          <Route
            path="/resources/:id"
            element={<ResourceDetail user={user} />}
          />
          <Route
            path="/profile"
            element={
              user ? (
                user.role === "admin" ? (
                  <AdminPortal user={user} logout={logout} />
                ) : (
                  <UserPortal user={user} logout={logout} />
                )
              ) : (
                <Box sx={{ textAlign: "center", mt: 4 }}>
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    {t('app.pleaseLogin')}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={login}
                    sx={{
                      bgcolor: "#000",
                      color: "#fff",
                      "&:hover": { bgcolor: "#333" },
                    }}
                  >
                    {t('app.loginWithGoogle')}
                  </Button>
                </Box>
              )
            }
          />
          <Route
            path="/explore/ancientscience/:id"
            element={<AncientScienceDetail />}
          />
          <Route path="/explore/clothing/:id" element={<ClothingDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
