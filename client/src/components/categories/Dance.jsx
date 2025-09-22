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

export default function Dance({ user }) {
  const navigate = useNavigate();
  const [dances, setDances] = useState([]);
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

  // Removed typeOptions and originOptions

  useEffect(() => {
    fetchDances();
  }, []);

  const fetchDances = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/dance`);
      if (!res.ok) {
        throw new Error("Failed to fetch Dance data");
      }
      const data = await res.json();
      setDances(data);
    } catch (err) {
      console.error("Error fetching Dance data:", err);
      setDances([]); // Fallback to an empty array instead of dummy data
    } finally {
      setLoading(false);
    }
  };

  // Removed filteredDances

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
      image: "",
    });
    setAddOpen(true);
  };

  const handleSave = () => {
    (async () => {
      try {
        if (editItem) {
          const res = await fetch(`${API_BASE_URL}/api/dance/${editItem._id}`, {
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
          const res = await fetch(`${API_BASE_URL}/api/dance`, {
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
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress sx={{ color: "#000" }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: "relative" }}>
      {/* Unique Heading Section */}
      <Box
        sx={{
          mb: 6,
          display: "flex",
          alignItems: "center",
          justifyContent:
            user && user.role === "admin" ? "space-between" : "center",
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: 2, md: 0 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontWeight: 900,
            color: "#000",
            position: "relative",
            display: "inline-block",
            letterSpacing: -1,
            padding: "0 10px",
            transition: "all 0.3s ease",
            "&::before": {
              content: '""',
              position: "absolute",
              top: "50%",
              left: "-50px",
              width: "40px",
              height: "3px",
              backgroundColor: "#000",
              transform: "translateY(-50%)",
              transition: "all 0.3s ease",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              top: "50%",
              right: "-50px",
              width: "40px",
              height: "3px",
              backgroundColor: "#000",
              transform: "translateY(-50%)",
              transition: "all 0.3s ease",
            },
            "&:hover": {
              color: "#333",
              transform: "scale(1.02)",
              "&::before": {
                width: "60px",
                left: "-70px",
                backgroundColor: "#666",
              },
              "&::after": {
                width: "60px",
                right: "-70px",
                backgroundColor: "#666",
              },
            },
          }}
        >
          Dance
        </Typography>

        {user && user.role === "admin" && (
          <Box
            sx={{
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                "& button": {
                  boxShadow: "0 8px 15px rgba(0,0,0,0.2)",
                  transform: "translateY(-3px)",
                },
              },
            }}
          >
            <Button
              onClick={handleAdd}
              variant="contained"
              startIcon={<Add />}
              sx={{
                bgcolor: "#000",
                color: "#fff",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "#333",
                  boxShadow: "0 8px 15px rgba(0,0,0,0.2)",
                  transform: "translateY(-3px)",
                },
                borderRadius: 0,
                px: 3,
              }}
            >
              Add Dance Form
            </Button>
          </Box>
        )}
      </Box>

      <Grid
        container
        spacing={4}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "stretch",
          perspective: "1000px", // 3D effect for cards
          transition: "all 0.3s ease",
          "& > .MuiGrid-item": {
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "scale(1.02)",
              zIndex: 10,
            },
          },
        }}
      >
        {dances.map((dance, index) => (
          <Fade in={true} timeout={500 + index * 200} key={dance._id}>
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              sx={{
                display: "flex",
                justifyContent: "center",
                transition: "all 0.3s ease",
              }}
            >
              {console.log(
                "Rendering dance card:",
                dance.name,
                "ID:",
                dance._id
              )}
              <Card
                sx={{
                  width: { xs: "100%", sm: 350 },
                  maxWidth: "100%",
                  height: "auto",
                  minHeight: 450,
                  display: "flex",
                  flexDirection: "column",
                  border: "3px solid #000",
                  borderRadius: 0,
                  bgcolor: "#fff",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(45deg, transparent, transparent 40%, rgba(255,255,255,0.1) 40%, transparent 60%)",
                    transform: "translateX(-100%)",
                    transition: "transform 0.6s ease",
                  },
                  "&:hover": {
                    transform: "translateY(-15px) rotate(1deg)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                    "&::before": {
                      transform: "translateX(100%)",
                    },
                    "& .card-content": {
                      transform: "scale(1.02)",
                      opacity: 0.95,
                    },
                  },
                }}
                onClick={() => handleCardClick(dance._id)}
              >
                {dance.image || dance.imageLink ? (
                  <CardMedia
                    component="img"
                    height={200}
                    image={dance.image || dance.imageLink}
                    alt={dance.name}
                    sx={{
                      objectFit: "contain",
                      width: "100%",
                      maxHeight: 200,
                      backgroundColor: "#f0f0f0",
                      padding: "10px",
                      boxSizing: "border-box",
                    }}
                    onError={(e) => {
                      console.error(
                        "Image failed to load:",
                        dance.image || dance.imageLink
                      );
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600' viewBox='0 0 1200 600'%3E%3Crect fill='%23cccccc' width='1200' height='600'%3E%3C/rect%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='100px' fill='%23333333'%3E1200x600%3C/text%3E%3C/svg%3E";
                      e.target.style.display = "block";
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      width: "100%",
                      backgroundColor: "#f0f0f0",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      padding: "10px",
                      boxSizing: "border-box",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ textAlign: "center" }}
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
                    transition: "all 0.3s ease",
                  }}
                >
                  {user && user.role === "admin" && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(dance);
                        }}
                        size="small"
                        sx={{
                          color: "#000",
                          bgcolor: "rgba(255,255,255,0.7)",
                          "&:hover": {
                            bgcolor: "rgba(255,255,255,0.9)",
                            transform: "scale(1.1)",
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(dance._id);
                        }}
                        size="small"
                        sx={{
                          color: "#000",
                          bgcolor: "rgba(255,255,255,0.7)",
                          "&:hover": {
                            bgcolor: "rgba(255,255,255,0.9)",
                            transform: "scale(1.1)",
                          },
                          transition: "all 0.2s ease",
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
                        fontSize: { xs: "1.25rem", md: "1.5rem" },
                        textTransform: "capitalize",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {dance.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#666",
                        fontStyle: "italic",
                        fontSize: { xs: "0.8rem", md: "0.9rem" },
                        mb: 2,
                        textTransform: "capitalize",
                      }}
                    >
                      {dance.type}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#000",
                        lineHeight: 1.6,
                        mb: 2,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        minHeight: { xs: "4.2rem", md: "4.8rem" }, // Ensures consistent height for 3 lines
                      }}
                    >
                      {dance.description.length > 150
                        ? `${dance.description.substring(0, 150)}...`
                        : dance.description}
                    </Typography>

                    {/* Like Count Display */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Favorite
                        sx={{ color: "#000", fontSize: "1rem", mr: 0.5 }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#000",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                        }}
                      >
                        {dance.likes ? dance.likes.length : 0} Likes
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    component={Link}
                    to={`/explore/dance/${dance._id}`}
                    variant="outlined"
                    fullWidth
                    sx={{
                      color: "#000",
                      borderColor: "#000",
                      borderRadius: 0,
                      mt: "auto",
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
          {editItem ? "Edit Dance Form" : "Add New Dance Form"}
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
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            multiline
            minRows={3}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Image URL"
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
            Cancel
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
            {editItem ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
