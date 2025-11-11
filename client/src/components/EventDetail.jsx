import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
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
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {editMode ? "Edit Event" : getContent(event.title)}
      </Typography>
      {editMode ? (
        <Box>
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
            minRows={2}
            sx={{ mb: 2 }}
          />
          <TextField
            label="விவரம் (தமிழ்)"
            value={description?.ta || ''}
            onChange={(e) => setDescription({ ...description, ta: e.target.value })}
            fullWidth
            multiline
            minRows={2}
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
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={submitting}
            sx={{ mt: 2 }}
          >
            {submitting ? "Saving..." : "Save"}
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {getContent(event.description)}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {event.date}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {getContent(event.location)}
          </Typography>
          <MediaDisplay
            imageUrl={event.imageUrl}
            videoUrl={event.videoUrl}
            videoLink={event.videoLink}
            title={getContent(event.title)}
          />
          {user && user.role === "admin" && (
            <Box sx={{ mt: 2 }}>
              <Button
                onClick={() => setEditMode(true)}
                variant="contained"
                sx={{ mr: 2 }}
              >
                Edit
              </Button>
              <Button onClick={handleDelete} variant="contained" color="error">
                Delete
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
