import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Divider,
  CircularProgress,
  Slider,
} from "@mui/material";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Link as RouterLink } from "react-router-dom";
// import Comments from "./Comments"; // Removed: Comments are now on detail page
import SEO, { pageSEO } from './common/SEO';
import API_BASE_URL from "../utils/api";
import { useTranslation } from 'react-i18next';

export default function Lands({ user }) {
  const { t, i18n } = useTranslation();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(300); // Placeholder for year slider

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/lands`)
      .then((res) => res.json())
      .then((data) => {
        setLands(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching lands:", err);
        setLands(dummyLands); // Fallback to dummy data
        setLoading(false);
      });
  }, []);

  // Helper: extract both EN and TA from bilingual or legacy string
  const both = (val) => {
    if (!val) return { en: "", ta: "" };
    if (typeof val === "string") return { en: val, ta: "" };
    return { en: val.en || "", ta: val.ta || "" };
  };

  // Display only active language (NO fallback to other language to keep view pure)
  const currentLang = i18n.language || 'en';
  const display = (val) => {
    const b = both(val);
    return b[currentLang] || ""; // do not fallback
  };

  // Dummy data for Lands
  const dummyLands = [
    {
      _id: "1",
      name: { en: "Kurinji", ta: "குறிஞ்சி" },
      type: "Mountain Landscape",
      image:
        "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
      description: {
        en: "The mountainous region of Tamil lands, characterized by its lush green forests, misty peaks, and rich biodiversity.",
        ta: "மலையும் காடும் சூழ்ந்த குளிர்ந்த நிலம்; 12 ஆண்டுக்கு ஒருமுறை மலரும் குறிஞ்சி மலர், தேன்சேகரர்கள் வாழ்வு."
      },
      gods: ["Murugan"],
      people: ["Kuravar", "Kurathiyar"],
      poetry: ["<p><b>செம்முது பெண்டின் காதலஞ் சிறுவன்</b></p>"],
    },
    {
      _id: "2",
      name: { en: "Mullai", ta: "முல்லை" },
      type: "Forest and Pastoral Land",
      image:
        "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
      description: {
        en: "Forests and pastures, where cattle rearing was a primary occupation. It symbolizes patience and waiting.",
        ta: "காடும் பசுமை நிலமும்; மாடு மேய்ப்போர் வாழ்வு. காத்திருக்கை உணர்வு பிரதானம்."
      },
      gods: ["Mayon (Vishnu)"],
      people: ["Ayars", "Ayichiyar"],
      poetry: ["<p><b>பேய்போலத் திரிந்து பசிதீராப் பசுங்கூழ்</b></p>"],
    },
  ];

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        mt: 4,
        p: 2,
        bgcolor: "#fff",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <SEO {...pageSEO.lands} />
      {/* Page Title */}
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 3, textAlign: 'center' }}>
        {t('lands.title', 'Lands')}
      </Typography>
      {loading ? (
        <CircularProgress sx={{ color: "#111" }} />
      ) : (
        <Grid container spacing={4}>
          {lands.map((land) => (
            <Grid item xs={12} sm={4} key={land._id}>
              <Card
                component={RouterLink}
                to={`/explore/lands/${land._id}`}
                sx={{
                  width: { xs: '100%', sm: 350 },
                  maxWidth: '100%',
                  textDecoration: 'none', // Remove link underline
                  // height: 450, // Removed fixed height for responsiveness
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 4,
                  borderRadius: 4,
                  bgcolor: "#fff",
                  fontFamily: "Inter, Arial, sans-serif",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 8,
                  }
                }}
              >
                {land.image && (
                  <CardMedia
                    component="img"
                    image={land.image}
                    alt={`${display(land.name) || "Land"}`}
                    sx={{
                      height: 220,
                      objectFit: "cover",
                      width: '100%',
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', land.image);
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E";
                      e.target.style.display = 'block';
                    }}
                  />
                )}
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {display(land.name)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666', mb: 1 }}>
                    {t('lands.type', 'Landscape Type')}: {land.type}
                  </Typography>
                  {display(land.description) && (
                    <Typography
                      variant="body2"
                      sx={{ mb: 1 }}
                      dangerouslySetInnerHTML={{ __html: display(land.description) }}
                    />
                  )}
                  <Divider sx={{ my: 1, bgcolor: "#eee" }} />
                  <Typography variant="subtitle2" sx={{ color: "#111" }}>
                    {t('lands.gods', 'Gods')}: {land.gods?.join(", ")}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: "#111" }}>
                    {t('lands.people', 'People')}: {land.people?.join(", ")}
                  </Typography>
                  <Divider sx={{ my: 1, bgcolor: "#eee" }} />
                  {land.poetry?.map((line, idx) => (
                    <Typography
                      key={idx}
                      variant="body2"
                      sx={{ fontStyle: "italic" }}
                      dangerouslySetInnerHTML={{ __html: line }}
                    />
                  ))}
                  {/* Comments removed from list view */}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
