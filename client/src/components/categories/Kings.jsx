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
} from "@mui/material";
import {
  Star,
  Person,
  CalendarToday,
  Edit,
  Delete,
  Add,
  LocationOn,
  AccountBalance,
} from "@mui/icons-material";
import API_BASE_URL from "../../utils/api";

export default function Kings({ user }) {
  const navigate = useNavigate();
  const [kings, setKings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    period: "",
    description: "",
    image: "",
  });

  // Dummy data with rich content
  const dummyKings = [
    {
      _id: "1",
      name: "Raja Raja Chola I",
      dynasty: "Chola Dynasty",
      period: "985-1014 CE",
      capital: "Thanjavur",
      achievements:
        "Built Brihadeeswarar Temple, expanded Chola empire across South India and Southeast Asia",
      description:
        "One of the greatest Tamil kings who established the Chola empire as a major maritime power and patron of arts.",
      image: "https://example.com/rajaraja.jpg",
      content:
        "Raja Raja Chola I was instrumental in transforming the Chola kingdom into a powerful empire. His military conquests, administrative reforms, and architectural achievements mark the golden age of Tamil civilization.",
      createdAt: new Date(),
    },
    {
      _id: "2",
      name: "Rajendra Chola I",
      dynasty: "Chola Dynasty",
      period: "1014-1044 CE",
      capital: "Gangaikonda Cholapuram",
      achievements:
        "Extended empire to Southeast Asia, built Gangaikonda Cholapuram, naval expeditions to Sri Vijaya",
      description:
        "Son of Raja Raja Chola I, known for his naval conquests and expansion of the Chola empire to its greatest extent.",
      image: "https://example.com/rajendra.jpg",
      content:
        "Rajendra Chola I continued his father's legacy and expanded the empire further. His naval expeditions to Southeast Asia established Chola influence in the region for centuries.",
      createdAt: new Date(),
    },
    {
      _id: "3",
      name: "Karikala Chola",
      dynasty: "Early Chola Dynasty",
      period: "2nd Century CE",
      capital: "Poompuhar",
      achievements:
        "Established early Chola power, built extensive irrigation systems, expanded trade networks",
      description:
        "Legendary early Chola king who established the foundations of Chola power and prosperity through innovative governance.",
      image: "https://example.com/karikala.jpg",
      content:
        "Karikala Chola is credited with many innovations in governance and infrastructure that laid the foundation for later Chola greatness. His irrigation projects transformed agriculture in the region.",
      createdAt: new Date(),
    },
    {
      _id: "4",
      name: "Krishnadevaraya",
      dynasty: "Vijayanagara Empire",
      period: "1509-1529 CE",
      capital: "Vijayanagara",
      achievements:
        "Golden age of Vijayanagara, patron of arts and literature, military victories",
      description:
        "Greatest ruler of the Vijayanagara Empire, known for his military prowess and patronage of Telugu and Tamil literature.",
      image: "https://example.com/krishnadevaraya.jpg",
      content:
        "Krishnadevaraya's reign marked the pinnacle of the Vijayanagara Empire. His court was home to the Ashtadiggajas (eight great poets) and he himself was a accomplished poet.",
      createdAt: new Date(),
    },
  ];

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
      setKings(dummyKings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKings();
  }, []);

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name,
      period: item.period,
      description: item.description,
      image: item.image,
    });
    setEditOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      period: "",
      description: "",
      image: "" 
    });
    setAddOpen(true);
  };

  const handleSave = () => {
    (async () => {
      try {
        if (editItem) {
          const res = await fetch(`${API_BASE_URL}/api/kings/${editItem._id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.name,
              period: formData.period,
              description: formData.description,
              image: formData.image,
            }),
          });
          if (!res.ok) throw new Error("Update failed");
        } else {
          const res = await fetch(`${API_BASE_URL}/api/kings`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.name,
              period: formData.period,
              description: formData.description,
              image: formData.image,
            }),
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
    if (
      window.confirm("Are you sure you want to delete this king's profile?")
    ) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/kings/${id}`, {
            method: "DELETE",
            credentials: "include",
          });
          if (!res.ok) throw new Error("Delete failed");
          await fetchKings();
        } catch (err) {
          console.error(err);
          alert("Failed to delete king");
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
      {/* Unique Heading Section */}
      <Box 
        sx={{ 
          mb: 6, 
          textAlign: 'center', 
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
          Tamil Kings
        </Typography>
        
        {user && user.role === "admin" && (
          <Box 
            sx={{ 
              position: 'absolute', 
              right: 0, 
              top: '50%', 
              transform: 'translateY(-50%)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-50%) scale(1.05)',
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
              Add King
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
                  width: 350,  // Fixed width
                  height: 450, // Fixed height
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
                    height="200"
                    image={king.image || king.imageLink}
                    alt={king.name}
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
                      e.target.style.display = 'none';
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
                    position: 'relative', // For absolute positioning of admin buttons
                    transition: 'all 0.3s ease',
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
                        fontSize: '1.5rem',
                        textTransform: 'capitalize',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {king.name}
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
                      {king.period}
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
                      {king.description.length > 150 
                        ? `${king.description.substring(0, 150)}...` 
                        : king.description}
                    </Typography>
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
          {editItem ? "Edit King Profile" : "Add New King Profile"}
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
