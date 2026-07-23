import React, { useState, useEffect } from "react";
import API_BASE_URL from "../../utils/api";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  IconButton,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ArrowBack,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ThumbUp,
  ThumbUpOutlined,
  Share,
  Send,
  Reply,
  EmojiEmotions,
  Delete,
  Favorite,
  Close,
  Add,
} from "@mui/icons-material";
import MediaDisplay from "../common/MediaDisplay";
import MediaUpload from "../common/MediaUpload";

import { useBilingualContent } from "../../utils/bilingualContent";
function ClothingDetail({ user: initialUser }) {
  // Centralized API base for all requests
  const user = initialUser;
  const { id } = useParams();
  const navigate = useNavigate();
  const getContent = useBilingualContent();
  const [clothing, setClothing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Comments and likes states
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [newReply, setNewReply] = useState("");
  const [likes, setLikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);

  // Delete confirmation states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(''); // 'comment' or 'reply'

  // Comment reactions states
  const [commentReactions, setCommentReactions] = useState({});
  const [emojiPickerOpen, setEmojiPickerOpen] = useState({});



  // Add a new state for inline editing
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    name_en: "",
    name_ta: "",
    type_en: "",
    type_ta: "",
    region_en: "",
    region_ta: "",
    materials_en: "",
    materials_ta: "",
    description_en: "",
    description_ta: "",
    history_en: "",
    history_ta: "",
    imageUrl: "",
    contentSections: [], // New field for multiple bilingual content sections
  });

  // Function to add a new content section
  const addContentSection = () => {
    setEditableData(prev => ({
      ...prev,
      contentSections: [
        ...prev.contentSections,
        {
          subtitle_en: "",
          subtitle_ta: "",
          content_en: "",
          content_ta: "",
          imageUrl: "",
          imageLink: "",
          videoUrl: "",
          videoTitle_en: "",
          videoTitle_ta: "",
          videoDescription_en: "",
          videoDescription_ta: "",
          id: Date.now()
        }
      ]
    }));
  };

  // Function to remove a content section
  const removeContentSection = (idToRemove) => {
    setEditableData(prev => ({
      ...prev,
      contentSections: prev.contentSections.filter(section => section.id !== idToRemove)
    }));
  };

  // Emoji options
  const emojiOptions = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  useEffect(() => {
    const initializeData = async () => {
      await fetchClothing();
    };
    initializeData();
  }, [id]);

  // Update userLiked when user data becomes available
  useEffect(() => {
    if (user && clothing) {
      const likesArray = Array.isArray(clothing.likes) ? clothing.likes : [];
      setUserLiked(likesArray.some(likeId => user && user._id && likeId && String(likeId) === String(user._id)));
    }
  }, [user, clothing]);


  const fetchClothing = async () => {

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/clothing/${id}`, {
        credentials: "include"
      });
      if (!res.ok) {
        throw new Error("Clothing not found");
      }
      const data = await res.json();
      setClothing(data);
      setComments(data.comments || []);
      // Handle likes - ensure it's an array and check if user liked
      const likesArray = Array.isArray(data.likes) ? data.likes : [];
      setLikes(likesArray.length);
      setUserLiked(likesArray.some(likeId => likeId.toString() === user?._id?.toString()) || false);

      // Set editable data with all fields including contentSections
      const toStr = (val) => {
        if (!val) return "";
        if (typeof val === 'string') return val;
        if (typeof val === 'object') return val.en || val.ta || "";
        return "";
      };
      const toTa = (val) => {
        if (!val) return "";
        if (typeof val === 'object') return val.ta || "";
        return "";
      };
      setEditableData({
        name_en: toStr(data.name),
        name_ta: toTa(data.name),
        type_en: toStr(data.type),
        type_ta: toTa(data.type),
        region_en: toStr(data.region),
        region_ta: toTa(data.region),
        materials_en: toStr(data.materials),
        materials_ta: toTa(data.materials),
        description_en: toStr(data.description),
        description_ta: toTa(data.description),
        history_en: toStr(data.history),
        history_ta: toTa(data.history),
        imageUrl: data.image || "",
        contentSections: (data.contentSections || []).map(sec => ({
          subtitle_en: toStr(sec.subtitle),
          subtitle_ta: toTa(sec.subtitle),
          content_en: toStr(sec.content),
          content_ta: toTa(sec.content),
          imageUrl: sec.imageUrl || "",
          imageLink: sec.imageLink || "",
          videoUrl: sec.videoUrl || "",
          videoTitle_en: toStr(sec.videoTitle),
          videoTitle_ta: toTa(sec.videoTitle),
          videoDescription_en: toStr(sec.videoDescription),
          videoDescription_ta: toTa(sec.videoDescription),
          id: sec.id || sec._id || Date.now() + Math.random()
        }))
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add like functionality
  const handleLike = async () => {
    if (!user) {
      alert("Please log in to like this clothing");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/clothing/${id}/like`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        throw new Error("Failed to like/unlike");
      }

      const data = await res.json();
      setLikes(data.likes);
      setUserLiked(data.userLiked);
    } catch (err) {
      console.error("Like error:", err);
      alert("Failed to like the clothing");
    }
  };

  // Add comment functionality
  const handleAddComment = async () => {
    if (!user) {
      alert("Please log in to comment");
      return;
    }

    if (!newComment.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/clothing/${id}/comments`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: newComment })
      });

      if (!res.ok) {
        throw new Error("Failed to add comment");
      }

      const data = await res.json();
      setComments(data.comments);
      setNewComment("");
    } catch (err) {
      console.error("Comment error:", err);
      alert("Failed to add comment");
    }
  };

  // Add reply functionality
  const handleAddReply = async (commentId) => {
    if (!user) {
      alert("Please log in to reply");
      return;
    }

    if (!newReply.trim()) {
      alert("Reply cannot be empty");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/clothing/${id}/comments/${commentId}/replies`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: newReply })
      });

      if (!res.ok) {
        throw new Error("Failed to add reply");
      }

      const data = await res.json();
      setComments(data.comments);
      setNewReply("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Reply error:", err);
      alert("Failed to add reply");
    }
  };

  const handleCommentReaction = async (commentId, emoji) => {
    if (!user) {
      alert("Please log in to react to comments");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/clothing/${id}/comments/${commentId}/reactions`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ emoji })
      });

      if (!res.ok) {
        throw new Error("Failed to add reaction");
      }

      const data = await res.json();
      // Update the specific comment in the comments array
      const updatedComments = comments.map(comment =>
        comment._id === commentId
          ? { ...comment, reactions: data.reactions }
          : comment
      );
      setComments(updatedComments);
    } catch (err) {
      console.error("Reaction error:", err);
      alert("Failed to add reaction");
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this clothing? This action cannot be undone.");

    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/clothing/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete clothing");
      }

      navigate("/explore/clothing");
    } catch (err) {
      alert(`Failed to delete clothing: ${err.message}`);
    }
  };

  const handleDeleteConfirmation = async () => {
    if (deleteType === 'comment') {
      try {
        const res = await fetch(`${API_BASE_URL}/api/clothing/${id}/comments/${itemToDelete}`, {
          method: "DELETE",
          credentials: "include"
        });

        if (!res.ok) {
          throw new Error("Failed to delete comment");
        }

        const updatedComments = comments.filter(comment => comment._id !== itemToDelete);
        setComments(updatedComments);
      } catch (err) {
        console.error("Delete comment error:", err);
        alert("Failed to delete comment");
      }
    } else if (deleteType === 'reply') {
      try {
        const [commentId, replyId] = itemToDelete.split('-');
        const res = await fetch(`${API_BASE_URL}/api/clothing/${id}/comments/${commentId}/replies/${replyId}`, {
          method: "DELETE",
          credentials: "include"
        });

        if (!res.ok) {
          throw new Error("Failed to delete reply");
        }

        // Update the comment to remove the deleted reply
        const updatedComments = comments.map(comment => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: comment.replies.filter(reply => reply._id !== replyId)
            };
          }
          return comment;
        });
        setComments(updatedComments);
      } catch (err) {
        console.error("Delete reply error:", err);
        alert("Failed to delete reply");
      }
    }

    setDeleteDialogOpen(false);
    setItemToDelete(null);
    setDeleteType('');
  };

  const handleInlineSave = async () => {
    try {
      const toBilingual = (en, ta) => {
        if (!en && !ta) return undefined;
        return { en: en || "", ta: ta || "" };
      };
      const formattedContentSections = editableData.contentSections.map(sec => {
        const { id, subtitle_en, subtitle_ta, content_en, content_ta, videoTitle_en, videoTitle_ta, videoDescription_en, videoDescription_ta, ...rest } = sec;
        return {
          ...rest,
          subtitle: toBilingual(subtitle_en, subtitle_ta),
          content: toBilingual(content_en, content_ta),
          videoTitle: toBilingual(videoTitle_en, videoTitle_ta),
          videoDescription: toBilingual(videoDescription_en, videoDescription_ta)
        };
      });
      const updateData = {
        name: toBilingual(editableData.name_en, editableData.name_ta),
        type: toBilingual(editableData.type_en, editableData.type_ta),
        region: toBilingual(editableData.region_en, editableData.region_ta),
        materials: toBilingual(editableData.materials_en, editableData.materials_ta),
        description: toBilingual(editableData.description_en, editableData.description_ta),
        history: toBilingual(editableData.history_en, editableData.history_ta),
        image: editableData.imageUrl || clothing.image || "",
        contentSections: formattedContentSections
      };
      const res = await fetch(`${API_BASE_URL}/api/clothing/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update clothing");
      }
      // Refresh data
      await fetchClothing();
      setIsEditing(false);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };



  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: clothing.name,
        text: clothing.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate("/explore/clothing")}>
          Back to Clothing
        </Button>
      </Container>
    );
  }

  if (!clothing) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Clothing not found
        </Alert>
        <Button onClick={() => navigate("/explore/clothing")}>
          Back to Clothing
        </Button>
      </Container>
    );
  }

  // --- ADMIN EDIT VIEW ---
  if (isEditing) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper elevation={0} sx={{ p: 5, border: '1px solid #e0e0e0', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, borderBottom: '1px solid #eee', pb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: '"Playfair Display", serif', color: '#1a1a1a' }}>
              Edit Clothing Item
            </Typography>
            <IconButton onClick={() => setIsEditing(false)}><Close /></IconButton>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <TextField label="Name (EN)" value={editableData.name_en} onChange={(e) => setEditableData({ ...editableData, name_en: e.target.value })} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Name (TA)" value={editableData.name_ta} onChange={(e) => setEditableData({ ...editableData, name_ta: e.target.value })} fullWidth />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField label="Type (EN)" value={editableData.type_en} onChange={(e) => setEditableData({ ...editableData, type_en: e.target.value })} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Type (TA)" value={editableData.type_ta} onChange={(e) => setEditableData({ ...editableData, type_ta: e.target.value })} fullWidth />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField label="Region (EN)" value={editableData.region_en} onChange={(e) => setEditableData({ ...editableData, region_en: e.target.value })} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Region (TA)" value={editableData.region_ta} onChange={(e) => setEditableData({ ...editableData, region_ta: e.target.value })} fullWidth />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField label="Materials (EN)" value={editableData.materials_en} onChange={(e) => setEditableData({ ...editableData, materials_en: e.target.value })} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Materials (TA)" value={editableData.materials_ta} onChange={(e) => setEditableData({ ...editableData, materials_ta: e.target.value })} fullWidth />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Description (EN)" value={editableData.description_en} onChange={(e) => setEditableData({ ...editableData, description_en: e.target.value })} fullWidth multiline rows={4} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description (TA)" value={editableData.description_ta} onChange={(e) => setEditableData({ ...editableData, description_ta: e.target.value })} fullWidth multiline rows={4} />
            </Grid>

            <Grid item xs={12}>
              <TextField label="History (EN)" value={editableData.history_en} onChange={(e) => setEditableData({ ...editableData, history_en: e.target.value })} fullWidth multiline rows={4} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="History (TA)" value={editableData.history_ta} onChange={(e) => setEditableData({ ...editableData, history_ta: e.target.value })} fullWidth multiline rows={4} />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ p: 3, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Media</Typography>
                <TextField
                  label="Image URL"
                  value={editableData.imageUrl}
                  onChange={(e) => setEditableData({ ...editableData, imageUrl: e.target.value })}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <MediaUpload
                  onImageChange={(url) => setEditableData({ ...editableData, imageUrl: url })}
                  currentImage={editableData.imageUrl}
                  label="Upload Image"
                  showInputsOnly={true}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
              >
                Delete Item
              </Button>
              <Button
                onClick={handleInlineSave}
                variant="contained"
                startIcon={<EditIcon />}
                sx={{
                  bgcolor: '#000',
                  color: '#fff',
                  '&:hover': { bgcolor: '#333' },
                  px: 4,
                  py: 1.5,
                  borderRadius: 2
                }}
              >
                Save Changes
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 4,
          justifyContent: 'space-between'
        }}
      >
        <IconButton onClick={() => navigate("/explore/clothing")}>
          <ArrowBack />
        </IconButton>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            textTransform: 'uppercase',
            textAlign: 'center',
            flex: 1,
            mx: 2,
          }}
        >
          {getContent(clothing.name)}
        </Typography>

        {/* Admin Actions */}
        {user && user.role === "admin" && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => {
                const toStr = (val) => {
                  if (!val) return "";
                  if (typeof val === 'string') return val;
                  if (typeof val === 'object') return val.en || val.ta || "";
                  return "";
                };
                const toTa = (val) => {
                  if (!val) return "";
                  if (typeof val === 'object') return val.ta || "";
                  return "";
                };
                setEditableData({
                  name_en: toStr(clothing.name),
                  name_ta: toTa(clothing.name),
                  type_en: toStr(clothing.type),
                  type_ta: toTa(clothing.type),
                  region_en: toStr(clothing.region),
                  region_ta: toTa(clothing.region),
                  materials_en: toStr(clothing.materials),
                  materials_ta: toTa(clothing.materials),
                  description_en: toStr(clothing.description),
                  description_ta: toTa(clothing.description),
                  history_en: toStr(clothing.history),
                  history_ta: toTa(clothing.history),
                  imageUrl: clothing.image || "",
                  contentSections: (clothing.contentSections || []).map(sec => ({
                    subtitle_en: toStr(sec.subtitle),
                    subtitle_ta: toTa(sec.subtitle),
                    content_en: toStr(sec.content),
                    content_ta: toTa(sec.content),
                    imageUrl: sec.imageUrl || "",
                    imageLink: sec.imageLink || "",
                    videoUrl: sec.videoUrl || "",
                    videoTitle_en: toStr(sec.videoTitle),
                    videoTitle_ta: toTa(sec.videoTitle),
                    videoDescription_en: toStr(sec.videoDescription),
                    videoDescription_ta: toTa(sec.videoDescription),
                    id: sec.id || sec._id || Date.now() + Math.random()
                  }))
                });
                setIsEditing(!isEditing);
              }}
              sx={{
                color: '#000',
                border: '1px solid #000',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.1)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              {isEditing ? <Close /> : <EditIcon />}
            </IconButton>
            <IconButton
              onClick={handleDelete}
              sx={{
                color: '#000',
                border: '1px solid #000',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(255,0,0,0.1)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 4
        }}
      >
        {/* Image Section - Top */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid #000',
            position: 'relative',
            maxWidth: 800,
            mx: 'auto',
            width: '100%'
          }}
        >
          {(isEditing ? editableData.imageUrl : clothing.image) ? (
            <img
              src={isEditing ? editableData.imageUrl : clothing.image}
              alt={getContent(clothing.name)}
              style={{
                maxWidth: '100%',
                maxHeight: 400,
                objectFit: 'contain',
                padding: 16,
              }}
              onError={(e) => {
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600' viewBox='0 0 1200 600'%3E%3Crect fill='%23cccccc' width='1200' height='600'%3E%3C/rect%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='100px' fill='%23333333'%3EImage Not Available%3C/text%3E%3C/svg%3E";
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: 400,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: '#f0f0f0',
                color: '#666',
                fontSize: '1.2rem',
                fontWeight: 500,
              }}
            >
              No image available
            </Box>
          )}
        </Box>

        {/* Details Section - Bottom */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            maxWidth: 800,
            mx: 'auto',
            width: '100%'
          }}
        >
          {/* Type and Region */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid #000',
              pb: 2,
            }}
          >
            {!isEditing ? (
              <>
                {getContent(clothing.type) && (
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    Type: {getContent(clothing.type)}
                  </Typography>
                )}
                {getContent(clothing.region) && (
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    Region: {getContent(clothing.region)}
                  </Typography>
                )}
              </>
            ) : (
              <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '50%' }}>
                  <TextField label="Type (EN)" value={editableData.type_en} onChange={(e) => setEditableData({ ...editableData, type_en: e.target.value })} fullWidth variant="standard" />
                  <TextField label="Type (TA)" value={editableData.type_ta} onChange={(e) => setEditableData({ ...editableData, type_ta: e.target.value })} fullWidth variant="standard" />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '50%' }}>
                  <TextField label="Region (EN)" value={editableData.region_en} onChange={(e) => setEditableData({ ...editableData, region_en: e.target.value })} fullWidth variant="standard" />
                  <TextField label="Region (TA)" value={editableData.region_ta} onChange={(e) => setEditableData({ ...editableData, region_ta: e.target.value })} fullWidth variant="standard" />
                </Box>
              </Box>
            )}
          </Box>

          {/* Materials */}
          {(getContent(clothing.materials) || isEditing) && (
            <Box
              sx={{
                borderBottom: '1px solid #000',
                pb: 2,
              }}
            >
              {!isEditing ? (
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Materials: {getContent(clothing.materials)}
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <TextField label="Materials (EN)" value={editableData.materials_en} onChange={(e) => setEditableData({ ...editableData, materials_en: e.target.value })} fullWidth variant="standard" />
                  <TextField label="Materials (TA)" value={editableData.materials_ta} onChange={(e) => setEditableData({ ...editableData, materials_ta: e.target.value })} fullWidth variant="standard" />
                </Box>
              )}
            </Box>
          )}

          {/* Description */}
          {!isEditing ? (
            <Box>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  borderBottom: '2px solid #000',
                  pb: 1,
                }}
              >
                Description
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                }}
              >
                {getContent(clothing.description)}
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  borderBottom: '2px solid #000',
                  pb: 1,
                }}
              >
                Description
              </Typography>
              <TextField label="Description (EN)" value={editableData.description_en} onChange={(e) => setEditableData({ ...editableData, description_en: e.target.value })} fullWidth multiline rows={4} variant="standard" sx={{ mb: 1 }} />
              <TextField label="Description (TA)" value={editableData.description_ta} onChange={(e) => setEditableData({ ...editableData, description_ta: e.target.value })} fullWidth multiline rows={4} variant="standard" />
            </Box>
          )}

          {/* History */}
          {(getContent(clothing.history) || isEditing) && (
            !isEditing ? (
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    borderBottom: '2px solid #000',
                    pb: 1,
                  }}
                >
                  History
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                  }}
                >
                  {getContent(clothing.history)}
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    borderBottom: '2px solid #000',
                    pb: 1,
                  }}
                >
                  History
                </Typography>
                <TextField label="History (EN)" value={editableData.history_en} onChange={(e) => setEditableData({ ...editableData, history_en: e.target.value })} fullWidth multiline rows={3} variant="standard" sx={{ mb: 1 }} />
                <TextField label="History (TA)" value={editableData.history_ta} onChange={(e) => setEditableData({ ...editableData, history_ta: e.target.value })} fullWidth multiline rows={3} variant="standard" />
              </Box>
            )
          )}

          {/* Main Image (inline edit) */}
          {isEditing && (
            <Box>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  borderBottom: '2px solid #000',
                  pb: 1,
                }}
              >
                Image URL
              </Typography>
              <TextField
                label="Image URL"
                value={editableData.imageUrl || ''}
                onChange={(e) => setEditableData({ ...editableData, imageUrl: e.target.value })}
                fullWidth
                variant="standard"
                InputLabelProps={{ shrink: true }}
                placeholder="Enter full image URL"
                sx={{ mb: 2 }}
              />
              <MediaUpload
                onImageChange={(imageUrl) => setEditableData((prev) => ({ ...prev, imageUrl }))}
                onImageLinkChange={(imageLink) => setEditableData((prev) => ({ ...prev, imageUrl: imageLink }))}
                currentImage={editableData.imageUrl}
                label="Main Image"
              />
              {editableData.imageUrl && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', border: '1px solid #ddd', borderRadius: 1, p: 2 }}>
                  <img
                    src={editableData.imageUrl}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                    onError={(e) => {
                      e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600' viewBox='0 0 1200 600'%3E%3Crect fill='%23cccccc' width='1200' height='600'%3E%3C/rect%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='100px' fill='%23333333'%3EImage Not Available%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </Box>
              )}
            </Box>
          )}

          {/* Content Sections */}
          {!isEditing && clothing.contentSections && clothing.contentSections.length > 0 && (
            clothing.contentSections.map((section, index) => (
              <Box key={section._id || `content-section-${index}`} sx={{ mt: 4 }}>
                {getContent(section.subtitle) && (
                  <Typography
                    variant="h6"
                    key={`subtitle-${section._id || index}`}
                    sx={{
                      mb: 2,
                      fontWeight: 700,
                      borderBottom: '2px solid #000',
                      pb: 1,
                    }}
                  >
                    {getContent(section.subtitle)}
                  </Typography>
                )}

                {getContent(section.content) && (
                  <Typography
                    variant="body1"
                    key={`content-${section._id || index}`}
                    sx={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                    }}
                  >
                    {getContent(section.content)}
                  </Typography>
                )}

                {/* Section Image */}
                {section.imageUrl && (
                  <img
                    key={`image-${section._id || index}`}
                    src={section.imageUrl}
                    alt={section.subtitle || `Section ${index + 1} Image`}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      marginTop: 16,
                      border: '1px solid #ddd',
                      padding: 8
                    }}
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600' viewBox='0 0 1200 600'%3E%3Crect fill='%23cccccc' width='1200' height='600'%3E%3C/rect%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='100px' fill='%23333333'%3EImage Not Available%3C/text%3E%3C/svg%3E";
                    }}
                  />
                )}

                {/* Section Video */}
                {section.videoUrl && (
                  <iframe
                    src={`https://www.youtube.com/embed/${section.videoUrl.split('v=')[1] || section.videoUrl.split('/').pop()}`}
                    title={section.videoTitle || `Section ${index + 1} Video`}
                    style={{ width: '100%', height: 'auto', aspectRatio: '16/9', marginTop: 16 }}
                    allowFullScreen
                  />
                )}

                {/* Section Video Details */}
                {(getContent(section.videoTitle) || getContent(section.videoDescription)) && (
                  <Box sx={{ mt: 2 }}>
                    {getContent(section.videoTitle) && (
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600 }}
                      >
                        {getContent(section.videoTitle)}
                      </Typography>
                    )}

                    {getContent(section.videoDescription) && (
                      <Typography
                        variant="body2"
                        sx={{ color: '#555', fontStyle: 'italic' }}
                      >
                        {getContent(section.videoDescription)}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            ))
          )}

          {/* Editable Content Sections */}
          {isEditing && user && user.role === "admin" && (
            <>
              <Typography
                variant="h6"
                sx={{
                  mt: 4,
                  mb: 2,
                  fontWeight: 700,
                  borderBottom: '1px solid #000',
                  pb: 1,
                }}
              >
                Additional Content Sections
              </Typography>

              {editableData.contentSections.map((section, index) => (
                <Box
                  key={section.id || `editable-section-${index}`}
                  sx={{
                    mb: 3,
                    p: 2,
                    border: '1px solid #000',
                    position: 'relative'
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField label="Subtitle (EN)" value={section.subtitle_en || ""} onChange={(e) => {
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].subtitle_en = e.target.value;
                      setEditableData(prev => ({ ...prev, contentSections: updatedSections }));
                    }} fullWidth variant="standard" sx={{ mb: 2 }} />
                    <TextField label="Subtitle (TA)" value={section.subtitle_ta || ""} onChange={(e) => {
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].subtitle_ta = e.target.value;
                      setEditableData(prev => ({ ...prev, contentSections: updatedSections }));
                    }} fullWidth variant="standard" sx={{ mb: 2 }} />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField label="Content (EN)" value={section.content_en || ""} onChange={(e) => {
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].content_en = e.target.value;
                      setEditableData(prev => ({ ...prev, contentSections: updatedSections }));
                    }} fullWidth multiline rows={4} variant="standard" sx={{ mb: 2 }} />
                    <TextField label="Content (TA)" value={section.content_ta || ""} onChange={(e) => {
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].content_ta = e.target.value;
                      setEditableData(prev => ({ ...prev, contentSections: updatedSections }));
                    }} fullWidth multiline rows={4} variant="standard" sx={{ mb: 2 }} />
                  </Box>

                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      mt: 2
                    }}
                  >
                    Section Image
                  </Typography>

                  <TextField
                    label="Image URL"
                    value={section.imageUrl || ""}
                    onChange={(e) => {
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].imageUrl = e.target.value;
                      setEditableData(prev => ({
                        ...prev,
                        contentSections: updatedSections
                      }));
                    }}
                    fullWidth
                    sx={{ mb: 2 }}
                    variant="standard"
                  />

                  {/* Section Image Upload */}
                  <MediaUpload
                    onImageChange={(imageUrl) => {
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].imageUrl = imageUrl;
                      setEditableData(prev => ({
                        ...prev,
                        contentSections: updatedSections
                      }));
                    }}
                    onImageLinkChange={(imageLink) => {
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].imageLink = imageLink;
                      setEditableData(prev => ({
                        ...prev,
                        contentSections: updatedSections
                      }));
                    }}
                    currentImage={section.imageUrl}
                    currentImageLink={section.imageLink}
                    label="Section Image"
                  />

                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      mt: 3
                    }}
                  >
                    Section Video Details
                  </Typography>

                  <TextField
                    label="Video URL"
                    value={section.videoUrl || ""}
                    onChange={(e) => {
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].videoUrl = e.target.value;
                      setEditableData(prev => ({
                        ...prev,
                        contentSections: updatedSections
                      }));
                    }}
                    fullWidth
                    sx={{ mb: 2 }}
                    variant="standard"
                  />

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField label="Video Title (EN)" value={section.videoTitle_en || ""} onChange={(e) => {
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].videoTitle_en = e.target.value;
                      setEditableData(prev => ({ ...prev, contentSections: updatedSections }));
                    }} fullWidth variant="standard" sx={{ mb: 2 }} />
                    <TextField label="Video Title (TA)" value={section.videoTitle_ta || ""} onChange={(e) => {
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].videoTitle_ta = e.target.value;
                      setEditableData(prev => ({ ...prev, contentSections: updatedSections }));
                    }} fullWidth variant="standard" sx={{ mb: 2 }} />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField label="Video Description (EN)" value={section.videoDescription_en || ""} onChange={(e) => {
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].videoDescription_en = e.target.value;
                      setEditableData(prev => ({ ...prev, contentSections: updatedSections }));
                    }} fullWidth multiline rows={3} variant="standard" sx={{ mb: 2 }} />
                    <TextField label="Video Description (TA)" value={section.videoDescription_ta || ""} onChange={(e) => {
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].videoDescription_ta = e.target.value;
                      setEditableData(prev => ({ ...prev, contentSections: updatedSections }));
                    }} fullWidth multiline rows={3} variant="standard" sx={{ mb: 2 }} />
                  </Box>

                  <IconButton
                    onClick={() => removeContentSection(section.id)}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      color: '#000',
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
            </>
          )}

          {/* Update Buttons - Only show when editing */}
          {isEditing && user && user.role === "admin" && (
            <Box
              sx={{
                width: '100%',
                maxWidth: 800,
                mx: 'auto',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pt: 2,
                borderTop: '1px solid #000',
              }}
            >
              <Button
                onClick={() => setIsEditing(false)}
                sx={{
                  color: "#000",
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.05)",
                  },
                }}
              >
                Cancel
              </Button>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  onClick={addContentSection}
                  variant="outlined"
                  startIcon={<Add />}
                  sx={{
                    color: '#000',
                    borderColor: '#000',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.05)'
                    }
                  }}
                >
                  Add Section
                </Button>
                <Button
                  onClick={handleInlineSave}
                  variant="contained"
                  sx={{
                    bgcolor: "#000",
                    color: "#fff",
                    "&:hover": {
                      bgcolor: "#333",
                    },
                  }}
                >
                  Update Clothing
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Like and Share Section */}
      <Box
        sx={{
          mt: 4,
          display: "flex",
          justifyContent: "center",
          gap: 2,
          pb: 3,
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Button
          onClick={handleLike}
          startIcon={userLiked ? <ThumbUp /> : <ThumbUpOutlined />}
          disabled={!user}
          variant={userLiked ? "contained" : "outlined"}
          sx={{
            color: userLiked ? "#fff" : "#000",
            bgcolor: userLiked ? "#000" : "transparent",
            borderColor: "#000",
            "&:hover": {
              bgcolor: userLiked ? "#333" : "rgba(0,0,0,0.1)",
              borderColor: "#000",
            },
            "&.Mui-disabled": {
              color: "#ccc",
              borderColor: "#ccc",
            },
          }}
        >
          {likes} {likes === 1 ? "Like" : "Likes"}
        </Button>

        <Button
          onClick={handleShare}
          startIcon={<Share />}
          variant="outlined"
          sx={{
            color: "#000",
            borderColor: "#000",
            "&:hover": {
              bgcolor: "rgba(0,0,0,0.1)",
              borderColor: "#000",
            },
          }}
        >
          Share
        </Button>
      </Box>

      {/* Comments Section */}
      <Box
        sx={{
          mt: 4,
          width: "100%",
          maxWidth: 800,
          mx: "auto",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 3,
            color: "#000",
            fontWeight: 700,
            borderBottom: "2px solid #000",
            pb: 1,
          }}
        >
          Comments ({comments.length})
        </Typography>

        {/* Comment Input */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 3,
            position: "relative",
          }}
        >
          <TextField
            fullWidth
            variant="standard"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{
              flex: 1,
              "& .MuiInput-underline:before": {
                borderBottomColor: "#000",
              },
              "& .MuiInput-underline:after": {
                borderBottomColor: "#000",
              },
            }}
          />
          <Button
            onClick={handleAddComment}
            disabled={!newComment.trim() || !user}
            sx={{
              position: "absolute",
              right: 0,
              color: "#000",
              "&:hover": {
                bgcolor: "transparent",
              },
              "&.Mui-disabled": {
                color: "#ccc",
              },
            }}
          >
            <Send />
          </Button>
        </Box>

        {/* Comments List */}
        {comments.length === 0 ? (
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              py: 2,
              color: "#666",
              fontStyle: "italic",
            }}
          >
            No comments yet. Be the first to comment!
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {comments.map((comment) => (
              <Box
                key={comment._id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  border: "1px solid #eee",
                  borderRadius: 2,
                  p: 2,
                  position: "relative",
                }}
              >
                {/* Main Comment */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      color: "#000",
                    }}
                  >
                    {comment.user?.displayName || "Anonymous"}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#666",
                      }}
                    >
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </Typography>
                    {user?.role === "admin" && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setItemToDelete(comment._id);
                          setDeleteType("comment");
                          setDeleteDialogOpen(true);
                        }}
                        sx={{ color: "#d32f2f" }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    lineHeight: 1.6,
                    color: "#333",
                  }}
                >
                  {comment.content}
                </Typography>

                {/* Comment actions section */}
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                >
                  <Button
                    size="small"
                    onClick={() =>
                      setReplyingTo(
                        replyingTo === comment._id ? null : comment._id
                      )
                    }
                    sx={{
                      color: "#666",
                      textTransform: "none",
                      fontSize: "0.75rem",
                      "&:hover": {
                        bgcolor: "rgba(0,0,0,0.05)",
                      },
                    }}
                  >
                    <Reply sx={{ fontSize: "1rem", mr: 0.5 }} />
                    Reply
                  </Button>
                </Box>

                {/* Reply input */}
                {replyingTo === comment._id && (
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    <TextField
                      fullWidth
                      variant="standard"
                      placeholder="Write a reply..."
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                      size="small"
                      sx={{
                        flex: 1,
                        "& .MuiInput-underline:before": {
                          borderBottomColor: "#000",
                        },
                        "& .MuiInput-underline:after": {
                          borderBottomColor: "#000",
                        },
                      }}
                    />
                    <Button
                      onClick={() => handleAddReply(comment._id)}
                      disabled={!newReply.trim() || !user}
                      size="small"
                      sx={{
                        position: "absolute",
                        right: 0,
                        color: "#000",
                        "&:hover": {
                          bgcolor: "transparent",
                        },
                        "&.Mui-disabled": {
                          color: "#ccc",
                        },
                      }}
                    >
                      <Send fontSize="small" />
                    </Button>
                  </Box>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <Box sx={{ ml: 3, mt: 2 }}>
                    {comment.replies.map((reply) => (
                      <Box
                        key={reply._id}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                          py: 1,
                          borderLeft: "2px solid #eee",
                          pl: 2,
                          mb: 1,
                          position: "relative",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color: "#000",
                            }}
                          >
                            {reply.user?.displayName || "Anonymous"}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "#999",
                                fontSize: "0.7rem",
                              }}
                            >
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </Typography>
                            {user?.role === "admin" && (
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setItemToDelete(`${comment._id}-${reply._id}`);
                                  setDeleteType("reply");
                                  setDeleteDialogOpen(true);
                                }}
                                sx={{ color: "#d32f2f", p: 0.5 }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: "0.8rem",
                            color: "#555",
                          }}
                        >
                          {reply.content}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {deleteType}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirmation} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>


      {/* Standardized Back Button */}
      <Box sx={{ mt: 6, mb: 2, textAlign: 'center' }}>
        <Button
          onClick={() => navigate('/explore/clothing')}
          variant="outlined"
          sx={{
            color: '#000',
            borderColor: '#000',
            borderWidth: 2,
            borderRadius: 0,
            px: 4,
            py: 1.5,
            fontWeight: 700,
            fontFamily: 'Georgia, serif',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            '&:hover': {
              bgcolor: '#000',
              borderColor: '#000',
              color: '#fff',
            }
          }}
        >
          ← Back to Clothing
        </Button>
      </Box>
    </Container>
  );
}

export default ClothingDetail;


