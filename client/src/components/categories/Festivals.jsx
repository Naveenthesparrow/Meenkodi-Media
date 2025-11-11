import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from "react-router-dom";
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
} from "@mui/material";
import {
  Festival,
  CalendarToday,
  LocationOn,
  Edit,
  Delete,
  Add,
  Star,
  People,
  Church,
  MusicNote,
  Restaurant,
  Palette,
  Schedule,
  Favorite,
} from "@mui/icons-material";
import API_BASE_URL from "../../utils/api";
import { useBilingualContent } from "../../utils/bilingualContent";

export default function Festivals({ user }) {
  const navigate = useNavigate();
  const getContent = useBilingualContent();
  const { t } = useTranslation();
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
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

  // Removed seasonOptions and typeOptions

  useEffect(() => {
    fetchFestivals();
  }, []);

  const fetchFestivals = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/festivals`);
      if (!res.ok) {
        throw new Error("Failed to fetch Festivals data");
      }
      const data = await res.json();
      
      // Add fallback for missing images
      const processedFestivals = data.map(festival => ({
        ...festival,
        image: festival.image || "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E"
      }));
      
      setFestivals(processedFestivals);
    } catch (err) {
      console.error("Error fetching Festivals data:", err);
      // Fallback to empty array if fetch fails
      setFestivals([]);
    } finally {
      setLoading(false);
    }
  };
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
      image: "" 
    });
    setAddOpen(true);
  };

  const handleSave = () => {
    (async () => {
      try {
    const payload = {
      name: { en: formData.name_en, ta: formData.name_ta },
      type: { en: formData.type_en, ta: formData.type_ta },
      description: { en: formData.description_en, ta: formData.description_ta },
      image: formData.image,
    };

    if (editItem) {
          const res = await fetch(`${API_BASE_URL}/api/festivals/${editItem._id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Update failed");
        } else {
          const res = await fetch(`${API_BASE_URL}/api/festivals`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error("Create failed");
        }
        await fetchFestivals();
      setEditOpen(false);
      setAddOpen(false);
      } catch (err) {
        alert("Failed to save festival");
    }
    })();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this festival entry?")) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/festivals/${id}`, {
            method: "DELETE",
            credentials: "include",
          });
          
          if (!res.ok) throw new Error("Delete failed");
          
          // Optimistic update
          setFestivals(prevFestivals => 
            prevFestivals.filter((festival) => festival._id !== id)
          );
          
          // Optional: Refresh to ensure consistency
          await fetchFestivals();
        } catch (err) {
          console.error(err);
          alert("Failed to delete festival entry");
        }
      })();
    }
  };

  const handleCardClick = (id) => {
    navigate(`/explore/festivals/${id}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress sx={{ color: "#000" }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
          {t('festivals.title','Festivals')}
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
                "&:hover": { bgcolor: "#333" },
                borderRadius: 0,
                px: 3,
                width: { xs: '100%', md: 'auto' }, // Full width on small screens
              }}
            >
              Add Festival
            </Button>
          </Box>
        )}
      </Box>

      {/* Removed Filters */}

      <Grid container spacing={4}>
        {festivals.map((festival, index) => (
          <Fade in={true} timeout={500 + index * 200} key={festival._id}>
            <Grid item xs={12} sm={6} md={4}> {/* Added sm={6} for tablet layout */}
              <Card
                sx={{
                  width: { xs: '100%', sm: 350 },  // Responsive width: full on xs, fixed on sm+
                  maxWidth: '100%', // Ensure it doesn't exceed parent on smaller screens
                  // height: 450, // Removed fixed height to allow dynamic content
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
                onClick={() =>
                  navigate(`/explore/festivals/${festival._id}`)
                }
              >
                {(festival.image || festival.imageLink) ? (
                  <CardMedia
                    component="img"
                    height={200}
                    image={festival.image || festival.imageLink}
                    alt={getContent(festival.name)}
                    sx={{ 
                      objectFit: "contain",
                      width: '100%',
                      maxHeight: 200,
                      backgroundColor: '#f0f0f0',
                      padding: '10px',
                      boxSizing: 'border-box',
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', festival.image || festival.imageLink);
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
                  className="card-content" // Added for hover effect
                  sx={{
                    p: 3,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    // position: 'relative', // Removed as admin buttons are no longer absolute within CardContent
                    transition: 'all 0.3s ease',
                  }}
                >
                  {user && user.role === "admin" && (
                    <Box
                      sx={{
                        // Removed absolute positioning for responsiveness
                        // position: 'absolute', 
                        // top: 10, 
                        // right: 10, 
                        display: "flex",
                        justifyContent: 'flex-end', // Align buttons to the right
                        gap: 1,
                        mb: 2, // Margin bottom to separate from title
                      }}
                    >
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(festival);
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
                          handleDelete(festival._id);
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
                        fontSize: { xs: '1.25rem', md: '1.5rem' }, // Responsive font size
                        textTransform: 'capitalize',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {getContent(festival.name)}
                  </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666",
                        fontStyle: "italic",
                        fontSize: { xs: '0.8rem', md: '0.9rem' }, // Responsive font size
                        mb: 2,
                        textTransform: 'capitalize',
                      }}
                    >
                      {getContent(festival.type)}
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
                        minHeight: { xs: '4.2rem', md: '4.8rem' }, // Responsive minHeight
                      }}
                    >
                      {(() => {
                        const desc = getContent(festival.description) || "";
                        return desc.length > 150 ? `${desc.substring(0,150)}...` : desc;
                      })()}
                        </Typography>
                        
                        {/* Like Count Display */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Favorite sx={{ color: '#000', fontSize: '1rem', mr: 0.5 }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#000', 
                              fontSize: '0.875rem',
                              fontWeight: 500 
                            }}
                          >
                            {festival.likes ? festival.likes.length : 0} Likes
                          </Typography>
                        </Box>
                  </Box>

                  <Button
                    component={Link}
                    to={`/explore/festivals/${festival._id}`}
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
          {editItem ? t('festivals.edit','Edit Festival') : t('festivals.addNew','Add New Festival')}
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
                label={`${t('form.type','Type')} (EN)`}
                value={formData.type_en}
                onChange={(e) => setFormData({ ...formData, type_en: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label={`${t('form.type','Type')} (TA)`}
                value={formData.type_ta}
                onChange={(e) => setFormData({ ...formData, type_ta: e.target.value })}
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
