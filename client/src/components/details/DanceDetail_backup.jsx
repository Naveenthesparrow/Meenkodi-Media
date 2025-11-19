import API_BASE_URL from "../../utils/api";
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
import MediaDisplay from "../common/MediaDisplay";

function DanceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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
    name: "",
    style: "",
    period: "",
    achievements: "",
    description: "",
    image: "",
    videoUrl: "",
    videoTitle: "",
    videoDescription: "",
  });

  // Add a new state for inline editing
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    name: "",
    style: "",
    origin: "",
    period: "",
    achievements: "",
    description: "",
    image: "",
    contentSections: [], // Field for multiple content sections
  });
  
  // Function to add a new content section
  const addContentSection = () => {
    setEditableData(prev => ({
      ...prev,
      contentSections: [
        ...prev.contentSections, 
        { 
          subtitle: "", 
          content: "",
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

  // Function to open edit mode and initialize editableData
  const handleEditOpen = () => {
    if (dance) {
      setEditableData({
        name: dance.name || "",
        style: dance.style || "",
        origin: dance.origin || "",
        period: dance.period || "",
        achievements: dance.achievements || "",
        description: dance.description || "",
        image: dance.image || "",
        contentSections: dance.contentSections?.map(section => ({
          ...section,
          id: section.id || Date.now() + Math.random() // Ensure each section has an id
        })) || [],
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
      // Process content sections to ensure they're in the right format
      // Remove temporary id properties before sending to the server
      const formattedContentSections = editableData.contentSections.map(section => {
        const { id, ...sectionWithoutId } = section;
        return sectionWithoutId;
      });
      
      const res = await fetch(`/api/dance/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editableData.name,
          style: editableData.style,
          origin: editableData.origin,
          period: editableData.period,
          achievements: editableData.achievements,
          description: editableData.description,
          image: editableData.image,
          contentSections: formattedContentSections,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update dance");
      }

      // Show success message
      alert("Dance details updated successfully!");
      
      // Refresh the dance data
      await fetchDance();

      // Exit editing mode
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
          {dance.name}
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
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4, 
          alignItems: 'flex-start'
        }}
      >
        {/* Image Section */}
        <Box 
          sx={{ 
            width: { xs: '100%', md: '50%' },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          {dance.image ? (
            <img
              src={dance.image}
              alt={dance.name}
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
                border: '2px solid #000'
              }}
            />
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "400px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#f5f5f5",
                border: '2px solid #000'
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

        {/* Details Section */}
        <Box 
          sx={{ 
            width: { xs: '100%', md: '50%' }, 
            display: 'flex',
            flexDirection: 'column',
            gap: 3
          }}
        >
          {/* Style/Origin and Period */}
          {!isEditing ? (
            <>
              {(dance.style || dance.origin) && (
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  {dance.style && `Style: ${dance.style}`}
                  {dance.style && dance.origin && ' | '}
                  {dance.origin && `Origin: ${dance.origin}`}
                </Typography>
              )}
              {dance.period && (
                <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
                  Period: {dance.period}
                </Typography>
              )}
            </>
          ) : (
            <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
              <TextField
                label="Style"
                value={editableData.style}
                onChange={(e) =>
                  setEditableData({ ...editableData, style: e.target.value })
                }
                fullWidth
                variant="outlined"
                size="small"
              />
              <TextField
                label="Origin"
                value={editableData.origin}
                onChange={(e) =>
                  setEditableData({ ...editableData, origin: e.target.value })
                }
                fullWidth
                variant="outlined"
                size="small"
              />
              <TextField
                label="Period"
                value={editableData.period}
                onChange={(e) =>
                  setEditableData({ ...editableData, period: e.target.value })
                }
                fullWidth
                variant="outlined"
                size="small"
              />
            </Box>
          )}

          {/* Achievements */}
          {!isEditing ? (
            dance.achievements && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Achievements
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {dance.achievements}
                </Typography>
              </Box>
            )
          ) : (
            <TextField
              label="Achievements"
              value={editableData.achievements}
              onChange={(e) =>
                setEditableData({
                  ...editableData,
                  achievements: e.target.value,
                })
              }
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
            />
          )}

          {/* Description */}
          {!isEditing ? (
            dance.description && (
              <Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Description
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {dance.description}
                </Typography>
              </Box>
            )
          ) : (
            <TextField
              label="Description"
              value={editableData.description}
              onChange={(e) =>
                setEditableData({
                  ...editableData,
                  description: e.target.value,
                })
              }
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              size="small"
            />
          )}
        </Box>

        {/* Display Content Sections in Non-Edit Mode */}
        {!isEditing && dance.contentSections && dance.contentSections.length > 0 && (
          <Box sx={{ mt: 4, width: '100%' }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              Additional Content
            </Typography>
            {dance.contentSections.map((section, index) => (
              <Box key={section.id || `content-section-${index}`} sx={{ mt: 4 }}>
                {section.subtitle && (
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {section.subtitle}
                  </Typography>
                )}
                {section.content && (
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {section.content}
                  </Typography>
                )}
                {section.imageUrl && (
                  <img
                    src={section.imageUrl}
                    alt={section.subtitle || `Section ${index + 1}`}
                    style={{ maxWidth: '100%', height: 'auto', marginTop: 16 }}
                  />
                )}
                {section.videoUrl && (
                  <iframe
                    src={section.videoUrl}
                    title={section.videoTitle || `Video ${index + 1}`}
                    style={{ width: '100%', height: 'auto', aspectRatio: '16/9', marginTop: 16 }}
                  />
                )}
                {section.videoDescription && (
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    {section.videoDescription}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Editing Sections for Content */}
      {isEditing && (
        <Box sx={{ mt: 4 }}>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={addContentSection}
            sx={{
              color: '#000',
              borderColor: '#000',
              mb: 3,
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.04)',
                borderColor: '#000',
              }
            }}
          >
            Add Content Section
          </Button>

          {editableData.contentSections.map((section, index) => (
            <Box key={section.id || index} sx={{ mb: 4, p: 2, border: '1px solid #ccc' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Content Section {index + 1}
              </Typography>
              
              <TextField
                label="Subtitle"
                value={section.subtitle}
                onChange={(e) => {
                  const updatedSections = [...editableData.contentSections];
                  updatedSections[index].subtitle = e.target.value;
                  setEditableData(prev => ({
                    ...prev,
                    contentSections: updatedSections
                  }));
                }}
                fullWidth
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
              />
              
              <TextField
                label="Content"
                value={section.content}
                onChange={(e) => {
                  const updatedSections = [...editableData.contentSections];
                  updatedSections[index].content = e.target.value;
                  setEditableData(prev => ({
                    ...prev,
                    contentSections: updatedSections
                  }));
                }}
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
              />

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
              />

              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => removeContentSection(section.id)}
                sx={{ mt: 2 }}
              >
                Remove Section
              </Button>
            </Box>
          ))}
        </Box>
      )}

      {/* Bottom Action Buttons */}
      {isEditing && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 4,
            pt: 3,
            borderTop: '2px solid #000'
          }}
        >
          <Button 
            variant="outlined" 
            onClick={() => setIsEditing(false)}
            sx={{
              color: '#000',
              borderColor: '#000',
              textTransform: 'uppercase',
              fontWeight: 700
            }}
          >
            Cancel
          </Button>
          
          <Button 
            variant="contained" 
            onClick={handleSave}
            sx={{
              bgcolor: '#000',
              color: '#fff',
              textTransform: 'uppercase',
              fontWeight: 700,
              '&:hover': {
                bgcolor: '#333'
              }
            }}
          >
            Update Details
          </Button>
        </Box>
      )}
    </Container>
          <Box sx={{ mt: 4 }}>
            {isEditing && (
              <>
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
                    <TextField
                      label="Subtitle"
                      value={section.subtitle}
                      onChange={(e) => {
                        const updatedSections = [...editableData.contentSections];
                        updatedSections[index].subtitle = e.target.value;
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
                      label="Content"
                      value={section.content}
                      onChange={(e) => {
                        const updatedSections = [...editableData.contentSections];
                        updatedSections[index].content = e.target.value;
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

                    {/* Image Upload for Content Section */}
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
              </>
            )}
            {!isEditing && dance.contentSections && dance.contentSections.length > 0 && (
              dance.contentSections.map((section, index) => (
                <Card 
                  key={section.id || `content-section-${index}`} 
                  sx={{ 
                    mt: 4, 
                    boxShadow: 3, 
                    overflow: "visible",
                    borderRadius: 2,
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: 5
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {section.subtitle && (
                      <Typography 
                        variant="h5" 
                        gutterBottom
                        sx={{ 
                          borderBottom: "2px solid #000",
                          pb: 1,
                          mb: 2,
                          fontWeight: 600
                        }}
                      >
                        {section.subtitle}
                      </Typography>
                    )}
                    
                    {section.content && (
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          mb: 3, 
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.7,
                          color: "#333"
                        }}
                      >
                        {section.content}
                      </Typography>
                    )}

                    {/* Section Media (Image or Video) */}
                    {(section.imageUrl || section.videoUrl) && (
                      <Box 
                        sx={{ 
                          mt: 2, 
                          mb: 2,
                          borderRadius: 2,
                          overflow: "hidden",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}
                      >
                        <MediaDisplay
                          imageUrl={section.imageUrl}
                          videoUrl={section.videoUrl}
                          videoLink={section.videoUrl}
                          title={section.videoTitle || section.subtitle}
                          height={400}
                        />
                        {section.imageLink && section.imageUrl && (
                          <Typography 
                            variant="caption" 
                            display="block" 
                            sx={{ 
                              mt: 1, 
                              textAlign: "center",
                              fontStyle: "italic",
                              color: "#555"
                            }}
                          >
                            {section.imageLink}
                          </Typography>
                        )}
                        {section.videoTitle && section.videoUrl && (
                          <Typography 
                            variant="subtitle1"
                            sx={{ 
                              mt: 2, 
                              fontWeight: 600,
                              px: 1
                            }}
                          >
                            {section.videoTitle}
                          </Typography>
                        )}
                        {section.videoDescription && section.videoUrl && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              mt: 1, 
                              fontStyle: "italic",
                              px: 1,
                              pb: 1
                            }}
                          >
                            {section.videoDescription}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </Box>
        </Box>
      </Box>

      {/* Separate Update Button for Content Sections - match KingDetail.jsx */}
      {isEditing && user && user.role === "admin" && (
        <Box
          sx={{
            width: "100%",
            maxWidth: 800,
            mx: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 4,
            pt: 2,
            borderTop: "1px solid #000",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
            position: "sticky",
            bottom: 0,
            backgroundColor: "white",
            zIndex: 100,
            py: 2,
            px: 3,
            borderRadius: "10px 10px 0 0"
          }}
        >
          <Button
            onClick={() => setIsEditing(false)}
            variant="text"
            sx={{
              color: "#000",
              textTransform: "uppercase",
              fontWeight: "bold",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.05)"
              }
            }}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              bgcolor: "#000",
              color: "#fff",
              fontWeight: 'bold',
              textTransform: "uppercase",
              px: 4,
              "&:hover": {
                bgcolor: "#333"
              }
            }}
          >
            Update Details
          </Button>
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
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              textTransform: "uppercase",
              textAlign: "center",
              letterSpacing: 1,
              borderBottom: "1px solid #000",
              pb: 1,
              mb: 2,
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
            <IconButton
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
            </IconButton>
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
                      }}
                    >
                      {comment.user?.displayName || "Anonymous"}
                    </Typography>
                    {user?.role === "admin" && (
                      <IconButton
                        onClick={() => {
                          setItemToDelete(comment._id);
                          setDeleteType("comment");
                          setDeleteDialogOpen(true);
                        }}
                        size="small"
                        sx={{ color: "#000" }}
                      >
                        <Delete />
                      </IconButton>
                    )}
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
            <Button
              onClick={handleDeleteItem}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}

export default DanceDetail;






