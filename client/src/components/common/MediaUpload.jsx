import React, { useState, useId, useEffect, useRef } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  isFolder = false,
  onUploadingChange,
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
  
  // Crop states and refs
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState(null);
  const [tempFileName, setTempFileName] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0, size: 200 });
  const imageRef = useRef(null);
  const dragState = useRef(null);

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

  const uploadImageFile = async (file) => {
    setUploading(true);
    if (onUploadingChange) onUploadingChange(true);
    setError(null);

    if (imageLink) {
      setImageLink("");
      if (onImageLinkChange) onImageLinkChange("");
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const uploadResponse = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      const responseText = await uploadResponse.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid server response: ${responseText}`);
      }

      if (!uploadResponse.ok) {
        const errorDetails = data.error || data.details || `Upload failed: ${uploadResponse.status}`;
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
      console.error("Upload error:", err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      if (onUploadingChange) onUploadingChange(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = `Unsupported file type: ${file.type}. Allowed types: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`;
      setError(errorMsg);
      return;
    }

    if (isFolder) {
      setTempFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempImageSrc(e.target.result);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    } else {
      // Direct upload for regular gallery items
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
      uploadImageFile(file);
    }
    
    // reset input value so user can upload the same file again if they cancel
    event.target.value = "";
  };

  // Crop overlay handlers
  const handleImageLoaded = (e) => {
    const img = e.target;
    imageRef.current = img;
    
    // Set crop square relative to image render size
    const minDim = Math.min(img.width, img.height);
    const size = minDim * 0.8;
    setCrop({
      x: (img.width - size) / 2,
      y: (img.height - size) / 2,
      size: size
    });
  };

  const handleCropMouseDown = (e, type) => {
    e.preventDefault();
    if (!imageRef.current) return;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    dragState.current = {
      type, // 'move', 'tl', 'tr', 'bl', 'br'
      startX: clientX,
      startY: clientY,
      startCrop: { ...crop }
    };
  };

  const handleCropMouseMove = (e) => {
    if (!dragState.current || !imageRef.current) return;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    const dx = clientX - dragState.current.startX;
    const dy = clientY - dragState.current.startY;
    
    const imgWidth = imageRef.current.width;
    const imgHeight = imageRef.current.height;
    const { startCrop, type } = dragState.current;

    if (type === 'move') {
      let newX = startCrop.x + dx;
      let newY = startCrop.y + dy;
      
      newX = Math.max(0, Math.min(newX, imgWidth - startCrop.size));
      newY = Math.max(0, Math.min(newY, imgHeight - startCrop.size));
      
      setCrop(prev => ({ ...prev, x: newX, y: newY }));
    } else {
      let newSize = startCrop.size;
      let newX = startCrop.x;
      let newY = startCrop.y;

      if (type === 'br') {
        const delta = Math.max(dx, dy);
        newSize = Math.max(50, startCrop.size + delta);
        newSize = Math.min(newSize, imgWidth - startCrop.x, imgHeight - startCrop.y);
      } else if (type === 'tl') {
        const delta = Math.min(dx, dy);
        newSize = Math.max(50, startCrop.size - delta);
        newSize = Math.min(newSize, startCrop.x + startCrop.size, startCrop.y + startCrop.size);
        newX = startCrop.x + (startCrop.size - newSize);
        newY = startCrop.y + (startCrop.size - newSize);
      } else if (type === 'tr') {
        const delta = Math.max(dx, -dy);
        newSize = Math.max(50, startCrop.size + delta);
        newSize = Math.min(newSize, imgWidth - startCrop.x, startCrop.y + startCrop.size);
        newY = startCrop.y + (startCrop.size - newSize);
      } else if (type === 'bl') {
        const delta = Math.max(-dx, dy);
        newSize = Math.max(50, startCrop.size + delta);
        newSize = Math.min(newSize, startCrop.x + startCrop.size, imgHeight - startCrop.y);
        newX = startCrop.x + (startCrop.size - newSize);
      }

      setCrop({ x: newX, y: newY, size: newSize });
    }
  };

  const handleCropMouseUp = () => {
    dragState.current = null;
  };

  const handleCropSave = () => {
    if (!imageRef.current || !tempImageSrc) return;

    const img = imageRef.current;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    const sourceX = crop.x * scaleX;
    const sourceY = crop.y * scaleY;
    const sourceWidth = crop.size * scaleX;
    const sourceHeight = crop.size * scaleY;

    const canvas = document.createElement('canvas');
    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, sourceWidth, sourceHeight
    );

    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], tempFileName || 'thumbnail.jpg', { type: 'image/jpeg' });
        // Set local preview URL
        const localPreviewUrl = URL.createObjectURL(blob);
        setPreviewImage(localPreviewUrl);
        // Upload cropped file
        uploadImageFile(croppedFile);
      }
      setCropModalOpen(false);
    }, 'image/jpeg', 0.92);
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
          Upload Photo
        </Typography>
        <Typography variant="caption" sx={{ color: "#666", mb: 2, display: "block" }}>
          Supported formats: JPG, PNG, GIF, WEBP
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <input accept="image/*" style={{ display: "none" }} id={inputId} type="file" onChange={handleImageUpload} />
          <label htmlFor={inputId}>
            <Button variant="outlined" component="span" startIcon={uploading ? <CircularProgress size={20} /> : <ImageIcon />} disabled={uploading} sx={{ borderColor: "#000", color: "#000", "&:hover": { borderColor: "#333", backgroundColor: "#f5f5f5" }, "&:disabled": { borderColor: "#ccc", color: "#ccc" } }}>
              {uploading ? "Uploading..." : isFolder ? ((previewImage || imageLink) ? "Change Thumbnail" : "Add a Thumbnail") : "Choose Image File"}
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
        {onVideoChange && (
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
        )}
      </Box>

      {/* Interactive Crop Modal */}
      <Dialog 
        open={cropModalOpen} 
        onClose={() => setCropModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1a1a1a',
            color: '#fff',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600 }}>
          Adjust Thumbnail Crop
        </DialogTitle>
        <DialogContent sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#121212' }}>
          <Typography variant="body2" sx={{ color: '#aaa', mb: 3, textAlign: 'center' }}>
            Drag the box to move it, or drag the blue corners to resize.
          </Typography>

          {tempImageSrc && (
            <Box
              onMouseMove={handleCropMouseMove}
              onMouseUp={handleCropMouseUp}
              onMouseLeave={handleCropMouseUp}
              onTouchMove={handleCropMouseMove}
              onTouchEnd={handleCropMouseUp}
              sx={{
                position: 'relative',
                display: 'inline-block',
                maxWidth: '100%',
                maxHeight: '60vh',
                bgcolor: '#000',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                overflow: 'hidden',
                userSelect: 'none',
                touchAction: 'none'
              }}
            >
              <Box
                component="img"
                src={tempImageSrc}
                onLoad={handleImageLoaded}
                alt="Source Image"
                sx={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: '60vh',
                  pointerEvents: 'none',
                }}
              />

              {/* Crop box overlay */}
              {imageRef.current && (
                <Box
                  onMouseDown={(e) => handleCropMouseDown(e, 'move')}
                  onTouchStart={(e) => handleCropMouseDown(e, 'move')}
                  sx={{
                    position: 'absolute',
                    left: crop.x,
                    top: crop.y,
                    width: crop.size,
                    height: crop.size,
                    border: '2px dashed #00E5FF',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
                    cursor: 'move',
                    zIndex: 10,
                    boxSizing: 'border-box'
                  }}
                >
                  {/* Grid Lines */}
                  <Box sx={{ position: 'absolute', top: '33.33%', left: 0, right: 0, height: '1px', bgcolor: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
                  <Box sx={{ position: 'absolute', top: '66.66%', left: 0, right: 0, height: '1px', bgcolor: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
                  <Box sx={{ position: 'absolute', left: '33.33%', top: 0, bottom: 0, width: '1px', bgcolor: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />
                  <Box sx={{ position: 'absolute', left: '66.66%', top: 0, bottom: 0, width: '1px', bgcolor: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }} />

                  {/* Corner resizing handles */}
                  {/* Top Left */}
                  <Box
                    onMouseDown={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'tl'); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'tl'); }}
                    sx={{
                      position: 'absolute', top: -3, left: -3, width: 14, height: 14,
                      borderTop: '3px solid #00E5FF', borderLeft: '3px solid #00E5FF',
                      cursor: 'nwse-resize', zIndex: 11
                    }}
                  />
                  {/* Top Right */}
                  <Box
                    onMouseDown={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'tr'); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'tr'); }}
                    sx={{
                      position: 'absolute', top: -3, right: -3, width: 14, height: 14,
                      borderTop: '3px solid #00E5FF', borderRight: '3px solid #00E5FF',
                      cursor: 'nesw-resize', zIndex: 11
                    }}
                  />
                  {/* Bottom Left */}
                  <Box
                    onMouseDown={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'bl'); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'bl'); }}
                    sx={{
                      position: 'absolute', bottom: -3, left: -3, width: 14, height: 14,
                      borderBottom: '3px solid #00E5FF', borderLeft: '3px solid #00E5FF',
                      cursor: 'nesw-resize', zIndex: 11
                    }}
                  />
                  {/* Bottom Right */}
                  <Box
                    onMouseDown={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'br'); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleCropMouseDown(e, 'br'); }}
                    sx={{
                      position: 'absolute', bottom: -3, right: -3, width: 14, height: 14,
                      borderBottom: '3px solid #00E5FF', borderRight: '3px solid #00E5FF',
                      cursor: 'nwse-resize', zIndex: 11
                    }}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)', gap: 1.5 }}>
          <Button 
            onClick={() => setCropModalOpen(false)} 
            sx={{ color: '#aaa', '&:hover': { color: '#fff' } }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCropSave}
            variant="contained"
            sx={{
              bgcolor: '#00E5FF',
              color: '#000',
              fontWeight: 600,
              '&:hover': { bgcolor: '#00B8D4' }
            }}
          >
            Crop & Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MediaUpload;
