import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  Button,
  Container,
  IconButton
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
  EditNote,
} from "@mui/icons-material";
import MediaUpload from "../common/MediaUpload";

import { useBilingualContent } from "../../utils/bilingualContent";
function KingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const getContent = useBilingualContent();
  const [king, setKing] = useState(null);
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
  const [deleteType, setDeleteType] = useState(''); // 'comment' or 'reply'
  
  // Comment reactions states
  const [commentReactions, setCommentReactions] = useState({});
  const [emojiPickerOpen, setEmojiPickerOpen] = useState({});

  // Video player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);

  // Edit dialog states
  const [editOpen, setEditOpen] = useState(false);
  // Update form data state to include video details (bilingual)
  const [formData, setFormData] = useState({
    name_en: "",
    name_ta: "",
    dynasty_en: "",
    dynasty_ta: "",
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
  // Update state to include content sections (bilingual)
  const [editableData, setEditableData] = useState({
    name_en: "",
    name_ta: "",
    dynasty_en: "",
    dynasty_ta: "",
    period_en: "",
    period_ta: "",
    achievements_en: "",
    achievements_ta: "",
    description_en: "",
    description_ta: "",
    capital_en: "",
    capital_ta: "",
    content_en: "",
    content_ta: "",
    image: "",
    contentSections: [], // bilingual sections
  });

  // Function to add a new content section (bilingual)
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

  // Update handleEditOpen to include content sections (bilingual)
  const handleEditOpen = () => {
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
      name_en: toStr(king.name),
      name_ta: toTa(king.name),
      dynasty_en: toStr(king.dynasty),
      dynasty_ta: toTa(king.dynasty),
      period_en: toStr(king.period),
      period_ta: toTa(king.period),
      achievements_en: toStr(king.achievements),
      achievements_ta: toTa(king.achievements),
      description_en: toStr(king.description),
      description_ta: toTa(king.description),
      capital_en: toStr(king.capital),
      capital_ta: toTa(king.capital),
      content_en: toStr(king.content),
      content_ta: toTa(king.content),
      image: king.image || "",
      contentSections: (king.contentSections || []).map(sec => ({
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
    setIsEditing(true);
  };

  // Open dialog editor: populate bilingual formData from king and open dialog
  const openDialogEdit = () => {
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
    setFormData({
      name_en: toStr(king?.name),
      name_ta: toTa(king?.name),
      dynasty_en: toStr(king?.dynasty),
      dynasty_ta: toTa(king?.dynasty),
      period_en: toStr(king?.period),
      period_ta: toTa(king?.period),
      achievements_en: toStr(king?.achievements),
      achievements_ta: toTa(king?.achievements),
      description_en: toStr(king?.description),
      description_ta: toTa(king?.description),
      image: king?.image || "",
      videoUrl: king?.videoUrl || "",
      videoTitle_en: toStr(king?.videoTitle),
      videoTitle_ta: toTa(king?.videoTitle),
      videoDescription_en: toStr(king?.videoDescription),
      videoDescription_ta: toTa(king?.videoDescription),
    });
    setEditOpen(true);
  };

  useEffect(() => {
    fetchUser();
    fetchKing();

    // Load YouTube API script
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Cleanup function
    return () => {
      // Remove the script if needed
      if (tag.parentNode) {
        tag.parentNode.removeChild(tag);
      }
    };
  }, [id]);

  const fetchUser = async () => {
    try {
      console.log("Fetching user in KingDetail...");
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL || "http://localhost:5000"}/auth/user`, { 
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      });
      
      console.log("User fetch response status:", res.status);
      
      // Check if the response is JSON
      const contentType = res.headers.get("content-type");
      console.log("Content-Type:", contentType);
      
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Received non-JSON response:", await res.text());
        setUser(null);
        return;
      }

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

  const fetchKing = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/kings/${id}`);
      if (!res.ok) {
        throw new Error("King not found");
      }
      const data = await res.json();
      setKing(data);
      setComments(data.comments || []);
      // Handle likes - ensure it's an array and check if user liked
      const likesArray = Array.isArray(data.likes) ? data.likes : [];
      setLikes(likesArray.length);
      setUserLiked(likesArray.some(likeId => likeId.toString() === user?._id?.toString()) || false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add like functionality
  const handleLike = async () => {
    if (!user) {
      alert("Please log in to like this article");
      return;
    }

    try {
      const res = await fetch(`/api/kings/${id}/like`, {
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
      alert("Failed to like the article");
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
      const res = await fetch(`/api/kings/${id}/comments`, {
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
      const res = await fetch(`/api/kings/${id}/comments/${commentId}/replies`, {
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
      
      // Update the specific comment in the comments array
      const updatedComments = comments.map(comment => 
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

  // Delete comment functionality (admin only)
  const handleDeleteComment = async (commentId) => {
    if (!user || user.role !== "admin") {
      alert("Only admins can delete comments");
      return;
    }

    // Set up delete confirmation
    setItemToDelete(commentId);
    setDeleteType('comment');
    setDeleteDialogOpen(true);
  };

  // Confirm delete comment
  const confirmDeleteComment = async () => {
    try {
      const res = await fetch(`/api/kings/${id}/comments/${itemToDelete}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        throw new Error("Failed to delete comment");
      }

      // Remove the deleted comment from the local state
      const updatedComments = comments.filter(comment => comment._id !== itemToDelete);
      setComments(updatedComments);
      
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setDeleteType('');
    } catch (err) {
      console.error("Delete comment error:", err);
      alert("Failed to delete comment");
    }
  };

  // Delete reply functionality (admin only)
  const handleDeleteReply = async (commentId, replyId) => {
    if (!user || user.role !== "admin") {
      alert("Only admins can delete replies");
      return;
    }

    // Set up delete confirmation
    setItemToDelete({ commentId, replyId });
    setDeleteType('reply');
    setDeleteDialogOpen(true);
  };

  // Confirm delete reply
  const confirmDeleteReply = async () => {
    try {
      const { commentId, replyId } = itemToDelete;
      const res = await fetch(`/api/kings/${id}/comments/${commentId}/replies/${replyId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
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
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setDeleteType('');
    } catch (err) {
      console.error("Delete reply error:", err);
      alert("Failed to delete reply");
    }
  };

  // Handle comment reactions
  const handleCommentReaction = (commentId, reactionType) => {
    if (!user) {
      alert("Please log in to react to comments");
      return;
    }

    setCommentReactions(prev => {
      const current = prev[commentId] || {};
      const userReaction = current[user._id];
      
      if (userReaction === reactionType) {
        // Remove reaction if same type clicked
        const newReactions = { ...current };
        delete newReactions[user._id];
        return { ...prev, [commentId]: newReactions };
      } else {
        // Add/change reaction
        return {
          ...prev,
          [commentId]: {
            ...current,
            [user._id]: reactionType
          }
        };
      }
    });
  };

  // Get reaction count for a comment
  const getReactionCount = (commentId, reactionType) => {
    const reactions = commentReactions[commentId] || {};
    return Object.values(reactions).filter(type => type === reactionType).length;
  };

  // Check if user has reacted to a comment
  const getUserReaction = (commentId) => {
    if (!user) return null;
    const reactions = commentReactions[commentId] || {};
    return reactions[user._id] || null;
  };

  // Toggle emoji picker for a comment
  const toggleEmojiPicker = (commentId) => {
    setEmojiPickerOpen(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // Handle emoji selection
  const handleEmojiSelect = (commentId, emojiType) => {
    handleCommentReaction(commentId, emojiType);
    setEmojiPickerOpen(prev => ({
      ...prev,
      [commentId]: false
    }));
  };

  // Emoji data with colors
  const emojiData = [
    { type: 'hundred', emoji: '100', color: '#4caf50', label: 'Perfect' },
    { type: 'heart', emoji: '❤️', color: '#e91e63', label: 'Love' },
    { type: 'smiley', emoji: '😊', color: '#ff9800', label: 'Happy' },
    { type: 'laugh', emoji: '😂', color: '#ffc107', label: 'Laugh' },
    { type: 'wow', emoji: '😮', color: '#9c27b0', label: 'Wow' },
    { type: 'sad', emoji: '😢', color: '#607d8b', label: 'Sad' },
    { type: 'angry', emoji: '😠', color: '#ff5722', label: 'Angry' },
    { type: 'like', emoji: '👍', color: '#1976d2', label: 'Like' },
    { type: 'dislike', emoji: '👎', color: '#f44336', label: 'Dislike' },
    { type: 'fire', emoji: '🔥', color: '#ff6f00', label: 'Fire' },
    { type: 'clap', emoji: '👏', color: '#795548', label: 'Clap' },
    { type: 'star', emoji: '⭐', color: '#ffd700', label: 'Star' }
  ];

  // Update handleInlineSave to include content sections (bilingual)
  const handleInlineSave = async () => {
    try {
      // Build bilingual objects from paired EN/TA fields
      const toBilingual = (en, ta) => {
        if (!en && !ta) return undefined;
        return { en: en || "", ta: ta || "" };
      };
      
      // Process content sections to bilingual format
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
      
      const res = await fetch(`/api/kings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: toBilingual(editableData.name_en, editableData.name_ta),
          dynasty: toBilingual(editableData.dynasty_en, editableData.dynasty_ta),
          period: toBilingual(editableData.period_en, editableData.period_ta),
          capital: toBilingual(editableData.capital_en, editableData.capital_ta),
          achievements: toBilingual(editableData.achievements_en, editableData.achievements_ta),
          description: toBilingual(editableData.description_en, editableData.description_ta),
          content: toBilingual(editableData.content_en, editableData.content_ta),
          image: editableData.image,
          contentSections: formattedContentSections,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update king");
      }
      
      // Refresh the king data
      await fetchKing();
      
      // Exit editing mode
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving king details:", err);
      alert(`Failed to save details: ${err.message}`);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const toBilingual = (en, ta) => {
        if (!en && !ta) return undefined;
        return { en: en || "", ta: ta || "" };
      };
      const res = await fetch(`/api/kings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: toBilingual(formData.name_en, formData.name_ta),
          dynasty: toBilingual(formData.dynasty_en, formData.dynasty_ta),
          period: toBilingual(formData.period_en, formData.period_ta),
          achievements: toBilingual(formData.achievements_en, formData.achievements_ta),
          description: toBilingual(formData.description_en, formData.description_ta),
          image: formData.image,
          videoUrl: formData.videoUrl,
          videoTitle: toBilingual(formData.videoTitle_en, formData.videoTitle_ta),
          videoDescription: toBilingual(formData.videoDescription_en, formData.videoDescription_ta),
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update king");
      }
      
      setEditOpen(false);
      fetchKing();
    } catch (err) {
      console.error("Error saving king details:", err);
      alert(`Failed to save details: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    // Custom confirmation dialog with black and white styling
    const confirmDelete = window.confirm("Are you sure you want to delete this king? This action cannot be undone.");
    
    if (confirmDelete) {
      try {
        const res = await fetch(`/api/kings/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to delete king");
        }
        
        // Navigate back to kings list after successful deletion
        navigate("/explore/kings");
      } catch (err) {
        // Display error message
        console.error("Delete error:", err);
        alert(`Error: ${err.message}`);
      }
    }
  };

  // Video player controls
  const togglePlay = () => {
    if (videoRef.current) {
      const iframe = videoRef.current;
      const player = new window.YT.Player(iframe);
      
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const iframe = videoRef.current;
      const player = new window.YT.Player(iframe);
      
      if (isMuted) {
        player.unMute();
      } else {
        player.mute();
      }
      setIsMuted(!isMuted);
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
            மன்னர்கள் பட்டியலுக்கு திரும்பு | Back to Kings
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
            மன்னர்கள் பட்டியலுக்கு திரும்பு | Back to Kings
          </Button>
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
        <IconButton onClick={() => navigate("/explore/kings")}>
          <ArrowBack />
        </IconButton>
        
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            textTransform: 'uppercase',
            textAlign: 'center',
            flex: 1,
            mx: 2 
          }}
        >
          {getContent(king.name)}
        </Typography>

        {/* Admin Actions */}
        {user && user.role === "admin" && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              onClick={() => {
                // Prepare editable data when edit is clicked (bilingual)
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
                  name_en: toStr(king.name),
                  name_ta: toTa(king.name),
                  dynasty_en: toStr(king.dynasty),
                  dynasty_ta: toTa(king.dynasty),
                  period_en: toStr(king.period),
                  period_ta: toTa(king.period),
                  achievements_en: toStr(king.achievements),
                  achievements_ta: toTa(king.achievements),
                  description_en: toStr(king.description),
                  description_ta: toTa(king.description),
                  capital_en: toStr(king.capital),
                  capital_ta: toTa(king.capital),
                  content_en: toStr(king.content),
                  content_ta: toTa(king.content),
                  image: king.image || "",
                  contentSections: (king.contentSections || []).map(sec => ({
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
            <Tooltip title="Open dialog editor">
              <IconButton
                onClick={openDialogEdit}
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
                <EditNote />
              </IconButton>
            </Tooltip>
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
          gap: 4,
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
          {/* Dynasty and Period */}
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
            {getContent(king.dynasty) && (
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 700, 
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    குல வரிசை | Dynasty: {getContent(king.dynasty)}
                  </Typography>
            )}
            {getContent(king.period) && (
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 700, 
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    காலம் | Period: {getContent(king.period)}
                  </Typography>
                )}
              </>
            ) : (
              <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                <Box sx={{ display:'flex', flexDirection:'column', gap:1, width:'50%' }}>
                  <TextField label="Dynasty (EN)" value={editableData.dynasty_en} onChange={(e)=>setEditableData({ ...editableData, dynasty_en: e.target.value })} fullWidth variant="standard" />
                  <TextField label="Dynasty (TA)" value={editableData.dynasty_ta} onChange={(e)=>setEditableData({ ...editableData, dynasty_ta: e.target.value })} fullWidth variant="standard" />
                </Box>
                <Box sx={{ display:'flex', flexDirection:'column', gap:1, width:'50%' }}>
                  <TextField label="Period (EN)" value={editableData.period_en} onChange={(e)=>setEditableData({ ...editableData, period_en: e.target.value })} fullWidth variant="standard" />
                  <TextField label="Period (TA)" value={editableData.period_ta} onChange={(e)=>setEditableData({ ...editableData, period_ta: e.target.value })} fullWidth variant="standard" />
                </Box>
              </Box>
            )}
          </Box>

          {/* Achievements - Only show if there's content or in edit mode */}
          {(!isEditing && king.achievements && getContent(king.achievements).trim() !== '') || isEditing ? (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                borderBottom: '1px solid #000',
                pb: 2,
              }}
            >
            {!isEditing ? (
              king.achievements && (
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 700, 
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  சிறப்புகள் | Achievements: {getContent(king.achievements)}
                </Typography>
              )
            ) : (
              <Box sx={{ display:'flex', flexDirection:'column', width:'100%', gap:1 }}>
                <TextField label="Achievements (EN)" value={editableData.achievements_en} onChange={(e)=>setEditableData({ ...editableData, achievements_en: e.target.value })} fullWidth variant="standard" />
                <TextField label="Achievements (TA)" value={editableData.achievements_ta} onChange={(e)=>setEditableData({ ...editableData, achievements_ta: e.target.value })} fullWidth variant="standard" />
              </Box>
            )}
            </Box>
          ) : null}

          {/* Capital - Only show if there's content or in edit mode */}
          {(!isEditing && king.capital && getContent(king.capital).trim() !== '') || isEditing ? (
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                borderBottom: '1px solid #000',
                pb: 2,
              }}
            >
            {!isEditing ? (
              king.capital && (
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 700, 
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  அரச மையம் | Capital: {getContent(king.capital)}
                </Typography>
              )
            ) : (
              <Box sx={{ display:'flex', flexDirection:'column', width:'100%', gap:1 }}>
                <TextField label="Capital (EN)" value={editableData.capital_en} onChange={(e)=>setEditableData({ ...editableData, capital_en: e.target.value })} fullWidth variant="standard" />
                <TextField label="Capital (TA)" value={editableData.capital_ta} onChange={(e)=>setEditableData({ ...editableData, capital_ta: e.target.value })} fullWidth variant="standard" />
              </Box>
            )}
            </Box>
          ) : null}

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
                விளக்கம் | Description
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                }}
              >
                {getContent(king.description)}
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
                விளக்கம் | Description
              </Typography>
              <TextField label="Description (EN)" value={editableData.description_en} onChange={(e)=>setEditableData({ ...editableData, description_en: e.target.value })} fullWidth multiline rows={3} variant="standard" sx={{ mb:1 }} />
              <TextField label="Description (TA)" value={editableData.description_ta} onChange={(e)=>setEditableData({ ...editableData, description_ta: e.target.value })} fullWidth multiline rows={3} variant="standard" />
            </Box>
          )}

          {/* Content - Additional field */}
          {(!isEditing && king.content && getContent(king.content).trim() !== '') || isEditing ? (
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
                  கூடுதல் தகவல் | Additional Information
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                  }}
                >
                  {getContent(king.content)}
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
                  கூடுதல் தகவல் | Additional Information
                </Typography>
                <TextField label="Content (EN)" value={editableData.content_en} onChange={(e)=>setEditableData({ ...editableData, content_en: e.target.value })} fullWidth multiline rows={3} variant="standard" sx={{ mb:1 }} />
                <TextField label="Content (TA)" value={editableData.content_ta} onChange={(e)=>setEditableData({ ...editableData, content_ta: e.target.value })} fullWidth multiline rows={3} variant="standard" />
              </Box>
            )
          ) : null}

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
                படம் | Image
              </Typography>
              <TextField
                label="Image URL"
                value={editableData.image}
                onChange={(e) => setEditableData(prev => ({ ...prev, image: e.target.value }))}
                fullWidth
                variant="standard"
                sx={{ mb: 2 }}
              />
              <MediaUpload
                label="Upload Main Image"
                currentImage={editableData.image}
                onImageChange={(imageUrl) => setEditableData(prev => ({ ...prev, image: imageUrl }))}
              />
              </Box>
            )}
          {/* Content Sections (Bilingual View) */}
          {!isEditing && king.contentSections && king.contentSections.length > 0 && (
            king.contentSections.map((section, index) => (
              <Box key={section.id || `content-section-${index}`} sx={{ mt: 4 }}>
                {getContent(section.subtitle) && (
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {getContent(section.subtitle)}
                  </Typography>
                )}
                {getContent(section.content) && (
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {getContent(section.content)}
                  </Typography>
                )}
                {section.imageUrl && (
                  <img
                    src={section.imageUrl}
                    alt={getContent(section.subtitle) || `Section ${index + 1} Image`}
                    style={{ maxWidth: '100%', height: 'auto', marginTop: 16 }}
                  />
                )}
                {section.videoUrl && (
                  <iframe
                    src={`https://www.youtube.com/embed/${section.videoUrl.split('v=')[1] || section.videoUrl.split('/').pop()}`}
                    title={getContent(section.videoTitle) || `Section ${index + 1} Video`}
                    style={{ width: '100%', height: 'auto', aspectRatio: '16/9', marginTop: 16 }}
                    allowFullScreen
                  />
                )}
                {(getContent(section.videoTitle) || getContent(section.videoDescription)) && (
                  <Box sx={{ mt: 2 }}>
                    {getContent(section.videoTitle) && (
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {getContent(section.videoTitle)}
                      </Typography>
                    )}
                    {getContent(section.videoDescription) && (
                      <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                        {getContent(section.videoDescription)}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            ))
          )}

          {/* Editable Content Sections (Bilingual Editing) */}
          {isEditing && user && user.role === 'admin' && (
            <Box sx={{ mt: 4 }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: 700, borderBottom: '2px solid #000', pb: 1 }}
              >
                கூடுதல் பகுதிகள் | Additional Content Sections
              </Typography>
              {editableData.contentSections.map((section, index) => (
                <Box
                  key={section.id || `editable-section-${index}`}
                  sx={{ mb: 3, p: 2, border: '1px solid #000', position: 'relative' }}
                >
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <TextField
                      label="Subtitle (EN)"
                      value={section.subtitle_en}
                      onChange={(e) => {
                        const updated = [...editableData.contentSections];
                        updated[index].subtitle_en = e.target.value;
                        setEditableData(prev => ({ ...prev, contentSections: updated }));
                      }}
                      fullWidth
                      variant="standard"
                    />
                    <TextField
                      label="Subtitle (TA)"
                      value={section.subtitle_ta}
                      onChange={(e) => {
                        const updated = [...editableData.contentSections];
                        updated[index].subtitle_ta = e.target.value;
                        setEditableData(prev => ({ ...prev, contentSections: updated }));
                      }}
                      fullWidth
                      variant="standard"
                    />
                  </Box>
                  <TextField
                    label="Content (EN)"
                    value={section.content_en}
                    onChange={(e) => {
                      const updated = [...editableData.contentSections];
                      updated[index].content_en = e.target.value;
                      setEditableData(prev => ({ ...prev, contentSections: updated }));
                    }}
                    fullWidth
                    multiline
                    rows={3}
                    variant="standard"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Content (TA)"
                    value={section.content_ta}
                    onChange={(e) => {
                      const updated = [...editableData.contentSections];
                      updated[index].content_ta = e.target.value;
                      setEditableData(prev => ({ ...prev, contentSections: updated }));
                    }}
                    fullWidth
                    multiline
                    rows={3}
                    variant="standard"
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 700, borderBottom: '1px solid #000', pb: 1 }}>
                    பகுதி படம் | Section Image
                  </Typography>
                  <TextField
                    label="Image URL"
                    value={section.imageUrl}
                    onChange={(e) => {
                      const updated = [...editableData.contentSections];
                      updated[index].imageUrl = e.target.value;
                      setEditableData(prev => ({ ...prev, contentSections: updated }));
                    }}
                    fullWidth
                    variant="standard"
                    sx={{ mb: 2 }}
                  />
                  <MediaUpload
                    label="Upload Section Image"
                    currentImage={section.imageUrl}
                    currentImageLink={section.imageLink}
                    onImageChange={(imageUrl) => {
                      const updated = [...editableData.contentSections];
                      updated[index].imageUrl = imageUrl;
                      setEditableData(prev => ({ ...prev, contentSections: updated }));
                    }}
                    onImageLinkChange={(imageLink) => {
                      const updated = [...editableData.contentSections];
                      updated[index].imageLink = imageLink;
                      setEditableData(prev => ({ ...prev, contentSections: updated }));
                    }}
                  />
                  {section.imageUrl && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', border: '1px solid #ddd', borderRadius: 1, p: 2 }}>
                      <img
                        src={section.imageUrl}
                        alt="Preview"
                        style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600' viewBox='0 0 1200 600'%3E%3Crect fill='%23cccccc' width='1200' height='600'%3E%3C/rect%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='100px' fill='%23333333'%3EImage Not Available%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </Box>
                  )}
                  <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 700, borderBottom: '1px solid #000', pb: 1 }}>
                    பகுதி காணொலி விவரம் | Section Video Details
                  </Typography>
                  <TextField
                    label="Video URL"
                    value={section.videoUrl}
                    onChange={(e) => {
                      const updated = [...editableData.contentSections];
                      updated[index].videoUrl = e.target.value;
                      setEditableData(prev => ({ ...prev, contentSections: updated }));
                    }}
                    fullWidth
                    variant="standard"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Video Title (EN)"
                    value={section.videoTitle_en}
                    onChange={(e) => {
                      const updated = [...editableData.contentSections];
                      updated[index].videoTitle_en = e.target.value;
                      setEditableData(prev => ({ ...prev, contentSections: updated }));
                    }}
                    fullWidth
                    variant="standard"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Video Title (TA)"
                    value={section.videoTitle_ta}
                    onChange={(e) => {
                      const updated = [...editableData.contentSections];
                      updated[index].videoTitle_ta = e.target.value;
                      setEditableData(prev => ({ ...prev, contentSections: updated }));
                    }}
                    fullWidth
                    variant="standard"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Video Description (EN)"
                    value={section.videoDescription_en}
                    onChange={(e) => {
                      const updated = [...editableData.contentSections];
                      updated[index].videoDescription_en = e.target.value;
                      setEditableData(prev => ({ ...prev, contentSections: updated }));
                    }}
                    fullWidth
                    multiline
                    rows={3}
                    variant="standard"
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Video Description (TA)"
                    value={section.videoDescription_ta}
                    onChange={(e) => {
                      const updated = [...editableData.contentSections];
                      updated[index].videoDescription_ta = e.target.value;
                      setEditableData(prev => ({ ...prev, contentSections: updated }));
                    }}
                    fullWidth
                    multiline
                    rows={3}
                    variant="standard"
                    sx={{ mb: 2 }}
                  />
                  <IconButton
                    onClick={() => removeContentSection(section.id)}
                    sx={{ position: 'absolute', top: 0, right: 0, color: '#000' }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
              <Button
                onClick={addContentSection}
                variant="outlined"
                startIcon={<Add />}
                sx={{ color: '#000', borderColor: '#000', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}
              >
                Add Content Section
              </Button>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                <Button
                  onClick={() => setIsEditing(false)}
                  sx={{ color: '#000', '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInlineSave}
                  variant="contained"
                  sx={{ bgcolor: '#000', color: '#fff', '&:hover': { bgcolor: '#333' } }}
                >
                  Update Details
                </Button>
              </Box>
            </Box>
          )}
          </Box>
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
          <Tooltip title="இந்த பக்கத்தை பகிர் (Share this page)">
            <IconButton 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `Learn about ${king?.name || 'this king'}`,
                    text: `Check out this fascinating article about ${king?.name || 'this king'}`,
                    url: window.location.href
                  }).catch(console.error);
                } else {
                  navigator.clipboard.writeText(window.location.href)
                    .then(() => alert("Link copied to clipboard"))
                    .catch(err => console.error('Failed to copy: ', err));
                }
              }}
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
          கருத்துக்கள் | Comments ({comments.length})
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
            placeholder="கருத்து எழுதவும் | Write a comment..."
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
            கருத்துகள் இல்லை. முதலில் எழுதுங்கள்! | No comments yet. Be the first to comment!
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
                
                <Typography 
                  variant="body2"
                  sx={{ 
                    fontFamily: "'Open Sans', sans-serif",
                    lineHeight: 1.6,
                    wordBreak: 'break-word',
                    mb: 1,
                    fontSize: '0.875rem',
                    color: '#333'
                  }}
                >
                  {comment.content}
                </Typography>

                {/* Comment Reactions */}
                {user && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, position: 'relative' }}>
                    {/* Emoji Picker Button */}
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => toggleEmojiPicker(comment._id)}
                      sx={{
                        minWidth: 'auto',
                        p: 0.5,
                        color: '#666',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.05)'
                        }
                      }}
                    >
                      <EmojiEmotions sx={{ fontSize: '1.2rem' }} />
                    </Button>

                    {/* Current Reaction Display */}
                    {getUserReaction(comment._id) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                        <Typography sx={{ fontSize: '1rem', mr: 0.5 }}>
                          {emojiData.find(e => e.type === getUserReaction(comment._id))?.emoji || '👍'}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#666' }}>
                          {getReactionCount(comment._id, getUserReaction(comment._id))}
                        </Typography>
                      </Box>
                    )}

                    {/* Emoji Picker Dropdown */}
                    {emojiPickerOpen[comment._id] && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: '100%',
                          left: 0,
                          bgcolor: '#fff',
                          border: '1px solid #ddd',
                          borderRadius: 2,
                          p: 1,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          zIndex: 1000,
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          gap: 0.5,
                          minWidth: 200,
                          mb: 1
                        }}
                      >
                        {emojiData.map((emoji) => (
                          <Button
                            key={emoji.type}
                            size="small"
                            variant="text"
                            onClick={() => handleEmojiSelect(comment._id, emoji.type)}
                            sx={{
                              minWidth: 'auto',
                              p: 0.5,
                              color: getUserReaction(comment._id) === emoji.type ? emoji.color : '#666',
                              '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.05)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                            title={emoji.label}
                          >
                            <Typography sx={{ fontSize: '1.2rem' }}>
                              {emoji.emoji}
                            </Typography>
                          </Button>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}

                {/* Comment Actions */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {/* Reply Button */}
                    {user && (
                      <Button
                        size="small"
                        sx={{
                          fontFamily: "'Montserrat', sans-serif",
                          color: '#000',
                          textTransform: 'uppercase',
                          fontSize: '0.625rem',
                          p: 0,
                          minWidth: 'auto',
                          letterSpacing: 0.5,
                          '&:hover': {
                            bgcolor: 'transparent',
                            textDecoration: 'underline'
                          }
                        }}
                        onClick={() => setReplyingTo(comment._id)}
                      >
                        பதில் | Reply
                      </Button>
                    )}

                    {/* Show Replies Button */}
                    {comment.replies && comment.replies.length > 0 && (
                      <Button
                        size="small"
                        sx={{
                          fontFamily: "'Montserrat', sans-serif",
                          color: '#666',
                          textTransform: 'uppercase',
                          fontSize: '0.625rem',
                          p: 0,
                          minWidth: 'auto',
                          letterSpacing: 0.5,
                          '&:hover': {
                            bgcolor: 'transparent',
                            textDecoration: 'underline'
                          }
                        }}
                        onClick={() => {
                          // Toggle replies for this comment
                          const updatedComments = comments.map(c => 
                            c._id === comment._id 
                              ? { ...c, showReplies: !c.showReplies }
                              : c
                          );
                          setComments(updatedComments);
                        }}
                      >
                        {comment.showReplies ? 'பதில்களை மறை | Hide Replies' : `பதில்கள் ${comment.replies.length} காண் | Show ${comment.replies.length} Replies`}
                      </Button>
                    )}
                  </Box>

                  {/* Admin Delete Button */}
                  {user && user.role === "admin" && (
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteComment(comment._id)}
                      sx={{
                        color: '#000',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.1)'
                        }
                      }}
                      title="Delete Comment (Admin Only)"
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>

                {/* Reply Input */}
                {replyingTo === comment._id && (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mt: 1,
                      borderTop: '1px solid #eee',
                      pt: 1
                    }}
                  >
                    <TextField
                      fullWidth
                      variant="standard"
                      placeholder={`Reply to ${comment.user?.displayName || 'Anonymous'}`}
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
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
                      onClick={() => handleAddReply(comment._id)}
                      disabled={!newReply.trim()}
                      sx={{
                        ml: 1,
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
                )}

                {/* Replies Section - Now positioned inside the comment container */}
                {comment.showReplies && comment.replies && comment.replies.length > 0 && (
                  <Box 
                    sx={{ 
                      mt: 2,
                      pt: 2,
                      borderTop: '1px solid #eee',
                      bgcolor: '#f9f9f9',
                      p: 2,
                      borderRadius: 2,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
                        mb: 2,
                        borderBottom: '1px solid #eee',
                        pb: 1
                      }}
                    >
                      பதில்கள் | Replies
                    </Typography>
                    {comment.replies.map((reply) => (
                      <Box
                        key={reply._id}
                        sx={{
                          bgcolor: '#fff',
                          p: 1.5,
                          borderRadius: 2,
                          mb: 1,
                          border: '1px solid #eee'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ 
                                fontFamily: "'Montserrat', sans-serif",
                                fontWeight: 700, 
                                textTransform: 'uppercase',
                                fontSize: '0.625rem',
                                color: '#0066cc'
                              }}
                            >
                              {reply.user?.displayName || 'Anonymous'}
                            </Typography>
                            <Typography 
                              variant="caption"
                              sx={{ 
                                fontFamily: "'Roboto', sans-serif",
                                color: '#666',
                                fontSize: '0.5rem'
                              }}
                            >
                              {new Date(reply.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                          
                          {/* Admin Delete Reply Button */}
                          {user && user.role === "admin" && (
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteReply(comment._id, reply._id)}
                              sx={{
                                color: '#000',
                                '&:hover': {
                                  bgcolor: 'rgba(0,0,0,0.1)'
                                }
                              }}
                              title="Delete Reply (Admin Only)"
                            >
                              <Delete />
                            </IconButton>
                          )}
                        </Box>
                        <Typography 
                          variant="body2"
                          sx={{ 
                            fontFamily: "'Open Sans', sans-serif",
                            lineHeight: 1.6,
                            wordBreak: 'break-word',
                            fontSize: '0.75rem'
                          }}
                        >
                          {reply.content}
                        </Typography>

                        {/* Reply Reactions */}
                        {user && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, position: 'relative' }}>
                            {/* Emoji Picker Button */}
                            <Button
                              size="small"
                              variant="text"
                              onClick={() => toggleEmojiPicker(`${comment._id}_reply_${reply._id}`)}
                              sx={{
                                minWidth: 'auto',
                                p: 0.25,
                                color: '#666',
                                '&:hover': {
                                  bgcolor: 'rgba(0,0,0,0.05)'
                                }
                              }}
                            >
                              <EmojiEmotions sx={{ fontSize: '1rem' }} />
                            </Button>

                            {/* Current Reaction Display */}
                            {getUserReaction(`${comment._id}_reply_${reply._id}`) && (
                              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                                <Typography sx={{ fontSize: '0.875rem', mr: 0.25 }}>
                                  {emojiData.find(e => e.type === getUserReaction(`${comment._id}_reply_${reply._id}`))?.emoji || '👍'}
                                </Typography>
                                <Typography variant="caption" sx={{ fontSize: '0.625rem', color: '#666' }}>
                                  {getReactionCount(`${comment._id}_reply_${reply._id}`, getUserReaction(`${comment._id}_reply_${reply._id}`))}
                                </Typography>
                              </Box>
                            )}

                            {/* Emoji Picker Dropdown */}
                            {emojiPickerOpen[`${comment._id}_reply_${reply._id}`] && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  bottom: '100%',
                                  left: 0,
                                  bgcolor: '#fff',
                                  border: '1px solid #ddd',
                                  borderRadius: 2,
                                  p: 1,
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                  zIndex: 1000,
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(4, 1fr)',
                                  gap: 0.5,
                                  minWidth: 180,
                                  mb: 1
                                }}
                              >
                                {emojiData.map((emoji) => (
                                  <Button
                                    key={emoji.type}
                                    size="small"
                                    variant="text"
                                    onClick={() => handleEmojiSelect(`${comment._id}_reply_${reply._id}`, emoji.type)}
                                    sx={{
                                      minWidth: 'auto',
                                      p: 0.25,
                                      color: getUserReaction(`${comment._id}_reply_${reply._id}`) === emoji.type ? emoji.color : '#666',
                                      '&:hover': {
                                        bgcolor: 'rgba(0,0,0,0.05)',
                                        transform: 'scale(1.1)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                    title={emoji.label}
                                  >
                                    <Typography sx={{ fontSize: '1rem' }}>
                                      {emoji.emoji}
                                    </Typography>
                                  </Button>
                                ))}
                              </Box>
                            )}
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

      {/* Edit Dialog remains the same as in previous implementation */}
      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 0,
            border: '3px solid #000',
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
          அரசர் விவரங்கள் திருத்த | Edit King Details
        </DialogTitle>
  <DialogContent sx={{ p: 3 }}>
          {/* Name */}
          <Box sx={{ display:'flex', gap:2, mb:2 }}>
            <TextField
              label="Name (EN)"
              value={formData.name_en}
              onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
              fullWidth
              margin="normal"
              variant="standard"
            />
            <TextField
              label="Name (TA)"
              value={formData.name_ta}
              onChange={(e) => setFormData({ ...formData, name_ta: e.target.value })}
              fullWidth
              margin="normal"
              variant="standard"
            />
          </Box>
          {/* Dynasty + Period */}
          <Box sx={{ display:'flex', gap:2, mb:2 }}>
            <Box sx={{ flex:1, display:'flex', flexDirection:'column', gap:1 }}>
              <TextField label="Dynasty (EN)" value={formData.dynasty_en} onChange={(e)=>setFormData({ ...formData, dynasty_en: e.target.value })} fullWidth variant="standard" />
              <TextField label="Dynasty (TA)" value={formData.dynasty_ta} onChange={(e)=>setFormData({ ...formData, dynasty_ta: e.target.value })} fullWidth variant="standard" />
            </Box>
            <Box sx={{ flex:1, display:'flex', flexDirection:'column', gap:1 }}>
              <TextField label="Period (EN)" value={formData.period_en} onChange={(e)=>setFormData({ ...formData, period_en: e.target.value })} fullWidth variant="standard" />
              <TextField label="Period (TA)" value={formData.period_ta} onChange={(e)=>setFormData({ ...formData, period_ta: e.target.value })} fullWidth variant="standard" />
            </Box>
          </Box>
          {/* Achievements */}
          <Box sx={{ display:'flex', gap:2, mb:2 }}>
            <TextField label="Achievements (EN)" value={formData.achievements_en} onChange={(e)=>setFormData({ ...formData, achievements_en: e.target.value })} fullWidth multiline rows={3} variant="standard" />
            <TextField label="Achievements (TA)" value={formData.achievements_ta} onChange={(e)=>setFormData({ ...formData, achievements_ta: e.target.value })} fullWidth multiline rows={3} variant="standard" />
          </Box>
          {/* Description */}
          <Box sx={{ display:'flex', gap:2, mb:2 }}>
            <TextField label="Description (EN)" value={formData.description_en} onChange={(e)=>setFormData({ ...formData, description_en: e.target.value })} fullWidth multiline rows={4} variant="standard" />
            <TextField label="Description (TA)" value={formData.description_ta} onChange={(e)=>setFormData({ ...formData, description_ta: e.target.value })} fullWidth multiline rows={4} variant="standard" />
          </Box>
          {/* Media URLs */}
          <TextField label="Image URL" value={formData.image} onChange={(e)=>setFormData({ ...formData, image: e.target.value })} fullWidth sx={{ mb:2 }} margin="normal" />
          <TextField label="Video URL" value={formData.videoUrl} onChange={(e)=>setFormData({ ...formData, videoUrl: e.target.value })} fullWidth sx={{ mb:2 }} margin="normal" />
          {/* Video Meta */}
          <Box sx={{ display:'flex', gap:2 }}>
            <Box sx={{ flex:1, display:'flex', flexDirection:'column', gap:1 }}>
              <TextField label="Video Title (EN)" value={formData.videoTitle_en} onChange={(e)=>setFormData({ ...formData, videoTitle_en: e.target.value })} fullWidth variant="standard" />
              <TextField label="Video Title (TA)" value={formData.videoTitle_ta} onChange={(e)=>setFormData({ ...formData, videoTitle_ta: e.target.value })} fullWidth variant="standard" />
            </Box>
            <Box sx={{ flex:1, display:'flex', flexDirection:'column', gap:1 }}>
              <TextField label="Video Description (EN)" value={formData.videoDescription_en} onChange={(e)=>setFormData({ ...formData, videoDescription_en: e.target.value })} fullWidth variant="standard" />
              <TextField label="Video Description (TA)" value={formData.videoDescription_ta} onChange={(e)=>setFormData({ ...formData, videoDescription_ta: e.target.value })} fullWidth variant="standard" />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ 
            p: 2, 
            justifyContent: 'space-between',
            bgcolor: '#f0f0f0' 
          }}
        >
          <Button 
            onClick={() => setEditOpen(false)}
            sx={{ 
              color: '#000',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.05)'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            sx={{
              bgcolor: '#000',
              color: '#fff',
              borderRadius: 0,
              '&:hover': { 
                bgcolor: '#333',
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 15px rgba(0,0,0,0.2)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

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
          நீக்கம் உறுதிப்படுத்த | Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            இந்த {deleteType} ஐ நீக்க விரும்புகிறீர்களா? (Are you sure you want to delete this {deleteType}?)
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
            இந்த செயலை மீண்டும் செய்ய முடியாது. (This action cannot be undone.)
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
            ரத்து செய் | Cancel
          </Button>
          <Button
            onClick={deleteType === 'comment' ? confirmDeleteComment : confirmDeleteReply}
            variant="contained"
            sx={{
              bgcolor: '#000',
              color: '#fff',
              '&:hover': { 
                bgcolor: '#333'
              }
            }}
          >
            நீக்கு | Delete {deleteType === 'comment' ? 'Comment' : 'Reply'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default KingDetail;
