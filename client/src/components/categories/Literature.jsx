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
  MenuBook,
  Person,
  CalendarToday,
  Edit,
  Delete,
  Add,
  Star,
  Category,
} from "@mui/icons-material";
import API_BASE_URL from "../../utils/api";

export default function Literature({ user }) {
  const navigate = useNavigate();
  const [literature, setLiterature] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    period: "",
    image: "",
  });

  // Dummy data with rich content
  const dummyLiterature = [
    {
      _id: "1",
      title: "Thirukkural",
      author: "Thiruvalluvar",
      period: "3rd Century BCE - 3rd Century CE",
      category: "Ethics & Philosophy",
      description:
        "A classical Tamil text consisting of 1330 couplets dealing with ethics, political and social thought, and love.",
      significance:
        "One of the most important works in Tamil literature, translated into numerous languages worldwide.",
      image: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
      content:
        "The Thirukkural is divided into three books: Aram (Virtue), Porul (Wealth), and Inbam (Love). Each book contains chapters that systematically explore various aspects of human life and society.",
      createdAt: new Date(),
    },
    {
      _id: "2",
      title: "Silappatikaram",
      author: "Ilango Adigal",
      period: "5th-6th Century CE",
      category: "Epic Poetry",
      description:
        "An epic Tamil poem that tells the story of Kannagi and her husband Kovalan, exploring themes of love, justice, and divine retribution.",
      significance:
        "First Tamil epic poem and one of the five great epics of Tamil literature.",
      image: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
      content:
        "The epic is structured in three cantos (kandams) - Pukhar Kandam, Madurai Kandam, and Vanci Kandam, each representing different cities and stages of the story.",
      createdAt: new Date(),
    },
    {
      _id: "3",
      title: "Manimekalai",
      author: "Satthanar",
      period: "6th Century CE",
      category: "Epic Poetry",
      description:
        "The sequel to Silappatikaram, focusing on the spiritual journey of Manimekalai, Kovalan and Madhavi's daughter.",
      significance:
        "Important Buddhist epic that explores themes of compassion, dharma, and spiritual awakening.",
      image: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
      content:
        "The epic follows Manimekalai's transformation from a dancer to a Buddhist nun, spreading the message of ahimsa and compassion.",
      createdAt: new Date(),
    },
    {
      _id: "4",
      title: "Kambaramayanam",
      author: "Kambar",
      period: "12th Century CE",
      category: "Epic Poetry",
      description:
        "Tamil version of the Ramayana, considered one of the greatest works in Tamil literature for its poetic excellence.",
      significance:
        "Demonstrates the height of Tamil literary achievement and poetic sophistication.",
      image: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
      content:
        "Kambar's retelling of the Ramayana adds Tamil cultural elements and showcases exceptional literary craftsmanship with unique poetic meters.",
      createdAt: new Date(),
    },
  ];

  const handleCardClick = (literatureId) => {
    navigate(`/explore/literature/${literatureId}`);
  };

  const fetchLiterature = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/literature`);
      if (!res.ok) throw new Error("Failed to fetch literature");
      const data = await res.json();
      setLiterature(data);
    } catch (err) {
      console.error("Error fetching literature:", err);
      setLiterature(dummyLiterature); // Fallback to dummy data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiterature();
  }, []);

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      title: item.title,
      author: item.author,
      period: item.period,
      image: item.image,
    });
    setEditOpen(true);
  };

  const handleAdd = () => {
    setFormData({
      title: "",
      author: "",
      period: "",
      image: "" 
    });
    setAddOpen(true);
  };

  const handleSave = () => {
    (async () => {
      try {
        if (editItem) {
          const res = await fetch(`${API_BASE_URL}/api/literature/${editItem._id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: formData.title,
              author: formData.author,
              period: formData.period,
              image: formData.image,
            }),
          });
          if (!res.ok) throw new Error("Update failed");
        } else {
          const res = await fetch(`${API_BASE_URL}/api/literature`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: formData.title,
              author: formData.author,
              period: formData.period,
              image: formData.image,
            }),
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
    if (
      window.confirm("Are you sure you want to delete this literature work?")
    ) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/literature/${id}`, {
            method: "DELETE",
            credentials: "include",
          });
          if (!res.ok) throw new Error("Delete failed");
          await fetchLiterature();
        } catch (err) {
          console.error("Error deleting literature:", err);
          alert("Failed to delete literature");
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
          Tamil Literature
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
              Add Literature
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
        {literature.map((literature, index) => (
          <Fade 
            in={true} 
            timeout={500 + index * 200} 
            key={literature._id}
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
                onClick={() => navigate(`/explore/literature/${literature._id}`)}
              >
                {(literature.image || literature.imageLink) ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={literature.image || literature.imageLink}
                    alt={literature.title}
                    sx={{ 
                      objectFit: "contain",
                      width: '100%',
                      maxHeight: 200,
                      backgroundColor: '#f0f0f0',
                      padding: '10px',
                      boxSizing: 'border-box',
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', literature.image || literature.imageLink);
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
                          handleEdit(literature);
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
                          handleDelete(literature._id);
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
                      {literature.title}
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
                      {literature.author}
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
                      {literature.period}
                    </Typography>
                  </Box>

                  <Button
                    component={Link}
                    to={`/explore/literature/${literature._id}`}
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
          {editItem ? "Edit Literature Work" : "Add New Literature Work"}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Author"
                value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
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
