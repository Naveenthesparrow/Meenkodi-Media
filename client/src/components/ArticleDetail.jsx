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
  Snackbar
} from "@mui/material";
import PhotoLightbox from "./common/PhotoLightbox";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import Favorite from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import { useTranslation } from 'react-i18next';
import MediaUpload from "./common/MediaUpload";
import MediaDisplay from "./common/MediaDisplay";
import { useBilingualContent } from "../utils/bilingualContent";
import { useParams, useNavigate } from "react-router-dom";
import SEO from "./common/SEO";
import ArticleComposer from "./ArticleComposer";
import { renderArticleHtml, articleBodySx } from "../utils/articleRender";
import API_BASE_URL from '../utils/api';
import cldImg from "../utils/cloudinaryImage";


const getCleanAuthorName = (name) => {
  if (!name) return 'Anonymous';
  if (name.includes('@')) {
    return name.split('@')[0];
  }
  return name;
};

let cachedArticleDetails = {};

export default function ArticleDetail({ user }) {
  const getContent = useBilingualContent();
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(() => cachedArticleDetails[id] || null);
  const [loading, setLoading] = useState(!cachedArticleDetails[id]);
  const [error, setError] = useState(null);
  // Errors from like/save/delete: shown as a toast so the page (and unsaved edits) stay
  const [actionError, setActionError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [viewImage, setViewImage] = useState(null); // { list, index }: article photos opened full size
  const [title_en, setTitleEn] = useState(() => cachedArticleDetails[id]?.title?.en || "");
  const [title_ta, setTitleTa] = useState(() => cachedArticleDetails[id]?.title?.ta || "");
  const [content_en, setContentEn] = useState(() => cachedArticleDetails[id]?.content?.en || "");
  const [content_ta, setContentTa] = useState(() => cachedArticleDetails[id]?.content?.ta || "");
  const [author_en, setAuthorEn] = useState(() => cachedArticleDetails[id]?.author?.en || "");
  const [author_ta, setAuthorTa] = useState(() => cachedArticleDetails[id]?.author?.ta || "");
  const [imageLink, setImageLink] = useState(() => cachedArticleDetails[id]?.imageLink || "");
  const [image, setImage] = useState(() => cachedArticleDetails[id]?.image || "");
  const [videoUrl, setVideoUrl] = useState(() => cachedArticleDetails[id]?.videoUrl || "");
  const [videoLink, setVideoLink] = useState(() => cachedArticleDetails[id]?.videoLink || "");


  useEffect(() => {
    fetch(`${API_BASE_URL}/api/articles/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch article");
        return res.json();
      })
      .then((data) => {
        setArticle(data);
        setTitleEn(data.title?.en || "");
        setTitleTa(data.title?.ta || "");
        setContentEn(data.content?.en || "");
        setContentTa(data.content?.ta || "");
        setAuthorEn(data.author?.en || "");
        setAuthorTa(data.author?.ta || "");
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

  const handleLike = async () => {
    if (!user) {
      setActionError(t('articles.loginToLike', 'Please login to like articles'));
      return;
    }

    const previousArticle = { ...article };
    setArticle((prev) => {
      if (!prev) return prev;
      const userLiked = !prev.userLiked;
      const likesCount = Math.max(0, prev.likesCount + (userLiked ? 1 : -1));
      return { ...prev, userLiked, likesCount };
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/articles/${id}/like`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to like article");

      // Verify and set state with server confirmation
      setArticle((prev) => prev ? { ...prev, likesCount: data.likesCount, userLiked: data.userLiked } : prev);
    } catch (err) {
      // Rollback to original state on network/server error
      setArticle(previousArticle);
      setActionError(err.message);
    }
  };


  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/articles/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to delete article");
        navigate(`/articles`);
      } catch {
        setActionError("Failed to delete article");
      }
    }
  };

  // The writing screen picks the language that has content itself
  const handleStartEdit = () => setEditMode(true);

  const actionErrorToast = (
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
  );

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress /></Box>;
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
    // Same writing screen as new articles, filled in with this article
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 6 } }}>
        {actionErrorToast}
        <ArticleComposer
          user={user}
          article={article}
          onCancel={() => setEditMode(false)}
          onDelete={handleDelete}
          onSaved={async () => {
            try {
              const refreshRes = await fetch(`${API_BASE_URL}/api/articles/${article.slug || id}`, { credentials: 'include' });
              if (refreshRes.ok) setArticle(await refreshRes.json());
            } catch {
              // keep the page; the next visit loads the saved version
            }
            setEditMode(false);
          }}
        />
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
      <SEO 
        title={article ? `${getContent(article.title)} - Tamil Heritage Article` : 'Tamil Heritage Article'}
        description={article ? (getContent(article.content) || `Read ${getContent(article.title)} on Meenkodi Tamil Heritage.`).replace(/<[^>]*>/g, '').slice(0, 160) : 'Read Tamil heritage articles.'}
        keywords={article ? `${getContent(article.title)}, ${getContent(article.author) || ''}, Tamil Articles, Tamil History, Meenkodi` : 'Tamil Articles, Tamil History'}
        image={article?.imageLink || article?.image || undefined}
        url={`/articles/${article?.slug || id}`}
        type="article"
      />
      {actionErrorToast}
      <Box sx={{
        maxWidth: 1150,
        mx: "auto",
        px: { xs: 2, md: 4 },
      }}>
        {/* Reading Mode */}
        <Box>
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
            {/* Header: photo on the left, title on the right (photo on top on phones) */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', md: 'row-reverse' }, alignItems: { md: 'center' }, gap: { xs: 2.5, md: 4 }, mb: 4 }}>
              <Typography
                variant="h3"
                sx={{
                  flex: 1,
                  fontFamily: 'Georgia, serif',
                  fontWeight: 700,
                  color: '#000',
                  fontSize: { xs: '1.75rem', md: '2.4rem' },
                  lineHeight: 1.3,
                  letterSpacing: -0.5,
                }}
              >
                {getContent(article.title)}
              </Typography>
              {(article.image || article.imageLink) && (
                <Box
                  onClick={() => setViewImage({ list: [article.imageLink || article.image], index: 0 })}
                  sx={{
                    width: { xs: '100%', md: '48%' },
                    flexShrink: 0,
                    aspectRatio: '16 / 9', // same shape as the writing screen's photo adjuster
                    overflow: 'hidden',
                    borderRadius: '6px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    cursor: 'zoom-in',
                  }}
                >
                  <Box
                    component="img"
                    src={cldImg(article.imageLink || article.image, 1200)}
                    alt={getContent(article.title)}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </Box>
              )}
            </Box>

            {/* Article Content */}
            <Box
              sx={{ ...articleBodySx, mb: 4 }}
              onClick={(e) => {
                if (e.target.tagName !== 'IMG') return;
                // every photo of the article, so the viewer can step through them
                const imgs = Array.from(e.currentTarget.querySelectorAll('img'));
                setViewImage({ list: imgs.map((img) => img.dataset.full || img.src), index: imgs.indexOf(e.target) });
              }}
              dangerouslySetInnerHTML={{ __html: renderArticleHtml(getContent(article.content)) }}
            />

            {/* Full-screen photo viewer, with previous / next */}
            <PhotoLightbox
              photos={viewImage?.list || []}
              index={viewImage ? viewImage.index : null}
              onIndexChange={(index) => setViewImage((v) => v && { ...v, index })}
              onClose={() => setViewImage(null)}
            />

            {/* Media Display - Only if video exists */}
            {(article.videoUrl || article.videoLink) && (
              <MediaDisplay
                videoUrl={article.videoUrl}
                videoLink={article.videoLink}
                title={article.title}
              />
            )}

            <Divider sx={{ my: 4 }} />

            {/* Engagement & Author Info Footer */}
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 3,
              pb: 3,
              mb: 4,
            }}>
              {/* Author & Date Info */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
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
                  {getCleanAuthorName(getContent(article.author) || article.authorName)[0].toUpperCase()}
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 700, color: '#000', lineHeight: 1.2 }}>
                    {getCleanAuthorName(getContent(article.author) || article.authorName)}
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

              {/* Likes (Like Button Only - Hiding Likes Count) */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  onClick={handleLike}
                  startIcon={article.userLiked ? <Favorite sx={{ fill: '#8B0000' }} /> : <FavoriteBorder />}
                  variant="text"
                  sx={{
                    color: article.userLiked ? '#8B0000' : '#666',
                    fontWeight: 700,
                    textTransform: 'none',
                    border: '1px solid',
                    borderColor: article.userLiked ? '#8B0000' : '#ccc',
                    borderRadius: '20px',
                    px: 3,
                    py: 0.75,
                    '&:hover': {
                      bgcolor: 'rgba(139,0,0,0.08)',
                      borderColor: '#8B0000'
                    },
                  }}
                >
                  {article.userLiked ? t('articles.liked', 'Liked') : t('articles.like', 'Like')}
                  {` (${article.likesCount || 0})`}
                </Button>
              </Box>
            </Box>

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
                  onClick={handleStartEdit}
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
