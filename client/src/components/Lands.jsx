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
import Comments from "./Comments";
import API_BASE_URL from "../utils/api";

export default function Lands({ user }) {
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

  // Dummy data for Lands
  const dummyLands = [
    {
      _id: "1",
      name: "Kurinji",
      type: "Mountain Landscape",
      image: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
      description:
        "The mountainous region of Tamil lands, characterized by its lush green forests, misty peaks, and rich biodiversity.",
      gods: ["Murugan"],
      people: ["Kuravar", "Kurathiyar"],
      poetry: ["<p><b>செம்முது பெண்டின் காதலஞ் சிறுவன்</b></p>"],
    },
    {
      _id: "2",
      name: "Mullai",
      type: "Forest and Pastoral Land",
      image: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
      description:
        "Forests and pastures, where cattle rearing was a primary occupation. It symbolizes patience and waiting.",
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
      {loading ? (
        <CircularProgress sx={{ color: "#111" }} />
      ) : (
        <Grid container spacing={4}>
          {lands.map((land) => (
            <Grid item xs={12} sm={4} key={land._id}>
              <Card
                sx={{
                  width: 350,  // Fixed width
                  height: 450, // Fixed height
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 4,
                  borderRadius: 4,
                  bgcolor: "#fff",
                  fontFamily: "Inter, Arial, sans-serif",
                }}
              >
                {land.image && (
                  <CardMedia
                    component="img"
                    image={land.image}
                    alt={land.name}
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
                  <Typography variant="h5">
                    {land.name} ({land.type})
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1 }}
                    dangerouslySetInnerHTML={{ __html: land.description }}
                  />
                  <Divider sx={{ my: 1, bgcolor: "#eee" }} />
                  <Typography variant="subtitle2" sx={{ color: "#111" }}>
                    Gods: {land.gods?.join(", ")}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: "#111" }}>
                    People: {land.people?.join(", ")}
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
                  <Comments
                    user={user}
                    relatedType="Land"
                    relatedId={land._id}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
