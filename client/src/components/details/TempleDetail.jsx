import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import SEO from '../common/SEO';
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
  Add
} from "@mui/icons-material";
import MediaDisplay from "../common/MediaDisplay";
import MediaUpload from "../common/MediaUpload";
import { useBilingualContent } from "../../utils/bilingualContent";
import API_BASE_URL from "../../utils/api";

function TempleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const getContent = useBilingualContent();
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [newReply, setNewReply] = useState("");
  const [likes, setLikes] = useState(0);
  const [userLiked, setUserLiked] = useState(false);

  // Entity state
  const [temple, setTemple] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Edit dialog states
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editPeriod, setEditPeriod] = useState("");
  const [editDeity, setEditDeity] = useState("");
  const [editArchitecture, setEditArchitecture] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editImageLink, setEditImageLink] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editVideoLink, setEditVideoLink] = useState("");

  // Delete confirmation states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(""); // 'comment' or 'reply'

  // Comment reactions states
  const [commentReactions, setCommentReactions] = useState({});
  const [emojiPickerOpen, setEmojiPickerOpen] = useState({});

  // Emoji options
  const emojiOptions = ["👍", "❤️", "😂", "😮", "😢", "😡"];

  // Inline editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    name_en: "",
    name_ta: "",
    location_en: "",
    location_ta: "",
    deity_en: "",
    deity_ta: "",
    period_en: "",
    period_ta: "",
    dynasty_en: "",
    dynasty_ta: "",
    builder_en: "",
    builder_ta: "",
    architecture_en: "",
    architecture_ta: "",
    description_en: "",
    description_ta: "",
    significance_en: "",
    significance_ta: "",
    festivals_en: "",
    festivals_ta: "",
    image: "",
    imageUrl: "",
    imageLink: "",
    videoUrl: "",
    videoLink: "",
    contentSections: [], // bilingual sections
  });

  // Function to add a new content section (initialize bilingual fields)
  const addContentSection = () => {
    console.log("Adding new content section");
    setEditableData(prev => {
      // Make sure contentSections is an array even if it's undefined
      const currentSections = Array.isArray(prev.contentSections) ? prev.contentSections : [];

      return {
        ...prev,
        contentSections: [
          ...currentSections,
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
      };
    });
  };

  // Function to remove a content section
  const removeContentSection = (idToRemove) => {
    console.log("Removing section with id or index:", idToRemove);
    setEditableData(prev => {
      // If idToRemove is a number less than array length, treat it as an index
      if (typeof idToRemove === 'number' && idToRemove < prev.contentSections.length) {
        return {
          ...prev,
          contentSections: [
            ...prev.contentSections.slice(0, idToRemove),
            ...prev.contentSections.slice(idToRemove + 1)
          ]
        };
      }
      // Otherwise filter by id
      else {
        return {
          ...prev,
          contentSections: prev.contentSections.filter(section => section.id !== idToRemove)
        };
      }
    });
  };

  // Function to handle content section field changes
  const handleContentSectionChange = (idx, field, value) => {
    setEditableData(prev => ({
      ...prev,
      contentSections: prev.contentSections.map((section, i) => {
        // Match either by ID (preferred) or by index as fallback
        if ((section.id && section.id === idx) || i === idx) {
          return { ...section, [field]: value };
        }
        return section;
      })
    }));
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchUser();
      await fetchTemple();
    };
    initializeData();
  }, [id]);

  // Update userLiked when user data becomes available
  useEffect(() => {
    if (user && temple) {
      const likesArray = Array.isArray(temple.likes) ? temple.likes : [];
      setUserLiked(
        likesArray.some((likeId) => likeId.toString() === user._id.toString())
      );
    }
  }, [user, temple]);

  const fetchUser = async () => {
    try {
      console.log("Fetching user in TempleDetail...");
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

  const fetchTemple = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/temples/${id}`);
      if (!res.ok) {
        throw new Error("Temple not found");
      }
      const data = await res.json();
      setTemple(data);
      setComments(data.comments || []);
      // Handle likes - ensure it's an array and check if user liked
      const likesArray = Array.isArray(data.likes) ? data.likes : [];
      setLikes(likesArray.length);
      setUserLiked(
        likesArray.some(
          (likeId) => likeId.toString() === user?._id?.toString()
        ) || false
      );

      // Set editable data with all fields including contentSections (bilingual)
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
        location_en: toStr(data.location),
        location_ta: toTa(data.location),
        deity_en: toStr(data.deity),
        deity_ta: toTa(data.deity),
        period_en: toStr(data.period),
        period_ta: toTa(data.period),
        dynasty_en: toStr(data.dynasty),
        dynasty_ta: toTa(data.dynasty),
        builder_en: toStr(data.builder),
        builder_ta: toTa(data.builder),
        architecture_en: toStr(data.architecture),
        architecture_ta: toTa(data.architecture),
        description_en: toStr(data.description),
        description_ta: toTa(data.description),
        significance_en: toStr(data.significance),
        significance_ta: toTa(data.significance),
        festivals_en: toStr(data.festivals),
        festivals_ta: toTa(data.festivals),
        image: data.image || "",
        imageUrl: data.imageUrl || "",
        imageLink: data.imageLink || "",
        videoUrl: data.videoUrl || "",
        videoLink: data.videoLink || "",
        contentSections: Array.isArray(data.contentSections)
          ? data.contentSections.map(section => ({
            subtitle_en: toStr(section.subtitle),
            subtitle_ta: toTa(section.subtitle),
            content_en: toStr(section.content),
            content_ta: toTa(section.content),
            imageUrl: section.imageUrl || "",
            imageLink: section.imageLink || "",
            videoUrl: section.videoUrl || "",
            videoTitle_en: toStr(section.videoTitle),
            videoTitle_ta: toTa(section.videoTitle),
            videoDescription_en: toStr(section.videoDescription),
            videoDescription_ta: toTa(section.videoDescription),
            id: section._id || Date.now() + Math.random().toString(36).substr(2, 9)
          }))
          : [],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = () => {
    setEditName(temple.name);
    setEditLocation(temple.location);
    setEditPeriod(temple.period);
    setEditDeity(temple.deity);
    setEditArchitecture(temple.architecture);
    setEditDescription(temple.description);
    setEditImageUrl(temple.imageUrl || "");
    setEditImageLink(temple.imageLink || "");
    setEditVideoUrl(temple.videoUrl || "");
    setEditVideoLink(temple.videoLink || "");
    setEditOpen(true);
  };

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

      const updateData = {
        name: toBilingual(editableData.name_en, editableData.name_ta),
        location: toBilingual(editableData.location_en, editableData.location_ta),
        deity: toBilingual(editableData.deity_en, editableData.deity_ta),
        period: toBilingual(editableData.period_en, editableData.period_ta),
        dynasty: toBilingual(editableData.dynasty_en, editableData.dynasty_ta),
        builder: toBilingual(editableData.builder_en, editableData.builder_ta),
        architecture: toBilingual(editableData.architecture_en, editableData.architecture_ta),
        description: toBilingual(editableData.description_en, editableData.description_ta),
        significance: toBilingual(editableData.significance_en, editableData.significance_ta),
        festivals: toBilingual(editableData.festivals_en, editableData.festivals_ta),
        imageUrl: editableData.imageUrl,
        imageLink: editableData.imageLink,
        videoUrl: editableData.videoUrl,
        videoLink: editableData.videoLink,
        contentSections: formattedContentSections
      };

      const res = await fetch(`/api/temples/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update temple");
      }

      const updatedTemple = await res.json();
      setTemple(updatedTemple);
      setIsEditing(false);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const res = await fetch(`/api/temples/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editName,
          location: editLocation,
          period: editPeriod,
          deity: editDeity,
          architecture: editArchitecture,
          description: editDescription,
          imageUrl: editImageUrl,
          imageLink: editImageLink,
          videoUrl: editVideoUrl,
          videoLink: editVideoLink,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update temple");
      }
      setEditOpen(false);
      fetchTemple();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this temple?")) {
      try {
        const res = await fetch(`/api/temples/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to delete temple");
        }
        navigate("/explore/temples");
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Add like functionality
  const handleLike = async () => {
    if (!user) {
      alert("Please log in to like this temple");
      return;
    }

    try {
      const res = await fetch(`/api/temples/${id}/like`, {
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
      alert("Failed to like the temple");
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
      const res = await fetch(`/api/temples/${id}/comments`, {
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
        `/api/temples/${id}/comments/${commentId}/replies`,
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

  // Comment like functionality - REMOVED (not supported by temples backend)
  const handleCommentLike = async (commentId) => {
    alert("Comment likes not supported for temples");
    return;
  };

  // Comment reaction functionality - REMOVED (not supported by temples backend)
  const handleCommentReaction = async (commentId, emoji) => {
    alert("Comment reactions not supported for temples");
    return;
  };

  const handleDeleteComment = async () => {
    try {
      if (deleteType === "comment") {
        const res = await fetch(`/api/temples/${id}/comments/${itemToDelete}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to delete comment");
        }

        setComments(comments.filter((comment) => comment._id !== itemToDelete));
      } else if (deleteType === "reply") {
        const [commentId, replyId] = itemToDelete.split("-");
        const res = await fetch(
          `/api/temples/${id}/comments/${commentId}/replies/${replyId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to delete reply");
        }

        setComments(
          comments.map((comment) =>
            comment._id === commentId
              ? {
                ...comment,
                replies: comment.replies.filter(
                  (reply) => reply._id !== replyId
                ),
              }
              : comment
          )
        );
      }

      setDeleteDialogOpen(false);
      setItemToDelete(null);
      setDeleteType("");
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete " + deleteType);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: temple.name,
        text: `Check out this temple: ${temple.name}`,
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
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/explore/temples")}
          sx={{ mt: 2 }}
        >
          Back to Temples
        </Button>
      </Container>
    );
  }

  if (!temple) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">Temple not found</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/explore/temples")}
          sx={{ mt: 2 }}
        >
          Back to Temples
        </Button>
      </Container>
    );
  }

  return (
    <>
      <SEO 
        title={temple ? `${getContent(temple.name)} - Tamil Temple` : 'Temple Details'}
        description={temple ? `Explore ${getContent(temple.name)} in ${getContent(temple.location)}. ${getContent(temple.description) || `Ancient temple from ${getContent(temple.period)}.`}`.slice(0, 160) : 'Discover ancient Tamil temple architecture and heritage.'}
        keywords={temple ? `${getContent(temple.name)}, Tamil Temple, ${getContent(temple.location)}, ${getContent(temple.period)}, ${getContent(temple.deity)}, Dravidian Architecture` : 'Tamil Temple, Temple Architecture'}
        image={temple?.image || temple?.imageLink || undefined}
        type="article"
        tags={temple ? [getContent(temple.name), 'Tamil Temples', getContent(temple.location), getContent(temple.deity)] : []}
      />
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
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <IconButton onClick={() => navigate("/explore/temples")}>
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
          {getContent(temple.name)}
        </Typography>

        {user && user.role === "admin" && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              onClick={() => {
                if (!isEditing) {
                  // Prepare bilingual editable data
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
                    name_en: toStr(temple.name),
                    name_ta: toTa(temple.name),
                    location_en: toStr(temple.location),
                    location_ta: toTa(temple.location),
                    period_en: toStr(temple.period),
                    period_ta: toTa(temple.period),
                    deity_en: toStr(temple.deity),
                    deity_ta: toTa(temple.deity),
                    architecture_en: toStr(temple.architecture),
                    architecture_ta: toTa(temple.architecture),
                    description_en: toStr(temple.description),
                    description_ta: toTa(temple.description),
                    significance_en: toStr(temple.significance),
                    significance_ta: toTa(temple.significance),
                    festivals_en: toStr(temple.festivals),
                    festivals_ta: toTa(temple.festivals),
                    image: temple.image || "",
                    imageUrl: temple.imageUrl || "",
                    imageLink: temple.imageLink || "",
                    videoUrl: temple.videoUrl || "",
                    videoLink: temple.videoLink || "",
                    contentSections: Array.isArray(temple.contentSections)
                      ? temple.contentSections.map(section => ({
                        subtitle_en: toStr(section.subtitle),
                        subtitle_ta: toTa(section.subtitle),
                        content_en: toStr(section.content),
                        content_ta: toTa(section.content),
                        imageUrl: section.imageUrl || "",
                        imageLink: section.imageLink || "",
                        videoUrl: section.videoUrl || "",
                        videoTitle_en: toStr(section.videoTitle),
                        videoTitle_ta: toTa(section.videoTitle),
                        videoDescription_en: toStr(section.videoDescription),
                        videoDescription_ta: toTa(section.videoDescription),
                        id: section._id || Date.now() + Math.random().toString(36).substr(2, 9)
                      }))
                      : [],
                  });
                }
                setIsEditing(!isEditing);
              }}
              sx={{
                color: "#000",
                border: "1px solid #000",
                transition: "all 0.3s ease",
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.1)',
                  transform: 'scale(1.1)'
                }
              }}
              title={isEditing ? "Cancel Edit" : "Edit Temple"}
            >
              {isEditing ? <Close /> : <EditIcon />}
            </IconButton>
            <IconButton
              onClick={handleDelete}
              sx={{
                color: "#000",
                border: "1px solid #000",
                transition: "all 0.3s ease",
                '&:hover': {
                  bgcolor: 'rgba(255,0,0,0.1)',
                  transform: 'scale(1.1)'
                }
              }}
              title="Delete Temple"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </Box>

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
          {(isEditing ? editableData.imageUrl || editableData.videoUrl || editableData.videoLink : temple.imageUrl || temple.videoUrl || temple.videoLink) ? (
            <MediaDisplay
              imageUrl={isEditing ? editableData.imageUrl : temple.imageUrl}
              videoUrl={isEditing ? editableData.videoUrl : temple.videoUrl}
              videoLink={isEditing ? editableData.videoLink : temple.videoLink}
              title={temple.name}
              height={400}
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

        {/* Information Sections */}
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
          {/* Location and Period */}
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
                {getContent(temple.location) && (
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Location: {getContent(temple.location)}
                  </Typography>
                )}
                {getContent(temple.period) && (
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Period: {getContent(temple.period)}
                  </Typography>
                )}
              </>
            ) : (
              <Box sx={{ display: "flex", width: "100%", gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '50%' }}>
                  <TextField label="Location (EN)" value={editableData.location_en} onChange={(e) => setEditableData({ ...editableData, location_en: e.target.value })} fullWidth variant="standard" />
                  <TextField label="Location (TA)" value={editableData.location_ta} onChange={(e) => setEditableData({ ...editableData, location_ta: e.target.value })} fullWidth variant="standard" />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '50%' }}>
                  <TextField label="Period (EN)" value={editableData.period_en} onChange={(e) => setEditableData({ ...editableData, period_en: e.target.value })} fullWidth variant="standard" />
                  <TextField label="Period (TA)" value={editableData.period_ta} onChange={(e) => setEditableData({ ...editableData, period_ta: e.target.value })} fullWidth variant="standard" />
                </Box>
              </Box>
            )}
          </Box>

          {/* Deity and Architecture */}
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
                {getContent(temple.deity) && (
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Deity: {getContent(temple.deity)}
                  </Typography>
                )}
                {getContent(temple.architecture) && (
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Style: {getContent(temple.architecture)}
                  </Typography>
                )}
              </>
            ) : (
              <Box sx={{ display: "flex", width: "100%", gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '50%' }}>
                  <TextField label="Deity (EN)" value={editableData.deity_en} onChange={(e) => setEditableData({ ...editableData, deity_en: e.target.value })} fullWidth variant="standard" />
                  <TextField label="Deity (TA)" value={editableData.deity_ta} onChange={(e) => setEditableData({ ...editableData, deity_ta: e.target.value })} fullWidth variant="standard" />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '50%' }}>
                  <TextField label="Architecture (EN)" value={editableData.architecture_en} onChange={(e) => setEditableData({ ...editableData, architecture_en: e.target.value })} fullWidth variant="standard" />
                  <TextField label="Architecture (TA)" value={editableData.architecture_ta} onChange={(e) => setEditableData({ ...editableData, architecture_ta: e.target.value })} fullWidth variant="standard" />
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
                {getContent(temple.description)}
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
              <TextField label="Description (EN)" value={editableData.description_en} onChange={(e) => setEditableData({ ...editableData, description_en: e.target.value })} fullWidth multiline rows={3} variant="standard" sx={{ mb: 1 }} />
              <TextField label="Description (TA)" value={editableData.description_ta} onChange={(e) => setEditableData({ ...editableData, description_ta: e.target.value })} fullWidth multiline rows={3} variant="standard" />
            </Box>
          )}

          {/* Significance */}
          {(temple.significance || isEditing) &&
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
                  Significance
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                  }}
                >
                  {getContent(temple.significance)}
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
                <TextField label="Significance (EN)" value={editableData.significance_en} onChange={(e) => setEditableData({ ...editableData, significance_en: e.target.value })} fullWidth multiline rows={2} variant="standard" sx={{ mb: 1 }} />
                <TextField label="Significance (TA)" value={editableData.significance_ta} onChange={(e) => setEditableData({ ...editableData, significance_ta: e.target.value })} fullWidth multiline rows={2} variant="standard" />
              </Box>
            ))}

          {/* Festivals */}
          {(temple.festivals || isEditing) &&
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
                  Festivals
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                  }}
                >
                  {getContent(temple.festivals)}
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
                  Festivals
                </Typography>
                <TextField label="Festivals (EN)" value={editableData.festivals_en} onChange={(e) => setEditableData({ ...editableData, festivals_en: e.target.value })} fullWidth multiline rows={2} variant="standard" sx={{ mb: 1 }} />
                <TextField label="Festivals (TA)" value={editableData.festivals_ta} onChange={(e) => setEditableData({ ...editableData, festivals_ta: e.target.value })} fullWidth multiline rows={2} variant="standard" />
              </Box>
            ))}

          {/* Main Media URLs - only when editing */}
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
                onChange={(e) =>
                  setEditableData({
                    ...editableData,
                    imageUrl: e.target.value,
                  })
                }
                fullWidth
                variant="standard"
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
                placeholder="Enter full image URL"
              />
              {/* Upload from device for main image */}
              <MediaUpload
                onImageChange={(imageUrl) =>
                  setEditableData((prev) => ({ ...prev, imageUrl }))
                }
                onImageLinkChange={(imageLink) =>
                  setEditableData((prev) => ({ ...prev, imageLink }))
                }
                currentImage={editableData.imageUrl}
                currentImageLink={editableData.imageLink}
                label="Main Image"
              />
              {editableData.imageUrl && (
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    p: 2,
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

              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 700,
                  borderBottom: "2px solid #000",
                  pb: 1,
                }}
              >
                Video Details
              </Typography>
              <TextField
                label="Video URL"
                value={editableData.videoUrl || ""}
                onChange={(e) =>
                  setEditableData({
                    ...editableData,
                    videoUrl: e.target.value,
                  })
                }
                fullWidth
                variant="standard"
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
                placeholder="Enter full YouTube video URL"
              />
              <TextField
                label="Video Link (optional)"
                value={editableData.videoLink || ""}
                onChange={(e) =>
                  setEditableData({
                    ...editableData,
                    videoLink: e.target.value,
                  })
                }
                fullWidth
                variant="standard"
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
                placeholder="Alternate video link"
              />
            </Box>
          )}

          {/* Additional Content Sections */}
          {isEditing && user && user.role === "admin" && (
            <Box sx={{ mt: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.25rem',
                  letterSpacing: 0.5,
                  mb: 0,
                }}
              >
                Additional Content Sections
              </Typography>
              <Button
                onClick={addContentSection}
                variant="outlined"
                startIcon={<Add />}
                sx={{
                  color: '#000',
                  borderColor: '#000',
                  background: '#fff',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.05)'
                  },
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  fontSize: '1rem',
                  borderRadius: 0,
                  height: 42,
                  minWidth: 190,
                  boxShadow: 'none',
                  mt: 2,
                  mb: 2,
                  alignSelf: 'flex-start',
                }}
              >
                Add Content Section
              </Button>
              <Box sx={{ borderBottom: '2px solid #000', width: '100%', mt: 0, mb: 0 }} />
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

                  <TextField label="Video URL" value={section.videoUrl} onChange={(e) => {
                    const updated = [...editableData.contentSections];
                    updated[index].videoUrl = e.target.value;
                    setEditableData(prev => ({ ...prev, contentSections: updated }));
                  }} fullWidth sx={{ mb: 2 }} variant="standard" placeholder="Enter full YouTube video URL" />

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
                  }} fullWidth multiline rows={2} variant="standard" sx={{ mb: 1 }} />
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
            </Box>
          )}

          {/* Update Buttons - Only show when editing */}
          {isEditing && user && user.role === "admin" && (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                pt: 0,
                mt: 2,
                borderTop: 'none',
              }}
            >
              <Button
                onClick={() => setIsEditing(false)}
                variant="text"
                sx={{
                  color: "#000",
                  textTransform: 'uppercase',
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: 0,
                  height: 42,
                  minWidth: 140,
                  ml: 0,
                  alignSelf: 'flex-start',
                }}
              >
                CANCEL
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  onClick={addContentSection}
                  variant="outlined"
                  startIcon={<Add />}
                  sx={{
                    color: '#000',
                    borderColor: '#000',
                    background: '#fff',
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.05)'
                    },
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    fontSize: '1rem',
                    borderRadius: 0,
                    height: 42,
                    minWidth: 190,
                    boxShadow: 'none',
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
                    '&:hover': {
                      bgcolor: "#222",
                    },
                    textTransform: 'uppercase',
                    fontSize: '1rem',
                    borderRadius: 0,
                    fontWeight: 700,
                    height: 42,
                    minWidth: 190,
                    boxShadow: 'none',
                  }}
                >
                  UPDATE DETAILS
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>


      {/* Comments Section - New UI */}
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
          <Tooltip title="Share this temple">
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
            letterSpacing: '0.03em',
            borderBottom: '1px solid #000',
            pb: 1,
            mb: 1,
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '1.1rem',
          }}
        >
          Comments ({comments.length})
        </Typography>

        {/* Comment Input */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 2,
            position: 'relative',
            gap: 1,
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
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Old Comments Section */}
      <Box
        sx={{
          mt: 4,
          width: "100%",
          maxWidth: 800,
          mx: "auto",
          display: 'none', /* Hidden for now */
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
                  {/* Reply button only - like and emoji features not supported for temples */}
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

                {/* Emoji picker */}
                {emojiPickerOpen[comment._id] && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      p: 1,
                      bgcolor: "#f9f9f9",
                      borderRadius: 1,
                      mt: 1,
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
                          fontSize: "1.2rem",
                          minWidth: "auto",
                          p: 0.5,
                        }}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </Box>
                )}

                {/* Reply input */}
                {replyingTo === comment._id && (
                  <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Write a reply..."
                      value={newReply}
                      onChange={(e) => setNewReply(e.target.value)}
                    />
                    <Button
                      onClick={() => handleAddReply(comment._id)}
                      disabled={!newReply.trim()}
                      size="small"
                    >
                      Reply
                    </Button>
                  </Box>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <Box sx={{ mt: 2, pl: 2, borderLeft: "2px solid #e0e0e0" }}>
                    {comment.replies.map((reply) => (
                      <Box key={reply._id} sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600 }}
                          >
                            {reply.user?.displayName || "Anonymous"}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: "#666" }}
                            >
                              {new Date(reply.createdAt).toLocaleDateString()}
                            </Typography>
                            {user?.role === "admin" && (
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setItemToDelete(
                                    `${comment._id}-${reply._id}`
                                  );
                                  setDeleteType("reply");
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
                          sx={{ fontSize: "0.875rem" }}
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

      {/* Edit Dialog */}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 0,
            border: '2px solid #000',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            bgcolor: '#000',
            color: '#fff',
            textAlign: 'center',
          }}
        >
          Edit Temple Details
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
          <TextField
            label="Location"
            value={editLocation}
            onChange={(e) => setEditLocation(e.target.value)}
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
            label="Deity"
            value={editDeity}
            onChange={(e) => setEditDeity(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
          <TextField
            label="Architecture"
            value={editArchitecture}
            onChange={(e) => setEditArchitecture(e.target.value)}
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
            label="Image URL"
            value={editImageUrl}
            onChange={(e) => setEditImageUrl(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
          <TextField
            label="Image Link"
            value={editImageLink}
            onChange={(e) => setEditImageLink(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
          <TextField
            label="Video URL"
            value={editVideoUrl}
            onChange={(e) => setEditVideoUrl(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
          <TextField
            label="Video Link"
            value={editVideoLink}
            onChange={(e) => setEditVideoLink(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            margin="normal"
          />
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            justifyContent: "space-between",
            bgcolor: "#f0f0f0",
          }}
        >
          <Button
            onClick={() => setEditOpen(false)}
            sx={{
              color: "#000",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.05)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            sx={{
              bgcolor: "#000",
              color: "#fff",
              borderRadius: 0,
              "&:hover": {
                bgcolor: "#333",
                transform: "translateY(-3px)",
                boxShadow: "0 8px 15px rgba(0,0,0,0.2)",
              },
              transition: "all 0.3s ease",
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
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 0,
            border: "2px solid #000",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#000",
            color: "#fff",
            textAlign: "center",
            fontWeight: 700,
          }}
        >
          Confirm Delete
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography
            sx={{
              textAlign: "center",
              fontSize: "1rem",
            }}
          >
            Are you sure you want to delete this {deleteType}? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            justifyContent: "center",
            gap: 2,
            bgcolor: "#f0f0f0",
          }}
        >
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{
              color: "#000",
              border: "1px solid #000",
              px: 3,
              "&:hover": {
                bgcolor: "rgba(0,0,0,0.05)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteComment}
            variant="contained"
            sx={{
              bgcolor: "#d32f2f",
              color: "#fff",
              px: 3,
              "&:hover": {
                bgcolor: "#b71c1c",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {/* Standardized Back Button */}
      <Box sx={{ mt: 6, mb: 2, textAlign: 'center' }}>
        <Button
          onClick={() => navigate('/explore/temples')}
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
          ← Back to Temples
        </Button>
      </Box>
    </Container>
    </>
  );
}

export default TempleDetail;