import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Typography,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Stack,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  DragIndicator,
  ArrowUpward,
  ArrowDownward,
  Close,
  Save,
  Image as ImageIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const DirectorsAdmin = ({ user, onUpdate, externalEditDirector, externalOpenAdd, onDialogClose }) => {
  const { t, i18n } = useTranslation();
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    nameEn: '',
    nameTa: '',
    titleEn: '',
    titleTa: '',
    image: '',
    imagePosition: 'center top',
    slug: '',
    editLanguage: 'en'
  });

  // Fetch directors on load
  useEffect(() => {
    fetchDirectors();
  }, []);

  // Watch for external edit request
  useEffect(() => {
    if (externalEditDirector && externalEditDirector._id) {
      handleOpenDialog(externalEditDirector);
    }
  }, [externalEditDirector]);

  // Watch for external add request
  useEffect(() => {
    if (externalOpenAdd) {
      handleOpenDialog(null);
    }
  }, [externalOpenAdd]);

  const fetchDirectors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/directors');
      if (response.ok) {
        const data = await response.json();
        setDirectors(data);
        if (onUpdate) onUpdate(data);
      }
    } catch (error) {
      console.error('Error fetching directors:', error);
      setError('Failed to load directors');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (director = null) => {
    if (director) {
      setEditingId(director._id);
      setFormData({
        nameEn: director.name.en || '',
        nameTa: director.name.ta || '',
        titleEn: director.title.en || '',
        titleTa: director.title.ta || '',
        image: director.image || '',
        imagePosition: director.imagePosition || 'center top',
        slug: director.slug || '',
        editLanguage: 'en'
      });
    } else {
      setEditingId(null);
      setFormData({
        nameEn: '',
        nameTa: '',
        titleEn: '',
        titleTa: '',
        image: '',
        imagePosition: 'center top',
        slug: '',
        editLanguage: 'en'
      });
    }
    setDialogOpen(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setError('');
    // Notify parent to reset triggers
    if (onDialogClose) {
      onDialogClose();
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.nameEn || !formData.nameTa || !formData.titleEn || !formData.titleTa || !formData.image) {
        setError('Please fill in all required fields');
        return;
      }

      const payload = {
        name: { en: formData.nameEn, ta: formData.nameTa },
        title: { en: formData.titleEn, ta: formData.titleTa },
        image: formData.image,
        imagePosition: formData.imagePosition,
        slug: formData.slug
      };

      const url = editingId ? `/api/directors/${editingId}` : '/api/directors';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSuccess(editingId ? 'Director updated successfully' : 'Director added successfully');
        handleCloseDialog();
        fetchDirectors();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save director');
      }
    } catch (error) {
      console.error('Error saving director:', error);
      setError('Failed to save director');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this director?')) return;

    try {
      const response = await fetch(`/api/directors/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setSuccess('Director deleted successfully');
        fetchDirectors();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to delete director');
      }
    } catch (error) {
      console.error('Error deleting director:', error);
      setError('Failed to delete director');
    }
  };

  const moveDirector = (index, direction) => {
    const newDirectors = [...directors];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newDirectors.length) return;
    
    [newDirectors[index], newDirectors[targetIndex]] = [newDirectors[targetIndex], newDirectors[index]];
    setDirectors(newDirectors);
    saveOrder(newDirectors);
  };

  const saveOrder = async (orderedDirectors) => {
    try {
      const orderedIds = orderedDirectors.map(d => d._id);
      const response = await fetch('/api/directors/reorder/all', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderedIds })
      });

      if (response.ok) {
        const data = await response.json();
        setDirectors(data);
        if (onUpdate) onUpdate(data);
      }
    } catch (error) {
      console.error('Error saving order:', error);
      setError('Failed to save order');
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Add New Director Button - Hidden, just for triggering */}
      <Box sx={{ display: 'none' }}>
        <Button
          id="add-director-trigger"
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            bgcolor: '#8B0000',
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': { bgcolor: '#6B0000' }
          }}
        >
          Add New Director
        </Button>
      </Box>

      {/* Directors List - HIDDEN since controls are on cards now */}
      {/* Grid display removed to declutter UI */}

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#8B0000' }}>
              {editingId ? 'Edit Director' : 'Add New Director'}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Language Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ToggleButtonGroup
              value={formData.editLanguage}
              exclusive
              onChange={(e, val) => val && setFormData({ ...formData, editLanguage: val })}
              sx={{
                '& .MuiToggleButton-root': {
                  px: 3,
                  py: 1,
                  border: '1px solid #8B0000',
                  color: '#8B0000',
                  '&.Mui-selected': {
                    bgcolor: '#8B0000',
                    color: '#fff',
                    '&:hover': { bgcolor: '#6B0000' }
                  }
                }
              }}
            >
              <ToggleButton value="en">English</ToggleButton>
              <ToggleButton value="ta">தமிழ்</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Stack spacing={3}>
            {/* Name Fields */}
            {formData.editLanguage === 'en' ? (
              <TextField
                label="Name (English) *"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                fullWidth
                required
              />
            ) : (
              <TextField
                label="பெயர் (தமிழ்) *"
                value={formData.nameTa}
                onChange={(e) => setFormData({ ...formData, nameTa: e.target.value })}
                fullWidth
                required
              />
            )}

            {/* Title Fields */}
            {formData.editLanguage === 'en' ? (
              <TextField
                label="Title (English) *"
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                fullWidth
                required
                multiline
                rows={2}
              />
            ) : (
              <TextField
                label="தலைப்பு (தமிழ்) *"
                value={formData.titleTa}
                onChange={(e) => setFormData({ ...formData, titleTa: e.target.value })}
                fullWidth
                required
                multiline
                rows={2}
              />
            )}

            {/* Image URL */}
            <TextField
              label="Image URL *"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              fullWidth
              required
              helperText="Enter the full URL of the director's image"
            />

            {/* Image Position */}
            <TextField
              label="Image Position"
              value={formData.imagePosition}
              onChange={(e) => setFormData({ ...formData, imagePosition: e.target.value })}
              fullWidth
              helperText="CSS object-position value (e.g., 'center top', '50% 20%')"
            />

            {/* Slug */}
            <TextField
              label="Slug (for URL)"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              fullWidth
              helperText="Leave empty to auto-generate from English name. Used for linking to poet pages."
            />

            {/* Image Preview */}
            {formData.image && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#666' }}>
                  Image Preview:
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    height: 200,
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '2px solid #e0e0e0'
                  }}
                >
                  <img
                    src={formData.image}
                    alt="Preview"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: formData.imagePosition
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<Box sx={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:"#999"}}>Invalid image URL</Box>';
                    }}
                  />
                </Box>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ borderTop: '1px solid #e0e0e0', p: 2, gap: 1 }}>
          <Button onClick={handleCloseDialog} sx={{ color: '#666' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            startIcon={<Save />}
            sx={{
              bgcolor: '#8B0000',
              px: 3,
              '&:hover': { bgcolor: '#6B0000' }
            }}
          >
            {editingId ? 'Update' : 'Add'} Director
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DirectorsAdmin;
