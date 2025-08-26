import React, { useEffect, useState } from "react";
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
} from "@mui/icons-material";
import API_BASE_URL from "../../utils/api";

export default function Festivals({ user }) {
  const navigate = useNavigate();
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  // Removed filter-related state and methods
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
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
      // Fallback to dummy data if fetch fails
      const dummyFestivals = [
        {
          _id: "1",
          name: "Pongal Festival",
          description: "A harvest festival celebrated in Tamil Nadu to honor the Sun God and agricultural abundance.",
          image: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
          type: "Harvest Festival",
        },
        {
          _id: "2",
          name: "Chithirai Festival",
          description: "A significant festival marking the Tamil New Year, celebrated with great enthusiasm.",
          image: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
          type: "New Year Festival",
        }
      ];
      setFestivals(dummyFestivals);
    } finally {
      setLoading(false);
    }
  };

  // Removed filteredFestivals

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      type: item.type,
      description: item.description,
      image: item.image,
    });
    setEditOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      type: "",
      description: "",
      image: "" 
    });
    setAddOpen(true);
  };

  const handleSave = () => {
    (async () => {
      try {
    if (editItem) {
          const res = await fetch(`${API_BASE_URL}/api/festivals/${editItem._id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.name,
              type: formData.type,
              description: formData.description,
              image: formData.image,
            }),
          });
          if (!res.ok) throw new Error("Update failed");
        } else {
          const res = await fetch(`${API_BASE_URL}/api/festivals`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.name,
              type: formData.type,
              description: formData.description,
              image: formData.image,
            }),
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
    if (window.confirm("Are you sure you want to delete this festival?")) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/festivals/${id}`, {
            method: "DELETE",
            credentials: "include",
          });
          if (!res.ok) throw new Error("Delete failed");
          await fetchFestivals();
        } catch (err) {
          console.error("Error deleting festival:", err);
          alert("Failed to delete festival");
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
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 700, color: "#000" }}>
          Tamil Festivals
        </Typography>
        {user && user.role === "admin" && (
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
            }}
          >
            Add Festival
          </Button>
        )}
      </Box>

      {/* Removed Filters */}

      <Grid container spacing={4}>
        {festivals.map((festival, index) => (
          <Fade in={true} timeout={500 + index * 200} key={festival._id}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  width: 350,  // Fixed width
                  // height: 450, // Removed fixed height to allow dynamic content
                  display: 'flex',
                  flexDirection: 'column',
                  border: "3px solid #000",
                  borderRadius: 0,
                  bgcolor: "#fff",
                  transition: "all 0.3s ease", // Changed to all for smoother transitions
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
                    height="200"
                    image={festival.image || festival.imageLink}
                    alt={festival.name}
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
                  sx={{
                    p: 3,
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: 'relative', // For absolute positioning of admin buttons
                  }}
                >
                  {user && user.role === "admin" && (
                  <Box
                    sx={{
                        position: 'absolute', 
                        top: 10, 
                        right: 10, 
                      display: "flex",
                        gap: 1 
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
                        fontSize: '1.5rem',
                        textTransform: 'capitalize',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {festival.name}
                  </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666",
                        fontStyle: "italic",
                        fontSize: "0.9rem",
                        mb: 2,
                        textTransform: 'capitalize',
                      }}
                    >
                      {festival.type}
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
                        minHeight: '4.8rem', // Ensures consistent height for 3 lines
                      }}
                    >
                      {festival.description.length > 150 
                        ? `${festival.description.substring(0, 150)}...` 
                        : festival.description}
                        </Typography>
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
                    Read More
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
          {editItem ? "Edit Festival" : "Add New Festival"}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
              <TextField
                fullWidth
            label="Name"
                value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
            label="Type"
                value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
            minRows={3}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
            label="Image URL"
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
            Cancel
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
            {editItem ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
