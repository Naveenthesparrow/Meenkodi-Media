import React, { useState, useEffect } from "react";
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
  Button,
  Container,
  IconButton,
  Grid,
  Paper,
  Chip,
  Divider,
  Avatar,
  Card,
  CardContent,
} from "@mui/material";
import {
  ArrowBack,
  Edit as EditIcon,
  Close,
  Favorite,
  FavoriteBorder,
  Send,
  Reply,
  Delete as DeleteIcon,
  FormatQuote,
  MenuBook,
  Psychology,
  Star,
  Place,
  CalendarToday,
  AutoStories,
  EmojiEvents,
} from "@mui/icons-material";
import { useBilingualContent } from "../../utils/bilingualContent";
import { useTranslation } from "react-i18next";
import SEO from "../common/SEO";

function PoetDetail({ user: initialUser }) {
  const user = initialUser;
  const { slug } = useParams();
  const navigate = useNavigate();
  const getContent = useBilingualContent();
  const { t } = useTranslation();
  const [poet, setPoet] = useState(null);
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

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState({
    name_en: "",
    name_ta: "",
    title_en: "",
    title_ta: "",
    period_en: "",
    period_ta: "",
    birthPlace_en: "",
    birthPlace_ta: "",
    description_en: "",
    description_ta: "",
    biography_en: "",
    biography_ta: "",
    contributions_en: "",
    contributions_ta: "",
    philosophy_en: "",
    philosophy_ta: "",
    legacy_en: "",
    legacy_ta: "",
    image: "",
    majorWorks: [],
    famousQuotes: [],
  });

  // Fetch poet data
  useEffect(() => {
    const fetchPoet = async () => {
      try {
        const res = await fetch(`/api/poets/${slug}`, {
          credentials: "include"
        });
        if (!res.ok) throw new Error("Failed to fetch poet");
        const data = await res.json();
        setPoet(data);
        setComments(data.comments || []);
        setLikes(data.likes?.length || 0);
        setUserLiked(user && data.likes?.includes(user._id));
        
        // Initialize editable data
        setEditableData({
          name_en: data.name?.en || "",
          name_ta: data.name?.ta || "",
          title_en: data.title?.en || "",
          title_ta: data.title?.ta || "",
          period_en: data.period?.en || "",
          period_ta: data.period?.ta || "",
          birthPlace_en: data.birthPlace?.en || "",
          birthPlace_ta: data.birthPlace?.ta || "",
          description_en: data.description?.en || "",
          description_ta: data.description?.ta || "",
          biography_en: data.biography?.en || "",
          biography_ta: data.biography?.ta || "",
          contributions_en: data.contributions?.en || "",
          contributions_ta: data.contributions?.ta || "",
          philosophy_en: data.philosophy?.en || "",
          philosophy_ta: data.philosophy?.ta || "",
          legacy_en: data.legacy?.en || "",
          legacy_ta: data.legacy?.ta || "",
          image: data.image || "",
          majorWorks: (data.majorWorks || []).map(work => ({
            title_en: work.title?.en || "",
            title_ta: work.title?.ta || "",
            description_en: work.description?.en || "",
            description_ta: work.description?.ta || "",
            id: Date.now() + Math.random()
          })),
          famousQuotes: (data.famousQuotes || []).map(quote => ({
            quote_en: quote.quote?.en || "",
            quote_ta: quote.quote?.ta || "",
            source_en: quote.source?.en || "",
            source_ta: quote.source?.ta || "",
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

    fetchPoet();
  }, [slug, user]);

  // Add major work
  const addMajorWork = () => {
    setEditableData(prev => ({
      ...prev,
      majorWorks: [
        ...prev.majorWorks,
        {
          title_en: "",
          title_ta: "",
          description_en: "",
          description_ta: "",
          id: Date.now() + Math.random()
        }
      ]
    }));
  };

  // Remove major work
  const removeMajorWork = (idToRemove) => {
    setEditableData(prev => ({
      ...prev,
      majorWorks: prev.majorWorks.filter(work => work.id !== idToRemove)
    }));
  };

  // Update major work
  const updateMajorWork = (id, field, value) => {
    setEditableData(prev => ({
      ...prev,
      majorWorks: prev.majorWorks.map(work =>
        work.id === id ? { ...work, [field]: value } : work
      )
    }));
  };

  // Add famous quote
  const addFamousQuote = () => {
    setEditableData(prev => ({
      ...prev,
      famousQuotes: [
        ...prev.famousQuotes,
        {
          quote_en: "",
          quote_ta: "",
          source_en: "",
          source_ta: "",
          id: Date.now() + Math.random()
        }
      ]
    }));
  };

  // Remove famous quote
  const removeFamousQuote = (idToRemove) => {
    setEditableData(prev => ({
      ...prev,
      famousQuotes: prev.famousQuotes.filter(quote => quote.id !== idToRemove)
    }));
  };

  // Update famous quote
  const updateFamousQuote = (id, field, value) => {
    setEditableData(prev => ({
      ...prev,
      famousQuotes: prev.famousQuotes.map(quote =>
        quote.id === id ? { ...quote, [field]: value } : quote
      )
    }));
  };

  // Save changes
  const handleSave = async () => {
    try {
      const payload = {
        name: { en: editableData.name_en, ta: editableData.name_ta },
        title: { en: editableData.title_en, ta: editableData.title_ta },
        period: { en: editableData.period_en, ta: editableData.period_ta },
        birthPlace: { en: editableData.birthPlace_en, ta: editableData.birthPlace_ta },
        description: { en: editableData.description_en, ta: editableData.description_ta },
        biography: { en: editableData.biography_en, ta: editableData.biography_ta },
        contributions: { en: editableData.contributions_en, ta: editableData.contributions_ta },
        philosophy: { en: editableData.philosophy_en, ta: editableData.philosophy_ta },
        legacy: { en: editableData.legacy_en, ta: editableData.legacy_ta },
        image: editableData.image,
        majorWorks: editableData.majorWorks.map(work => ({
          title: { en: work.title_en, ta: work.title_ta },
          description: { en: work.description_en, ta: work.description_ta }
        })),
        famousQuotes: editableData.famousQuotes.map(quote => ({
          quote: { en: quote.quote_en, ta: quote.quote_ta },
          source: { en: quote.source_en, ta: quote.source_ta }
        }))
      };

      const res = await fetch(`/api/poets/${poet._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update poet");

      const updatedPoet = await res.json();
      setPoet(updatedPoet);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // Handle like
  const handleLike = async () => {
    if (!user) {
      alert("Please log in to like");
      return;
    }

    try {
      const res = await fetch(`/api/poets/${poet._id}/like`, {
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
      const res = await fetch(`/api/poets/${poet._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newComment }),
      });

      if (!res.ok) throw new Error("Failed to post comment");

      const updatedPoet = await res.json();
      setComments(updatedPoet.comments);
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
        `/api/poets/${poet._id}/comments/${commentId}/replies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ content: newReply }),
        }
      );

      if (!res.ok) throw new Error("Failed to post reply");

      const updatedPoet = await res.json();
      setComments(updatedPoet.comments);
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
        `/api/poets/${poet._id}/comments/${commentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to delete comment");

      const updatedPoet = await res.json();
      setComments(updatedPoet.comments);
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle delete reply
  const handleDeleteReply = async (commentId, replyId) => {
    try {
      const res = await fetch(
        `/api/poets/${poet._id}/comments/${commentId}/replies/${replyId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to delete reply");

      const updatedPoet = await res.json();
      setComments(updatedPoet.comments);
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !poet) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error">{error || "Poet not found"}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/")}>
          {t('common.back', 'Back to Home')}
        </Button>
      </Container>
    );
  }

  const colorScheme = { primary: '#6B4423', secondary: '#FFF8F0' };

  // ADMIN EDIT VIEW
  if (isEditing && user && user.role === "admin") {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Paper elevation={0} sx={{ p: 5, border: '1px solid #e0e0e0', borderRadius: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, pb: 2, borderBottom: '1px solid #eee' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {t('poet.edit', 'Edit Poet')}
            </Typography>
            <IconButton onClick={() => setIsEditing(false)}>
              <Close />
            </IconButton>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Name (EN)"
                value={editableData.name_en}
                onChange={(e) => setEditableData({ ...editableData, name_en: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Name (TA)"
                value={editableData.name_ta}
                onChange={(e) => setEditableData({ ...editableData, name_ta: e.target.value })}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Title (EN)"
                value={editableData.title_en}
                onChange={(e) => setEditableData({ ...editableData, title_en: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Title (TA)"
                value={editableData.title_ta}
                onChange={(e) => setEditableData({ ...editableData, title_ta: e.target.value })}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Period (EN)"
                value={editableData.period_en}
                onChange={(e) => setEditableData({ ...editableData, period_en: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Period (TA)"
                value={editableData.period_ta}
                onChange={(e) => setEditableData({ ...editableData, period_ta: e.target.value })}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Birth Place (EN)"
                value={editableData.birthPlace_en}
                onChange={(e) => setEditableData({ ...editableData, birthPlace_en: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Birth Place (TA)"
                value={editableData.birthPlace_ta}
                onChange={(e) => setEditableData({ ...editableData, birthPlace_ta: e.target.value })}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Image URL"
                value={editableData.image}
                onChange={(e) => setEditableData({ ...editableData, image: e.target.value })}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description (EN)"
                value={editableData.description_en}
                onChange={(e) => setEditableData({ ...editableData, description_en: e.target.value })}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description (TA)"
                value={editableData.description_ta}
                onChange={(e) => setEditableData({ ...editableData, description_ta: e.target.value })}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Biography (EN)"
                value={editableData.biography_en}
                onChange={(e) => setEditableData({ ...editableData, biography_en: e.target.value })}
                fullWidth
                multiline
                rows={5}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Biography (TA)"
                value={editableData.biography_ta}
                onChange={(e) => setEditableData({ ...editableData, biography_ta: e.target.value })}
                fullWidth
                multiline
                rows={5}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Contributions (EN)"
                value={editableData.contributions_en}
                onChange={(e) => setEditableData({ ...editableData, contributions_en: e.target.value })}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Contributions (TA)"
                value={editableData.contributions_ta}
                onChange={(e) => setEditableData({ ...editableData, contributions_ta: e.target.value })}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Philosophy (EN)"
                value={editableData.philosophy_en}
                onChange={(e) => setEditableData({ ...editableData, philosophy_en: e.target.value })}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Philosophy (TA)"
                value={editableData.philosophy_ta}
                onChange={(e) => setEditableData({ ...editableData, philosophy_ta: e.target.value })}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Legacy (EN)"
                value={editableData.legacy_en}
                onChange={(e) => setEditableData({ ...editableData, legacy_en: e.target.value })}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Legacy (TA)"
                value={editableData.legacy_ta}
                onChange={(e) => setEditableData({ ...editableData, legacy_ta: e.target.value })}
                fullWidth
                multiline
                rows={4}
              />
            </Grid>

            {/* Major Works Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>Major Works</Typography>
                <Button startIcon={<MenuBook />} onClick={addMajorWork} variant="outlined">
                  Add Work
                </Button>
              </Box>
              
              {editableData.majorWorks.map((work, index) => (
                <Paper key={work.id} elevation={0} sx={{ p: 3, mb: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600}>Work #{index + 1}</Typography>
                    <IconButton size="small" onClick={() => removeMajorWork(work.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Title (EN)"
                        value={work.title_en}
                        onChange={(e) => updateMajorWork(work.id, 'title_en', e.target.value)}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Title (TA)"
                        value={work.title_ta}
                        onChange={(e) => updateMajorWork(work.id, 'title_ta', e.target.value)}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Description (EN)"
                        value={work.description_en}
                        onChange={(e) => updateMajorWork(work.id, 'description_en', e.target.value)}
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Description (TA)"
                        value={work.description_ta}
                        onChange={(e) => updateMajorWork(work.id, 'description_ta', e.target.value)}
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Grid>

            {/* Famous Quotes Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>Famous Quotes</Typography>
                <Button startIcon={<FormatQuote />} onClick={addFamousQuote} variant="outlined">
                  Add Quote
                </Button>
              </Box>
              
              {editableData.famousQuotes.map((quote, index) => (
                <Paper key={quote.id} elevation={0} sx={{ p: 3, mb: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600}>Quote #{index + 1}</Typography>
                    <IconButton size="small" onClick={() => removeFamousQuote(quote.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Quote (EN)"
                        value={quote.quote_en}
                        onChange={(e) => updateFamousQuote(quote.id, 'quote_en', e.target.value)}
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Quote (TA)"
                        value={quote.quote_ta}
                        onChange={(e) => updateFamousQuote(quote.id, 'quote_ta', e.target.value)}
                        fullWidth
                        size="small"
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Source (EN)"
                        value={quote.source_en}
                        onChange={(e) => updateFamousQuote(quote.id, 'source_en', e.target.value)}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Source (TA)"
                        value={quote.source_ta}
                        onChange={(e) => updateFamousQuote(quote.id, 'source_ta', e.target.value)}
                        fullWidth
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 4, pt: 3, borderTop: '1px solid #eee' }}>
            <Button variant="contained" onClick={handleSave} size="large">
              {t('common.save', 'Save Changes')}
            </Button>
            <Button variant="outlined" onClick={() => setIsEditing(false)} size="large">
              {t('common.cancel', 'Cancel')}
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  // PUBLIC VIEW
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      <SEO 
        title={poet ? `${getContent(poet.name)} - Tamil Poet & Scholar` : 'Tamil Poet'}
        description={poet ? (getContent(poet.description) || `Explore works and legacy of ${getContent(poet.name)} during ${getContent(poet.period) || 'ancient Tamil period'}.`).slice(0, 160) : 'Discover ancient Tamil poets.'}
        keywords={poet ? `${getContent(poet.name)}, Tamil Poets, Sangam Literature, ${getContent(poet.period) || ''}, Meenkodi` : 'Tamil Poets, Sangam Literature'}
        image={poet?.image || undefined}
        url={`https://www.meenkodi.com/poets/${slug}`}
        type="article"
      />
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${colorScheme.primary} 0%, #8B5A2B 100%)`,
          py: { xs: 6, md: 10 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {poet.image && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${poet.image})`,
              backgroundSize: 'cover',
              backgroundPosition: poet.imagePosition || 'center',
              opacity: 0.15,
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
            {poet.image && (
              <Avatar
                src={poet.image}
                alt={getContent(poet.name)}
                sx={{
                  width: { xs: 100, md: 150 },
                  height: { xs: 100, md: 150 },
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
                  fontSize: { xs: '1.8rem', md: '3rem' },
                  textShadow: '2px 2px 8px rgba(0,0,0,0.5)',
                  mb: 1
                }}
              >
                {getContent(poet.name)}
              </Typography>

              {poet.title && (
                <Typography
                  variant="h5"
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: 500,
                    fontSize: { xs: '1rem', md: '1.3rem' },
                    mb: 2
                  }}
                >
                  {getContent(poet.title)}
                </Typography>
              )}

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {poet.period && (
                  <Chip
                    icon={<CalendarToday sx={{ fontSize: 16 }} />}
                    label={getContent(poet.period)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.9)',
                      color: colorScheme.primary,
                      fontWeight: 600,
                    }}
                  />
                )}
                {poet.birthPlace && (
                  <Chip
                    icon={<Place sx={{ fontSize: 16 }} />}
                    label={getContent(poet.birthPlace)}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.9)',
                      color: colorScheme.primary,
                      fontWeight: 600,
                    }}
                  />
                )}
              </Box>
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
                onClick={() => setIsEditing(true)}
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
            {poet.description && (
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {t('poet.about', 'About')}
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#444' }}>
                  {getContent(poet.description)}
                </Typography>
              </Paper>
            )}

            {/* Biography */}
            {poet.biography && (
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3, bgcolor: colorScheme.secondary }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <AutoStories sx={{ fontSize: 40, color: colorScheme.primary }} />
                  <Typography variant="h5" fontWeight={700}>
                    {t('poet.biography', 'Biography')}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#444', whiteSpace: 'pre-line' }}>
                  {getContent(poet.biography)}
                </Typography>
              </Paper>
            )}

            {/* Major Works */}
            {poet.majorWorks && poet.majorWorks.length > 0 && (
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <MenuBook sx={{ fontSize: 40, color: colorScheme.primary }} />
                  <Typography variant="h5" fontWeight={700}>
                    {t('poet.majorWorks', 'Major Works')}
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {poet.majorWorks.map((work, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card elevation={0} sx={{ bgcolor: colorScheme.secondary, height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" fontWeight={600} sx={{ color: colorScheme.primary, mb: 1 }}>
                            {getContent(work.title)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {getContent(work.description)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}

            {/* Famous Quotes */}
            {poet.famousQuotes && poet.famousQuotes.length > 0 && (
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3, bgcolor: colorScheme.secondary }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <FormatQuote sx={{ fontSize: 40, color: colorScheme.primary }} />
                  <Typography variant="h5" fontWeight={700}>
                    {t('poet.quotes', 'Famous Quotes')}
                  </Typography>
                </Box>
                {poet.famousQuotes.map((quote, index) => (
                  <Box key={index} sx={{ mb: 3, pl: 3, borderLeft: `4px solid ${colorScheme.primary}` }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontStyle: 'italic',
                        color: '#333',
                        mb: 1,
                        lineHeight: 1.6
                      }}
                    >
                      "{getContent(quote.quote)}"
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      — {getContent(quote.source)}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            )}

            {/* Contributions */}
            {poet.contributions && (
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Star sx={{ fontSize: 40, color: colorScheme.primary }} />
                  <Typography variant="h5" fontWeight={700}>
                    {t('poet.contributions', 'Contributions')}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#444', whiteSpace: 'pre-line' }}>
                  {getContent(poet.contributions)}
                </Typography>
              </Paper>
            )}

            {/* Philosophy */}
            {poet.philosophy && (
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3, bgcolor: colorScheme.secondary }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Psychology sx={{ fontSize: 40, color: colorScheme.primary }} />
                  <Typography variant="h5" fontWeight={700}>
                    {t('poet.philosophy', 'Philosophy')}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#444', whiteSpace: 'pre-line' }}>
                  {getContent(poet.philosophy)}
                </Typography>
              </Paper>
            )}

            {/* Legacy */}
            {poet.legacy && (
              <Paper elevation={0} sx={{ p: 4, mb: 4, borderRadius: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <EmojiEvents sx={{ fontSize: 40, color: colorScheme.primary }} />
                  <Typography variant="h5" fontWeight={700}>
                    {t('poet.legacy', 'Legacy')}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#444', whiteSpace: 'pre-line' }}>
                  {getContent(poet.legacy)}
                </Typography>
              </Paper>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Gallery */}
            {poet.gallery && poet.gallery.length > 0 && (
              <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {t('poet.gallery', 'Gallery')}
                </Typography>
                <Grid container spacing={1}>
                  {poet.gallery.map((img, index) => (
                    <Grid item xs={6} key={index}>
                      <Box
                        component="img"
                        src={img}
                        alt={`${getContent(poet.name)} ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: 120,
                          objectFit: 'cover',
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'scale(1.05)' }
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}

            {/* Comments Section */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {t('common.comments', 'Comments')} ({comments.length})
              </Typography>

              {/* Add Comment */}
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t('common.addComment', 'Add a comment...')}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCommentSubmit()}
                />
                <IconButton onClick={handleCommentSubmit} color="primary">
                  <Send />
                </IconButton>
              </Box>

              {/* Comments List */}
              {comments.map((comment) => (
                <Box key={comment._id} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: colorScheme.primary }}>
                      {comment.user?.displayName?.[0] || 'U'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {comment.user?.displayName || 'User'}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {comment.content}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Button
                          size="small"
                          startIcon={<Reply />}
                          onClick={() => setReplyingTo(comment._id)}
                        >
                          {t('common.reply', 'Reply')}
                        </Button>
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

                      {/* Reply Input */}
                      {replyingTo === comment._id && (
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder={t('common.writeReply', 'Write a reply...')}
                            value={newReply}
                            onChange={(e) => setNewReply(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleReplySubmit(comment._id)}
                          />
                          <IconButton onClick={() => handleReplySubmit(comment._id)} color="primary">
                            <Send />
                          </IconButton>
                        </Box>
                      )}

                      {/* Replies */}
                      {comment.replies && comment.replies.map((reply) => (
                        <Box key={reply._id} sx={{ ml: 4, mt: 1, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                          <Avatar sx={{ width: 24, height: 24, bgcolor: colorScheme.primary }}>
                            {reply.user?.displayName?.[0] || 'U'}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" fontWeight={600}>
                              {reply.user?.displayName || 'User'}
                            </Typography>
                            <Typography variant="body2">{reply.content}</Typography>
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
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('common.confirmDelete', 'Confirm Delete')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('common.deleteConfirmation', 'Are you sure you want to delete this?')}
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

export default PoetDetail;
