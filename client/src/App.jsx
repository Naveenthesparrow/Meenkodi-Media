import React from "react";
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
import { AppBar, Toolbar, Button, Box, Link, Typography } from "@mui/material";
import GalleryDetail from "./components/GalleryDetail";
import ArticleDetail from "./components/ArticleDetail";
import ResourceDetail from "./components/ResourceDetail";
import AncientScienceDetail from "./components/details/AncientScienceDetail";
import ClothingDetail from "./components/details/ClothingDetail";

function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

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
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Router>
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: "#fff", color: "#111", boxShadow: 1 }}
      >
        <Toolbar sx={{ fontFamily: "Inter, Arial, sans-serif" }}>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
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
                fontSize: 24,
              }}
            >
              Tamil Heritage
            </Link>
          </Typography>
          <Button
            variant="text"
            sx={{
              color: "#111",
              fontFamily: "Poppins, Arial, sans-serif",
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
            component={RouterLink}
            to="/explore"
          >
            Explore
          </Button>
          <Button
            variant="text"
            sx={{
              color: "#111",
              fontFamily: "Poppins, Arial, sans-serif",
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
            component={RouterLink}
            to="/events"
          >
            Events
          </Button>
          <Button
            variant="text"
            sx={{
              color: "#111",
              fontFamily: "Poppins, Arial, sans-serif",
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
            component={RouterLink}
            to="/gallery"
          >
            Gallery
          </Button>
          <Button
            variant="text"
            sx={{
              color: "#111",
              fontFamily: "Poppins, Arial, sans-serif",
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
            component={RouterLink}
            to="/articles"
          >
            Articles
          </Button>
          <Button
            variant="text"
            sx={{
              color: "#111",
              fontFamily: "Poppins, Arial, sans-serif",
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
            component={RouterLink}
            to="/resources"
          >
            Resources
          </Button>
          {user ? (
            <>
              <Button
                variant="text"
                sx={{
                  color: "#111",
                  fontFamily: "Poppins, Arial, sans-serif",
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
                component={RouterLink}
                to="/profile"
              >
                Profile
              </Button>
              <Button
                variant="outlined"
                sx={{
                  color: "#111",
                  borderColor: "#111",
                  fontFamily: "Poppins, Arial, sans-serif",
                  ml: 1,
                }}
                onClick={logout}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              sx={{
                color: "#111",
                borderColor: "#111",
                fontFamily: "Poppins, Arial, sans-serif",
                ml: 1,
              }}
              onClick={login}
            >
              Login with Google
            </Button>
          )}
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
      </Box>
    </Router>
  );
}

export default App;
