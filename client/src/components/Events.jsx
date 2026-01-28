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
      const response = await fetch(`/api/events`);
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
        ? `/api/events/${currentEvent._id}`
        : `/api/events`;

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
        const response = await fetch(`/api/events/${id}`, {
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
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>

      <SEO {...pageSEO.events} />
      {/* Unique Heading Section */}
      <Box
        sx={{
          mb: { xs: 6, md: 5 },
          mt: { xs: 2, md: 2 }, // nudge heading slightly down on all screens
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
              // On mobile stack under the title (static flow). On md+ keep absolute at right center
              position: { xs: 'static', md: 'absolute' },
              right: { md: 0 },
              top: { md: '50%' },
              transform: { xs: 'none', md: 'translateY(-50%)' },
              transition: 'all 0.3s ease',
              mt: { xs: 2, md: 0 },
              display: 'flex',
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
              width: { xs: '100%', md: 'auto' },
              // Keep hover effect only on larger screens
              '&:hover': {
                '@media (min-width:900px)': {
                  transform: 'translateY(-50%) scale(1.05)',
                },
                '& button': {
                  '@media (min-width:900px)': {
                    boxShadow: '0 8px 15px rgba(0,0,0,0.2)',
                    transform: 'translateY(-3px)',
                  }
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
                      <span>{event.date ? new Date(event.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</span>
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

      {/* Back Button */}
      <Box sx={{ mt: 6, mb: 4, textAlign: 'center' }}>
        <Button
          onClick={() => navigate('/')}
          variant="outlined"
          sx={{
            color: '#000',
            borderColor: '#000',
            borderWidth: 2,
            borderRadius: 0,
            px: 4,
            py: 1.5,
            fontWeight: 700,
            fontFamily: 'Georgia, serif',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            '&:hover': {
              bgcolor: '#000',
              borderColor: '#000',
              color: '#fff',
            }
          }}
        >
          ← {t('actions.backToHome', 'Back to Home')}
        </Button>
      </Box>
      </Container>
    </Box>
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
    background: linear-gradient(315deg, #DAA520, #8B0000);
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
    opacity: 1;
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
    left: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    transform: scale(0);
    transition: 0.45s ease;
    width: 100%;
    padding: 22px;
    min-height: 110px;
    box-sizing: border-box;
  }

  .card:hover .content {
    transform: scale(1);
    bottom: 18px;
  }

  .content .title {
    position: relative;
    color: #333;
    font-weight: 600;
    line-height: 1.25em;
    font-size: 1.1em;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-align: left;
    margin-bottom: 12px;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .content .title span {
    font-weight: 300;
    font-size: 0.85em;
    display: block;
    margin-top: 6px;
    color: #8B0000;
  }

  .content .sci {
    position: absolute;
    bottom: 12px;
    right: 12px;
    display: flex;
    gap: 8px;
  }

  .content .sci button {
    width: 36px;
    height: 36px;
    padding: 6px;
  }
`;