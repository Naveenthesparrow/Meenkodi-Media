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
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import MenuBook from "@mui/icons-material/MenuBook";
import Person from "@mui/icons-material/Person";
import CalendarToday from "@mui/icons-material/CalendarToday";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import Add from "@mui/icons-material/Add";
import Star from "@mui/icons-material/Star";
import Category from "@mui/icons-material/Category";
import Favorite from "@mui/icons-material/Favorite";
import API_BASE_URL from "../../utils/api";
import { fetchPrefetched } from '../../utils/prefetch';
import { prefetchExploreItem, preloadExploreDetailPage } from '../../utils/explorePrefetch';
import { useBilingualContent } from "../../utils/bilingualContent";
import cldImg from "../../utils/cloudinaryImage";

let cachedLiteratureData = null;

export default function Literature({ user }) {
  const navigate = useNavigate();
  const getContent = useBilingualContent();
  const { t } = useTranslation();
  const [literatureRaw, setLiteratureRaw] = useState(cachedLiteratureData || []);
  const setLiterature = (val) => {
    if (typeof val === 'function') {
      setLiteratureRaw(prev => { const next = val(prev); cachedLiteratureData = next; return next; });
    } else { cachedLiteratureData = val; setLiteratureRaw(val); }
  };
  const literature = literatureRaw;
  const [loading, setLoading] = useState(!cachedLiteratureData);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editLanguage, setEditLanguage] = useState('ta');
  const [formData, setFormData] = useState({
    title_en: "",
    title_ta: "",
    author_en: "",
    author_ta: "",
    period_en: "",
    period_ta: "",
    image: "",
  });

  const handleCardClick = (literatureId) => {
    navigate(`/explore/literature/${literatureId}`);
  };

  const fetchLiterature = async () => {
    if (!cachedLiteratureData) setLoading(true);
    try {
      const res = await fetchPrefetched(`${API_BASE_URL}/api/literature`);
      if (!res.ok) throw new Error("Failed to fetch literature");
      const data = await res.json();
      setLiterature(data);
    } catch (err) {
      console.error("Error fetching literature:", err);
      if (!cachedLiteratureData) setLiterature([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiterature();
  }, []);


  // Load the detail page's code in the background so opening an item is quick

  useEffect(() => {

    const t = setTimeout(() => preloadExploreDetailPage('literature'), 1000);

    return () => clearTimeout(t);

  }, []);

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
      title_en: toStr(item.title),
      title_ta: toTa(item.title),
      author_en: toStr(item.author),
      author_ta: toTa(item.author),
      period_en: toStr(item.period),
      period_ta: toTa(item.period),
      image: item.image,
    });
    setEditOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      title_en: "",
      title_ta: "",
      author_en: "",
      author_ta: "",
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
          title: { en: formData.title_en, ta: formData.title_ta },
          author: { en: formData.author_en, ta: formData.author_ta },
          period: { en: formData.period_en, ta: formData.period_ta },
          image: formData.image,
        };

        if (editItem) {
          const res = await fetch(`${API_BASE_URL}/api/literature/${editItem._id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Update failed");
        } else {
          const res = await fetch(`${API_BASE_URL}/api/literature`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Create failed");
        }
        await fetchLiterature();
        setEditOpen(false);
        setAddOpen(false);
      } catch (err) {
        console.error(err);
        alert("Failed to save literature");
      }
    })();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this literature entry?")) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/literature/${id}`, {
            method: "DELETE",
            credentials: "include",
          });

          if (!res.ok) throw new Error("Delete failed");

          // Optimistic update
          setLiterature(prevLiterature =>
            prevLiterature.filter((lit) => lit._id !== id)
          );

          // Optional: Refresh to ensure consistency
          await fetchLiterature();
        } catch (err) {
          console.error(err);
          alert("Failed to delete literature entry");
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
      <SEO {...pageSEO.literature} />
      {/* Unique Heading Section */}
      <CategoryHeader
        title={t('literature.title', 'Literature')}
        subtitle={t('literature.subtitle', 'Timeless Tamil Literary Works')}
        addLabel={t('literature.add', 'Add Literature')}
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
        {literature.map((literature, index) => (
          <Fade
            in={true}
            timeout={500 + index * 150}
            key={literature._id}
          >
            <Box
              sx={{
                width: '100%',
                transition: 'all 0.3s ease',
              }}
            >
              <Card
                component={Link}
                to={`/explore/literature/${literature._id}`}
                onMouseEnter={() => prefetchExploreItem('literature', literature._id)}
                onTouchStart={() => prefetchExploreItem('literature', literature._id)}
                sx={{
                  textDecoration: 'none',
                  width: '100%',
                  height: { xs: 460, md: 500 },
                  display: 'flex',
                  flexDirection: 'column',
                  border: 'none',
                  borderRadius: 0,
                  bgcolor: '#fff',
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
              >
                <Box sx={{ position: 'relative', height: 240, overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                  {(literature.image || literature.imageLink) ? (
                    <CardMedia
                      component="img"
                      image={cldImg(literature.image || literature.imageLink, 800)}
                      alt={getContent(literature.title)}
                      className="temple-image"
                      sx={{
                        objectFit: "cover",
                        width: '100%',
                        height: '100%',
                        transition: 'all 0.6s ease',
                      }}
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3E%3Crect fill='%23e0e0e0' width='400' height='240'%3E%3C/rect%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-size='18px' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
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
                        sx={{ fontFamily: 'Georgia, serif', fontSize: '1rem' }}
                      >
                        No Image Available
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

                  {/* Admin Controls */}
                  {user && user.role === "admin" && (
                    <Box
                      className="admin-controls"
                      sx={{
                        position: 'absolute',
                        bottom: 10,
                        right: 10,
                        display: "flex",
                        gap: 1,
                        opacity: 0,
                        transform: 'translateY(8px)',
                        transition: 'opacity 0.3s ease, transform 0.25s ease',
                      }}
                    >
                      <IconButton
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEdit(literature);
                        }}
                        size="small"
                        sx={{
                          bgcolor: "#FFF",
                          color: '#000',
                          "&:hover": {
                            bgcolor: '#000',
                            color: '#FFF',
                            transform: 'scale(1.15)'
                          },
                          transition: 'all 0.2s ease',
                          border: '2px solid #000',
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(literature._id);
                        }}
                        size="small"
                        sx={{
                          bgcolor: "#FFF",
                          color: '#000',
                          "&:hover": {
                            bgcolor: '#000',
                            color: '#FFF',
                            transform: 'scale(1.15)'
                          },
                          transition: 'all 0.2s ease',
                          border: '2px solid #000',
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
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
                  <Box>
                    <Typography
                      variant="h5"
                      className="temple-title"
                      sx={{
                        fontFamily: 'Georgia, serif',
                        fontWeight: 700,
                        color: '#000',
                        mb: 1.25,
                        lineHeight: 1.12,
                        fontSize: { xs: '1.35rem', md: '1.6rem' },
                        textTransform: 'capitalize',
                        letterSpacing: '0.02em',
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {getContent(literature.title)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666",
                        fontStyle: "italic",
                        fontSize: { xs: '0.8rem', md: '0.9rem' },
                        mb: 2,
                        textTransform: 'capitalize',
                      }}
                    >
                      {getContent(literature.author)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#000",
                        lineHeight: 1.6,
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: { xs: '4.2rem', md: '4.8rem' }, // Ensures consistent height for 3 lines
                      }}
                    >
                      {getContent(literature.period)}
                    </Typography>
                  </Box>

                  <Button
                    component={Link}
                    to={`/explore/literature/${literature._id}`}
                    onMouseEnter={() => prefetchExploreItem('literature', literature._id)}
                    onTouchStart={() => prefetchExploreItem('literature', literature._id)}
                    variant="outlined"
                    fullWidth
                    className="view-button"
                    sx={{
                      color: '#000',
                      borderColor: '#000',
                      borderWidth: 2,
                      borderRadius: 0,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      mt: 'auto',
                      py: 1.2,
                      transition: 'all 0.25s ease',
                      fontFamily: 'Georgia, serif',
                      fontSize: '0.95rem',
                      '&:hover': {
                        borderColor: '#8B0000',
                      }
                    }}
                  >
                    {t('actions.readMore', 'Read more').toUpperCase()}
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
        title={(ft) => (editItem ? ft('literature.edit', 'Edit Literature Work') : ft('literature.addNew', 'Add New Literature Work'))}
        isEdit={!!editItem}
        onSave={handleSave}
        formData={formData}
        setFormData={setFormData}
        language={editLanguage}
        onLanguageChange={setEditLanguage}
        imageField="image"
        fields={[
          { name: 'title', labelKey: 'form.title', label: 'Title', required: true },
          { name: 'author', labelKey: 'form.author', label: 'Author' },
          { name: 'period', labelKey: 'form.period', label: 'Period' }
        ]}
      />
    </Container>
  );
}
