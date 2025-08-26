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

function TempleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [temple, setTemple] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // Edit dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editPeriod, setEditPeriod] = useState("");
  const [editDeity, setEditDeity] = useState("");
  const [editArchitecture, setEditArchitecture] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImageLink, setEditImageLink] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editVideoLink, setEditVideoLink] = useState("");

  useEffect(() => {
    fetchUser();
    fetchTemple();
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await fetch("/auth/user", { credentials: "include" });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const fetchTemple = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/temples/${id}`);
      if (!res.ok) {
        throw new Error("Temple not found");
      }
      const data = await res.json();
      setTemple(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = () => {
    setEditName(temple.name);
    setEditLocation(temple.location);
    setEditPeriod(temple.period);
    setEditDeity(temple.deity);
    setEditArchitecture(temple.architecture);
    setEditDescription(temple.description);
    setEditImageUrl(temple.imageUrl || "");
    setEditImageLink(temple.imageLink || "");
    setEditVideoUrl(temple.videoUrl || "");
    setEditVideoLink(temple.videoLink || "");
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const res = await fetch(`/api/temples/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editName,
          location: editLocation,
          period: editPeriod,
          deity: editDeity,
          architecture: editArchitecture,
          description: editDescription,
          imageUrl: editImageUrl,
          imageLink: editImageLink,
          videoUrl: editVideoUrl,
          videoLink: editVideoLink,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update temple");
      }
      setEditOpen(false);
      fetchTemple();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this temple?")) {
      try {
        const res = await fetch(`/api/temples/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to delete temple");
        }
        navigate("/temples");
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
          onClick={() => navigate("/explore/temples")}
          sx={{ mt: 2 }}
        >
          Back to Temples
        </Button>
      </Container>
    );
  }

  if (!temple) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Temple not found</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/explore/temples")}
          sx={{ mt: 2 }}
        >
          Back to Temples
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <IconButton onClick={() => navigate("/explore/temples")} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
          {temple.name}
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
        {(temple.imageUrl || temple.videoUrl || temple.videoLink) && (
          <MediaDisplay
            imageUrl={temple.imageUrl}
            videoUrl={temple.videoUrl}
            videoLink={temple.videoLink}
            title={temple.name}
            height={400}
          />
        )}
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
            {temple.location && (
              <Chip label={`Location: ${temple.location}`} color="primary" />
            )}
            {temple.period && (
              <Chip label={`Period: ${temple.period}`} color="secondary" />
            )}
            {temple.deity && (
              <Chip label={`Deity: ${temple.deity}`} color="info" />
            )}
            {temple.architecture && (
              <Chip label={`Style: ${temple.architecture}`} color="success" />
            )}
          </Box>

          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Description
          </Typography>
          <Typography
            variant="body1"
            sx={{
              lineHeight: 1.8,
              color: "#555",
              whiteSpace: "pre-wrap",
            }}
          >
            {temple.description}
          </Typography>

          {temple.significance && (
            <>
              <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                Significance
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.8,
                  color: "#555",
                  whiteSpace: "pre-wrap",
                }}
              >
                {temple.significance}
              </Typography>
            </>
          )}

          {temple.festivals && (
            <>
              <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                Festivals
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.8,
                  color: "#555",
                  whiteSpace: "pre-wrap",
                }}
              >
                {temple.festivals}
              </Typography>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Temple</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
          <TextField
            label="Location"
            value={editLocation}
            onChange={(e) => setEditLocation(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
          <TextField
            label="Period"
            value={editPeriod}
            onChange={(e) => setEditPeriod(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
          <TextField
            label="Deity"
            value={editDeity}
            onChange={(e) => setEditDeity(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
          <TextField
            label="Architecture Style"
            value={editArchitecture}
            onChange={(e) => setEditArchitecture(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
          <TextField
            label="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            multiline
            rows={4}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
          <MediaUpload
            imageUrl={editImageUrl}
            imageLink={editImageLink}
            videoUrl={editVideoUrl}
            videoLink={editVideoLink}
            onImageUpload={setEditImageUrl}
            onImageLinkChange={setEditImageLink}
            onVideoUpload={setEditVideoUrl}
            onVideoLinkChange={setEditVideoLink}
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

export default TempleDetail;
