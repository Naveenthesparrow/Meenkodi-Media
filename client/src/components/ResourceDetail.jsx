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

export default function ResourceDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/resources/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setResource(data);
        setTitle(data.title);
        setDescription(data.description);
        setImageLink(data.imageLink || "");
        setImageUrl(data.imageUrl || "");
        setVideoUrl(data.videoUrl || "");
        setVideoLink(data.videoLink || "");
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load resource details");
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
      const res = await fetch(`/api/resources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          description,
          imageLink,
          imageUrl,
          videoUrl,
          videoLink,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update resource");
      }
      setEditMode(false);
      navigate(`/resources`);
    } catch (err) {
      setError(err.message || "Failed to update resource");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        await fetch(`/api/resources/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        navigate(`/resources`);
      } catch {
        setError("Failed to delete resource");
      }
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!resource) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Resource Not Found
        </Typography>
        <Typography variant="body1">
          The resource you are looking for does not exist or has been removed.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {editMode ? "Edit Resource" : resource.title}
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
            {resource.description}
          </Typography>
          <MediaDisplay
            imageUrl={resource.imageUrl}
            videoUrl={resource.videoUrl}
            videoLink={resource.videoLink}
            title={resource.title}
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
