import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
import FiveLandsTimeline from "./FiveLandsTimeline";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import ExploreIcon from "@mui/icons-material/Explore";
import YinYangAnimation from "./common/YinYangAnimation";
import Particles from "./Particles";
import ShinyText from "./common/ShinyText";
import RevealTamilTitle from "./common/RevealTamilTitle";
import { useBilingualContent } from "../utils/bilingualContent";

const TAMIL_MOTIF =
  "https://upload.wikimedia.org/wikipedia/commons/6/6b/Tamil_om_symbol.svg";
// Bilingual facts for the Did You Know section
const FACTS = [
  {
    en: "Tamil is one of the world's oldest living languages, with a literary tradition spanning over 2,000 years!",
    ta: "உலகின் தொன்மையான உயிர்மொழிகளில் ஒன்றான தமிழ், 2000 ஆண்டுகளுக்கும் மேலான செழுமையான இலக்கிய மரபைக் கொண்டுள்ளது!",
  },
  {
    en: "The Sangam period produced more than 2,000 poems by over 400 poets.",
    ta: "சங்கக் காலத்தில் 400-க்கும் மேற்பட்ட புலவர்கள் 2,000-க்கும் அதிகமானப் பாடல்கள் படைத்துள்ளனர்.",
  },
  {
    en: "The Brihadeeswarar Temple in Thanjavur is a UNESCO World Heritage site built over 1,000 years ago.",
    ta: "தஞ்சாவூரில் அமைந்துள்ள பிரகதீஸ்வரர் (பெரிய) கோவில் 1,000 ஆண்டுகளுக்கு முன் கட்டப்பட்ட யுனெஸ்கோ உலக பாரம்பரிய தளம் ஆகும்.",
  },
  {
    en: "The Kurinji flower blooms only once every 12 years in the Western Ghats.",
    ta: "மேற்கு தொடர்ச்சி மலையில் குரிஞ்சி மலர் 12 ஆண்டுகளுக்கு ஒருமுறை மட்டுமே மலர்கிறது.",
  },
];

function getRandomFactIndex() {
  return Math.floor(Math.random() * FACTS.length);
}

