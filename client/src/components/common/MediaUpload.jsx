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
  currentImage,
  currentImageLink,
  label = "Media Upload",
  showInputsOnly = false,
}) => {
  const reactId = useId();
  const inputId = `media-upload-${reactId.replace(/:/g, "")}`;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(currentImage || "");
  const [imageLink, setImageLink] = useState(currentImageLink || "");

  useEffect(() => {
    setPreviewImage(currentImage || "");
  }, [currentImage]);

  useEffect(() => {
    setImageLink(currentImageLink || "");
  }, [currentImageLink]);

  const toAbsoluteMediaUrl = (url) => {
    if (!url) return url;
    if (/^https?:\/\//i.test(url)) return url;
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
      const reader = new FileReader();
      const readerPromise = new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (error) => {
          console.error('FileReader error:', error);
          reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
      });

      const [uploadResponse, previewUrl] = await Promise.all([
        fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        }).catch(err => { throw err; }),
        readerPromise,
      ]);

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

      const normalizedUrl = imageUrl.startsWith('/') ? imageUrl : `/uploads/gallery/${imageUrl}`;
      const absoluteUrl = toAbsoluteMediaUrl(normalizedUrl);

      setPreviewImage(previewUrl);

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = (error) => {
          console.error('Server-uploaded image failed to load:', error);
          reject(new Error('Server-uploaded image failed to load'));
        };
        img.src = absoluteUrl;
      });

      onImageChange(absoluteUrl);
      setError(null);
    } catch (err) {
      console.error("Complete Image Upload Error:", { message: err.message, name: err.name, stack: err.stack });
      const errorMessage = err.message.includes('Invalid image URL') || err.message.includes('load timeout') || err.message.includes('corrupted') || err.message.includes('failed to load')
        ? "The uploaded image could not be loaded. Please try a different image." 
        : `Failed to upload image: ${err.message}. Please try again.`;
      setError(errorMessage);
      const placeholderUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120' viewBox='0 0 200 120'%3E%3Crect fill='%23cccccc' width='200' height='120'/%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='20px' fill='%23333333'%3EImage Not Available%3C/text%3E%3C/svg%3E";
      setPreviewImage(placeholderUrl);
      onImageChange(placeholderUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleImageLinkChange = (event) => {
    const link = event.target.value;
    setImageLink(link);
    onImageLinkChange(link);
    if (link && previewImage) {
      setPreviewImage("");
      onImageChange("");
    }
  };

  const clearImage = () => {
    setPreviewImage("");
    onImageChange("");
  };

  const clearImageLink = () => {
    setImageLink("");
    onImageLinkChange("");
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
        Upload files directly from your device (alternative to using links above)
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
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
            <CardMedia component="img" height="120" image={previewImage || imageLink} alt="Preview" sx={{ objectFit: "cover", backgroundColor: '#f0f0f0' }} onError={(e) => { console.error('Image preview failed to load:', previewImage || imageLink); e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120' viewBox='0 0 200 120'%3E%3Crect fill='%23cccccc' width='200' height='120'/%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='20px' fill='%23333333'%3EImage Not Available%3C/text%3E%3C/svg%3E"; e.target.style.display = 'block'; }} />
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default MediaUpload;
