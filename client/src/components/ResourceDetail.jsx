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
import API_BASE_URL from "../utils/api";
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
import ArchiveBookField from "./common/ArchiveBookField";
import { downloadLinkProps, fixFileName } from "../utils/download";
import { hasTamil } from "../utils/tamilText";
import MediaDisplay from "./common/MediaDisplay";
import { useBilingualContent } from "../utils/bilingualContent";
import { useParams, useNavigate, Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BookCover from "./common/BookCover";
import SEO from "./common/SEO";
import cldImg from "../utils/cloudinaryImage";

const cachedResourceDetails = {};

export default function ResourceDetail({ user }) {
  const getContent = useBilingualContent();
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const hasCache = !!cachedResourceDetails[id];
  const [resource, setResource] = useState(() => cachedResourceDetails[id] || null);
  const [loading, setLoading] = useState(!hasCache);
  const [error, setError] = useState(null);
  // Errors from like/save/delete: shown as a toast so the page (and unsaved edits) stay
  const [actionError, setActionError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editLanguage, setEditLanguage] = useState('ta');
  const [title_en, setTitleEn] = useState(() => cachedResourceDetails[id]?.title?.en || "");
  const [title_ta, setTitleTa] = useState(() => cachedResourceDetails[id]?.title?.ta || "");
  const [description_en, setDescriptionEn] = useState(() => cachedResourceDetails[id]?.description?.en || "");
  const [description_ta, setDescriptionTa] = useState(() => cachedResourceDetails[id]?.description?.ta || "");
  const [category_en, setCategoryEn] = useState(() => cachedResourceDetails[id]?.category?.en || "");
  const [category_ta, setCategoryTa] = useState(() => cachedResourceDetails[id]?.category?.ta || "");
  const [author_en, setAuthorEn] = useState(() => cachedResourceDetails[id]?.author?.en || "");
  const [author_ta, setAuthorTa] = useState(() => cachedResourceDetails[id]?.author?.ta || "");
  const [image, setImage] = useState(() => cachedResourceDetails[id]?.image || "");
  const [downloadLink, setDownloadLink] = useState(() => cachedResourceDetails[id]?.downloadLink || "");
  const [pdfName, setPdfName] = useState(() => cachedResourceDetails[id]?.pdfName || "");
  const [pdfSize, setPdfSize] = useState(() => cachedResourceDetails[id]?.pdfSize || "");
  const [archiveId, setArchiveId] = useState(() => cachedResourceDetails[id]?.archiveId || "");
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  // The archive.org reader shows its own progress; never keep our loading
  // overlay up for long even if its load event is late
  useEffect(() => {
    if (!showPdfViewer || !archiveId) return undefined;
    const timer = setTimeout(() => setPdfLoading(false), 6000);
    return () => clearTimeout(timer);
  }, [showPdfViewer, archiveId]);
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
    if (!hasCache) setLoading(true);
    fetch(`${API_BASE_URL}/api/resources/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch resource");
        return res.json();
      })
      .then((data) => {
        cachedResourceDetails[id] = data;
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
        setArchiveId(data.archiveId || "");
        setLoading(false);
      })
      .catch((err) => {
        if (!cachedResourceDetails[id]) setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      setActionError(t('resources.loginToLike', 'Please login to like resources'));
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/resources/${id}/like`, {
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
      setActionError(err.message);
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
        archiveId,
      };

      const res = await fetch(`${API_BASE_URL}/api/resources/${id}`, {
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
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/resources/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to delete resource");
        navigate(`/resources`);
      } catch {
        setActionError("Failed to delete resource");
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
        url={`/resources/${resource?.slug || id}`}
        type="article"
      />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, bgcolor: "#fff" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Button
                component={Link}
                to="/resources"
                startIcon={<ArrowBackIcon />}
                sx={{ color: '#8B0000', textTransform: 'none', fontWeight: 600, px: 1 }}
              >
                {i18n.language === 'ta' ? 'அனைத்து நூல்கள்' : 'All books'}
              </Button>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
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
            <Grid size={{ xs: 12, sm: 5, md: 4 }}>
              {editMode && user?.role === "admin" ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#333' }}>
                    Thumbnail Image
                  </Typography>
                  {image ? (
                    <Box sx={{ position: 'relative', mb: 2, display: 'flex', justifyContent: 'center' }}>
                      <Box
                        component="img"
                        src={cldImg(image, 1600)}
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
                            const res = await fetch(`${API_BASE_URL}/api/upload/image`, { method: 'POST', body: formData, credentials: 'include' });
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
                <Box sx={{ display: 'flex', justifyContent: 'center', position: { sm: 'sticky' }, top: { sm: 90 } }}>
                  <BookCover
                    image={image}
                    title={getContent(resource.title)}
                    author={getContent(resource.author)}
                    width={800}
                    sx={{ maxWidth: { xs: 210, sm: 280, md: 320 } }}
                  />
                </Box>
              )}
            </Grid>

            <Grid size={{ xs: 12, sm: 7, md: 8 }}>
              {editMode && user?.role === "admin" ? (
                <Box>
                  <ToggleButtonGroup
                    value={editLanguage}
                    exclusive
                    onChange={(e, val) => val && setEditLanguage(val)}
                    sx={{ mb: 2 }}
                  >
                    <ToggleButton value="ta">தமிழ்</ToggleButton>
                    <ToggleButton value="en">English</ToggleButton>
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

                  <ArchiveBookField
                    archiveId={archiveId}
                    onFetched={(book) => {
                      // Only fill empty fields; Tamil text goes to the Tamil field
                      const isTa = (v) => hasTamil(v);
                      if (book.title && isTa(book.title) && !title_ta) setTitleTa(book.title);
                      if (book.title && !isTa(book.title) && !title_en) setTitleEn(book.title);
                      if (book.author && isTa(book.author) && !author_ta) setAuthorTa(book.author);
                      if (book.author && !isTa(book.author) && !author_en) setAuthorEn(book.author);
                      if (book.description && isTa(book.description) && !description_ta) setDescriptionTa(book.description);
                      if (book.description && !isTa(book.description) && !description_en) setDescriptionEn(book.description);
                      if (!image && book.cover) setImage(book.cover);
                      setArchiveId(book.archiveId);
                      if (book.downloadLink) {
                        setDownloadLink(book.downloadLink);
                        setPdfName(book.pdfName);
                        setPdfSize(book.pdfSize);
                      }
                    }}
                    onClear={() => setArchiveId("")}
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

                  {/* PDF Book Actions */}
                  {(downloadLink || archiveId) && (
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
                            width: { xs: '100%', sm: 'auto' },
                          }}
                        >
                          Read Book Online
                        </Button>

                        {downloadLink && (
                        <Button
                          variant="outlined"
                          startIcon={<GetAppIcon />}
                          {...downloadLinkProps(downloadLink)}
                          sx={{
                            color: '#8B0000',
                            borderColor: '#8B0000',
                            '&:hover': { bgcolor: 'rgba(139,0,0,0.05)', borderColor: '#8B0000' },
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 2.5,
                            py: 1,
                            width: { xs: '100%', sm: 'auto' },
                          }}
                        >
                          Download PDF Book
                        </Button>
                        )}
                      </Box>
                    </Paper>
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

                  {/* Immersive Fullscreen PDF Reader Modal */}
                  {(downloadLink || archiveId) && (
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
                                  {fixFileName(pdfName)}
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
                              {...downloadLinkProps(downloadLink)}
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
                          <Box
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              zIndex: 2,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 2,
                              px: 3,
                              textAlign: 'center',
                              background: 'radial-gradient(circle at center, #3a2a24 0%, #1c1c1c 70%)',
                            }}
                          >
                            <Box sx={{ width: { xs: 110, sm: 140 }, animation: 'bookPulse 1.8s ease-in-out infinite', '@keyframes bookPulse': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } } }}>
                              <BookCover image={image} title={title_en || title_ta} author={author_en || author_ta} width={300} />
                            </Box>
                            <Typography sx={{ color: '#f5e6c8', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: { xs: '1.05rem', sm: '1.25rem' }, maxWidth: 520 }}>
                              {getContent(resource.title)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <CircularProgress size={18} sx={{ color: '#DAA520' }} />
                              <Typography variant="body2" sx={{ color: '#bbb' }}>
                                {i18n.language === 'ta' ? 'நூல் திறக்கிறது…' : 'Opening the book…'}
                              </Typography>
                            </Box>
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

                        {archiveId && !pdfLoadError && (
                          <Box
                            component="iframe"
                            src={`https://archive.org/embed/${archiveId}`}
                            title={title_en || title_ta || 'Book'}
                            allowFullScreen
                            onLoad={() => setPdfLoading(false)}
                            sx={{ border: 0, width: '100%', flex: 1, minHeight: 0, bgcolor: '#000', display: 'block' }}
                          />
                        )}

                        {/* Continuous scroll: render ALL pages stacked vertically */}
                        {!archiveId && (
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
                        )}
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
      <Snackbar
        open={!!actionError}
        autoHideDuration={6000}
        onClose={() => setActionError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setActionError(null)} sx={{ width: '100%' }}>
          {actionError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
