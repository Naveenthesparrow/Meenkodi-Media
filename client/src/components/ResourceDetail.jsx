import React, { useEffect, useState, useCallback } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Use local pdf worker to avoid CORS issues
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();
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
  Chip,
  Dialog,
  AppBar,
  Toolbar,
  Snackbar
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
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ShareIcon from "@mui/icons-material/Share";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useTranslation } from 'react-i18next';
import MediaUpload from "./common/MediaUpload";
import PdfUpload from "./common/PdfUpload";
import MediaDisplay from "./common/MediaDisplay";
import { useBilingualContent } from "../utils/bilingualContent";
import { useParams, useNavigate } from "react-router-dom";
import SEO from "./common/SEO";

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
  const [numPages, setNumPages] = useState(null);
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  // Reset reader state when opened
  useEffect(() => {
    if (showPdfViewer) {
      setNumPages(null);
      setPdfLoadError(false);
      setPdfLoading(true);
    }
  }, [showPdfViewer]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPdfLoading(false);
  };

  const onDocumentLoadError = () => {
    setPdfLoadError(true);
    setPdfLoading(false);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setSnackbarMsg(t("linkCopied", "Link copied to clipboard!"));
    setSnackbarOpen(true);
  };

  const handleShare = async () => {
    const shareData = {
      title: getContent(resource?.title) || "Resource Detail",
      text: getContent(resource?.description) || `Read ${getContent(resource?.title)} on Meenkodi`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

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

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(t('resources.loginToLike', 'Please login to like resources'));
        }
        let errMsg = "Failed to like resource";
        try {
          const data = await response.json();
          errMsg = data.error || errMsg;
        } catch (_) {}
        throw new Error(errMsg);
      }

      const data = await response.json();
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
      <SEO 
        title={resource ? `${getContent(resource.title)} - Tamil Resource & Archives` : 'Tamil Heritage Resource'}
        description={resource ? (getContent(resource.description) || `Educational materials and research on ${getContent(resource.title)}.`).slice(0, 160) : 'Explore Tamil heritage resources.'}
        keywords={resource ? `${getContent(resource.title)}, ${getContent(resource.author) || ''}, Tamil Resources, Tamil Books, Tamil Manuscripts, Meenkodi` : 'Tamil Resources, Tamil Books'}
        image={resource?.image || undefined}
        url={`https://www.meenkodi.com/resources/${id}`}
        type="article"
      />
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

          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            <Grid item xs={12} sm={5} md={4}>
              {editMode && user?.role === "admin" ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#333' }}>
                    Thumbnail Image
                  </Typography>
                  {image ? (
                    <Box sx={{ position: 'relative', mb: 2, display: 'flex', justifyContent: 'center' }}>
                      <Box
                        component="img"
                        src={image}
                        alt="Thumbnail"
                        sx={{
                          width: '100%',
                          maxWidth: 240,
                          maxHeight: 320,
                          objectFit: 'contain',
                          borderRadius: 2,
                          boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
                        }}
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
                <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-start' }, alignItems: 'flex-start', width: '100%' }}>
                  <Box
                    component="img"
                    src={image || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect fill='%23f0f0f0' width='300' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23999' font-size='20'%3ENo Image%3C/text%3E%3C/svg%3E"}
                    alt={getContent(resource.title)}
                    sx={{
                      width: "100%",
                      maxWidth: { xs: 220, sm: 240, md: 280 },
                      maxHeight: { xs: 320, sm: 360, md: 400 },
                      height: "auto",
                      objectFit: "contain",
                      borderRadius: 2,
                      boxShadow: "0 10px 24px rgba(0,0,0,0.14), 0 2px 5px rgba(0,0,0,0.06)",
                      border: "1px solid rgba(0,0,0,0.08)",
                      bgcolor: "#faf9f6",
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: "scale(1.02)",
                      }
                    }}
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect fill='%23f0f0f0' width='300' height='400'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23999' font-size='20'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </Box>
              )}
            </Grid>

            <Grid item xs={12} sm={7} md={8}>
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
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.8rem' },
                      lineHeight: 1.35,
                      color: "#8B0000",
                      mb: 1.5,
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    {getContent(resource.title)}
                  </Typography>

                  {resource.author && (
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        color: "#555",
                        mb: 2.5,
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

                  {/* PDF Book Actions */}
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
                          startIcon={<MenuBook />}
                          onClick={() => {
                            setPdfLoading(true);
                            setShowPdfViewer(true);
                          }}
                          sx={{
                            bgcolor: '#8B0000',
                            '&:hover': { bgcolor: '#6B0000' },
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            py: 1,
                          }}
                        >
                          Read Book Online
                        </Button>

                        <Button
                          variant="outlined"
                          startIcon={<GetAppIcon />}
                          href={downloadLink}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            color: '#8B0000',
                            borderColor: '#8B0000',
                            '&:hover': { bgcolor: 'rgba(139,0,0,0.05)', borderColor: '#8B0000' },
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 2.5,
                            py: 1,
                          }}
                        >
                          Download PDF Book
                        </Button>
                      </Box>
                    </Paper>
                  )}

                  {/* Immersive Fullscreen PDF Reader Modal */}
                  {downloadLink && (
                    <Dialog
                      fullScreen
                      open={showPdfViewer}
                      onClose={() => setShowPdfViewer(false)}
                      sx={{
                        '& .MuiDialog-paper': {
                          bgcolor: '#1f1f1f',
                          color: '#fff',
                        }
                      }}
                    >
                      {/* Reader Top Bar */}
                      <AppBar
                        position="relative"
                        elevation={2}
                        sx={{
                          bgcolor: '#8B0000',
                          color: '#fff',
                          borderBottom: '1px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 1.5, sm: 3 }, minHeight: { xs: 56, sm: 64 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                            <MenuBook sx={{ fontSize: { xs: 22, sm: 26 } }} />
                            <Box sx={{ overflow: 'hidden' }}>
                              <Typography
                                variant="h6"
                                noWrap
                                sx={{
                                  fontWeight: 700,
                                  fontSize: { xs: '0.9rem', sm: '1.1rem' },
                                  fontFamily: 'Georgia, serif',
                                }}
                              >
                                {getContent(resource.title)}
                              </Typography>
                              {pdfName && (
                                <Typography
                                  variant="caption"
                                  noWrap
                                  sx={{
                                    color: 'rgba(255,255,255,0.75)',
                                    display: { xs: 'none', sm: 'block' }
                                  }}
                                >
                                  {pdfName}
                                </Typography>
                              )}
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<ShareIcon />}
                              onClick={handleShare}
                              sx={{
                                color: '#fff',
                                borderColor: 'rgba(255,255,255,0.5)',
                                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                                textTransform: 'none',
                                py: 0.5,
                                px: { xs: 1, sm: 1.5 },
                                '&:hover': {
                                  borderColor: '#fff',
                                  bgcolor: 'rgba(255,255,255,0.15)'
                                }
                              }}
                            >
                              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Share</Box>
                              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Share</Box>
                            </Button>

                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<OpenInNewIcon />}
                              href={downloadLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                color: '#fff',
                                borderColor: 'rgba(255,255,255,0.5)',
                                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                                textTransform: 'none',
                                py: 0.5,
                                px: { xs: 1, sm: 1.5 },
                                '&:hover': {
                                  borderColor: '#fff',
                                  bgcolor: 'rgba(255,255,255,0.15)'
                                }
                              }}
                            >
                              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Open in Browser</Box>
                              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Open</Box>
                            </Button>

                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<GetAppIcon />}
                              href={downloadLink}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{
                                bgcolor: '#B8860B',
                                color: '#fff',
                                fontSize: { xs: '0.75rem', sm: '0.85rem' },
                                textTransform: 'none',
                                fontWeight: 700,
                                py: 0.5,
                                px: { xs: 1, sm: 1.5 },
                                '&:hover': { bgcolor: '#966F09' }
                              }}
                            >
                              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Download PDF</Box>
                              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Download</Box>
                            </Button>

                            <IconButton
                              edge="end"
                              color="inherit"
                              onClick={() => setShowPdfViewer(false)}
                              aria-label="close"
                              sx={{ ml: 1, bgcolor: 'rgba(0,0,0,0.25)', '&:hover': { bgcolor: 'rgba(0,0,0,0.45)' } }}
                            >
                              <CloseIcon />
                            </IconButton>
                          </Box>
                        </Toolbar>
                      </AppBar>

                      {/* Reader Body / PDF Viewer Frame */}
                      <Box
                        sx={{
                          flexGrow: 1,
                          width: '100%',
                          height: 'calc(100vh - 64px)',
                          bgcolor: '#2b2b2b',
                          display: 'flex',
                          flexDirection: 'column',
                          position: 'relative'
                        }}
                      >

                        {/* react-pdf Continuous Scroll Renderer */}
                        {pdfLoading && !pdfLoadError && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
                            <Box sx={{ fontSize: '3rem', animation: 'pulse 1.5s ease-in-out infinite', '@keyframes pulse': { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.6, transform: 'scale(1.08)' } } }}>📖</Box>
                            <Typography variant="h6" sx={{ color: '#fff', fontFamily: 'Georgia, serif', fontWeight: 700 }}>Opening Book...</Typography>
                            <Typography variant="body2" sx={{ color: '#aaa' }}>Loading pages, please wait...</Typography>
                            <CircularProgress sx={{ color: '#8B0000', mt: 1 }} />
                          </Box>
                        )}

                        {pdfLoadError && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2, px: 3, textAlign: 'center' }}>
                            <Box sx={{ fontSize: '2.5rem' }}>⚠️</Box>
                            <Typography variant="h6" sx={{ color: '#fff', fontFamily: 'Georgia, serif' }}>Could not load PDF</Typography>
                            <Typography variant="body2" sx={{ color: '#aaa', maxWidth: 340 }}>The PDF could not be loaded. You can open it directly in your browser.</Typography>
                            <Button
                              variant="contained"
                              href={downloadLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              startIcon={<OpenInNewIcon />}
                              sx={{ bgcolor: '#8B0000', '&:hover': { bgcolor: '#6B0000' }, textTransform: 'none', fontWeight: 700, mt: 1 }}
                            >
                              Open in Browser Tab
                            </Button>
                          </Box>
                        )}

                        {/* Continuous scroll: render ALL pages stacked vertically */}
                        <Box
                          sx={{
                            overflowY: 'auto',
                            width: '100%',
                            height: '100%',
                            display: pdfLoadError ? 'none' : 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                            pt: 2,
                            pb: 4,
                            bgcolor: '#3a3a3a',
                          }}
                        >
                          <Document
                            file={downloadLink}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={null}
                          >
                            {numPages && Array.from({ length: numPages }, (_, i) => (
                              <Box
                                key={i + 1}
                                sx={{
                                  mb: 1.5,
                                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                  borderRadius: 0.5,
                                  overflow: 'hidden',
                                  lineHeight: 0,
                                }}
                              >
                                <Page
                                  pageNumber={i + 1}
                                  width={Math.min(window.innerWidth - 32, 900)}
                                  renderAnnotationLayer
                                  renderTextLayer
                                  loading={
                                    <Box sx={{ width: Math.min(window.innerWidth - 32, 900), height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#2b2b2b' }}>
                                      <CircularProgress size={24} sx={{ color: '#8B0000' }} />
                                    </Box>
                                  }
                                />
                              </Box>
                            ))}
                          </Document>
                        </Box>
                      </Box>
                    </Dialog>
                  )}

                  <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", pt: 2, borderTop: "1px solid #f0f0f0" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <IconButton
                        onClick={handleLike}
                        sx={{
                          border: "2px solid #8B0000",
                          color: resource.userLiked ? "#8B0000" : "#999",
                        }}
                      >
                        {resource.userLiked ? <Favorite /> : <FavoriteBorder />}
                      </IconButton>

                      <Typography variant="body2" sx={{ color: "#555", fontWeight: 600 }}>
                        {resource.likesCount || 0} {t('resources.likes', 'Likes')}
                      </Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5, display: { xs: 'none', sm: 'block' } }} />

                    {/* Share Button */}
                    <Button
                      variant="contained"
                      startIcon={<ShareIcon />}
                      onClick={handleShare}
                      sx={{
                        bgcolor: '#8B0000',
                        color: '#fff',
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: 1,
                        px: 2.5,
                        '&:hover': { bgcolor: '#6B0000' }
                      }}
                    >
                      Share Book
                    </Button>

                    {/* Copy Link Button */}
                    <Button
                      variant="outlined"
                      startIcon={<ContentCopyIcon />}
                      onClick={handleCopyLink}
                      sx={{
                        color: '#333',
                        borderColor: '#ccc',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 1,
                        px: 2,
                        '&:hover': { bgcolor: '#f5f5f5', borderColor: '#999' }
                      }}
                    >
                      Copy Link
                    </Button>
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Toast Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
