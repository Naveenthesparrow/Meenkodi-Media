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
import { Add, Edit, Delete, GetApp, Favorite } from '@mui/icons-material';
import MediaUpload from './common/MediaUpload';
import SEO, { pageSEO } from './common/SEO';

import { useBilingualContent } from "../utils/bilingualContent";
import { useTranslation } from 'react-i18next';

export default function Resources({ user }) {
  const getContent = useBilingualContent();
  const { t } = useTranslation();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentResource, setCurrentResource] = useState({
    title_en: '', title_ta: '',
    description_en: '', description_ta: '',
    category_en: '', category_ta: '',
    author_en: '', author_ta: '',
    image: '',
    downloadLink: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch(`/api/resources`);
      if (!response.ok) {
        throw new Error('Failed to fetch resources');
      }
      const data = await response.json();
      console.log('Fetched resources:', data);
      setResources(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError(err.message);
      setLoading(false);
      setResources(dummyResources); // Fallback to dummy data
    }
  };

  // Dummy data for Resources
  const dummyResources = [
    {
      _id: "1",
      title: "Ancient Tamil Literature",
      description: "A collection of classical Tamil literary works, including Sangam literature and epics.",
      category: "Books",
      author: "Various Ancient Poets",
      image: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
      downloadLink: "#",
      createdAt: new Date(),
    },
    {
      _id: "2",
      title: "Tamil History Documentary",
      description: "A documentary exploring the rich history and cultural heritage of the Tamil people.",
      category: "Videos",
      author: "Tamil Heritage Foundation",
      image: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
      downloadLink: "#",
      createdAt: new Date(),
    },
  ];

  const handleAdd = () => {
    setCurrentResource({
      title_en: '', title_ta: '',
      description_en: '', description_ta: '',
      category_en: '', category_ta: '',
      author_en: '', author_ta: '',
      image: '',
      downloadLink: '',
    });
    setOpenDialog(true);
  };

  const handleEdit = (resource) => {
    const part = (val, lang) => {
      if (!val) return '';
      if (typeof val === 'string') return lang === 'en' ? val : '';
      return val[lang] || '';
    };
    setCurrentResource({
      _id: resource._id,
      title_en: part(resource.title, 'en'), title_ta: part(resource.title, 'ta'),
      description_en: part(resource.description, 'en'), description_ta: part(resource.description, 'ta'),
      category_en: part(resource.category, 'en'), category_ta: part(resource.category, 'ta'),
      author_en: part(resource.author, 'en'), author_ta: part(resource.author, 'ta'),
      image: resource.image || '',
      downloadLink: resource.downloadLink || '',
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const method = currentResource._id ? 'PUT' : 'POST';
      const url = currentResource._id
        ? `/api/resources/${currentResource._id}`
        : `/api/resources`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: { en: currentResource.title_en, ta: currentResource.title_ta },
          description: { en: currentResource.description_en, ta: currentResource.description_ta },
          category: { en: currentResource.category_en, ta: currentResource.category_ta },
          author: { en: currentResource.author_en, ta: currentResource.author_ta },
          image: currentResource.image,
          downloadLink: currentResource.downloadLink,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save resource');
      }

      const savedResource = await response.json();

      if (method === 'POST') {
        setResources([...resources, savedResource]);
      } else {
        setResources(resources.map(resource =>
          resource._id === savedResource._id ? savedResource : resource
        ));
      }

      setOpenDialog(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        const response = await fetch(`/api/resources/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to delete resource');
        }

        setResources(resources.filter(resource => resource._id !== id));
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
      <SEO {...pageSEO.resources} />
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
          {t('resources.title', 'Resources')}
        </Typography>

        {user && user.role === "admin" && (
          <Box
            sx={{
              position: { xs: 'static', md: 'absolute' },
              right: { md: 0 },
              top: { md: '50%' },
              transform: { xs: 'none', md: 'translateY(-50%)' },
              transition: 'all 0.3s ease',
              mt: { xs: 2, md: 0 },
              display: 'flex',
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
              width: { xs: '100%', md: 'auto' },
              '&:hover': {
                '@media (min-width:900px)': {
                  transform: 'translateY(-50%) scale(1.05)',
                },
                '& button': {
                  '@media (min-width:900px)': {
                    boxShadow: '0 8px 15px rgba(0,0,0,0.2)',
                    transform: 'translateY(-3px)',
                  }
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
              {t('resources.add', 'Add Resource')}
            </Button>
          </Box>
        )}
      </Box>

      <Grid
        container
        spacing={0}
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: { xs: 4, md: 5 },
          justifyItems: 'center',
          alignItems: 'stretch',
          pt: 2,
        }}
      >
        {resources.map((resource, index) => (
          <Fade
            in={true}
            timeout={500 + index * 200}
            key={resource._id}
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
                alignItems: 'stretch',
                px: { xs: 1, md: 1.5 },
                boxSizing: 'border-box',
                width: '100%',
              }}
            >
              <Card
                sx={{
                  width: '100%',
                  maxWidth: 370,
                  height: 540,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 0,
                  border: '3px solid transparent',
                  bgcolor: '#fff',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #8B0000 0%, #B8860B 100%)',
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.4s ease',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: -8,
                    left: -8,
                    right: -8,
                    bottom: -8,
                    border: '2px solid #8B0000',
                    opacity: 0,
                    transition: 'opacity 0.35s ease',
                    zIndex: -1,
                  },
                  '&:hover': {
                    transform: 'translateY(-16px)',
                    boxShadow: '0 25px 50px rgba(0,0,0,0.12)',
                    '&::before': {
                      transform: 'scaleX(1)',
                    },
                    '&::after': {
                      opacity: 1,
                    },
                    '& .book-image': {
                      transform: 'scale(1.12)',
                    },
                    '& .book-overlay': {
                      opacity: 1,
                    },
                    '& .admin-actions': {
                      opacity: 1,
                      transform: 'translateY(0)',
                    }
                  },
                }}
                onClick={() => navigate(`/resources/${resource._id}`)}
              >
                {/* Book Cover Image */}
                <Box
                  sx={{
                    position: 'relative',
                    height: 300,
                    overflow: 'hidden',
                    bgcolor: '#f8f7f5',
                  }}
                
                >
                  {(resource.image) ? (
                    <CardMedia
                      component="img"
                      image={resource.image}
                      alt={getContent(resource.title)}
                      className="book-image"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease',
                      }}
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='370' height='300' viewBox='0 0 370 300'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f8f7f5;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23e8e6e0;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23grad)' width='370' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Georgia, serif' font-size='36px' fill='%23B8860B' opacity='0.6'%3ENo Image%3C/text%3E%3Ctext x='50%25' y='70%25' dominant-baseline='middle' text-anchor='middle' font-family='Georgia, serif' font-size='14px' fill='%23666' font-weight='400'%3ETamil Heritage%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: 'linear-gradient(135deg, #f8f7f5 0%, #e8e6e0 100%)',
                      }}
                    >
                      <Box sx={{ width: '70%', height: 100, bgcolor: '#eee', borderRadius: 1, mb: 1 }} />
                    </Box>
                  )}
                  {/* Subtle overlay on hover */}
                  <Box
                    className="book-overlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)',
                      opacity: 0,
                      transition: 'opacity 0.4s ease',
                    }}
                  />

                  {/* Category Tag */}
                  {getContent(resource.category) && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        left: 16,
                        bgcolor: 'rgba(255,255,255,0.95)',
                        color: '#8B0000',
                        px: 2,
                        py: 0.5,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }}
                    >
                      {getContent(resource.category)}
                    </Box>
                  )}

                  {/* Like Badge */}
                  <Box
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      bgcolor: '#fff',
                      border: '1px solid #eee',
                      px: 1.25,
                      py: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      borderRadius: 1,
                      zIndex: 12,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                    }}
                  >
                    <Favorite sx={{ color: '#8B0000', fontSize: 18 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {resource.likes ? (Array.isArray(resource.likes) ? resource.likes.length : resource.likes) : 0}
                    </Typography>
                  </Box>
                </Box>

                {/* Content Section */}
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 3,
                    position: 'relative',
                    bgcolor: '#fff',
                  }}
                >
                  {/* Admin Controls */}
                  {user && user.role === "admin" && (
                    <Box
                      className="admin-actions"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        display: "flex",
                        gap: 1,
                        zIndex: 10,
                        opacity: 0,
                        transform: 'translateY(-8px)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(resource);
                        }}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(0,0,0,0.8)',
                          color: '#fff',
                          width: 32,
                          height: 32,
                          '&:hover': {
                            bgcolor: '#8B0000',
                          },
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(resource._id);
                        }}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(0,0,0,0.8)',
                          color: '#fff',
                          width: 32,
                          height: 32,
                          '&:hover': {
                            bgcolor: '#8B0000',
                          },
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  )}

                  {/* Title */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: '#8B0000',
                      mb: 1,
                      lineHeight: 1.4,
                      fontSize: '1.15rem',
                      fontFamily: 'Georgia, serif',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minHeight: '3.3rem',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -8,
                        left: 0,
                        width: '48px',
                        height: '3px',
                        bgcolor: '#DAA520',
                        borderRadius: 1,
                      }
                    }}
                  >
                    {getContent(resource.title)}
                  </Typography>

                  {/* Author */}
                  {getContent(resource.author) && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#8B0000',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        mb: 2,
                        fontFamily: 'Georgia, serif',
                      }}
                    >
                      {getContent(resource.author)}
                    </Typography>
                  )}

                  {/* Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#555',
                      lineHeight: 1.7,
                      fontSize: '0.875rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minHeight: '4.5rem',
                      mb: 3,
                    }}
                  >
                    {getContent(resource.description)}
                  </Typography>

                  {/* Action Buttons */}
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      pt: 2,
                      borderTop: '1px solid rgba(0,0,0,0.08)',
                    }}
                  >
                    <Button
                      component={Link}
                      to={`/resources/${resource._id}`}
                      variant="contained"
                      fullWidth
                      sx={{
                        bgcolor: '#8B0000',
                        color: '#fff',
                        borderRadius: 0,
                        py: 1.2,
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        letterSpacing: '0.5px',
                        textTransform: 'none',
                        boxShadow: 'none',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: '#6B0000',
                          boxShadow: '0 4px 12px rgba(139,0,0,0.3)',
                        },
                      }}
                    >
                      View Details
                    </Button>
                    {resource.downloadLink && (
                      <Button
                        href={resource.downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          color: '#B8860B',
                          borderColor: '#B8860B',
                          borderRadius: 0,
                          py: 1.2,
                          px: 2,
                          minWidth: 'auto',
                          fontWeight: 600,
                          fontSize: '1.1rem',
                          boxShadow: 'none',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            bgcolor: '#B8860B',
                            color: '#fff',
                            borderColor: '#B8860B',
                          },
                        }}
> <GetApp /> </Button> 
                    )}
                  </Box>
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
          {currentResource._id ? t('resources.edit', 'Edit Resource') : t('resources.addNew', 'Add New Resource')}
        </DialogTitle>
        <DialogContent>
          <TextField label="Title (EN)" fullWidth sx={{ mb: 2 }} value={currentResource.title_en} onChange={(e) => setCurrentResource({ ...currentResource, title_en: e.target.value })} />
          <TextField label="Title (TA)" fullWidth sx={{ mb: 2 }} value={currentResource.title_ta} onChange={(e) => setCurrentResource({ ...currentResource, title_ta: e.target.value })} />
          <TextField label="Author (EN)" fullWidth sx={{ mb: 2 }} value={currentResource.author_en} onChange={(e) => setCurrentResource({ ...currentResource, author_en: e.target.value })} />
          <TextField label="Author (TA)" fullWidth sx={{ mb: 2 }} value={currentResource.author_ta} onChange={(e) => setCurrentResource({ ...currentResource, author_ta: e.target.value })} />
          <TextField label="Category (EN)" fullWidth sx={{ mb: 2 }} value={currentResource.category_en} onChange={(e) => setCurrentResource({ ...currentResource, category_en: e.target.value })} />
          <TextField label="Category (TA)" fullWidth sx={{ mb: 2 }} value={currentResource.category_ta} onChange={(e) => setCurrentResource({ ...currentResource, category_ta: e.target.value })} />
          <TextField label="Description (EN)" fullWidth multiline minRows={5} sx={{ mb: 2 }} value={currentResource.description_en} onChange={(e) => setCurrentResource({ ...currentResource, description_en: e.target.value })} />
          <TextField label="Description (TA)" fullWidth multiline minRows={5} sx={{ mb: 2 }} value={currentResource.description_ta} onChange={(e) => setCurrentResource({ ...currentResource, description_ta: e.target.value })} />
          <TextField
            label="Download Link"
            fullWidth
            sx={{ mb: 2 }}
            value={currentResource.downloadLink}
            onChange={(e) => setCurrentResource({ ...currentResource, downloadLink: e.target.value })}
            placeholder="Optional: Add a download link for the resource"
          />
          <MediaUpload
            onImageLinkChange={(link) => {
              console.log('Image link changed:', link);
              setCurrentResource({ ...currentResource, image: link });
            }}
            onVideoLinkChange={(link) => { }} // No video link field in this dialog
            onImageChange={(url) => {
              console.log('Image URL changed:', url);
              setCurrentResource({ ...currentResource, image: url });
            }}
            onVideoChange={(url) => { }} // No video URL field in this dialog
            currentImageLink={currentResource.image}
            currentVideoLink={''} // No video link in this dialog
            currentImage={currentResource.image}
            currentVideo={''} // No video URL in this dialog
            label="Media Links"
            showInputsOnly={true}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

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
  );
}
