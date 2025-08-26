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

function FestivalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [festival, setFestival] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // Edit dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editRegion, setEditRegion] = useState("");
  const [editSeason, setEditSeason] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editRituals, setEditRituals] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editHistory, setEditHistory] = useState("");
  const [editSignificance, setEditSignificance] = useState("");
  const [editMedia, setEditMedia] = useState([]);

  useEffect(() => {
    fetchUser();
    fetchFestival();
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

  const fetchFestival = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/festivals/${id}`);
      if (!res.ok) {
        throw new Error("Festival not found");
      }
      const data = await res.json();
      setFestival(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = () => {
    setEditName(festival.name);
    setEditRegion(festival.region);
    setEditSeason(festival.season);
    setEditDuration(festival.duration);
    setEditRituals(festival.rituals);
    setEditDescription(festival.description);
    setEditHistory(festival.history);
    setEditSignificance(festival.significance);
    setEditMedia(festival.media || []);
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const res = await fetch(`/api/festivals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editName,
          region: editRegion,
          season: editSeason,
          duration: editDuration,
          rituals: editRituals,
          description: editDescription,
          history: editHistory,
          significance: editSignificance,
          media: editMedia,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update festival");
      }
      setEditOpen(false);
      fetchFestival(id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this festival?")) {
      try {
        const res = await fetch(`/api/festivals/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to delete festival");
        }
        navigate("/explore/festivals");
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
          onClick={() => navigate("/explore/festivals")}
          sx={{ mt: 2 }}
        >
          Back to Festivals
        </Button>
      </Container>
    );
  }

  if (!festival) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Festival not found</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/explore/festivals")}
          sx={{ mt: 2 }}
        >
          Back to Festivals
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <IconButton
          onClick={() => navigate("/explore/festivals")}
          sx={{ mr: 2 }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
          {festival.name}
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
            {festival.region && (
              <Chip label={`Region: ${festival.region}`} color="primary" />
            )}
            {festival.season && (
              <Chip label={`Season: ${festival.season}`} color="secondary" />
            )}
            {festival.duration && (
              <Chip label={`Duration: ${festival.duration}`} color="info" />
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
            {festival.description}
          </Typography>

          {festival.history && (
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
                {festival.history}
              </Typography>
            </>
          )}

          {festival.rituals && (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Rituals & Traditions
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.8,
                  color: "#555",
                  whiteSpace: "pre-wrap",
                  mb: 3,
                  bgcolor: "#f8f9fa",
                  p: 2,
                  borderRadius: 1,
                }}
              >
                {festival.rituals}
              </Typography>
            </>
          )}

          {festival.significance && (
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
                {festival.significance}
              </Typography>
            </>
          )}

          {/* Media Display */}
          {festival.media && festival.media.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Media
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
                {festival.media.map((mediaUrl, index) => (
                  <MediaDisplay
                    key={index}
                    src={mediaUrl}
                    alt={`${festival.name} media ${index + 1}`}
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
        <DialogTitle>Edit Festival</DialogTitle>
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
            label="Season"
            value={editSeason}
            onChange={(e) => setEditSeason(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
          <TextField
            label="Duration"
            value={editDuration}
            onChange={(e) => setEditDuration(e.target.value)}
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
            label="Rituals & Traditions"
            value={editRituals}
            onChange={(e) => setEditRituals(e.target.value)}
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

          {/* Media Upload Section */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Media Files
            </Typography>
            <MediaUpload
              onUpload={handleMediaUpload}
              onDelete={handleMediaDelete}
              currentMedia={editMedia}
              category="festivals"
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

export default FestivalDetail;
