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

export default function GalleryDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [galleryItem, setGalleryItem] = useState(null);
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
    fetch(`/api/gallery/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setGalleryItem(data);
        setTitle(data.title);
        setDescription(data.description);
        setImageLink(data.imageLink || "");
        setImageUrl(data.imageUrl || "");
        setVideoUrl(data.videoUrl || "");
        setVideoLink(data.videoLink || "");
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load gallery item details");
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
      const res = await fetch(`/api/gallery/${id}`, {
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
        throw new Error(data.error || "Failed to update gallery item");
      }
      setEditMode(false);
      navigate(`/gallery`);
    } catch (err) {
      setError(err.message || "Failed to update gallery item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this gallery item?")) {
      try {
        await fetch(`/api/gallery/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        navigate(`/gallery`);
      } catch {
        setError("Failed to delete gallery item");
      }
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!galleryItem) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Gallery Item Not Found
        </Typography>
        <Typography variant="body1">
          The gallery item you are looking for does not exist or has been
          removed.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {editMode ? "Edit Gallery Item" : galleryItem.title}
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
            {galleryItem.description}
          </Typography>
          <MediaDisplay
            imageUrl={galleryItem.imageUrl}
            videoUrl={galleryItem.videoUrl}
            videoLink={galleryItem.videoLink}
            title={galleryItem.title}
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
