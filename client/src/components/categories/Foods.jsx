import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
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
  Rating,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import AccessTime from "@mui/icons-material/AccessTime";
import People from "@mui/icons-material/People";
import LocationOn from "@mui/icons-material/LocationOn";
import Restaurant from "@mui/icons-material/Restaurant";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import Add from "@mui/icons-material/Add";
import Favorite from "@mui/icons-material/Favorite";
import API_BASE_URL from "../../utils/api";
import { fetchPrefetched } from '../../utils/prefetch';
import { prefetchExploreItem, preloadExploreDetailPage } from '../../utils/explorePrefetch';
import { useBilingualContent } from "../../utils/bilingualContent";
import cldImg from "../../utils/cloudinaryImage";

let cachedFoodsData = null;

export default function Foods({ user }) {
  const getContent = useBilingualContent();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [foodsRaw, setFoodsRaw] = useState(cachedFoodsData || []);
  const setFoods = (val) => {
    if (typeof val === 'function') {
      setFoodsRaw(prev => { const next = val(prev); cachedFoodsData = next; return next; });
    } else { cachedFoodsData = val; setFoodsRaw(val); }
  };
  const foods = foodsRaw;
  const [loading, setLoading] = useState(!cachedFoodsData);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editLanguage, setEditLanguage] = useState('ta');
  // Removed filter-related state and methods
  const [formData, setFormData] = useState({
    name_en: "",
    name_ta: "",
    category_en: "",
    category_ta: "",
    description_en: "",
    description_ta: "",
    image: "",
  });

  const fetchFoods = async () => {
    if (!cachedFoodsData) setLoading(true);
    try {
      const res = await fetchPrefetched(`${API_BASE_URL}/api/foods`);
      if (!res.ok) throw new Error("Failed to fetch foods");
      const data = await res.json();
      setFoods(data);
    } catch (err) {
      console.error("Error fetching foods:", err);
      if (!cachedFoodsData) setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);


  // Load the detail page's code in the background so opening an item is quick

  useEffect(() => {

    const t = setTimeout(() => preloadExploreDetailPage('foods'), 1000);

    return () => clearTimeout(t);

  }, []);

  // Removed filteredFoods

  const toStr = (val) => {
    if (!val) return "";
    if (typeof val === 'string') return val;
    if (typeof val === 'object') return val.en || "";
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
      category_en: toStr(item.category),
      category_ta: toTa(item.category),
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
      category_en: "",
      category_ta: "",
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
          category: { en: formData.category_en, ta: formData.category_ta },
          description: { en: formData.description_en, ta: formData.description_ta },
          image: formData.image,
        };

        if (editItem) {
          const res = await fetch(`${API_BASE_URL}/api/foods/${editItem._id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Update failed");
        } else {
          const res = await fetch(`${API_BASE_URL}/api/foods`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Create failed");
        }
        await fetchFoods();
        setEditOpen(false);
        setAddOpen(false);
      } catch (err) {
        console.error(err);
        alert("Failed to save recipe");
      }
    })();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this food entry?")) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/foods/${id}`, {
            method: "DELETE",
            credentials: "include",
          });

          if (!res.ok) throw new Error("Delete failed");

          // Optimistic update
          setFoods(prevFoods =>
            prevFoods.filter((food) => food._id !== id)
          );

          // Optional: Refresh to ensure consistency
          await fetchFoods();
        } catch (err) {
          console.error(err);
          alert("Failed to delete food entry");
        }
      })();
    }
  };

  const handleCardClick = (foodId) => {
    navigate(`/explore/foods/${foodId}`);
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
      <SEO {...pageSEO.foods} />
      {/* Unique Heading Section */}
      <CategoryHeader
        title={t('foods.title', 'Foods')}
        subtitle={t('foods.subtitle', 'Culinary Traditions of Tamil Lands')}
        addLabel={t('foods.add', 'Add Recipe')}
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
        {foods.map((food, index) => (
          <Fade
            in={true}
            timeout={500 + index * 150}
            key={food._id}
          >
            <Box
              sx={{
                width: '100%',
                transition: 'all 0.3s ease',
              }}
            >
              <Card
                component={Link}
                to={`/explore/foods/${food._id}`}
                onMouseEnter={() => prefetchExploreItem('foods', food._id)}
                onTouchStart={() => prefetchExploreItem('foods', food._id)}
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
                  {(food.image || food.imageLink) ? (
                    <CardMedia
                      component="img"
                      image={cldImg(food.image || food.imageLink, 800)}
                      alt={getContent(food.name)}
                      className="temple-image"
                      sx={{
                        objectFit: "cover",
                        width: '100%',
                        height: '100%',
                        transition: 'all 0.6s ease',
                      }}
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3E%3Crect fill='%23e0e0e0' width='400' height='240'%3E%3C/rect%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-size='18px' fill='%23999'%3E🍽 Food%3C/text%3E%3C/svg%3E";
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
                        🍽
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
                      {food.likes ? food.likes.length : 0}
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
                          e.preventDefault();
                          e.stopPropagation();
                          handleEdit(food);
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
                          handleDelete(food._id);
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
                      {getContent(food.name)}
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
                      {getContent(food.category)}
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
                      {getContent(food.description) || `Authentic Tamil cuisine showcasing traditional flavors and heritage.`}
                    </Typography>
                  </Box>

                  <Button
                    className="view-button"
                    component={Link}
                    to={`/explore/foods/${food._id}`}
                    onMouseEnter={() => prefetchExploreItem('foods', food._id)}
                    onTouchStart={() => prefetchExploreItem('foods', food._id)}
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
                    Explore Food
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
        title={(ft) => (editItem ? ft('foods.edit', 'Edit Recipe') : ft('foods.addNew', 'Add New Recipe'))}
        isEdit={!!editItem}
        onSave={handleSave}
        formData={formData}
        setFormData={setFormData}
        language={editLanguage}
        onLanguageChange={setEditLanguage}
        imageField="image"
        fields={[
          { name: 'name', labelKey: 'form.name', label: 'Name', required: true },
          { name: 'category', labelKey: 'form.category', label: 'Category' },
          { name: 'description', labelKey: 'form.description', label: 'Description', multiline: true }
        ]}
      />
    </Container>
  );
}
