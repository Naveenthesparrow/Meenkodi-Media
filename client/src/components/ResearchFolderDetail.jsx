import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Breadcrumbs,
  Link,
  Fade,
  Grid,
  Dialog,
  DialogContent,
  IconButton,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  DialogTitle,
  DialogActions
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ArrowBack, Add, Image as ImageIcon, Edit, DragIndicator, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import SEO from './common/SEO';

export default function ResearchFolderDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [folder, setFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadForm, setUploadForm] = useState({ 
    file: null, 
    captionEn: '', 
    captionTa: '', 
    nameEn: '', 
    keywords: '', 
    credit: '',
    sourceLink: '',
    editLanguage: 'en' 
  });
  const [editingPhotoId, setEditingPhotoId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [photoOrder, setPhotoOrder] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  
  // Folder editing states
  const [editingFolder, setEditingFolder] = useState(false);
  const [folderForm, setFolderForm] = useState({
    nameEn: '',
    nameTa: '',
    descriptionEn: '',
    descriptionTa: '',
    coverPhoto: null
  });

  // Ensure body can scroll properly
  React.useEffect(() => {
    document.body.style.overflow = 'unset';
    document.documentElement.style.overflow = 'unset';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const getContent = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return i18n.language === 'ta' && field.ta ? field.ta : field.en || '';
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    if (!id || id === 'undefined') {
      console.error('Invalid folder ID:', id);
      setFolder(null);
      setLoading(false);
      return;
    }
    
    fetch(`/api/research/folders/${id}`)
      .then((r) => {
        if (!r.ok) {
          return r.text().then(text => {
            console.error('Folder fetch failed:', r.status, text);
            throw new Error(`HTTP ${r.status}: ${text}`);
          });
        }
        return r.json();
      })
      .then((data) => {
        if (!mounted) return;
        // Photos come pre-sorted by order from backend; fall back to createdAt
        const sortedPhotos = (data.photos || []).slice().sort((a, b) => {
          if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        });
        setFolder(data);
        setPhotos(sortedPhotos);
      })
      .catch((err) => {
        console.error('Failed to load collection', err);
        if (mounted) setFolder(null);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 3 }, textAlign: 'center' }}>
        <CircularProgress sx={{ color: '#8B0000' }} />
        <Typography sx={{ mt: 2, color: '#666' }}>
          {t('loading', 'Loading...')}
        </Typography>
      </Container>
    );
  }

  if (!folder) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 3 } }}>
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            border: '2px dashed #e0e0e0'
          }}
        >
          <Box sx={{ fontSize: 80, mb: 2, opacity: 0.3 }}>📸</Box>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#999' }}>
            {t('research.folderNotFound', 'Collection not found')}
          </Typography>
          <Button
            component={RouterLink}
            to="/research"
            variant="contained"
            startIcon={<ArrowBack />}
            sx={{
              bgcolor: '#8B0000',
              mt: 2,
              px: 3,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: '#6B0000' }
            }}
          >
            {t('actions.backToResearch', 'Back to Collections')}
          </Button>
        </Paper>
      </Container>
    );
  }

  // Server resolves language, but add defensive handling for edge cases
  const getStringValue = (value, fallback = '') => {
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) {
      // Handle bilingual objects defensively
      return (i18n.language === 'ta' && value.ta) ? value.ta : (value.en || value.ta || fallback);
    }
    return String(value);
  };

  const folderName = getStringValue(folder.name, 'Untitled');
  const folderDescription = getStringValue(folder.description, '');

  // Only display photos that have a URL (filter out metadata-only entries)
  const displayPhotos = photos.filter(p => p.url);

  const getCaption = (caption) => {
    return getStringValue(caption, '');
  };

  const openViewer = (index) => {
    setActiveIndex(index);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
  };

  const openReorderDialog = () => {
    const sortedPhotos = [...photos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setPhotoOrder(sortedPhotos);
    setOpenOrderDialog(true);
  };

  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDrop = (index) => {
    if (dragIndex === null || dragIndex === index) return;
    const updated = [...photoOrder];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    setPhotoOrder(updated);
    setDragIndex(null);
  };

  const handleSaveOrder = async () => {
    try {
      const orderedIds = photoOrder.map(photo => photo._id);
      const response = await fetch(`/api/research/folders/${id}/photos/order`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderedIds })
      });

      if (!response.ok) {
        throw new Error('Failed to save photo order');
      }

      // Reload folder data
      const r = await fetch(`/api/research/folders/${id}`);
      if (r.ok) {
        const data = await r.json();
        const sortedPhotos = (data.photos || []).slice().sort((a, b) => {
          if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        });
        setFolder(data);
        setPhotos(sortedPhotos);
      }
      setOpenOrderDialog(false);
    } catch (err) {
      console.error('Failed to save order:', err);
      alert('Failed to save photo order');
    }
  };

  const movePhoto = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= photoOrder.length) return;
    const updated = [...photoOrder];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setPhotoOrder(updated);
  };

  const handleUploadFieldChange = (field) => (event) => {
    const value = field === 'file' ? (event.target.files?.[0] || null) : event.target.value;
    setUploadForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditPhoto = (photo) => {
    // populate form with existing photo data and open dialog for editing
    setEditingPhotoId(photo._id);
    setUploadForm(prev => ({
      ...prev,
      file: null,
      captionEn: photo.caption?.en || '',
      captionTa: photo.caption?.ta || '',
      nameEn: (photo.name && (photo.name.en || '')) || '',
      keywords: Array.isArray(photo.keywords) ? photo.keywords.join(', ') : (photo.keywords || ''),
      credit: photo.credit || '',
      sourceLink: photo.sourceLink || ''
    }));
    setIsFormVisible(true);
  };

  // Handle folder editing
  const handleEditFolder = () => {
    setFolderForm({
      nameEn: (typeof folder.name === 'object' ? folder.name.en : folder.name) || '',
      nameTa: (typeof folder.name === 'object' ? folder.name.ta : '') || '',
      descriptionEn: (typeof folder.description === 'object' ? folder.description.en : folder.description) || '',
      descriptionTa: (typeof folder.description === 'object' ? folder.description.ta : '') || '',
      coverPhoto: null
    });
    setEditingFolder(true);
  };

  const handleSaveFolder = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'admin') return;

    try {
      const formData = new FormData();
      
      // Add text data
      formData.append('nameEn', folderForm.nameEn);
      formData.append('nameTa', folderForm.nameTa);
      formData.append('descriptionEn', folderForm.descriptionEn);
      formData.append('descriptionTa', folderForm.descriptionTa);
      
      // Add cover photo if selected
      if (folderForm.coverPhoto) {
        formData.append('coverPhoto', folderForm.coverPhoto);
      }

      const response = await fetch(`/api/research/folders/${id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const updatedFolder = await response.json();
        setFolder(updatedFolder);
        setEditingFolder(false);
        setFolderForm({
          nameEn: '',
          nameTa: '',
          descriptionEn: '',
          descriptionTa: '',
          coverPhoto: null
        });
      } else {
        console.error('Failed to update folder');
      }
    } catch (error) {
      console.error('Error updating folder:', error);
    }
  };

  const refreshPhotos = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/research/folders/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      const sortedPhotos = (data.photos || []).slice().sort((a, b) => {
        if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      });
      setPhotos(sortedPhotos);
      setFolder(data);
    } catch (err) {
      console.error('Failed to refresh photos:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    try {
      setUploading(true);
      setUploadError('');

      // 1) Upload image to backend (Cloudinary)
      let imageUrl = null;
      if (uploadForm.file) {
        const formData = new FormData();
        formData.append('image', uploadForm.file);

        const uploadRes = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (!uploadRes.ok) {
          const errBody = await uploadRes.json().catch(() => ({}));
          throw new Error(errBody.error || 'Image upload failed');
        }

        const uploadJson = await uploadRes.json();
        imageUrl = uploadJson.imageUrl || uploadJson.url;

        if (!imageUrl) {
          throw new Error('No image URL returned from upload');
        }
      }

      // 2) Create or update photo on this collection
      const isEdit = !!editingPhotoId;
      const url = isEdit ? `/api/research/folders/${id}/photos/${editingPhotoId}` : `/api/research/folders/${id}/photos`;
      const method = isEdit ? 'PUT' : 'POST';

      // prepare keywords array
      const keywordsArray = uploadForm.keywords ? uploadForm.keywords.split(',').map(k => k.trim()).filter(Boolean) : [];

      const body = {
        ...(imageUrl ? { imageUrl } : {}),
        caption: { en: uploadForm.captionEn, ta: uploadForm.captionTa },
        credit: uploadForm.credit,
        name: { en: uploadForm.nameEn },
        keywords: keywordsArray,
        sourceLink: uploadForm.sourceLink
      };

      const photoRes = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      if (!photoRes.ok) {
        const errBody = await photoRes.json().catch(() => ({}));
        console.error('Photo attachment failed:', errBody);
        throw new Error(errBody.error || 'Failed to attach photo to collection');
      }

      const photoResponseJson = await photoRes.json();
      
      const { photo } = photoResponseJson;

      if (!photo) {
        console.warn('No photo object in response, trying to refresh folder data instead');
        // Fallback: refresh the entire folder data
        const refreshRes = await fetch(`/api/research/folders/${id}`);
        if (refreshRes.ok) {
          const refreshedData = await refreshRes.json();
          const sortedPhotos = (refreshedData.photos || []).slice().sort((a, b) => {
            if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          });
          setPhotos(sortedPhotos);
          setFolder(refreshedData);
        }
      } else {
        if (editingPhotoId) {
          // replace existing photo in state
          setPhotos((prev) => prev.map(p => (p._id === editingPhotoId ? photo : p)));
        } else {
          setPhotos((prev) => {
            const next = [...prev, photo];
            return next.slice().sort((a, b) => {
              if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
              return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            });
          });
        }
      }

      setUploadForm({ 
        file: null, 
        captionEn: '', 
        captionTa: '', 
        nameEn: '', 
        keywords: '', 
        credit: '',
        sourceLink: '',
        editLanguage: 'en' 
      });
      setEditingPhotoId(null);
      setIsFormVisible(false);
    } catch (err) {
      console.error('Upload error', err);
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!user || user.role !== 'admin') return;
    if (!window.confirm(t('research.deletePhotoConfirm', 'Delete this photo?'))) return;
    try {
      const res = await fetch(`/api/research/folders/${id}/photos/${photoId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete photo');
      // Refresh photos
      setPhotos((prev) => prev.filter((p) => p._id !== photoId));
    } catch (err) {
      alert(t('research.deletePhotoError', 'Failed to delete photo'));
    }
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: { xs: 3, md: 6 }, 
        px: { xs: 2, sm: 3 },
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'visible'
      }}
    >
      <SEO
        title={`${folderName} - ${t('research.title', 'Heritage Photo Collections')}`}
        description={folderDescription || `Photo evidence and heritage documentation for ${folderName}`}
        keywords="Tamil Heritage, Heritage Photos, Ancient Proof, Tamil History"
      />

      <Box
        sx={{
          width: '100%',
          mb: { xs: 4, md: 5 },
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
        }}
      >
        <Box
          sx={{
            py: { xs: 3, md: 3.5 },
            position: 'relative',
            textAlign: 'center'
          }}
        >
          <Box
            sx={{
              position: { xs: 'static', md: 'absolute' },
              left: { md: 0 },
              top: { md: '50%' },
              transform: { xs: 'none', md: 'translateY(-50%)' },
              mb: { xs: 2, md: 0 },
              display: 'flex',
              justifyContent: { xs: 'flex-start', md: 'flex-start' },
              gap: 1,
              flexWrap: 'wrap',
              zIndex: 10, // Ensure proper layering
              maxWidth: { md: '30%' } // Prevent overlap with center content
            }}
          >
            <Button
              component={RouterLink}
              to="/research"
              variant="outlined"
              startIcon={<ArrowBack />}
              sx={{
                borderColor: '#c00000',
                color: '#c00000',
                px: 3,
                py: 1,
                fontSize: '0.85rem',
                fontWeight: 600,
                borderRadius: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                bgcolor: '#fff',
                '&:hover': {
                  borderColor: '#a00000',
                  bgcolor: 'rgba(192,0,0,0.05)'
                }
              }}
            >
              {t('gallery.backToFolders', 'Back to Folders')}
            </Button>
            
            {user && user.role === 'admin' && photos.length > 0 && (
              <Button
                onClick={openReorderDialog}
                variant="outlined"
                startIcon={<Edit />}
                sx={{
                  borderColor: '#8B0000',
                  color: '#8B0000',
                  px: 3,
                  py: 1,
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  borderRadius: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  bgcolor: '#fff',
                  '&:hover': {
                    bgcolor: 'rgba(139,0,0,0.08)',
                    borderColor: '#8B0000'
                  }
                }}
              >
                {t('gallery.editOrder', 'Edit Order')}
              </Button>
            )}
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: '#8B0000',
              position: 'relative',
              display: 'inline-block',
              letterSpacing: -1,
              padding: { xs: '0 5px', md: '0 10px' },
              fontSize: { xs: '2rem', md: '3rem' }, // Responsive font size
              textAlign: 'center',
              maxWidth: { md: '40%' }, // Constrain width to prevent overlap
              wordBreak: 'break-word', // Handle long text gracefully
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: { xs: '-30px', md: '-50px' },
                width: { xs: '25px', md: '40px' },
                height: '3px',
                backgroundColor: '#DAA520',
                transform: 'translateY(-50%)',
                display: { xs: 'none', sm: 'block' } // Hide decorative lines on very small screens
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '50%',
                right: { xs: '-30px', md: '-50px' },
                width: { xs: '25px', md: '40px' },
                height: '3px',
                backgroundColor: '#DAA520',
                transform: 'translateY(-50%)',
                display: { xs: 'none', sm: 'block' } // Hide decorative lines on very small screens
              }
            }}
          >
            {folderName}
          </Typography>
          
          {/* Edit folder icon - positioned near title for admin */}
          {user && user.role === 'admin' && (
            <IconButton
              onClick={handleEditFolder}
              sx={{
                position: 'absolute',
                right: { xs: 10, md: 20 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 5,
                bgcolor: 'rgba(255,255,255,0.9)',
                color: '#8B0000',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  bgcolor: '#fff',
                  color: '#c00000',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                },
                borderRadius: '50%',
                p: 0.75,
                width: 36,
                height: 36,
              }}
              title={t('research.editFolder', 'Edit Folder')}
            >
              <Edit fontSize="small" />
            </IconButton>
          )}

          {user && user.role === 'admin' && (
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
                zIndex: 10, // Ensure proper layering
                maxWidth: { md: '30%' }, // Prevent overlap with center content
                // Keep hover effect only on larger screens
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
                onClick={() => setIsFormVisible(true)}
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
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}
              >
                {t('gallery.addImage', 'Add Image')}
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {folderDescription && (
        <Fade in={true} timeout={600}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="body1"
              sx={{
                color: '#666',
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                maxWidth: '760px',
                lineHeight: 1.7,
                fontFamily: '"Inter", sans-serif'
              }}
            >
              {folderDescription}
            </Typography>
          </Box>
        </Fade>
      )}

      {/* Content Section */}
      <Fade in={true} timeout={800}>
        <Box sx={{ flex: 1, minHeight: 'auto', width: '100%', pb: 4 }}>
          {/* Admin Upload Modal */}
          {user && user.role === 'admin' && (
            <Dialog
              open={isFormVisible}
              onClose={() => setIsFormVisible(false)}
              fullWidth
              maxWidth="md"
              PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 18px 60px rgba(0,0,0,0.25)' } }}
            >
              <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Box component="form" id="upload-photo-form" onSubmit={handleUpload} sx={{ maxWidth: 720, mx: 'auto' }}>
                  <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: '#333', fontWeight: 600 }}>{t('research.selectLanguageToEdit','Select Language to Edit:')}</Typography>
                    <ToggleButtonGroup
                      value={uploadForm.editLanguage}
                      exclusive
                      onChange={(e, v) => v && setUploadForm(prev => ({ ...prev, editLanguage: v }))}
                      sx={{ '& .MuiToggleButton-root': { px: 3, py: 1, border: '2px solid #8B0000', color: '#8B0000', fontWeight: 700 } }}
                    >
                      <ToggleButton value="en">ENGLISH</ToggleButton>
                      <ToggleButton value="ta">தமிழ்</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  <TextField label="Name (English)" fullWidth variant="outlined" value={uploadForm.nameEn} onChange={handleUploadFieldChange('nameEn')} sx={{ mb: 2 }} />
                  
                  <TextField label="Keywords (comma-separated)" fullWidth variant="outlined" value={uploadForm.keywords} onChange={handleUploadFieldChange('keywords')} sx={{ mb: 2 }} />
                  <TextField label={t('research.sourceLinkLabel','Source Link (optional)')} fullWidth variant="outlined" value={uploadForm.sourceLink} onChange={handleUploadFieldChange('sourceLink')} sx={{ mb: 3 }} />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 1, color: '#333', fontWeight: 600 }}>{t('research.upload', 'Upload Photo')}</Typography>
                    <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>Supported formats: JPG, PNG, GIF, WEBP</Typography>
                    <Button component="label" variant="outlined" startIcon={<ImageIcon />} sx={{ borderRadius: 1.5, px: 3, py: 1 }}>
                      {t('research.selectImage', 'Select Image')}
                      <input type="file" accept="image/*" hidden onChange={handleUploadFieldChange('file')} />
                    </Button>
                    {uploadForm.file && <Typography variant="body2" sx={{ mt: 1 }}>{t('research.selectedFile','Selected')}: {uploadForm.file.name}</Typography>}
                  </Box>

                  {uploadError && <Typography variant="body2" sx={{ color: '#d32f2f', textAlign: 'center', mb: 2 }}>{uploadError}</Typography>}
                </Box>
              </DialogContent>

              <Box sx={{ px: { xs: 3, sm: 4 }, py: 2, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="text" onClick={() => { setUploadForm({ file: null, captionEn: '', captionTa: '', nameEn: '', keywords: '', credit: '', sourceLink: '', editLanguage: 'en' }); setEditingPhotoId(null); setIsFormVisible(false); }} sx={{ color: '#777' }}>Cancel</Button>
                <Button type="submit" form="upload-photo-form" variant="contained" disabled={uploading} sx={{ bgcolor: '#8B0000' }}>{uploading ? 'Saving...' : 'Save'}</Button>
              </Box>
            </Dialog>
          )}

          {/* Folder Edit Dialog */}
          {user && user.role === 'admin' && (
            <Dialog
              open={editingFolder}
              onClose={() => setEditingFolder(false)}
              maxWidth="sm"
              fullWidth
              sx={{
                '& .MuiDialog-paper': {
                  m: { xs: 1, sm: 2 },
                  width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' },
                }
              }}
            >
              <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                {t('research.editFolder', 'Edit Folder')}
              </DialogTitle>
              
              <form onSubmit={handleSaveFolder}>
                <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    
                    {/* English Name */}
                    <TextField
                      label={t('research.folderNameEn', 'Folder Name (English)')}
                      type="text"
                      fullWidth
                      required
                      value={folderForm.nameEn}
                      onChange={(e) => setFolderForm({ ...folderForm, nameEn: e.target.value })}
                      variant="outlined"
                      sx={{ '& .MuiInputLabel-root': { color: '#555' } }}
                    />
                    
                    {/* Tamil Name */}
                    <TextField
                      label={t('research.folderNameTa', 'Folder Name (Tamil)')}
                      type="text"
                      fullWidth
                      value={folderForm.nameTa}
                      onChange={(e) => setFolderForm({ ...folderForm, nameTa: e.target.value })}
                      variant="outlined"
                      sx={{ '& .MuiInputLabel-root': { color: '#555' } }}
                    />
                    
                    {/* English Description */}
                    <TextField
                      label={t('research.folderDescriptionEn', 'Description (English)')}
                      type="text"
                      fullWidth
                      multiline
                      rows={3}
                      value={folderForm.descriptionEn}
                      onChange={(e) => setFolderForm({ ...folderForm, descriptionEn: e.target.value })}
                      variant="outlined"
                      sx={{ '& .MuiInputLabel-root': { color: '#555' } }}
                    />
                    
                    {/* Tamil Description */}
                    <TextField
                      label={t('research.folderDescriptionTa', 'Description (Tamil)')}
                      type="text"
                      fullWidth
                      multiline
                      rows={3}
                      value={folderForm.descriptionTa}
                      onChange={(e) => setFolderForm({ ...folderForm, descriptionTa: e.target.value })}
                      variant="outlined"
                      sx={{ '& .MuiInputLabel-root': { color: '#555' } }}
                    />
                    
                    {/* Cover Photo Upload */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, color: '#555' }}>
                        {t('research.folderCoverPhoto', 'Cover Photo (optional)')}
                      </Typography>
                      <Box
                        sx={{
                          border: '2px dashed #ddd',
                          borderRadius: 2,
                          p: 3,
                          textAlign: 'center',
                          cursor: 'pointer',
                          '&:hover': { borderColor: '#8B0000' }
                        }}
                        onClick={() => document.getElementById('folder-cover-input').click()}
                      >
                        <input
                          id="folder-cover-input"
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => setFolderForm({ ...folderForm, coverPhoto: e.target.files[0] || null })}
                        />
                        <ImageIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {folderForm.coverPhoto ? folderForm.coverPhoto.name : t('research.selectCoverPhoto', 'Click to select cover photo')}
                        </Typography>
                      </Box>
                    </Box>
                    
                  </Box>
                </DialogContent>
                
                <Box sx={{ px: { xs: 3, sm: 4 }, py: 2, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button 
                    variant="text" 
                    onClick={() => setEditingFolder(false)} 
                    sx={{ color: '#777' }}
                  >
                    {t('common.cancel', 'Cancel')}
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    sx={{ bgcolor: '#8B0000' }}
                  >
                    {t('common.save', 'Save')}
                  </Button>
                </Box>
              </form>
            </Dialog>
          )}

          {/* Gallery Section */}
          {displayPhotos.length === 0 ? (
            <Paper
              sx={{
                p: { xs: 3, sm: 5 },
                borderRadius: 3,
                border: '1px solid #f0f0f0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                minHeight: '260px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                mb: 4
              }}
            >
              <Box sx={{ fontSize: 90, mb: 3, opacity: 0.12 }}>📸</Box>
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  color: '#2d2d2d',
                  fontFamily: '"Inter", sans-serif'
                }}
              >
                {t('research.folderContents', 'Collection Gallery')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#999',
                  maxWidth: '500px',
                  lineHeight: 1.7,
                  mb: 2.5
                }}
              >
                {t(
                  'research.folderEmptyMessage',
                  'This collection is currently empty. Upload the first heritage photo for this country/region.'
                )}
              </Typography>
            </Paper>
          ) : (
            <>
              <Typography
                variant="h5"
                sx={{
                  mb: 2.5,
                  fontWeight: 700,
                  color: '#2d2d2d',
                  fontFamily: '"Inter", sans-serif'
                }}
              >
                {t('research.folderContents', 'Collection Gallery')}
              </Typography>

              <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: 8 }}>
                {displayPhotos.map((photo, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={photo._id || index}>
                    <Box>
                      <Box
                        onClick={() => openViewer(index)}
                        className="heritage-photo-card"
                        sx={{
                          position: 'relative',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          aspectRatio: '4 / 3',
                          background: 'linear-gradient(135deg, #2a3a42 0%, #1e2d35 100%)',
                          transition: 'all 0.5s ease-in-out',
                          transform: 'scale(1)',
                        
                        // Animated border
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          inset: '0px',
                          border: '2px solid #D4AF37',
                          opacity: 0,
                          transform: 'rotate(10deg)',
                          transition: 'all 0.5s ease-in-out',
                          borderRadius: '10px',
                          zIndex: 4
                        },
                        
                        '&:hover': {
                          borderRadius: '4px',
                          transform: 'scale(1.05)',
                          
                          '&::before': {
                            inset: '12px',
                            opacity: 1,
                            transform: 'rotate(0deg)'
                          },
                          
                          '& .photo-image': {
                            transform: 'scale(1.08)',
                            filter: 'brightness(1.1) contrast(1.1)'
                          },
                          
                          '& .photo-overlay': {
                            background: 'linear-gradient(to top, rgba(139,0,0,0.85) 0%, rgba(212,175,55,0.15) 35%, rgba(0,0,0,0.05) 100%)'
                          },
                          
                          '& .photo-caption': {
                            letterSpacing: '0.15em',
                            transform: 'translateY(-3px)'
                          },
                          
                          '& .photo-label': {
                            letterSpacing: '0.12em',
                            opacity: 1
                          },
                          
                          '& .heritage-trail': {
                            animation: 'heritageTrail 1s ease-in-out'
                          }
                        },
                        
                        '@keyframes heritageTrail': {
                          '0%': {
                            background: 'linear-gradient(90deg, rgba(212, 175, 55, 0) 90%, rgba(212, 175, 55, 0.8) 100%)',
                            opacity: 0
                          },
                          '30%': {
                            background: 'linear-gradient(90deg, rgba(212, 175, 55, 0) 70%, rgba(212, 175, 55, 0.8) 100%)',
                            opacity: 1
                          },
                          '70%': {
                            background: 'linear-gradient(90deg, rgba(212, 175, 55, 0) 70%, rgba(212, 175, 55, 0.8) 100%)',
                            opacity: 1
                          },
                          '95%': {
                            background: 'linear-gradient(90deg, rgba(212, 175, 55, 0) 90%, rgba(212, 175, 55, 0.8) 100%)',
                            opacity: 0
                          }
                        }
                      }}
                    >
                      <Box
                        component="img"
                        src={photo.url}
                        alt={getCaption(photo.caption) || folderName}
                        loading="lazy"
                        className="photo-image"
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          zIndex: 1,
                          transition: 'all 0.5s ease-in-out'
                        }}
                      />

                      {/* Animated trail effect */}
                      <Box
                        className="heritage-trail"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          height: '100%',
                          width: '100%',
                          opacity: 0,
                          zIndex: 2
                        }}
                      />

                      {/* Overlay gradient */}
                      <Box
                        className="photo-overlay"
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.05) 100%)',
                          transition: 'all 0.5s ease-in-out',
                          zIndex: 3
                        }}
                      />

                      {/* Bottom caption */}
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 16,
                          right: 16,
                          bottom: 14,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                          zIndex: 5
                        }}
                      >
                        <Typography
                          className="photo-caption"
                          variant="body2"
                          sx={{
                            color: '#f5f5f5',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textShadow: '0 3px 8px rgba(0,0,0,0.9)',
                            letterSpacing: '0.05em',
                            transition: 'all 0.5s ease-in-out',
                            fontFamily: '"Playfair Display", Georgia, serif'
                          }}
                          noWrap
                        >
                          {getCaption(photo.caption) || folderName}
                        </Typography>
                        <Typography
                          className="photo-label"
                          variant="caption"
                          sx={{
                            color: '#D4AF37',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            transition: 'all 0.5s ease-in-out 0.2s',
                            opacity: 0.85,
                            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                            fontFamily: '"Inter", sans-serif'
                          }}
                        >
                          {t('research.photoCollection', 'Photo Collection')}
                        </Typography>
                      </Box>

                      {user && user.role === 'admin' && (
                        <>
                          <IconButton
                            onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo._id); }}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              zIndex: 6,
                              bgcolor: 'rgba(255,255,255,0.9)',
                              color: '#c00000',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                              '&:hover': { bgcolor: '#fff', color: '#8B0000' },
                              borderRadius: '50%',
                              p: 0.5,
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>

                          <IconButton
                            onClick={(e) => { e.stopPropagation(); handleEditPhoto(photo); }}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 56,
                              zIndex: 6,
                              bgcolor: 'rgba(255,255,255,0.95)',
                              color: '#333',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                              '&:hover': { bgcolor: '#fff', color: '#8B0000' },
                              borderRadius: '50%',
                              p: 0.5,
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </>
                      )}

                      {/* badge removed per request */}
                    </Box>

                    {photo.sourceLink && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
                        <Box
                          component="a"
                          href={photo.sourceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            px: 2,
                            py: 0.75,
                            bgcolor: '#fff',
                            color: '#8B0000',
                            borderRadius: 1,
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            textDecoration: 'none',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            border: '2px solid #8B0000',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              bgcolor: '#8B0000',
                              color: '#fff',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(139,0,0,0.25)'
                            }
                          }}
                        >
                          {t('research.source', 'Source')}
                        </Box>
                      </Box>
                    )}
                  </Box>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>
      </Fade>

      {/* Fullscreen Viewer */}
      <Dialog
        fullScreen
        open={viewerOpen}
        onClose={closeViewer}
        PaperProps={{
          sx: {
            backgroundColor: '#050608',
            color: '#fff',
            overflow: 'auto'
          }
        }}
        disableScrollLock
      >
        <DialogContent
          sx={{
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            position: 'relative',
            bgcolor: 'radial-gradient(circle at top, #1f2933 0, #050608 55%)'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              right: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              zIndex: 10
            }}
          >
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {displayPhotos.length > 0 ? `${activeIndex + 1} / ${displayPhotos.length}` : ''}
            </Typography>
            <IconButton onClick={closeViewer} sx={{ color: '#fff' }}>
              ✕
            </IconButton>
          </Box>

          {displayPhotos[activeIndex] && (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: { xs: 2, sm: 4, md: 8 },
                py: { xs: 6, sm: 4 }
              }}
            >
              <Box
                component="img"
                src={displayPhotos[activeIndex].url}
                alt={getCaption(displayPhotos[activeIndex].caption) || folderName}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  boxShadow: '0 30px 80px rgba(0,0,0,0.8)',
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              />
            </Box>
          )}

          {displayPhotos[activeIndex] && (
            <Box
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderTop: '1px solid rgba(255,255,255,0.08)',
                bgcolor: 'rgba(5,6,8,0.96)'
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 0.5,
                  fontFamily: '"Playfair Display", Georgia, serif'
                }}
              >
                {getCaption(displayPhotos[activeIndex].caption) || folderName}
              </Typography>
              {displayPhotos[activeIndex].sourceLink && (
                <Box
                  component="a"
                  href={displayPhotos[activeIndex].sourceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: '#D4AF37',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    mb: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#fff',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {t('research.viewSource','View Source')}
                </Box>
              )}
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: 900, lineHeight: 1.6 }}
              >
                {t(
                  'research.viewerHint',
                  'These heritage photos document Tamil presence in this country/region. Use ESC or the close button to return to the gallery.'
                )}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Reorder Photos Dialog */}
      <Dialog
        open={openOrderDialog}
        onClose={() => setOpenOrderDialog(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            m: { xs: 1, sm: 2 },
            width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' },
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
          Reorder Photos
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <DragIndicator sx={{ color: '#8B0000', fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
            <Typography variant="body2" sx={{ color: '#666', fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
              Drag rows to reorder, or use the up/down arrows.
            </Typography>
          </Box>
          {photoOrder.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#666' }}>
              No photos to reorder.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {photoOrder.map((photo, index) => (
                <Box
                  key={photo._id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 1, md: 1.5 },
                    p: { xs: 1.5, md: 2 },
                    border: '1px dashed #c4c4c4',
                    borderRadius: 1,
                    bgcolor: '#fff',
                    cursor: 'grab',
                    '&:active': { cursor: 'grabbing' },
                    '&:hover': {
                      borderColor: '#8B0000',
                      bgcolor: '#faf6f6'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 28, md: 36 },
                      height: { xs: 28, md: 36 },
                      borderRadius: 1,
                      bgcolor: 'rgba(139,0,0,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <DragIndicator sx={{ color: '#8B0000', fontSize: { xs: '1rem', md: '1.5rem' } }} />
                  </Box>
                  <Box
                    component="img"
                    src={photo.url}
                    alt={getCaption(photo.caption)}
                    sx={{
                      width: 50,
                      height: 50,
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: '1px solid #ddd'
                    }}
                  />
                  <Typography sx={{ fontWeight: 600, flex: 1, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                    {getCaption(photo.caption) || `Photo ${index + 1}`}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => movePhoto(index, index - 1)}
                      disabled={index === 0}
                      sx={{ bgcolor: '#f5f5f5', width: { xs: 32, md: 36 }, height: { xs: 32, md: 36 } }}
                    >
                      <ArrowUpward fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => movePhoto(index, index + 1)}
                      disabled={index === photoOrder.length - 1}
                      sx={{ bgcolor: '#f5f5f5', width: { xs: 32, md: 36 }, height: { xs: 32, md: 36 } }}
                    >
                      <ArrowDownward fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, gap: { xs: 0.5, sm: 1 }, flexWrap: 'wrap' }}>
          <Button onClick={() => setOpenOrderDialog(false)} sx={{ color: '#666', fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveOrder}
            variant="contained"
            sx={{
              bgcolor: '#8B0000',
              fontSize: { xs: '0.85rem', sm: '0.875rem' },
              '&:hover': { bgcolor: '#6B0000' }
            }}
            disabled={photoOrder.length === 0}
          >
            Save Order
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
