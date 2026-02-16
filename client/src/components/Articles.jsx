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
} from '@mui/material';
import PageHeading from './common/PageHeading';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Cancel, Visibility, Favorite, FavoriteBorder } from '@mui/icons-material';
import ArticleComposer from './ArticleComposer';
import { useBilingualContent } from "../utils/bilingualContent";
import { useTranslation } from 'react-i18next';

export default function Articles({ user }) {
  const getContent = useBilingualContent();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState('published');
  const [pendingCount, setPendingCount] = useState(0);
  const [showComposer, setShowComposer] = useState(false);
  
  useEffect(() => {
    const loadArticles = async () => {
      try {
        const res = await fetch('/api/articles');
        if (!res.ok) throw new Error('Failed to fetch articles');
        const data = await res.json();
        setArticles(data);
        const pending = Array.isArray(data) ? data.filter(a => a.status === 'pending').length : 0;
        setPendingCount(pending);
        setLoading(false);
      } catch (err) {
        setError(err.message || String(err));
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
      <PageHeading typographySx={{ fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.6rem' } }}>
        {t('articles.title', 'Articles')}
      </PageHeading>

      {/* Admin Tabs */}
      {user && user.role === 'admin' && (
        <Box sx={{ 
          mb: 5, 
          display: 'flex', 
          justifyContent: 'center',
        }}>
          <Box sx={{
            bgcolor: 'rgba(139,0,0,0.04)',
            border: '1px solid rgba(139,0,0,0.15)',
            borderRadius: 999,
            px: { xs: 0.5, md: 1 },
            py: { xs: 0.5, md: 0.75 },
          }}>
            <Tabs 
              value={currentTab} 
              onChange={(e, v) => setCurrentTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 44,
                '& .MuiTabs-flexContainer': {
                  gap: { xs: 0.5, md: 1 },
                },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: { xs: '0.85rem', md: '0.95rem' },
                  color: '#5a5a5a',
                  minHeight: 40,
                  px: { xs: 2, md: 3 },
                  borderRadius: 999,
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    color: '#8B0000',
                    bgcolor: 'rgba(139,0,0,0.08)',
                  },
                  '&.Mui-selected': {
                    color: '#fff',
                    bgcolor: '#8B0000',
                    boxShadow: '0 6px 16px rgba(139,0,0,0.25)',
                  },
                },
                '& .MuiTabs-indicator': {
                  display: 'none',
                },
              }}
            >
            <Tab label={t('articles.tabs.published', 'Published')} value="published" />
            <Tab 
              label={
                <Badge badgeContent={pendingCount} color="error" sx={{ '& .MuiBadge-badge': { right: -6, top: 6 } }}>
                  {t('articles.tabs.pending', 'Pending')}
                </Badge>
              }
              value="pending"
            />
            <Tab label={t('articles.tabs.rejected', 'Rejected')} value="rejected" />
            </Tabs>
          </Box>
        </Box>
      )}

      {/* Write Article + My Articles Buttons */}
      {user && !showComposer && (
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{
            display: 'flex',
            gap: 1,
            p: 0.75,
            borderRadius: 999,
            bgcolor: 'rgba(139,0,0,0.06)',
            border: '1px solid rgba(139,0,0,0.15)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            <Button
              variant="contained"
              onClick={() => setShowComposer(true)}
              sx={{
                bgcolor: '#8B0000',
                color: '#fff',
                px: { xs: 3, md: 4 },
                py: 1.2,
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: 999,
                textTransform: 'none',
                boxShadow: '0 8px 18px rgba(139,0,0,0.35)',
                '&:hover': {
                  bgcolor: '#6B0000',
                  boxShadow: '0 10px 22px rgba(139,0,0,0.45)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
                minWidth: { xs: 160, md: 180 },
              }}
            >
              ✍️ {t('articles.writeArticle', 'Write Article')}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/my-articles')}
              sx={{
                borderColor: 'rgba(139,0,0,0.4)',
                color: '#8B0000',
                px: { xs: 3, md: 4 },
                py: 1.2,
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: 999,
                textTransform: 'none',
                bgcolor: '#fff',
                '&:hover': {
                  bgcolor: 'rgba(139,0,0,0.08)',
                  borderColor: '#8B0000',
                },
                minWidth: { xs: 150, md: 170 },
              }}
            >
              {t('articles.myArticles', 'My Articles')}
            </Button>
          </Box>
        </Box>
      )}

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
                sx={{
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
                onClick={() => navigate(`/articles/${article._id}`)}
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
                          const contentPreview = rawContent.length > 140 ? `${rawContent.substring(0, 140)}...` : rawContent;
                          // Quick markdown parsing for bold and italic
                          return contentPreview
                            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*([^*]+)\*/g, '<em>$1</em>');
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
                        disabled={!user}
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
      </Container>
    </Box>
    </>
  );
}
