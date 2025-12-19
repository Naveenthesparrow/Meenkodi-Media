import React, { useState, useId, useEffect } from "react";
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
  Image as ImageIcon,
} from "@mui/icons-material";
import API_BASE_URL from "../../utils/api";

const MediaUpload = ({
  onImageChange,
  onImageLinkChange,
  onVideoChange,
  onVideoLinkChange,
  currentImage,
  currentImageLink,
  currentVideo,
  currentVideoLink,
  label = "Media Upload",
  showInputsOnly = false,
}) => {
  const reactId = useId();
  const inputId = `media-upload-${reactId.replace(/:/g, "")}`;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(currentImage || "");
  const [imageLink, setImageLink] = useState(currentImageLink || "");
  const [videoLink, setVideoLink] = useState(currentVideoLink || "");
  const [videoUrlState, setVideoUrlState] = useState(currentVideo || "");
  const [lastServerUrl, setLastServerUrl] = useState(null); // last returned server URL for retry attempts

  useEffect(() => {
    setPreviewImage(currentImage || "");
  }, [currentImage]);

  useEffect(() => {
    setImageLink(currentImageLink || "");
  }, [currentImageLink]);

  useEffect(() => {
    setVideoLink(currentVideoLink || "");
  }, [currentVideoLink]);

  useEffect(() => {
    setVideoUrlState(currentVideo || "");
  }, [currentVideo]);

  const toAbsoluteMediaUrl = (url) => {
    if (!url) return url;
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('data:')) return url;
    const withLeading = url.startsWith("/") ? url : `/${url}`;
    return `${API_BASE_URL}${withLeading}`;
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = `Unsupported file type: ${file.type}. Allowed types: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`;
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = "Image size must be less than 5MB";
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    setUploading(true);
    setError(null);

    if (imageLink) {
      setImageLink("");
      onImageLinkChange("");
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      // Read file as data URL for immediate preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result); // Show local preview immediately
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
      };
      reader.readAsDataURL(file);

      const uploadResponse = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      console.log("Upload Response Status:", uploadResponse.status);
      const responseText = await uploadResponse.text();
      console.log("Upload Response Full Text:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        throw new Error(`Invalid server response: ${responseText}`);
      }

      if (!uploadResponse.ok) {
        const errorDetails = data.error || data.details || `Upload failed: ${uploadResponse.status}`;
        console.error("Server Upload Error:", { status: uploadResponse.status, errorDetails, fullResponse: data });
        throw new Error(errorDetails);
      }

      const imageUrl = data.imageUrl || data.fullPath;
      if (!imageUrl) {
        throw new Error("No image URL returned from server");
      }

      let normalizedUrl;
      if (imageUrl.startsWith('http') || imageUrl.startsWith('//') || imageUrl.startsWith('data:')) {
        normalizedUrl = imageUrl;
      } else {
        normalizedUrl = imageUrl.startsWith('/') ? imageUrl : `/uploads/gallery/${imageUrl}`;
      }

      const absoluteUrl = toAbsoluteMediaUrl(normalizedUrl);

      // Pass server URL to parent for saving
      onImageChange(absoluteUrl);
      setError(null);
      setLastServerUrl(null);
    } catch (err) {
      console.error("Complete Image Upload Error:", { message: err.message, name: err.name, stack: err.stack });
      const errorMessage = `Upload failed: ${err.message}`;
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleImageLinkChange = (event) => {
    const link = event.target.value;
    setImageLink(link);
    if (onImageLinkChange) onImageLinkChange(link);
    if (link && previewImage) {
      setPreviewImage("");
      if (onImageChange) onImageChange("");
    }
  };

  const handleVideoLinkChange = (event) => {
    const link = event.target.value;
    setVideoLink(link);
    if (onVideoLinkChange) onVideoLinkChange(link);
    if (link && videoUrlState) {
      setVideoUrlState("");
      if (onVideoChange) onVideoChange("");
    }
  };

  const clearImage = () => {
    setPreviewImage("");
    if (onImageChange) onImageChange("");
  };

  const clearImageLink = () => {
    setImageLink("");
    if (onImageLinkChange) onImageLinkChange("");
  };

  const clearVideoLink = () => {
    setVideoLink("");
    if (onVideoLinkChange) onVideoLinkChange("");
  };

  if (showInputsOnly) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 2, color: "#666", fontSize: "0.875rem" }}>
          Add media by providing direct links (URLs)
        </Typography>

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

        {/* Video Link input (videos are link-only) */}
        <TextField
          fullWidth
          label="Video Link (URL)"
          value={videoLink}
          onChange={handleVideoLinkChange}
          placeholder="https://youtu.be/abc123 or https://vimeo.com/123456"
          helperText="Add a video URL (YouTube/Vimeo). File uploads for videos are not supported."
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "#ddd" },
              "&:hover fieldset": { borderColor: "#000" },
              "&.Mui-focused fieldset": { borderColor: "#000" },
            },
          }}
        />

        {videoLink && (
          <Card sx={{ p: 1, mb: 2 }}>
            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
              <a href={videoLink} target="_blank" rel="noopener noreferrer">Open video link</a>
            </Typography>
          </Card>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
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
        Upload files directly from your device (alternative to using links above)
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
          Upload Image from Device
        </Typography>
        <Typography variant="caption" sx={{ color: "#666", mb: 2, display: "block" }}>
          Supported formats: JPG, PNG, GIF, WEBP (Max: 5MB)
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <input accept="image/*" style={{ display: "none" }} id={inputId} type="file" onChange={handleImageUpload} />
          <label htmlFor={inputId}>
            <Button variant="outlined" component="span" startIcon={uploading ? <CircularProgress size={20} /> : <ImageIcon />} disabled={uploading} sx={{ borderColor: "#000", color: "#000", "&:hover": { borderColor: "#333", backgroundColor: "#f5f5f5" }, "&:disabled": { borderColor: "#ccc", color: "#ccc" } }}>
              {uploading ? "Uploading..." : "Choose Image File"}
            </Button>
          </label>
          {(previewImage || imageLink) && (
            <IconButton onClick={() => { clearImage(); clearImageLink(); }} color="error" size="small">
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
        {(previewImage || imageLink) && (
          <Card sx={{ maxWidth: 200, mb: 2 }}>
            <CardMedia
              component="img"
              height="120"
              image={toAbsoluteMediaUrl(previewImage || imageLink)}
              alt="Preview"
              sx={{ objectFit: "cover", backgroundColor: '#f0f0f0' }}
              onError={(e) => {
                console.error('Image preview failed to load:', previewImage || imageLink);
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120' viewBox='0 0 200 120'%3E%3Crect fill='%23cccccc' width='200' height='120'/%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='20px' fill='%23333333'%3EImage Not Available%3C/text%3E%3C/svg%3E";
                e.target.style.display = 'block';
              }}
            />
          </Card>
        )}

        {/* Video link area (videos are links only) */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            Add Video Link
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
            Add a YouTube or Vimeo link. File uploads for videos are not supported.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              fullWidth
              label="Video Link (URL)"
              value={videoLink}
              onChange={handleVideoLinkChange}
              placeholder="https://youtu.be/abc123"
              helperText="YouTube/Vimeo links only"
            />
            {videoLink && (
              <IconButton onClick={() => clearVideoLink()} size="small">
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
          {videoLink && (
            <Card sx={{ p: 1, mt: 2, maxWidth: 400 }}>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                <a href={videoLink} target="_blank" rel="noopener noreferrer">Open video link</a>
              </Typography>
            </Card>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MediaUpload;
