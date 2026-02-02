import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useBilingualContent } from "../utils/bilingualContent";

export default function AdminDynasties({ user }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const getContent = useBilingualContent();
  const [dynasties, setDynasties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDynasty, setEditingDynasty] = useState(null);
  const [editLanguage, setEditLanguage] = useState('en');
  const [formData, setFormData] = useState({
    name_en: "",
    name_ta: "",
    slug: "",
    period_en: "",
    period_ta: "",
    capital_en: "",
    capital_ta: "",
    territory_en: "",
    territory_ta: "",
    rulers_en: "",
    rulers_ta: "",
    achievements_en: "",
    achievements_ta: "",
    description_en: "",
    description_ta: "",
    content_en: "",
    content_ta: "",
    militaryStrength_en: "",
    militaryStrength_ta: "",
    culturalContributions_en: "",
    culturalContributions_ta: "",
    architecture_en: "",
    architecture_ta: "",
    tradeAndEconomy_en: "",
    tradeAndEconomy_ta: "",
    decline_en: "",
    decline_ta: "",
    legacy_en: "",
    legacy_ta: "",
    flag: "",
    image: "",
  });

  useEffect(() => {
    fetchDynasties();
  }, []);

  const fetchDynasties = async () => {
    try {
      const res = await fetch(`/api/dynasties`);
      if (!res.ok) throw new Error("Failed to fetch dynasties");
      const data = await res.json();
      setDynasties(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleOpenDialog = (dynasty = null) => {
    if (dynasty) {
      setEditingDynasty(dynasty);
      setFormData({
        name_en: dynasty.name?.en || "",
        name_ta: dynasty.name?.ta || "",
        slug: dynasty.slug || "",
        period_en: dynasty.period?.en || "",
        period_ta: dynasty.period?.ta || "",
        capital_en: dynasty.capital?.en || "",
        capital_ta: dynasty.capital?.ta || "",
        territory_en: dynasty.territory?.en || "",
        territory_ta: dynasty.territory?.ta || "",
        rulers_en: dynasty.rulers?.en || "",
        rulers_ta: dynasty.rulers?.ta || "",
        achievements_en: dynasty.achievements?.en || "",
        achievements_ta: dynasty.achievements?.ta || "",
        description_en: dynasty.description?.en || "",
        description_ta: dynasty.description?.ta || "",
        content_en: dynasty.content?.en || "",
        content_ta: dynasty.content?.ta || "",
        militaryStrength_en: dynasty.militaryStrength?.en || "",
        militaryStrength_ta: dynasty.militaryStrength?.ta || "",
        culturalContributions_en: dynasty.culturalContributions?.en || "",
        culturalContributions_ta: dynasty.culturalContributions?.ta || "",
        architecture_en: dynasty.architecture?.en || "",
        architecture_ta: dynasty.architecture?.ta || "",
        tradeAndEconomy_en: dynasty.tradeAndEconomy?.en || "",
        tradeAndEconomy_ta: dynasty.tradeAndEconomy?.ta || "",
        decline_en: dynasty.decline?.en || "",
        decline_ta: dynasty.decline?.ta || "",
        legacy_en: dynasty.legacy?.en || "",
        legacy_ta: dynasty.legacy?.ta || "",
        flag: dynasty.flag || "",
        image: dynasty.image || "",
      });
    } else {
      setEditingDynasty(null);
      setFormData({
        name_en: "",
        name_ta: "",
        slug: "",
        period_en: "",
        period_ta: "",
        capital_en: "",
        capital_ta: "",
        territory_en: "",
        territory_ta: "",
        rulers_en: "",
        rulers_ta: "",
        achievements_en: "",
        achievements_ta: "",
        description_en: "",
        description_ta: "",
        content_en: "",
        content_ta: "",
        militaryStrength_en: "",
        militaryStrength_ta: "",
        culturalContributions_en: "",
        culturalContributions_ta: "",
        architecture_en: "",
        architecture_ta: "",
        tradeAndEconomy_en: "",
        tradeAndEconomy_ta: "",
        decline_en: "",
        decline_ta: "",
        legacy_en: "",
        legacy_ta: "",
        flag: "",
        image: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingDynasty(null);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        name: { en: formData.name_en, ta: formData.name_ta },
        slug: formData.slug,
        period: { en: formData.period_en, ta: formData.period_ta },
        capital: { en: formData.capital_en, ta: formData.capital_ta },
        territory: { en: formData.territory_en, ta: formData.territory_ta },
        rulers: { en: formData.rulers_en, ta: formData.rulers_ta },
        achievements: { en: formData.achievements_en, ta: formData.achievements_ta },
        description: { en: formData.description_en, ta: formData.description_ta },
        content: { en: formData.content_en, ta: formData.content_ta },
        militaryStrength: { en: formData.militaryStrength_en, ta: formData.militaryStrength_ta },
        culturalContributions: { en: formData.culturalContributions_en, ta: formData.culturalContributions_ta },
        architecture: { en: formData.architecture_en, ta: formData.architecture_ta },
        tradeAndEconomy: { en: formData.tradeAndEconomy_en, ta: formData.tradeAndEconomy_ta },
        decline: { en: formData.decline_en, ta: formData.decline_ta },
        legacy: { en: formData.legacy_en, ta: formData.legacy_ta },
        flag: formData.flag,
        image: formData.image,
      };

      const url = editingDynasty
        ? `/api/dynasties/${editingDynasty._id}`
        : `/api/dynasties`;

      const method = editingDynasty ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Failed to ${editingDynasty ? 'update' : 'create'} dynasty`);

      await fetchDynasties();
      handleCloseDialog();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('admin.confirmDelete', 'Are you sure you want to delete this dynasty?'))) {
      return;
    }

    try {
      const res = await fetch(`/api/dynasties/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete dynasty");

      await fetchDynasties();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleView = (dynasty) => {
    navigate(`/dynasties/${dynasty.slug || dynasty._id}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          {t('admin.manageDynasties', 'Manage Dynasties')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ bgcolor: "#000", "&:hover": { bgcolor: "#333" } }}
        >
          {t('admin.addDynasty', 'Add Dynasty')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {dynasties.map((dynasty) => (
          <Grid item xs={12} sm={6} md={4} key={dynasty._id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column", boxShadow: 3 }}>
              {dynasty.flag && (
                <CardMedia
                  component="img"
                  height="200"
                  image={dynasty.flag}
                  alt={getContent(dynasty.name)}
                  sx={{ objectFit: "cover" }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {getContent(dynasty.name)}
                </Typography>
                {dynasty.period && (
                  <Chip
                    label={getContent(dynasty.period)}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                )}
                {dynasty.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {getContent(dynasty.description)}
                  </Typography>
                )}
              </CardContent>
              <CardActions sx={{ justifyContent: "flex-end", p: 2, pt: 0 }}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleView(dynasty)}
                  title={t('admin.view', 'View')}
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleOpenDialog(dynasty)}
                  title={t('admin.edit', 'Edit')}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(dynasty._id)}
                  title={t('admin.delete', 'Delete')}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {dynasties.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {t('admin.noDynasties', 'No dynasties found. Create your first dynasty!')}
          </Typography>
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 0,
            border: '3px solid #000',
          }
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: '#000',
            color: '#fff',
            textAlign: 'center',
            fontWeight: 700
          }}
        >
          {editingDynasty
            ? t('admin.editDynasty', 'Edit Dynasty')
            : t('admin.createDynasty', 'Create Dynasty')}
        </DialogTitle>
        <DialogContent sx={{ p: 3, maxHeight: '90vh', overflow: 'auto' }}>
          <Box sx={{ mb: 4, mt: 2, display: 'flex', justifyContent: 'center' }}>
            <ToggleButtonGroup
              value={editLanguage}
              exclusive
              onChange={(e, newLang) => newLang && setEditLanguage(newLang)}
              sx={{
                '& .MuiToggleButton-root': {
                  px: 3,
                  py: 1,
                  border: '2px solid #000',
                  color: '#000',
                  fontWeight: 600,
                  '&.Mui-selected': {
                    bgcolor: '#000',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: '#333',
                    }
                  }
                }
              }}
            >
              <ToggleButton value="en">ENGLISH</ToggleButton>
              <ToggleButton value="ta">தமிழ்</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('admin.name', 'Dynasty Name')}
                value={editLanguage === 'en' ? formData.name_en : formData.name_ta}
                onChange={(e) => setFormData({ ...formData, [editLanguage === 'en' ? 'name_en' : 'name_ta']: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('admin.slug', 'Slug (URL)')}
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                helperText="e.g., pandiya, chera, chola, pallava, ltte"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('admin.period', 'Period')}
                value={editLanguage === 'en' ? formData.period_en : formData.period_ta}
                onChange={(e) => setFormData({ ...formData, [editLanguage === 'en' ? 'period_en' : 'period_ta']: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('admin.capital', 'Capital')}
                value={editLanguage === 'en' ? formData.capital_en : formData.capital_ta}
                onChange={(e) => setFormData({ ...formData, [editLanguage === 'en' ? 'capital_en' : 'capital_ta']: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('admin.description', 'Description')}
                value={editLanguage === 'en' ? formData.description_en : formData.description_ta}
                onChange={(e) => setFormData({ ...formData, [editLanguage === 'en' ? 'description_en' : 'description_ta']: e.target.value })}
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('admin.achievements', 'Achievements')}
                value={editLanguage === 'en' ? formData.achievements_en : formData.achievements_ta}
                onChange={(e) => setFormData({ ...formData, [editLanguage === 'en' ? 'achievements_en' : 'achievements_ta']: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('admin.flag', 'Flag URL')}
                value={formData.flag}
                onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('admin.image', 'Image URL')}
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            justifyContent: 'space-between',
            bgcolor: '#f0f0f0'
          }}
        >
          <Button 
            onClick={handleCloseDialog}
            sx={{ color: '#000' }}
          >
            {t('common.cancel', 'Cancel')} / {t('actions.cancel_ta', 'ரத்துசெய்')}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              bgcolor: '#000',
              color: '#fff',
              '&:hover': { bgcolor: '#333' },
              borderRadius: 0,
            }}
          >
            {editingDynasty
              ? `${t('common.update', 'Update')} / ${t('actions.update_ta', 'புதுப்பி')}`
              : `${t('common.save', 'Save')} / ${t('actions.save_ta', 'சேமி')}`
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
