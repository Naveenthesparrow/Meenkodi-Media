import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from "react-router-dom";
import SEO, { pageSEO } from '../common/SEO';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  Container,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Fade,
  CircularProgress,
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  Favorite,
} from "@mui/icons-material";
import API_BASE_URL from "../../utils/api";
import { useBilingualContent } from "../../utils/bilingualContent";

export default function Kings({ user }) {
  const navigate = useNavigate();
  const getContent = useBilingualContent();
  const { t } = useTranslation();
  const [kings, setKings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ta: "",
    dynasty_en: "",
    dynasty_ta: "",
    period_en: "",
    period_ta: "",
    achievements_en: "",
    achievements_ta: "",
    capital_en: "",
    capital_ta: "",
    description_en: "",
    description_ta: "",
    image: "",
  });

  const handleCardClick = (kingId) => {
    navigate(`/explore/kings/${kingId}`);
  };

  const fetchKings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/kings`);
      if (!res.ok) throw new Error("Failed to fetch kings");
      const data = await res.json();
      setKings(data);
    } catch (err) {
      console.error(err);
      setKings([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKings();
  }, []);

  const toStr = (val) => {
    if (!val) return "";
    if (typeof val === 'string') return val;
    if (typeof val === 'object') return val.en || val.ta || "";
    return "";
  };
  const toTa = (val) => {
    if (!val) return "";
    if (typeof val === 'object') return val.ta || "";
    return "";
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      name_en: toStr(item.name),
      name_ta: toTa(item.name),
      dynasty_en: toStr(item.dynasty),
      dynasty_ta: toTa(item.dynasty),
      period_en: toStr(item.period),
      period_ta: toTa(item.period),
      achievements_en: toStr(item.achievements),
      achievements_ta: toTa(item.achievements),
      capital_en: toStr(item.capital),
      capital_ta: toTa(item.capital),
      description_en: toStr(item.description),
      description_ta: toTa(item.description),
      image: item.image,
    });
    setEditOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      name_en: "",
      name_ta: "",
      dynasty_en: "",
      dynasty_ta: "",
      period_en: "",
      period_ta: "",
      achievements_en: "",
      achievements_ta: "",
      capital_en: "",
      capital_ta: "",
      description_en: "",
      description_ta: "",
      image: "" 
    });
    setAddOpen(true);
  };

  const handleSave = () => {
    (async () => {
      try {
        const payload = {
          name: { en: formData.name_en, ta: formData.name_ta },
          dynasty: { en: formData.dynasty_en, ta: formData.dynasty_ta },
          period: { en: formData.period_en, ta: formData.period_ta },
          achievements: { en: formData.achievements_en, ta: formData.achievements_ta },
          capital: { en: formData.capital_en, ta: formData.capital_ta },
          description: { en: formData.description_en, ta: formData.description_ta },
          image: formData.image,
        };

        if (editItem) {
          const res = await fetch(`${API_BASE_URL}/api/kings/${editItem._id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Update failed");
        } else {
          const res = await fetch(`${API_BASE_URL}/api/kings`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Create failed");
        }
        await fetchKings();
        setEditOpen(false);
        setAddOpen(false);
      } catch (err) {
        console.error(err);
        alert("Failed to save king");
      }
    })();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this king's profile?")) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/kings/${id}`, {
            method: "DELETE",
            credentials: "include",
          });
          
          if (!res.ok) throw new Error("Delete failed");
          
          setKings(prevKings => 
            prevKings.filter((king) => king._id !== id)
          );
          
          await fetchKings();
        } catch (err) {
          console.error(err);
          alert("Failed to delete king's profile");
        }
      })();
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress sx={{ color: "#000" }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      <SEO {...pageSEO.kings} />
      <Box 
        sx={{ 
          mb: 6, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: user && user.role === "admin" ? 'space-between' : 'center',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 0 },
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
          {t('kings.title','Kings')}
        </Typography>
        
        {user && user.role === "admin" && (
          <Box 
            sx={{ 
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
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
              {t('kings.add','Add King')}
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
          perspective: '1000px',
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
        {kings.map((king, index) => (
          <Fade 
            in={true} 
            timeout={500 + index * 200} 
            key={king._id}
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
                  height: 'auto', 
                  minHeight: 350,
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
                onClick={() => navigate(`/explore/kings/${king._id}`)}
              >
                {(king.image || king.imageLink) ? (
                  <CardMedia
                    component="img"
                    height={200}
                    image={king.image || king.imageLink}
                    alt={getContent(king.name)}
                    sx={{ 
                      objectFit: "contain",
                      width: '100%',
                      maxHeight: 200,
                      backgroundColor: '#f0f0f0',
                      padding: '10px',
                      boxSizing: 'border-box',
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', king.image || king.imageLink);
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
                    transition: 'all 0.3s ease',
                  }}
                >
                  {user && user.role === "admin" && (
                    <Box 
                      sx={{
                        display: "flex", 
                        justifyContent: 'flex-end',
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(king);
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
                          handleDelete(king._id);
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
                        fontSize: { xs: '1.25rem', md: '1.5rem' },
                        textTransform: 'capitalize',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {getContent(king.name)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666",
                        fontStyle: "italic",
                        fontSize: { xs: '0.8rem', md: '0.9rem' },
                        mb: 1,
                        textTransform: 'capitalize',
                      }}
                    >
                      {getContent(king.period)}
                    </Typography>
                    
                    {/* Like Count */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#000",
                          fontWeight: 600,
                          fontSize: { xs: '0.75rem', md: '0.85rem' },
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <Favorite sx={{ fontSize: '1rem' }} />
                        {king.likes ? (Array.isArray(king.likes) ? king.likes.length : 0) : 0} likes
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    component={Link}
                    to={`/explore/kings/${king._id}`}
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
        open={editOpen || addOpen}
        onClose={() => {
          setEditOpen(false);
          setAddOpen(false);
        }}
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
          {editItem ? t('kings.edit','Edit King Profile') : t('kings.addNew','Add New King Profile')}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            label={`${t('form.name','Name')} (EN)`}
            value={formData.name_en}
            onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={`${t('form.name','Name')} (TA)`}
            value={formData.name_ta}
            onChange={(e) => setFormData({ ...formData, name_ta: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={`Dynasty (EN)`}
            value={formData.dynasty_en}
            onChange={(e) => setFormData({ ...formData, dynasty_en: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={`Dynasty (TA)`}
            value={formData.dynasty_ta}
            onChange={(e) => setFormData({ ...formData, dynasty_ta: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={`${t('form.period','Period')} (EN)`}
            value={formData.period_en}
            onChange={(e) => setFormData({ ...formData, period_en: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={`${t('form.period','Period')} (TA)`}
            value={formData.period_ta}
            onChange={(e) => setFormData({ ...formData, period_ta: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={`Achievements (EN)`}
            value={formData.achievements_en}
            onChange={(e) => setFormData({ ...formData, achievements_en: e.target.value })}
            multiline
            minRows={2}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={`Achievements (TA)`}
            value={formData.achievements_ta}
            onChange={(e) => setFormData({ ...formData, achievements_ta: e.target.value })}
            multiline
            minRows={2}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={`Capital (EN)`}
            value={formData.capital_en}
            onChange={(e) => setFormData({ ...formData, capital_en: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={`Capital (TA)`}
            value={formData.capital_ta}
            onChange={(e) => setFormData({ ...formData, capital_ta: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={`${t('form.description','Description')} (EN)`}
            value={formData.description_en}
            onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
            multiline
            minRows={3}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={`${t('form.description','Description')} (TA)`}
            value={formData.description_ta}
            onChange={(e) => setFormData({ ...formData, description_ta: e.target.value })}
            multiline
            minRows={3}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label={t('form.imageUrl','Image URL')}
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions
          sx={{ 
            p: 2, 
            justifyContent: 'space-between',
            bgcolor: '#f0f0f0' 
          }}
        >
          <Button
            onClick={() => {
              setEditOpen(false);
              setAddOpen(false);
            }}
            sx={{ color: '#000' }}
          >
            {t('actions.cancel','Cancel')}
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              bgcolor: '#000',
              color: '#fff',
              '&:hover': { bgcolor: '#333' },
              borderRadius: 0,
            }}
          >
            {editItem ? t('actions.update','Update') : t('actions.add','Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
