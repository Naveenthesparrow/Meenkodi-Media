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

function LiteratureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [literature, setLiterature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  // Edit dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editPeriod, setEditPeriod] = useState("");
  const [editGenre, setEditGenre] = useState("");
  const [editLanguage, setEditLanguage] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editMedia, setEditMedia] = useState([]);

  useEffect(() => {
    fetchUser();
    fetchLiterature();
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

  const fetchLiterature = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/literature/${id}`);
      if (!res.ok) {
        throw new Error("Literature not found");
      }
      const data = await res.json();
      setLiterature(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = () => {
    setEditTitle(literature.title);
    setEditAuthor(literature.author);
    setEditPeriod(literature.period);
    setEditGenre(literature.genre);
    setEditLanguage(literature.language);
    setEditDescription(literature.description);
    setEditContent(literature.content);
    setEditSummary(literature.summary);
    setEditMedia(literature.media || []);
    setEditOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const res = await fetch(`/api/literature/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: editTitle,
          author: editAuthor,
          period: editPeriod,
          genre: editGenre,
          language: editLanguage,
          description: editDescription,
          content: editContent,
          summary: editSummary,
          media: editMedia,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update literature");
      }
      setEditOpen(false);
      fetchLiterature();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this literature?")) {
      try {
        const res = await fetch(`/api/literature/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to delete literature");
        }
        navigate("/explore/literature");
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
          onClick={() => navigate("/explore/literature")}
          sx={{ mt: 2 }}
        >
          Back to Literature
        </Button>
      </Container>
    );
  }

  if (!literature) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Literature not found</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/explore/literature")}
          sx={{ mt: 2 }}
        >
          Back to Literature
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <IconButton
          onClick={() => navigate("/explore/literature")}
          sx={{ mr: 2 }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
          {literature.title}
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
            {literature.author && (
              <Chip label={`Author: ${literature.author}`} color="primary" />
            )}
            {literature.period && (
              <Chip label={`Period: ${literature.period}`} color="secondary" />
            )}
            {literature.genre && (
              <Chip label={`Genre: ${literature.genre}`} color="info" />
            )}
            {literature.language && (
              <Chip
                label={`Language: ${literature.language}`}
                color="success"
              />
            )}
          </Box>

          {literature.summary && (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Summary
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
                {literature.summary}
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
            {literature.description}
          </Typography>

          {literature.content && (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Content
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
                {literature.content}
              </Typography>
            </>
          )}

          {/* Media Display */}
          {literature.media && literature.media.length > 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Media
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
                {literature.media.map((mediaUrl, index) => (
                  <MediaDisplay
                    key={index}
                    src={mediaUrl}
                    alt={`${literature.title} media ${index + 1}`}
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
        <DialogTitle>Edit Literature</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
          <TextField
            label="Author"
            value={editAuthor}
            onChange={(e) => setEditAuthor(e.target.value)}
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
            label="Genre"
            value={editGenre}
            onChange={(e) => setEditGenre(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
          <TextField
            label="Language"
            value={editLanguage}
            onChange={(e) => setEditLanguage(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
          <TextField
            label="Summary"
            value={editSummary}
            onChange={(e) => setEditSummary(e.target.value)}
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

          {/* Media Upload Section */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Media Files
            </Typography>
            <MediaUpload
              onUpload={handleMediaUpload}
              onDelete={handleMediaDelete}
              currentMedia={editMedia}
              category="literature"
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

export default LiteratureDetail;
