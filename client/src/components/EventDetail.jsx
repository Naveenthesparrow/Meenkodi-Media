import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from "@mui/material";
import { CalendarMonth, LocationOn, ArrowBack } from "@mui/icons-material";
import MediaUpload from "./common/MediaUpload";
import MediaDisplay from "./common/MediaDisplay";
import { useParams, useNavigate } from "react-router-dom";
import { useBilingualContent } from '../utils/bilingualContent';

export default function EventDetail({ user }) {
  const getContent = useBilingualContent();
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
        // Handle both old string format and new bilingual object format
        setTitle(typeof data.title === 'object' ? data.title : { en: data.title || '', ta: data.title || '' });
        setDescription(typeof data.description === 'object' ? data.description : { en: data.description || '', ta: data.description || '' });
        setDate(data.date ? data.date.substring(0, 10) : "");
        setLocation(typeof data.location === 'object' ? data.location : { en: data.location || '', ta: data.location || '' });
        setImageLink(data.imageLink || "");
        setImageUrl(data.imageUrl || "");
        setVideoUrl(data.videoUrl || "");
        setVideoLink(data.videoLink || "");
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load event details");
        setLoading(false);
      });
  }, [id]);

  const handleSave = async () => {
    setSubmitting(true);
    setError(null);
    if (!title.trim()) {
      setError("Title is required");
      setSubmitting(false);
      return;
    }
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          description,
          date,
          location,
          imageLink,
          imageUrl,
          videoUrl,
          videoLink,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update event");
      }
      setEditMode(false);
      navigate(`/events`);
    } catch (err) {
      setError(err.message || "Failed to update event");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await fetch(`/api/events/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        navigate(`/events`);
      } catch {
        setError("Failed to delete event");
      }
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!event) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Event Not Found
        </Typography>
        <Typography variant="body1">
          The event you are looking for does not exist or has been removed.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)',
      py: { xs: 3, md: 5 },
    }}>
      <Box sx={{
        maxWidth: 1200,
        mx: "auto",
        px: { xs: 2, md: 3 },
      }}>
        {editMode ? (
          /* Edit Mode */
          <Box sx={{
            bgcolor: '#fff',
            p: { xs: 3, md: 4 },
            boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
            borderTop: '4px solid #8B0000',
          }}>
            <Typography variant="h4" gutterBottom sx={{ fontFamily: 'Georgia, serif', color: '#8B0000', mb: 3 }}>
              Edit Event
            </Typography>
            <TextField
              label="Title (English)"
              value={title?.en || ''}
              onChange={(e) => setTitle({ ...title, en: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="தலைப்பு (தமிழ்)"
              value={title?.ta || ''}
              onChange={(e) => setTitle({ ...title, ta: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Location (English)"
              value={location?.en || ''}
              onChange={(e) => setLocation({ ...location, en: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="இடம் (தமிழ்)"
              value={location?.ta || ''}
              onChange={(e) => setLocation({ ...location, ta: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Description (English)"
              value={description?.en || ''}
              onChange={(e) => setDescription({ ...description, en: e.target.value })}
              fullWidth
              multiline
              minRows={6}
              sx={{ mb: 2 }}
            />
            <TextField
              label="விவரம் (தமிழ்)"
              value={description?.ta || ''}
              onChange={(e) => setDescription({ ...description, ta: e.target.value })}
              fullWidth
              multiline
              minRows={6}
              sx={{ mb: 2 }}
            />
            <MediaUpload
              onImageLinkChange={setImageLink}
              onVideoLinkChange={setVideoLink}
              onImageChange={setImageUrl}
              onVideoChange={setVideoUrl}
              currentImageLink={imageLink}
              currentVideoLink={videoLink}
              currentImage={imageUrl}
              currentVideo={videoUrl}
              label="Media Links"
              showInputsOnly={true}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                onClick={handleSave}
                variant="contained"
                disabled={submitting}
                sx={{
                  bgcolor: '#8B0000',
                  '&:hover': { bgcolor: '#6d0000' },
                  borderRadius: 0,
                  px: 4,
                }}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                onClick={() => setEditMode(false)}
                variant="outlined"
                sx={{
                  borderColor: '#000',
                  color: '#000',
                  borderRadius: 0,
                  '&:hover': { borderColor: '#000', bgcolor: 'rgba(0,0,0,0.05)' }
                }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          /* Display Mode - Side by Side Layout */
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1.2fr' },
            gap: { xs: 3, md: 4 },
          }}>
            {/* Left Column - Image & Date/Location */}
            <Box>
              {/* Image Section */}
              {event.imageUrl && (
                <Box sx={{
                  width: '100%',
                  height: { xs: 300, md: 450 },
                  mb: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  bgcolor: '#f0f0f0',
                  border: '4px solid #fff',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                }}>
                  <Box
                    component="img"
                    src={event.imageUrl}
                    alt={getContent(event.title)}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#999;font-family:Georgia,serif;">Image not available</div>';
                    }}
                  />
                </Box>
              )}

              {/* Date & Location Cards */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Date Card */}
                {event.date && (
                  <Box sx={{
                    bgcolor: '#fff',
                    p: 3,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2.5,
                    borderLeft: '5px solid #8B0000',
                  }}>
                    <Box sx={{
                      minWidth: 70,
                      height: 70,
                      bgcolor: '#8B0000',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </Typography>
                      <Typography sx={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1 }}>
                        {new Date(event.date).getDate()}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        {new Date(event.date).getFullYear()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="overline" sx={{ color: '#999', fontSize: '0.7rem', letterSpacing: 1, display: 'block', lineHeight: 1.2, mb: 0.5 }}>
                        EVENT DATE
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#000', fontSize: '1.1rem', lineHeight: 1.3 }}>
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Location Card */}
                {getContent(event.location) && (
                  <Box sx={{
                    bgcolor: '#fff',
                    p: 3,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2.5,
                    borderLeft: '5px solid #DAA520',
                  }}>
                    <Box sx={{
                      minWidth: 70,
                      height: 70,
                      bgcolor: 'rgba(218,165,32,0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <LocationOn sx={{ color: '#DAA520', fontSize: '2.5rem' }} />
                    </Box>
                    <Box>
                      <Typography variant="overline" sx={{ color: '#999', fontSize: '0.7rem', letterSpacing: 1, display: 'block', lineHeight: 1.2, mb: 0.5 }}>
                        LOCATION
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#000', fontSize: '1.1rem', lineHeight: 1.3 }}>
                        {getContent(event.location)}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Right Column - Content */}
            <Box sx={{
              bgcolor: '#fff',
              p: { xs: 3, md: 4 },
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              height: 'fit-content',
            }}>
              {/* Category Badge */}
              <Chip
                label="CULTURAL EVENT"
                sx={{
                  mb: 2,
                  bgcolor: '#8B0000',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  letterSpacing: 1.5,
                  height: 26,
                  borderRadius: 0,
                }}
              />

              {/* Title */}
              <Typography
                variant="h3"
                sx={{
                  fontFamily: 'Georgia, serif',
                  fontWeight: 700,
                  color: '#000',
                  mb: 3,
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                  lineHeight: 1.2,
                  letterSpacing: -0.5,
                  pb: 3,
                  borderBottom: '3px solid #8B0000',
                }}
              >
                {getContent(event.title)}
              </Typography>

              {/* Description Section */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#8B0000',
                    mb: 2,
                    fontSize: '1.1rem',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Event Details
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.8,
                    fontSize: '1rem',
                    color: '#444',
                    whiteSpace: 'pre-line',
                  }}
                >
                  {getContent(event.description)}
                </Typography>
              </Box>

              {/* Media Display */}
              {(event.videoUrl || event.videoLink) && (
                <Box sx={{ mt: 4, pt: 4, borderTop: '2px solid #f0f0f0' }}>
                  <MediaDisplay
                    imageUrl={event.imageUrl}
                    videoUrl={event.videoUrl}
                    videoLink={event.videoLink}
                    title={getContent(event.title)}
                  />
                </Box>
              )}

              {/* Admin Actions */}
              {user && user.role === "admin" && (
                <Box sx={{
                  mt: 4,
                  pt: 4,
                  borderTop: '2px solid #f0f0f0',
                  display: 'flex',
                  gap: 2,
                }}>
                  <Button
                    onClick={() => setEditMode(true)}
                    variant="contained"
                    sx={{
                      bgcolor: '#8B0000',
                      '&:hover': { bgcolor: '#6d0000' },
                      borderRadius: 0,
                      px: 3,
                      flex: 1,
                    }}
                  >
                    Edit Event
                  </Button>
                  <Button
                    onClick={handleDelete}
                    variant="outlined"
                    color="error"
                    sx={{
                      borderRadius: 0,
                      borderWidth: 2,
                      px: 3,
                      flex: 1,
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>

      {/* Standardized Back Button */}
      <Box sx={{ mt: 6, mb: 2, textAlign: 'center' }}>
        <Button
          onClick={() => navigate('/events')}
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
          ← Back to Events
        </Button>
      </Box>
    </Box>
  );
}
