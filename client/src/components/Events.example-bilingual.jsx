import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Button, 
  Box,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useBilingualContent } from '../utils/bilingualContent';
import API_BASE_URL from "../utils/api";

export default function Events({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const getContent = useBilingualContent(); // ✨ New: Get bilingual content hook

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching events:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <Box sx={{ textAlign: 'center', mt: 4 }}>Loading...</Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Tamil Events
      </Typography>

      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="200"
                image={event.imageUrl || '/placeholder-event.jpg'}
                alt={getContent(event.title)} // ✨ Use bilingual content
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {getContent(event.title)} {/* ✨ Automatically shows English or Tamil */}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {new Date(event.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  📍 {getContent(event.location)} {/* ✨ Bilingual location */}
                </Typography>
                <Typography variant="body2">
                  {getContent(event.description)?.substring(0, 120)}... {/* ✨ Bilingual description */}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  component={Link}
                  to={`/events/${event._id}`}
                  variant="outlined"
                  fullWidth
                >
                  READ MORE
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
