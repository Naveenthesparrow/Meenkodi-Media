import React, { useState, useEffect } from 'react';
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
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Cancel, Visibility } from '@mui/icons-material';
import ArticleComposer from './ArticleComposer';
import API_BASE_URL from "../utils/api";
import { useBilingualContent } from "../utils/bilingualContent";
import { useTranslation } from 'react-i18next';

export default function Articles({ user }) {
  const getContent = useBilingualContent();
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState('published');
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
    if (user && user.role === 'admin') {
      fetchPendingCount();
    }
  }, [currentTab, user]);

  const fetchArticles = async () => {
    try {
      const statusParam = currentTab === 'published' ? '' : `?status=${currentTab}`;
      const response = await fetch(`${API_BASE_URL}/api/articles${statusParam}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data = await response.json();
      setArticles(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setArticles([]);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/articles/pending/count`, {
        credentials: 'include',
      });
      const data = await response.json();
      setPendingCount(data.count || 0);
    } catch (err) {
      console.error('Failed to fetch pending count:', err);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/articles/${id}/approve`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to approve article');
      fetchArticles();
      fetchPendingCount();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt(t('articles.rejectReason', 'Reason for rejection (optional):'));
    try {
      const response = await fetch(`${API_BASE_URL}/api/articles/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error('Failed to reject article');
      fetchArticles();
      fetchPendingCount();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePostCreated = () => {
    fetchArticles();
    if (user && user.role === 'admin') {
      fetchPendingCount();
    }
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
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      {/* Heading */}
      <Box 
        sx={{ 
          mb: 4, 
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 0 },
        }}
      >
        <Typography
          variant="h2" 
            sx={{
            fontWeight: 500, 
            color: "#8B0000", 
            position: 'relative',
            display: 'inline-block',
            letterSpacing: -1,
            padding: '0 10px',
            transition: 'all 0.3s ease',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '-50px',
              width: '40px',
              height: '3px',
              backgroundColor: '#8B0000',
              transform: 'translateY(-50%)',
              transition: 'all 0.3s ease',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              right: '-50px',
              width: '40px',
              height: '3px',
              backgroundColor: '#8B0000',
              transform: 'translateY(-50%)',
              transition: 'all 0.3s ease',
            },
            '&:hover': {
              color: '#333',
              transform: 'scale(1.02)',
              '&::before': {
                width: '60px',
                left: '-70px',
                backgroundColor: '#666',
              },
              '&::after': {
                width: '60px',
                right: '-70px',
                backgroundColor: '#666',
              },
            },
          }}
        >
          {t('articles.title', 'Articles')}
        </Typography>
      </Box>

      {/* Admin Tabs */}
      {user && user.role === 'admin' && (
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)}>
            <Tab label={t('articles.tabs.published', 'Published')} value="published" />
            <Tab 
              label={
                <Badge badgeContent={pendingCount} color="error">
                  {t('articles.tabs.pending', 'Pending')}
                </Badge>
              }
              value="pending"
            />
            <Tab label={t('articles.tabs.rejected', 'Rejected')} value="rejected" />
          </Tabs>
        </Box>
      )}

      {/* Post Composer */}
      {user && <ArticleComposer user={user} onPostCreated={handlePostCreated} />}

      {!user && (
        <Alert severity="info" sx={{ mb: 4 }}>
          {t('articles.loginToPost', 'Please login to share your articles')}
        </Alert>
      )}

      {/* Articles Grid */}
      <Grid 
        container 
        spacing={4} 
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'stretch',
          perspective: '1000px', // 3D effect for cards
          transition: 'all 0.3s ease',
          '& > .MuiGrid-item': {
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.02)',
              zIndex: 10,
            }
          }
        }}
      >
        {articles.map((article, index) => (
          <Fade 
            in={true} 
            timeout={500 + index * 200} 
            key={article._id}
          >
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}
            >
              <Card
                sx={{
                  width: { xs: '100%', sm: 350 }, // Responsive width: full on xs, fixed on sm+
                  maxWidth: '100%', // Ensure it doesn't exceed parent on smaller screens
                  // height: 450, // Removed fixed height
                  display: 'flex',
                  flexDirection: 'column',
                  border: "3px solid #000",
                  borderRadius: 0,
                  bgcolor: "#fff",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  position: 'relative',
                  overflow: 'hidden',
                  "&::before": {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, transparent, transparent 40%, rgba(255,255,255,0.1) 40%, transparent 60%)',
                    transform: 'translateX(-100%)',
                    transition: 'transform 0.6s ease',
                  },
                  "&:hover": {
                    transform: "translateY(-15px) rotate(1deg)",
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    "&::before": {
                      transform: 'translateX(100%)',
                    },
                    "& .card-content": {
                      transform: "scale(1.02)",
                      opacity: 0.95,
                    }
                  },
                }}
                onClick={() => navigate(`/articles/${article._id}`)}
              >
                {(article.image) ? (
                  <CardMedia
                    component="img"
                    height={200} // Explicitly set height
                    image={article.image}
                    alt={getContent(article.title)}
                    sx={{ 
                      objectFit: "contain",
                      width: '100%',
                      maxHeight: 200,
                      backgroundColor: '#f0f0f0',
                      padding: '10px',
                      boxSizing: 'border-box',
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', article.image);
                      console.log('Full article object:', article);
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E";
                      e.target.style.display = 'block';
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      width: '100%',
                      backgroundColor: '#f0f0f0',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '10px',
                      boxSizing: 'border-box',
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      color="textSecondary"
                      sx={{ textAlign: 'center' }}
                    >
                      {t('common.noImage')}
                    </Typography>
                  </Box>
                )}
                <CardContent
                  className="card-content"
                  sx={{
                    p: 3,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Author info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#8B0000', fontSize: '0.875rem' }}>
                      {article.authorName ? article.authorName[0].toUpperCase() : 'A'}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                        {article.authorName || getContent(article.author) || 'Anonymous'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                        {new Date(article.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    {article.status && article.status !== 'published' && (
                      <Chip 
                        label={article.status.toUpperCase()} 
                        size="small" 
                        color={article.status === 'pending' ? 'warning' : 'error'}
                        sx={{ ml: 'auto', fontSize: '0.7rem', height: 20 }}
                      />
                    )}
                  </Box>

                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700, 
                        color: "#000", 
                        mb: 1,
                        lineHeight: 1.3,
                        fontSize: { xs: '1.25rem', md: '1.5rem' },
                        textTransform: 'capitalize',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {getContent(article.title)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ 
                        color: "#000", 
                        lineHeight: 1.6, 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: { xs: '4.2rem', md: '4.8rem' },
                      }}
                    >
                      {getContent(article.content).length > 150 
                        ? `${getContent(article.content).substring(0, 150)}...` 
                        : getContent(article.content)}
                    </Typography>
                  </Box>

                  {/* Admin Actions for pending articles */}
                  {user && user.role === 'admin' && article.status === 'pending' && (
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
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
                          '&:hover': { bgcolor: '#45a049' },
                          flex: 1,
                          borderRadius: 0,
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
                        }}
                      >
                        {t('actions.reject', 'Reject')}
                      </Button>
                    </Box>
                  )}

                  <Button
                    component={Link}
                    to={`/articles/${article._id}`}
                    variant="outlined"
                    fullWidth
                    startIcon={<Visibility />}
                    sx={{
                      color: "#000",
                      borderColor: "#000",
                      borderRadius: 0,
                      mt: 'auto',
                      "&:hover": { bgcolor: "#f5f5f5", borderColor: "#000" },
                    }}
                  >
                    {t('actions.readMore', 'Read more')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Fade>
        ))}
      </Grid>
      </Container>
    </Box>
  );
}
