import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  ArrowBack,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import MediaDisplay from "../common/MediaDisplay";
import MediaUpload from "../common/MediaUpload";

function FoodDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // Edit dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchFood("68a47f97f4c2feb2c9af7745");
  }, []);

  const fetchFood = async (foodId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/foods/${foodId}`);
      if (!res.ok) {
        throw new Error("Food not found");
      }
      const data = await res.json();
      setFood(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = () => {
    setEditFormData(food);
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const res = await fetch(`/api/foods/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editFormData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update food");
      }
      setEditOpen(false);
      fetchFood();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this food?")) {
      try {
        const res = await fetch(`/api/foods/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to delete food");
        }
        navigate("/explore/foods");
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/explore/foods")}
          sx={{ mt: 2 }}
        >
          Back to Foods
        </Button>
      </Container>
    );
  }

  if (!food) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Food not found</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/explore/foods")}
          sx={{ mt: 2 }}
        >
          Back to Foods
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <IconButton onClick={() => navigate("/explore/foods")} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
          {food.name}
        </Typography>
        {user && user.role === "admin" && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton onClick={handleEditOpen} color="primary">
              <EditIcon />
            </IconButton>
            <IconButton onClick={handleDelete} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Main Content */}
      <Card sx={{ mb: 4 }}>
        {food.image && (
          <MediaDisplay imageUrl={food.image} title={food.name} height={400} />
        )}
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Description
          </Typography>
          <Typography
            variant="body1"
            sx={{ lineHeight: 1.8, color: "#555", whiteSpace: "pre-wrap" }}
          >
            {food.description}
          </Typography>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Food</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={editFormData.name || ""}
            onChange={(e) =>
              setEditFormData({ ...editFormData, name: e.target.value })
            }
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            value={editFormData.description || ""}
            onChange={(e) =>
              setEditFormData({ ...editFormData, description: e.target.value })
            }
            multiline
            rows={4}
            fullWidth
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default FoodDetail;
