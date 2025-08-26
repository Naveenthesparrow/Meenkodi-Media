import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Card,
  CardMedia,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  VideoFile as VideoIcon,
  Image as ImageIcon,
} from "@mui/icons-material";

const MediaUpload = ({
  onImageChange,
  onVideoChange,
  onVideoLinkChange,
  onImageLinkChange,
  currentImage,
  currentVideo,
  currentVideoLink,
  currentImageLink,
  label = "Media Upload",
  showInputsOnly = false, // New prop to control what to show
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(currentImage || "");
  const [previewVideo, setPreviewVideo] = useState(currentVideo || "");
  const [videoLink, setVideoLink] = useState(currentVideoLink || "");
  const [imageLink, setImageLink] = useState(currentImageLink || "");

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, GIF, etc.)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    setError(null);

    // Clear any existing image link when uploading file
    if (imageLink) {
      setImageLink("");
      onImageLinkChange("");
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      // Try the upload endpoint first
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setPreviewImage(data.imageUrl);
      onImageChange(data.imageUrl);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Image upload failed:", err);
      setError(
        `Failed to upload image: ${err.message}. Please try using an image link instead.`
      );
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file (MP4, AVI, MOV, etc.)");
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setError("Video size must be less than 100MB");
      return;
    }

    setUploading(true);
    setError(null);

    // Clear any existing video link when uploading file
    if (videoLink) {
      setVideoLink("");
      onVideoLinkChange("");
    }

    const formData = new FormData();
    formData.append("video", file);

    try {
      // Try the upload endpoint first
      const response = await fetch("/api/upload/video", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setPreviewVideo(data.videoUrl);
      onVideoChange(data.videoUrl);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Video upload failed:", err);
      setError(
        `Failed to upload video: ${err.message}. Please try using a video link instead.`
      );
    } finally {
      setUploading(false);
    }
  };

  const handleVideoLinkChange = (event) => {
    const link = event.target.value;
    setVideoLink(link);
    onVideoLinkChange(link);

    // Clear uploaded video when using link
    if (link && previewVideo) {
      setPreviewVideo("");
      onVideoChange("");
    }
  };

  const handleImageLinkChange = (event) => {
    const link = event.target.value;
    setImageLink(link);
    onImageLinkChange(link);

    // Clear uploaded image when using link
    if (link && previewImage) {
      setPreviewImage("");
      onImageChange("");
    }
  };

  const clearImage = () => {
    setPreviewImage("");
    onImageChange("");
  };

  const clearVideo = () => {
    setPreviewVideo("");
    onVideoChange("");
  };

  const clearVideoLink = () => {
    setVideoLink("");
    onVideoLinkChange("");
  };

  const clearImageLink = () => {
    setImageLink("");
    onImageLinkChange("");
  };

  // Render only input fields for links
  if (showInputsOnly) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{ mb: 2, color: "#666", fontSize: "0.875rem" }}
        >
          Add media by providing direct links (URLs)
        </Typography>

        {/* Image Link Input */}
        <TextField
          fullWidth
          label="Image Link (URL)"
          value={imageLink}
          onChange={handleImageLinkChange}
          placeholder="https://example.com/image.jpg"
          helperText="Paste a direct image URL (JPG, PNG, GIF, etc.)"
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#ddd" },
              "&:hover fieldset": { borderColor: "#000" },
              "&.Mui-focused fieldset": { borderColor: "#000" },
            },
          }}
        />

        {/* Show image preview for link */}
        {imageLink && (
          <Card sx={{ maxWidth: 200, mb: 2 }}>
            <CardMedia
              component="img"
              height="120"
              image={imageLink}
              alt="Image Preview"
              sx={{ objectFit: "cover" }}
              onError={() => {
                setError("Invalid image URL. Please check the link.");
              }}
            />
          </Card>
        )}

        {/* Video Link Input */}
        <TextField
          fullWidth
          label="Video Link (YouTube, Vimeo, etc.)"
          value={videoLink}
          onChange={handleVideoLinkChange}
          placeholder="https://www.youtube.com/watch?v=... or direct video URL"
          helperText="YouTube, Vimeo, or direct video file URL"
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#ddd" },
              "&:hover fieldset": { borderColor: "#000" },
              "&.Mui-focused fieldset": { borderColor: "#000" },
            },
          }}
        />

        {/* Show error if any */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    );
  }
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: "#666" }}>
        Upload files directly from your device (alternative to using links
        above)
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Image Upload Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
          Upload Image from Device
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "#666", mb: 2, display: "block" }}
        >
          Supported formats: JPG, PNG, GIF, WEBP (Max: 5MB)
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <input
            accept="image/*"
            style={{ display: "none" }}
            id="image-upload"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="image-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={
                uploading ? <CircularProgress size={20} /> : <ImageIcon />
              }
              disabled={uploading}
              sx={{
                borderColor: "#000",
                color: "#000",
                "&:hover": {
                  borderColor: "#333",
                  backgroundColor: "#f5f5f5",
                },
                "&:disabled": {
                  borderColor: "#ccc",
                  color: "#ccc",
                },
              }}
            >
              {uploading ? "Uploading..." : "Choose Image File"}
            </Button>
          </label>
          {(previewImage || imageLink) && (
            <IconButton
              onClick={() => {
                clearImage();
                clearImageLink();
              }}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
        {(previewImage || imageLink) && (
          <Card sx={{ maxWidth: 200, mb: 2 }}>
            <CardMedia
              component="img"
              height="120"
              image={previewImage || imageLink}
              alt="Preview"
              sx={{ objectFit: "cover" }}
            />
          </Card>
        )}
      </Box>

      {/* Video Upload Section */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
          Upload Video from Device
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "#666", mb: 2, display: "block" }}
        >
          Supported formats: MP4, AVI, MOV, WEBM (Max: 100MB)
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <input
            accept="video/*"
            style={{ display: "none" }}
            id="video-upload"
            type="file"
            onChange={handleVideoUpload}
          />
          <label htmlFor="video-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={
                uploading ? <CircularProgress size={20} /> : <VideoIcon />
              }
              disabled={uploading}
              sx={{
                borderColor: "#000",
                color: "#000",
                "&:hover": {
                  borderColor: "#333",
                  backgroundColor: "#f5f5f5",
                },
                "&:disabled": {
                  borderColor: "#ccc",
                  color: "#ccc",
                },
              }}
            >
              {uploading ? "Uploading..." : "Choose Video File"}
            </Button>
          </label>
          {(previewVideo || videoLink) && (
            <IconButton
              onClick={() => {
                clearVideo();
                clearVideoLink();
              }}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
        {previewVideo && (
          <Card sx={{ maxWidth: 300, mb: 2 }}>
            <video
              controls
              style={{ width: "100%", height: "auto", maxHeight: "200px" }}
              src={previewVideo}
            />
          </Card>
        )}
        {videoLink && !previewVideo && (
          <Typography
            variant="caption"
            sx={{ color: "#666", mt: 1, display: "block" }}
          >
            Video Link: {videoLink}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default MediaUpload;
