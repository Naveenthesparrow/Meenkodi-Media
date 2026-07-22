import React, { useState, useEffect } from 'react';
import './i18n/i18n.js';
import { useTranslation } from 'react-i18next';
import { HelmetProvider } from 'react-helmet-async';
// Route-split heavier pages and details
const TempleDetail = React.lazy(() => import("./components/details/TempleDetail"));
const DynastyDetail = React.lazy(() => import("./components/details/DynastyDetail"));
const LiteratureDetail = React.lazy(() => import("./components/details/LiteratureDetail"));
const DanceDetail = React.lazy(() => import("./components/details/DanceDetail"));
const FoodDetail = React.lazy(() => import("./components/details/FoodDetail"));
const FestivalDetail = React.lazy(() => import("./components/details/FestivalDetail"));
const PoetDetail = React.lazy(() => import("./components/details/PoetDetail"));
const LandDetailExpanded = React.lazy(() => import("./components/details/LandDetailExpanded"));
const EventDetail = React.lazy(() => import("./components/EventDetail"));
import SeedsFootprints from "./components/SeedsFootprints";
const SeedsFootprintsDetail = React.lazy(() => import("./components/SeedsFootprintsDetail.jsx"));
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link as RouterLink,
  useLocation
} from "react-router-dom";
const AdminPortal = React.lazy(() => import("./components/AdminPortal"));
const UserPortal = React.lazy(() => import("./components/UserPortal"));
const MyArticles = React.lazy(() => import("./components/MyArticles"));
import Home from "./components/Home";
import Articles from "./components/Articles";
import Gallery from "./components/Gallery";
import Events from "./components/Events";
import Resources from "./components/Resources";
const NotFound = React.lazy(() => import("./components/NotFound"));
import Explore from "./components/Explore";
const Literature = React.lazy(() => import("./components/categories/Literature"));
const Dance = React.lazy(() => import("./components/categories/Dance"));
const Temples = React.lazy(() => import("./components/categories/Temples"));
const Clothing = React.lazy(() => import("./components/categories/Clothing"));
const Festivals = React.lazy(() => import("./components/categories/Festivals"));
const Foods = React.lazy(() => import("./components/categories/Foods"));
const AncientScience = React.lazy(() => import("./components/categories/AncientScience"));
const ResourceDetail = React.lazy(() => import("./components/ResourceDetail"));
import FAQ from "./components/FAQ";
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
  ListItemText,
  Container
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LanguageSwitcher from './components/common/LanguageSwitcher';
const GalleryDetail = React.lazy(() => import("./components/GalleryDetail"));
const ArticleDetail = React.lazy(() => import("./components/ArticleDetail"));
const AncientScienceDetail = React.lazy(() => import("./components/details/AncientScienceDetail"));
const ClothingDetail = React.lazy(() => import("./components/details/ClothingDetail"));
const ScrollExpandDemo = React.lazy(() => import("./components/demos/ScrollExpandDemo"));
import SiteLogo from "./components/common/SiteLogo";
import Footer from "./components/common/Footer";
import ScrollToTop from "./components/common/ScrollToTop";

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
  const { t, i18n } = useTranslation();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const fetchUser = React.useCallback(() => {
    console.log("Fetching user authentication status...");
    fetch(`/auth/user`, {
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
    // Check if we were authenticating and clear the flag
    const wasAuthenticating = sessionStorage.getItem('isAuthenticating');
    if (wasAuthenticating) {
      console.log("Was authenticating, clearing flag and fetching user");
      sessionStorage.removeItem('isAuthenticating');
      setIsAuthenticating(false);

      // If just came from auth, fetch user and redirect to profile
      setTimeout(() => {
        fetch(`/auth/user`, { credentials: "include" })
          .then(res => res.json())
          .then(userData => {
            if (userData && userData._id) {
              console.log("User authenticated, redirecting to profile");
              setUser(userData);
              setLoading(false);
              window.location.href = "/profile";
            }
          })
          .catch(err => console.error("Auth check failed:", err));
      }, 500);
    }

    // Check for auth errors in URL
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    if (authStatus) {
      console.log("Auth status from URL:", authStatus);
      if (authStatus === 'failed' || authStatus === 'error' || authStatus === 'nouser' || authStatus === 'session-error') {
        console.error("Authentication failed:", authStatus);
        setIsAuthenticating(false);
        sessionStorage.removeItem('isAuthenticating');
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    // Log current URL for debugging
    console.log("Current URL:", window.location.href);
    console.log("Pathname:", window.location.pathname);
    console.log("Search params:", window.location.search);

    fetchUser();

    // Listen for auth success event from AuthCallback
    const handleAuthSuccess = (event) => {
      console.log("Auth success event received, setting user immediately");
      setIsAuthenticating(false);
      sessionStorage.removeItem('isAuthenticating');
      // Set user immediately from event data
      if (event.detail) {
        setUser(event.detail);
        setLoading(false);
      }
      // Also fetch to ensure we have latest data
      fetchUser();
    };

    window.addEventListener("auth-success", handleAuthSuccess);
    return () => {
      window.removeEventListener("auth-success", handleAuthSuccess);
    };
  }, [fetchUser]);

  // Call resource error logging on component mount
  useEffect(() => {
    setupResourceErrorLogging();
  }, []);

  // Small helper component that renders Footer only on the Home route
  function FooterSelector() {
    try {
      const location = useLocation();
      return location?.pathname === '/' ? <Footer /> : null;
    } catch (e) {
      // If hooks are used outside Router for some reason, fall back to showing Footer
      return <Footer />;
    }
  }

  // Auto-hide navbar on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when at top of page
      if (currentScrollY < 10) {
        setNavVisible(true);
      }
      // Hide navbar when scrolling down, show when scrolling up
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setNavVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setNavVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    // Show navbar when mouse is near top of screen
    const handleMouseMove = (e) => {
      if (e.clientY < 50) {
        setNavVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [lastScrollY]);

  const login = () => {
    if (isAuthenticating) {
      console.log("Authentication already in progress, ignoring...");
      return;
    }
    console.log("Redirecting to Google OAuth...");
    setIsAuthenticating(true);
    sessionStorage.setItem('isAuthenticating', 'true');
    window.location.href = `/auth/google`;
  };

  const logout = () => {
    console.log("Logging out...");
    window.location.href = `/auth/logout`;
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { key: 'nav.explore', path: '/explore' },
    { key: 'nav.research', path: '/seeds-and-footprints' },
    { key: 'nav.events', path: '/events' },
    { key: 'nav.gallery', path: '/gallery' },
    { key: 'nav.articles', path: '/articles' },
    { key: 'nav.resources', path: '/resources' },
    { key: 'nav.faq', path: '/faq' },
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
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <AppBar
          key={i18n.language}
          position="fixed"
          elevation={0}
          sx={{
            bgcolor: '#ffffff',
            color: '#1f140e',
            boxShadow: '0 1px 6px rgba(15,10,8,0.08)',
            top: 0,
            zIndex: 1100,
            borderBottom: '2px solid rgba(186,29,22,0.08)',
            // Always visible on mobile (xs, sm), auto-hide on desktop (md+)
            transform: {
              xs: 'translateY(0)',  // Always visible on mobile
              sm: 'translateY(0)',  // Always visible on small tablets
              md: navVisible ? 'translateY(0)' : 'translateY(-100%)'  // Auto-hide on desktop
            },
            transition: 'transform 0.3s ease-in-out',
          }}
        >
          <Container maxWidth="xl">
            <Toolbar
              disableGutters
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                minHeight: { xs: "50px", md: "62px" },
                py: { xs: 0.7, md: 1 },
                px: { xs: 1.25, md: 2.2 }
              }}
            >
              {/* Logo Section */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SiteLogo height={{ xs: 34, md: 42 }} />
                <Link
                  component={RouterLink}
                  to="/"
                  color="#1f140e"
                  underline="none"
                  sx={{
                    fontWeight: 500,
                    fontFamily: "'Poppins', 'Hind Madurai', sans-serif",
                    fontSize: { xs: 15.5, md: 18.5 },
                    letterSpacing: '0.5px',
                    transition: "color 0.2s ease",
                    display: { xs: 'none', sm: 'block' },
                    "&:hover": {
                      color: "#ba1d16"
                    }
                  }}
                >
                  {t('app.title')}
                </Link>
              </Box>

              {/* Desktop Navigation */}
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  gap: i18n.language === 'ta' ? 1.5 : 2.6, // Reduce gap for Tamil
                  flex: '1 1 auto',
                  justifyContent: 'center',
                  ml: 2,
                  flexWrap: 'nowrap',
                  overflow: 'hidden',
                  maxWidth: '100%'
                }}
              >
                <Link
                  component={RouterLink}
                  to="/"
                  underline="none"
                  sx={{
                    color: '#000',
                    fontSize: i18n.language === 'ta' ? 14 : 15.5, // Smaller font for Tamil
                    fontWeight: 500,
                    fontFamily: "'Poppins', 'Hind Madurai', sans-serif",
                    letterSpacing: '0.3px',
                    transition: 'color 0.2s ease',
                    whiteSpace: 'nowrap', // Prevent text wrapping
                    '&:hover': {
                      color: '#ba1d16'
                    }
                  }}
                >
                  {t('nav.home')}
                </Link>
                {navItems.map((ni) => (
                  <Link
                    key={ni.key}
                    component={RouterLink}
                    to={ni.path}
                    underline="none"
                    sx={{
                      color: '#000',
                      fontSize: i18n.language === 'ta' ? 14 : 15.5, // Smaller font for Tamil
                      fontWeight: 500,
                      fontFamily: "'Poppins', 'Hind Madurai', sans-serif",
                      letterSpacing: '0.3px',
                      transition: 'color 0.2s ease',
                      whiteSpace: 'nowrap', // Prevent text wrapping
                      '&:hover': {
                        color: '#ba1d16'
                      }
                    }}
                  >
                    {t(ni.key)}
                  </Link>
                ))}
                {user && (
                  <Link
                    component={RouterLink}
                    to="/profile"
                    underline="none"
                    sx={{
                      color: '#000',
                      fontSize: i18n.language === 'ta' ? 14 : 15.5, // Smaller font for Tamil
                      fontWeight: 500,
                      fontFamily: "'Poppins', 'Hind Madurai', sans-serif",
                      letterSpacing: '0.3px',
                      transition: 'color 0.2s ease',
                      whiteSpace: 'nowrap', // Prevent text wrapping
                      '&:hover': {
                        color: '#ba1d16'
                      }
                    }}
                  >
                    {t('nav.profile')}
                  </Link>
                )}
              </Box>

              {/* Right Section - Language, Login */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.25 }}>
                <LanguageSwitcher />
                {user ? (
                  <Button
                    onClick={logout}
                    sx={{
                      color: '#000',
                      fontSize: 14.5,
                      fontWeight: 500,
                      fontFamily: "'Poppins', 'Hind Madurai', sans-serif",
                      letterSpacing: '0.3px',
                      textTransform: 'none',
                      minWidth: 'auto',
                      px: 1.5,
                      '&:hover': {
                        color: '#ba1d16',
                        bgcolor: 'transparent'
                      }
                    }}
                  >
                    {t('nav.logout')}
                  </Button>
                ) : (
                  <Button
                    onClick={login}
                    sx={{
                      color: '#000',
                      fontSize: 14.5,
                      fontWeight: 500,
                      fontFamily: "'Poppins', 'Hind Madurai', sans-serif",
                      letterSpacing: '0.3px',
                      textTransform: 'none',
                      minWidth: 'auto',
                      px: 1.5,
                      '&:hover': {
                        color: '#ba1d16',
                        bgcolor: 'transparent'
                      }
                    }}
                  >
                    {t('nav.login')}
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
                  display: { md: 'none' },
                  color: '#1f140e',
                  ml: 'auto'
                }}
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </Container>

          {/* Mobile Drawer */}
          <Drawer
            variant="temporary"
            anchor="right"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: 280,
                bgcolor: '#ffffff',
                color: '#1f140e'
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderBottom: '1px solid rgba(0,0,0,0.08)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <SiteLogo height={32} />
                <Typography variant="h6" sx={{ color: '#1f140e', fontWeight: 500, fontSize: 17, fontFamily: "'Poppins', 'Hind Madurai', sans-serif", letterSpacing: '0.3px' }}>
                  {t('app.title')}
                </Typography>
              </Box>
              <IconButton onClick={handleDrawerToggle}>
                <CloseIcon sx={{ color: '#1f140e' }} />
              </IconButton>
            </Box>
            <List sx={{ pt: 2 }}>
              <ListItem
                component={RouterLink}
                to="/"
                onClick={handleDrawerToggle}
                sx={{
                  color: '#000',
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(139,0,0,0.05)'
                  }
                }}
              >
                <ListItemText
                  primary={t('nav.home')}
                  primaryTypographyProps={{
                    fontWeight: 400,
                    fontSize: 15.5,
                    fontFamily: "'Poppins', 'Hind Madurai', sans-serif",
                    letterSpacing: '0.2px',
                    color: '#000'
                  }}
                />
              </ListItem>
              {navItems.map((item) => (
                <ListItem
                  key={item.key}
                  component={RouterLink}
                  to={item.path}
                  onClick={handleDrawerToggle}
                  sx={{
                    color: '#000',
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(139,0,0,0.05)'
                    }
                  }}
                >
                  <ListItemText
                    primary={t(item.key)}
                    primaryTypographyProps={{
                      fontWeight: 400,
                      fontSize: 15.5,
                      fontFamily: "'Poppins', 'Hind Madurai', sans-serif",
                      letterSpacing: '0.2px',
                      color: '#000'
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
                    color: '#000',
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(139,0,0,0.05)'
                    }
                  }}
                >
                  <ListItemText
                    primary={t('nav.profile')}
                    primaryTypographyProps={{
                      fontWeight: 400,
                      fontSize: 15.5,
                      fontFamily: "'Poppins', 'Hind Madurai', sans-serif",
                      letterSpacing: '0.2px',
                      color: '#000'
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
                    color: '#000',
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(139,0,0,0.05)'
                    }
                  }}
                >
                  <ListItemText
                    primary={t('nav.logout')}
                    primaryTypographyProps={{
                      fontWeight: 400,
                      fontSize: 15.5,
                      fontFamily: "'Poppins', 'Hind Madurai', sans-serif",
                      letterSpacing: '0.2px',
                      color: '#000'
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
                    color: '#000',
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(139,0,0,0.05)'
                    }
                  }}
                >
                  <ListItemText
                    primary={t('nav.login')}
                    primaryTypographyProps={{
                      fontWeight: 400,
                      fontSize: 15.5,
                      fontFamily: "'Poppins', 'Hind Madurai', sans-serif",
                      letterSpacing: '0.2px',
                      color: '#000'
                    }}
                  />
                </ListItem>
              )}
              <Box sx={{ px: 2, pt: 3, pb: 2, mt: 2, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                <LanguageSwitcher />
              </Box>
            </List>
          </Drawer>
        </AppBar>
        <Box sx={{ pt: { xs: 7, md: 8 } }}>
          <React.Suspense fallback={<Box sx={{ p: 4, textAlign: 'center' }}><Typography variant="body1">Loading…</Typography></Box>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth/google/callback" element={<AuthCallback />} />
              <Route path="/auth/failure" element={<AuthFailure />} />
              <Route path="/articles" element={<Articles user={user} />} />
              <Route path="/my-articles" element={<MyArticles user={user} />} />
              <Route path="/gallery" element={<Gallery user={user} />} />
              <Route path="/events" element={<Events user={user} />} />
              <Route path="/resources" element={<Resources user={user} />} />
              <Route path="/resources/:id" element={<ResourceDetail user={user} />} />
              <Route path="/seeds-and-footprints" element={<SeedsFootprints user={user} />} />
              <Route path="/seeds-and-footprints/folders/:id" element={<SeedsFootprintsDetail user={user} />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/explore" element={<Explore user={user} />} />
              <Route path="/demo/scroll-expand" element={<ScrollExpandDemo />} />
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
              <Route path="/explore/temples/:id" element={<TempleDetail user={user} />} />
              <Route path="/dynasties/:slug" element={<DynastyDetail user={user} />} />
              <Route path="/poets/:slug" element={<PoetDetail user={user} />} />
              <Route
                path="/explore/literature/:id"
                element={<LiteratureDetail user={user} />}
              />
              <Route path="/explore/dance/:id" element={<DanceDetail user={user} />} />
              <Route path="/explore/foods/:id" element={<FoodDetail user={user} />} />
              <Route path="/explore/festivals/:id" element={<FestivalDetail user={user} />} />
              <Route path="/explore/lands/:id" element={<LandDetailExpanded user={user} />} />
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
                  <Box sx={{
                    width: '100%',
                    backgroundColor: '#fff',
                    backgroundImage: {
                      xs: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.02' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`,
                      md: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.03' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`
                    },
                    backgroundSize: { xs: '8px 8px', md: '6px 6px' },
                    backgroundRepeat: 'repeat',
                    backgroundPosition: 'center top',
                    '@media (min-resolution: 1.5dppx)': {
                      backgroundImage: {
                        xs: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.12' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`,
                        md: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.14' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`
                      },
                      backgroundSize: { xs: '18px 18px', md: '14px 14px' }
                    }
                  }}>
                    {user ? (
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
                    )}
                  </Box>
                }
              />
              <Route
                path="/explore/ancientscience/:id"
                element={<AncientScienceDetail user={user} />}
              />
              <Route path="/explore/clothing/:id" element={<ClothingDetail user={user} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </React.Suspense>
          <FooterSelector />
        </Box>
      </Router>
    </HelmetProvider>
  );
}

export default App;
