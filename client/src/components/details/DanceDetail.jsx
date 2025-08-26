import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
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

function DanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dance, setDance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // Edit dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editRegion, setEditRegion] = useState("");
  const [editStyle, setEditStyle] = useState("");
  const [editOrigin, setEditOrigin] = useState("");
  const [editCostume, setEditCostume] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editHistory, setEditHistory] = useState("");
  const [editSignificance, setEditSignificance] = useState("");
  const [editMedia, setEditMedia] = useState([]);

  useEffect(() => {
    fetchUser();
    fetchDance();
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

  const fetchDance = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dance/${id}`);
      if (!res.ok) {
        throw new Error("Dance not found");
      }
      const data = await res.json();
      setDance(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = () => {
    setEditName(dance.name);
    setEditRegion(dance.region);
    setEditStyle(dance.style);
    setEditOrigin(dance.origin);
    setEditCostume(dance.costume);
    setEditDescription(dance.description);
    setEditHistory(dance.history);
    setEditSignificance(dance.significance);
    setEditMedia(dance.media || []);
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const res = await fetch(`/api/dance/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editName,
          region: editRegion,
          style: editStyle,
          origin: editOrigin,
          costume: editCostume,
          description: editDescription,
          history: editHistory,
          significance: editSignificance,
          media: editMedia,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update dance");
      }
      setEditOpen(false);
      fetchDance();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this dance?")) {
      try {
        const res = await fetch(`/api/dance/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to delete dance");
        }
        navigate("/explore/dance");
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleMediaUpload = (newMediaUrl) => {
    setEditMedia([...editMedia, newMediaUrl]);
  };

  const handleMediaDelete = (mediaToDelete) => {
    setEditMedia(editMedia.filter((media) => media !== mediaToDelete));
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
          onClick={() => navigate("/explore/dance")}
          sx={{ mt: 2 }}
        >
          Back to Dance
        </Button>
      </Container>
    );
  }

  if (!dance) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Dance not found</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/explore/dance")}
          sx={{ mt: 2 }}
        >
          Back to Dance
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <IconButton onClick={() => navigate("/explore/dance")} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
          {dance.name}
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
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
            {dance.region && (
              <Chip label={`Region: ${dance.region}`} color="primary" />
            )}
            {dance.style && (
              <Chip label={`Style: ${dance.style}`} color="secondary" />
            )}
            {dance.origin && (
              <Chip label={`Origin: ${dance.origin}`} color="info" />
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
              mb: 3,
            }}
          >
            {dance.description}
          </Typography>

          {dance.history && (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                History
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.8,
                  color: "#555",
                  whiteSpace: "pre-wrap",
                  mb: 3,
                }}
              >
                {dance.history}
              </Typography>
            </>
          )}

          {dance.significance && (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Cultural Significance
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.8,
                  color: "#555",
                  whiteSpace: "pre-wrap",
                  mb: 3,
                  fontStyle: "italic",
                  bgcolor: "#f5f5f5",
                  p: 2,
                  borderRadius: 1,
                }}
              >
                {dance.significance}
              </Typography>
            </>
          )}

          {dance.costume && (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Traditional Costume
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.8,
                  color: "#555",
                  whiteSpace: "pre-wrap",
                  mb: 3,
                }}
              >
                {dance.costume}
              </Typography>
            </>
          )}

          {/* Media Display */}
          {dance.media && dance.media.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Media
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
                {dance.media.map((mediaUrl, index) => (
                  <MediaDisplay
                    key={index}
                    src={mediaUrl}
                    alt={`${dance.name} media ${index + 1}`}
                    style={{ width: 200, height: 150, objectFit: "cover" }}
                  />
                ))}
              </Box>
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
        <DialogTitle>Edit Dance</DialogTitle>
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
            label="Region"
            value={editRegion}
            onChange={(e) => setEditRegion(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
          <TextField
            label="Style"
            value={editStyle}
            onChange={(e) => setEditStyle(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
          <TextField
            label="Origin"
            value={editOrigin}
            onChange={(e) => setEditOrigin(e.target.value)}
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
          <TextField
            label="History"
            value={editHistory}
            onChange={(e) => setEditHistory(e.target.value)}
            multiline
            rows={4}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
          <TextField
            label="Significance"
            value={editSignificance}
            onChange={(e) => setEditSignificance(e.target.value)}
            multiline
            rows={3}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
          <TextField
            label="Costume"
            value={editCostume}
            onChange={(e) => setEditCostume(e.target.value)}
            multiline
            rows={3}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />

          {/* Media Upload Section */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Media Files
            </Typography>
            <MediaUpload
              onUpload={handleMediaUpload}
              onDelete={handleMediaDelete}
              currentMedia={editMedia}
              category="dance"
            />
          </Box>
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

export default DanceDetail;
