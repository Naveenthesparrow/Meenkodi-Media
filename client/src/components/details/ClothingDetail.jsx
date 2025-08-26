import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Button,
} from "@mui/material";

export default function ClothingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [clothing, setClothing] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchClothingDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clothing/${id}`);
      if (!res.ok) throw new Error("Failed to fetch clothing detail");
      const data = await res.json();
      setClothing(data);
    } catch (err) {
      setClothing(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("ClothingDetail ID:", id); // Debugging the id parameter
    fetchClothingDetail();
  }, [id]);

  if (loading) return <CircularProgress />;
  if (!clothing)
    return <Typography variant="h6">Clothing not found</Typography>;

  return (
    <Box>
      <Card>
        <CardMedia
          component="img"
          height="200"
          image={clothing.image}
          alt={clothing.name}
        />
        <CardContent>
          <Typography variant="h5">{clothing.name}</Typography>
          <Typography variant="body1">{clothing.type}</Typography>
          <Typography variant="body2">{clothing.description}</Typography>
        </CardContent>
      </Card>
      <Button onClick={() => navigate(-1)}>Back</Button>
    </Box>
  );
}
