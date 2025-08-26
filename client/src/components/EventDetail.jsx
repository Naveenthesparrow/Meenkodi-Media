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

export default function EventDetail({ user }) {
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
        setTitle(data.title);
        setDescription(data.description);
        setDate(data.date ? data.date.substring(0, 10) : "");
        setLocation(data.location);
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
        {editMode ? "Edit Event" : event.title}
      </Typography>
      {editMode ? (
        <Box>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
            {event.description}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {event.date}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {event.location}
          </Typography>
          <MediaDisplay
            imageUrl={event.imageUrl}
            videoUrl={event.videoUrl}
            videoLink={event.videoLink}
            title={event.title}
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
