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
function FestivalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const getContent = useBilingualContent();
  const [festival, setFestival] = useState(null);
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
  const [deleteType, setDeleteType] = useState(""); // "comment" or "reply"
  
  // Comment reactions states
  const [commentReactions, setCommentReactions] = useState({});
  const [emojiPickerOpen, setEmojiPickerOpen] = useState({});

  // Edit dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ta: "",
    region_en: "",
    region_ta: "",
    season_en: "",
    season_ta: "",
    duration_en: "",
    duration_ta: "",
    rituals_en: "",
    rituals_ta: "",
    description_en: "",
    description_ta: "",
    history_en: "",
    history_ta: "",
    significance_en: "",
    significance_ta: "",
    image: "",
  });

  // Add a new state for inline editing
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    name_en: "",
    name_ta: "",
    region_en: "",
    region_ta: "",
    season_en: "",
    season_ta: "",
    duration_en: "",
    duration_ta: "",
    rituals_en: "",
    rituals_ta: "",
    description_en: "",
    description_ta: "",
    history_en: "",
    history_ta: "",
    significance_en: "",
    significance_ta: "",
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
          id: Date.now() // Unique identifier
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
      await fetchUser();
      await fetchFestival();
    };
    initializeData();
  }, [id]);

  // Update userLiked when user data becomes available
  useEffect(() => {
    if (user && festival) {
      const likesArray = Array.isArray(festival.likes) ? festival.likes : [];
      setUserLiked(likesArray.some(likeId => likeId.toString() === user._id.toString()));
    }
  }, [user, festival]);

  const fetchUser = async () => {
    try {
      console.log("Fetching user in FestivalDetail...");
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

  const fetchFestival = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/festivals/${id}`);
      if (!res.ok) {
        throw new Error("Festival not found");
      }
      const data = await res.json();
  setFestival(data);
      setComments(data.comments || []);
      // Handle likes - ensure it"s an array and check if user liked
      const likesArray = Array.isArray(data.likes) ? data.likes : [];
      setLikes(likesArray.length);
      setUserLiked(likesArray.some(likeId => likeId.toString() === user?._id?.toString()) || false);
      
      // Prepare helpers to extract EN/TA strings from bilingual fields
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

      // Set editable data with bilingual pairs and sections
      setEditableData({
        name_en: toStr(data.name),
        name_ta: toTa(data.name),
        region_en: toStr(data.region),
        region_ta: toTa(data.region),
        season_en: toStr(data.season),
        season_ta: toTa(data.season),
        duration_en: toStr(data.duration),
        duration_ta: toTa(data.duration),
        rituals_en: toStr(data.rituals),
        rituals_ta: toTa(data.rituals),
        description_en: toStr(data.description),
        description_ta: toTa(data.description),
        history_en: toStr(data.history),
        history_ta: toTa(data.history),
        significance_en: toStr(data.significance),
        significance_ta: toTa(data.significance),
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
          id: sec.id || sec._id || Date.now() + Math.random(),
        })),
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
      alert("Please log in to like this festival");
      return;
    }

    try {
      const res = await fetch(`/api/festivals/${id}/like`, {
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
      alert("Failed to like the festival");
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
      const res = await fetch(`/api/festivals/${id}/comments`, {
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
      const res = await fetch(`/api/festivals/${id}/comments/${commentId}/replies`, {
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
      const res = await fetch(`/api/festivals/${id}/comments/${commentId}/reactions`, {
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
    const confirmDelete = window.confirm("Are you sure you want to delete this festival? This action cannot be undone.");
    
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/festivals/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete festival");
      }

      navigate("/explore/festivals");
    } catch (err) {
      alert(`Failed to delete festival: ${err.message}`);
    }
  };

  const handleDeleteConfirmation = async () => {
    if (deleteType === "comment") {
      try {
        const res = await fetch(`/api/festivals/${id}/comments/${itemToDelete}`, {
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
    } else if (deleteType === "reply") {
      try {
        const [commentId, replyId] = itemToDelete.split("-");
        const res = await fetch(`/api/festivals/${id}/comments/${commentId}/replies/${replyId}`, {
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
    setDeleteType("");
  };

  const handleInlineSave = async () => {
    try {
      // Helper to build bilingual objects
      const toBilingual = (en, ta) => {
        if (!en && !ta) return undefined;
        return { en: en || "", ta: ta || "" };
      };

      // Map content sections to bilingual format and drop local-only id
      const formattedContentSections = editableData.contentSections.map(section => {
        const { id, subtitle_en, subtitle_ta, content_en, content_ta, videoTitle_en, videoTitle_ta, videoDescription_en, videoDescription_ta, ...rest } = section;
        return {
          ...rest,
          subtitle: toBilingual(subtitle_en, subtitle_ta),
          content: toBilingual(content_en, content_ta),
          videoTitle: toBilingual(videoTitle_en, videoTitle_ta),
          videoDescription: toBilingual(videoDescription_en, videoDescription_ta),
        };
      });

      const updateData = {
        name: toBilingual(editableData.name_en, editableData.name_ta),
        region: toBilingual(editableData.region_en, editableData.region_ta),
        season: toBilingual(editableData.season_en, editableData.season_ta),
        duration: toBilingual(editableData.duration_en, editableData.duration_ta),
        rituals: toBilingual(editableData.rituals_en, editableData.rituals_ta),
        description: toBilingual(editableData.description_en, editableData.description_ta),
        history: toBilingual(editableData.history_en, editableData.history_ta),
        significance: toBilingual(editableData.significance_en, editableData.significance_ta),
        image: editableData.imageUrl || "",
        contentSections: formattedContentSections,
      };

      const res = await fetch(`/api/festivals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update festival");
      }

      // Refresh from server for latest data
      await fetchFestival();
      setIsEditing(false);
      setError(""); // Clear any previous errors
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const res = await fetch(`/api/festivals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update festival");
      }
      setEditOpen(false);
      fetchFestival();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditOpen = () => {
    const toStr = (val) => (typeof val === 'object' ? (val.en || val.ta || "") : (val || ""));
    const toTa = (val) => (typeof val === 'object' ? (val.ta || "") : "");
    setFormData({
      name_en: toStr(festival.name),
      name_ta: toTa(festival.name),
      region_en: toStr(festival.region),
      region_ta: toTa(festival.region),
      season_en: toStr(festival.season),
      season_ta: toTa(festival.season),
      duration_en: toStr(festival.duration),
      duration_ta: toTa(festival.duration),
      rituals_en: toStr(festival.rituals),
      rituals_ta: toTa(festival.rituals),
      description_en: toStr(festival.description),
      description_ta: toTa(festival.description),
      history_en: toStr(festival.history),
      history_ta: toTa(festival.history),
      significance_en: toStr(festival.significance),
      significance_ta: toTa(festival.significance),
      image: festival.image || festival.imageUrl || "",
    });
    setEditOpen(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: festival.name,
        text: festival.description,
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
        <Typography sx={{ mt: 2 }}>Loading festival...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate("/explore/festivals")}>
          Back to Festivals
        </Button>
      </Container>
    );
  }

  if (!festival) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Festival not found
        </Alert>
        <Button onClick={() => navigate("/explore/festivals")}>
          Back to Festivals
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
          justifyContent: "space-between" 
        }}
      >
        <IconButton onClick={() => navigate("/explore/festivals")}>
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
          {getContent(festival.name)}
        </Typography>

        {/* Admin Actions */}
        {user && user.role === "admin" && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton 
              onClick={() => {
                // Prepare editable bilingual data when edit is clicked
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
                  name_en: toStr(festival.name),
                  name_ta: toTa(festival.name),
                  region_en: toStr(festival.region),
                  region_ta: toTa(festival.region),
                  season_en: toStr(festival.season),
                  season_ta: toTa(festival.season),
                  duration_en: toStr(festival.duration),
                  duration_ta: toTa(festival.duration),
                  rituals_en: toStr(festival.rituals),
                  rituals_ta: toTa(festival.rituals),
                  description_en: toStr(festival.description),
                  description_ta: toTa(festival.description),
                  history_en: toStr(festival.history),
                  history_ta: toTa(festival.history),
                  significance_en: toStr(festival.significance),
                  significance_ta: toTa(festival.significance),
                  imageUrl: festival.image || "",
                  contentSections: (festival.contentSections || []).map(sec => ({
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
                  })),
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
                  transform: "scale(1.1)"
                }
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
                  transform: "scale(1.1)"
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
          width: "100%", 
          display: "flex", 
          flexDirection: "column", 
          gap: 4 
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
            width: "100%"
          }}
        >
          {(isEditing ? editableData.imageUrl : (festival.image || festival.imageUrl)) ? (
            <img
              src={isEditing ? editableData.imageUrl : (festival.image || festival.imageUrl)}
              alt={festival.name}
              style={{
                maxWidth: "100%",
                maxHeight: 400,
                objectFit: "contain",
                padding: 16,
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
            width: "100%"
          }}
        >
          {/* Region and Season (Bilingual) */}
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
                {getContent(festival.region) && (
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 700, 
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Region: {getContent(festival.region)}
                  </Typography>
                )}
                {getContent(festival.season) && (
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 700, 
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Season: {getContent(festival.season)}
                  </Typography>
                )}
              </>
            ) : (
              <Box sx={{ display: "flex", width: "100%", gap: 2 }}>
                <Box sx={{ display:'flex', flexDirection:'column', gap:1, width:'50%' }}>
                  <TextField label="Region (EN)" value={editableData.region_en} onChange={(e)=>setEditableData({ ...editableData, region_en: e.target.value })} fullWidth variant="standard" />
                  <TextField label="Region (TA)" value={editableData.region_ta} onChange={(e)=>setEditableData({ ...editableData, region_ta: e.target.value })} fullWidth variant="standard" />
                </Box>
                <Box sx={{ display:'flex', flexDirection:'column', gap:1, width:'50%' }}>
                  <TextField label="Season (EN)" value={editableData.season_en} onChange={(e)=>setEditableData({ ...editableData, season_en: e.target.value })} fullWidth variant="standard" />
                  <TextField label="Season (TA)" value={editableData.season_ta} onChange={(e)=>setEditableData({ ...editableData, season_ta: e.target.value })} fullWidth variant="standard" />
                </Box>
              </Box>
            )}
          </Box>

          {/* Duration and Rituals */}
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
                {getContent(festival.duration) && (
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 700, 
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Duration: {getContent(festival.duration)}
                  </Typography>
                )}
                {getContent(festival.rituals) && (
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 700, 
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Rituals: {getContent(festival.rituals)}
                  </Typography>
                )}
              </>
            ) : (
              <Box sx={{ display: "flex", width: "100%", gap: 2 }}>
                <Box sx={{ display:'flex', flexDirection:'column', gap:1, width:'50%' }}>
                  <TextField label="Duration (EN)" value={editableData.duration_en} onChange={(e)=>setEditableData({ ...editableData, duration_en: e.target.value })} fullWidth variant="standard" />
                  <TextField label="Duration (TA)" value={editableData.duration_ta} onChange={(e)=>setEditableData({ ...editableData, duration_ta: e.target.value })} fullWidth variant="standard" />
                </Box>
                <Box sx={{ display:'flex', flexDirection:'column', gap:1, width:'50%' }}>
                  <TextField label="Rituals (EN)" value={editableData.rituals_en} onChange={(e)=>setEditableData({ ...editableData, rituals_en: e.target.value })} fullWidth variant="standard" />
                  <TextField label="Rituals (TA)" value={editableData.rituals_ta} onChange={(e)=>setEditableData({ ...editableData, rituals_ta: e.target.value })} fullWidth variant="standard" />
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
                {getContent(festival.description)}
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
              <TextField label="Description (EN)" value={editableData.description_en} onChange={(e)=>setEditableData({ ...editableData, description_en: e.target.value })} fullWidth multiline rows={3} variant="standard" sx={{ mb:1 }} />
              <TextField label="Description (TA)" value={editableData.description_ta} onChange={(e)=>setEditableData({ ...editableData, description_ta: e.target.value })} fullWidth multiline rows={3} variant="standard" />
            </Box>
          )}

          {/* Main Image (URL + Upload) - Edit mode only */}
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
                Image
              </Typography>
              <TextField
                label="Image URL"
                value={editableData.imageUrl || ""}
                onChange={(e) => setEditableData({ ...editableData, imageUrl: e.target.value })}
                fullWidth
                variant="standard"
                placeholder="Enter full image URL"
                sx={{ mb: 2 }}
              />

              <MediaUpload
                onImageChange={(imageUrl) => setEditableData(prev => ({ ...prev, imageUrl }))}
                currentImage={editableData.imageUrl}
                label="Main Image"
              />

              {(editableData.imageUrl) && (
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
                    src={editableData.imageUrl} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600' viewBox='0 0 1200 600'%3E%3Crect fill='%23cccccc' width='1200' height='600'%3E%3C/rect%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='100px' fill='%23333333'%3EImage Not Available%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </Box>
              )}
            </Box>
          )}

          {/* History */}
          {(festival.history || isEditing) && (
            !isEditing ? (
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
                  History
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                  }}
                >
                  {getContent(festival.history)}
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
                  History
                </Typography>
                <TextField label="History (EN)" value={editableData.history_en} onChange={(e)=>setEditableData({ ...editableData, history_en: e.target.value })} fullWidth multiline rows={3} variant="standard" sx={{ mb:1 }} />
                <TextField label="History (TA)" value={editableData.history_ta} onChange={(e)=>setEditableData({ ...editableData, history_ta: e.target.value })} fullWidth multiline rows={3} variant="standard" />
              </Box>
            )
          )}

          {/* Significance */}
          {(festival.significance || isEditing) && (
            !isEditing ? (
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
                  Significance
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                  }}
                >
                  {getContent(festival.significance)}
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
                  Significance
                </Typography>
                <TextField label="Significance (EN)" value={editableData.significance_en} onChange={(e)=>setEditableData({ ...editableData, significance_en: e.target.value })} fullWidth multiline rows={3} variant="standard" sx={{ mb:1 }} />
                <TextField label="Significance (TA)" value={editableData.significance_ta} onChange={(e)=>setEditableData({ ...editableData, significance_ta: e.target.value })} fullWidth multiline rows={3} variant="standard" />
              </Box>
            )
          )}
          
          {/* Content Sections */}
            {!isEditing && festival.contentSections && festival.contentSections.length > 0 && (
              festival.contentSections.map((section, index) => (
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
                      alt={getContent(section.subtitle) || `Section ${index + 1} Image`} 
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
            )}

            {/* Editable Content Sections (Admin only) */}
            {isEditing && user && user.role === "admin" && (
              <>
                <Typography 
                  variant="h6" 
                  sx={{
                    mt: 4,
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
                      <TextField
                        label="Subtitle (EN)"
                        value={section.subtitle_en || ""}
                        onChange={(e) => {
                          const updatedSections = [...editableData.contentSections];
                          updatedSections[index].subtitle_en = e.target.value;
                          setEditableData(prev => ({
                            ...prev,
                            contentSections: updatedSections
                          }));
                        }}
                        fullWidth
                        sx={{ mb: 2 }}
                        variant="standard"
                      />
                      <TextField
                        label="Subtitle (TA)"
                        value={section.subtitle_ta || ""}
                        onChange={(e) => {
                          const updatedSections = [...editableData.contentSections];
                          updatedSections[index].subtitle_ta = e.target.value;
                          setEditableData(prev => ({
                            ...prev,
                            contentSections: updatedSections
                          }));
                        }}
                        fullWidth
                        sx={{ mb: 2 }}
                        variant="standard"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="Content (EN)"
                        value={section.content_en || ""}
                        onChange={(e) => {
                          const updatedSections = [...editableData.contentSections];
                          updatedSections[index].content_en = e.target.value;
                          setEditableData(prev => ({
                            ...prev,
                            contentSections: updatedSections
                          }));
                        }}
                        fullWidth
                        multiline
                        rows={4}
                        variant="standard"
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        label="Content (TA)"
                        value={section.content_ta || ""}
                        onChange={(e) => {
                          const updatedSections = [...editableData.contentSections];
                          updatedSections[index].content_ta = e.target.value;
                          setEditableData(prev => ({
                            ...prev,
                            contentSections: updatedSections
                          }));
                        }}
                        fullWidth
                        multiline
                        rows={4}
                        variant="standard"
                        sx={{ mb: 2 }}
                      />
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
                      <TextField
                        label="Video Title (EN)"
                        value={section.videoTitle_en || ""}
                        onChange={(e) => {
                          const updatedSections = [...editableData.contentSections];
                          updatedSections[index].videoTitle_en = e.target.value;
                          setEditableData(prev => ({
                            ...prev,
                            contentSections: updatedSections
                          }));
                        }}
                        fullWidth
                        sx={{ mb: 2 }}
                        variant="standard"
                      />
                      <TextField
                        label="Video Title (TA)"
                        value={section.videoTitle_ta || ""}
                        onChange={(e) => {
                          const updatedSections = [...editableData.contentSections];
                          updatedSections[index].videoTitle_ta = e.target.value;
                          setEditableData(prev => ({
                            ...prev,
                            contentSections: updatedSections
                          }));
                        }}
                        fullWidth
                        sx={{ mb: 2 }}
                        variant="standard"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <TextField
                        label="Video Description (EN)"
                        value={section.videoDescription_en || ""}
                        onChange={(e) => {
                          const updatedSections = [...editableData.contentSections];
                          updatedSections[index].videoDescription_en = e.target.value;
                          setEditableData(prev => ({
                            ...prev,
                            contentSections: updatedSections
                          }));
                        }}
                        fullWidth
                        multiline
                        rows={3}
                        variant="standard"
                      />
                      <TextField
                        label="Video Description (TA)"
                        value={section.videoDescription_ta || ""}
                        onChange={(e) => {
                          const updatedSections = [...editableData.contentSections];
                          updatedSections[index].videoDescription_ta = e.target.value;
                          setEditableData(prev => ({
                            ...prev,
                            contentSections: updatedSections
                          }));
                        }}
                        fullWidth
                        multiline
                        rows={3}
                        variant="standard"
                      />
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
                width: "100%",
                maxWidth: 800,
                mx: "auto",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                pt: 2,
                borderTop: "1px solid #000",
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
                  Update Festival
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Like/Share row removed to match streamlined layout */}

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
        {/* Comments Header */}
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
          <Typography
            variant="h6"
            sx={{
              color: "#000",
              fontWeight: 700,
            }}
          >
            Comments ({comments.length})
          </Typography>
        </Box>

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
                                fontSize: "0.8rem",
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

      {/* Edit Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Festival</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Region"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                fullWidth
              />
              <TextField
                label="Season"
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                fullWidth
              />
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                fullWidth
              />
              <TextField
                label="Rituals"
                value={formData.rituals}
                onChange={(e) => setFormData({ ...formData, rituals: e.target.value })}
                fullWidth
              />
            </Box>
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />
            <TextField
              label="History"
              value={formData.history}
              onChange={(e) => setFormData({ ...formData, history: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Significance"
              value={formData.significance}
              onChange={(e) => setFormData({ ...formData, significance: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Image URL"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
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

export default FestivalDetail;





