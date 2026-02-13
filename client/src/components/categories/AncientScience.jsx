import React, { useEffect, useState } from "react";
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
  ListItemText,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Science,
  MenuBook,
  LocalHospital,
  Edit,
  Delete,
  Add,
  Star,
  Timeline,
  Psychology,
  Healing,
  Architecture,
  Calculate,
  Biotech,
  Favorite,
} from "@mui/icons-material";
import API_BASE_URL from "../../utils/api";
import { useBilingualContent } from "../../utils/bilingualContent";
import { useTranslation } from 'react-i18next';
import MediaUpload from "../common/MediaUpload";

export default function AncientScience({ user }) {
  const [sciences, setSciences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editLanguage, setEditLanguage] = useState('en');
  // Removed filter-related state and methods
  const [formData, setFormData] = useState({
    name_en: "",
    name_ta: "",
    period_en: "",
    period_ta: "",
    description_en: "",
    description_ta: "",
    image: "",
    imageLink: "",
    videoLink: "",
  });
  // Bilingual content resolver
  const getContent = useBilingualContent();
  const { t } = useTranslation();

  useEffect(() => {
    fetchScience();
  }, []);

  const fetchScience = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/ancientscience`);
      if (!res.ok) {
        throw new Error("Failed to fetch Ancient Science data");
      }
      const data = await res.json();
      setSciences(data);
    } catch (err) {
      console.error("Error fetching Ancient Science data:", err);
      setSciences([]); // Fallback to an empty array instead of dummy data
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (item) => {
    setEditItem(item);
    // map bilingual source (object {en,ta} or primitive) to inputs
    const toStr = (val) => {
      if (!val) return "";
      if (typeof val === 'string') return val;
      if (typeof val === 'object') return val.en || val.ta || "";
      return "";
    };
    const toTa = (val) => {
      if (!val) return "";
      if (typeof val === 'object') return val.ta || "";
      return ""; // primitive assumed EN only
    };
    setFormData({
      name_en: toStr(item.name),
      name_ta: toTa(item.name),
      period_en: toStr(item.period),
      period_ta: toTa(item.period),
      description_en: toStr(item.description),
      description_ta: toTa(item.description),
      image: item.image,
      imageLink: item.imageLink || "",
      videoLink: item.videoLink || "",
    });
    setEditOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      name_en: "",
      name_ta: "",
      period_en: "",
      period_ta: "",
      description_en: "",
      description_ta: "",
      image: "",
      imageLink: "",
      videoLink: "",
    });
    setAddOpen(true);
  };

  const handleSave = () => {
    (async () => {
      try {
        let res;
        const payload = {
          name: { en: formData.name_en || "", ta: formData.name_ta || "" },
          period: { en: formData.period_en || "", ta: formData.period_ta || "" },
          description: { en: formData.description_en || "", ta: formData.description_ta || "" },
          image: formData.image,
          imageLink: formData.imageLink,
          videoLink: formData.videoLink,
        };
        if (editItem) {
          res = await fetch(`${API_BASE_URL}/api/ancientscience/${editItem._id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else {
          res = await fetch(`${API_BASE_URL}/api/ancientscience`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }

        if (!res.ok) {
          const errorData = await res.text();
          console.error("Save failed:", errorData);
          throw new Error(`Save failed: ${res.status}`);
        }

        const savedItem = await res.json();

        // Update local state
        if (editItem) {
          // Replace the edited item in the list
          setSciences(sciences.map(item =>
            item._id === savedItem._id ? savedItem : item
          ));
        } else {
          // Add the new item to the list
          setSciences([...sciences, savedItem]);
        }

        // Close the dialog
        setEditOpen(false);
        setAddOpen(false);
      } catch (err) {
        console.error("Error saving scientific knowledge:", err);
        alert(`Failed to save scientific knowledge: ${err.message}`);
      }
    })();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this ancient science entry?")) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/ancientscience/${id}`, {
            method: "DELETE",
            credentials: "include",
          });

          if (!res.ok) throw new Error("Delete failed");

          // Optimistic update
          setSciences(prevSciences =>
            prevSciences.filter((science) => science._id !== id)
          );

          // Optional: Refresh to ensure consistency
          await fetchScience();
        } catch (err) {
          console.error(err);
          alert("Failed to delete ancient science entry");
        }
      })();
    }
  };

  const navigate = useNavigate();

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress sx={{ color: "#000" }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      <SEO {...pageSEO.ancientScience} />
      {/* Unique Heading Section */}
      <Box
        sx={{
          mb: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: user && user.role === "admin" ? 'space-between' : 'flex-start',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 0 },
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', md: 'row' }, mb: 1, width: user && user.role === "admin" ? 'auto' : '100%' }}>
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
            {t('ancientScience.title', 'Ancient Science')}
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              color: '#666',
              fontStyle: 'italic',
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              mt: { xs: 1, md: '-0.15rem' },
              pr: { md: 12 },
              textAlign: 'right',
              fontFamily: 'Georgia, serif',
            }}
          >
            {t('ancientScience.subtitle')}
          </Typography>
        </Box>

        {user && user.role === "admin" && (
          <Box
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)',
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
                whiteSpace: 'nowrap',
              }}
            >
              {t('ancientScience.add', 'Add Science')}
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
        {sciences.map((science, index) => (
          <Fade
            in={true}
            timeout={500 + index * 150}
            key={science._id}
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
                onClick={() =>
                  navigate(`/explore/ancientscience/${science._id}`)
                }
              >
                {/* Image Section with Overlay */}
                <Box sx={{ position: 'relative', height: 240, overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                  {(science.image || science.imageLink) ? (
                    <CardMedia
                      component="img"
                      image={science.image || science.imageLink}
                      alt={getContent(science.name)}
                      className="temple-image"
                      sx={{
                        objectFit: "cover",
                        width: '100%',
                        height: '100%',
                        transition: 'all 0.6s ease',
                      }}
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3E%3Crect fill='%23e0e0e0' width='400' height='240'%3E%3C/rect%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-size='18px' fill='%23999'%3E⚗️ Science%3C/text%3E%3C/svg%3E";
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
                        ⚗️
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
                      {science.likes ? science.likes.length : 0}
                    </Typography>
                  </Box>

                  {/* Period Badge - Top Left */}
                  {getContent(science.period) && (
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
                      {getContent(science.period).substring(0, 30)}
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
                          handleEdit(science);
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
                          handleDelete(science._id);
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
                        transition: 'all 0.3s ease',
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
                      {getContent(science.name)}
                    </Typography>

                    {/* Description */}
                    {getContent(science.description) && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#555',
                          lineHeight: 1.7,
                          fontSize: { xs: '0.875rem', md: '0.95rem' },
                          display: '-webkit-box',
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          minHeight: { xs: '5rem', md: '5.6rem' },
                          mb: 2,
                        }}
                      >
                        {getContent(science.description)}
                      </Typography>
                    )}
                  </Box>

                  {/* Read More Button */}
                  <Button
                    component={Link}
                    to={`/explore/ancientscience/${science._id}`}
                    variant="outlined"
                    fullWidth
                    className="view-button"
                    sx={{
                      color: '#000',
                      borderColor: '#000',
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
                    {t('actions.explore', 'Explore Science').toUpperCase()}
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
          {editItem ? t('ancientScience.edit', 'Edit Scientific Knowledge') : t('ancientScience.addNew', 'Add New Scientific Knowledge')}
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
            label={t('form.period', 'Period')}
            value={editLanguage === 'en' ? formData.period_en : formData.period_ta}
            onChange={(e) => setFormData({ ...formData, [editLanguage === 'en' ? 'period_en' : 'period_ta']: e.target.value })}
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
          <MediaUpload
            onImageChange={(imageUrl) => setFormData({ ...formData, image: imageUrl })}
            onImageLinkChange={(imageLink) => setFormData({ ...formData, imageLink: imageLink })}
            onVideoLinkChange={(videoLink) => setFormData({ ...formData, videoLink: videoLink })}
            currentImage={formData.image}
            currentImageLink={formData.imageLink}
            currentVideoLink={formData.videoLink}
            label={t('ancientScience.mediaLabel', 'Science Image/Video')}
          />

          {/* Image Preview */}
          {(formData.image || formData.imageLink) && (
            <Box
              sx={{
                mt: 2,
                display: 'flex',
                justifyContent: 'center',
                border: '1px solid #ddd',
                borderRadius: 1,
                p: 2
              }}
            >
              <img
                src={formData.image || formData.imageLink}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: 200,
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  console.error('Preview image failed to load:', formData.image || formData.imageLink);
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E"; // Fallback to placeholder
                  e.target.style.display = 'block'; // Ensure it's visible if it was hidden
                }}
              />
            </Box>
          )}
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
            {editItem ? `${t('actions.update', 'Update')} / ${t('actions.update_ta', 'புதுப்பி')}` : `${t('actions.add', 'Add')} / ${t('actions.add_ta', 'சேர்')}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container >
  );
}
