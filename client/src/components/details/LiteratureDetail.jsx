import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  Divider,
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
  VolumeUp,
  VolumeOff,
  PlayArrow,
  Pause,
  ThumbDown,
  FavoriteBorder,
  SentimentSatisfied,
  Person,
  CommentOutlined,
} from "@mui/icons-material";
import MediaDisplay from "../common/MediaDisplay";
import MediaUpload from "../common/MediaUpload";

import { useBilingualContent } from "../../utils/bilingualContent";
function LiteratureDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const getContent = useBilingualContent();
  const [literature, setLiterature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

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
  const [deleteType, setDeleteType] = useState(""); // 'comment' or 'reply'

  // Comment reactions states
  const [commentReactions, setCommentReactions] = useState({});
  const [emojiPickerOpen, setEmojiPickerOpen] = useState({});

  // Edit dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    title_en: "",
    title_ta: "",
    author_en: "",
    author_ta: "",
    period_en: "",
    period_ta: "",
    genre_en: "",
    genre_ta: "",
    language_en: "",
    language_ta: "",
    description_en: "",
    description_ta: "",
    content_en: "",
    content_ta: "",
    summary_en: "",
    summary_ta: "",
    image: "",
  });

  // Add a new state for inline editing
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    title_en: "",
    title_ta: "",
    author_en: "",
    author_ta: "",
    period_en: "",
    period_ta: "",
    genre_en: "",
    genre_ta: "",
    language_en: "",
    language_ta: "",
    description_en: "",
    description_ta: "",
    content_en: "",
    content_ta: "",
    summary_en: "",
    summary_ta: "",
    imageUrl: "",
    contentSections: [], // bilingual sections
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
      contentSections: prev.contentSections && prev.contentSections.length > 0 
        ? prev.contentSections.filter(section => section.id !== idToRemove)
        : []
    }));
  };

  // Emoji options
  const emojiOptions = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  useEffect(() => {
    const initializeData = async () => {
      await fetchUser();
      await fetchLiterature();
    };
    initializeData();
  }, [id]);

  // Update userLiked when user data becomes available
  useEffect(() => {
    if (user && literature) {
      const likesArray = Array.isArray(literature.likes)
        ? literature.likes
        : [];
      setUserLiked(
        likesArray.some((likeId) => likeId.toString() === user._id.toString())
      );
    }
  }, [user, literature]);

  const fetchUser = async () => {
    try {
      console.log("Fetching user in LiteratureDetail...");
      const res = await fetch(
        `${
          import.meta.env.VITE_APP_API_URL || "http://localhost:5000"
        }/auth/user`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      console.log("User fetch response status:", res.status);

      if (res.status === 401) {
        console.log("User not authenticated");
        setUser(null);
        return;
      }

      if (!res.ok) {
        console.error("Failed to fetch user:", res.status, res.statusText);
        setUser(null);
        return;
      }

      const userData = await res.json();
      console.log("Fetched User Data:", userData);
      setUser(userData);
    } catch (err) {
      console.error("Error fetching user:", err);
      setUser(null);
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
      setComments(data.comments || []);
      // Handle likes - ensure it's an array and check if user liked
      const likesArray = Array.isArray(data.likes) ? data.likes : [];
      setLikes(likesArray.length);
      setUserLiked(
        likesArray.some(
          (likeId) => likeId.toString() === user?._id?.toString()
        ) || false
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add like functionality
  const handleLike = async () => {
    if (!user) {
      alert("Please log in to like this literature");
      return;
    }

    try {
      const res = await fetch(`/api/literature/${id}/like`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to like/unlike");
      }

      const data = await res.json();
      setLikes(data.likes);
      setUserLiked(data.userLiked);
    } catch (err) {
      console.error("Like error:", err);
      alert("Failed to like the literature");
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
      const res = await fetch(`/api/literature/${id}/comments`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
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
      const res = await fetch(
        `/api/literature/${id}/comments/${commentId}/replies`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: newReply }),
        }
      );

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
      const res = await fetch(
        `/api/literature/${id}/comments/${commentId}/reactions`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ emoji }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to add reaction");
      }

      const data = await res.json();
      // Update the specific comment in the comments array
      const updatedComments = comments.map((comment) =>
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
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this literature? This action cannot be undone."
    );

    if (!confirmDelete) return;

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
      alert(`Failed to delete literature: ${err.message}`);
    }
  };

  const handleDeleteConfirmation = async () => {
    if (deleteType === "comment") {
      try {
        const res = await fetch(
          `/api/literature/${id}/comments/${itemToDelete}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to delete comment");
        }

        const updatedComments = comments.filter(
          (comment) => comment._id !== itemToDelete
        );
        setComments(updatedComments);
      } catch (err) {
        console.error("Delete comment error:", err);
        alert("Failed to delete comment");
      }
    } else if (deleteType === "reply") {
      try {
        const [commentId, replyId] = itemToDelete.split("-");
        const res = await fetch(
          `/api/literature/${id}/comments/${commentId}/replies/${replyId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to delete reply");
        }

        // Update the comment to remove the deleted reply
        const updatedComments = comments.map((comment) => {
          if (comment._id === commentId) {
            return {
              ...comment,
              replies: comment.replies.filter((reply) => reply._id !== replyId),
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
    setDeleteType("");
  };

  const handleInlineSave = async () => {
    try {
      const toBilingual = (en, ta) => {
        if (!en && !ta) return undefined;
        return { en: en || "", ta: ta || "" };
      };

      // Map content sections to bilingual format and drop local id
      const formattedContentSections = editableData.contentSections.map(section => {
        const { id, subtitle_en, subtitle_ta, content_en, content_ta, videoTitle_en, videoTitle_ta, videoDescription_en, videoDescription_ta, ...rest } = section;
        return {
          ...rest,
          subtitle: toBilingual(subtitle_en, subtitle_ta),
          content: toBilingual(content_en, content_ta),
          videoTitle: toBilingual(videoTitle_en, videoTitle_ta),
          videoDescription: toBilingual(videoDescription_en, videoDescription_ta)
        };
      });

      const updateData = {
        title: toBilingual(editableData.title_en, editableData.title_ta),
        author: toBilingual(editableData.author_en, editableData.author_ta),
        period: toBilingual(editableData.period_en, editableData.period_ta),
        genre: toBilingual(editableData.genre_en, editableData.genre_ta),
        language: toBilingual(editableData.language_en, editableData.language_ta),
        description: toBilingual(editableData.description_en, editableData.description_ta),
        content: toBilingual(editableData.content_en, editableData.content_ta),
        summary: toBilingual(editableData.summary_en, editableData.summary_ta),
        image: editableData.imageUrl || "",
        contentSections: formattedContentSections,
      };

      const res = await fetch(`/api/literature/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update literature");
      }

      await fetchLiterature();
      setIsEditing(false);
      setError("");
      alert("Literature details updated successfully!");
    } catch (err) {
      setError(err.message);
      alert(`Failed to save details: ${err.message}`);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const res = await fetch(`/api/literature/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
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

  const handleEditOpen = () => {
    if (literature) {
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
        title_en: toStr(literature.title),
        title_ta: toTa(literature.title),
        author_en: toStr(literature.author),
        author_ta: toTa(literature.author),
        period_en: toStr(literature.period),
        period_ta: toTa(literature.period),
        genre_en: toStr(literature.genre),
        genre_ta: toTa(literature.genre),
        language_en: toStr(literature.language),
        language_ta: toTa(literature.language),
        description_en: toStr(literature.description),
        description_ta: toTa(literature.description),
        content_en: toStr(literature.content),
        content_ta: toTa(literature.content),
        summary_en: toStr(literature.summary),
        summary_ta: toTa(literature.summary),
        imageUrl: literature.image || "",
        contentSections: (literature.contentSections || []).map(sec => ({
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
      setIsEditing(true);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: literature.title,
        text: literature.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading literature...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate("/explore/literature")}>
          Back to Literature
        </Button>
      </Container>
    );
  }

  if (!literature) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Literature not found
        </Alert>
        <Button onClick={() => navigate("/explore/literature")}>
          Back to Literature
        </Button>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 4,
          justifyContent: "space-between",
        }}
      >
        <IconButton onClick={() => navigate("/explore/literature")}>
          <ArrowBack />
        </IconButton>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            textTransform: "uppercase",
            textAlign: "center",
            flex: 1,
            mx: 2,
          }}
        >
          {getContent(literature.title)}
        </Typography>

        {/* Admin Actions */}
        {user && user.role === "admin" && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              onClick={() => {
                // Prepare editable data when edit is clicked
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
                  title_en: toStr(literature.title),
                  title_ta: toTa(literature.title),
                  author_en: toStr(literature.author),
                  author_ta: toTa(literature.author),
                  period_en: toStr(literature.period),
                  period_ta: toTa(literature.period),
                  genre_en: toStr(literature.genre),
                  genre_ta: toTa(literature.genre),
                  language_en: toStr(literature.language),
                  language_ta: toTa(literature.language),
                  description_en: toStr(literature.description),
                  description_ta: toTa(literature.description),
                  content_en: toStr(literature.content),
                  content_ta: toTa(literature.content),
                  summary_en: toStr(literature.summary),
                  summary_ta: toTa(literature.summary),
                  imageUrl: literature.image || "",
                  contentSections: (literature.contentSections || []).map(sec => ({
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
                // Toggle editing mode
                setIsEditing(!isEditing);
              }}
              sx={{
                color: "#000",
                border: "1px solid #000",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.1)",
                  transform: "scale(1.1)",
                },
              }}
            >
              {isEditing ? <Close /> : <EditIcon />}
            </IconButton>
            <IconButton
              onClick={handleDelete}
              sx={{
                color: "#000",
                border: "1px solid #000",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(255,0,0,0.1)",
                  transform: "scale(1.1)",
                },
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
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {/* Image Section - Top */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "2px solid #000",
            position: "relative",
            maxWidth: 800,
            mx: "auto",
            width: "100%",
          }}
        >
          {(isEditing ? editableData.imageUrl : literature.image) ? (
            <img
              src={isEditing ? editableData.imageUrl : literature.image}
              alt={getContent(literature.title)}
              style={{
                maxWidth: "100%",
                maxHeight: 400,
                objectFit: "contain",
                padding: 16,
              }}
              onError={(e) => {
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600' viewBox='0 0 1200 600'%3E%3Crect fill='%23cccccc' width='1200' height='600'%3E%3C/rect%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='100px' fill='%23333333'%3EImage Not Available%3C/text%3E%3C/svg%3E";
              }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: 400,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                bgcolor: "#f0f0f0",
                color: "#666",
                fontSize: "1.2rem",
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
            display: "flex",
            flexDirection: "column",
            gap: 3,
            maxWidth: 800,
            mx: "auto",
            width: "100%",
          }}
        >
          {/* Author and Period */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "1px solid #000",
              pb: 2,
            }}
          >
            {!isEditing ? (
              <>
                {getContent(literature.author) && (
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Author: {getContent(literature.author)}
                  </Typography>
                )}
                {getContent(literature.period) && (
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Period: {getContent(literature.period)}
                  </Typography>
                )}
              </>
            ) : (
              <Box sx={{ display: "flex", width: "100%", gap: 2 }}>
                <Box sx={{ display:'flex', flexDirection:'column', gap:1, width:'50%' }}>
                  <TextField label="Author (EN)" value={editableData.author_en} onChange={(e)=>setEditableData({ ...editableData, author_en: e.target.value })} fullWidth variant="standard" />
                  <TextField label="Author (TA)" value={editableData.author_ta} onChange={(e)=>setEditableData({ ...editableData, author_ta: e.target.value })} fullWidth variant="standard" />
                </Box>
                <Box sx={{ display:'flex', flexDirection:'column', gap:1, width:'50%' }}>
                  <TextField label="Period (EN)" value={editableData.period_en} onChange={(e)=>setEditableData({ ...editableData, period_en: e.target.value })} fullWidth variant="standard" />
                  <TextField label="Period (TA)" value={editableData.period_ta} onChange={(e)=>setEditableData({ ...editableData, period_ta: e.target.value })} fullWidth variant="standard" />
                </Box>
              </Box>
            )}
          </Box>

          {/* Genre and Language */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              borderBottom: "1px solid #000",
              pb: 2,
            }}
          >
            {!isEditing ? (
              <>
                {getContent(literature.genre) && (
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Genre: {getContent(literature.genre)}
                  </Typography>
                )}
                {getContent(literature.language) && (
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Language: {getContent(literature.language)}
                  </Typography>
                )}
              </>
            ) : (
              <Box sx={{ display: "flex", width: "100%", gap: 2 }}>
                <Box sx={{ display:'flex', flexDirection:'column', gap:1, width:'50%' }}>
                  <TextField label="Genre (EN)" value={editableData.genre_en} onChange={(e)=>setEditableData({ ...editableData, genre_en: e.target.value })} fullWidth variant="standard" />
                  <TextField label="Genre (TA)" value={editableData.genre_ta} onChange={(e)=>setEditableData({ ...editableData, genre_ta: e.target.value })} fullWidth variant="standard" />
                </Box>
                <Box sx={{ display:'flex', flexDirection:'column', gap:1, width:'50%' }}>
                  <TextField label="Language (EN)" value={editableData.language_en} onChange={(e)=>setEditableData({ ...editableData, language_en: e.target.value })} fullWidth variant="standard" />
                  <TextField label="Language (TA)" value={editableData.language_ta} onChange={(e)=>setEditableData({ ...editableData, language_ta: e.target.value })} fullWidth variant="standard" />
                </Box>
              </Box>
            )}
          </Box>

          {/* Description */}
          {!isEditing ? (
            <Box>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  borderBottom: "2px solid #000",
                  pb: 1,
                }}
              >
                Description
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                }}
              >
                {getContent(literature.description)}
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  borderBottom: "2px solid #000",
                  pb: 1,
                }}
              >
                Description
              </Typography>
              <TextField label="Description (EN)" value={editableData.description_en} onChange={(e)=>setEditableData({ ...editableData, description_en: e.target.value })} fullWidth multiline rows={4} variant="standard" sx={{ mb:1 }} />
              <TextField label="Description (TA)" value={editableData.description_ta} onChange={(e)=>setEditableData({ ...editableData, description_ta: e.target.value })} fullWidth multiline rows={4} variant="standard" />
            </Box>
          )}

          {/* Main Image (inline edit) */}
          {isEditing && (
            <Box>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  borderBottom: "2px solid #000",
                  pb: 1,
                }}
              >
                Image URL
              </Typography>
              <TextField
                label="Image URL"
                value={editableData.imageUrl || ""}
                onChange={(e) => setEditableData({ ...editableData, imageUrl: e.target.value })}
                fullWidth
                variant="standard"
                InputLabelProps={{ shrink: true }}
                placeholder="Enter full image URL"
                sx={{ mb: 2 }}
              />

              {/* Upload from device for main image */}
              <MediaUpload
                onImageChange={(imageUrl) => setEditableData(prev => ({ ...prev, imageUrl }))}
                onImageLinkChange={(imageLink) => setEditableData(prev => ({ ...prev, imageUrl: imageLink }))}
                currentImage={editableData.imageUrl}
                label="Main Image"
              />

              {editableData.imageUrl && (
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "center",
                    border: "1px solid #ddd",
                    borderRadius: 1,
                    p: 2,
                  }}
                >
                  <img
                    src={editableData.imageUrl}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 200,
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600' viewBox='0 0 1200 600'%3E%3Crect fill='%23cccccc' width='1200' height='600'%3E%3C/rect%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='100px' fill='%23333333'%3EImage Not Available%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </Box>
              )}
            </Box>
          )}

          {/* Summary */}
          {(literature.summary || isEditing) &&
            (!isEditing ? (
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    borderBottom: "2px solid #000",
                    pb: 1,
                  }}
                >
                  Summary
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                  }}
                >
                  {getContent(literature.summary)}
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    borderBottom: "2px solid #000",
                    pb: 1,
                  }}
                >
                  Summary
                </Typography>
                <TextField label="Summary (EN)" value={editableData.summary_en} onChange={(e)=>setEditableData({ ...editableData, summary_en: e.target.value })} fullWidth multiline rows={3} variant="standard" sx={{ mb:1 }} />
                <TextField label="Summary (TA)" value={editableData.summary_ta} onChange={(e)=>setEditableData({ ...editableData, summary_ta: e.target.value })} fullWidth multiline rows={3} variant="standard" />
              </Box>
            ))}

          {/* Content */}
          {(literature.content || isEditing) &&
            (!isEditing ? (
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    borderBottom: "2px solid #000",
                    pb: 1,
                  }}
                >
                  Content
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                  }}
                >
                  {getContent(literature.content)}
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    borderBottom: "2px solid #000",
                    pb: 1,
                  }}
                >
                  Content
                </Typography>
                <TextField label="Content (EN)" value={editableData.content_en} onChange={(e)=>setEditableData({ ...editableData, content_en: e.target.value })} fullWidth multiline rows={4} variant="standard" sx={{ mb:1 }} />
                <TextField label="Content (TA)" value={editableData.content_ta} onChange={(e)=>setEditableData({ ...editableData, content_ta: e.target.value })} fullWidth multiline rows={4} variant="standard" />
              </Box>
            ))}
            
          {/* Content Sections */}
          {!isEditing && literature.contentSections && literature.contentSections.length > 0 && 
            literature.contentSections.map((section, index) => (
              <Box key={section.id || `content-section-${index}`} sx={{ mt: 4 }}>
                {getContent(section.subtitle) && (
                  <Typography 
                    variant="h6" 
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
                    title={getContent(section.videoTitle) || `Section ${index + 1} Video`}
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
          }

          {/* Editable Content Sections */}
          {isEditing && user && user.role === "admin" && (
            <Box sx={{ mt: 4 }}>
              <Typography 
                variant="h6" 
                sx={{
                  mb: 2, 
                  fontWeight: 700,
                  borderBottom: '2px solid #000',
                  pb: 1,
                }}
              >
                Additional Content Sections
              </Typography>
              
              {editableData.contentSections && editableData.contentSections.map((section, index) => (
                <Box 
                  key={section.id || `editable-section-${index}`} 
                  sx={{ 
                    mb: 3, 
                    p: 2, 
                    border: '1px solid #000',
                    position: 'relative' 
                  }}
                >
                  <Box sx={{ display:'flex', gap:2 }}>
                    <TextField label="Subtitle (EN)" value={section.subtitle_en || ""} onChange={(e)=>{
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].subtitle_en = e.target.value;
                      setEditableData(prev=>({...prev, contentSections: updatedSections}));
                    }} fullWidth variant="standard" sx={{ mb:2 }} />
                    <TextField label="Subtitle (TA)" value={section.subtitle_ta || ""} onChange={(e)=>{
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].subtitle_ta = e.target.value;
                      setEditableData(prev=>({...prev, contentSections: updatedSections}));
                    }} fullWidth variant="standard" sx={{ mb:2 }} />
                  </Box>
                  
                  <Box sx={{ display:'flex', gap:2 }}>
                    <TextField label="Content (EN)" value={section.content_en || ""} onChange={(e)=>{
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].content_en = e.target.value;
                      setEditableData(prev=>({...prev, contentSections: updatedSections}));
                    }} fullWidth multiline rows={4} variant="standard" sx={{ mb:2 }} />
                    <TextField label="Content (TA)" value={section.content_ta || ""} onChange={(e)=>{
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].content_ta = e.target.value;
                      setEditableData(prev=>({...prev, contentSections: updatedSections}));
                    }} fullWidth multiline rows={4} variant="standard" sx={{ mb:2 }} />
                  </Box>

                  {/* Image URL for Content Section */}
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      mt: 2, 
                      mb: 1, 
                      fontWeight: 700,
                      borderBottom: '1px solid #000',
                      pb: 1,
                    }}
                  >
                    Section Image
                  </Typography>
                  
                  <TextField
                    label="Image URL"
                    value={section.imageUrl}
                    onChange={(e) => {
                      const updatedSections = editableData.contentSections ? [...editableData.contentSections] : [];
                      if (updatedSections[index]) {
                        updatedSections[index].imageUrl = e.target.value;
                      }
                      setEditableData(prev => ({
                        ...prev,
                        contentSections: updatedSections
                      }));
                    }}
                    fullWidth
                    sx={{ mb: 2 }}
                    variant="standard"
                    placeholder="Enter full image URL"
                  />

                  {/* Image Upload for Content Section */}
                  <MediaUpload
                    onImageChange={(imageUrl) => {
                      const updatedSections = editableData.contentSections ? [...editableData.contentSections] : [];
                      if (updatedSections[index]) {
                        updatedSections[index].imageUrl = imageUrl;
                      }
                      setEditableData(prev => ({
                        ...prev,
                        contentSections: updatedSections
                      }));
                    }}
                    onImageLinkChange={(imageLink) => {
                      const updatedSections = editableData.contentSections ? [...editableData.contentSections] : [];
                      if (updatedSections[index]) {
                        updatedSections[index].imageLink = imageLink;
                      }
                      setEditableData(prev => ({
                        ...prev,
                        contentSections: updatedSections
                      }));
                    }}
                    currentImage={section.imageUrl}
                    currentImageLink={section.imageLink}
                    label="Section Image"
                  />

                  {/* Preview of uploaded/entered image */}
                  {section.imageUrl && (
                    <Box 
                      sx={{ 
                        mt: 2, 
                        display: 'flex', 
                        justifyContent: 'center', 
                        border: '1px solid #ddd', 
                        borderRadius: 1,
                        p: 2 
                      }}
                    >
                      <img 
                        src={section.imageUrl} 
                        alt="Preview" 
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: 200, 
                          objectFit: 'contain' 
                        }}
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600' viewBox='0 0 1200 600'%3E%3Crect fill='%23cccccc' width='1200' height='600'%3E%3C/rect%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='100px' fill='%23333333'%3EImage Not Available%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </Box>
                  )}

                  {/* Video Details for Content Section */}
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      mt: 2, 
                      mb: 1, 
                      fontWeight: 700,
                      borderBottom: '1px solid #000',
                      pb: 1,
                    }}
                  >
                    Section Video Details
                  </Typography>
                  
                  <TextField
                    label="Video URL"
                    value={section.videoUrl}
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
                    placeholder="Enter full YouTube video URL"
                  />
                  
                  <Box sx={{ display:'flex', gap:2 }}>
                    <TextField label="Video Title (EN)" value={section.videoTitle_en || ""} onChange={(e)=>{
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].videoTitle_en = e.target.value;
                      setEditableData(prev=>({...prev, contentSections: updatedSections}));
                    }} fullWidth variant="standard" sx={{ mb:2 }} />
                    <TextField label="Video Title (TA)" value={section.videoTitle_ta || ""} onChange={(e)=>{
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].videoTitle_ta = e.target.value;
                      setEditableData(prev=>({...prev, contentSections: updatedSections}));
                    }} fullWidth variant="standard" sx={{ mb:2 }} />
                  </Box>
                  <Box sx={{ display:'flex', gap:2 }}>
                    <TextField label="Video Description (EN)" value={section.videoDescription_en || ""} onChange={(e)=>{
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].videoDescription_en = e.target.value;
                      setEditableData(prev=>({...prev, contentSections: updatedSections}));
                    }} fullWidth multiline rows={3} variant="standard" sx={{ mb:2 }} />
                    <TextField label="Video Description (TA)" value={section.videoDescription_ta || ""} onChange={(e)=>{
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].videoDescription_ta = e.target.value;
                      setEditableData(prev=>({...prev, contentSections: updatedSections}));
                    }} fullWidth multiline rows={3} variant="standard" sx={{ mb:2 }} />
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
            </Box>
          )}

          {/* Separate Update Button for Content Sections */}
          {isEditing && user && user.role === "admin" && (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mt: 4,
                pt: 2,
                borderTop: '1px solid #000',
                maxWidth: 800,
                mx: 'auto',
                width: '100%'
              }}
            >
              <Button
                onClick={() => setIsEditing(false)}
                sx={{ 
                  color: '#000',
                  '&:hover': { 
                    bgcolor: 'rgba(0,0,0,0.05)' 
                  }
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
                    bgcolor: '#000',
                    color: '#fff',
                    '&:hover': { 
                      bgcolor: '#333' 
                    }
                  }}
                >
                  Update Details
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Spacer before comments section */}
      <Box
        sx={{
          mt: 4,
          pb: 2,
        }}
      ></Box>

      {/* Comments Section */}
      <Box 
        sx={{ 
          mt: 4, 
          width: '100%', 
          maxWidth: 800,  
          mx: 'auto',    
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'stretch',
          border: '1px solid #000',
          p: 2,
          backgroundColor: '#fff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {/* Likes and Share Row */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 2,
            pb: 1,
            borderBottom: '1px solid #000'
          }}
        >
          {/* Likes */}
          <Button
            startIcon={userLiked ? <ThumbUp /> : <ThumbUpOutlined />}
            onClick={handleLike}
            disabled={!user}
            sx={{
              color: '#000',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: 1,
              border: '1px solid #000',
              p: '4px 8px',
              minWidth: 'auto',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.05)'
              },
              '&.Mui-disabled': {
                color: '#ccc',
                borderColor: '#ccc'
              }
            }}
          >
            {likes} Likes
          </Button>

          {/* Share */}
          <Tooltip title="Share this article">
            <IconButton 
              onClick={handleShare}
              sx={{
                color: '#000',
                border: '1px solid #000',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.05)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <Share />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            textTransform: 'uppercase',
            textAlign: 'center',
            letterSpacing: 1,
            borderBottom: '1px solid #000',
            pb: 1,
            mb: 2,
            fontFamily: "'Montserrat', sans-serif"
          }}
        >
          Comments ({comments.length})
        </Typography>

        {/* Comment Input */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3,
            position: 'relative'
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
              fontFamily: "'Open Sans', sans-serif",
              '& .MuiInput-underline:before': {
                borderBottomColor: '#000',
              },
              '& .MuiInput-underline:after': {
                borderBottomColor: '#000',
              },
            }}
          />
          <IconButton 
            onClick={handleAddComment}
            disabled={!newComment.trim() || !user}
            sx={{
              position: 'absolute',
              right: 0,
              color: '#000',
              '&:hover': {
                bgcolor: 'transparent'
              },
              '&.Mui-disabled': {
                color: '#ccc'
              }
            }}
          >
            <Send />
          </IconButton>
        </Box>

        {/* Comments List */}
        <Box sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <Box
                key={comment._id || index}
                sx={{
                  mb: 2,
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderLeft: '3px solid #000',
                  borderRadius: 1,
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    borderLeftWidth: '5px'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      fontFamily: "'Montserrat', sans-serif",
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Person sx={{ fontSize: 18 }} />
                    {comment.user?.username || 'Anonymous'}
                  </Typography>
                  
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#666',
                      fontStyle: 'italic',
                      fontSize: '0.7rem'
                    }}
                  >
                    {new Date(comment.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body2" 
                  sx={{ 
                    pl: 1,
                    fontFamily: "'Open Sans', sans-serif",
                    fontSize: '0.85rem',
                    lineHeight: 1.6
                  }}
                >
                  {comment.content}
                </Typography>

                {/* Comment actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 1, borderTop: '1px dashed #e0e0e0' }}>
                  <Button
                    size="small"
                    onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                    sx={{
                      color: '#666',
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1,
                      '&:hover': {
                        bgcolor: 'rgba(0,0,0,0.05)',
                      },
                    }}
                  >
                    <Reply sx={{ fontSize: '0.9rem' }} />
                    Reply
                  </Button>

                  {/* Delete Button for Admin and Comment Owner */}
                  {user &&
                    (user.role === "admin" || user._id === comment.user?._id) &&
                    comment._id && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setItemToDelete(comment._id);
                          setDeleteType("comment");
                          setDeleteDialogOpen(true);
                        }}
                        sx={{
                          color: '#666',
                          padding: '4px',
                          '&:hover': {
                            color: '#d32f2f',
                            bgcolor: 'rgba(211, 47, 47, 0.04)'
                          }
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                </Box>

                {/* Reply input */}
                {replyingTo === comment._id && (
                  <Box
                    sx={{
                      mt: 2,
                      display: 'flex',
                      alignItems: 'center',
                      position: 'relative',
                      borderTop: '1px solid #e0e0e0',
                      pt: 2
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
                        '& .MuiInput-underline:before': {
                          borderBottomColor: '#000',
                        },
                        '& .MuiInput-underline:after': {
                          borderBottomColor: '#000',
                        },
                      }}
                    />
                    <IconButton
                      onClick={() => handleAddReply(comment._id)}
                      disabled={!newReply.trim() || !user}
                      size="small"
                      sx={{
                        position: 'absolute',
                        right: 0,
                        color: '#000',
                        '&:hover': {
                          bgcolor: 'transparent',
                        },
                        '&.Mui-disabled': {
                          color: '#ccc',
                        },
                      }}
                    >
                      <Send fontSize="small" />
                    </IconButton>
                  </Box>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <Box 
                    sx={{ 
                      mt: 2, 
                      ml: 3,
                      pl: 2,
                      borderLeft: '2px solid #e0e0e0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2
                    }}
                  >
                    {comment.replies.map((reply) => (
                      <Box
                        key={reply._id}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.5,
                          position: 'relative',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color: '#000',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            <Person sx={{ fontSize: 14 }} />
                            {reply.user?.username || 'Anonymous'}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#999',
                                fontSize: '0.7rem',
                                fontStyle: 'italic'
                              }}
                            >
                              {new Date(reply.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </Typography>
                            
                            {/* Reply Delete Button */}
                            {user && 
                              (user.role === "admin" || user._id === reply.user?._id) && (
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setItemToDelete(`${comment._id}-${reply._id}`);
                                  setDeleteType("reply");
                                  setDeleteDialogOpen(true);
                                }}
                                sx={{ 
                                  color: '#999', 
                                  p: 0.5,
                                  '&:hover': {
                                    color: '#d32f2f',
                                  }
                                }}
                              >
                                <Delete sx={{ fontSize: 12 }} />
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                        
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: '0.8rem',
                            color: '#555',
                            pl: 1,
                            fontFamily: "'Open Sans', sans-serif",
                          }}
                        >
                          {reply.content}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            ))
          ) : (
            <Box 
              sx={{ 
                py: 4, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                opacity: 0.7
              }}
            >
              <CommentOutlined sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
              <Typography
                variant="body2"
                sx={{ 
                  fontStyle: 'italic', 
                  color: '#666', 
                  textAlign: 'center',
                  fontFamily: "'Open Sans', sans-serif" 
                }}
              >
                No comments yet. Be the first to share your thoughts!
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {deleteType}? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirmation} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Literature</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              fullWidth
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Author"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Period"
                value={formData.period}
                onChange={(e) =>
                  setFormData({ ...formData, period: e.target.value })
                }
                fullWidth
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Genre"
                value={formData.genre}
                onChange={(e) =>
                  setFormData({ ...formData, genre: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Language"
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
                fullWidth
              />
            </Box>
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              multiline
              rows={4}
              fullWidth
            />
            <TextField
              label="Summary"
              value={formData.summary}
              onChange={(e) =>
                setFormData({ ...formData, summary: e.target.value })
              }
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              multiline
              rows={4}
              fullWidth
            />
            <TextField
              label="Image URL"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default LiteratureDetail;








