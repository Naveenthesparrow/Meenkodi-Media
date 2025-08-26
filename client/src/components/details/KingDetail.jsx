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
import MediaUpload from "../common/MediaUpload";

function KingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [king, setKing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // Edit dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDynasty, setEditDynasty] = useState("");
  const [editPeriod, setEditPeriod] = useState("");
  const [editCapital, setEditCapital] = useState("");
  const [editAchievements, setEditAchievements] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImage, setEditImage] = useState("");

  useEffect(() => {
    fetchUser();
    fetchKing();
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

  const fetchKing = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/kings/${id}`);
      if (!res.ok) {
        throw new Error("King not found");
      }
      const data = await res.json();
      setKing(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = () => {
    setEditName(king.name);
    setEditDynasty(king.dynasty);
    setEditPeriod(king.period);
    setEditCapital(king.capital);
    setEditAchievements(king.achievements);
    setEditDescription(king.description);
    setEditContent(king.content);
    setEditImage(king.image || "");
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const res = await fetch(`/api/kings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editName,
          dynasty: editDynasty,
          period: editPeriod,
          capital: editCapital,
          achievements: editAchievements,
          description: editDescription,
          content: editContent,
          image: editImage,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update king");
      }
      setEditOpen(false);
      fetchKing();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this king?")) {
      try {
        const res = await fetch(`/api/kings/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to delete king");
        }
        navigate("/explore/kings");
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
          onClick={() => navigate("/explore/kings")}
          sx={{ mt: 2 }}
        >
          Back to Kings
        </Button>
      </Container>
    );
  }

  if (!king) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">King not found</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/explore/kings")}
          sx={{ mt: 2 }}
        >
          Back to Kings
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <IconButton onClick={() => navigate("/explore/kings")} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
          {king.name}
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
        {king.image && (
          <CardMedia
            component="img"
            image={king.image}
            alt={king.name}
            sx={{
              width: "100%",
              height: 400,
              objectFit: "cover",
            }}
          />
        )}
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
            {king.dynasty && (
              <Chip label={`Dynasty: ${king.dynasty}`} color="primary" />
            )}
            {king.period && (
              <Chip label={`Period: ${king.period}`} color="secondary" />
            )}
            {king.capital && (
              <Chip label={`Capital: ${king.capital}`} color="info" />
            )}
          </Box>

          {king.achievements && (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Key Achievements
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
                {king.achievements}
              </Typography>
            </>
          )}

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
            {king.description}
          </Typography>

          {king.content && (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Detailed History
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  lineHeight: 1.8,
                  color: "#555",
                  whiteSpace: "pre-wrap",
                }}
              >
                {king.content}
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
        <DialogTitle>Edit King</DialogTitle>
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
            label="Dynasty"
            value={editDynasty}
            onChange={(e) => setEditDynasty(e.target.value)}
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
            label="Capital"
            value={editCapital}
            onChange={(e) => setEditCapital(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
          <TextField
            label="Achievements"
            value={editAchievements}
            onChange={(e) => setEditAchievements(e.target.value)}
            multiline
            rows={3}
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
            label="Content"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            multiline
            rows={6}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
          <TextField
            label="Image URL"
            value={editImage}
            onChange={(e) => setEditImage(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
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

export default KingDetail;
