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
import SEO, { pageSEO } from './common/SEO';
import API_BASE_URL from "../utils/api";
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
      const response = await fetch(`${API_BASE_URL}/api/resources`);
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
        ? `${API_BASE_URL}/api/resources/${currentResource._id}`
        : `${API_BASE_URL}/api/resources`;

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
        const response = await fetch(`${API_BASE_URL}/api/resources/${id}`, {
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
              }}
            >
              <Card
                sx={{
                  width: { xs: '100%', sm: 350 },
                  maxWidth: '100%',
                  // height: 450, // Removed fixed height for responsiveness
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
                onClick={() => navigate(`/resources/${resource._id}`)}
              >
                {(resource.image) ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={resource.image}
                    alt={getContent(resource.title)}
                    sx={{
                      objectFit: "contain",
                      width: '100%',
                      maxHeight: 200,
                      backgroundColor: '#f0f0f0',
                      padding: '10px',
                      boxSizing: 'border-box',
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', resource.image);
                      console.log('Full resource object:', resource);
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
                      No Image Available (Debug: {JSON.stringify(resource)})
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
                          handleEdit(resource);
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
                          handleDelete(resource._id);
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
                      {getContent(resource.title)}
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
                      {getContent(resource.author) || getContent(resource.category)}
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
                      {getContent(resource.description).length > 150
                        ? `${getContent(resource.description).substring(0, 150)}...`
                        : getContent(resource.description)}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <Button
                      component={Link}
                      to={`/resources/${resource._id}`}
                      variant="outlined"
                      sx={{
                        color: "#000",
                        borderColor: "#000",
                        borderRadius: 0,
                        "&:hover": { bgcolor: "#f5f5f5", borderColor: "#000" },
                      }}
                    >
                      {t('actions.readMore', 'Read more')}
                    </Button>
                    {resource.downloadLink && (
                      <Button
                        href={resource.downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        sx={{
                          bgcolor: "#000",
                          color: "#fff",
                          borderRadius: 0,
                          "&:hover": {
                            bgcolor: "#333",
                          },
                        }}
                      >
                        {t('actions.download', 'Download')}
                      </Button>
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
      </Container>
    </Box>
  );
}
