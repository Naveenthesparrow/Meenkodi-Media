import React, { useState, useEffect } from 'react';
import './i18n/i18n.js';
import { useTranslation } from 'react-i18next';
// Route-split heavier pages and details
const TempleDetail = React.lazy(() => import("./components/details/TempleDetail"));
const KingDetail = React.lazy(() => import("./components/details/KingDetail"));
const LiteratureDetail = React.lazy(() => import("./components/details/LiteratureDetail"));
const DanceDetail = React.lazy(() => import("./components/details/DanceDetail"));
const FoodDetail = React.lazy(() => import("./components/details/FoodDetail"));
const FestivalDetail = React.lazy(() => import("./components/details/FestivalDetail"));
const EventDetail = React.lazy(() => import("./components/EventDetail"));
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link as RouterLink,
} from "react-router-dom";
const AdminPortal = React.lazy(() => import("./components/AdminPortal"));
const UserPortal = React.lazy(() => import("./components/UserPortal"));
import Home from "./components/Home";
const Articles = React.lazy(() => import("./components/Articles"));
const Gallery = React.lazy(() => import("./components/Gallery"));
const Events = React.lazy(() => import("./components/Events"));
const Resources = React.lazy(() => import("./components/Resources"));
const NotFound = React.lazy(() => import("./components/NotFound"));
const Explore = React.lazy(() => import("./components/Explore"));
const Lands = React.lazy(() => import("./components/Lands"));
const Kings = React.lazy(() => import("./components/categories/Kings"));
const Literature = React.lazy(() => import("./components/categories/Literature"));
const Dance = React.lazy(() => import("./components/categories/Dance"));
const Temples = React.lazy(() => import("./components/categories/Temples"));
const Clothing = React.lazy(() => import("./components/categories/Clothing"));
const Festivals = React.lazy(() => import("./components/categories/Festivals"));
const Foods = React.lazy(() => import("./components/categories/Foods"));
const AncientScience = React.lazy(() => import("./components/categories/AncientScience"));
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
import LanguageSwitcher from './components/common/LanguageSwitcher';
const GalleryDetail = React.lazy(() => import("./components/GalleryDetail"));
const ArticleDetail = React.lazy(() => import("./components/ArticleDetail"));
const ResourceDetail = React.lazy(() => import("./components/ResourceDetail"));
const AncientScienceDetail = React.lazy(() => import("./components/details/AncientScienceDetail"));
const ClothingDetail = React.lazy(() => import("./components/details/ClothingDetail"));
import Particles from "./components/Particles";
import DockText from "./components/common/DockText";
import LanguageDockToggle from "./components/common/LanguageDockToggle";
import SiteLogo from "./components/common/SiteLogo";

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
    { key: 'nav.explore', path: '/explore' },
    { key: 'nav.events', path: '/events' },
    { key: 'nav.gallery', path: '/gallery' },
    { key: 'nav.articles', path: '/articles' },
    { key: 'nav.resources', path: '/resources' },
  ];

  const userNavItems = user 
    ? [
        { key: 'nav.profile', path: '/profile' },
        { key: 'nav.logout', action: logout }
      ]
    : [
        { key: 'nav.login', action: login }
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
        <Typography>{t('loading')}</Typography>
      </Box>
    );
  }

  return (
    <Router>
      <AppBar
        position="static"
        elevation={0}
        sx={{ 
          bgcolor: "#000",
          color: "#fff",
          boxShadow: 1,
          position: 'relative'
        }}
      >
        {/* Particles background inside navbar for seamless look */}
        <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
          <Particles
            particleColors={["#ffffff", "#e6e6e6", "#d9d9d9"]}
            particleCount={110}
            particleSpread={8}
            speed={0.06}
            particleBaseSize={85}
            moveParticlesOnHover={false}
            alphaParticles={true}
            disableRotation={true}
            showWatermark={false}
            style={{ opacity: 0.9 }}
          />
        </Box>
        <Toolbar 
          sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 2 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, zIndex: 1 }}>
            <SiteLogo height={48} />
            <Link
              component={RouterLink}
              to="/"
              color="#fff"
              underline="none"
              sx={{
                fontWeight: 900,
                fontFamily: "Poppins, Arial, sans-serif",
                letterSpacing: 1,
                textTransform: "uppercase",
                fontSize: { xs: 18, sm: 24 },
              }}
            >
              {t('app.title')}
            </Link>
          </Box>

          {/* Desktop Navigation */}
          <Box 
            sx={{ 
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: 3,
              zIndex: 1
            }}
          >
            {navItems.map((ni) => (
              <DockText
                key={ni.key}
                text={t(ni.key)}
                to={ni.path}
                baseSize={16}
                magnification={70}
                letterGap={2}
                color="#fff"
              />
            ))}
            {user && (
              <DockText
                text={t('nav.profile')}
                to="/profile"
                baseSize={16}
                letterGap={2}
                color="#fff"
              />
            )}
            {user ? (
              <DockText
                text={t('nav.logout')}
                onClick={logout}
                baseSize={16}
                letterGap={2}
                color="#fff"
              />
            ) : (
              <DockText
                text={t('nav.login')}
                onClick={login}
                baseSize={16}
                letterGap={2}
                color="#fff"
              />
            )}
            <Box sx={{ ml: 2, display: { xs: 'none', sm: 'block' } }}>
              <LanguageDockToggle />
            </Box>
          </Box>

          {/* Mobile Navigation Hamburger */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              display: { sm: 'none' }, 
              color: '#fff' 
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
                bgcolor: '#000',
                color: '#fff'
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SiteLogo height={40} />
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                  {t('app.title')}
                </Typography>
              </Box>
              <IconButton onClick={handleDrawerToggle}>
                <CloseIcon sx={{ color: '#fff' }} />
              </IconButton>
            </Box>
            <List>
              {navItems.map((item) => (
                <ListItem 
                  key={item.key}
                  component={RouterLink}
                  to={item.path}
                  onClick={handleDrawerToggle}
                  sx={{ 
                    color: '#fff',
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.08)'
                    }
                  }}
                >
                  <ListItemText 
                    primary={t(item.key)} 
                    primaryTypographyProps={{
                      fontFamily: "Poppins, Arial, sans-serif",
                      fontWeight: 600,
                      color: '#fff'
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
                    color: '#fff',
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.08)'
                    }
                  }}
                >
                  <ListItemText 
                    primary={t('nav.profile')} 
                    primaryTypographyProps={{
                      fontFamily: "Poppins, Arial, sans-serif",
                      fontWeight: 600,
                      color: '#fff'
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
                    color: '#fff',
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.08)'
                    }
                  }}
                >
                  <ListItemText 
                    primary={t('nav.logout')} 
                    primaryTypographyProps={{
                      fontFamily: "Poppins, Arial, sans-serif",
                      fontWeight: 600,
                      color: '#fff'
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
                    color: '#fff',
                    '&:hover': { 
                      bgcolor: 'rgba(255,255,255,0.08)'
                    }
                  }}
                >
                  <ListItemText 
                    primary={t('nav.login')} 
                    primaryTypographyProps={{
                      fontFamily: "Poppins, Arial, sans-serif",
                      fontWeight: 600,
                      color: '#fff'
                    }}
                  />
                </ListItem>
              )}
              <Box sx={{ px: 2, py: 1 }}>
                <LanguageSwitcher size="small" />
              </Box>
            </List>
          </Drawer>
        </Toolbar>
      </AppBar>
      <Box sx={{ mt: 0 }}>
  <React.Suspense fallback={<Box sx={{ p:4, textAlign:'center' }}><Typography variant="body1">Loading…</Typography></Box>}>
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
                    Please log in to view your profile
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
                    Login with Google
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
  </React.Suspense>
      </Box>
    </Router>
  );
}

export default App;
