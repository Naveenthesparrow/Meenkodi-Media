import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Container,
  Paper,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Chip
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import Favorite from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import GetAppIcon from "@mui/icons-material/GetApp";
import { useTranslation } from 'react-i18next';
import MediaUpload from "./common/MediaUpload";
import MediaDisplay from "./common/MediaDisplay";
import { useBilingualContent } from "../utils/bilingualContent";
import { useParams, useNavigate } from "react-router-dom";

export default function ResourceDetail({ user }) {
  const getContent = useBilingualContent();
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editLanguage, setEditLanguage] = useState('en');
  const [title_en, setTitleEn] = useState("");
  const [title_ta, setTitleTa] = useState("");
  const [description_en, setDescriptionEn] = useState("");
  const [description_ta, setDescriptionTa] = useState("");
  const [category_en, setCategoryEn] = useState("");
  const [category_ta, setCategoryTa] = useState("");
  const [author_en, setAuthorEn] = useState("");
  const [author_ta, setAuthorTa] = useState("");
  const [image, setImage] = useState("");
  const [downloadLink, setDownloadLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/resources/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch resource");
        return res.json();
      })
      .then((data) => {
        setResource(data);
        setTitleEn(data.title?.en || "");
        setTitleTa(data.title?.ta || "");
        setDescriptionEn(data.description?.en || "");
        setDescriptionTa(data.description?.ta || "");
        setCategoryEn(data.category?.en || "");
        setCategoryTa(data.category?.ta || "");
        setAuthorEn(data.author?.en || "");
        setAuthorTa(data.author?.ta || "");
        setImage(data.image || "");
        setDownloadLink(data.downloadLink || "");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      setError(t('resources.loginToLike', 'Please login to like resources'));
      return;
    }

    try {
      const response = await fetch(`/api/resources/${id}/like`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to like resource");

      setResource((prev) => prev ? { ...prev, likesCount: data.likesCount, userLiked: data.userLiked } : prev);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const updatedResource = {
        title: { en: title_en, ta: title_ta },
        description: { en: description_en, ta: description_ta },
        category: { en: category_en, ta: category_ta },
        author: { en: author_en, ta: author_ta },
        image,
        downloadLink,
      };

      const res = await fetch(`/api/resources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedResource),
      });

      if (!res.ok) throw new Error("Failed to update resource");

      const data = await res.json();
      setResource(data);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
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
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#f7f5f0", minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, bgcolor: "#fff" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
            <Box sx={{ flexGrow: 1 }}>
              {resource.category && (
                <Chip
                  label={getContent(resource.category)}
                  sx={{
                    bgcolor: "#8B0000",
                    color: "#fff",
                    mb: 2,
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton onClick={() => navigate("/resources")} size="small">
                <CloseIcon />
              </IconButton>
              {user && user.role === "admin" && (
                <>
                  {!editMode ? (
                    <>
                      <IconButton onClick={() => setEditMode(true)} size="small" color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={handleDelete} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </>
                  ) : (
                    <IconButton onClick={() => setEditMode(false)} size="small">
                      <CloseIcon />
                    </IconButton>
                  )}
                </>
              )}
            </Box>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              {editMode && user?.role === "admin" ? (
                <MediaUpload
                  currentImage={image}
                  onImageChange={(newImage) => setImage(newImage)}
                  uploadEndpoint="/api/upload/resources"
                  type="image"
                />
              ) : (
                <Box
                  component="img"
                  src={image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23f0f0f0' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23999' font-size='24'%3ENo Image%3C/text%3E%3C/svg%3E"}
                  alt={getContent(resource.title)}
                  sx={{
                    width: "100%",
                    height: "auto",
                    borderRadius: 2,
                    boxShadow: 2,
                  }}
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%23f0f0f0' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23999' font-size='24'%3ENo Image%3C/text%3E%3C/svg%3E";
                  }}
                />
              )}
            </Grid>

            <Grid item xs={12} md={7}>
              {editMode && user?.role === "admin" ? (
                <Box>
                  <ToggleButtonGroup
                    value={editLanguage}
                    exclusive
                    onChange={(e, val) => val && setEditLanguage(val)}
                    sx={{ mb: 2 }}
                  >
                    <ToggleButton value="en">English</ToggleButton>
                    <ToggleButton value="ta">தமிழ்</ToggleButton>
                  </ToggleButtonGroup>

                  {editLanguage === 'en' ? (
                    <>
                      <TextField
                        fullWidth
                        label="Title (English)"
                        value={title_en}
                        onChange={(e) => setTitleEn(e.target.value)}
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="Description (English)"
                        value={description_en}
                        onChange={(e) => setDescriptionEn(e.target.value)}
                        margin="normal"
                        multiline
                        rows={4}
                      />
                      <TextField
                        fullWidth
                        label="Category (English)"
                        value={category_en}
                        onChange={(e) => setCategoryEn(e.target.value)}
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="Author (English)"
                        value={author_en}
                        onChange={(e) => setAuthorEn(e.target.value)}
                        margin="normal"
                      />
                    </>
                  ) : (
                    <>
                      <TextField
                        fullWidth
                        label="தலைப்பு (Tamil)"
                        value={title_ta}
                        onChange={(e) => setTitleTa(e.target.value)}
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="விளக்கம் (Tamil)"
                        value={description_ta}
                        onChange={(e) => setDescriptionTa(e.target.value)}
                        margin="normal"
                        multiline
                        rows={4}
                      />
                      <TextField
                        fullWidth
                        label="வகை (Tamil)"
                        value={category_ta}
                        onChange={(e) => setCategoryTa(e.target.value)}
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="ஆசிரியர் (Tamil)"
                        value={author_ta}
                        onChange={(e) => setAuthorTa(e.target.value)}
                        margin="normal"
                      />
                    </>
                  )}

                  <TextField
                    fullWidth
                    label="Download Link"
                    value={downloadLink}
                    onChange={(e) => setDownloadLink(e.target.value)}
                    margin="normal"
                  />

                  <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      disabled={submitting}
                      startIcon={<SaveIcon />}
                      sx={{ bgcolor: "#8B0000", "&:hover": { bgcolor: "#700000" } }}
                    >
                      {submitting ? "Saving..." : "Save"}
                    </Button>
                    <Button variant="outlined" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: "#8B0000",
                      mb: 2,
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    {getContent(resource.title)}
                  </Typography>

                  {resource.author && (
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: "#555",
                        mb: 3,
                        fontStyle: "italic",
                        fontFamily: "Georgia, serif",
                      }}
                    >
                      {t('resources.by', 'By')} {getContent(resource.author)}
                    </Typography>
                  )}

                  <Divider sx={{ my: 3 }} />

                  <Typography
                    variant="body1"
                    sx={{
                      color: "#333",
                      lineHeight: 1.8,
                      mb: 4,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {getContent(resource.description)}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                    {downloadLink && (
                      <Button
                        variant="contained"
                        startIcon={<GetAppIcon />}
                        href={downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          bgcolor: "#8B0000",
                          "&:hover": { bgcolor: "#700000" },
                          textTransform: "none",
                          px: 3,
                        }}
                      >
                        {t('resources.download', 'Download Resource')}
                      </Button>
                    )}

                    <IconButton
                      onClick={handleLike}
                      sx={{
                        border: "2px solid #8B0000",
                        color: resource.userLiked ? "#8B0000" : "#999",
                      }}
                    >
                      {resource.userLiked ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>

                    <Typography variant="body2" sx={{ color: "#555" }}>
                      {resource.likesCount || 0} {t('resources.likes', 'Likes')}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
