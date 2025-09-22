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
import MediaUpload from "../common/MediaUpload";

export default function AncientScience({ user }) {
  const [sciences, setSciences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  // Removed filter-related state and methods
  const [formData, setFormData] = useState({
    name: "",
    period: "",
    description: "",
    image: "",
    imageLink: "",
    videoLink: "",
  });

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
    setFormData({
      name: item.name,
      period: item.period,
      description: item.description,
      image: item.image,
      imageLink: item.imageLink || "",
      videoLink: item.videoLink || "",
    });
    setEditOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      period: "",
      description: "",
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
        if (editItem) {
          res = await fetch(`${API_BASE_URL}/api/ancientscience/${editItem._id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.name,
              period: formData.period,
              description: formData.description,
              image: formData.image,
              imageLink: formData.imageLink,
              videoLink: formData.videoLink,
            }),
          });
        } else {
          res = await fetch(`${API_BASE_URL}/api/ancientscience`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.name,
              period: formData.period,
              description: formData.description,
              image: formData.image,
              imageLink: formData.imageLink,
              videoLink: formData.videoLink,
            }),
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
      {/* Unique Heading Section */}
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
          Ancient Science
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
                width: '100%', // Ensure button takes full width on small screens
              }}
            >
                Add Scientific Knowledge
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
          perspective: '1000px', // 3D effect for cards
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
        {sciences.map((science, index) => (
          <Fade 
            in={true} 
            timeout={500 + index * 200} 
            key={science._id}
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
                  width: { xs: '100%', sm: 350 },  // Responsive width: full on xs, fixed on sm+
                  maxWidth: '100%', // Ensure it doesn't exceed parent on smaller screens
                  // height: 450, // Removed fixed height
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
                  navigate(`/explore/ancientscience/${science._id}`)
                }
              >
                {(science.image || science.imageLink) ? (
                  <CardMedia
                    component="img"
                    height={200}
                    image={science.image || science.imageLink}
                    alt={science.name}
                    sx={{ 
                      objectFit: "contain",
                      width: '100%',
                      maxHeight: 200,
                      backgroundColor: '#f0f0f0',
                      padding: '10px',
                      boxSizing: 'border-box',
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', science.image || science.imageLink);
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
                    <img 
                      src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E" 
                      alt="No Image Available" 
                      style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                    />
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
                    // position: 'relative', // Removed absolute positioning from parent
                    transition: 'all 0.3s ease',
                  }}
                >
                  {user && user.role === "admin" && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end", // Align to the right
                        gap: 1,
                        mb: 1, // Add margin-bottom to separate from title
                      }}
                    >
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(science);
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
                          handleDelete(science._id);
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
                      {science.name}
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
                      {science.period}
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
                      {science.description.length > 150 
                        ? `${science.description.substring(0, 150)}...` 
                        : science.description}
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
                        {science.likes ? science.likes.length : 0} Likes
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    component={Link}
                    to={`/explore/ancientscience/${science._id}`}
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
          {editItem ? "Edit Scientific Knowledge" : "Add New Scientific Knowledge"}
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
                label="Period"
                value={formData.period}
            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
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
          <MediaUpload
            onImageChange={(imageUrl) => setFormData({ ...formData, image: imageUrl })}
            onImageLinkChange={(imageLink) => setFormData({ ...formData, imageLink: imageLink })}
            onVideoLinkChange={(videoLink) => setFormData({ ...formData, videoLink: videoLink })}
            currentImage={formData.image}
            currentImageLink={formData.imageLink}
            currentVideoLink={formData.videoLink}
            label="Science Image/Video"
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