export default function Home() {
  const getContent = useBilingualContent();
  const { t, i18n } = useTranslation();
  const [lands, setLands] = useState([]);
  const [articles, setArticles] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
  const [show, setShow] = useState(false);
  const [factIndex, setFactIndex] = useState(getRandomFactIndex());
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
  setFactIndex(getRandomFactIndex());
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
    <Box sx={{ bgcolor: "#fff", color: "#111", fontFamily: "Inter, Arial, sans-serif" }}>
      {/* Hero with particle background and Yin-Yang */}
      <Box sx={{ position: "relative", width: "100%", height: { xs: "90vh", md: "90vh" }, bgcolor: "#000", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Particles
            particleColors={["#ffffff", "#e6e6e6", "#d9d9d9"]}
            particleCount={220}
            particleSpread={10}
            speed={0.1}
            particleBaseSize={90}
            moveParticlesOnHover={true}
            alphaParticles={true}
            disableRotation={true}
            showWatermark={false}
            enableDrag={true}
            enableClickBurst={true}
          />
        </Box>
        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1 }}>
          <Box sx={{ textAlign: "center", color: "#fff" }}>
            <Box sx={{ filter: "drop-shadow(0 8px 28px rgba(0,0,0,0.65))" }}>
              <YinYangAnimation
                size={{ xs: 220, sm: 320, md: 460 }}
                bg="transparent"
                strokeColor="#ffffff"
                yinColor="#121212"
                yangColor="#ffffff"
                dotLightColor="#ffffff"
                dotDarkColor="#000000"
              />
            </Box>
            <Typography variant="h3" component="div" sx={{ fontWeight: 800, mt: 2, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
              <RevealTamilTitle />
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ bgcolor: "#eee", height: 2, maxWidth: 100, mx: "auto", my: 6, borderRadius: 2 }} />

  {/* DID YOU KNOW SECTION */}
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
            background: "#fff",
            boxShadow: "0 16px 48px rgba(0, 0, 0, 0.2)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.25)",
            },
          }}
        >
          <Typography variant="h4" sx={{ color: "#000", fontWeight: 800, mb: 2, letterSpacing: 1.5, textAlign: "center", textTransform: "uppercase" }}>
            {t('home.didYouKnow')}
          </Typography>
          <Typography variant="body1" sx={{ color: "#333", fontSize: 18, fontWeight: 500, textAlign: "center", lineHeight: 1.6 }}>
            {FACTS[factIndex]?.[i18n.language] || FACTS[factIndex]?.en}
          </Typography>
        </Paper>
      </Box>

      <Divider sx={{ bgcolor: "#eee", height: 2, maxWidth: 80, mx: "auto", mb: 6, borderRadius: 2 }} />

  {/* THIRUKKURAL OF THE DAY SECTION */}
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
            background: "#fff",
            boxShadow: "0 16px 48px rgba(0, 0, 0, 0.2)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="h4" sx={{ color: "#000", fontWeight: 800, mb: 2, letterSpacing: 1.5, textAlign: "center", textTransform: "uppercase" }}>
            {t('home.thirukkuralOfDay')}
          </Typography>
          {kuralLoading ? (
            <Typography sx={{ color: "#333", mt: 2, textAlign: "center" }}>Loading...</Typography>
          ) : kuralError ? (
            <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>{kuralError}</Typography>
          ) : kural ? (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="h6" sx={{ color: "#000", fontSize: 22, mb: 2, lineHeight: 1.6, fontFamily: "'Noto Serif Tamil', serif" }}>
                {kural.line1}
                <br />
                {kural.line2}
              </Typography>
              <Typography variant="body2" sx={{ color: "#333", fontStyle: "italic", mb: 2, fontFamily: "'Noto Serif Tamil', serif" }}>
                {kural.urai1}
              </Typography>
              <Typography variant="body2" sx={{ color: "#000", fontWeight: 500 }}>
                <b>Translation:</b> {kural.translation}
              </Typography>
            </Box>
          ) : null}
        </Paper>
      </Box>

      <Divider sx={{ bgcolor: "#eee", height: 2, maxWidth: 80, mx: "auto", mb: 6, borderRadius: 2 }} />

      {/* Five Lands Radial Timeline (replaces previous static cards) */}
      <Box sx={{ px: { xs: 2, md: 4 }, py: 6, background: "#111", color: "#fff" }}>
        <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 4 }}>
            {i18n.language === 'ta' ? 'ஐந்து நிலங்கள்' : 'Five Tamil Lands'}
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 720, mx: 'auto', mb: 6, color: 'white', opacity: 0.85 }}>
            {i18n.language === 'ta'
              ? 'தமிழர் பண்பாட்டு அடையாளத்தை உருவாக்கிய பண்டைய ஐந்து நிலங்களை சுற்றிவரும் வட்ட வடிவ காட்சி.'
              : 'A circular interactive view of the classical five eco-cultural regions that shape Tamil heritage.'}
          </Typography>
          <FiveLandsTimeline />
        </Container>
      </Box>

      <Divider sx={{ bgcolor: "#eee", height: 2, maxWidth: 80, mx: "auto", mb: 6, borderRadius: 2 }} />

      {/* Footer */}
      <Box sx={{ mt: 8, py: 4, bgcolor: "#fff", textAlign: "center", borderTopLeftRadius: 32, borderTopRightRadius: 32, boxShadow: 3 }}>
        <Typography variant="h5" sx={{ color: "#111", fontWeight: 900, mb: 1 }}>
          மீன்கொடி | Meenkodi
        </Typography>
        <Typography variant="body2" sx={{ color: "#111", mb: 1 }}>
          © {new Date().getFullYear()} Meenkodi. All rights reserved.
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 1 }}>
          <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
            <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/facebook.svg" alt="Facebook" style={{ width: 28, filter: "grayscale(1) brightness(0.7)" }} />
          </a>
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
            <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/instagram.svg" alt="Instagram" style={{ width: 28, filter: "grayscale(1) brightness(0.7)" }} />
          </a>
          <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer">
            <img src="https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg" alt="YouTube" style={{ width: 28, filter: "grayscale(1) brightness(0.7)" }} />
          </a>
        </Box>
      </Box>

      {/* Interactive Map Modal */}
      <Modal open={mapModal.open} onClose={() => setMapModal({ open: false, land: null })}>
        <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "#fffdf6", p: 4, borderRadius: 4, boxShadow: 8, minWidth: 320, maxWidth: 420 }}>
          {mapModal.land && (
            <>
              <Typography variant="h5" sx={{ color: "primary.main", fontWeight: 700 }}>
                {typeof mapModal.land?.name === 'object' 
                  ? (mapModal.land.name?.[i18n.language] || '') 
                  : (mapModal.land?.name || '')}
              </Typography>
              {mapModal.land.image && (
                <img src={mapModal.land.image} alt={typeof mapModal.land?.name === 'object' ? (mapModal.land.name?.[i18n.language] || '') : (mapModal.land?.name || '')} style={{ width: "100%", borderRadius: 8, margin: "16px 0" }} />
              )}
              <Typography variant="body2" dangerouslySetInnerHTML={{ __html: getContent(mapModal.land.description) }} />
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" sx={{ color: "secondary.main" }}>{t('lands.gods', 'Gods')}: {mapModal.land.gods?.join(", ")}</Typography>
              <Typography variant="subtitle2" sx={{ color: "secondary.main" }}>{t('lands.people', 'People')}: {mapModal.land.people?.join(", ")}</Typography>
              <Box sx={{ mt: 1, mb: 1 }}>
                {mapModal.land.flora?.map((f) => (
                  <Chip key={f} label={f} size="small" sx={{ mr: 0.5, mb: 0.5, bgcolor: "#f5f5f5", color: "#111" }} />
                ))}
                {mapModal.land.fauna?.map((f) => (
                  <Chip key={f} label={f} size="small" sx={{ mr: 0.5, mb: 0.5, bgcolor: "#f5f5f5", color: "#111" }} />
                ))}
              </Box>
              <Button onClick={() => setMapModal({ open: false, land: null })} variant="outlined" sx={{ mt: 2, color: "#111", borderColor: "#111" }}>
                {t('actions.close', 'Close')}
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
}
