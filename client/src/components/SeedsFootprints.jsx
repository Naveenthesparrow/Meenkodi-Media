import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, TextField, Button, Grid, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Fade } from '@mui/material';
import PageHeading from './common/PageHeading';
import { Link as RouterLink } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';
import { Edit, DragIndicator, ArrowUpward, ArrowDownward, Image as ImageIcon, Share as ShareIcon, Check as CheckIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import SEO, { pageSEO } from './common/SEO';

export default function SeedsFootprints({ user }) {
  const { t, i18n } = useTranslation();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ nameEn: '', nameTa: '', descEn: '', descTa: '', coverPhoto: null });
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [folderOrder, setFolderOrder] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [copiedFolderId, setCopiedFolderId] = useState(null);
  
  // Edit folder states
  const [editingFolder, setEditingFolder] = useState(null);
  const [editForm, setEditForm] = useState({ nameEn: '', nameTa: '', descEn: '', descTa: '', coverPhoto: null, currentCoverPhoto: null, removeCoverPhoto: false });
  
  const isAdmin = user && user.role === 'admin';

  const getContent = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return i18n.language === 'ta' && field.ta ? field.ta : field.en || '';
  };

  const handleShare = async (e, folder) => {
    e.preventDefault();
    e.stopPropagation();
    
    const folderUrl = `${window.location.origin}/seeds-and-footprints/folders/${folder._id}`;
    const folderName = getContent(folder.name) || 'Tamil Heritage Folder';
    
    const shareData = {
      title: folderName,
      text: getContent(folder.description) || `Explore ${folderName} on Meenkodi`,
      url: folderUrl
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(folderUrl);
        setCopiedFolderId(folder._id);
        setTimeout(() => setCopiedFolderId(null), 2000);
      }
    } catch (err) {
      console.error('Failed to share folder:', err);
    }
  };

  const loadFolders = () => {
    let mounted = true;
    setLoading(true);
    fetch('/api/seedsandfootprints/folders')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setFolders(data || []);
      })
      .catch((err) => console.error('Failed to fetch research folders', err))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  };

  useEffect(() => {
    const cleanup = loadFolders();
    return cleanup;
  }, []);

  const handleChange = (key) => (e) => setForm((s) => ({ ...s, [key]: e.target.value }));

  const createFolder = async () => {
    if (!isAdmin) return;
    if (!form.nameEn && !form.nameTa) {
      alert(t('research.folderValidation'));
      return;
    }
    setCreating(true);
    try {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('nameEn', form.nameEn);
      formData.append('nameTa', form.nameTa);
      formData.append('descriptionEn', form.descEn);
      formData.append('descriptionTa', form.descTa);
      
      // Add cover photo if selected
      if (form.coverPhoto) {
        formData.append('coverPhoto', form.coverPhoto);
      }

      const res = await fetch('/api/seedsandfootprints/folders', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Server error');
      }
      setForm({ nameEn: '', nameTa: '', descEn: '', descTa: '', coverPhoto: null });
      loadFolders();
      setOpenCreateDialog(false);
    } catch (err) {
      console.error(err);
      alert(t('research.createError', { message: err.message }));
    } finally {
      setCreating(false);
    }
  };

  const deleteFolder = async (id) => {
    if (!isAdmin) return;
    if (!confirm(t('research.deleteConfirm'))) return;
    try {
      const res = await fetch(`/api/seedsandfootprints/folders/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok && res.status !== 204) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Server error');
      }
      loadFolders();
    } catch (err) {
      console.error('Failed to delete folder', err);
      alert(t('research.deleteError', { message: err.message }));
    }
  };

  const editFolder = (folder) => {
    if (!isAdmin) return;
    setEditingFolder(folder);
    setEditForm({
      nameEn: (typeof folder.name === 'object' ? folder.name.en : folder.name) || '',
      nameTa: (typeof folder.name === 'object' ? folder.name.ta : '') || '',
      descEn: (typeof folder.description === 'object' ? folder.description.en : folder.description) || '',
      descTa: (typeof folder.description === 'object' ? folder.description.ta : '') || '',
      coverPhoto: null,
      currentCoverPhoto: folder.coverPhoto || null,
      removeCoverPhoto: false
    });
  };

  const updateFolder = async () => {
    if (!isAdmin || !editingFolder) return;
    if (!editForm.nameEn && !editForm.nameTa) {
      alert(t('research.folderValidation'));
      return;
    }
    setCreating(true);
    try {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('nameEn', editForm.nameEn);
      formData.append('nameTa', editForm.nameTa);
      formData.append('descriptionEn', editForm.descEn);
      formData.append('descriptionTa', editForm.descTa);
      
      // Add cover photo if selected
      if (editForm.coverPhoto) {
        formData.append('coverPhoto', editForm.coverPhoto);
      }
      
      // Flag to remove existing cover photo
      if (editForm.removeCoverPhoto) {
        formData.append('removeCoverPhoto', 'true');
      }

      const res = await fetch(`/api/seedsandfootprints/folders/${editingFolder._id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Server error');
      }
      setEditingFolder(null);
      setEditForm({ nameEn: '', nameTa: '', descEn: '', descTa: '', coverPhoto: null, currentCoverPhoto: null, removeCoverPhoto: false });
      loadFolders();
    } catch (err) {
      console.error(err);
      alert(t('research.createError', { message: err.message }));
    } finally {
      setCreating(false);
    }
  };

  const openReorderDialog = () => {
    const sortedFolders = [...folders].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setFolderOrder(sortedFolders);
    setOpenOrderDialog(true);
  };

  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDrop = (index) => {
    if (dragIndex === null || dragIndex === index) return;
    const updated = [...folderOrder];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    setFolderOrder(updated);
    setDragIndex(null);
  };

  const handleSaveOrder = async () => {
    try {
      const orderedIds = folderOrder.map(folder => folder._id);
      const response = await fetch('/api/seedsandfootprints/folders/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderedIds })
      });

      if (!response.ok) {
        throw new Error('Failed to save folder order');
      }

      loadFolders();
      setOpenOrderDialog(false);
    } catch (err) {
      console.error('Failed to save order:', err);
      alert('Failed to save folder order');
    }
  };

  const moveFolder = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= folderOrder.length) return;
    const updated = [...folderOrder];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setFolderOrder(updated);
  };

  return (
    <Box>
      <SEO {...pageSEO.research} />

      {/* Header Section */}
      <Box
        sx={{
          pt: { xs: 2, sm: 3, md: 3 },
          mb: 4,
          position: 'relative'
        }}
      >
        <Container maxWidth="lg">
          <PageHeading
            leftActions={isAdmin ? (
              <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, alignItems: 'center', gap: 0.5 }}>
                <Button
                  onClick={openReorderDialog}
                  variant="outlined"
                  startIcon={<Edit />}
                  size="small"
                  sx={{
                    borderColor: '#8B0000',
                    color: '#8B0000',
                    '&:hover': {
                      bgcolor: 'rgba(139,0,0,0.08)',
                      borderColor: '#8B0000',
                    },
                    borderRadius: 0,
                    fontSize: i18n.language === 'ta' 
                      ? { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
                      : { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                  }}
                >
                  {t('research.editOrder', 'Edit Order')}
                </Button>
              </Box>
            ) : null}
            typographySx={{ 
              fontSize: i18n.language === 'ta' 
                ? { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' }
                : { xs: '2.2rem', sm: '2.8rem', md: '3.6rem' }
            }}
            actions={isAdmin ? (
              <Button
                onClick={() => setOpenCreateDialog(true)}
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: "#000",
                  color: "#fff",
                  transition: 'all 0.3s ease',
                  "&:hover": {
                    bgcolor: "#333",
                    boxShadow: '0 8px 15px rgba(0,0,0,0.2)',
                    transform: { xs: 'none', md: 'translateY(-3px)' },
                  },
                  borderRadius: 0,
                  px: { xs: 2, md: 3 },
                  py: { xs: 0.5, md: 1 },
                  fontSize: i18n.language === 'ta'
                    ? { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
                    : { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                }}
              >
                {t('research.addDiscovery', 'Add Discovery')}
              </Button>
            ) : null}
          >
            {t('research.title', 'Seeds & Footprints')}
          </PageHeading>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 6 }}>
      {/* Create Folder Dialog */}
      {isAdmin && (
        <Dialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
            }
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 700,
              color: '#8B0000',
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: { xs: '1.3rem', sm: '1.5rem' },
              pb: 2,
              borderBottom: '2px solid #f5f5f5'
            }}
          >
            {t('research.folders.add', 'Create New Folder')}
          </DialogTitle>

          <DialogContent sx={{ pt: 3, px: 3, pb: 2 }}>
            <Typography
              variant="body2"
              sx={{
                mb: 3,
                color: '#666',
                fontSize: '0.95rem',
                lineHeight: 1.6
              }}
            >
              {t('research.folders.description', 'Create a folder to organize research materials. You can add content to this folder later.')}
            </Typography>

            <TextField
              autoFocus
              label={t('research.folders.nameEn', 'Folder Name (English)')}
              fullWidth
              value={form.nameEn}
              onChange={handleChange('nameEn')}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#8B0000',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#8B0000',
                  }
                }
              }}
              placeholder="e.g., Ancient Manuscripts"
            />

            <TextField
              label={t('research.folders.nameTa', 'Folder Name (Tamil)')}
              fullWidth
              value={form.nameTa}
              onChange={handleChange('nameTa')}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#8B0000',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#8B0000',
                  }
                }
              }}
              placeholder="உதாரணம்: பண்டைய கையெழுத்துகள்"
            />

            <TextField
              label={t('research.folders.descEn', 'Description (English)')}
              fullWidth
              multiline
              rows={2}
              value={form.descEn}
              onChange={handleChange('descEn')}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#8B0000',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#8B0000',
                  }
                }
              }}
              placeholder="Brief description of the folder contents"
            />

            <TextField
              label={t('research.folders.descTa', 'Description (Tamil)')}
              fullWidth
              multiline
              rows={2}
              value={form.descTa}
              onChange={handleChange('descTa')}
              sx={{
                mb: 2.5,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: '#8B0000',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#8B0000',
                  }
                }
              }}
              placeholder="கோப்புறையின் உள்ளடக்கம் பற்றிய சுருக்கமான விளக்கம்"
            />

            {/* Cover Photo Upload Section */}
            <Box sx={{ mb: 1 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  mb: 1.5, 
                  color: '#8B0000', 
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                {t('research.folderPhoto', 'Folder Cover Photo (Optional)')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageIcon />}
                  sx={{
                    borderColor: '#8B0000',
                    color: '#8B0000',
                    '&:hover': { 
                      borderColor: '#6B0000',
                      bgcolor: 'rgba(139, 0, 0, 0.04)'
                    },
                    textTransform: 'none',
                    py: 1,
                    borderRadius: 2
                  }}
                >
                  {t('actions.choosePhoto', 'Choose Photo')}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setForm(prev => ({ ...prev, coverPhoto: file }));
                    }}
                  />
                </Button>
                {form.coverPhoto && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem' }}>
                      {form.coverPhoto.name}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setForm(prev => ({ ...prev, coverPhoto: null }))}
                      sx={{ 
                        minWidth: 'auto', 
                        px: 1, 
                        color: '#666',
                        fontSize: '0.75rem',
                        textTransform: 'none'
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
            <Button
              onClick={() => setOpenCreateDialog(false)}
              sx={{
                color: '#666',
                px: 2.5,
                py: 1,
                fontSize: '0.9rem',
                textTransform: 'none',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: '#f5f5f5'
                }
              }}
            >
              {t('actions.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={createFolder}
              variant="contained"
              disabled={creating}
              sx={{
                bgcolor: '#8B0000',
                px: 3,
                py: 1,
                fontSize: '0.9rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(139, 0, 0, 0.2)',
                '&:hover': {
                  bgcolor: '#6B0000',
                  boxShadow: '0 6px 16px rgba(139, 0, 0, 0.3)',
                },
                '&:disabled': {
                  bgcolor: '#ccc'
                }
              }}
            >
              {creating ? t('creating', 'Creating...') : t('research.folders.create', 'Create Folder')}
            </Button>
          </DialogActions>
        </Dialog>
      )}

        {/* Folders Grid */}
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary" sx={{ fontSize: '1rem' }}>
              {t('loading', 'Loading...')}
            </Typography>
          </Box>
        ) : folders.length === 0 ? (
          <Paper
            sx={{
              p: { xs: 4, sm: 6 },
              textAlign: 'center',
              borderRadius: 2,
              border: '3px dashed transparent',
              backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #8B0000 0%, #D4AF37 50%, #8B0000 100%)',
              backgroundOrigin: 'border-box',
              backgroundClip: 'padding-box, border-box',
              bgcolor: 'rgba(250,250,250,0.8)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 300,
                height: 300,
                background: 'radial-gradient(circle, rgba(139,0,0,0.03) 0%, transparent 70%)',
                borderRadius: '50%'
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, rgba(139,0,0,0.08) 0%, rgba(212,175,55,0.08) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  border: '2px solid rgba(139,0,0,0.1)'
                }}
              >
                <Typography sx={{ fontSize: '3rem' }}>�</Typography>
              </Box>
              <Typography variant="h6" sx={{ color: '#888', mb: 2 }}>
                {t('research.folders.empty', 'No photo collections yet')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isAdmin
                  ? t('research.folders.emptyAdmin', 'Create your first collection')
                  : t('research.folders.emptyUser', 'Check back later')
                }
              </Typography>
            </Box>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            {folders.map((f, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={f._id}>
                <Fade in={true} timeout={600 + index * 100}>
                  <Box
                    sx={{
                      position: 'relative',
                      height: '100%',
                      '&:hover .admin-buttons': {
                        opacity: 1,
                        transform: 'translateY(0)'
                      }
                    }}
                  >
                    <Paper
                      component={RouterLink}
                      to={`/seeds-and-footprints/folders/${f._id}`}
                      elevation={0}
                      sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        overflow: 'hidden',
                        borderRadius: '16px',
                        bgcolor: '#fff',
                        transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        position: 'relative',
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.8)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(135deg, rgba(139, 0, 0, 0.08) 0%, rgba(218, 165, 32, 0.08) 100%)',
                          opacity: 0,
                          transition: 'opacity 0.6s ease',
                          zIndex: 0,
                          borderRadius: '16px'
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: -2,
                          left: -2,
                          right: -2,
                          bottom: -2,
                          background: 'linear-gradient(45deg, #8B0000, #DAA520, #C19A6B, #8B0000)',
                          borderRadius: '16px',
                          opacity: 0,
                          zIndex: -1,
                          transition: 'opacity 0.6s ease',
                          backgroundSize: '300% 300%',
                          animation: 'gradient-shift 3s ease infinite'
                        },
                        '@keyframes gradient-shift': {
                          '0%': { backgroundPosition: '0% 50%' },
                          '50%': { backgroundPosition: '100% 50%' },
                          '100%': { backgroundPosition: '0% 50%' }
                        },
                        '&:hover': {
                          transform: 'translateY(-12px) scale(1.03)',
                          boxShadow: '0 24px 64px rgba(139, 0, 0, 0.25), 0 0 0 1px rgba(139, 0, 0, 0.15)',
                          '&::before': {
                            opacity: 0.05
                          },
                          '&::after': {
                            opacity: 1
                          },
                          '& .folder-image': {
                            transform: 'scale(1.15) rotate(2deg)'
                          },
                          '& .image-overlay': {
                            opacity: 0.4
                          },
                          '& .photo-badge': {
                            transform: 'translateY(0) scale(1.05)',
                            bgcolor: 'rgba(139, 0, 0, 0.95)',
                            color: '#fff',
                            borderColor: 'rgba(255, 255, 255, 0.5)',
                            '& .MuiSvgIcon-root': {
                              color: '#DAA520'
                            }
                          },
                          '& .folder-title': {
                            background: 'linear-gradient(135deg, #8B0000 0%, #DAA520 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            transform: 'translateY(-3px)'
                          },
                          '& .shine-effect': {
                            left: '150%'
                          },
                          '& .decorative-dots': {
                            '& .dot-1': { bgcolor: '#8B0000', transform: 'scale(1.3)' },
                            '& .dot-2': { bgcolor: '#DAA520', transform: 'scale(1.3)' },
                            '& .dot-3': { bgcolor: '#C19A6B', transform: 'scale(1.3)' }
                          }
                        }
                      }}
                    >
                      {/* Cover Image Container */}
                      <Box
                        sx={{
                          width: '100%',
                          height: 300,
                          position: 'relative',
                          overflow: 'hidden',
                          bgcolor: '#f8f9fa',
                          zIndex: 1
                        }}
                      >
                        {/* Shine effect */}
                        <Box
                          className="shine-effect"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '50%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                            transform: 'skewX(-20deg)',
                            transition: 'left 0.8s ease',
                            zIndex: 3,
                            pointerEvents: 'none'
                          }}
                        />

                        {/* Cover Image */}
                        {f.coverPhoto ? (
                          <Box
                            component="img"
                            src={f.coverPhoto}
                            alt={getContent(f.name)}
                            className="folder-image"
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              objectPosition: 'center',
                              transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                              display: 'block',
                              filter: 'brightness(0.95) contrast(1.05)'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        
                        {/* Fallback when no image */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: f.coverPhoto ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #8B0000 0%, #C19A6B 100%)',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              backgroundImage: `
                                radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                                radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
                              `,
                              opacity: 0.8
                            }
                          }}
                        >
                          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                            <FolderIcon sx={{ fontSize: 72, color: 'rgba(255, 255, 255, 0.9)', mb: 1, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }} />
                            <Typography
                              sx={{
                                color: 'rgba(255, 255, 255, 0.95)',
                                fontSize: '1rem',
                                fontWeight: 700,
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                                textShadow: '0 2px 8px rgba(0,0,0,0.2)'
                              }}
                            >
                              No Image
                            </Typography>
                          </Box>
                        </Box>

                        {/* Gradient overlay */}
                        <Box
                          className="image-overlay"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(135deg, rgba(139, 0, 0, 0.3) 0%, rgba(218, 165, 32, 0.3) 100%)',
                            opacity: 0,
                            transition: 'opacity 0.6s ease',
                            zIndex: 2
                          }}
                        />

                        {/* Photo Count Badge */}
                        <Box
                          className="photo-badge"
                          sx={{
                            position: 'absolute',
                            bottom: 20,
                            right: 20,
                            bgcolor: 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(20px) saturate(180%)',
                            px: 2.5,
                            py: 1.25,
                            borderRadius: '12px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(139, 0, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            zIndex: 3,
                            border: '1.5px solid rgba(139, 0, 0, 0.2)',
                            transform: 'translateY(8px)',
                            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
                          }}
                        >
                          <ImageIcon sx={{ fontSize: 20, color: '#8B0000' }} />
                          <Typography
                            sx={{
                              fontSize: '0.95rem',
                              color: '#8B0000',
                              fontWeight: 800,
                              letterSpacing: '0.3px',
                              lineHeight: 1
                            }}
                          >
                            {(f.photos?.length || 0)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Folder Info Section */}
                      <Box 
                        sx={{ 
                          p: 3.5,
                          bgcolor: '#fff',
                          position: 'relative',
                          zIndex: 2,
                          flexGrow: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}
                      >
                        {/* Decorative top accent */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '60px',
                            height: '4px',
                            background: 'linear-gradient(90deg, #8B0000 0%, #DAA520 50%, #C19A6B 100%)',
                            borderRadius: '0 0 4px 4px'
                          }}
                        />

                        {/* Folder Title */}
                        <Typography
                          className="folder-title"
                          sx={{
                            fontWeight: 800,
                            fontSize: '1.35rem',
                            color: '#1a1a2e',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            lineHeight: 1.3,
                            mb: 1.5,
                            fontFamily: '"Poppins", sans-serif',
                            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textAlign: 'center',
                            minHeight: '2.6em',
                            textShadow: '0 1px 2px rgba(0,0,0,0.05)'
                          }}
                        >
                          {getContent(f.name) || f.name}
                        </Typography>

                        {/* Description if available */}
                        {f.description && getContent(f.description) && (
                          <Typography
                            sx={{
                              fontSize: '0.875rem',
                              color: '#6b7280',
                              lineHeight: 1.6,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textAlign: 'center',
                              fontWeight: 400,
                              mb: 1
                            }}
                          >
                            {getContent(f.description)}
                          </Typography>
                        )}

                        {/* Decorative bottom dots */}
                        <Box
                          className="decorative-dots"
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: 0.75,
                            mt: 2
                          }}
                        >
                          <Box className="dot-1" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#8B0000', transition: 'all 0.3s ease' }} />
                          <Box className="dot-2" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#DAA520', transition: 'all 0.3s ease' }} />
                          <Box className="dot-3" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#C19A6B', transition: 'all 0.3s ease' }} />
                        </Box>
                      </Box>
                    </Paper>

                    {/* Share Button (floating top-left) */}
                    <IconButton
                      onClick={(e) => handleShare(e, f)}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        bgcolor: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 8px 24px rgba(139, 0, 0, 0.15)',
                        border: '1.5px solid rgba(139, 0, 0, 0.2)',
                        width: 40,
                        height: 40,
                        color: '#8B0000',
                        zIndex: 10,
                        '&:hover': {
                          bgcolor: '#8B0000',
                          color: 'white',
                          transform: 'scale(1.15) rotate(8deg)',
                          boxShadow: '0 12px 32px rgba(139, 0, 0, 0.3)',
                          borderColor: '#8B0000'
                        },
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                      title={t('actions.share', 'Share Folder')}
                    >
                      {copiedFolderId === f._id ? (
                        <CheckIcon sx={{ fontSize: 20 }} />
                      ) : (
                        <ShareIcon sx={{ fontSize: 20 }} />
                      )}
                    </IconButton>

                    {/* Admin Action Buttons */}
                    {isAdmin && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          display: 'flex',
                          gap: 1,
                          opacity: 0,
                          transform: 'translateY(-8px)',
                          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          zIndex: 10
                        }}
                        className="admin-buttons"
                      >
                        {/* Edit Button */}
                        <IconButton
                          onClick={(e) => {
                            e.preventDefault();
                            editFolder(f);
                          }}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 8px 24px rgba(139, 0, 0, 0.25)',
                            border: '1.5px solid rgba(139, 0, 0, 0.2)',
                            width: 40,
                            height: 40,
                            '&:hover': {
                              bgcolor: '#8B0000',
                              color: 'white',
                              transform: 'scale(1.15) rotate(8deg)',
                              boxShadow: '0 12px 32px rgba(139, 0, 0, 0.4)',
                              borderColor: '#8B0000'
                            },
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                          }}
                        >
                          <Edit sx={{ fontSize: 20 }} />
                        </IconButton>
                        
                        {/* Delete Button */}
                        <IconButton
                          onClick={(e) => {
                            e.preventDefault();
                            deleteFolder(f._id);
                          }}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.98)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 8px 24px rgba(239, 68, 68, 0.25)',
                            border: '1.5px solid rgba(239, 68, 68, 0.2)',
                            width: 40,
                            height: 40,
                            '&:hover': {
                              bgcolor: '#ef4444',
                              color: 'white',
                              transform: 'scale(1.15) rotate(-8deg)',
                              boxShadow: '0 12px 32px rgba(239, 68, 68, 0.4)',
                              borderColor: '#ef4444'
                            },
                            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Reorder Folders Dialog */}
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
          {t('research.reorderFolders', 'Reorder Folders')}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <DragIndicator sx={{ color: '#8B0000', fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
            <Typography variant="body2" sx={{ color: '#666', fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
              {t('research.dragToReorder', 'Drag rows to reorder, or use the up/down arrows.')}
            </Typography>
          </Box>
          {folderOrder.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#666' }}>
              {t('research.noFolders', 'No folders to reorder.')}
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {folderOrder.map((folder, index) => (
                <Box
                  key={folder._id}
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
                  <FolderIcon sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, color: '#8B0000' }} />
                  <Typography sx={{ fontWeight: 600, flex: 1, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                    {getContent(folder.name)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => moveFolder(index, index - 1)}
                      disabled={index === 0}
                      sx={{ bgcolor: '#f5f5f5', width: { xs: 32, md: 36 }, height: { xs: 32, md: 36 } }}
                    >
                      <ArrowUpward fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => moveFolder(index, index + 1)}
                      disabled={index === folderOrder.length - 1}
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
            {t('actions.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={handleSaveOrder}
            variant="contained"
            sx={{
              bgcolor: '#8B0000',
              fontSize: { xs: '0.85rem', sm: '0.875rem' },
              '&:hover': { bgcolor: '#6B0000' }
            }}
            disabled={folderOrder.length === 0}
          >
            {t('actions.saveOrder', 'Save Order')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog
        open={!!editingFolder}
        onClose={() => setEditingFolder(null)}
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
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            
            {/* Folder Names Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#8B0000', fontWeight: 600 }}>
                {t('research.folderName', 'Folder Name')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label={t('research.folders.nameEn', 'Name (English)')}
                  value={editForm.nameEn}
                  onChange={(e) => setEditForm(prev => ({ ...prev, nameEn: e.target.value }))}
                  fullWidth
                  required
                  variant="outlined"
                  sx={{ 
                    '& .MuiInputLabel-asterisk': { color: '#d32f2f' },
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#8B0000' },
                      '&.Mui-focused fieldset': { borderColor: '#8B0000' }
                    }
                  }}
                />
                <TextField
                  label={t('research.folders.nameTa', 'Name (Tamil)')}
                  value={editForm.nameTa}
                  onChange={(e) => setEditForm(prev => ({ ...prev, nameTa: e.target.value }))}
                  fullWidth
                  variant="outlined"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#8B0000' },
                      '&.Mui-focused fieldset': { borderColor: '#8B0000' }
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Descriptions Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#8B0000', fontWeight: 600 }}>
                {t('research.folderDescription', 'Description (Optional)')}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label={t('research.folders.descEn', 'Description (English)')}
                  value={editForm.descEn}
                  onChange={(e) => setEditForm(prev => ({ ...prev, descEn: e.target.value }))}
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#8B0000' },
                      '&.Mui-focused fieldset': { borderColor: '#8B0000' }
                    }
                  }}
                />
                <TextField
                  label={t('research.folders.descTa', 'Description (Tamil)')}
                  value={editForm.descTa}
                  onChange={(e) => setEditForm(prev => ({ ...prev, descTa: e.target.value }))}
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#8B0000' },
                      '&.Mui-focused fieldset': { borderColor: '#8B0000' }
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Cover Photo Upload Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1.5, color: '#8B0000', fontWeight: 600 }}>
                {t('research.folderPhoto', 'Folder Cover Photo (Optional)')}
              </Typography>
              
              {/* Current Cover Photo Display */}
              {editForm.currentCoverPhoto && !editForm.removeCoverPhoto && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>Current Cover Photo:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 100,
                        height: 75,
                        backgroundImage: `url(${editForm.currentCoverPhoto})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: 1,
                        border: '1px solid #ddd'
                      }}
                    />
                    <Button
                      size="small"
                      color="error"
                      onClick={() => setEditForm(prev => ({ ...prev, removeCoverPhoto: true }))}
                      sx={{ textTransform: 'none' }}
                    >
                      Remove Current Photo
                    </Button>
                  </Box>
                </Box>
              )}
              
              {editForm.removeCoverPhoto && (
                <Box sx={{ mb: 2, p: 2, bgcolor: '#fff3cd', borderRadius: 1, border: '1px solid #ffeaa7' }}>
                  <Typography variant="body2" sx={{ color: '#856404' }}>
                    Current cover photo will be removed when you save.
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => setEditForm(prev => ({ ...prev, removeCoverPhoto: false }))}
                    sx={{ mt: 1, textTransform: 'none' }}
                  >
                    Keep Current Photo
                  </Button>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageIcon />}
                  sx={{
                    borderColor: '#8B0000',
                    color: '#8B0000',
                    '&:hover': { 
                      borderColor: '#6B0000',
                      bgcolor: 'rgba(139, 0, 0, 0.04)'
                    },
                    textTransform: 'none',
                    py: 1
                  }}
                >
                  {t('actions.choosePhoto', 'Choose Photo')}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setEditForm(prev => ({ ...prev, coverPhoto: file }));
                    }}
                  />
                </Button>
                {editForm.coverPhoto && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      {editForm.coverPhoto.name}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setEditForm(prev => ({ ...prev, coverPhoto: null }))}
                      sx={{ 
                        minWidth: 'auto', 
                        px: 1, 
                        color: '#666',
                        fontSize: '0.75rem'
                      }}
                    >
                      Remove
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, gap: { xs: 0.5, sm: 1 } }}>
          <Button
            onClick={() => setEditingFolder(null)}
            variant="text"
            sx={{ color: '#666', fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
          >
            {t('actions.cancel', 'Cancel')}
          </Button>
          <Button
            onClick={updateFolder}
            variant="contained"
            sx={{
              bgcolor: '#8B0000',
              fontSize: { xs: '0.85rem', sm: '0.875rem' },
              '&:hover': { bgcolor: '#6B0000' }
            }}
            disabled={creating}
          >
            {creating ? t('creating') : t('common.save', 'Save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
