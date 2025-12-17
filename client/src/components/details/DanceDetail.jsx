import React, { useState, useEffect, useRef } from "react";
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
  Tooltip,
  Tabs,
  Tab,
  Paper,
  Divider,
} from "@mui/material";
import {
  ArrowBack,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Close,
  Delete,
  Add,
  ThumbUp,
  ThumbUpOutlined,
  ThumbDown,
  Share,
  Send,
  Favorite,
  FavoriteBorder,
  Reply,
  SentimentSatisfied,
  EmojiEmotions,
} from "@mui/icons-material";
import MediaUpload from "../common/MediaUpload";
import { API_BASE_URL } from "../../utils/api";
import { useBilingualContent } from "../../utils/bilingualContent";
import MediaDisplay from "../common/MediaDisplay";

function DanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const getContent = useBilingualContent();
  const [dance, setDance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

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

  // Video player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);

  // Edit dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ta: "",
    style_en: "",
    style_ta: "",
    origin_en: "",
    origin_ta: "",
    period_en: "",
    period_ta: "",
    achievements_en: "",
    achievements_ta: "",
    description_en: "",
    description_ta: "",
    image: "",
    videoUrl: "",
    videoTitle_en: "",
    videoTitle_ta: "",
    videoDescription_en: "",
    videoDescription_ta: "",
  });

  // Add a new state for inline editing
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    name_en: "",
    name_ta: "",
    style_en: "",
    style_ta: "",
    origin_en: "",
    origin_ta: "",
    period_en: "",
    period_ta: "",
    achievements_en: "",
    achievements_ta: "",
    description_en: "",
    description_ta: "",
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

  // Function to open edit mode and initialize editableData
  const handleEditOpen = () => {
    if (dance) {
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
        name_en: toStr(dance.name),
        name_ta: toTa(dance.name),
        style_en: toStr(dance.style),
        style_ta: toTa(dance.style),
        origin_en: toStr(dance.origin),
        origin_ta: toTa(dance.origin),
        period_en: toStr(dance.period),
        period_ta: toTa(dance.period),
        achievements_en: toStr(dance.achievements),
        achievements_ta: toTa(dance.achievements),
        description_en: toStr(dance.description),
        description_ta: toTa(dance.description),
        imageUrl: dance.image || "",
        contentSections: (dance.contentSections || []).map(sec => ({
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

  // Emoji options
  const emojiOptions = [
    "❤️",
    "👍",
    "👎",
    "😊",
    "😍",
    "🤔",
    "👏",
    "🙏",
    "🔥",
    "💯",
  ];

  useEffect(() => {
    const initializeData = async () => {
      await fetchUser();
      await fetchDance();
    };
    initializeData();
  }, [id]);

  const fetchUser = async () => {
    try {
      console.log("Fetching user in DanceDetail...");
      const res = await fetch(
        `${API_BASE_URL}/auth/user`,
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

  const handleSave = async () => {
    try {
      const toBilingual = (en, ta) => {
        if (!en && !ta) return undefined;
        return { en: en || "", ta: ta || "" };
      };
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
        name: toBilingual(editableData.name_en, editableData.name_ta),
        style: toBilingual(editableData.style_en, editableData.style_ta),
        origin: toBilingual(editableData.origin_en, editableData.origin_ta),
        period: toBilingual(editableData.period_en, editableData.period_ta),
        achievements: toBilingual(editableData.achievements_en, editableData.achievements_ta),
        description: toBilingual(editableData.description_en, editableData.description_ta),
        image: editableData.imageUrl || "",
        contentSections: formattedContentSections
      };
      const res = await fetch(`/api/dance/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update dance");
      }
      alert("Dance details updated successfully!");
      await fetchDance();
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving dance details:", err);
      alert(`Failed to save details: ${err.message}`);
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
      setComments(data.comments || []);
      // Handle likes - ensure it"s an array and check if user liked
      const likesCount = data.likes || 0;
      setLikes(likesCount);
      setUserLiked(data.userLiked || false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    // Custom confirmation dialog with black and white styling
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this dance? This action cannot be undone."
    );

    if (confirmDelete) {
      try {
        const res = await fetch(`/api/dance/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to delete dance");
        }

        navigate("/explore/dance");
      } catch (err) {
        console.error("Error deleting dance:", err);
        alert(`Failed to delete dance: ${err.message}`);
      }
    }
  };

  // Like functionality
  const handleLike = async () => {
    if (!user) {
      alert("Please log in to like this article");
      return;
    }

    try {
      const res = await fetch(`/api/dance/${id}/like`, {
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
      alert("Failed to like the article");
    }
  };

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: dance.name,
          text: dance.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Comment functionality
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
      const res = await fetch(`/api/dance/${id}/comments`, {
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

  // Reply functionality
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
        `/api/dance/${id}/comments/${commentId}/replies`,
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

      // Update the specific comment in the comments array
      const updatedComments = comments.map((comment) =>
        comment._id === commentId ? data.comment : comment
      );

      setComments(updatedComments);
      setNewReply("");
      setReplyingTo(null);
    } catch (err) {
      console.error("Reply error:", err);
      alert("Failed to add reply");
    }
  };

  // Delete comment/reply functionality
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      let res;
      if (deleteType === "comment") {
        res = await fetch(
          `${API_BASE_URL}/api/dance/${id}/comments/${itemToDelete}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
      } else if (deleteType === "reply") {
        const [commentId, replyId] = itemToDelete.split("-");
        res = await fetch(
          `${API_BASE_URL}/api/dance/${id}/comments/${commentId}/replies/${replyId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
      }

      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        setDeleteType("");
      }
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  // Comment reaction functionality
  const handleCommentReaction = (commentId, emoji) => {
    if (!user) {
      alert("Please login to react to comments");
      return;
    }

    setCommentReactions((prev) => {
      const commentReactions = prev[commentId] || {};
      const userReaction = commentReactions[user._id];

      if (userReaction === emoji) {
        // Remove reaction
        const newCommentReactions = { ...commentReactions };
        delete newCommentReactions[user._id];
        return {
          ...prev,
          [commentId]: newCommentReactions,
        };
      } else {
        // Add/change reaction
        return {
          ...prev,
          [commentId]: {
            ...commentReactions,
            [user._id]: emoji,
          },
        };
      }
    });
  };

  const getReactionCount = (commentId, emoji) => {
    const reactions = commentReactions[commentId] || {};
    return Object.values(reactions).filter((r) => r === emoji).length;
  };

  const getUserReaction = (commentId) => {
    if (!user) return null;
    const reactions = commentReactions[commentId] || {};
    return reactions[user._id];
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
          width: "100%"
        }}
      >
        <IconButton onClick={() => navigate("/explore/dance")}>
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
          {getContent(dance.name)}
        </Typography>
        {user && user.role === "admin" && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                } else {
                  handleEditOpen();
                }
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
              title="Inline Edit"
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
          {(isEditing ? editableData.imageUrl : dance.image) ? (
            <img
              src={isEditing ? editableData.imageUrl : dance.image}
              alt={getContent(dance.name)}
              style={{
                maxWidth: "100%",
                maxHeight: 600,
                objectFit: "contain",
                padding: 16,
              }}
              onError={(e) => {
                e.target.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600' viewBox='0 0 1200 600'%3E%3Crect fill='%23cccccc' width='1200' height='600'%3E%3C/rect%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='100px' fill='%23333333'%3EImage Not Available%3C/text%3E%3C/svg%3E";
              }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "300px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#f5f5f5",
              }}
            >
              <Typography variant="h6" sx={{ color: "#666", mb: 1 }}>
                No Image Available
              </Typography>
              <Typography variant="body2" sx={{ color: "#999" }}>
                {dance.name} - {dance.style || "Dance"}
              </Typography>
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
          {/* Dynasty/Style and Period - Only show the box if there's content or in edit mode */}
          {(!isEditing && (dance.style || dance.period)) || isEditing ? (
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
                  {getContent(dance.style) && getContent(dance.style).trim() !== '' && (
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Style: {getContent(dance.style)}
                    </Typography>
                  )}
                  {getContent(dance.period) && getContent(dance.period).trim() !== '' && (
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                      }}
                    >
                      Period: {getContent(dance.period)}
                    </Typography>
                  )}
                </>
              ) : (
                <Box sx={{ display: "flex", width: "100%", gap: 2 }}>
                  <Box sx={{ display:'flex', flexDirection:'column', gap:1, width:'50%' }}>
                    <TextField label="Style (EN)" value={editableData.style_en} onChange={(e)=>setEditableData({ ...editableData, style_en: e.target.value })} fullWidth variant="standard" />
                    <TextField label="Style (TA)" value={editableData.style_ta} onChange={(e)=>setEditableData({ ...editableData, style_ta: e.target.value })} fullWidth variant="standard" />
                  </Box>
                  <Box sx={{ display:'flex', flexDirection:'column', gap:1, width:'50%' }}>
                    <TextField label="Period (EN)" value={editableData.period_en} onChange={(e)=>setEditableData({ ...editableData, period_en: e.target.value })} fullWidth variant="standard" />
                    <TextField label="Period (TA)" value={editableData.period_ta} onChange={(e)=>setEditableData({ ...editableData, period_ta: e.target.value })} fullWidth variant="standard" />
                  </Box>
                </Box>
              )}
            </Box>
          ) : null}

          {/* Achievements - Only show if there's content or in edit mode */}
          {(!isEditing && getContent(dance.achievements)) ? (
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
                Achievements
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                }}
              >
                {getContent(dance.achievements)}
              </Typography>
            </Box>
          ) : isEditing ? (
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
                Achievements
              </Typography>
              <TextField label="Achievements (EN)" value={editableData.achievements_en} onChange={(e)=>setEditableData({ ...editableData, achievements_en: e.target.value })} fullWidth multiline rows={3} variant="standard" sx={{ mb:1 }} />
              <TextField label="Achievements (TA)" value={editableData.achievements_ta} onChange={(e)=>setEditableData({ ...editableData, achievements_ta: e.target.value })} fullWidth multiline rows={3} variant="standard" />
            </Box>
          ) : null}

          {/* Description - Only show if there's content or in edit mode */}
          {(!isEditing && getContent(dance.description)) ? (
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
                {getContent(dance.description)}
              </Typography>
            </Box>
          ) : isEditing ? (
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
          ) : null}

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

          {/* Additional Content Sections */}
          <Box sx={{ mt: 4 }}>
            {isEditing && (
              <>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontWeight: 700,
                    borderBottom: '1px solid #000',
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

                    <Divider sx={{ my: 2 }} />

                    {/* Section Image */}
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 700,
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
                    />

                    {/* Section Image Upload */}
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        mt: 2,
                        fontWeight: 700,
                      }}
                    >
                      Section Image
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mb: 1, 
                        color: '#666',
                      }}
                    >
                      Upload files directly from your device (alternative to using links above)
                    </Typography>

                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        color: '#333'
                      }}
                    >
                      Upload Image from Device
                    </Typography>

                    <Typography 
                      variant="caption" 
                      sx={{ 
                        mb: 1, 
                        color: '#888',
                        display: 'block'
                      }}
                    >
                      Supported formats: JPG, PNG, GIF, WEBP (Max: 5MB)
                    </Typography>

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

                    <Divider sx={{ my: 2 }} />

                    {/* Section Video Details */}
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 700,
                      }}
                    >
                      Section Video Details
                    </Typography>
                    
                    <TextField
                      label="Video URL"
                      value={section.videoUrl}
                      onChange={(e) => {
                        const updatedSections = editableData.contentSections ? [...editableData.contentSections] : [];
                        if (updatedSections[index]) {
                          updatedSections[index].videoUrl = e.target.value;
                        }
                        setEditableData(prev => ({
                          ...prev,
                          contentSections: updatedSections
                        }));
                      }}
                      fullWidth
                      sx={{ mb: 2 }}
                      variant="standard"
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
              </>
            )}
            {!isEditing && dance.contentSections && dance.contentSections.length > 0 && (
              dance.contentSections.map((section, index) => {
                // Only render sections that have at least one piece of content
                const hasContent = getContent(section.subtitle) || getContent(section.content) || section.imageUrl || section.videoUrl;
                if (!hasContent) return null;
                
                return (
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
                    
                    {/* Section Video Details - Only show if either title or description exists */}
                    {(getContent(section.videoTitle) || getContent(section.videoDescription)) && (
                      <Box sx={{ mt: 2 }}>
                        {getContent(section.videoTitle) && getContent(section.videoTitle).trim() !== '' && (
                          <Typography 
                            variant="subtitle1" 
                            sx={{ fontWeight: 600 }}
                          >
                            {getContent(section.videoTitle)}
                          </Typography>
                        )}
                        
                        {getContent(section.videoDescription) && getContent(section.videoDescription).trim() !== '' && (
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
                );
              })
            )}
          </Box>
        </Box>
      </Box>

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
              onClick={handleSave}
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

      {/* Comments Section */}
      <Box
        sx={{
          mt: 4,
          width: "100%",
          maxWidth: 800,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          border: "1px solid #000",
          p: 2,
          backgroundColor: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        {/* Likes and Share Row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            pb: 1,
            borderBottom: "1px solid #000",
          }}
        >
          {/* Likes */}
          <Button
            startIcon={userLiked ? <ThumbUp /> : <ThumbUpOutlined />}
            onClick={handleLike}
            disabled={!user}
            sx={{
              color: "#000",
              textTransform: "uppercase",
              fontSize: "0.75rem",
              letterSpacing: 1,
              border: "1px solid #000",
              p: "4px 8px",
              minWidth: "auto",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.05)",
              },
              "&.Mui-disabled": {
                color: "#ccc",
                borderColor: "#ccc",
              },
            }}
          >
            {likes} Likes
          </Button>

          {/* Share */}
          <Tooltip title="Share this article">
            <IconButton
              onClick={() => {
                if (navigator.share) {
                  navigator
                    .share({
                      title: `Learn about ${dance?.name || "this dance"}`,
                      text: `Check out this fascinating article about ${
                        dance?.name || "this dance"
                      }`,
                      url: window.location.href,
                    })
                    .catch(console.error);
                } else {
                  navigator.clipboard
                    .writeText(window.location.href)
                    .then(() => alert("Link copied to clipboard"))
                    .catch((err) => console.error("Failed to copy: ", err));
                }
              }}
              sx={{
                color: "#000",
                border: "1px solid #000",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(0,0,0,0.05)",
                  transform: "scale(1.1)",
                },
              }}
            >
              <Share />
            </IconButton>
          </Tooltip>
        </Box>

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
          {comments.length === 0 ? (
            <Typography 
              variant="body2" 
              sx={{ 
                textAlign: 'center', 
                py: 2,
                color: '#666',
                fontStyle: 'italic',
                fontFamily: "'Open Sans', sans-serif"
              }}
            >
              No comments yet. Be the first to comment!
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {comments.map((comment) => (
                <Box 
                  key={comment._id} 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: 1,
                    border: '1px solid #eee',
                    borderRadius: 2,
                    p: 2,
                    position: 'relative'
                  }}
                >
                  {/* Main Comment */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ 
                        fontFamily: "'Montserrat', sans-serif", 
                        fontWeight: 700, 
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        color: '#333',
                        letterSpacing: 0.5
                      }}
                    >
                      {comment.user?.displayName || 'Anonymous'}
                    </Typography>
                    <Typography 
                      variant="caption"
                      sx={{ 
                        fontFamily: "'Roboto', sans-serif",
                        color: '#666',
                        fontSize: '0.625rem',
                        fontStyle: 'italic'
                      }}
                    >
                      {new Date(comment.createdAt).toLocaleString()}
                    </Typography>
                  </Box>

                  {/* Comment Content */}
                  <Typography
                    variant="body2"
                    sx={{ mb: 2, color: "#333", lineHeight: 1.6 }}
                  >
                    {comment.content}
                  </Typography>

                  {/* Comment Actions */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    {/* Emoji Reactions */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {emojiOptions.map((emoji) => {
                        const count = getReactionCount(comment._id, emoji);
                        const userReaction = getUserReaction(comment._id);
                        return count > 0 ? (
                          <Tooltip key={emoji} title={`${count} ${emoji}`}>
                            <Chip
                              label={`${emoji} ${count}`}
                              size="small"
                              sx={{
                                bgcolor:
                                  userReaction === emoji
                                    ? "#e3f2fd"
                                    : "#f5f5f5",
                                cursor: "pointer",
                                "&:hover": { bgcolor: "#e3f2fd" },
                              }}
                              onClick={() =>
                                handleCommentReaction(comment._id, emoji)
                              }
                            />
                          </Tooltip>
                        ) : null;
                      })}
                    </Box>

                    {/* Emoji Picker */}
                    <Button
                      onClick={() =>
                        setEmojiPickerOpen((prev) => ({
                          ...prev,
                          [comment._id]: !prev[comment._id],
                        }))
                      }
                      sx={{
                        minWidth: "auto",
                        p: 0.5,
                        color: "#666",
                        "&:hover": {
                          bgcolor: "rgba(0,0,0,0.05)",
                        },
                      }}
                    >
                      <EmojiEmotions sx={{ fontSize: "1.2rem" }} />
                    </Button>

                    {/* Reply Button */}
                    {user && (
                      <Button
                        onClick={() =>
                          setReplyingTo(
                            replyingTo === comment._id ? null : comment._id
                          )
                        }
                        startIcon={<Reply />}
                        sx={{
                          color: "#666",
                          fontSize: "0.875rem",
                          textTransform: "none",
                          "&:hover": {
                            bgcolor: "rgba(0,0,0,0.05)",
                          },
                        }}
                      >
                        Reply
                      </Button>
                    )}
                  </Box>

                  {/* Emoji Picker Dropdown */}
                  {emojiPickerOpen[comment._id] && (
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        mb: 2,
                        p: 1,
                        bgcolor: "#fff",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        flexWrap: "wrap",
                      }}
                    >
                      {emojiOptions.map((emoji) => (
                        <Button
                          key={emoji}
                          onClick={() => {
                            handleCommentReaction(comment._id, emoji);
                            setEmojiPickerOpen((prev) => ({
                              ...prev,
                              [comment._id]: false,
                            }));
                          }}
                          sx={{
                            minWidth: "auto",
                            p: 0.5,
                            fontSize: "1.2rem",
                            "&:hover": {
                              bgcolor: "rgba(0,0,0,0.05)",
                            },
                          }}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </Box>
                  )}

                  {/* Reply Input */}
                  {replyingTo === comment._id && user && (
                    <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                      <TextField
                        fullWidth
                        placeholder="Write a reply..."
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        multiline
                        rows={2}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            "& fieldset": {
                              borderColor: "#ddd",
                            },
                            "&:hover fieldset": {
                              borderColor: "#000",
                            },
                          },
                        }}
                      />
                      <Button
                        onClick={() => handleAddReply(comment._id)}
                        variant="contained"
                        sx={{
                          bgcolor: "#000",
                          color: "#fff",
                          borderRadius: "12px",
                          px: 2,
                          "&:hover": {
                            bgcolor: "#333",
                          },
                        }}
                      >
                        <Send />
                      </Button>
                    </Box>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <Box sx={{ mt: 2, pl: 3, borderLeft: "2px solid #e9ecef" }}>
                      {comment.replies.map((reply) => (
                        <Box
                          key={reply._id}
                          sx={{
                            bgcolor: "#fff",
                            borderRadius: "8px",
                            p: 2,
                            mb: 2,
                            border: "1px solid #f0f0f0",
                          }}
                        >
                          {/* Reply Header */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              mb: 1,
                            }}
                          >
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 600,
                                  color: "#000",
                                  fontSize: "0.875rem",
                                }}
                              >
                                {reply.user?.displayName || "Anonymous"}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: "#666", fontSize: "0.75rem" }}
                              >
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                            {user?.role === "admin" && (
                              <IconButton
                                onClick={() => {
                                  setItemToDelete(
                                    `${comment._id}-${reply._id}`
                                  );
                                  setDeleteType("reply");
                                  setDeleteDialogOpen(true);
                                }}
                                size="small"
                                sx={{ color: "#000" }}
                              >
                                <Delete />
                              </IconButton>
                            )}
                          </Box>

                          {/* Reply Content */}
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#333",
                              lineHeight: 1.5,
                              fontSize: "0.875rem",
                            }}
                          >
                            {reply.content}
                          </Typography>

                          {/* Reply Reactions */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mt: 1,
                            }}
                          >
                            {emojiOptions.map((emoji) => {
                              const count = getReactionCount(
                                `${comment._id}-${reply._id}`,
                                emoji
                              );
                              const userReaction = getUserReaction(
                                `${comment._id}-${reply._id}`
                              );
                              return count > 0 ? (
                                <Tooltip
                                  key={emoji}
                                  title={`${count} ${emoji}`}
                                >
                                  <Chip
                                    label={`${emoji} ${count}`}
                                    size="small"
                                    sx={{
                                      bgcolor:
                                        userReaction === emoji
                                          ? "#e3f2fd"
                                          : "#f5f5f5",
                                      cursor: "pointer",
                                      fontSize: "0.75rem",
                                      "&:hover": { bgcolor: "#e3f2fd" },
                                    }}
                                    onClick={() =>
                                      handleCommentReaction(
                                        `${comment._id}-${reply._id}`,
                                        emoji
                                      )
                                    }
                                  />
                                </Tooltip>
                              ) : null;
                            })}

                            {/* Reply Emoji Picker */}
                            <Button
                              onClick={() =>
                                setEmojiPickerOpen((prev) => ({
                                  ...prev,
                                  [`${comment._id}-${reply._id}`]:
                                    !prev[`${comment._id}-${reply._id}`],
                                }))
                              }
                              sx={{
                                minWidth: "auto",
                                p: 0.25,
                                color: "#666",
                                "&:hover": {
                                  bgcolor: "rgba(0,0,0,0.05)",
                                },
                              }}
                            >
                              <EmojiEmotions sx={{ fontSize: "1rem" }} />
                            </Button>
                          </Box>

                          {/* Reply Emoji Picker Dropdown */}
                          {emojiPickerOpen[`${comment._id}-${reply._id}`] && (
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                mt: 1,
                                p: 1,
                                bgcolor: "#f8f9fa",
                                borderRadius: "6px",
                                border: "1px solid #e9ecef",
                                flexWrap: "wrap",
                              }}
                            >
                              {emojiOptions.map((emoji) => (
                                <Button
                                  key={emoji}
                                  onClick={() => {
                                    handleCommentReaction(
                                      `${comment._id}-${reply._id}`,
                                      emoji
                                    );
                                    setEmojiPickerOpen((prev) => ({
                                      ...prev,
                                      [`${comment._id}-${reply._id}`]: false,
                                    }));
                                  }}
                                  sx={{
                                    minWidth: "auto",
                                    p: 0.25,
                                    fontSize: "1rem",
                                    "&:hover": {
                                      bgcolor: "rgba(0,0,0,0.05)",
                                    },
                                  }}
                                >
                                  {emoji}
                                </Button>
                              ))}
                            </Box>
                          )}
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
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: 0,
              border: '2px solid #000',
            }
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: '#000', 
              color: '#fff', 
              textAlign: 'center',
              fontWeight: 700 
            }}
          >
            Confirm Delete
          </DialogTitle>
          <DialogContent sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to delete this {deleteType}?
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions
            sx={{ 
              p: 2, 
              justifyContent: 'center',
              gap: 2,
              bgcolor: '#f0f0f0' 
            }}
          >
            <Button 
              onClick={() => setDeleteDialogOpen(false)}
              sx={{ 
                color: '#000',
                border: '1px solid #000',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.05)'
                }
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteItem}
              variant="contained"
              sx={{
                bgcolor: '#000',
                color: '#fff',
                '&:hover': { 
                  bgcolor: '#333'
                }
              }}
            >
              Delete {deleteType === 'comment' ? 'Comment' : 'Reply'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default DanceDetail;






