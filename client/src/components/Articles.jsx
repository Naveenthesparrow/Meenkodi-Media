import React, { useState, useEffect } from 'react';
import SEO, { pageSEO } from './common/SEO';
import { 
  Container, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Button, 
  Box, 
  IconButton, 
  Fade,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Badge,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
} from '@mui/material';
import PageHeading from './common/PageHeading';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Cancel, Visibility, Favorite, FavoriteBorder, Edit as EditIcon, Close as CloseIcon, Save as SaveIcon, Delete as DeleteIcon, Settings as SettingsIcon, ArrowUpward, ArrowDownward, DragIndicator } from '@mui/icons-material';
import ArticleComposer from './ArticleComposer';
import MediaUpload from './common/MediaUpload';
import { useBilingualContent } from "../utils/bilingualContent";
import { useTranslation } from 'react-i18next';

const stripMarkdownForSnippet = (text) => {
  if (!text) return '';
  return text
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '') // remove images
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // keep link text only, remove url
    .replace(/\*\*([^*]+)\*\*/g, '$1') // remove bold formatting syntax
    .replace(/\*([^*]+)\*/g, '$1') // remove italic formatting syntax
    .replace(/`([^`]+)`/g, '$1') // remove code formatting syntax
    .replace(/(#+)\s+(.*)/g, '$2'); // remove header hash symbols
};

const toAbsoluteMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('data:')) return url;
  const withLeading = url.startsWith('/') ? url : `/${url}`;
  return withLeading;
};

let cachedArticlesData = null;

export default function Articles({ user }) {
  const getContent = useBilingualContent();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [articlesRaw, setArticlesRaw] = useState(cachedArticlesData || []);
  const setArticles = (val) => {
    if (typeof val === 'function') {
      setArticlesRaw(prev => {
        const next = val(prev);
        cachedArticlesData = next;
        return next;
      });
    } else {
      cachedArticlesData = val;
      setArticlesRaw(val);
    }
  };
  const articles = articlesRaw;
  const [loading, setLoading] = useState(!cachedArticlesData);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState('published');
  const [pendingCount, setPendingCount] = useState(0);
  const [showComposer, setShowComposer] = useState(false);

  // Edit Article States
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [editLanguage, setEditLanguage] = useState('en');
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editTitleTa, setEditTitleTa] = useState('');
  const [editContentEn, setEditContentEn] = useState('');
  const [editContentTa, setEditContentTa] = useState('');
  const [editImageLink, setEditImageLink] = useState('');
  const [editImage, setEditImage] = useState('');
  const [savingArticle, setSavingArticle] = useState(false);

  // Manage Articles States
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [manageArticlesList, setManageArticlesList] = useState([]);
  const [manageFilterTab, setManageFilterTab] = useState('all');
  const [savingOrder, setSavingOrder] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  const handleOpenEditModal = (article) => {
    setSelectedArticleId(article._id);
    setEditTitleEn(article.title?.en || '');
    setEditTitleTa(article.title?.ta || '');
    setEditContentEn(article.content?.en || '');
    setEditContentTa(article.content?.ta || '');
    setEditImageLink(article.imageLink || '');
    setEditImage(article.image || '');
    
    // Choose the default language based on content availability
    let defaultLang = i18n.language === 'ta' ? 'ta' : 'en';
    if (defaultLang === 'en' && !(article.title?.en || article.content?.en) && (article.title?.ta || article.content?.ta)) {
      defaultLang = 'ta';
    } else if (defaultLang === 'ta' && !(article.title?.ta || article.content?.ta) && (article.title?.en || article.content?.en)) {
      defaultLang = 'en';
    }
    setEditLanguage(defaultLang);
    setEditDialogOpen(true);
  };

  const handleSaveEditedArticle = async () => {
    setSavingArticle(true);
    try {
      const payload = {
        title: { en: editTitleEn, ta: editTitleTa },
        content: { en: editContentEn, ta: editContentTa },
        imageLink: editImageLink,
        image: editImage,
      };

      const response = await fetch(`/api/articles/${selectedArticleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to save article changes');
      
      const updatedData = await response.json();
      
      // Update local state so the grid refreshes immediately
      setArticles(prev => prev.map(art => art._id === selectedArticleId ? { ...art, ...updatedData } : art));
      setEditDialogOpen(false);
    } catch (err) {
      alert(err.message || 'Error saving changes');
    } finally {
      setSavingArticle(false);
    }
  };

  const handleDeleteArticle = async (e, article) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        const response = await fetch(`/api/articles/${article._id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('Failed to delete article');

        // Remove from local state
        setArticles(prev => prev.filter(art => art._id !== article._id));
        // Update pending count if it was pending
        if (article.status === 'pending') {
          setPendingCount(prev => Math.max(0, prev - 1));
        }
      } catch (err) {
        alert(err.message || 'Error deleting article');
      }
    }
  };
  
  const handleOpenManageArticles = () => {
    setManageArticlesList([...articles]);
    setManageFilterTab('all');
    setManageDialogOpen(true);
  };

  const handleMoveArticleInManageList = (item, direction) => {
    const globalIndex = manageArticlesList.findIndex(art => art._id === item._id);
    if (globalIndex === -1) return;
    
    const targetGlobalIndex = direction === 'up' ? globalIndex - 1 : globalIndex + 1;
    if (targetGlobalIndex < 0 || targetGlobalIndex >= manageArticlesList.length) return;
    
    const updated = [...manageArticlesList];
    const temp = updated[globalIndex];
    updated[globalIndex] = updated[targetGlobalIndex];
    updated[targetGlobalIndex] = temp;
    setManageArticlesList(updated);
  };

  const handleDragStartArticle = (index) => {
    setDragIndex(index);
  };

  const handleDropArticle = (targetIndex) => {
    if (dragIndex === null || dragIndex === targetIndex) return;
    const updated = [...manageArticlesList];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setManageArticlesList(updated);
    setDragIndex(null);
  };

  const handleUpdateArticleStatus = async (articleId, newStatus) => {
    try {
      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update article status');

      // Update in our manage list state
      setManageArticlesList(prev => prev.map(art => art._id === articleId ? { ...art, status: newStatus } : art));

      // Also update in the main articles state so the grid updates instantly!
      setArticles(prev => prev.map(art => art._id === articleId ? { ...art, status: newStatus } : art));
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleSaveArticleOrder = async () => {
    setSavingOrder(true);
    try {
      const orderedIds = manageArticlesList.map(art => art._id);
      const response = await fetch('/api/articles/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderedIds })
      });

      if (!response.ok) throw new Error('Failed to save article sequence');

      // Update the main articles list to match the new order!
      setArticles(manageArticlesList);
      setManageDialogOpen(false);
    } catch (err) {
      alert(err.message || 'Error saving article order');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleLike = async (articleId) => {
    if (!user) {
      alert(t('articles.loginToLike', 'Please login to like articles'));
      return;
    }

    let rollbackArticles = [];
    setArticles((prev) => {
      rollbackArticles = prev;
      return prev.map((art) => {
        if (art._id === articleId) {
          const userLiked = !art.userLiked;
          const likesCount = Math.max(0, art.likesCount + (userLiked ? 1 : -1));
          return { ...art, userLiked, likesCount };
        }
        return art;
      });
    });

    try {
      const response = await fetch(`/api/articles/${articleId}/like`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to like article");

      // Verify and set state with server confirmation
      setArticles((prev) =>
        prev.map((art) =>
          art._id === articleId
            ? { ...art, likesCount: data.likesCount, userLiked: data.userLiked }
            : art
        )
      );
    } catch (err) {
      // Rollback to original state on network/server error
      setArticles(rollbackArticles);
      alert(err.message || 'Error processing like');
    }
  };
  
  
  useEffect(() => {
    const loadArticles = async () => {
      // Only block with a spinner on first load — afterwards revalidate silently
      if (!cachedArticlesData) setLoading(true);
      try {
        const res = await fetch('/api/articles');
        if (!res.ok) throw new Error('Failed to fetch articles');
        const data = await res.json();
        setArticles(data);
        const pending = Array.isArray(data) ? data.filter(a => a.status === 'pending').length : 0;
        setPendingCount(pending);
        setLoading(false);
      } catch (err) {
        if (!cachedArticlesData) setError(err.message || String(err));
        setLoading(false);
      }
    };
    loadArticles();
  }, []);

  const handlePostCreated = (newArticle) => {
    // Add the new article to the list
    setArticles(prevArticles => [newArticle, ...prevArticles]);
    
    // Update pending count if the new article is pending
    if (newArticle.status === 'pending') {
      setPendingCount(prevCount => prevCount + 1);
    }
    
    // Hide the composer
    setShowComposer(false);
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <>
      <SEO {...pageSEO.articles} />
      <Box sx={{
        width: '100%',
        backgroundColor: '#fff',
        backgroundImage: {
        xs: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.02' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`,
        md: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.03' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`
      },
      backgroundSize: { xs: '8px 8px', md: '6px 6px' },
      backgroundRepeat: 'repeat',
      backgroundPosition: 'center top',
      '@media (min-resolution: 1.5dppx)': {
        backgroundImage: {
          xs: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.12' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`,
          md: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.14' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`
        },
        backgroundSize: { xs: '18px 18px', md: '14px 14px' }
      }
    }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 2, sm: 3, md: 3 }, pb: 4, position: 'relative' }}>
      <PageHeading 
        typographySx={{ fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.6rem' } }}
        leftActions={user && user.role === 'admin' ? (
          <Button
            onClick={handleOpenManageArticles}
            variant="outlined"
            startIcon={<SettingsIcon sx={{ fontSize: '1rem !important' }} />}
            size="small"
            sx={{
              borderColor: '#8B0000',
              color: '#8B0000',
              '&:hover': {
                bgcolor: 'rgba(139,0,0,0.08)',
                borderColor: '#8B0000',
              },
              borderRadius: 0,
              fontFamily: 'Georgia, serif',
              fontSize: '0.85rem',
              fontWeight: 600,
              px: 2,
              py: 0.75,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Manage Articles
          </Button>
        ) : null}
        actions={user && user.role === 'admin' && !showComposer ? (
          <Button
            variant="contained"
            onClick={() => setShowComposer(true)}
            sx={{
              bgcolor: '#8B0000',
              color: '#fff',
              px: 3,
              py: 1,
              fontSize: '0.85rem',
              fontWeight: 700,
              fontFamily: 'Georgia, serif',
              borderRadius: 0,
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              '&:hover': {
                bgcolor: '#6B0000',
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            + {t('articles.writeArticle', 'Write Article')}
          </Button>
        ) : null}
      >
        {t('articles.title', 'Articles')}
      </PageHeading>

      {/* Post Composer */}
      {user && showComposer && (
        <Box sx={{ position: 'relative', mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/my-articles')}
              sx={{
                borderColor: 'rgba(139,0,0,0.4)',
                color: '#8B0000',
                borderRadius: 999,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: 'rgba(139,0,0,0.08)',
                  borderColor: '#8B0000',
                },
              }}
            >
              {t('articles.myArticles', 'My Articles')}
            </Button>
            <Button
              onClick={() => setShowComposer(false)}
              variant="outlined"
              sx={{
                borderColor: '#bbb',
                color: '#666',
                borderRadius: 999,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#8B0000',
                  color: '#8B0000',
                  bgcolor: 'rgba(139,0,0,0.05)',
                }
              }}
            >
              {t('articles.closeEditor', 'Close Editor')}
            </Button>
          </Box>
          <ArticleComposer user={user} onPostCreated={handlePostCreated} />
        </Box>
      )}

      {!user && (
        <Alert severity="info" sx={{ mb: 4 }}>
          {t('articles.loginToPost', 'Please login to share your articles')}
        </Alert>
      )}

      {/* Articles Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          },
          gap: { xs: 3, md: 4 },
          pt: 2,
        }}
      >
        {articles.map((article, index) => (
          <Fade 
            in={true} 
            timeout={500 + index * 150} 
            key={article._id}
          >
            <Box
              sx={{
                width: '100%',
                transition: 'all 0.3s ease',
              }}
            >
              <Card
                component={Link}
                to={`/articles/${article._id}`}
                sx={{
                  textDecoration: 'none',
                  width: '100%',
                  height: 'auto',
                  minHeight: { xs: 520, md: 560 },
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid #e5e5e5',
                  borderRadius: 3,
                  bgcolor: "#fff",
                  transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    bgcolor: '#8B0000',
                    transform: 'scaleY(0)',
                    transformOrigin: 'top',
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: '0 12px 28px rgba(139,0,0,0.15), 0 4px 8px rgba(0,0,0,0.08)',
                    borderColor: '#8B0000',
                    '&::after': {
                      transform: 'scaleY(1)',
                    },
                    "& .article-image": {
                      transform: 'scale(1.05)',
                    },
                    "& .article-image-overlay": {
                      opacity: 0.7,
                    },
                    "& .status-badge": {
                      transform: 'translateY(-4px)',
                    },
                    "& .read-more-btn": {
                      bgcolor: '#8B0000',
                      color: '#fff',
                      borderColor: '#8B0000',
                      '& svg': {
                        transform: 'translateX(4px)',
                      }
                    },
                    "& .article-title": {
                      color: '#8B0000',
                    },
                    "& .category-tag": {
                      bgcolor: '#8B0000',
                      color: '#fff',
                    }
                  },
                }}
              >
                {/* Image Section */}
                <Box sx={{ position: 'relative', height: 260, overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                  {(article.imageLink || article.image) ? (
                    <>
                      <CardMedia
                        component="img"
                        image={article.imageLink || article.image}
                        alt={getContent(article.title)}
                        className="article-image"
                        sx={{ 
                          objectFit: "cover",
                          width: '100%',
                          height: '100%',
                          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'%3E%3Crect fill='%23f5f5f5' width='400' height='260'%3E%3C/rect%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Georgia, serif' font-size='16px' fill='%23999'%3E📰 Article%3C/text%3E%3C/svg%3E";
                        }}
                      />
                      {/* Subtle overlay */}
                      <Box
                        className="article-image-overlay"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          bgcolor: 'rgba(139, 0, 0, 0.05)',
                          opacity: 0,
                          transition: 'opacity 0.4s ease',
                          pointerEvents: 'none',
                        }}
                      />
                    </>
                  ) : (
                    <Box
                      sx={{
                        height: '100%',
                        width: '100%',
                        background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      <Box sx={{ fontSize: '3rem' }}>📰</Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'Georgia, serif',
                          color: '#999',
                          fontWeight: 500,
                        }}
                      >
                        {t('common.article', 'Article')}
                      </Typography>
                    </Box>
                  )}

                  {/* Status Badge - Top Right */}
                  {article.status && article.status !== 'published' && (
                    <Chip 
                      className="status-badge"
                      label={article.status.toUpperCase()} 
                      size="small" 
                      color={article.status === 'pending' ? 'warning' : 'error'}
                      sx={{ 
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        fontSize: '0.7rem', 
                        height: 26,
                        fontWeight: 700,
                        borderRadius: '4px',
                        transition: 'transform 0.3s ease',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }}
                    />
                  )}

                  {/* Action Buttons for Authorized Users */}
                  {(() => {
                    if (!user) return null;
                    const canEdit = user.role === 'admin' || user._id === article.authorId;
                    const canDelete = user.role === 'admin';
                    
                    const badgeOffset = article.status && article.status !== 'published' ? 80 : 0;
                    
                    return (
                      <>
                        {canEdit && (
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(article);
                            }}
                            sx={{
                              position: 'absolute',
                              top: 16,
                              right: 16 + badgeOffset + (canDelete ? 40 : 0),
                              bgcolor: 'rgba(255, 255, 255, 0.95)',
                              color: '#8B0000',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                              zIndex: 10,
                              '&:hover': {
                                bgcolor: '#8B0000',
                                color: '#fff',
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        )}
                        
                        {canDelete && (
                          <IconButton
                            size="small"
                            onClick={(e) => handleDeleteArticle(e, article)}
                            sx={{
                              position: 'absolute',
                              top: 16,
                              right: 16 + badgeOffset,
                              bgcolor: 'rgba(255, 255, 255, 0.95)',
                              color: '#d32f2f',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                              zIndex: 10,
                              '&:hover': {
                                bgcolor: '#d32f2f',
                                color: '#fff',
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </>
                    );
                  })()}

                  {/* Category Tag - Top Left */}
                  <Box
                    className="category-tag"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      bgcolor: 'rgba(255,255,255,0.95)',
                      color: '#8B0000',
                      px: 2,
                      py: 0.5,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderRadius: '4px',
                      backdropFilter: 'blur(8px)',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    {t('common.article', 'Article')}
                  </Box>
                </Box>
                <CardContent
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  {/* Title & Content */}
                  <Box sx={{ mb: 'auto' }}>
                    {/* Date */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mb: 1.5,
                      color: '#8B0000',
                      bgcolor: 'rgba(139, 0, 0, 0.05)',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '20px',
                      width: 'fit-content',
                    }}>
                      <Box 
                        component="svg" 
                        sx={{ width: 14, height: 14, fill: 'currentColor' }} 
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                      </Box>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 700,
                          letterSpacing: '0.4px',
                          textTransform: 'uppercase',
                          color: '#8B0000',
                        }}
                      >
                        {new Date(article.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </Typography>
                    </Box>

                    <Typography
                      className="article-title"
                      variant="h5"
                      sx={{
                        fontWeight: 700, 
                        color: "#FFB700", 
                        mb: 2,
                        lineHeight: 1.35,
                        fontSize: { xs: '1.2rem', md: '1.35rem' },
                        fontFamily: 'Georgia, serif',
                        transition: 'color 0.3s ease',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: { xs: '3.2rem', md: '3.6rem' },
                      }}
                    >
                      {getContent(article.title)}
                    </Typography>

                    <Box
                      sx={{ 
                        color: "#666", 
                        lineHeight: 1.75, 
                        fontSize: '0.95rem',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '5rem',
                        mb: 2,
                        '& strong': {
                          fontWeight: 700,
                          color: '#1a1a1a',
                        },
                        '& em': {
                          fontStyle: 'italic',
                          color: '#555',
                        },
                      }}
                      dangerouslySetInnerHTML={{
                        __html: (() => {
                          const rawContent = getContent(article.content);
                          const cleanContent = stripMarkdownForSnippet(rawContent);
                          const contentPreview = cleanContent.length > 140 ? `${cleanContent.substring(0, 140)}...` : cleanContent;
                          return contentPreview;
                        })()
                      }}
                    />
                  </Box>

                  {/* Admin Actions for pending articles */}
                  {user && user.role === 'admin' && article.status === 'pending' && (
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(article._id);
                        }}
                        variant="contained"
                        size="small"
                        startIcon={<CheckCircle />}
                        sx={{ 
                          bgcolor: '#4CAF50', 
                          '&:hover': { bgcolor: '#45a049', transform: 'translateY(-2px)' },
                          flex: 1,
                          borderRadius: 0,
                          fontSize: '0.8rem',
                          py: 0.8,
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {t('actions.approve', 'Approve')}
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(article._id);
                        }}
                        variant="contained"
                        size="small"
                        startIcon={<Cancel />}
                        color="error"
                        sx={{ 
                          flex: 1,
                          borderRadius: 0,
                          fontSize: '0.8rem',
                          py: 0.8,
                          '&:hover': { transform: 'translateY(-2px)' },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {t('actions.reject', 'Reject')}
                      </Button>
                    </Box>
                  )}

                  {/* Bottom Section */}
                  <Box>
                    {/* Divider */}
                    <Box sx={{ 
                      height: '1px', 
                      bgcolor: '#e5e5e5', 
                      mb: 2,
                      mx: -0.5,
                    }} />

                    {/* Likes and Action */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      gap: 2,
                    }}>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLike(article._id);
                        }}
                        startIcon={article.userLiked ? <Favorite /> : <FavoriteBorder />}
                        variant="text"
                        size="small"
                        sx={{
                          color: article.userLiked ? '#8B0000' : '#666',
                          fontWeight: 600,
                          textTransform: 'none',
                          px: 1.5,
                          py: 0.75,
                          fontSize: '0.85rem',
                          minWidth: 'auto',
                          '&:hover': { 
                            bgcolor: 'rgba(139,0,0,0.08)',
                            color: '#8B0000',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {article.likesCount || 0}
                      </Button>

                      <Button
                        component={Link}
                        to={`/articles/${article._id}`}
                        className="read-more-btn"
                        variant="text"
                        size="small"
                        endIcon={
                          <Box 
                            component="svg" 
                            sx={{ 
                              width: 18, 
                              height: 18, 
                              fill: 'currentColor',
                              transition: 'transform 0.3s ease',
                            }} 
                            viewBox="0 0 24 24"
                          >
                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                          </Box>
                        }
                        sx={{
                          color: "#8B0000",
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          px: 2,
                          py: 0.75,
                          borderRadius: '6px',
                          transition: 'all 0.3s ease',
                          "&:hover": { 
                            bgcolor: "#8B0000",
                            color: '#fff',
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        {t('actions.readMore', 'Read More')}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Fade>
        ))}
      </Box>

      {/* Back Button */}
      <Box sx={{ mt: 6, mb: 4, textAlign: 'center' }}>
        <Button
          onClick={() => navigate('/')}
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
          ← {t('actions.backToHome', 'Back to Home')}
        </Button>
      </Box>
      {/* Edit Article Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '2px solid #8B0000' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, fontFamily: 'Georgia, serif', color: '#8B0000' }}>
            {t('articles.edit', 'Edit Article')}
          </Typography>
          <IconButton onClick={() => setEditDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Language Selector */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1.5, bgcolor: '#fafafa', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#333' }}>
              Select Language to Edit:
            </Typography>
            <ToggleButtonGroup
              value={editLanguage}
              exclusive
              onChange={(e, newLang) => newLang && setEditLanguage(newLang)}
              sx={{
                '& .MuiToggleButton-root': {
                  px: 3,
                  py: 0.75,
                  border: '2px solid #8B0000',
                  color: '#8B0000',
                  fontWeight: 700,
                  '&.Mui-selected': {
                    bgcolor: '#8B0000',
                    color: '#fff',
                    '&:hover': { bgcolor: '#6B0000' },
                  },
                },
              }}
            >
              <ToggleButton value="en">ENGLISH</ToggleButton>
              <ToggleButton value="ta">தமிழ்</ToggleButton>
            </ToggleButtonGroup>
            <Typography variant="caption" sx={{ mt: 1, color: '#666', fontStyle: 'italic' }}>
              {editLanguage === 'en'
                ? "Note: If your article content is in Tamil, click the 'தமிழ்' button above to edit it."
                : "குறிப்பு: உங்கள் கட்டுரை ஆங்கிலத்தில் இருந்தால், அதைத் திருத்த மேலே உள்ள 'ENGLISH' பொத்தானைக் கிளிக் செய்யவும்."}
            </Typography>
          </Box>

          {/* Title Input */}
          <TextField
            label={editLanguage === 'en' ? 'Title (English)' : 'தலைப்பு (தமிழ்)'}
            value={editLanguage === 'en' ? editTitleEn : editTitleTa}
            onChange={(e) => editLanguage === 'en' ? setEditTitleEn(e.target.value) : setEditTitleTa(e.target.value)}
            fullWidth
            variant="outlined"
          />

          {/* Content Input */}
          <TextField
            label={editLanguage === 'en' ? 'Content (English)' : 'உள்ளடக்கம் (தமிழ்)'}
            value={editLanguage === 'en' ? editContentEn : editContentTa}
            onChange={(e) => editLanguage === 'en' ? setEditContentEn(e.target.value) : setEditContentTa(e.target.value)}
            fullWidth
            multiline
            rows={10}
            variant="outlined"
            placeholder="Write content here..."
            sx={{ '& textarea': { fontFamily: 'Georgia, serif' } }}
          />

          {/* Thumbnail / Image Upload */}
          <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1, border: '1px dashed #ccc' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#8B0000' }}>
              ARTICLE THUMBNAIL (IMAGE)
            </Typography>
            <MediaUpload
              onImageLinkChange={setEditImageLink}
              onImageChange={setEditImage}
              currentImageLink={editImageLink}
              currentImage={editImage}
              label="Article Thumbnail"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1.5, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => setEditDialogOpen(false)} variant="outlined" sx={{ color: '#666', borderColor: '#ccc' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveEditedArticle}
            variant="contained"
            disabled={savingArticle}
            startIcon={savingArticle ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{
              bgcolor: '#8B0000',
              color: '#fff',
              fontWeight: 700,
              px: 3,
              '&:hover': { bgcolor: '#6B0000' }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Articles Dialog */}
      <Dialog
        open={manageDialogOpen}
        onClose={() => setManageDialogOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 0,
            border: '3px solid #8B0000',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: '#8B0000',
            color: '#fff',
            fontFamily: 'Georgia, serif',
            fontWeight: 700,
            textAlign: 'center',
            py: 2,
          }}
        >
          MANAGE ARTICLES & SEQUENCE
        </DialogTitle>

        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Tab Filter inside Dialog */}
          <Box sx={{ display: 'flex', justifyContent: 'center', borderBottom: '1px solid #e0e0e0', pb: 1 }}>
            <Tabs 
              value={manageFilterTab} 
              onChange={(e, v) => setManageFilterTab(v)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  fontFamily: 'Georgia, serif',
                  minWidth: 100,
                },
                '& .MuiTabs-indicator': { bgcolor: '#8B0000' },
                '& .Mui-selected': { color: '#8B0000 !important' }
              }}
            >
              <Tab label="All" value="all" />
              <Tab label="Published" value="published" />
              <Tab label="Pending" value="pending" />
              <Tab label="Rejected" value="rejected" />
            </Tabs>
          </Box>

          <Typography variant="caption" sx={{ color: '#666', fontStyle: 'italic', textAlign: 'center', display: 'block' }}>
            Tip: You can drag and drop rows, or use the Up/Down arrow buttons to reorder articles globally in the sequence below.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: '55vh', overflowY: 'auto', pr: 1 }}>
            {manageArticlesList.filter(art => {
              if (manageFilterTab === 'all') return true;
              return art.status === manageFilterTab;
            }).map((article) => {
              const globalIdx = manageArticlesList.findIndex(art => art._id === article._id);
              const isFirst = globalIdx === 0;
              const isLast = globalIdx === manageArticlesList.length - 1;

              return (
                <Box
                  key={article._id}
                  draggable
                  onDragStart={() => handleDragStartArticle(globalIdx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropArticle(globalIdx)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    border: '1px solid #e0e0e0',
                    bgcolor: '#fff',
                    transition: 'all 0.2s',
                    cursor: 'grab',
                    '&:active': { cursor: 'grabbing' },
                    '&:hover': {
                      borderColor: '#8B0000',
                      bgcolor: '#fafafa',
                    }
                  }}
                >
                  {/* Drag Indicator Handle */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#8B0000',
                      opacity: 0.5,
                      mr: 0.5
                    }}
                  >
                    <DragIndicator fontSize="small" />
                  </Box>

                  {/* Thumbnail Avatar */}
                  <Avatar
                    variant="square"
                    src={toAbsoluteMediaUrl(article.imageLink || article.image)}
                    sx={{ width: 44, height: 44, border: '1px solid #eee', bgcolor: '#f5f5f5' }}
                  >
                    📝
                  </Avatar>

                  {/* Title and Date */}
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        fontWeight: 700, 
                        fontFamily: 'Georgia, serif', 
                        color: '#000',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {getContent(article.title)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#888' }}>
                      By {article.authorName || 'Author'} • {new Date(article.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {/* Status Badge */}
                  <Chip
                    label={article.status?.toUpperCase() || 'PENDING'}
                    size="small"
                    color={
                      article.status === 'published' ? 'success' :
                      article.status === 'pending' ? 'warning' : 'error'
                    }
                    sx={{ fontWeight: 700, fontSize: '0.65rem', borderRadius: '4px', height: 22 }}
                  />

                  {/* Inline Reorder Actions */}
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      disabled={isFirst}
                      onClick={() => handleMoveArticleInManageList(article, 'up')}
                      sx={{ bgcolor: '#f5f5f5' }}
                    >
                      <ArrowUpward fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      disabled={isLast}
                      onClick={() => handleMoveArticleInManageList(article, 'down')}
                      sx={{ bgcolor: '#f5f5f5' }}
                    >
                      <ArrowDownward fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Inline Moderation Actions */}
                  <Box sx={{ display: 'flex', gap: 0.5, borderLeft: '1px solid #ddd', pl: 1.5 }}>
                    {article.status !== 'published' && (
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleUpdateArticleStatus(article._id, 'published')}
                        title="Approve & Publish"
                      >
                        <CheckCircle fontSize="small" />
                      </IconButton>
                    )}
                    {article.status !== 'rejected' && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleUpdateArticleStatus(article._id, 'rejected')}
                        title="Reject & Hide"
                      >
                        <Cancel fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        setManageDialogOpen(false);
                        handleOpenEditModal(article);
                      }}
                      title="Edit text"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm("Are you sure you want to delete this article?")) {
                          try {
                            const res = await fetch(`/api/articles/${article._id}`, {
                              method: 'DELETE',
                              credentials: 'include',
                            });
                            if (res.ok) {
                              setManageArticlesList(prev => prev.filter(art => art._id !== article._id));
                              setArticles(prev => prev.filter(art => art._id !== article._id));
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                      title="Delete permanently"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1.5, borderTop: '1px solid #e0e0e0' }}>
          <Button onClick={() => setManageDialogOpen(false)} variant="outlined" sx={{ color: '#666', borderColor: '#ccc' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveArticleOrder}
            variant="contained"
            disabled={savingOrder}
            startIcon={savingOrder ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{
              bgcolor: '#8B0000',
              color: '#fff',
              fontWeight: 700,
              px: 3,
              '&:hover': { bgcolor: '#6B0000' }
            }}
          >
            Save Sequence
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </Box>
    </>
  );
}
