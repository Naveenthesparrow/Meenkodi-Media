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
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import MenuBook from "@mui/icons-material/MenuBook";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useTranslation } from 'react-i18next';
import MediaUpload from "./common/MediaUpload";
import PdfUpload from "./common/PdfUpload";
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
  const [pdfName, setPdfName] = useState("");
  const [pdfSize, setPdfSize] = useState("");
  const [showPdfViewer, setShowPdfViewer] = useState(false);
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
        setPdfName(data.pdfName || "");
        setPdfSize(data.pdfSize || "");
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
        pdfName,
        pdfSize,
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

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box>;
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
              {/* Category chip removed */}
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
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#333' }}>
                    Thumbnail Image
                  </Typography>
                  {image ? (
                    <Box sx={{ position: 'relative', mb: 2 }}>
                      <Box
                        component="img"
                        src={image}
                        alt="Thumbnail"
                        sx={{ width: '100%', maxHeight: 250, objectFit: 'cover', borderRadius: 2 }}
                      />
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => setImage('')}
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      >
                        Remove Photo
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      sx={{ py: 2, color: '#8B0000', borderColor: '#8B0000' }}
                    >
                      Upload Photo of Thumbnail
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files && e.target.files[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append('image', file);
                          try {
                            const res = await fetch('/api/upload/image', { method: 'POST', body: formData, credentials: 'include' });
                            if (!res.ok) throw new Error('Upload failed');
                            const data = await res.json();
                            setImage(data.imageUrl || data.url);
                          } catch (err) {
                            alert(err.message);
                          }
                        }}
                      />
                    </Button>
                  )}
                </Box>
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
                        label="Book Title"
                        value={title_en}
                        onChange={(e) => setTitleEn(e.target.value)}
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="Author Name"
                        value={author_en}
                        onChange={(e) => setAuthorEn(e.target.value)}
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="Book Description"
                        value={description_en}
                        onChange={(e) => setDescriptionEn(e.target.value)}
                        margin="normal"
                        multiline
                        rows={4}
                      />
                    </>
                  ) : (
                    <>
                      <TextField
                        fullWidth
                        label="புத்தகத் தலைப்பு"
                        value={title_ta}
                        onChange={(e) => setTitleTa(e.target.value)}
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="ஆசிரியர் பெயர்"
                        value={author_ta}
                        onChange={(e) => setAuthorTa(e.target.value)}
                        margin="normal"
                      />
                      <TextField
                        fullWidth
                        label="நூல் விளக்கம்"
                        value={description_ta}
                        onChange={(e) => setDescriptionTa(e.target.value)}
                        margin="normal"
                        multiline
                        rows={4}
                      />
                    </>
                  )}

                  <PdfUpload
                    pdfUrl={downloadLink}
                    pdfName={pdfName}
                    pdfSize={pdfSize}
                    label="PDF Book File"
                    onPdfChange={({ url, name, size }) => {
                      setDownloadLink(url);
                      setPdfName(name);
                      setPdfSize(size);
                    }}
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

                  {/* PDF Book Actions & Preview */}
                  {downloadLink && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        mb: 4,
                        bgcolor: '#faf8f5',
                        border: '1px solid #e0dcd3',
                        borderRadius: 1.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <PictureAsPdf sx={{ color: '#8B0000', fontSize: 32 }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#111', fontFamily: 'Georgia, serif' }}>
                            {pdfName || 'PDF Book Document'}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          startIcon={showPdfViewer ? <VisibilityOff /> : <MenuBook />}
                          onClick={() => setShowPdfViewer(!showPdfViewer)}
                          sx={{
                            bgcolor: '#8B0000',
                            '&:hover': { bgcolor: '#6B0000' },
                            textTransform: 'none',
                            fontWeight: 700,
                          }}
                        >
                          {showPdfViewer ? 'Hide Reader' : 'Read Book Online'}
                        </Button>

                        <Button
                          variant="outlined"
                          startIcon={<GetAppIcon />}
                          href={downloadLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: '#8B0000',
                            borderColor: '#8B0000',
                            '&:hover': { bgcolor: 'rgba(139,0,0,0.05)', borderColor: '#8B0000' },
                            textTransform: 'none',
                            fontWeight: 700,
                          }}
                        >
                          Download PDF Book
                        </Button>
                      </Box>

                      {/* Embedded Inline PDF Reader */}
                      {showPdfViewer && (
                        <Box sx={{ mt: 3, border: '2px solid #8B0000', borderRadius: 1, overflow: 'hidden', height: '650px', bgcolor: '#fff' }}>
                          <iframe
                            src={downloadLink}
                            title="PDF Book Reader"
                            width="100%"
                            height="100%"
                            style={{ border: 'none' }}
                          />
                        </Box>
                      )}
                    </Paper>
                  )}

                  <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
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
