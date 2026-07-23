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
  Chip,
  CircularProgress,
  Container,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Fade,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  AccountBalance,
  LocationOn,
  CalendarToday,
  Edit,
  Delete,
  Add,
  Architecture,
  Star,
  Favorite,
} from "@mui/icons-material";
import API_BASE_URL from "../../utils/api";
import { useBilingualContent } from "../../utils/bilingualContent";

let cachedTemplesData = null;

export default function Temples({ user }) {
  const navigate = useNavigate();
  const getContent = useBilingualContent();
  const { t } = useTranslation();
  const [templesRaw, setTemplesRaw] = useState(cachedTemplesData || []);
  const setTemples = (val) => {
    if (typeof val === 'function') {
      setTemplesRaw(prev => { const next = val(prev); cachedTemplesData = next; return next; });
    } else { cachedTemplesData = val; setTemplesRaw(val); }
  };
  const temples = templesRaw;
  const [loading, setLoading] = useState(!cachedTemplesData);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editLanguage, setEditLanguage] = useState('en');
  const [formData, setFormData] = useState({
    name_en: "",
    name_ta: "",
    location_en: "",
    location_ta: "",
    period_en: "",
    period_ta: "",
    image: "",
  });

  const handleCardClick = (templeId) => {
    navigate(`/explore/temples/${templeId}`);
  };

  const fetchTemples = async () => {
    if (!cachedTemplesData) setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/temples`);
      if (!res.ok) throw new Error("Failed to fetch temples");
      const data = await res.json();
      setTemples(data);
    } catch (err) {
      console.error(err);
      if (!cachedTemplesData) setTemples([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemples();
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
      location_en: toStr(item.location),
      location_ta: toTa(item.location),
      period_en: toStr(item.period),
      period_ta: toTa(item.period),
      image: item.image,
    });
    setEditOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      name_en: "",
      name_ta: "",
      location_en: "",
      location_ta: "",
      period_en: "",
      period_ta: "",
      image: ""
    });
    setAddOpen(true);
  };

  const handleSave = () => {
    (async () => {
      try {
        const payload = {
          name: { en: formData.name_en, ta: formData.name_ta },
          location: { en: formData.location_en, ta: formData.location_ta },
          period: { en: formData.period_en, ta: formData.period_ta },
          image: formData.image,
        };

        if (editItem) {
          const res = await fetch(`${API_BASE_URL}/api/temples/${editItem._id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Update failed");
        } else {
          const res = await fetch(`${API_BASE_URL}/api/temples`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Create failed");
        }
        await fetchTemples();
        setEditOpen(false);
        setAddOpen(false);
      } catch (err) {
        console.error(err);
        alert("Failed to save temple");
      }
    })();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this temple?")) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/temples/${id}`, {
            method: "DELETE",
            credentials: "include",
          });

          if (!res.ok) throw new Error("Delete failed");

          // Optimistic update
          setTemples(temples.filter((item) => item._id !== id));

          // Optional: Refresh to ensure consistency
          await fetchTemples();
        } catch (err) {
          console.error(err);
          alert("Failed to delete temple");
        }
      })();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: "#000" }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      <SEO {...pageSEO.temples} />
      {/* Sacred Temples Heading Section */}
      <Box
        sx={{
          mb: 6,
          textAlign: 'left',
          position: 'relative',
          overflow: 'hidden',
        }}
      >


        <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', md: 'row' }, mb: 1 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: "#8B0000",
              fontFamily: 'Georgia, serif',
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              letterSpacing: 2,
              mb: { xs: 0.5, md: 1 },
              position: 'relative',
              display: 'inline-block',
              textTransform: 'uppercase',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                transform: 'none',
                width: '120px',
                height: '4px',
                background: 'linear-gradient(90deg, transparent, #DAA520, transparent)',
              },
            }}
          >
            {t('temples.title', 'Sacred Temples')}
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              color: '#666',
              fontStyle: 'italic',
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              mt: { xs: 1, md: '-0.15rem' },
              pr: { md: 12 },
              textAlign: { xs: 'left', md: 'right' },
              fontFamily: 'Georgia, serif',
            }}
          >
            {t('temples.subtitle', 'Architectural Marvels of Tamil Heritage')}
          </Typography>
        </Box>

        {/* Admin Button - Positioned Absolutely */}
        {user && user.role === "admin" && (
          <Box
            sx={{
              position: { xs: 'static', md: 'absolute' },
              right: { md: 0 },
              top: { md: '50%' },
              transform: { md: 'translateY(-50%)' },
              mt: { xs: 3, md: 0 },
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: { md: 'translateY(-50%) scale(1.05)' },
                '& button': {
                  boxShadow: '0 8px 20px rgba(139,0,0,0.3)',
                }
              }
            }}
          >
            <Button
              onClick={handleAdd}
              variant="contained"
              startIcon={<Add />}
              sx={{
                bgcolor: "#8B0000",
                color: "#fff",
                transition: 'all 0.3s ease',
                "&:hover": {
                  bgcolor: "#6B0000",
                  boxShadow: '0 8px 20px rgba(139,0,0,0.3)',
                },
                borderRadius: 0,
                px: 3,
                py: 1,
                fontWeight: 700,
                letterSpacing: 0.5,
                fontFamily: 'Georgia, serif',
              }}
            >
              {t('temples.add', 'Add Temple')}
            </Button>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          },
          gap: { xs: 3, md: 4 },
        }}
      >
        {temples.map((temple, index) => (
          <Fade
            in={true}
            timeout={500 + index * 150}
            key={temple._id}
          >
            <Box
              sx={{
                width: '100%',
                transition: 'all 0.3s ease',
              }}
            >
              <Card
                sx={{
                  width: '100%',
                  height: { xs: 460, md: 500 },
                  display: 'flex',
                  flexDirection: 'column',
                  border: 'none',
                  borderRadius: 0,
                  bgcolor: "#fff",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  position: 'relative',
                  overflow: 'visible',
                  boxShadow: '0 8px 25px rgba(139,0,0,0.12)',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: -8,
                    left: -8,
                    right: -8,
                    bottom: -8,
                    border: '2px solid #8B0000',
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                    zIndex: -1,
                  },
                  "&:hover": {
                    transform: "translateY(-16px)",
                    boxShadow: '0 25px 50px rgba(139,0,0,0.25)',
                    '&::after': {
                      opacity: 1,
                    },
                    "& .temple-image": {
                      transform: 'scale(1.1) rotate(2deg)',
                    },
                    "& .temple-overlay": {
                      opacity: 1,
                    },
                    "& .temple-title": {
                      color: '#8B0000',
                    },
                    "& .view-button": {
                      bgcolor: '#8B0000',
                      color: '#fff',
                      transform: 'translateY(-4px)',
                    },
                    "& .admin-controls": {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                    "& .like-badge": {
                      transform: 'scale(1.1) rotate(-5deg)',
                    }
                  },
                }}
                onClick={() => navigate(`/explore/temples/${temple._id}`)}
              >
                {/* Image Section with Overlay */}
                <Box sx={{ position: 'relative', height: 240, overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                  {(temple.image || temple.imageLink) ? (
                    <CardMedia
                      component="img"
                      image={temple.image || temple.imageLink}
                      alt={getContent(temple.name)}
                      className="temple-image"
                      sx={{
                        objectFit: "cover",
                        width: '100%',
                        height: '100%',
                        transition: 'all 0.6s ease',
                      }}
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3E%3Crect fill='%23e0e0e0' width='400' height='240'%3E%3C/rect%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-size='18px' fill='%23999'%3E🕉️ Temple%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: '100%',
                        width: '100%',
                        backgroundColor: '#e0e0e0',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ fontFamily: 'Georgia, serif', fontSize: '3rem' }}
                      >
                        🕉️
                      </Typography>
                    </Box>
                  )}

                  {/* Gradient Overlay */}
                  <Box
                    className="temple-overlay"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '60%',
                      background: 'linear-gradient(to top, rgba(139,0,0,0.85) 0%, rgba(139,0,0,0.3) 50%, transparent 100%)',
                      opacity: 0.7,
                      transition: 'opacity 0.4s ease',
                    }}
                  />

                  {/* Like Badge - Top Right */}
                  <Box
                    className="like-badge"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      bgcolor: 'rgba(255,255,255,0.95)',
                      px: 1.5,
                      py: 0.8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    <Favorite sx={{ color: '#8B0000', fontSize: '1rem' }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#000' }}>
                      {temple.likes ? temple.likes.length : 0}
                    </Typography>
                  </Box>

                  {/* Period Badge - Top Left */}
                  {getContent(temple.period) && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 0,
                        bgcolor: '#DAA520',
                        color: '#fff',
                        px: 2,
                        py: 0.8,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: 0.5,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                      }}
                    >
                      {getContent(temple.period).substring(0, 30)}
                    </Box>
                  )}

                  {/* Admin Controls - Absolute positioned on image */}
                  {user && user.role === "admin" && (
                    <Box
                      className="admin-controls"
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        display: "flex",
                        gap: 1,
                        zIndex: 5,
                        opacity: 0,
                        transform: 'translateY(10px)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(temple);
                        }}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.95)',
                          color: '#000',
                          width: 36,
                          height: 36,
                          '&:hover': {
                            bgcolor: '#8B0000',
                            color: '#fff',
                          },
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(temple._id);
                        }}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.95)',
                          color: '#000',
                          width: 36,
                          height: 36,
                          '&:hover': {
                            bgcolor: '#8B0000',
                            color: '#fff',
                          },
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>

                {/* Content Section */}
                <CardContent
                  sx={{
                    p: 3,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    bgcolor: '#fff',
                  }}
                >
                  {/* Title */}
                  <Box>
                    <Typography
                      className="temple-title"
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#000",
                        mb: 1,
                        lineHeight: 1.3,
                        fontSize: { xs: '1.2rem', md: '1.3rem' },
                        fontFamily: 'Georgia, serif',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '2.6rem',
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {getContent(temple.name)}
                    </Typography>

                    {/* Location */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 2 }}>
                      <LocationOn sx={{ fontSize: '1rem', color: '#8B0000' }} />
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666",
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          fontStyle: 'italic',
                        }}
                      >
                        {getContent(temple.location)}
                      </Typography>
                    </Box>

                    {/* Description/Info */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#555",
                        lineHeight: 1.6,
                        fontSize: '0.875rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '2.8rem',
                      }}
                    >
                      {getContent(temple.description) || `Sacred temple showcasing ancient Tamil architecture and spiritual heritage.`}
                    </Typography>
                  </Box>

                  {/* View Button */}
                  <Button
                    className="view-button"
                    component={Link}
                    to={`/explore/temples/${temple._id}`}
                    variant="outlined"
                    fullWidth
                    endIcon={<Architecture />}
                    sx={{
                      color: "#000",
                      borderColor: "#000",
                      borderWidth: 2,
                      borderRadius: 0,
                      mt: 2,
                      py: 1,
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      letterSpacing: 0.5,
                      transition: 'all 0.3s ease',
                      "&:hover": {
                        borderColor: "#8B0000",
                      },
                    }}
                  >
                    Explore Temple
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Fade>
        ))}
      </Box>


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
          {editItem ? t('temples.edit', 'Edit Temple') : t('temples.addNew', 'Add New Temple')}
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
          <TextField
            fullWidth
            label={t('form.name', 'Name')}
            value={editLanguage === 'en' ? formData.name_en : formData.name_ta}
            onChange={(e) => setFormData({ 
              ...formData, 
              [editLanguage === 'en' ? 'name_en' : 'name_ta']: e.target.value 
            })}
            sx={{ mb: 2, mt: 1 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label={t('form.location', 'Location')}
            value={editLanguage === 'en' ? formData.location_en : formData.location_ta}
            onChange={(e) => setFormData({ 
              ...formData, 
              [editLanguage === 'en' ? 'location_en' : 'location_ta']: e.target.value 
            })}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label={t('form.period', 'Period')}
            value={editLanguage === 'en' ? formData.period_en : formData.period_ta}
            onChange={(e) => setFormData({ 
              ...formData, 
              [editLanguage === 'en' ? 'period_en' : 'period_ta']: e.target.value 
            })}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label={t('form.imageUrl', 'Image URL')}
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
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
            {t('actions.cancel', 'Cancel')} / {t('actions.cancel_ta', 'ரத்துசெய்')}
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
            {editItem 
              ? `${t('actions.update', 'Update')} / ${t('actions.update_ta', 'புதுப்பி')}` 
              : `${t('actions.add', 'Add')} / ${t('actions.add_ta', 'சேர்')}`
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
