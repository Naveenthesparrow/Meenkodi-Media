import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
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

function AncientScienceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [science, setScience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // Edit dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImageLink, setEditImageLink] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editVideoLink, setEditVideoLink] = useState("");

  // Add new state variables
  const [editPeriod, setEditPeriod] = useState("");
  const [editField, setEditField] = useState("");
  const [editScholar, setEditScholar] = useState("");

  useEffect(() => {
    console.log("Fetching Ancient Science detail for ID:", id);
    fetchUser();
    fetchScience();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await fetch("/auth/user", { credentials: "include" });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        console.error("Error fetching user: Response not OK");
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const fetchScience = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/ancientscience/${id}`);
      console.log("API response status:", res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response text:", errorText);
        throw new Error("Ancient Science detail not found");
      }
      const data = await res.json();
      console.log("Fetched Ancient Science data:", data);
      setScience(data);
    } catch (err) {
      console.error("Error fetching Ancient Science detail:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = () => {
    setEditTitle(science.name);
    setEditDescription(science.description);
    setEditPeriod(science.period);
    setEditField(science.field);
    setEditScholar(science.scholar);
    setEditImageUrl(science.image || "");
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const res = await fetch(`/api/ancientscience/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editTitle,
          description: editDescription,
          period: editPeriod,
          field: editField,
          scholar: editScholar,
          image: editImageUrl,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(
          data.error || "Failed to update Ancient Science detail"
        );
      }
      setEditOpen(false);
      fetchScience();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this Ancient Science detail?"
      )
    ) {
      try {
        const res = await fetch(`/api/ancientscience/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(
            data.error || "Failed to delete Ancient Science detail"
          );
        }
        navigate("/explore/ancientscience");
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
          onClick={() => navigate("/explore/ancientscience")}
          sx={{ mt: 2 }}
        >
          Back to Ancient Science
        </Button>
      </Container>
    );
  }

  if (!science) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Ancient Science detail not found</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/explore/ancientscience")}
          sx={{ mt: 2 }}
        >
          Back to Ancient Science
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <IconButton
          onClick={() => navigate("/explore/ancientscience")}
          sx={{ mr: 2 }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
          {science.name}
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

      {/* Metadata */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="body2" color="textSecondary">
          <strong>Period:</strong> {science.period}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          <strong>Field:</strong> {science.field}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          <strong>Scholar:</strong> {science.scholar}
        </Typography>
      </Box>

      {/* Content */}
      <Typography variant="body1" sx={{ mb: 4 }}>
        {science.description}
      </Typography>

      {/* Media */}
      <MediaDisplay
        imageUrl={science.image}
        title={science.name}
      />

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Ancient Science Detail</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Period"
            value={editPeriod}
            onChange={(e) => setEditPeriod(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Field"
            value={editField}
            onChange={(e) => setEditField(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Scholar"
            value={editScholar}
            onChange={(e) => setEditScholar(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            sx={{ mb: 2 }}
          />
          <MediaUpload
            onImageChange={setEditImageUrl}
            currentImage={editImageUrl}
            label="Image"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AncientScienceDetail;
