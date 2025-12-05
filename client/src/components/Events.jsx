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
  IconButton,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Add, Edit, Delete } from '@mui/icons-material';
import MediaUpload from './common/MediaUpload';
import SEO, { pageSEO } from './common/SEO';
import API_BASE_URL from "../utils/api";
import { useBilingualContent } from '../utils/bilingualContent';
import { useTranslation } from 'react-i18next';

import styled from 'styled-components';

export default function Events({ user }) {
  const getContent = useBilingualContent();
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    imageLink: '',
    imageUrl: '',
    videoLink: '',
    videoUrl: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events`);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message);
      setLoading(false);
      setEvents(dummyEvents); // Fallback to dummy data
    }
  };

  // Dummy data for Events
  const dummyEvents = [
    {
      _id: "1",
      title: "Pongal Celebrations",
      description: "Annual harvest festival celebrated by Tamils worldwide.",
      date: "2024-01-15",
      location: "Chennai",
      imageUrl: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
      imageLink: "",
      videoLink: "",
      videoUrl: "",
      createdAt: new Date(),
    },
    {
      _id: "2",
      title: "Tamil New Year",
      description: "Traditional celebration of the Tamil New Year, Puthandu.",
      date: "2024-04-14",
      location: "Worldwide",
      imageUrl: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
      imageLink: "",
      videoLink: "",
      videoUrl: "",
      createdAt: new Date(),
    },
  ];

  const handleAdd = () => {
    setCurrentEvent({
      title: '',
      description: '',
      date: '',
      location: '',
      imageLink: '',
      imageUrl: '',
      videoLink: '',
      videoUrl: '',
    });
    setOpenDialog(true);
  };

  const handleEdit = (event) => {
    setCurrentEvent(event);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const method = currentEvent._id ? 'PUT' : 'POST';
      const url = currentEvent._id
        ? `${API_BASE_URL}/api/events/${currentEvent._id}`
        : `${API_BASE_URL}/api/events`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(currentEvent),
      });

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      const savedEvent = await response.json();

      if (method === 'POST') {
        setEvents([...events, savedEvent]);
      } else {
        setEvents(events.map(event =>
          event._id === savedEvent._id ? savedEvent : event
        ));
      }

      setOpenDialog(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to delete event');
        }

        setEvents(events.filter(event => event._id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      <SEO {...pageSEO.events} />
      {/* Unique Heading Section */}
      <Box
        sx={{
          mb: 6,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            color: '#8B0000',
            position: 'relative',
            display: 'inline-block',
            letterSpacing: -1,
            padding: '0 10px',
            transition: 'all 0.3s ease',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '-50px',
              width: '40px',
              height: '3px',
              backgroundColor: '#DAA520',
              transform: 'translateY(-50%)',
              transition: 'all 0.3s ease',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              right: '-50px',
              width: '40px',
              height: '3px',
              backgroundColor: '#DAA520',
              transform: 'translateY(-50%)',
              transition: 'all 0.3s ease',
            },
            '&:hover': {
              transform: 'scale(1.05)',
              '&::before': {
                width: '60px',
                left: '-70px',
              },
              '&::after': {
                width: '60px',
                right: '-70px',
              },
            },
          }}
        >
          {t('events.title', 'Events')}
        </Typography>

        {user && user.role === "admin" && (
          <Box
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-50%) scale(1.05)',
                '& button': {
                  boxShadow: '0 8px 15px rgba(0,0,0,0.2)',
                  transform: 'translateY(-3px)',
                }
              }
            }}
          >
            <Button
              onClick={handleAdd}
              variant="contained"
              startIcon={<Add />}
              sx={{
                bgcolor: "#000",
                color: "#fff",
                transition: 'all 0.3s ease',
                "&:hover": {
                  bgcolor: "#333",
                  boxShadow: '0 8px 15px rgba(0,0,0,0.2)',
                  transform: 'translateY(-3px)',
                },
                borderRadius: 0,
                px: 3,
              }}
            >
              {t('events.add', 'Add Event')}
            </Button>
          </Box>
        )}
      </Box>

      <Grid
        container
        spacing={4}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
        }}
      >
        {events.map((event, index) => (
          <Fade
            in={true}
            timeout={500 + index * 200}
            key={event._id}
          >
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}
            >
              <StyledWrapper>
                <div className="card" onClick={() => navigate(`/events/${event._id}`)}>
                  <b />
                  <img
                    src={event.imageUrl || event.imageLink || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600' viewBox='0 0 1200 600'%3E%3Crect fill='%23cccccc' width='1200' height='600'%3E%3C/rect%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='100px' fill='%23333333'%3ENo Image%3C/text%3E%3C/svg%3E"}
                    alt={getContent(event.title)}
                  />
                  <div className="content">
                    <p className="title">
                      {getContent(event.title)}
                      <br />
                      <span>{event.date}</span>
                    </p>
                    {/* Admin Controls */}
                    {user && user.role === "admin" && (
                      <div className="sci" onClick={(e) => e.stopPropagation()}>
                        <IconButton
                          onClick={() => handleEdit(event)}
                          size="small"
                          sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.5)', mr: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(event._id)}
                          size="small"
                          sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </div>
                    )}
                  </div>
                </div>
              </StyledWrapper>
            </Grid>
          </Fade>
        ))}
      </Grid>

      {/* Edit/Add Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentEvent._id ? t('events.edit', 'Edit Event') : t('events.addNew', 'Add New Event')}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            sx={{ mb: 2 }}
            value={currentEvent.title}
            onChange={(e) => setCurrentEvent({ ...currentEvent, title: e.target.value })}
          />
          <TextField
            label="Date"
            type="date"
            fullWidth
            sx={{ mb: 2 }}
            value={currentEvent.date}
            onChange={(e) => setCurrentEvent({ ...currentEvent, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Location"
            fullWidth
            sx={{ mb: 2 }}
            value={currentEvent.location}
            onChange={(e) => setCurrentEvent({ ...currentEvent, location: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            minRows={3}
            sx={{ mb: 2 }}
            value={currentEvent.description}
            onChange={(e) => setCurrentEvent({ ...currentEvent, description: e.target.value })}
          />
          <MediaUpload
            onImageLinkChange={(link) => setCurrentEvent({ ...currentEvent, imageLink: link })}
            onVideoLinkChange={(link) => setCurrentEvent({ ...currentEvent, videoLink: link })}
            onImageChange={(url) => setCurrentEvent({ ...currentEvent, imageUrl: url })}
            onVideoChange={(url) => setCurrentEvent({ ...currentEvent, videoUrl: url })}
            currentImageLink={currentEvent.imageLink}
            currentVideoLink={currentEvent.videoLink}
            currentImage={currentEvent.imageUrl}
            currentVideo={currentEvent.videoUrl}
            label="Media Links"
            showInputsOnly={true}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

const StyledWrapper = styled.div`
  .card {
    position: relative;
    width: 300px;
    height: 400px;
    background: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    overflow: hidden;
  }

  .card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(315deg, #DAA520, #8B0000); /* Gold to Dark Red */
  }

  .card::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(315deg, #DAA520, #8B0000);
    filter: blur(30px);
  }

  .card b {
    position: absolute;
    inset: 6px;
    background: #fff;
    z-index: 2;
  }

  .card img {
    position: absolute;
    z-index: 3;
    scale: 0.8;
    opacity: 0.25;
    transition: 0.5s;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .card:hover img {
    scale: 0.5;
    opacity: 0.9;
    transform: translateY(-70px);
  }

  .card .content {
    position: absolute;
    z-index: 3;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    transform: scale(0);
    transition: 0.5s;
    width: 100%;
    padding: 20px;
  }

  .card:hover .content {
    transform: scale(1);
    bottom: 25px;
  }

  .content .title {
    position: relative;
    color: #333;
    font-weight: 500;
    line-height: 1.2em;
    font-size: 1.2em;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 10px;
  }

  .content .title span {
    font-weight: 300;
    font-size: 0.70em;
    display: block;
    margin-top: 5px;
    color: #8B0000;
  }

  .content .sci {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 5px;
  }
`;