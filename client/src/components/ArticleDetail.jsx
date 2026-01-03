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
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from 'react-i18next';
import MediaUpload from "./common/MediaUpload";
import MediaDisplay from "./common/MediaDisplay";
import { useBilingualContent } from "../utils/bilingualContent";
import { useParams, useNavigate } from "react-router-dom";

export default function ArticleDetail({ user }) {
  const getContent = useBilingualContent();
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [title_en, setTitleEn] = useState("");
  const [title_ta, setTitleTa] = useState("");
  const [content_en, setContentEn] = useState("");
  const [content_ta, setContentTa] = useState("");
  const [author_en, setAuthorEn] = useState("");
  const [author_ta, setAuthorTa] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [image, setImage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch article");
        return res.json();
      })
      .then((data) => {
        setArticle(data);
        setTitleEn(data.title.en);
        setTitleTa(data.title.ta);
        setContentEn(data.content.en);
        setContentTa(data.content.ta);
        setAuthorEn(data.author.en);
        setAuthorTa(data.author.ta);
        setImageLink(data.imageLink || "");
        setVideoLink(data.videoLink || "");
        setImage(data.image || "");
        setVideoUrl(data.videoUrl || "");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const updatedArticle = {
        title: { en: title_en, ta: title_ta },
        content: { en: content_en, ta: content_ta },
        author: { en: author_en, ta: author_ta },
        imageLink,
        videoLink,
        image,
        videoUrl,
      };

      const res = await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedArticle),
      });

      if (!res.ok) throw new Error("Failed to update article");

      const data = await res.json();
      setArticle(data);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        await fetch(`/api/articles/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        navigate(`/articles`);
      } catch {
        setError("Failed to delete article");
      }
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!article) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Article Not Found
        </Typography>
        <Typography variant="body1">
          The article you are looking for does not exist or has been removed.
        </Typography>
      </Box>
    );
  }

  // --- ADMIN EDIT VIEW ---
  if (editMode) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper elevation={0} sx={{ p: 5, border: '1px solid #e0e0e0', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, borderBottom: '1px solid #eee', pb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: '"Playfair Display", serif', color: '#1a1a1a' }}>
              {t('articles.edit', 'Edit Article')}
            </Typography>
            <IconButton onClick={() => setEditMode(false)}><CloseIcon /></IconButton>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <TextField label={t('articles.form.titleEn', 'Title (EN)')} value={title_en} onChange={(e) => setTitleEn(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label={t('articles.form.titleTa', 'Title (TA)')} value={title_ta} onChange={(e) => setTitleTa(e.target.value)} fullWidth />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField label={t('articles.form.authorEn', 'Author (EN)')} value={author_en} onChange={(e) => setAuthorEn(e.target.value)} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label={t('articles.form.authorTa', 'Author (TA)')} value={author_ta} onChange={(e) => setAuthorTa(e.target.value)} fullWidth />
            </Grid>

            <Grid item xs={12}>
              <TextField label={t('articles.form.contentEn', 'Content (EN)')} value={content_en} onChange={(e) => setContentEn(e.target.value)} fullWidth multiline rows={8} />
            </Grid>
            <Grid item xs={12}>
              <TextField label={t('articles.form.contentTa', 'Content (TA)')} value={content_ta} onChange={(e) => setContentTa(e.target.value)} fullWidth multiline rows={8} />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ p: 3, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Media Settings</Typography>
                <MediaUpload
                  onImageLinkChange={setImageLink}
                  onVideoLinkChange={setVideoLink}
                  onImageChange={setImage}
                  onVideoChange={setVideoUrl}
                  currentImageLink={imageLink}
                  currentVideoLink={videoLink}
                  currentImage={image}
                  currentVideo={videoUrl}
                  label="Media Links"
                  showInputsOnly={true}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
              >
                Delete Article
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
                disabled={submitting}
                startIcon={<SaveIcon />}
                sx={{
                  bgcolor: '#000',
                  color: '#fff',
                  '&:hover': { bgcolor: '#333' },
                  px: 4,
                  py: 1.5,
                  borderRadius: 2
                }}
              >
                {submitting ? t('actions.saving', 'Saving...') : t('actions.save', 'Save Changes')}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#fff',
      py: { xs: 4, md: 6 },
    }}>
      <Box sx={{
        maxWidth: 900,
        mx: "auto",
        px: { xs: 2, md: 4 },
      }}>
        {/* Reading Mode */}
        <Box>
          {/* Hero Image Section */}
          {(article.image) && (
            <Box sx={{
              width: '100%',
              height: { xs: 300, md: 450 },
              mb: 4,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 30px rgba(0,0,0,0.15)',
            }}>
              <Box
                component="img"
                src={article.image}
                alt={getContent(article.title)}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {/* Decorative border */}
              <Box sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                right: 12,
                bottom: 12,
                border: '3px solid rgba(255,255,255,0.3)',
                pointerEvents: 'none',
              }} />
            </Box>
          )}

          {/* Article Content Card */}
          <Box sx={{
            bgcolor: '#fff',
            p: { xs: 3, md: 5 },
            boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              bgcolor: '#8B0000',
            }
          }}>
            {/* Title */}
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'Georgia, serif',
                fontWeight: 700,
                color: '#000',
                mb: 3,
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                lineHeight: 1.3,
                letterSpacing: -0.5,
              }}
            >
              {getContent(article.title)}
            </Typography>

            {/* Author & Date Info */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              pb: 3,
              mb: 4,
              borderBottom: '2px solid #e0e0e0',
            }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: '#8B0000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.2rem',
              }}>
                {(article.authorName || getContent(article.author) || 'A')[0].toUpperCase()}
              </Box>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#000', lineHeight: 1.2 }}>
                  {getContent(article.author) || article.authorName || 'Anonymous'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem', mt: 0.5 }}>
                  Published on {new Date(article.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
            </Box>

            {/* Article Content */}
            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.9,
                fontSize: { xs: '1.05rem', md: '1.15rem' },
                color: '#333',
                fontFamily: 'Georgia, serif',
                mb: 4,
                '& p': {
                  mb: 2,
                },
                whiteSpace: 'pre-line',
                textAlign: 'justify',
              }}
            >
              {getContent(article.content)}
            </Typography>

            {/* Media Display */}
            <MediaDisplay
              imageUrl={article.image}
              videoUrl={article.videoUrl}
              videoLink={article.videoLink}
              title={article.title}
            />

            {/* Admin Actions */}
            {user && user.role === "admin" && (
              <Box sx={{
                mt: 4,
                pt: 4,
                borderTop: '1px solid #e0e0e0',
                display: 'flex',
                gap: 2,
              }}>
                <Button
                  onClick={() => setEditMode(true)}
                  variant="contained"
                  sx={{
                    bgcolor: '#8B0000',
                    '&:hover': { bgcolor: '#6d0000' },
                    borderRadius: 0,
                    px: 3,
                  }}
                >
                  Edit Article
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="outlined"
                  color="error"
                  sx={{
                    borderRadius: 0,
                    px: 3,
                  }}
                >
                  {t('actions.delete', 'Delete')}
                </Button>
              </Box>
            )}
          </Box>

          {/* Standardized Back Button */}
          <Box sx={{ mt: 6, mb: 2, textAlign: 'center' }}>
            <Button
              onClick={() => navigate('/articles')}
              variant="outlined"
              sx={{
                color: '#000',
                borderColor: '#000',
                borderWidth: 2,
                borderRadius: 0,
                px: 4,
                py: 1.5,
                fontWeight: 700,
                fontFamily: 'Georgia, serif',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                '&:hover': {
                  bgcolor: '#000',
                  borderColor: '#000',
                  color: '#fff',
                }
              }}
            >
              ← Back to Articles
            </Button>
          </Box>
        </Box>

      </Box>
    </Box>
  );
}
