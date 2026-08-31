import API_BASE_URL from "../../utils/api";
import React, { useState, useEffect } from "react";
import { useBilingualContent } from "../../utils/bilingualContent";
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
  Paper,
  Grid,
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
} from "@mui/icons-material";
import MediaDisplay from "../common/MediaDisplay";
import MediaUpload from "../common/MediaUpload";
import SEO from "../common/SEO";

function FoodDetail({ user: initialUser }) {
  const user = initialUser;
  const { id } = useParams();
  const navigate = useNavigate();
  const getContent = useBilingualContent();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    region_en: "",
    region_ta: "",
    type_en: "",
    type_ta: "",
    ingredients_en: "",
    ingredients_ta: "",
    recipe_en: "",
    recipe_ta: "",
    description_en: "",
    description_ta: "",
    occasion_en: "",
    occasion_ta: "",
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
        ...(prev.contentSections || []),
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
      contentSections: prev.contentSections && prev.contentSections.length > 0
        ? prev.contentSections.filter(section => section.id !== idToRemove)
        : []
    }));
  };

  // Emoji options
  const emojiOptions = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  useEffect(() => {
    const initializeData = async () => {
      await fetchFood();
    };
    initializeData();
  }, [id]);

  // Update userLiked when user data becomes available
  useEffect(() => {
    if (user && food) {
      const likesArray = Array.isArray(food.likes) ? food.likes : [];
      setUserLiked(likesArray.some(likeId => user && user._id && likeId && String(likeId) === String(user._id)));
    }
  }, [user, food]);


  const fetchFood = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/foods/${id}`);
      if (!res.ok) {
        throw new Error("Food not found");
      }
      const data = await res.json();
      setFood(data);
      // Prime bilingual edit state (support legacy string or object)
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
        region_en: toStr(data.region),
        region_ta: toTa(data.region),
        type_en: toStr(data.type),
        type_ta: toTa(data.type),
        ingredients_en: toStr(data.ingredients),
        ingredients_ta: toTa(data.ingredients),
        recipe_en: toStr(data.recipe),
        recipe_ta: toTa(data.recipe),
        description_en: toStr(data.description),
        description_ta: toTa(data.description),
        occasion_en: toStr(data.occasion),
        occasion_ta: toTa(data.occasion),
        significance_en: toStr(data.significance),
        significance_ta: toTa(data.significance),
        imageUrl: data.image || data.imageUrl || "",
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
      alert("Please log in to like this food");
      return;
    }

    try {
      const res = await fetch(`/api/foods/${id}/like`, {
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
      alert("Failed to like the food");
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
      const res = await fetch(`/api/foods/${id}/comments`, {
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
      const res = await fetch(`/api/foods/${id}/comments/${commentId}/replies`, {
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
      const res = await fetch(`/api/foods/${id}/comments/${commentId}/reactions`, {
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
    const confirmDelete = window.confirm("Are you sure you want to delete this food? This action cannot be undone.");

    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/foods/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete food");
      }

      navigate("/explore/foods");
    } catch (err) {
      alert(`Failed to delete food: ${err.message}`);
    }
  };

  const handleDeleteConfirmation = async () => {
    if (deleteType === 'comment') {
      try {
        const res = await fetch(`/api/foods/${id}/comments/${itemToDelete}`, {
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
        const res = await fetch(`/api/foods/${id}/comments/${commentId}/replies/${replyId}`, {
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
      // Process content sections to ensure they're in the right format
      // Remove temporary id properties before sending to the server
      const formattedContentSections = (editableData.contentSections || []).map(section => {
        const { id, subtitle_en, subtitle_ta, content_en, content_ta, videoTitle_en, videoTitle_ta, videoDescription_en, videoDescription_ta, ...rest } = section;
        return {
          subtitle: { en: subtitle_en || "", ta: subtitle_ta || "" },
          content: { en: content_en || "", ta: content_ta || "" },
          videoTitle: (videoTitle_en || videoTitle_ta) ? { en: videoTitle_en || "", ta: videoTitle_ta || "" } : undefined,
          videoDescription: (videoDescription_en || videoDescription_ta) ? { en: videoDescription_en || "", ta: videoDescription_ta || "" } : undefined,
          ...rest
        };
      });

      const updateData = {
        name: { en: editableData.name_en || "", ta: editableData.name_ta || "" },
        region: (editableData.region_en || editableData.region_ta) ? { en: editableData.region_en || "", ta: editableData.region_ta || "" } : undefined,
        type: (editableData.type_en || editableData.type_ta) ? { en: editableData.type_en || "", ta: editableData.type_ta || "" } : undefined,
        ingredients: (editableData.ingredients_en || editableData.ingredients_ta) ? { en: editableData.ingredients_en || "", ta: editableData.ingredients_ta || "" } : undefined,
        recipe: (editableData.recipe_en || editableData.recipe_ta) ? { en: editableData.recipe_en || "", ta: editableData.recipe_ta || "" } : undefined,
        description: { en: editableData.description_en || "", ta: editableData.description_ta || "" },
        occasion: (editableData.occasion_en || editableData.occasion_ta) ? { en: editableData.occasion_en || "", ta: editableData.occasion_ta || "" } : undefined,
        significance: (editableData.significance_en || editableData.significance_ta) ? { en: editableData.significance_en || "", ta: editableData.significance_ta || "" } : undefined,
        image: editableData.imageUrl || "",
        contentSections: formattedContentSections
      };

      const res = await fetch(`/api/foods/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update food");
      }

      // Update local state with new data
      setFood(prev => ({ ...prev, ...updateData }));
      setIsEditing(false);
      setError(""); // Clear any previous errors
    } catch (err) {
      setError(err.message);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: food.name,
        text: food.description,
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
        <Button onClick={() => navigate("/explore/foods")}>
          Back to Foods
        </Button>
      </Container>
    );
  }

  if (!food) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Food not found
        </Alert>
        <Button onClick={() => navigate("/explore/foods")}>
          Back to Foods
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
              Edit Food
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
              <TextField label="Region (EN)" value={editableData.region_en} onChange={(e) => setEditableData({ ...editableData, region_en: e.target.value })} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Region (TA)" value={editableData.region_ta} onChange={(e) => setEditableData({ ...editableData, region_ta: e.target.value })} fullWidth />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField label="Type (EN)" value={editableData.type_en} onChange={(e) => setEditableData({ ...editableData, type_en: e.target.value })} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Type (TA)" value={editableData.type_ta} onChange={(e) => setEditableData({ ...editableData, type_ta: e.target.value })} fullWidth />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Ingredients (EN)" value={editableData.ingredients_en} onChange={(e) => setEditableData({ ...editableData, ingredients_en: e.target.value })} fullWidth multiline rows={3} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Ingredients (TA)" value={editableData.ingredients_ta} onChange={(e) => setEditableData({ ...editableData, ingredients_ta: e.target.value })} fullWidth multiline rows={3} />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Recipe (EN)" value={editableData.recipe_en} onChange={(e) => setEditableData({ ...editableData, recipe_en: e.target.value })} fullWidth multiline rows={4} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Recipe (TA)" value={editableData.recipe_ta} onChange={(e) => setEditableData({ ...editableData, recipe_ta: e.target.value })} fullWidth multiline rows={4} />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Description (EN)" value={editableData.description_en} onChange={(e) => setEditableData({ ...editableData, description_en: e.target.value })} fullWidth multiline rows={4} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description (TA)" value={editableData.description_ta} onChange={(e) => setEditableData({ ...editableData, description_ta: e.target.value })} fullWidth multiline rows={4} />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Occasion (EN)" value={editableData.occasion_en} onChange={(e) => setEditableData({ ...editableData, occasion_en: e.target.value })} fullWidth multiline rows={2} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Occasion (TA)" value={editableData.occasion_ta} onChange={(e) => setEditableData({ ...editableData, occasion_ta: e.target.value })} fullWidth multiline rows={2} />
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
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Food
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
      <SEO 
        title={food ? `${getContent(food.name)} - Traditional Tamil Cuisine` : 'Tamil Cuisine & Food'}
        description={food ? (getContent(food.description) || `Discover traditional Tamil food recipe for ${getContent(food.name)} from ${getContent(food.region) || 'Tamil Nadu'}.`).slice(0, 160) : 'Explore ancient and traditional Tamil recipes and culinary culture.'}
        keywords={food ? `${getContent(food.name)}, Tamil Cuisine, ${getContent(food.region) || ''}, Traditional Tamil Recipe, Meenkodi` : 'Tamil Cuisine, Tamil Food'}
        image={food?.image || food?.imageUrl || undefined}
        url={`https://www.meenkodi.com/explore/foods/${id}`}
        type="article"
      />
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 4,
          justifyContent: 'space-between'
        }}
      >
        <IconButton onClick={() => navigate("/explore/foods")}>
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
          {getContent(food.name)}
        </Typography>

        {/* Admin Actions */}
        {user && user.role === "admin" && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => {
                // Prepare editable data when edit is clicked
                setEditableData({
                  name_en: toStr(food.name),
                  name_ta: toTa(food.name),
                  region_en: toStr(food.region),
                  region_ta: toTa(food.region),
                  type_en: toStr(food.type),
                  type_ta: toTa(food.type),
                  ingredients_en: toStr(food.ingredients),
                  ingredients_ta: toTa(food.ingredients),
                  recipe_en: toStr(food.recipe),
                  recipe_ta: toTa(food.recipe),
                  description_en: toStr(food.description),
                  description_ta: toTa(food.description),
                  occasion_en: toStr(food.occasion),
                  occasion_ta: toTa(food.occasion),
                  significance_en: toStr(food.significance),
                  significance_ta: toTa(food.significance),
                  imageUrl: food.image || food.imageUrl || "",
                  contentSections: food.contentSections?.map(section => ({
                    ...section,
                    id: section.id || Date.now() + Math.random() // Ensure each section has an id
                  })) || [],
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
          {(isEditing ? editableData.imageUrl : (food.image || food.imageUrl)) ? (
            <img
              src={isEditing ? editableData.imageUrl : (food.image || food.imageUrl)}
              alt={getContent(food.name)}
              style={{
                maxWidth: '100%',
                maxHeight: 400,
                objectFit: 'contain',
                padding: 16,
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
          {/* Region and Type - Only show if there's content or in edit mode */}
          {(!isEditing && (food.region || food.type)) || isEditing ? (
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
                  {getContent(food.region) && getContent(food.region).trim() !== '' && (
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                      }}
                    >
                      Region: {getContent(food.region)}
                    </Typography>
                  )}
                  {getContent(food.type) && getContent(food.type).trim() !== '' && (
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                      }}
                    >
                      Type: {getContent(food.type)}
                    </Typography>
                  )}
                </>
              ) : (
                <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '50%' }}>
                    <TextField label="Region (EN)" value={editableData.region_en} onChange={(e) => setEditableData({ ...editableData, region_en: e.target.value })} fullWidth variant="standard" />
                    <TextField label="Region (TA)" value={editableData.region_ta} onChange={(e) => setEditableData({ ...editableData, region_ta: e.target.value })} fullWidth variant="standard" />
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '50%' }}>
                    <TextField label="Type (EN)" value={editableData.type_en} onChange={(e) => setEditableData({ ...editableData, type_en: e.target.value })} fullWidth variant="standard" />
                    <TextField label="Type (TA)" value={editableData.type_ta} onChange={(e) => setEditableData({ ...editableData, type_ta: e.target.value })} fullWidth variant="standard" />
                  </Box>
                </Box>
              )}
            </Box>
          ) : null}

          {/* Ingredients */}
          {(food.ingredients || isEditing) && (
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
                  Ingredients
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                  }}
                >
                  {getContent(food.ingredients)}
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
                  Ingredients
                </Typography>
                <TextField label="Ingredients (EN)" value={editableData.ingredients_en} onChange={(e) => setEditableData({ ...editableData, ingredients_en: e.target.value })} fullWidth multiline rows={2} variant="standard" />
                <TextField label="Ingredients (TA)" value={editableData.ingredients_ta} onChange={(e) => setEditableData({ ...editableData, ingredients_ta: e.target.value })} fullWidth multiline rows={2} variant="standard" />
              </Box>
            )
          )}

          {/* Occasion */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid #000',
              pb: 2,
            }}
          >
            {!isEditing ? (
              getContent(food.occasion) && (
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Occasion: {getContent(food.occasion)}
                </Typography>
              )
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 1 }}>
                <TextField label="Occasion (EN)" value={editableData.occasion_en} onChange={(e) => setEditableData({ ...editableData, occasion_en: e.target.value })} fullWidth variant="standard" />
                <TextField label="Occasion (TA)" value={editableData.occasion_ta} onChange={(e) => setEditableData({ ...editableData, occasion_ta: e.target.value })} fullWidth variant="standard" />
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
                {getContent(food.description)}
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
              <TextField label="Description (EN)" value={editableData.description_en} onChange={(e) => setEditableData({ ...editableData, description_en: e.target.value })} fullWidth multiline rows={3} variant="standard" />
              <TextField label="Description (TA)" value={editableData.description_ta} onChange={(e) => setEditableData({ ...editableData, description_ta: e.target.value })} fullWidth multiline rows={3} variant="standard" />
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

          {/* Recipe - Only show if there's content or in edit mode */}
          {(!isEditing && food.recipe && food.recipe.trim() !== '') ? (
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
                Recipe
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                }}
              >
                {getContent(food.recipe)}
              </Typography>
            </Box>
          ) : isEditing ? (
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
                Recipe
              </Typography>
              <TextField label="Recipe (EN)" value={editableData.recipe_en} onChange={(e) => setEditableData({ ...editableData, recipe_en: e.target.value })} fullWidth multiline rows={2} variant="standard" />
              <TextField label="Recipe (TA)" value={editableData.recipe_ta} onChange={(e) => setEditableData({ ...editableData, recipe_ta: e.target.value })} fullWidth multiline rows={2} variant="standard" />
            </Box>
          ) : null}

          {/* Significance */}
          {(food.significance || isEditing) && (
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
                  Significance
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                  }}
                >
                  {getContent(food.significance)}
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
                  Significance
                </Typography>
                <TextField label="Significance (EN)" value={editableData.significance_en} onChange={(e) => setEditableData({ ...editableData, significance_en: e.target.value })} fullWidth multiline rows={2} variant="standard" />
                <TextField label="Significance (TA)" value={editableData.significance_ta} onChange={(e) => setEditableData({ ...editableData, significance_ta: e.target.value })} fullWidth multiline rows={2} variant="standard" />
              </Box>
            )
          )}

          {/* Content Sections */}
          {!isEditing && food.contentSections && food.contentSections.length > 0 &&
            food.contentSections.map((section, index) => {
              // Only render sections that have at least one piece of content
              const hasContent = section.subtitle || section.content || section.imageUrl || section.videoUrl;
              if (!hasContent) return null;

              return (
                <Box key={section.id || `content-section-${index}`} sx={{ mt: 4 }}>
                  {getContent(section.subtitle) && getContent(section.subtitle).trim() !== '' && (
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

                  {getContent(section.content) && getContent(section.content).trim() !== '' && (
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
                  {section.imageUrl && section.imageUrl.trim() !== '' && (
                    <img
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
                  {section.videoUrl && section.videoUrl.trim() !== '' && (
                    <iframe
                      src={`https://www.youtube.com/embed/${section.videoUrl.split('v=')[1] || section.videoUrl.split('/').pop()}`}
                      title={getContent(section.videoTitle) || `Section ${index + 1} Video`}
                      style={{ width: '100%', height: 'auto', aspectRatio: '16/9', marginTop: 16 }}
                      allowFullScreen
                    />
                  )}

                  {/* Section Video Details */}
                  {(section.videoTitle && section.videoTitle.trim() !== '') || (section.videoDescription && section.videoDescription.trim() !== '') ? (
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
                  ) : null}
                </Box>
              );
            })
          }

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
                  <TextField label="Subtitle (EN)" value={section.subtitle_en} onChange={(e) => {
                    const updated = [...editableData.contentSections];
                    updated[index].subtitle_en = e.target.value;
                    setEditableData(prev => ({ ...prev, contentSections: updated }));
                  }} fullWidth sx={{ mb: 1 }} variant="standard" />
                  <TextField label="Subtitle (TA)" value={section.subtitle_ta} onChange={(e) => {
                    const updated = [...editableData.contentSections];
                    updated[index].subtitle_ta = e.target.value;
                    setEditableData(prev => ({ ...prev, contentSections: updated }));
                  }} fullWidth sx={{ mb: 2 }} variant="standard" />

                  <TextField label="Content (EN)" value={section.content_en} onChange={(e) => {
                    const updated = [...editableData.contentSections];
                    updated[index].content_en = e.target.value;
                    setEditableData(prev => ({ ...prev, contentSections: updated }));
                  }} fullWidth multiline rows={3} variant="standard" sx={{ mb: 1 }} />
                  <TextField label="Content (TA)" value={section.content_ta} onChange={(e) => {
                    const updated = [...editableData.contentSections];
                    updated[index].content_ta = e.target.value;
                    setEditableData(prev => ({ ...prev, contentSections: updated }));
                  }} fullWidth multiline rows={3} variant="standard" sx={{ mb: 2 }} />

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
                    placeholder="Enter full YouTube video URL"
                  />

                  <TextField label="Video Title (EN)" value={section.videoTitle_en} onChange={(e) => {
                    const updated = [...editableData.contentSections];
                    updated[index].videoTitle_en = e.target.value;
                    setEditableData(prev => ({ ...prev, contentSections: updated }));
                  }} fullWidth sx={{ mb: 1 }} variant="standard" />
                  <TextField label="Video Title (TA)" value={section.videoTitle_ta} onChange={(e) => {
                    const updated = [...editableData.contentSections];
                    updated[index].videoTitle_ta = e.target.value;
                    setEditableData(prev => ({ ...prev, contentSections: updated }));
                  }} fullWidth sx={{ mb: 2 }} variant="standard" />

                  <TextField label="Video Description (EN)" value={section.videoDescription_en} onChange={(e) => {
                    const updated = [...editableData.contentSections];
                    updated[index].videoDescription_en = e.target.value;
                    setEditableData(prev => ({ ...prev, contentSections: updated }));
                  }} fullWidth multiline rows={2} variant="standard" />
                  <TextField label="Video Description (TA)" value={section.videoDescription_ta} onChange={(e) => {
                    const updated = [...editableData.contentSections];
                    updated[index].videoDescription_ta = e.target.value;
                    setEditableData(prev => ({ ...prev, contentSections: updated }));
                  }} fullWidth multiline rows={2} variant="standard" />

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
                  Update Food
                </Button>
              </Box>
            </Box>
          )}

          {/* Content Sections */}
          {!isEditing && food.contentSections && food.contentSections.length > 0 &&
            food.contentSections.map((section, index) => (
              <Box key={section.id || `content-section-${index}`} sx={{ mt: 4 }}>
                {section.subtitle && (
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      fontWeight: 700,
                      borderBottom: '2px solid #000',
                      pb: 1,
                    }}
                  >
                    {section.subtitle}
                  </Typography>
                )}

                {section.content && (
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                    }}
                  >
                    {section.content}
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
                    title={section.videoTitle || `Section ${index + 1} Video`}
                    style={{ width: '100%', height: 'auto', aspectRatio: '16/9', marginTop: 16 }}
                    allowFullScreen
                  />
                )}

                {/* Section Video Details */}
                {(section.videoTitle || section.videoDescription) && (
                  <Box sx={{ mt: 2 }}>
                    {section.videoTitle && (
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600 }}
                      >
                        {section.videoTitle}
                      </Typography>
                    )}

                    {section.videoDescription && (
                      <Typography
                        variant="body2"
                        sx={{ color: '#555', fontStyle: 'italic' }}
                      >
                        {section.videoDescription}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            ))
          }

          {/* Comments Section */}
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
          onClick={() => navigate('/explore/foods')}
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
          ← Back to Foods
        </Button>
      </Box>
    </Container>
  );
}


export default FoodDetail;
