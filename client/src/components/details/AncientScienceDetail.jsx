import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
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
  Chip,
  Card,
  CardContent,
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
function AncientScienceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const getContent = useBilingualContent();
  const [science, setScience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);



  // Add a new state for inline editing
  const [isEditing, setIsEditing] = useState(false);
  // Update state to include content sections (bilingual fields)
  const [editableData, setEditableData] = useState({
    name_en: "",
    name_ta: "",
    period_en: "",
    period_ta: "",
    field_en: "",
    field_ta: "",
    scholar_en: "",
    scholar_ta: "",
    description_en: "",
    description_ta: "",
    image: "",
    contentSections: [], // Array of bilingual sections
  });

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

  // Emoji options
  const emojiOptions = ['❤️', '👍', '👎', '😊', '😍', '🤔', '👏', '🙏', '🔥', '💯'];

  // Function to add a new content section (bilingual subtitle/content)
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
          videoTitle: "",
          videoDescription: "",
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

  // Update handleEditOpen to include content sections (bilingual mapping)
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
      name_en: toStr(science.name),
      name_ta: toTa(science.name),
      period_en: toStr(science.period),
      period_ta: toTa(science.period),
      field_en: toStr(science.field),
      field_ta: toTa(science.field),
      scholar_en: toStr(science.scholar),
      scholar_ta: toTa(science.scholar),
      description_en: toStr(science.description),
      description_ta: toTa(science.description),
      image: science.image || "",
      contentSections: (science.contentSections || []).map(sec => ({
        subtitle_en: toStr(sec.subtitle),
        subtitle_ta: toTa(sec.subtitle),
        content_en: toStr(sec.content),
        content_ta: toTa(sec.content),
        imageUrl: sec.imageUrl || "",
        imageLink: sec.imageLink || "",
        videoUrl: sec.videoUrl || "",
        videoTitle: sec.videoTitle || "",
        videoDescription: sec.videoDescription || "",
        id: sec.id || sec._id || Date.now() + Math.random()
      })),
    });
    setIsEditing(true);
  };



  useEffect(() => {
    console.log("Fetching Ancient Science detail for ID:", id);
    const initializeData = async () => {
      await fetchUser();
      await fetchScience();
    };
    initializeData();
  }, [id]);

  // Update userLiked when user data becomes available
  useEffect(() => {
    if (user && science) {
      const likesArray = Array.isArray(science.likes) ? science.likes : [];
      setUserLiked(likesArray.some(likeId => likeId.toString() === user._id.toString()));
    }
  }, [user, science]);

  const fetchUser = async () => {
    try {
      console.log("Fetching user in AncientScienceDetail...");
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL || "http://localhost:5000"}/auth/user`, { 
        method: "GET",
        credentials: "include",
        headers: {
          "Accept": "application/json"
        }
      });
      
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

  const fetchScience = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/ancientscience/${id}`);
      console.log("API response status:", res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response text:", errorText);
        throw new Error("Ancient Science detail not found");
      }
      const data = await res.json();
      console.log("Fetched Ancient Science data:", data);
      console.log("Image field:", data.image);
      setScience(data);
      setComments(data.comments || []);
      
      // Handle likes - ensure it's an array and check if user liked
      const likesArray = Array.isArray(data.likes) ? data.likes : [];
      setLikes(likesArray.length);
      
      // Check if user liked after user data is available
      if (user) {
        setUserLiked(likesArray.some(likeId => likeId.toString() === user._id.toString()));
      }
    } catch (err) {
      console.error("Error fetching Ancient Science detail:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };





  // Update handleInlineSave to include content sections (serialize bilingual)
  const handleInlineSave = async () => {
    try {
      const res = await fetch(`/api/ancientscience/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: { en: editableData.name_en || "", ta: editableData.name_ta || "" },
          period: { en: editableData.period_en || "", ta: editableData.period_ta || "" },
          field: { en: editableData.field_en || "", ta: editableData.field_ta || "" },
          scholar: { en: editableData.scholar_en || "", ta: editableData.scholar_ta || "" },
          description: { en: editableData.description_en || "", ta: editableData.description_ta || "" },
          image: editableData.image,
          contentSections: editableData.contentSections.map(sec => ({
            subtitle: { en: sec.subtitle_en || "", ta: sec.subtitle_ta || "" },
            content: { en: sec.content_en || "", ta: sec.content_ta || "" },
            imageUrl: sec.imageUrl || "",
            imageLink: sec.imageLink || "",
            videoUrl: sec.videoUrl || "",
            videoTitle: sec.videoTitle || "",
            videoDescription: sec.videoDescription || "",
            id: sec.id
          })),
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update ancient science");
      }
      
      // Refresh the science data
      await fetchScience();
      
      // Exit editing mode
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving ancient science details:", err);
      alert(`Failed to save details: ${err.message}`);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this ancient science entry?")) {
      try {
        const res = await fetch(`/api/ancientscience/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        
        if (!res.ok) throw new Error("Delete failed");
        
        // Navigate back to the list after successful deletion
        navigate("/explore/ancientscience");
      } catch (err) {
        console.error(err);
        alert("Failed to delete ancient science entry");
      }
    }
  };

  // Like functionality
  const handleLike = async () => {
    console.log("=== LIKE FUNCTION DEBUG ===");
    console.log("User state:", user);
    console.log("User ID:", user?._id);
    console.log("Science ID:", id);
    
    if (!user) {
      console.log("No user found, showing login alert");
      alert("Please login to like this ancient science");
      return;
    }

    try {
      console.log("Making like request to:", `/api/ancientscience/${id}/like`);
      const res = await fetch(`/api/ancientscience/${id}/like`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      console.log("Like response status:", res.status);
      console.log("Like response headers:", res.headers);

      if (!res.ok) {
        const errorText = await res.text();
        console.log("Error response body:", errorText);
        throw new Error("Failed to like/unlike");
      }

      const data = await res.json();
      console.log("Like response data:", data);
      setLikes(data.likes);
      setUserLiked(data.userLiked);
    } catch (err) {
      console.error("Like error:", err);
      alert("Failed to like the ancient science");
    }
  };

  // Share functionality
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: getContent(science.name),
          text: getContent(science.description),
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
      alert("Please login to comment");
      return;
    }

    if (!newComment.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    try {
      const res = await fetch(`/api/ancientscience/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newComment }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.log("Error response body:", errorText);
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
      alert("Please login to reply");
      return;
    }

    if (!newReply.trim()) {
      alert("Reply cannot be empty");
      return;
    }

    try {
      const res = await fetch(`/api/ancientscience/${id}/comments/${commentId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newReply }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.log("Error response body:", errorText);
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

  // Delete comment/reply functionality
  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      let res;
      if (deleteType === 'comment') {
        res = await fetch(`/api/ancientscience/${id}/comments/${itemToDelete}`, {
          method: "DELETE",
          credentials: "include",
        });
      } else if (deleteType === 'reply') {
        const [commentId, replyId] = itemToDelete.split('-');
        res = await fetch(`/api/ancientscience/${id}/comments/${commentId}/replies/${replyId}`, {
          method: "DELETE",
          credentials: "include",
        });
      }

      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
        setDeleteDialogOpen(false);
        setItemToDelete(null);
        setDeleteType('');
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

    setCommentReactions(prev => {
      const commentReactions = prev[commentId] || {};
      const userReaction = commentReactions[user._id];
      
      if (userReaction === emoji) {
        // Remove reaction
        const newCommentReactions = { ...commentReactions };
        delete newCommentReactions[user._id];
        return {
          ...prev,
          [commentId]: newCommentReactions
        };
      } else {
        // Add/change reaction
        return {
          ...prev,
          [commentId]: {
            ...commentReactions,
            [user._id]: emoji
          }
        };
      }
    });
  };

  const getReactionCount = (commentId, emoji) => {
    const reactions = commentReactions[commentId] || {};
    return Object.values(reactions).filter(r => r === emoji).length;
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
          onClick={() => navigate("/explore/ancientscience")}
          sx={{ mt: 2 }}
        >
          Back to Ancient Science
        </Button>
      </Container>
    );
  }

  if (!science) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Ancient Science detail not found</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/explore/ancientscience")}
          sx={{ mt: 2 }}
        >
          Back to Ancient Science
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <IconButton
          onClick={() => navigate("/explore/ancientscience")}
          sx={{ mr: 2 }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
          {getContent(science.name)}
        </Typography>
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
                  name_en: toStr(science.name),
                  name_ta: toTa(science.name),
                  period_en: toStr(science.period),
                  period_ta: toTa(science.period),
                  field_en: toStr(science.field),
                  field_ta: toTa(science.field),
                  scholar_en: toStr(science.scholar),
                  scholar_ta: toTa(science.scholar),
                  description_en: toStr(science.description),
                  description_ta: toTa(science.description),
                  image: science.image || "",
                  contentSections: (science.contentSections || []).map(sec => ({
                    subtitle_en: toStr(sec.subtitle),
                    subtitle_ta: toTa(sec.subtitle),
                    content_en: toStr(sec.content),
                    content_ta: toTa(sec.content),
                    imageUrl: sec.imageUrl || "",
                    imageLink: sec.imageLink || "",
                    videoUrl: sec.videoUrl || "",
                    videoTitle: sec.videoTitle || "",
                    videoDescription: sec.videoDescription || "",
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
              title="Inline Edit"
            >
              {isEditing ? <Close /> : <EditIcon />}
            </IconButton>
            <IconButton onClick={handleDelete} color="error">
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
            width: '100%',
            minHeight: 400,
            bgcolor: '#f9f9f9'
          }}
        >
          {science.image ? (
            <img 
              src={science.image} 
              alt={getContent(science.name)}
              style={{
                maxWidth: '100%',
                maxHeight: 600,
                objectFit: 'contain',
                padding: 16,
              }}
              onError={(e) => {
                console.log("Image failed to load:", science.image);
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600' viewBox='0 0 1200 600'%3E%3Crect fill='%23cccccc' width='1200' height='600'%3E%3C/rect%3E%3Ctext x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='100px' fill='%23333333'%3EImage Not Available%3C/text%3E%3C/svg%3E";
              }}
            />
          ) : (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                p: 4,
                color: '#666',
                textAlign: 'center'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                No Image Available
        </Typography>
              <Typography variant="body2">
                {getContent(science.name)} - {getContent(science.field) || 'Ancient Science'}
              </Typography>
              <Typography variant="caption" sx={{ mt: 1, fontStyle: 'italic' }}>
                Add an image URL in edit mode to display an image here
        </Typography>
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
          {/* Period, Field, and Scholar */}
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
                {getContent(science.period) && (
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 700, 
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    Period: {getContent(science.period)}
                  </Typography>
                )}
                {getContent(science.field) && (
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 700, 
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    Field: {getContent(science.field)}
                  </Typography>
                )}
                {getContent(science.scholar) && (
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 700, 
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    Scholar: {getContent(science.scholar)}
                  </Typography>
                )}
              </>
            ) : (
              <Box sx={{ display: 'flex', width: '100%', gap: 2, flexWrap:'wrap' }}>
                <Box sx={{ display:'flex', flexDirection:'column', gap:1, flex:1, minWidth:220 }}>
                  <TextField label="Period (EN)" value={editableData.period_en} onChange={(e)=>setEditableData({ ...editableData, period_en: e.target.value })} fullWidth variant="standard" />
                  <TextField label="Period (TA)" value={editableData.period_ta} onChange={(e)=>setEditableData({ ...editableData, period_ta: e.target.value })} fullWidth variant="standard" />
                </Box>
                <Box sx={{ display:'flex', flexDirection:'column', gap:1, flex:1, minWidth:220 }}>
                  <TextField label="Field (EN)" value={editableData.field_en} onChange={(e)=>setEditableData({ ...editableData, field_en: e.target.value })} fullWidth variant="standard" />
                  <TextField label="Field (TA)" value={editableData.field_ta} onChange={(e)=>setEditableData({ ...editableData, field_ta: e.target.value })} fullWidth variant="standard" />
                </Box>
                <Box sx={{ display:'flex', flexDirection:'column', gap:1, flex:1, minWidth:220 }}>
                  <TextField label="Scholar (EN)" value={editableData.scholar_en} onChange={(e)=>setEditableData({ ...editableData, scholar_en: e.target.value })} fullWidth variant="standard" />
                  <TextField label="Scholar (TA)" value={editableData.scholar_ta} onChange={(e)=>setEditableData({ ...editableData, scholar_ta: e.target.value })} fullWidth variant="standard" />
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
                {getContent(science.description)}
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
              <TextField label="Description (EN)" value={editableData.description_en} onChange={(e)=>setEditableData({ ...editableData, description_en: e.target.value })} fullWidth multiline rows={4} variant="standard" sx={{ mb:1 }} />
              <TextField label="Description (TA)" value={editableData.description_ta} onChange={(e)=>setEditableData({ ...editableData, description_ta: e.target.value })} fullWidth multiline rows={4} variant="standard" />
            </Box>
          )}

          {/* Image Field */}
          {!isEditing ? (
            science.image && (
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
                <Typography
                  variant="body1"
                  sx={{
                    wordBreak: 'break-all',
                    color: '#666',
                    fontStyle: 'italic',
                  }}
                >
                  {science.image}
                </Typography>
              </Box>
            )
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
                Image URL
              </Typography>
              <TextField
                label="Image URL"
                value={editableData.image}
                onChange={(e) => setEditableData({ ...editableData, image: e.target.value })}
                fullWidth
                variant="standard"
                placeholder="Enter full image URL"
              />
            </Box>
          )}

          {/* Content Sections */}
          {!isEditing && science.contentSections && science.contentSections.length > 0 && (
            science.contentSections.map((section, index) => (
              <Box key={section.id || `content-section-${index}`} sx={{ mt: 4 }}>
                {getContent(section.subtitle) && (
                  <Typography 
                    variant="h6" 
                    key={`subtitle-${section.id || index}`}
                  >
                    {getContent(section.subtitle)}
                  </Typography>
                )}
                
                {getContent(section.content) && (
                  <Typography
                    variant="body1"
                    key={`content-${section.id || index}`}
                  >
                    {getContent(section.content)}
                  </Typography>
                )}

                {/* Section Image */}
                {section.imageUrl && (
                  <img 
                    key={`image-${section.id || index}`}
                    src={section.imageUrl} 
                    alt={section.subtitle || `Section ${index + 1} Image`} 
                    style={{ maxWidth: '100%', height: 'auto', marginTop: 16 }}
                  />
                )}

                {/* Section Video */}
                {section.videoUrl && (
                  <iframe 
                    key={`video-${section.id || index}`}
                    src={`https://www.youtube.com/embed/${section.videoUrl.split('v=')[1] || section.videoUrl.split('/').pop()}`} 
                    title={section.videoTitle || `Section ${index + 1} Video`}
                    style={{ width: '100%', height: 'auto', aspectRatio: '16/9', marginTop: 16 }}
                    allowFullScreen
                  />
                )}
                
                {/* Section Video Details */}
                {(section.videoTitle || section.videoDescription) && (
                  <Box 
                    key={`video-details-${section.id || index}`} 
                    sx={{ mt: 2 }}
                  >
                    {section.videoTitle && (
                      <Typography 
                        variant="subtitle1" 
                        key={`video-title-${section.id || index}`}
                      >
                        {section.videoTitle}
                      </Typography>
                    )}
                    
                    {section.videoDescription && (
                      <Typography 
                        variant="body2" 
                        key={`video-description-${section.id || index}`}
                      >
                        {section.videoDescription}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            ))
          )}

          {/* Editable Content Sections */}
          {isEditing && user && user.role === "admin" && (
            <Box sx={{ mt: 4 }}>
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
                  <Box sx={{ display:'flex', gap:2, mb:2, flexWrap:'wrap' }}>
                    <TextField label="Subtitle (EN)" value={section.subtitle_en} onChange={(e)=>{ const updated=[...editableData.contentSections]; updated[index].subtitle_en=e.target.value; setEditableData(prev=>({ ...prev, contentSections: updated })); }} fullWidth variant="standard" />
                    <TextField label="Subtitle (TA)" value={section.subtitle_ta} onChange={(e)=>{ const updated=[...editableData.contentSections]; updated[index].subtitle_ta=e.target.value; setEditableData(prev=>({ ...prev, contentSections: updated })); }} fullWidth variant="standard" />
                  </Box>
                  
                  <TextField label="Content (EN)" value={section.content_en} onChange={(e)=>{ const updated=[...editableData.contentSections]; updated[index].content_en=e.target.value; setEditableData(prev=>({ ...prev, contentSections: updated })); }} fullWidth multiline rows={4} variant="standard" sx={{ mb:2 }} />
                  <TextField label="Content (TA)" value={section.content_ta} onChange={(e)=>{ const updated=[...editableData.contentSections]; updated[index].content_ta=e.target.value; setEditableData(prev=>({ ...prev, contentSections: updated })); }} fullWidth multiline rows={4} variant="standard" sx={{ mb:2 }} />

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
                    placeholder="Enter full image URL"
                  />

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
                  
          <TextField
                    label="Video Title"
                    value={section.videoTitle}
                    onChange={(e) => {
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].videoTitle = e.target.value;
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
                    label="Video Description"
                    value={section.videoDescription}
                    onChange={(e) => {
                      const updatedSections = [...editableData.contentSections];
                      updatedSections[index].videoDescription = e.target.value;
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
              
              <Button
                onClick={addContentSection}
                variant="outlined"
                startIcon={<Add />}
                sx={{
                  color: '#000',
                  borderColor: '#000',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.05)'
                  }
                }}
              >
                Add Content Section
              </Button>
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
                borderTop: '1px solid #000' 
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

      {/* Likes, Comments, and Reactions Section */}
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
          <Button
            startIcon={<Share />}
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
            Share
          </Button>
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
            mb: 2
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
              fontStyle: 'italic'
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
                      onClick={() => setEmojiPickerOpen(prev => ({
                        ...prev,
                        [comment._id]: !prev[comment._id]
                      }))}
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
                          {getUserReaction(comment._id)}
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
                          gridTemplateColumns: 'repeat(5, 1fr)',
                          gap: 0.5,
                          minWidth: 250,
                          mb: 1
                        }}
                      >
                        {emojiOptions.map((emoji) => (
                          <Button
                            key={emoji}
                            size="small"
                            variant="text"
                            onClick={() => {
                              handleCommentReaction(comment._id, emoji);
                              setEmojiPickerOpen(prev => ({
                                ...prev,
                                [comment._id]: false
                              }));
                            }}
                            sx={{
                              minWidth: 'auto',
                              p: 0.5,
                              color: getUserReaction(comment._id) === emoji ? '#e91e63' : '#666',
                              '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.05)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <Typography sx={{ fontSize: '1.2rem' }}>
                              {emoji}
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
                        Reply
                      </Button>
                    )}

                    {/* Show Replies Button */}
                    {comment.replies && comment.replies.length > 0 && (
                      <Button
                        size="small"
                        sx={{
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
                        {comment.showReplies ? 'Hide Replies' : `Show ${comment.replies.length} Replies`}
                      </Button>
                    )}
                  </Box>

                  {/* Admin Delete Button */}
                  {user && user.role === "admin" && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setItemToDelete(comment._id);
                        setDeleteType('comment');
                        setDeleteDialogOpen(true);
                      }}
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

                {/* Replies Section */}
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
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        color: '#333',
                        mb: 2,
                        borderBottom: '1px solid #eee',
                        pb: 1
                      }}
                    >
                      Replies
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
                              onClick={() => {
                                setItemToDelete(`${comment._id}-${reply._id}`);
                                setDeleteType('reply');
                                setDeleteDialogOpen(true);
                              }}
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
                              onClick={() => setEmojiPickerOpen(prev => ({
                                ...prev,
                                [`${comment._id}_reply_${reply._id}`]: !prev[`${comment._id}_reply_${reply._id}`]
                              }))}
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
                                  {getUserReaction(`${comment._id}_reply_${reply._id}`)}
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
                                  gridTemplateColumns: 'repeat(5, 1fr)',
                                  gap: 0.5,
                                  minWidth: 250,
                                  mb: 1
                                }}
                              >
                                {emojiOptions.map((emoji) => (
                                  <Button
                                    key={emoji}
                                    size="small"
                                    variant="text"
                                    onClick={() => {
                                      handleCommentReaction(`${comment._id}_reply_${reply._id}`, emoji);
                                      setEmojiPickerOpen(prev => ({
                                        ...prev,
                                        [`${comment._id}_reply_${reply._id}`]: false
                                      }));
                                    }}
                                    sx={{
                                      minWidth: 'auto',
                                      p: 0.25,
                                      color: getUserReaction(`${comment._id}_reply_${reply._id}`) === emoji ? '#e91e63' : '#666',
                                      '&:hover': {
                                        bgcolor: 'rgba(0,0,0,0.05)',
                                        transform: 'scale(1.1)'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    <Typography sx={{ fontSize: '1rem' }}>
                                      {emoji}
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

      {/* Edit Dialog */}

    </Container>
  );
}

export default AncientScienceDetail;





