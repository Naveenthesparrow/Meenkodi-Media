import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO, { pageSEO } from '../common/SEO';
import CategoryHeader from '../common/CategoryHeader';
import ExploreItemDialog from '../common/ExploreItemDialog';
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
import Science from "@mui/icons-material/Science";
import MenuBook from "@mui/icons-material/MenuBook";
import LocalHospital from "@mui/icons-material/LocalHospital";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import Add from "@mui/icons-material/Add";
import Star from "@mui/icons-material/Star";
import Timeline from "@mui/icons-material/Timeline";
import Psychology from "@mui/icons-material/Psychology";
import Healing from "@mui/icons-material/Healing";
import Architecture from "@mui/icons-material/Architecture";
import Calculate from "@mui/icons-material/Calculate";
import Biotech from "@mui/icons-material/Biotech";
import Favorite from "@mui/icons-material/Favorite";
import API_BASE_URL from "../../utils/api";
import { fetchPrefetched } from '../../utils/prefetch';
import { prefetchExploreItem, preloadExploreDetailPage } from '../../utils/explorePrefetch';
import { useBilingualContent } from "../../utils/bilingualContent";
import { useTranslation } from 'react-i18next';
import MediaUpload from "../common/MediaUpload";
import cldImg from "../../utils/cloudinaryImage";

let cachedSciencesData = null;

export default function AncientScience({ user }) {
  const [sciencesRaw, setSciencesRaw] = useState(cachedSciencesData || []);
  const setSciences = (val) => {
    if (typeof val === 'function') {
      setSciencesRaw(prev => { const next = val(prev); cachedSciencesData = next; return next; });
    } else { cachedSciencesData = val; setSciencesRaw(val); }
  };
  const sciences = sciencesRaw;
  const [loading, setLoading] = useState(!cachedSciencesData);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editLanguage, setEditLanguage] = useState('ta');
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


  // Load the detail page's code in the background so opening an item is quick

  useEffect(() => {

    const t = setTimeout(() => preloadExploreDetailPage('ancientscience'), 1000);

    return () => clearTimeout(t);

  }, []);

  const fetchScience = async () => {
    if (!cachedSciencesData) setLoading(true);
    try {
      const res = await fetchPrefetched(`${API_BASE_URL}/api/ancientscience`);
      if (!res.ok) throw new Error("Failed to fetch Ancient Science data");
      const data = await res.json();
      setSciences(data);
    } catch (err) {
      console.error("Error fetching Ancient Science data:", err);
      if (!cachedSciencesData) setSciences([]);
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
      if (typeof val === 'object') return val.en || "";
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: "#000" }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      <SEO {...pageSEO.ancientScience} />
      {/* Unique Heading Section */}
      <CategoryHeader
        title={t('ancientScience.title', 'Ancient Science')}
        subtitle={t('ancientScience.subtitle')}
        addLabel={t('ancientScience.add', 'Add Science')}
        onAdd={user && user.role === "admin" ? handleAdd : undefined}
      />

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
                component={Link}
                to={`/explore/ancientscience/${science.slug || science._id}`}
                onMouseEnter={() => prefetchExploreItem('ancientscience', science.slug || science._id)}
                onTouchStart={() => prefetchExploreItem('ancientscience', science.slug || science._id)}
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
                  {(science.image || science.imageLink) ? (
                    <CardMedia
                      component="img"
                      image={cldImg(science.image || science.imageLink, 800)}
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
                          e.preventDefault();
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
                          e.preventDefault();
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
                    to={`/explore/ancientscience/${science.slug || science._id}`}
                    onMouseEnter={() => prefetchExploreItem('ancientscience', science.slug || science._id)}
                    onTouchStart={() => prefetchExploreItem('ancientscience', science.slug || science._id)}
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
      <ExploreItemDialog
        open={editOpen || addOpen}
        onClose={() => { setEditOpen(false); setAddOpen(false); }}
        title={(ft) => (editItem ? ft('ancientScience.edit', 'Edit Scientific Knowledge') : ft('ancientScience.addNew', 'Add New Scientific Knowledge'))}
        isEdit={!!editItem}
        onSave={handleSave}
        formData={formData}
        setFormData={setFormData}
        language={editLanguage}
        onLanguageChange={setEditLanguage}
        fields={[
          { name: 'name', labelKey: 'form.name', label: 'Name', required: true },
          { name: 'period', labelKey: 'form.period', label: 'Period' },
          { name: 'description', labelKey: 'form.description', label: 'Description', multiline: true }
        ]}
      >
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
        
      </ExploreItemDialog>
    </Container >
  );
}
