import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Divider,
  Chip,
  Fade,
  Paper,
  IconButton,
  Modal,
  Tooltip,
  Snackbar,
  Button,
  Container,
  Dialog,
  DialogContent,
} from "@mui/material";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import {
  AutoAwesome,
  Landscape,
  Article,
  PhotoCamera,
  Event,
  MenuBook,
  Close,
  Star,
} from "@mui/icons-material";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import ExploreIcon from "@mui/icons-material/Explore";

const TAMIL_MOTIF =
  "https://upload.wikimedia.org/wikipedia/commons/6/6b/Tamil_om_symbol.svg";
const FACTS = [
  "Tamil is one of the world's oldest living languages, with a literary tradition spanning over 2,000 years!",
  "The Sangam period produced more than 2,000 poems by over 400 poets.",
  "The Brihadeeswarar Temple in Thanjavur is a UNESCO World Heritage site built over 1,000 years ago.",
  "The Kurinji flower blooms only once every 12 years in the Western Ghats.",
];

function getRandomFact() {
  return FACTS[Math.floor(Math.random() * FACTS.length)];
}

export default function Home() {
  const [lands, setLands] = useState([]);
  const [articles, setArticles] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
  const [show, setShow] = useState(false);
  const [fact, setFact] = useState(getRandomFact());
  const [featuredOpen, setFeaturedOpen] = useState(true);
  const [mapModal, setMapModal] = useState({ open: false, land: null });
  const [kural, setKural] = useState(null);
  const [kuralLoading, setKuralLoading] = useState(true);
  const [kuralError, setKuralError] = useState(null);
  const [selectedLand, setSelectedLand] = useState(null);

  useEffect(() => {
    setShow(true);
    fetch(`${import.meta.env.VITE_APP_API_URL || "http://localhost:5000"}/api/lands`)
      .then((res) => res.json())
      .then(setLands);
    fetch(`${import.meta.env.VITE_APP_API_URL || "http://localhost:5000"}/api/articles`)
      .then((res) => res.json())
      .then(setArticles);
    fetch(`${import.meta.env.VITE_APP_API_URL || "http://localhost:5000"}/api/gallery`)
      .then((res) => res.json())
      .then(setGallery);
    fetch(`${import.meta.env.VITE_APP_API_URL || "http://localhost:5000"}/api/events`)
      .then((res) => res.json())
      .then(setEvents);
    fetch(`${import.meta.env.VITE_APP_API_URL || "http://localhost:5000"}/api/resources`)
      .then((res) => res.json())
      .then(setResources);
    setFact(getRandomFact());
    // Fetch random Thirukkural
    const randomKuralNum = Math.floor(Math.random() * 1330) + 1;
    setKuralLoading(true);
    setKuralError(null);
    fetch(
      `https://getthirukkural.appspot.com/api/3.0/kural/${randomKuralNum}?appid=0kmqyagu5bche&format=json`
    )
      .then((res) => res.json())
      .then((data) => {
        setKural(data);
        setKuralLoading(false);
      })
      .catch(() => {
        setKuralError("Failed to load Thirukkural");
        setKuralLoading(false);
      });
  }, []);

  // Parallax effect for hero
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 10 });

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        bgcolor: "#fff",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      {/* Floating Tamil script */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <Typography
          sx={{
            position: "absolute",
            top: 60,
            left: 30,
            fontSize: 60,
            color: "#eee",
            opacity: 0.15,
            fontFamily: "Inter, Arial, sans-serif",
          }}
        >
          தமிழ்
        </Typography>
        <Typography
          sx={{
            position: "absolute",
            bottom: 80,
            right: 40,
            fontSize: 48,
            color: "#eee",
            opacity: 0.1,
            fontFamily: "Inter, Arial, sans-serif",
          }}
        >
          சங்கம்
        </Typography>
      </Box>
      {/* HERO SECTION (VIDEO ONLY) */}
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: 400, md: 600 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          textAlign: "center",
          py: 8,
          mb: 6,
          width: "100%",
          height: "80vh", // Maintain existing height
        }}
      >
        <iframe
          src={`https://www.youtube.com/embed/PD8850MZw18?autoplay=1&mute=1&loop=1&playlist=PD8850MZw18&controls=0&showinfo=0&modestbranding=1&iv_load_policy=3&rel=0`}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw", // Full viewport width
            height: "100%", // Maintain container height
            objectFit: "cover",
            zIndex: 0,
            opacity: 1,
            border: "none",
            pointerEvents: "none",
            transform: "scale(1.4)", // Zoom to cover entire area
            transformOrigin: "center"
          }}
          allow="autoplay; encrypted-media"
          allowFullScreen={false}
          frameBorder="0"
        ></iframe>
      </Box>
      <Divider
        sx={{
          bgcolor: "#eee",
          height: 2,
          maxWidth: 120,
          mx: "auto",
          mb: 6,
          borderRadius: 2,
        }}
      />
      {/* DID YOU KNOW SECTION (REALISTIC OLAICHUVADI STYLE) */}
      <Box sx={{ mb: 6, display: "flex", justifyContent: "center" }}>
        <Paper
          elevation={12}
          sx={{
            width: "90vw",
            maxWidth: 900,
            minHeight: 200,
            p: 4,
            borderRadius: "24px",
            position: "relative",
            background: "#fff", // Solid white background
            boxShadow: "0 16px 48px rgba(0, 0, 0, 0.3)", // Enhanced shadow
            border: "none", // Removed border
            overflow: "hidden",
            fontFamily: "'Poppins', 'Noto Serif Tamil', serif",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.3s ease, box-shadow 0.3s ease", // Added transitions
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
            },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#000", // Black text
              fontWeight: 800,
              mb: 2,
              fontFamily: "'Poppins', serif",
              letterSpacing: 1.5,
              textAlign: "center",
              textTransform: "uppercase",
              transition: "color 0.3s ease", // Added transition
              "&:hover": {
                color: "#333", // Darker black on hover
              },
            }}
          >
            Did You Know?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#333", // Dark gray text
              fontSize: 20,
              fontWeight: 500,
              fontFamily: "'Poppins', serif",
              textAlign: "center",
              lineHeight: 1.6,
              transition: "color 0.3s ease", // Added transition
              "&:hover": {
                color: "#000", // Black on hover
              },
            }}
          >
            {fact}
          </Typography>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0) 70%)", // Subtle radial overlay
              zIndex: 1,
              pointerEvents: "none",
            }}
          />
        </Paper>
      </Box>
      <Divider
        sx={{
          bgcolor: "#eee",
          height: 2,
          maxWidth: 100,
          mx: "auto",
          mb: 6,
          borderRadius: 2,
        }}
      />
      {/* THIRUKKURAL OF THE DAY SECTION (REALISTIC OLAICHUVADI STYLE) */}
      <Box sx={{ mb: 6, display: "flex", justifyContent: "center" }}>
        <Paper
          elevation={12}
          sx={{
            width: "90vw",
            maxWidth: 1000,
            minHeight: 200,
            p: 5,
            borderRadius: "24px",
            position: "relative",
            background: "#fff", // Solid white background
            boxShadow: "0 16px 48px rgba(0, 0, 0, 0.3)", // Enhanced shadow
            border: "none", // Removed border
            overflow: "hidden",
            fontFamily: "'Poppins', 'Noto Serif Tamil', serif",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.3s ease, box-shadow 0.3s ease", // Added transitions
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.4)",
            },
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#000", // Black text
              fontWeight: 800,
              mb: 2,
              fontFamily: "'Poppins', serif",
              letterSpacing: 1.5,
              textAlign: "center",
              textTransform: "uppercase",
              transition: "color 0.3s ease", // Added transition
              "&:hover": {
                color: "#333", // Darker black on hover
              },
            }}
          >
            திருக்குறள் (Thirukkural) of the Day
          </Typography>
          {kuralLoading ? (
            <Typography
              sx={{
                color: "#333", // Dark gray text
                mt: 2,
                fontFamily: "'Poppins', serif",
                textAlign: "center",
              }}
            >
              Loading...
            </Typography>
          ) : kuralError ? (
            <Typography
              color="error"
              sx={{
                mt: 2,
                fontFamily: "'Poppins', serif",
                textAlign: "center",
              }}
            >
              {kuralError}
            </Typography>
          ) : kural ? (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "'Noto Serif Tamil', serif",
                  color: "#000", // Black text
                  fontSize: 24,
                  mb: 2,
                  lineHeight: 1.6,
                }}
              >
                {kural.line1}
                <br />
                {kural.line2}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#333", // Dark gray text
                  fontStyle: "italic",
                  mb: 2,
                  fontFamily: "'Noto Serif Tamil', serif",
                }}
              >
                {kural.urai1}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#000", // Black text
                  fontWeight: 500,
                  fontFamily: "'Poppins', serif",
                }}
              >
                <b>Translation:</b> {kural.translation}
              </Typography>
            </Box>
          ) : null}
        </Paper>
      </Box>
      <Divider
        sx={{
          bgcolor: "#eee",
          height: 2,
          maxWidth: 80,
          mx: "auto",
          mb: 6,
          borderRadius: 2,
        }}
      />
      {/* LANDS DISCOVERY SECTION */}
      <Box 
        sx={{ 
          px: { xs: 2, md: 4 },
          py: 6,
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            sx={{ 
              textAlign: 'center', 
              mb: 6, 
              fontWeight: 700, 
              color: '#000000',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 150,
                height: 4,
                bgcolor: '#000000',
                opacity: 0.7,
                borderRadius: 2,
              }
            }}
          >
            Landscapes of Tamil Heritage
          </Typography>

          {/* Progressive Land Type Sections */}
          {[
            {
              name: 'Kurinji',
              type: 'Mountain Landscape',
              image: lands.find(land => land.name.toLowerCase() === 'kurinji')?.image || "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
              description: "The mountainous region of Tamil lands, characterized by its lush green forests, misty peaks, and rich biodiversity. Kurinji represents the highland ecosystems that are home to unique flora and fauna.",
              accentColor: '#808080'
            },
            {
              name: 'Mullai',
              type: 'Forest Landscape',
              image: lands.find(land => land.name.toLowerCase() === 'mullai')?.image || "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
              description: "The verdant forest lands, symbolizing abundance, wildlife, and the deep connection between nature and Tamil culture. Mullai represents the dense, life-giving forests that have sustained communities for generations.",
              accentColor: '#a0a0a0'
            },
            {
              name: 'Marutham',
              type: 'Agricultural Landscape',
              image: lands.find(land => land.name.toLowerCase() === 'marutham')?.image || "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
              description: "The fertile agricultural plains, the heartland of Tamil agricultural heritage. Marutham represents the rich, irrigated lands where rice cultivation and farming traditions have thrived for centuries.",
              accentColor: '#c0c0c0'
            },
            {
              name: 'Neithal',
              type: 'Coastal Landscape',
              image: lands.find(land => land.name.toLowerCase() === 'neithal')?.image || "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
              description: "The coastal regions that define Tamil maritime culture. Neithal represents the sandy shores, fishing communities, and the vast marine ecosystems that have shaped Tamil maritime traditions.",
              accentColor: '#d0d0d0'
            },
            {
              name: 'Palai',
              type: 'Arid Landscape',
              image: lands.find(land => land.name.toLowerCase() === 'palai')?.image || "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
              description: "The arid and desert-like regions, representing resilience and adaptation. Palai symbolizes the challenging landscapes that have tested and shaped the spirit of Tamil people.",
              accentColor: '#e0e0e0'
            }
          ].map((land, index) => (
            <Box 
              key={land.name}
              sx={{ 
                display: 'flex', 
                flexDirection: index % 2 === 0 ? 'row' : 'row-reverse',
                alignItems: 'center',
                mb: 6,
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-10px)',
                  boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
                }
              }}
            >
              {/* Image Section */}
              <Box 
                sx={{ 
                  width: { xs: '100%', md: '50%' }, 
                  height: { xs: 300, md: 500 },
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <CardMedia
                  component="img"
                  image={land.image}
                  alt={land.name}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    }
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
                    color: 'white',
                    p: 3
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#ffffff' }}>
                    {land.name}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ textTransform: 'uppercase', letterSpacing: 1, color: '#ffffff' }}>
                    {land.type}
                  </Typography>
                </Box>
              </Box>

              {/* Description Section */}
              <Box 
                sx={{ 
                  width: { xs: '100%', md: '50%' }, 
                  p: { xs: 2, md: 4 },
                  bgcolor: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  height: { xs: 'auto', md: 500 }
                }}
              >
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 3, 
                    color: '#000000',
                    borderBottom: `3px solid ${land.accentColor}`,
                    pb: 1
                  }}
                >
                  {land.name} Landscape
                </Typography>
                <Typography 
                  variant="body1" 
                  paragraph 
                  sx={{ 
                    mb: 3, 
                    color: '#333333',
                    lineHeight: 1.6
                  }}
                >
                  {land.description}
                </Typography>
                <Button 
                  variant="outlined"
                  startIcon={<ExploreIcon />}
                  sx={{ 
                    color: '#000000',
                    borderColor: '#000000',
                    borderRadius: 4,
                    px: 3,
                    py: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    letterSpacing: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: '#000000',
                      color: '#ffffff',
                      transform: 'translateY(-5px)',
                      boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
                    }
                  }}
                  onClick={() => setMapModal({ 
                    open: true, 
                    land: lands.find(l => l.name.toLowerCase() === land.name.toLowerCase()) 
                  })}
                >
                  Explore {land.name} Landscape
                </Button>
              </Box>
            </Box>
          ))}
        </Container>
      </Box>
      <Divider
        sx={{
          bgcolor: "#eee",
          height: 2,
          maxWidth: 80,
          mx: "auto",
          mb: 6,
          borderRadius: 2,
        }}
      />
      {/* Footer */}
      <Box
        sx={{
          mt: 8,
          py: 4,
          bgcolor: "#fff",
          textAlign: "center",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          boxShadow: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "#111",
            fontWeight: 900,
            mb: 1,
          }}
        >
          தமிழ் மரபு | Tamil Heritage
        </Typography>
        <Typography variant="body2" sx={{ color: "#111", mb: 1 }}>
          © {new Date().getFullYear()} Tamil Heritage. All rights reserved.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 1 }}>
          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg"
              alt="Facebook"
              style={{ width: 28, filter: "grayscale(1) brightness(0.7)" }}
            />
          </a>
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg"
              alt="Instagram"
              style={{ width: 28, filter: "grayscale(1) brightness(0.7)" }}
            />
          </a>
          <a
            href="https://www.youtube.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg"
              alt="YouTube"
              style={{ width: 28, filter: "grayscale(1) brightness(0.7)" }}
            />
          </a>
        </Box>
      </Box>
      {/* Interactive Map Modal */}
      <Modal
        open={mapModal.open}
        onClose={() => setMapModal({ open: false, land: null })}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "#fffdf6",
            p: 4,
            borderRadius: 4,
            boxShadow: 8,
            minWidth: 320,
            maxWidth: 400,
          }}
        >
          {mapModal.land && (
            <>
              <Typography
                variant="h5"
                sx={{ color: "primary.main", fontWeight: 700 }}
              >
                {mapModal.land.name} ({mapModal.land.type})
              </Typography>
              {mapModal.land.image && (
                <img
                  src={mapModal.land.image}
                  alt={mapModal.land.name}
                  style={{ width: "100%", borderRadius: 8, margin: "16px 0" }}
                />
              )}
              <Typography
                variant="body2"
                dangerouslySetInnerHTML={{ __html: mapModal.land.description }}
              />
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ color: "secondary.main" }}>
                Gods: {mapModal.land.gods?.join(", ")}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: "secondary.main" }}>
                People: {mapModal.land.people?.join(", ")}
              </Typography>
              <Box sx={{ mt: 1, mb: 1 }}>
                {mapModal.land.flora?.map((f) => (
                  <Chip
                    key={f}
                    label={f}
                    size="small"
                    sx={{
                      mr: 0.5,
                      mb: 0.5,
                      bgcolor: "#f5f5f5",
                      color: "#111",
                    }}
                  />
                ))}
                {mapModal.land.fauna?.map((f) => (
                  <Chip
                    key={f}
                    label={f}
                    size="small"
                    sx={{
                      mr: 0.5,
                      mb: 0.5,
                      bgcolor: "#f5f5f5",
                      color: "#111",
                    }}
                  />
                ))}
              </Box>
              <Button
                onClick={() => setMapModal({ open: false, land: null })}
                variant="outlined"
                sx={{
                  mt: 2,
                  color: "#111",
                  borderColor: "#111",
                  fontFamily: "Inter, Arial, sans-serif",
                }}
              >
                Close
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
