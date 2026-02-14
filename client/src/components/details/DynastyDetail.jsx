import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  IconButton,
  Grid,
  Paper,
  Chip,
  Divider,
  Avatar,
  Tabs,
  Tab,
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
  Add,
  ThumbUp,
  ThumbUpOutlined,
  Share,
  Send,
  Favorite,
  FavoriteBorder,
  Reply,
  Flag,
  Castle,
  Groups,
  MilitaryTech,
  AccountBalance,
  Architecture,
  TrendingDown,
  EmojiEvents,
} from "@mui/icons-material";
import MediaUpload from "../common/MediaUpload";
import MediaDisplay from "../common/MediaDisplay";
import { useBilingualContent } from "../../utils/bilingualContent";
import { useTranslation } from "react-i18next";

function DynastyDetail({ user: initialUser }) {
  const user = initialUser;
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const getContent = useBilingualContent();
  const { t } = useTranslation();
  const [dynasty, setDynasty] = useState(null);
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
  const [deleteType, setDeleteType] = useState('');

  // Video player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editableData, setEditableData] = useState({
    name_en: "",
    name_ta: "",
    period_en: "",
    period_ta: "",
    capital_en: "",
    capital_ta: "",
    territory_en: "",
    territory_ta: "",
    rulers_en: "",
    rulers_ta: "",
    achievements_en: "",
    achievements_ta: "",
    description_en: "",
    description_ta: "",
    content_en: "",
    content_ta: "",
    militaryStrength_en: "",
    militaryStrength_ta: "",
    culturalContributions_en: "",
    culturalContributions_ta: "",
    architecture_en: "",
    architecture_ta: "",
    tradeAndEconomy_en: "",
    tradeAndEconomy_ta: "",
    decline_en: "",
    decline_ta: "",
    legacy_en: "",
    legacy_ta: "",
    flag: "",
    image: "",
    contentSections: [],
  });

  // Helper function to close edit mode and clean URL
  const closeEditMode = () => {
    setIsEditing(false);
    // Remove ?edit=true from URL
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete('edit');
    const newSearch = searchParams.toString();
    const newUrl = `${location.pathname}${newSearch ? '?' + newSearch : ''}`;
    navigate(newUrl, { replace: true });
  };

  // Helper function to enter edit mode and update URL
  const enterEditMode = () => {
    setIsEditing(true);
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('edit', 'true');
    const newUrl = `${location.pathname}?${searchParams.toString()}`;
    navigate(newUrl, { replace: true });
  };

  // Fetch dynasty data
  useEffect(() => {
    const fetchDynasty = async () => {
      try {
        const urlParam = id || slug;
        const res = await fetch(`/api/dynasties/${urlParam}`, {
          credentials: "include"
        });
        if (!res.ok) throw new Error("Failed to fetch dynasty");
        const data = await res.json();
        setDynasty(data);
        setComments(data.comments || []);
        setLikes(data.likes?.length || 0);
        setUserLiked(user && data.likes?.includes(user._id));
        
        // Check if edit mode is requested via query parameter
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get('edit') === 'true' && user && user.role === 'admin') {
          setIsEditing(true);
        }
        
        // Initialize editable data
        setEditableData({
          name_en: data.name?.en || "",
          name_ta: data.name?.ta || "",
          period_en: data.period?.en || "",
          period_ta: data.period?.ta || "",
          capital_en: data.capital?.en || "",
          capital_ta: data.capital?.ta || "",
          territory_en: data.territory?.en || "",
          territory_ta: data.territory?.ta || "",
          rulers_en: data.rulers?.en || "",
          rulers_ta: data.rulers?.ta || "",
          achievements_en: data.achievements?.en || "",
          achievements_ta: data.achievements?.ta || "",
          description_en: data.description?.en || "",
          description_ta: data.description?.ta || "",
          content_en: data.content?.en || "",
          content_ta: data.content?.ta || "",
          militaryStrength_en: data.militaryStrength?.en || "",
          militaryStrength_ta: data.militaryStrength?.ta || "",
          culturalContributions_en: data.culturalContributions?.en || "",
          culturalContributions_ta: data.culturalContributions?.ta || "",
          architecture_en: data.architecture?.en || "",
          architecture_ta: data.architecture?.ta || "",
          tradeAndEconomy_en: data.tradeAndEconomy?.en || "",
          tradeAndEconomy_ta: data.tradeAndEconomy?.ta || "",
          decline_en: data.decline?.en || "",
          decline_ta: data.decline?.ta || "",
          legacy_en: data.legacy?.en || "",
          legacy_ta: data.legacy?.ta || "",
          flag: data.flag || "",
          image: data.image || "",
          contentSections: (data.contentSections || []).map(section => ({
            subtitle_en: section.subtitle?.en || "",
            subtitle_ta: section.subtitle?.ta || "",
            content_en: section.content?.en || "",
            content_ta: section.content?.ta || "",
            imageUrl: section.imageUrl || "",
            imageLink: section.imageLink || "",
            videoUrl: section.videoUrl || "",
            videoTitle_en: section.videoTitle?.en || "",
            videoTitle_ta: section.videoTitle?.ta || "",
            videoDescription_en: section.videoDescription?.en || "",
            videoDescription_ta: section.videoDescription?.ta || "",
            id: Date.now() + Math.random()
          })),
        });
        
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDynasty();
  }, [id, slug, user]);

  // Add content section
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
          id: Date.now() + Math.random()
        }
      ]
    }));
  };

  // Remove content section
  const removeContentSection = (idToRemove) => {
    setEditableData(prev => ({
      ...prev,
      contentSections: prev.contentSections.filter(section => section.id !== idToRemove)
    }));
  };

  // Update content section
  const updateContentSection = (id, field, value) => {
    setEditableData(prev => ({
      ...prev,
      contentSections: prev.contentSections.map(section =>
        section.id === id ? { ...section, [field]: value } : section
      )
    }));
  };

  // Save changes
  const handleSave = async () => {
    try {
      const payload = {
        name: { en: editableData.name_en, ta: editableData.name_ta },
        period: { en: editableData.period_en, ta: editableData.period_ta },
        capital: { en: editableData.capital_en, ta: editableData.capital_ta },
        territory: { en: editableData.territory_en, ta: editableData.territory_ta },
        rulers: { en: editableData.rulers_en, ta: editableData.rulers_ta },
        achievements: { en: editableData.achievements_en, ta: editableData.achievements_ta },
        description: { en: editableData.description_en, ta: editableData.description_ta },
        content: { en: editableData.content_en, ta: editableData.content_ta },
        militaryStrength: { en: editableData.militaryStrength_en, ta: editableData.militaryStrength_ta },
        culturalContributions: { en: editableData.culturalContributions_en, ta: editableData.culturalContributions_ta },
        architecture: { en: editableData.architecture_en, ta: editableData.architecture_ta },
        tradeAndEconomy: { en: editableData.tradeAndEconomy_en, ta: editableData.tradeAndEconomy_ta },
        decline: { en: editableData.decline_en, ta: editableData.decline_ta },
        legacy: { en: editableData.legacy_en, ta: editableData.legacy_ta },
        flag: editableData.flag,
        image: editableData.image,
        contentSections: editableData.contentSections.map(section => ({
          subtitle: { en: section.subtitle_en, ta: section.subtitle_ta },
          content: { en: section.content_en, ta: section.content_ta },
          imageUrl: section.imageUrl,
          imageLink: section.imageLink,
          videoUrl: section.videoUrl,
          videoTitle: { en: section.videoTitle_en, ta: section.videoTitle_ta },
          videoDescription: { en: section.videoDescription_en, ta: section.videoDescription_ta }
        }))
      };

      const res = await fetch(`/api/dynasties/${dynasty._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update dynasty");

      const updatedDynasty = await res.json();
      setDynasty(updatedDynasty);
      closeEditMode();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Handle like
  const handleLike = async () => {
    if (!user) {
      alert("Please log in to like this dynasty");
      return;
    }

    try {
      const res = await fetch(`/api/dynasties/${dynasty._id}/like`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to like");

      const data = await res.json();
      setLikes(data.likes.length);
      setUserLiked(data.likes.includes(user._id));
    } catch (err) {
      console.error(err);
    }
  };

  // Handle comment submit
  const handleCommentSubmit = async () => {
    if (!user) {
      alert("Please log in to comment");
      return;
    }

    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/dynasties/${dynasty._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newComment }),
      });

      if (!res.ok) throw new Error("Failed to post comment");

      const updatedDynasty = await res.json();
      setComments(updatedDynasty.comments);
      setNewComment("");
    } catch (err) {
      console.error(err);
    }
  };

  // Handle reply submit
  const handleReplySubmit = async (commentId) => {
    if (!user) {
      alert("Please log in to reply");
      return;
    }

    if (!newReply.trim()) return;

    try {
      const res = await fetch(
        `/api/dynasties/${dynasty._id}/comments/${commentId}/replies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: newReply }),
        }
      );

      if (!res.ok) throw new Error("Failed to post reply");

      const updatedDynasty = await res.json();
      setComments(updatedDynasty.comments);
      setNewReply("");
      setReplyingTo(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(
        `/api/dynasties/${dynasty._id}/comments/${commentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to delete comment");

      const updatedDynasty = await res.json();
      setComments(updatedDynasty.comments);
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle delete reply
  const handleDeleteReply = async (commentId, replyId) => {
    try {
      const res = await fetch(
        `/api/dynasties/${dynasty._id}/comments/${commentId}/replies/${replyId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to delete reply");

      const updatedDynasty = await res.json();
      setComments(updatedDynasty.comments);
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !dynasty) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error">{error || "Dynasty not found"}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/")}>
          {t('common.back', 'Back to Home')}
        </Button>
      </Container>
    );
  }

  const dynastyColors = {
    pandiya: { primary: '#DC143C', secondary: '#FFF0F0' },
    chera: { primary: '#FFD700', secondary: '#FFFEF0' },
    chola: { primary: '#8B0000', secondary: '#FFF5F5' },
    pallava: { primary: '#DAA520', secondary: '#FFF9E6' },
    ltte: { primary: '#FF6B00', secondary: '#FFF5ED' },
  };

  const colorScheme = dynastyColors[dynasty.slug] || { primary: '#000', secondary: '#f5f5f5' };

  // ADMIN EDIT VIEW
  // TabPanel component for organized tabs
  function TabPanel({ children, value, index }) {
    return (
      <Box role="tabpanel" hidden={value !== index} sx={{ py: 3 }}>
        {value === index && children}
      </Box>
    );
  }

  if (isEditing && user && user.role === "admin") {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: 3,
            bgcolor: '#8B0000',
            color: 'white'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {t('dynasty.edit', 'Edit Dynasty')}
            </Typography>
            <IconButton onClick={closeEditMode} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Box>

          {/* Tabs Navigation */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#f5f5f5' }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': { 
                  fontWeight: 600,
                  minWidth: 120,
                  px: 3
                },
                '& .Mui-selected': { 
                  color: '#8B0000' 
                },
                '& .MuiTabs-indicator': { 
                  backgroundColor: '#8B0000',
                  height: 3
                }
              }}
            >
              <Tab label="Basic Info" />
              <Tab label="Territory & Rulers" />
              <Tab label="Overview" />
              <Tab label="Military & Culture" />
              <Tab label="Architecture & Economy" />
              <Tab label="Legacy & Decline" />
              <Tab label="Media & Sections" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ p: 4 }}>
            {/* Tab 0: Basic Info */}
            <TabPanel value={activeTab} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#8B0000', fontWeight: 600 }}>
                    Basic Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Dynasty Name (English)"
                    value={editableData.name_en}
                    onChange={(e) => setEditableData({ ...editableData, name_en: e.target.value })}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Dynasty Name (Tamil)"
                    value={editableData.name_ta}
                    onChange={(e) => setEditableData({ ...editableData, name_ta: e.target.value })}
                    fullWidth
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Period (English)"
                    value={editableData.period_en}
                    onChange={(e) => setEditableData({ ...editableData, period_en: e.target.value })}
                    fullWidth
                    placeholder="e.g., 300 BCE - 1279 CE"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Period (Tamil)"
                    value={editableData.period_ta}
                    onChange={(e) => setEditableData({ ...editableData, period_ta: e.target.value })}
                    fullWidth
                    placeholder="e.g., கி.மு. 300 - கி.பி. 1279"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Capital (English)"
                    value={editableData.capital_en}
                    onChange={(e) => setEditableData({ ...editableData, capital_en: e.target.value })}
                    fullWidth
                    placeholder="e.g., Thanjavur, Gangaikonda Cholapuram"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Capital (Tamil)"
                    value={editableData.capital_ta}
                    onChange={(e) => setEditableData({ ...editableData, capital_ta: e.target.value })}
                    fullWidth
                    placeholder="e.g., தஞ்சாவூர், கங்கைகொண்ட சோழபுரம்"
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tab 1: Territory & Rulers */}
            <TabPanel value={activeTab} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#8B0000', fontWeight: 600 }}>
                    Territory & Famous Rulers
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Territory (English)"
                    value={editableData.territory_en}
                    onChange={(e) => setEditableData({ ...editableData, territory_en: e.target.value })}
                    fullWidth
                    multiline
                    rows={4}
                    placeholder="Describe the geographical extent of the dynasty..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Territory (Tamil)"
                    value={editableData.territory_ta}
                    onChange={(e) => setEditableData({ ...editableData, territory_ta: e.target.value })}
                    fullWidth
                    multiline
                    rows={4}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Famous Rulers (English)"
                    value={editableData.rulers_en}
                    onChange={(e) => setEditableData({ ...editableData, rulers_en: e.target.value })}
                    fullWidth
                    multiline
                    rows={5}
                    placeholder="List notable rulers and their contributions..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Famous Rulers (Tamil)"
                    value={editableData.rulers_ta}
                    onChange={(e) => setEditableData({ ...editableData, rulers_ta: e.target.value })}
                    fullWidth
                    multiline
                    rows={5}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tab 2: Overview (Description, Content, Achievements) */}
            <TabPanel value={activeTab} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#8B0000', fontWeight: 600 }}>
                    Dynasty Overview
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description (English)"
                    value={editableData.description_en}
                    onChange={(e) => setEditableData({ ...editableData, description_en: e.target.value })}
                    fullWidth
                    multiline
                    rows={5}
                    placeholder="Brief overview of the dynasty..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Description (Tamil)"
                    value={editableData.description_ta}
                    onChange={(e) => setEditableData({ ...editableData, description_ta: e.target.value })}
                    fullWidth
                    multiline
                    rows={5}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Detailed Content (English)"
                    value={editableData.content_en}
                    onChange={(e) => setEditableData({ ...editableData, content_en: e.target.value })}
                    fullWidth
                    multiline
                    rows={8}
                    placeholder="Detailed historical information..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Detailed Content (Tamil)"
                    value={editableData.content_ta}
                    onChange={(e) => setEditableData({ ...editableData, content_ta: e.target.value })}
                    fullWidth
                    multiline
                    rows={8}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Major Achievements (English)"
                    value={editableData.achievements_en}
                    onChange={(e) => setEditableData({ ...editableData, achievements_en: e.target.value })}
                    fullWidth
                    multiline
                    rows={5}
                    placeholder="List significant achievements..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Major Achievements (Tamil)"
                    value={editableData.achievements_ta}
                    onChange={(e) => setEditableData({ ...editableData, achievements_ta: e.target.value })}
                    fullWidth
                    multiline
                    rows={5}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tab 3: Military & Culture */}
            <TabPanel value={activeTab} index={3}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#8B0000', fontWeight: 600 }}>
                    Military Power & Cultural Contributions
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Military Strength (English)"
                    value={editableData.militaryStrength_en}
                    onChange={(e) => setEditableData({ ...editableData, militaryStrength_en: e.target.value })}
                    fullWidth
                    multiline
                    rows={5}
                    placeholder="Describe military achievements, strategies, conquests..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Military Strength (Tamil)"
                    value={editableData.militaryStrength_ta}
                    onChange={(e) => setEditableData({ ...editableData, militaryStrength_ta: e.target.value })}
                    fullWidth
                    multiline
                    rows={5}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Cultural Contributions (English)"
                    value={editableData.culturalContributions_en}
                    onChange={(e) => setEditableData({ ...editableData, culturalContributions_en: e.target.value })}
                    fullWidth
                    multiline
                    rows={5}
                    placeholder="Literature, arts, dance, music, language development..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Cultural Contributions (Tamil)"
                    value={editableData.culturalContributions_ta}
                    onChange={(e) => setEditableData({ ...editableData, culturalContributions_ta: e.target.value })}
                    fullWidth
                    multiline
                    rows={5}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tab 4: Architecture & Economy */}
            <TabPanel value={activeTab} index={4}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#8B0000', fontWeight: 600 }}>
                    Architecture & Economic System
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Architecture (English)"
                    value={editableData.architecture_en}
                    onChange={(e) => setEditableData({ ...editableData, architecture_en: e.target.value })}
                    fullWidth
                    multiline
                    rows={5}
                    placeholder="Temples, monuments, architectural innovations..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Architecture (Tamil)"
                    value={editableData.architecture_ta}
                    onChange={(e) => setEditableData({ ...editableData, architecture_ta: e.target.value })}
                    fullWidth
                    multiline
                    rows={5}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Trade & Economy (English)"
                    value={editableData.tradeAndEconomy_en}
                    onChange={(e) => setEditableData({ ...editableData, tradeAndEconomy_en: e.target.value })}
                    fullWidth
                    multiline
                    rows={5}
                    placeholder="Trade routes, economic policies, prosperity..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Trade & Economy (Tamil)"
                    value={editableData.tradeAndEconomy_ta}
                    onChange={(e) => setEditableData({ ...editableData, tradeAndEconomy_ta: e.target.value })}
                    fullWidth
                    multiline
                    rows={5}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tab 5: Legacy & Decline */}
            <TabPanel value={activeTab} index={5}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#8B0000', fontWeight: 600 }}>
                    Decline & Legacy
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Decline (English)"
                    value={editableData.decline_en}
                    onChange={(e) => setEditableData({ ...editableData, decline_en: e.target.value })}
                    fullWidth
                    multiline
                    rows={5}
                    placeholder="Factors leading to decline, invasions, internal conflicts..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Decline (Tamil)"
                    value={editableData.decline_ta}
                    onChange={(e) => setEditableData({ ...editableData, decline_ta: e.target.value })}
                    fullWidth
                    multiline
                    rows={5}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Legacy (English)"
                    value={editableData.legacy_en}
                    onChange={(e) => setEditableData({ ...editableData, legacy_en: e.target.value })}
                    fullWidth
                    multiline
                    rows={5}
                    placeholder="Lasting impact on culture, society, politics..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Legacy (Tamil)"
                    value={editableData.legacy_ta}
                    onChange={(e) => setEditableData({ ...editableData, legacy_ta: e.target.value })}
                    fullWidth
                    multiline
                    rows={5}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            {/* Tab 6: Media & Content Sections */}
            <TabPanel value={activeTab} index={6}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#8B0000', fontWeight: 600 }}>
                    Images & Media
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>
                
                {/* Flag Image */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3, bgcolor: '#fafafa' }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: '#8B0000' }}>
                      Dynasty Flag
                    </Typography>
                    <MediaUpload
                      label="Flag Image"
                      currentImage={editableData.flag}
                      currentImageLink={editableData.flag}
                      onImageChange={(url) => setEditableData({ ...editableData, flag: url })}
                      onImageLinkChange={(url) => setEditableData({ ...editableData, flag: url })}
                    />
                  </Box>
                </Grid>

                {/* Main Image */}
                <Grid item xs={12} md={6}>
                  <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 3, bgcolor: '#fafafa' }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: '#8B0000' }}>
                      Main Dynasty Image
                    </Typography>
                    <MediaUpload
                      label="Main Image"
                      currentImage={editableData.image}
                      currentImageLink={editableData.image}
                      onImageChange={(url) => setEditableData({ ...editableData, image: url })}
                      onImageLinkChange={(url) => setEditableData({ ...editableData, image: url })}
                    />
                  </Box>
                </Grid>

                {/* Content Sections */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 3 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#8B0000', fontWeight: 600 }}>
                      Additional Content Sections
                    </Typography>
                    <Button 
                      startIcon={<Add />} 
                      onClick={addContentSection} 
                      variant="contained"
                      sx={{ bgcolor: '#8B0000', '&:hover': { bgcolor: '#6B0000' } }}
                    >
                      Add Section
                    </Button>
                  </Box>

                  {editableData.contentSections.map((section, index) => (
                    <Paper key={section.id} sx={{ p: 3, mb: 3, bgcolor: '#f9f9f9', border: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#8B0000' }}>
                          Section {index + 1}
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeContentSection(section.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Subtitle (EN)"
                            value={section.subtitle_en}
                            onChange={(e) => updateContentSection(section.id, 'subtitle_en', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Subtitle (TA)"
                            value={section.subtitle_ta}
                            onChange={(e) => updateContentSection(section.id, 'subtitle_ta', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Content (EN)"
                            value={section.content_en}
                            onChange={(e) => updateContentSection(section.id, 'content_en', e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Content (TA)"
                            value={section.content_ta}
                            onChange={(e) => updateContentSection(section.id, 'content_ta', e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            label="Image URL"
                            value={section.imageUrl}
                            onChange={(e) => updateContentSection(section.id, 'imageUrl', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            label="Image Link"
                            value={section.imageLink}
                            onChange={(e) => updateContentSection(section.id, 'imageLink', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            label="Video URL"
                            value={section.videoUrl}
                            onChange={(e) => updateContentSection(section.id, 'videoUrl', e.target.value)}
                            fullWidth
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Grid>
              </Grid>
            </TabPanel>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
              <Button 
                variant="outlined" 
                onClick={closeEditMode}
                size="large"
                sx={{ minWidth: 120 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                size="large"
                sx={{ 
                  minWidth: 120,
                  bgcolor: '#8B0000', 
                  '&:hover': { bgcolor: '#6B0000' } 
                }}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    );
  }

  // NORMAL VIEW
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: '#f5f5f5' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '400px', md: '500px' },
          background: `linear-gradient(135deg, ${colorScheme.primary} 0%, ${colorScheme.primary}dd 100%)`,
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {dynasty.image && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${dynasty.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.2,
            }}
          />
        )}

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <IconButton
            onClick={() => navigate('/')}
            sx={{
              position: 'absolute',
              top: -40,
              left: 0,
              color: '#fff',
              bgcolor: 'rgba(255,255,255,0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
            }}
          >
            <ArrowBack />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            {dynasty.flag && (
              <Avatar
                src={dynasty.flag}
                alt={getContent(dynasty.name)}
                sx={{
                  width: { xs: 80, md: 120 },
                  height: { xs: 80, md: 120 },
                  border: '4px solid #fff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                }}
              />
            )}

            <Box>
              <Typography
                variant="h2"
                sx={{
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '3.5rem' },
                  textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                  mb: 1
                }}
              >
                {getContent(dynasty.name)}
              </Typography>

              {dynasty.period && (
                <Chip
                  label={getContent(dynasty.period)}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.9)',
                    color: colorScheme.primary,
                    fontWeight: 600,
                    fontSize: '1rem',
                    py: 2.5,
                    px: 1
                  }}
                />
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              startIcon={userLiked ? <Favorite /> : <FavoriteBorder />}
              onClick={handleLike}
              variant="contained"
              sx={{
                bgcolor: 'rgba(255,255,255,0.9)',
                color: colorScheme.primary,
                '&:hover': { bgcolor: '#fff' }
              }}
            >
              {likes} {t('common.likes', 'Likes')}
            </Button>

            {user && user.role === 'admin' && (
              <Button
                startIcon={<EditIcon />}
                onClick={enterEditMode}
                variant="contained"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.9)',
                  color: colorScheme.primary,
                  '&:hover': { bgcolor: '#fff' }
                }}
              >
                {t('common.edit', 'Edit')}
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Main Column */}
          <Grid item xs={12} md={8}>
            {/* Description */}
            {dynasty.description && (
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {t('dynasty.overview', 'Overview')}
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#444' }}>
                  {getContent(dynasty.description)}
                </Typography>
              </Paper>
            )}

            {/* Achievements */}
            {dynasty.achievements && (
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3, bgcolor: colorScheme.secondary }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <EmojiEvents sx={{ fontSize: 40, color: colorScheme.primary }} />
                  <Typography variant="h5" fontWeight={700}>
                    {t('dynasty.achievements', 'Major Achievements')}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#444', whiteSpace: 'pre-line' }}>
                  {getContent(dynasty.achievements)}
                </Typography>
              </Paper>
            )}

            {/* Military Strength */}
            {dynasty.militaryStrength && (
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <MilitaryTech sx={{ fontSize: 40, color: colorScheme.primary }} />
                  <Typography variant="h5" fontWeight={700}>
                    {t('dynasty.military', 'Military Strength')}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#444', whiteSpace: 'pre-line' }}>
                  {getContent(dynasty.militaryStrength)}
                </Typography>
              </Paper>
            )}

            {/* Cultural Contributions */}
            {dynasty.culturalContributions && (
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3, bgcolor: colorScheme.secondary }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Groups sx={{ fontSize: 40, color: colorScheme.primary }} />
                  <Typography variant="h5" fontWeight={700}>
                    {t('dynasty.cultural', 'Cultural Contributions')}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#444', whiteSpace: 'pre-line' }}>
                  {getContent(dynasty.culturalContributions)}
                </Typography>
              </Paper>
            )}

            {/* Architecture */}
            {dynasty.architecture && (
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Architecture sx={{ fontSize: 40, color: colorScheme.primary }} />
                  <Typography variant="h5" fontWeight={700}>
                    {t('dynasty.architecture', 'Architecture')}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#444', whiteSpace: 'pre-line' }}>
                  {getContent(dynasty.architecture)}
                </Typography>
              </Paper>
            )}

            {/* Trade and Economy */}
            {dynasty.tradeAndEconomy && (
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3, bgcolor: colorScheme.secondary }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <AccountBalance sx={{ fontSize: 40, color: colorScheme.primary }} />
                  <Typography variant="h5" fontWeight={700}>
                    {t('dynasty.economy', 'Trade & Economy')}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#444', whiteSpace: 'pre-line' }}>
                  {getContent(dynasty.tradeAndEconomy)}
                </Typography>
              </Paper>
            )}

            {/* Legacy */}
            {dynasty.legacy && (
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Castle sx={{ fontSize: 40, color: colorScheme.primary }} />
                  <Typography variant="h5" fontWeight={700}>
                    {t('dynasty.legacy', 'Legacy')}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#444', whiteSpace: 'pre-line' }}>
                  {getContent(dynasty.legacy)}
                </Typography>
              </Paper>
            )}

            {/* Content Sections */}
            {dynasty.contentSections && dynasty.contentSections.length > 0 && (
              <Box sx={{ mb: 4 }}>
                {dynasty.contentSections.map((section, index) => (
                  <Paper key={index} elevation={0} sx={{ p: 4, mb: 3, borderRadius: 3 }}>
                    {section.subtitle && (
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        {getContent(section.subtitle)}
                      </Typography>
                    )}
                    {section.content && (
                      <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#444', mb: 2 }}>
                        {getContent(section.content)}
                      </Typography>
                    )}
                    {section.imageUrl && (
                      <Box sx={{ my: 3 }}>
                        <img
                          src={section.imageUrl}
                          alt={getContent(section.subtitle)}
                          style={{ width: '100%', borderRadius: '12px' }}
                        />
                      </Box>
                    )}
                    {section.videoUrl && (
                      <Box sx={{ my: 3 }}>
                        <MediaDisplay videoUrl={section.videoUrl} />
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>
            )}

            {/* Comments Section */}
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {t('common.comments', 'Comments')} ({comments.length})
              </Typography>

              {user ? (
                <Box sx={{ mb: 4 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder={t('common.writeComment', 'Write a comment...')}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    endIcon={<Send />}
                    onClick={handleCommentSubmit}
                    sx={{ bgcolor: colorScheme.primary }}
                  >
                    {t('common.post', 'Post')}
                  </Button>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mb: 4 }}>
                  {t('common.loginToComment', 'Please log in to comment')}
                </Alert>
              )}

              {/* Comments List */}
              {comments.map((comment) => (
                <Box key={comment._id} sx={{ mb: 3, p: 3, bgcolor: '#f9f9f9', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: colorScheme.primary }}>
                        {comment.user?.name?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={600}>
                          {comment.user?.name || 'Anonymous'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>

                    {user && (user._id === comment.user?._id || user.role === 'admin') && (
                      <IconButton
                        size="small"
                        onClick={() => {
                          setItemToDelete(comment._id);
                          setDeleteType('comment');
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>

                  <Typography sx={{ mb: 2 }}>{comment.content}</Typography>

                  <Button
                    size="small"
                    startIcon={<Reply />}
                    onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                  >
                    {t('common.reply', 'Reply')}
                  </Button>

                  {/* Reply Form */}
                  {replyingTo === comment._id && user && (
                    <Box sx={{ mt: 2, pl: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={t('common.writeReply', 'Write a reply...')}
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        sx={{ mb: 1 }}
                      />
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleReplySubmit(comment._id)}
                        sx={{ bgcolor: colorScheme.primary }}
                      >
                        {t('common.post', 'Post')}
                      </Button>
                    </Box>
                  )}

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <Box sx={{ mt: 2, pl: 4, borderLeft: `2px solid ${colorScheme.primary}` }}>
                      {comment.replies.map((reply) => (
                        <Box key={reply._id} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Avatar sx={{ width: 28, height: 28, bgcolor: colorScheme.primary }}>
                                {reply.user?.name?.charAt(0) || 'U'}
                              </Avatar>
                              <Typography variant="body2" fontWeight={600}>
                                {reply.user?.name || 'Anonymous'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                · {new Date(reply.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>

                            {user && (user._id === reply.user?._id || user.role === 'admin') && (
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setItemToDelete({ commentId: comment._id, replyId: reply._id });
                                  setDeleteType('reply');
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                          <Typography variant="body2">{reply.content}</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ))}
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Quick Info */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: colorScheme.secondary }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {t('dynasty.quickInfo', 'Quick Info')}
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {dynasty.capital && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('dynasty.capital', 'Capital')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {getContent(dynasty.capital)}
                  </Typography>
                </Box>
              )}

              {dynasty.territory && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('dynasty.territory', 'Territory')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {getContent(dynasty.territory)}
                  </Typography>
                </Box>
              )}

              {dynasty.rulers && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t('dynasty.famousRulers', 'Famous Rulers')}
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ whiteSpace: 'pre-line' }}>
                    {getContent(dynasty.rulers)}
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* Related Links */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {t('dynasty.explore', 'Explore More')}
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate(`/explore/kings?dynasty=${dynasty.slug}`)}
                sx={{
                  mb: 2,
                  borderColor: colorScheme.primary,
                  color: colorScheme.primary,
                  '&:hover': { borderColor: colorScheme.primary, bgcolor: colorScheme.secondary }
                }}
              >
                {t('dynasty.viewKings', 'View Kings')}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate('/explore/temples')}
                sx={{
                  borderColor: colorScheme.primary,
                  color: colorScheme.primary,
                  '&:hover': { borderColor: colorScheme.primary, bgcolor: colorScheme.secondary }
                }}
              >
                {t('dynasty.viewTemples', 'View Temples')}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>
          {t('common.confirmDelete', 'Confirm Delete')}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {t('common.confirmDeleteMessage', 'Are you sure you want to delete this item?')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            color="error"
            onClick={() => {
              if (deleteType === 'comment') {
                handleDeleteComment(itemToDelete);
              } else if (deleteType === 'reply') {
                handleDeleteReply(itemToDelete.commentId, itemToDelete.replyId);
              }
            }}
          >
            {t('common.delete', 'Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DynastyDetail;
