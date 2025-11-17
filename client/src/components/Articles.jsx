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
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  CircularProgress,
  Alert
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { Add, Edit, Delete } from '@mui/icons-material';
import MediaUpload from './common/MediaUpload';
import API_BASE_URL from "../utils/api";
import { useBilingualContent } from "../utils/bilingualContent";
import { useTranslation } from 'react-i18next';

export default function Articles({ user }) {
  const getContent = useBilingualContent();
  const { t } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  // Separate bilingual edit fields
  const [currentArticle, setCurrentArticle] = useState({
    title_en: '',
    title_ta: '',
    author_en: '',
    author_ta: '',
    content_en: '',
    content_ta: '',
    category_en: '',
    category_ta: '',
    image: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/articles`);
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const data = await response.json();
      console.log('Fetched articles:', data);
      setArticles(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err.message);
      setLoading(false);
      setArticles([]); // Fallback to an empty array instead of dummy data
    }
  };

  const handleAdd = () => {
    setCurrentArticle({
      title_en: '', title_ta: '',
      author_en: '', author_ta: '',
      content_en: '', content_ta: '',
      category_en: '', category_ta: '',
      image: '',
    });
    setOpenDialog(true);
  };

  const handleEdit = (article) => {
    // Map incoming bilingual fields (may be localized with .translated)
    const toPart = (val, part) => {
      if (!val) return '';
      if (typeof val === 'string') return part === 'en' ? val : '';
      return val[part] || '';
    };
    setCurrentArticle({
      _id: article._id,
      title_en: toPart(article.title, 'en'),
      title_ta: toPart(article.title, 'ta'),
      author_en: toPart(article.author, 'en'),
      author_ta: toPart(article.author, 'ta'),
      content_en: toPart(article.content, 'en'),
      content_ta: toPart(article.content, 'ta'),
      category_en: toPart(article.category, 'en'),
      category_ta: toPart(article.category, 'ta'),
      image: article.image || '',
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const method = currentArticle._id ? 'PUT' : 'POST';
      const url = currentArticle._id 
        ? `${API_BASE_URL}/api/articles/${currentArticle._id}` 
        : `${API_BASE_URL}/api/articles`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: { en: currentArticle.title_en, ta: currentArticle.title_ta },
          author: { en: currentArticle.author_en, ta: currentArticle.author_ta },
          content: { en: currentArticle.content_en, ta: currentArticle.content_ta },
          category: { en: currentArticle.category_en, ta: currentArticle.category_ta },
          image: currentArticle.image,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save article');
      }

      const savedArticle = await response.json();
      
      if (method === 'POST') {
        setArticles([...articles, savedArticle]);
      } else {
        setArticles(articles.map(article => 
          article._id === savedArticle._id ? savedArticle : article
        ));
      }

      setOpenDialog(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/articles/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to delete article');
        }

        setArticles(articles.filter(article => article._id !== id));
      } catch (err) {
        setError(err.message);
      }
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
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      {/* Unique Heading Section */}
      <Box 
        sx={{ 
          mb: 6, 
          // textAlign: 'center', // Removed as flexbox will handle alignment
          position: 'relative',
          overflow: 'hidden',
          display: 'flex', // Added for flexbox layout
          alignItems: 'center', // Center items vertically
          justifyContent: user && user.role === "admin" ? 'space-between' : 'center', // Space between heading and button
          flexDirection: { xs: 'column', md: 'row' }, // Stack on small screens
          gap: { xs: 2, md: 0 }, // Gap when stacked
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
        
        {user && user.role === "admin" && (
          <Box 
            sx={{ 
              // Removed absolute positioning for responsiveness
              // position: 'absolute', 
              // right: 0, 
              // top: '50%', 
              // transform: 'translateY(-50%)',
              transition: 'all 0.3s ease',
              '&:hover': {
                // transform: 'translateY(-50%) scale(1.05)', 
                transform: 'scale(1.05)', // Adjusted for non-absolute positioning
                '& button': {
                  boxShadow: '0 8px 15px rgba(0,0,0,0.2)',
                  transform: 'translateY(-3px)',
                }
              }
            }}
          >
            <Button
              onClick={handleAdd}
              variant="contained"
              startIcon={<Add />}
              sx={{
                bgcolor: "#000",
                color: "#fff",
                transition: 'all 0.3s ease',
                "&:hover": { 
                  bgcolor: "#333",
                  boxShadow: '0 8px 15px rgba(0,0,0,0.2)',
                  transform: 'translateY(-3px)',
                },
                borderRadius: 0,
                px: 3,
              }}
            >
              {t('articles.add', 'Add Article')}
            </Button>
          </Box>
        )}
      </Box>

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
                      No Image Available (Debug: {JSON.stringify(article)})
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
                    // position: 'relative', // Removed as admin buttons are no longer absolute within CardContent
                    transition: 'all 0.3s ease',
                  }}
                >
                  {user && user.role === "admin" && (
                    <Box 
                      sx={{ 
                        // Removed absolute positioning for responsiveness
                        // position: 'absolute', 
                        // top: 10, 
                        // right: 10, 
                        display: "flex", 
                        justifyContent: 'flex-end', // Align buttons to the right
                        gap: 1, 
                        mb: 2, // Margin bottom to separate from title
                      }}
                    >
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(article);
                        }}
                        size="small"
                        sx={{
                          color: "#000",
                          bgcolor: 'rgba(255,255,255,0.7)',
                          "&:hover": { 
                            bgcolor: 'rgba(255,255,255,0.9)',
                            transform: 'scale(1.1)' 
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(article._id);
                        }}
                        size="small"
                        sx={{
                          color: "#000",
                          bgcolor: 'rgba(255,255,255,0.7)',
                          "&:hover": { 
                            bgcolor: 'rgba(255,255,255,0.9)',
                            transform: 'scale(1.1)' 
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  )}
                  <Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700, 
                        color: "#000", 
                        mb: 1,
                        lineHeight: 1.3,
                        fontSize: { xs: '1.25rem', md: '1.5rem' }, // Responsive font size
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
                        color: "#666",
                        fontStyle: "italic",
                        fontSize: { xs: '0.8rem', md: '0.9rem' }, // Responsive font size
                        mb: 2,
                        textTransform: 'capitalize',
                      }}
                    >
                      {getContent(article.author)}
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
                        minHeight: { xs: '4.2rem', md: '4.8rem' }, // Responsive minHeight
                      }}
                    >
                      {getContent(article.content).length > 150 
                        ? `${getContent(article.content).substring(0, 150)}...` 
                        : getContent(article.content)}
                    </Typography>
                  </Box>

                  <Button
                    component={Link}
                    to={`/articles/${article._id}`}
                    variant="outlined"
                    fullWidth
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

      {/* Edit/Add Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentArticle._id ? t('articles.edit', 'Edit Article') : t('articles.addNew', 'Add New Article')}
        </DialogTitle>
        <DialogContent>
          <TextField label="Title (EN)" fullWidth sx={{ mb:2 }} value={currentArticle.title_en} onChange={(e)=>setCurrentArticle({...currentArticle,title_en:e.target.value})} />
          <TextField label="Title (TA)" fullWidth sx={{ mb:2 }} value={currentArticle.title_ta} onChange={(e)=>setCurrentArticle({...currentArticle,title_ta:e.target.value})} />
          <TextField label="Author (EN)" fullWidth sx={{ mb:2 }} value={currentArticle.author_en} onChange={(e)=>setCurrentArticle({...currentArticle,author_en:e.target.value})} />
          <TextField label="Author (TA)" fullWidth sx={{ mb:2 }} value={currentArticle.author_ta} onChange={(e)=>setCurrentArticle({...currentArticle,author_ta:e.target.value})} />
          <TextField label="Category (EN)" fullWidth sx={{ mb:2 }} value={currentArticle.category_en} onChange={(e)=>setCurrentArticle({...currentArticle,category_en:e.target.value})} />
          <TextField label="Category (TA)" fullWidth sx={{ mb:2 }} value={currentArticle.category_ta} onChange={(e)=>setCurrentArticle({...currentArticle,category_ta:e.target.value})} />
          <TextField label="Content (EN)" fullWidth multiline minRows={5} sx={{ mb:2 }} value={currentArticle.content_en} onChange={(e)=>setCurrentArticle({...currentArticle,content_en:e.target.value})} />
          <TextField label="Content (TA)" fullWidth multiline minRows={5} sx={{ mb:2 }} value={currentArticle.content_ta} onChange={(e)=>setCurrentArticle({...currentArticle,content_ta:e.target.value})} />
          <MediaUpload
            onImageLinkChange={(link) => setCurrentArticle({...currentArticle, image: link})}
            onVideoLinkChange={(link) => setCurrentArticle({...currentArticle, videoLink: link})}
            onImageChange={(url) => setCurrentArticle({...currentArticle, image: url})}
            onVideoChange={(url) => setCurrentArticle({...currentArticle, videoUrl: url})}
            currentImageLink={currentArticle.image}
            currentVideoLink={currentArticle.videoLink}
            currentImage={currentArticle.image}
            currentVideo={currentArticle.videoUrl}
            label="Media Links"
            showInputsOnly={true}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
