import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

export default function Gallery({ user }) {
  const { t } = useTranslation();
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentGalleryItem, setCurrentGalleryItem] = useState({
    title: '',
    description: '',
    category: '',
    imageLink: '',
    imageUrl: '',
    videoLink: '',
    videoUrl: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gallery`);
      if (!response.ok) {
        throw new Error('Failed to fetch gallery items');
      }
      const data = await response.json();
      setGalleryItems(data);
        setLoading(false);
    } catch (err) {
      console.error("Error fetching gallery items:", err);
      setError(err.message);
        setLoading(false);
        setGalleryItems(dummyGalleryItems); // Fallback to dummy data
    }
  };

  const handleAdd = () => {
    setCurrentGalleryItem({
      title: '',
      description: '',
      category: '',
      imageLink: '',
      imageUrl: '',
      videoLink: '',
      videoUrl: '',
    });
    setOpenDialog(true);
  };

  const handleEdit = (galleryItem) => {
    setCurrentGalleryItem(galleryItem);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const method = currentGalleryItem._id ? 'PUT' : 'POST';
      const url = currentGalleryItem._id 
        ? `${API_BASE_URL}/api/gallery/${currentGalleryItem._id}` 
        : `${API_BASE_URL}/api/gallery`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(currentGalleryItem),
      });

      if (!response.ok) {
        throw new Error('Failed to save gallery item');
      }

      const savedGalleryItem = await response.json();
      
      if (method === 'POST') {
        setGalleryItems([...galleryItems, savedGalleryItem]);
      } else {
        setGalleryItems(galleryItems.map(item => 
          item._id === savedGalleryItem._id ? savedGalleryItem : item
        ));
      }

      setOpenDialog(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this gallery item?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/gallery/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to delete gallery item');
        }

        setGalleryItems(galleryItems.filter(item => item._id !== id));
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
          textAlign: 'center', 
          position: 'relative',
          overflow: 'hidden',
          }}
        >
          <Typography
          variant="h2" 
            sx={{
            fontWeight: 900, 
            color: "#000", 
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
              backgroundColor: '#000',
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
              backgroundColor: '#000',
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
          {t('nav.gallery')}
        </Typography>
        
        {user && user.role === "admin" && (
          <Box 
            sx={{
              position: 'absolute', 
              right: 0, 
              top: '50%', 
              transform: 'translateY(-50%)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-50%) scale(1.05)',
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
        {t('gallery.add', 'Add Gallery Item')}
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
        {galleryItems.map((item, index) => (
          <Fade 
            in={true} 
            timeout={500 + index * 200} 
            key={item._id}
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
                  width: 350,  // Fixed width
                  height: 450, // Fixed height
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
                onClick={() => navigate(`/gallery/${item._id}`)}
              >
                {(item.imageUrl || item.imageLink) ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.imageUrl || item.imageLink}
                    alt={item.title}
                    sx={{ 
                      objectFit: "contain",
                      width: '100%',
                      maxHeight: 200,
                      backgroundColor: '#f0f0f0',
                      padding: '10px',
                      boxSizing: 'border-box',
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', item.imageUrl || item.imageLink);
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
                      No Image Available
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
                    position: 'relative', // For absolute positioning of admin buttons
                    transition: 'all 0.3s ease',
                  }}
                >
                  {user && user.role === "admin" && (
                    <Box 
            sx={{
                        position: 'absolute', 
                        top: 10, 
                        right: 10, 
              display: "flex",
                        gap: 1 
                      }}
                    >
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(item);
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
                          handleDelete(item._id);
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
                        fontSize: '1.5rem',
                        textTransform: 'capitalize',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                        color: "#666",
                        fontStyle: "italic",
                  fontSize: "0.9rem",
                        mb: 2,
                        textTransform: 'capitalize',
                      }}
                    >
                      {item.category}
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
                        minHeight: '4.8rem', // Ensures consistent height for 3 lines
                      }}
                    >
                      {item.description.length > 150 
                        ? `${item.description.substring(0, 150)}...` 
                        : item.description}
              </Typography>
                  </Box>

                  <Button
                    component={Link}
                    to={`/gallery/${item._id}`}
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
                    {t('common.readMore', 'Read More')}
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
          {currentGalleryItem._id ? t('gallery.edit', 'Edit Gallery Item') : t('gallery.addNew', 'Add New Gallery Item')}
        </DialogTitle>
        <DialogContent>
          <TextField
            label={t('gallery.title', 'Title')}
            fullWidth
            sx={{ mb: 2 }}
            value={currentGalleryItem.title}
            onChange={(e) => setCurrentGalleryItem({...currentGalleryItem, title: e.target.value})}
          />
          <TextField
            label={t('gallery.category', 'Category')}
            fullWidth
            sx={{ mb: 2 }}
            value={currentGalleryItem.category}
            onChange={(e) => setCurrentGalleryItem({...currentGalleryItem, category: e.target.value})}
          />
          <TextField
            label={t('gallery.description', 'Description')}
            fullWidth
            multiline
            minRows={3}
            sx={{ mb: 2 }}
            value={currentGalleryItem.description}
            onChange={(e) => setCurrentGalleryItem({...currentGalleryItem, description: e.target.value})}
          />
          <MediaUpload
            onImageLinkChange={(link) => setCurrentGalleryItem({...currentGalleryItem, imageLink: link})}
            onVideoLinkChange={(link) => setCurrentGalleryItem({...currentGalleryItem, videoLink: link})}
            onImageChange={(url) => setCurrentGalleryItem({...currentGalleryItem, imageUrl: url})}
            onVideoChange={(url) => setCurrentGalleryItem({...currentGalleryItem, videoUrl: url})}
            currentImageLink={currentGalleryItem.imageLink}
            currentVideoLink={currentGalleryItem.videoLink}
            currentImage={currentGalleryItem.imageUrl}
            currentVideo={currentGalleryItem.videoUrl}
            label={t('gallery.mediaLinks', 'Media Links')}
            showInputsOnly={true}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>{t('common.cancel', 'Cancel')}</Button>
          <Button onClick={handleSave} variant="contained">{t('common.save', 'Save')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
