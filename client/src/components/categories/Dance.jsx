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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ToggleButton,
  ToggleButtonGroup,
  ListItemText,
  Tooltip,
} from "@mui/material";
import {
  MusicNote,
  TheaterComedy,
  Groups,
  Edit,
  Delete,
  Add,
  Star,
  Schedule,
  Person,
  EmojiEvents,
  LocalActivity,
  School,
  Palette,
  Favorite,
} from "@mui/icons-material";
import API_BASE_URL from "../../utils/api";
import { useBilingualContent } from "../../utils/bilingualContent";

let cachedDancesData = null;

export default function Dance({ user }) {
  const navigate = useNavigate();
  const getContent = useBilingualContent();
  const { t } = useTranslation();
  const [dancesRaw, setDancesRaw] = useState(cachedDancesData || []);
  const setDances = (val) => {
    if (typeof val === 'function') {
      setDancesRaw(prev => { const next = val(prev); cachedDancesData = next; return next; });
    } else { cachedDancesData = val; setDancesRaw(val); }
  };
  const dances = dancesRaw;
  const [loading, setLoading] = useState(!cachedDancesData);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editLanguage, setEditLanguage] = useState('en');
  // Removed filter-related state and methods
  const [formData, setFormData] = useState({
    name_en: "",
    name_ta: "",
    type_en: "",
    type_ta: "",
    description_en: "",
    description_ta: "",
    image: "",
  });

  // Removed typeOptions and originOptions

  useEffect(() => {
    fetchDances();
  }, []);

  const fetchDances = async () => {
    if (!cachedDancesData) setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/dance`);
      if (!res.ok) throw new Error("Failed to fetch Dance data");
      const data = await res.json();
      setDances(data);
    } catch (err) {
      console.error("Error fetching Dance data:", err);
      if (!cachedDancesData) setDances([]);
    } finally {
      setLoading(false);
    }
  };

  // Removed filteredDances

  const handleEdit = (item) => {
    setEditItem(item);
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
    setFormData({
      name_en: toStr(item.name),
      name_ta: toTa(item.name),
      type_en: toStr(item.type),
      type_ta: toTa(item.type),
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
      type_en: "",
      type_ta: "",
      description_en: "",
      description_ta: "",
      image: "",
    });
    setAddOpen(true);
  };

  const handleSave = () => {
    (async () => {
      try {
        const payload = {
          name: { en: formData.name_en || "", ta: formData.name_ta || "" },
          type: { en: formData.type_en || "", ta: formData.type_ta || "" },
          description: { en: formData.description_en || "", ta: formData.description_ta || "" },
          image: formData.image,
        };
        if (editItem) {
          const res = await fetch(`${API_BASE_URL}/api/dance/${editItem._id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Update failed");
        } else {
          const res = await fetch(`${API_BASE_URL}/api/dance`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Create failed");
        }
        await fetchDances();
        setEditOpen(false);
        setAddOpen(false);
      } catch (err) {
        console.error(err);
        alert("Failed to save dance");
      }
    })();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this dance entry?")) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/dance/${id}`, {
            method: "DELETE",
            credentials: "include",
          });

          if (!res.ok) throw new Error("Delete failed");

          // Optimistic update
          setDances((prevDances) =>
            prevDances.filter((dance) => dance._id !== id)
          );

          // Optional: Refresh to ensure consistency
          await fetchDances();
        } catch (err) {
          console.error(err);
          alert("Failed to delete dance entry");
        }
      })();
    }
  };

  const handleCardClick = (id) => {
    const dance = dances.find((d) => d._id === id);
    console.log("Clicked dance card:", dance?.name, "ID:", id);
    navigate(`/explore/dance/${id}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: "#000" }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: "relative" }}>
      <SEO {...pageSEO.dance} />
      {/* Unique Heading Section */}
      <Box
        sx={{
          mb: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 0 },
          position: 'relative',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: "#8B0000",
              fontFamily: 'Georgia, serif',
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              letterSpacing: 2,
              mb: { xs: 0.5, md: 1 },
              position: "relative",
              display: "inline-block",
              textTransform: 'uppercase',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: '120px',
                height: '4px',
                background: 'linear-gradient(90deg, transparent, #DAA520, transparent)',
              },
            }}
          >
            {t('dance.title', 'Dance')}
          </Typography>
        </Box>

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: { xs: 'center', md: 'flex-end' },
          gap: 1
        }}>
          <Typography
            variant="subtitle1"
            sx={{
              color: '#666',
              fontStyle: 'italic',
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              textAlign: { xs: 'center', md: 'right' },
              fontFamily: 'Georgia, serif',
            }}
          >
            {t('dance.subtitle')}
          </Typography>

          {user && user.role === "admin" && (
            <Box
              sx={{
                transition: "all 0.3s ease",
                mt: 1,
                "&:hover": {
                  transform: "scale(1.05)",
                  "& button": {
                    boxShadow: "0 8px 20px rgba(139,0,0,0.3)",
                  },
                },
              }}
            >
              <Button
                onClick={handleAdd}
                variant="contained"
                startIcon={<Add />}
                sx={{
                  bgcolor: "#8B0000",
                  color: "#fff",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "#6B0000",
                    boxShadow: "0 8px 20px rgba(139,0,0,0.3)",
                  },
                  borderRadius: 0,
                  px: 3,
                  py: 1,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  fontFamily: 'Georgia, serif',
                  whiteSpace: 'nowrap',
                }}
              >
                {t('dance.add', '3 Dance')}
              </Button>
            </Box>
          )}
        </Box>
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
        {dances.map((dance, index) => (
          <Fade
            in={true}
            timeout={500 + index * 150}
            key={dance._id}
          >
            <Box
              sx={{
                width: '100%',
                transition: 'all 0.3s ease',
              }}
            >
              {console.log(
                "Rendering dance card:",
                dance.name,
                "ID:",
                dance._id
              )}
              <Card
                component={Link}
                to={`/explore/dance/${dance._id}`}
                sx={{
                  textDecoration: 'none',
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
                    "& .card-title": {
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
              >
                {/* Image Section with Overlay */}
                <Box sx={{ position: 'relative', height: 240, overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                  {(dance.image || dance.imageLink) ? (
                    <CardMedia
                      component="img"
                      image={dance.image || dance.imageLink}
                      alt={getContent(dance.name)}
                      className="temple-image"
                      sx={{
                        objectFit: "cover",
                        width: '100%',
                        height: '100%',
                        transition: 'all 0.6s ease',
                      }}
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3E%3Crect fill='%23e0e0e0' width='400' height='240'%3E%3C/rect%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-size='18px' fill='%23999'%3E💃 Dance%3C/text%3E%3C/svg%3E";
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
                        💃
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
                      {dance.likes ? dance.likes.length : 0}
                    </Typography>
                  </Box>

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
                          handleEdit(dance);
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
                          handleDelete(dance._id);
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
                      className="card-title"
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#000",
                        mb: 1,
                        lineHeight: 1.3,
                        fontSize: { xs: '1.15rem', md: '1.25rem' },
                        fontFamily: 'Georgia, serif',
                        transition: 'color 0.3s ease',
                        position: 'relative',
                        display: 'inline-block',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: -6,
                          left: 0,
                          width: '48px',
                          height: '3px',
                          bgcolor: '#DAA520',
                          borderRadius: 1,
                        },
                      }}
                    >
                      {getContent(dance.name)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666",
                        fontStyle: "italic",
                        fontSize: { xs: '0.85rem', md: '0.9rem' },
                        mb: 2,
                        mt: 1.5,
                        fontFamily: 'Georgia, serif',
                      }}
                    >
                      {getContent(dance.type)}
                    </Typography>
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
                      {getContent(dance.description) || `Traditional Tamil dance form showcasing ancient cultural heritage.`}
                    </Typography>
                  </Box>

                  <Button
                    className="view-button"
                    component={Link}
                    to={`/explore/dance/${dance._id}`}
                    variant="outlined"
                    fullWidth
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
                    Explore Dance
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
          "& .MuiDialog-paper": {
            borderRadius: 0,
            border: "3px solid #000",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#000",
            color: "#fff",
            textAlign: "center",
            fontWeight: 700,
          }}
        >
          {editItem ? t('dance.edit', 'Edit Dance Form') : t('dance.addNew', 'Add New Dance Form')}
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
            onChange={(e) => setFormData({ ...formData, [editLanguage === 'en' ? 'name_en' : 'name_ta']: e.target.value })} 
            sx={{ mb: 2 }} 
          />
          <TextField 
            fullWidth 
            label={t('form.type', 'Type')} 
            value={editLanguage === 'en' ? formData.type_en : formData.type_ta} 
            onChange={(e) => setFormData({ ...formData, [editLanguage === 'en' ? 'type_en' : 'type_ta']: e.target.value })} 
            sx={{ mb: 2 }} 
          />
          <TextField 
            fullWidth 
            label={t('form.description', 'Description')} 
            value={editLanguage === 'en' ? formData.description_en : formData.description_ta} 
            onChange={(e) => setFormData({ ...formData, [editLanguage === 'en' ? 'description_en' : 'description_ta']: e.target.value })} 
            multiline 
            minRows={3} 
            sx={{ mb: 2 }} 
          />
          <TextField
            fullWidth
            label={t('form.imageUrl', 'Image URL')}
            value={formData.image}
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.value })
            }
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            justifyContent: "space-between",
            bgcolor: "#f0f0f0",
          }}
        >
          <Button
            onClick={() => {
              setEditOpen(false);
              setAddOpen(false);
            }}
            sx={{ color: "#000" }}
          >
            {t('actions.cancel', 'Cancel')} / {t('actions.cancel_ta', 'ரத்துசெய்')}
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              bgcolor: "#000",
              color: "#fff",
              "&:hover": { bgcolor: "#333" },
              borderRadius: 0,
            }}
          >
            {editItem ? `${t('actions.update', 'Update')} / ${t('actions.update_ta', 'புதுப்பி')}` : `${t('actions.add', 'Add')} / ${t('actions.add_ta', 'சேர்')}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
