import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CardMedia,
  Tooltip,
  Paper,
  Grid,
  Container,
} from "@mui/material";
import { Favorite, FavoriteBorder, Download, Edit as EditIcon, Delete as DeleteIcon, ChevronLeft, ChevronRight } from '@mui/icons-material';
import MediaUpload from "./common/MediaUpload";
import MediaDisplay from "./common/MediaDisplay";
import OptimizedImage from "./common/OptimizedImage";
import API_BASE_URL from '../utils/api';
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import SEO from './common/SEO';

// Base categories (labels are translation keys)
const BASE_CATEGORIES = [
  { value: 'Kings', labelKey: 'gallery.category.kings' },
  { value: 'Leaders', labelKey: 'gallery.category.leaders' },
  { value: 'Poets', labelKey: 'gallery.category.poets' },
  { value: 'Freedom Fighters', labelKey: 'gallery.category.freedomFighters' },
  { value: 'Artists', labelKey: 'gallery.category.artists' },
  { value: 'Temples', labelKey: 'gallery.category.temples' },
  { value: 'Cultural Events', labelKey: 'gallery.category.culturalEvents' },
  { value: 'Traditional Crafts', labelKey: 'gallery.category.traditionalCrafts' },
  { value: 'Other', labelKey: 'gallery.category.other' }
];

let cachedAllGalleryItems = null;

// helper slug (supports unicode) used for custom categories
const slugify = (str) => {
  if (!str) return '';
  const s = str.toString().toLowerCase().trim();
  return s.normalize('NFKD').replace(/[^ - \p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');
};

export default function GalleryDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const hasCachedDetails = !!(cachedAllGalleryItems && cachedAllGalleryItems.some(item => item._id === id));
  const [galleryItem, setGalleryItem] = useState(() => {
    return cachedAllGalleryItems ? cachedAllGalleryItems.find(item => item._id === id) || null : null;
  });
  const [loading, setLoading] = useState(!hasCachedDetails);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState(() => {
    const data = cachedAllGalleryItems ? cachedAllGalleryItems.find(item => item._id === id) : null;
    if (!data) {
      return {
        name_en: "",
        name_ta: "",
        description_en: "",
        description_ta: "",
        category: "",
        custom_en: "",
        custom_ta: "",
        era: "",
        keywords: "",
        imageUrl: "",
        videoUrl: "",
      };
    }
    let catValue = data.category || "";
    let cEn = data.customCategoryName?.en || '';
    let cTa = data.customCategoryName?.ta || '';

    if (data.customCategoryName && (data.customCategoryName.en || data.customCategoryName.ta)) {
      const base = data.customCategoryName.en || data.customCategoryName.ta;
      catValue = `CUSTOM:${base.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
    }

    return {
      name_en: data.name?.en || "",
      name_ta: data.name?.ta || "",
      description_en: data.description?.en || "",
      description_ta: data.description?.ta || "",
      category: catValue,
      custom_en: cEn,
      custom_ta: cTa,
      era: data.era || "",
      keywords: Array.isArray(data.keywords) ? data.keywords.join(', ') : "",
      imageUrl: data.imageUrl || "",
      videoUrl: data.videoUrl || "",
    };
  });
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [siblingPhotos, setSiblingPhotos] = useState([]);

  const getContent = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return i18n.language === 'ta' && field.ta ? field.ta : field.en || '';
  };

  useEffect(() => {
    const resolveSiblings = (allData, currentItem) => {
      const normalize = (value) => (value || '').toString().trim().toLowerCase();
      
      const currentItemFolderEn = currentItem.customCategoryName?.en || '';
      const currentItemFolderTa = currentItem.customCategoryName?.ta || '';
      const currentItemCategory = currentItem.category || '';
      
      return allData.filter(item => {
        if (item.isFolder) return false;
        const isLegacy = (
          item.category === 'Other' &&
          item.customCategoryName &&
          (item.customCategoryName.en || item.customCategoryName.ta) &&
          (item.name?.en?.includes(' - Folder') || item.name?.ta?.includes(' - Folder'))
        );
        if (isLegacy) return false;
        
        if (currentItemCategory === 'Other' && (currentItemFolderEn || currentItemFolderTa)) {
          const itemFolderEn = item.customCategoryName?.en || '';
          const itemFolderTa = item.customCategoryName?.ta || '';
          return (
            (currentItemFolderEn && normalize(itemFolderEn) === normalize(currentItemFolderEn)) ||
            (currentItemFolderTa && normalize(itemFolderTa) === normalize(currentItemFolderTa))
          );
        }
        
        return item.category === currentItemCategory;
      }).sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
    };

    if (cachedAllGalleryItems) {
      // Find current item in cache
      const data = cachedAllGalleryItems.find(item => item._id === id);
      if (data) {
        setGalleryItem(data);
        
        // Prepare editable data
        let catValue = data.category || "";
        let cEn = data.customCategoryName?.en || '';
        let cTa = data.customCategoryName?.ta || '';

        if (data.customCategoryName && (data.customCategoryName.en || data.customCategoryName.ta)) {
          const base = data.customCategoryName.en || data.customCategoryName.ta;
          catValue = `CUSTOM:${slugify(base)}`;
        }

        setEditableData({
          name_en: data.name?.en || "",
          name_ta: data.name?.ta || "",
          description_en: data.description?.en || "",
          description_ta: data.description?.ta || "",
          category: catValue,
          custom_en: cEn,
          custom_ta: cTa,
          era: data.era || "",
          keywords: Array.isArray(data.keywords) ? data.keywords.join(', ') : "",
          imageUrl: data.imageUrl || "",
          videoUrl: data.videoUrl || "",
        });

        // Resolve siblings instantly from cache
        const siblings = resolveSiblings(cachedAllGalleryItems, data);
        setSiblingPhotos(siblings);
        setLoading(false);

        // Fetch details silently in background to keep fresh
        fetch(`${API_BASE_URL}/api/gallery/${id}`)
          .then(res => res.json())
          .then(freshData => {
            setGalleryItem(freshData);
            // Update item in our cachedAllGalleryItems array
            cachedAllGalleryItems = cachedAllGalleryItems.map(item => item._id === freshData._id ? freshData : item);
          })
          .catch(err => console.error("Silent background refetch failed:", err));
        return;
      }
    }

    // Normal full fetch flow (if cache is missing or item is not in cache)
    setLoading(true);
    fetch(`${API_BASE_URL}/api/gallery/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch gallery item");
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setGalleryItem(data);

        // Prepare editable data
        let catValue = data.category || "";
        let cEn = data.customCategoryName?.en || '';
        let cTa = data.customCategoryName?.ta || '';

        if (data.customCategoryName && (data.customCategoryName.en || data.customCategoryName.ta)) {
          const base = data.customCategoryName.en || data.customCategoryName.ta;
          catValue = `CUSTOM:${slugify(base)}`;
        }

        setEditableData({
          name_en: data.name?.en || "",
          name_ta: data.name?.ta || "",
          description_en: data.description?.en || "",
          description_ta: data.description?.ta || "",
          category: catValue,
          custom_en: cEn,
          custom_ta: cTa,
          era: data.era || "",
          keywords: Array.isArray(data.keywords) ? data.keywords.join(', ') : "",
          imageUrl: data.imageUrl || "",
          videoUrl: data.videoUrl || "",
        });

        // Fetch all gallery items to cache them and resolve siblings
        return fetch(`${API_BASE_URL}/api/gallery`)
          .then((res) => res.json())
          .then((allData) => {
            cachedAllGalleryItems = allData;
            const siblings = resolveSiblings(allData, data);
            setSiblingPhotos(siblings);
            setLoading(false);
          });
      })
      .catch((err) => {
        console.error("Error loading gallery item details:", err);
        setError("Failed to load gallery item details");
        setLoading(false);
      });
  }, [id, i18n.language]);

  // Sibling next/prev calculations
  const currentIndex = siblingPhotos.findIndex(item => item._id === id);
  const prevPhoto = currentIndex > 0 ? siblingPhotos[currentIndex - 1] : null;
  const nextPhoto = currentIndex >= 0 && currentIndex < siblingPhotos.length - 1 ? siblingPhotos[currentIndex + 1] : null;

  // Keyboard navigation hook
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && prevPhoto) {
        navigate(`/gallery/${prevPhoto._id}`, { state: location.state });
      } else if (e.key === 'ArrowRight' && nextPhoto) {
        navigate(`/gallery/${nextPhoto._id}`, { state: location.state });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevPhoto, nextPhoto, navigate, location.state]);

  const handlePrevClick = () => {
    if (prevPhoto) {
      navigate(`/gallery/${prevPhoto._id}`, { state: location.state });
    }
  };

  const handleNextClick = () => {
    if (nextPhoto) {
      navigate(`/gallery/${nextPhoto._id}`, { state: location.state });
    }
  };

  const handleSave = async () => {
    setSubmitting(true);
    setError(null);
    if (!editableData.name_en.trim()) {
      setError("Name (English) is required");
      setSubmitting(false);
      return;
    }
    try {
      const keywordsArray = editableData.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k);

      // Resolve category and customCategoryName
      let finalCategory = editableData.category;
      let finalCustom = null;

      if (finalCategory && finalCategory.startsWith('CUSTOM:')) {
        finalCategory = 'Other';
        finalCustom = {
          en: editableData.custom_en || (galleryItem.customCategoryName?.en || ''),
          ta: editableData.custom_ta || (galleryItem.customCategoryName?.ta || '')
        };
      } else if (finalCategory === 'Other') {
        if (editableData.custom_en || editableData.custom_ta) {
          finalCustom = { en: editableData.custom_en, ta: editableData.custom_ta };
        }
      }

      const res = await fetch(`${API_BASE_URL}/api/gallery/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: { en: editableData.name_en, ta: editableData.name_ta },
          description: { en: editableData.description_en, ta: editableData.description_ta },
          category: finalCategory,
          ...(finalCustom ? { customCategoryName: finalCustom } : {}),
          era: editableData.era,
          keywords: keywordsArray,
          imageUrl: editableData.imageUrl,
          videoUrl: editableData.videoUrl,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update gallery item");
      }
      setIsEditing(false);
      // Ideally refresh data here
      window.location.reload();
    } catch (err) {
      setError(err.message || "Failed to update gallery item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this gallery item?")) {
      try {
        await fetch(`${API_BASE_URL}/api/gallery/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        navigate(`/gallery`);
      } catch {
        setError("Failed to delete gallery item");
      }
    }
  };

  const toAbsoluteMediaUrl = (url) => {
    if (!url) return url;
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('data:')) return url;
    const withLeading = url.startsWith('/') ? url : `/${url}`;
    return `${API_BASE_URL}${withLeading}`;
  };

  const handleDownload = () => {
    const abs = toAbsoluteMediaUrl(galleryItem.imageUrl);
    if (abs) {
      const link = document.createElement('a');
      link.href = abs;
      link.download = `${getContent(galleryItem.name).replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    // You can add API call here to persist likes to the server
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '85vh' }}>
        <CircularProgress sx={{ color: '#8B0000' }} />
      </Box>
    );
  }
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!galleryItem) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Gallery Item Not Found
        </Typography>
        <Typography variant="body1">
          The gallery item you are looking for does not exist or has been
          removed.
        </Typography>
      </Box>
    );
  }

  // --- ADMIN EDIT VIEW ---
  if (isEditing) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper elevation={0} sx={{ p: 5, border: '1px solid #e0e0e0', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, borderBottom: '1px solid #eee', pb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: '"Playfair Display", serif', color: '#1a1a1a' }}>
              Edit Gallery Item
            </Typography>
            <IconButton onClick={() => setIsEditing(false)}><EditIcon /></IconButton>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <TextField label="Name (EN)" value={editableData.name_en} onChange={(e) => setEditableData({ ...editableData, name_en: e.target.value })} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Name (TA)" value={editableData.name_ta} onChange={(e) => setEditableData({ ...editableData, name_ta: e.target.value })} fullWidth />
            </Grid>

            {/* Category */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={editableData.category}
                  label="Category"
                  onChange={(e) => setEditableData({ ...editableData, category: e.target.value })}
                >
                  {BASE_CATEGORIES.map((c) => (
                    <MenuItem key={c.value} value={c.value}>{t(c.labelKey)}</MenuItem>
                  ))}
                  {galleryItem.customCategoryName && (function () {
                    const base = galleryItem.customCategoryName.en || galleryItem.customCategoryName.ta;
                    const slug = base.toString().toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                    return (
                      <MenuItem key={`custom-${slug}`} value={`CUSTOM:${slug}`}>
                        {getContent(galleryItem.customCategoryName)}
                      </MenuItem>
                    );
                  })()}
                </Select>
              </FormControl>
            </Grid>

            {(editableData.category === 'Other' || (typeof editableData.category === 'string' && editableData.category.startsWith('CUSTOM:'))) && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    label={t('gallery.form.customCategoryEn')}
                    value={editableData.custom_en}
                    onChange={(e) => setEditableData({ ...editableData, custom_en: e.target.value })}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label={t('gallery.form.customCategoryTa')}
                    value={editableData.custom_ta}
                    onChange={(e) => setEditableData({ ...editableData, custom_ta: e.target.value })}
                    fullWidth
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} md={6}>
              <TextField label="Era / Period" value={editableData.era} onChange={(e) => setEditableData({ ...editableData, era: e.target.value })} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Keywords (comma separated)" value={editableData.keywords} onChange={(e) => setEditableData({ ...editableData, keywords: e.target.value })} fullWidth />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Description (EN)" value={editableData.description_en} onChange={(e) => setEditableData({ ...editableData, description_en: e.target.value })} fullWidth multiline rows={4} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description (TA)" value={editableData.description_ta} onChange={(e) => setEditableData({ ...editableData, description_ta: e.target.value })} fullWidth multiline rows={4} />
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
                  onVideoChange={(url) => setEditableData({ ...editableData, videoUrl: url })}
                  currentImage={editableData.imageUrl}
                  currentVideo={editableData.videoUrl}
                  label="Media Upload"
                  showInputsOnly={false}
                  onUploadingChange={setIsUploading}
                />
              </Box>
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                disabled={isUploading || submitting}
              >
                Delete
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
                disabled={isUploading || submitting}
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



  // Generate SEO data for normal view
  const itemName = getContent(galleryItem.name);
  const itemDescription = getContent(galleryItem.description);
  const categoryDisplay = galleryItem.category === 'Other' && galleryItem.customCategoryName
    ? getContent(galleryItem.customCategoryName)
    : galleryItem.category;
  const imageUrl = galleryItem.imageUrl ? (galleryItem.imageUrl.startsWith('http') ? galleryItem.imageUrl : `${window.location.origin}${galleryItem.imageUrl}`) : null;
  const pageUrl = `${window.location.origin}/gallery/${id}`;
  
  const seoTitle = `${itemName} | ${categoryDisplay} | Tamil Heritage Gallery`;
  const seoDescription = itemDescription 
    ? `${itemDescription.substring(0, 155)}...` 
    : `Explore ${itemName} - ${categoryDisplay} from Tamil Heritage. ${galleryItem.keywords ? galleryItem.keywords.join(', ') : ''} | Meenkodi`;
  const seoKeywords = [
    itemName,
    categoryDisplay,
    ...(galleryItem.keywords || []),
    'Tamil Heritage',
    'Tamil Culture',
    'Meenkodi',
    galleryItem.era || ''
  ].filter(Boolean).join(', ');

  // JSON-LD Schema for Google Image Search
  const imageSchema = imageUrl ? {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "contentUrl": imageUrl,
    "url": pageUrl,
    "name": itemName,
    "description": itemDescription || seoDescription,
    "license": `${window.location.origin}/faq`,
    "acquireLicensePage": `${window.location.origin}/faq`,
    "creator": {
      "@type": "Organization",
      "name": "Meenkodi Tamil Heritage Foundation"
    },
    "copyrightNotice": "Meenkodi Tamil Heritage Foundation",
    "creditText": "Meenkodi",
    "keywords": galleryItem.keywords ? galleryItem.keywords.join(', ') : '',
    "datePublished": galleryItem.createdAt || new Date().toISOString(),
    "inLanguage": ["en", "ta"],
    "isPartOf": {
      "@type": "CollectionPage",
      "name": `${categoryDisplay} Gallery`,
      "url": `${window.location.origin}/gallery`
    }
  } : null;

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
      {/* SEO Optimization */}
      <SEO 
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        image={imageUrl}
        url={pageUrl}
        type="article"
        schema={imageSchema}
      />

      {/* Back Button - Top Left and Like/Download - Top Right */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          onClick={() => {
            const fromFolder = location.state?.fromFolder;
            const folderName = location.state?.folderName;
            if (fromFolder && folderName) {
              const folderParam = encodeURIComponent(folderName);
              navigate(`/gallery?folder=${folderParam}`);
              return;
            }
            navigate('/gallery');
          }}
          variant="outlined"
          sx={{
            color: '#8B0000',
            borderColor: '#8B0000',
            borderWidth: 2,
            borderRadius: 0,
            px: 2,
            py: 0.7,
            fontWeight: 700,
            fontFamily: 'Georgia, serif',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            '&:hover': {
              bgcolor: '#8B0000',
              borderColor: '#8B0000',
              color: '#fff',
            }
          }}
        >
          ← Back
        </Button>

        {/* Like and Download Buttons - Top Right */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Tooltip title={t('actions.like') || 'Like'}>
              <IconButton
                onClick={handleLike}
                aria-label={t('actions.like')}
                sx={{
                  bgcolor: 'transparent',
                  color: liked ? '#8B0000' : '#8B0000',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  boxShadow: 'none',
                  border: '2px solid #8B0000',
                  '&:hover': { bgcolor: '#8B0000', color: '#fff', transform: 'scale(1.08)' },
                  transition: 'all 0.18s ease',
                }}
              >
                {liked ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
            </Tooltip>
          </Box>

          {galleryItem.imageUrl && (
            <Box sx={{ textAlign: 'center' }}>
              <Tooltip title={t('actions.download') || 'Download'}>
                <IconButton
                  onClick={handleDownload}
                  aria-label={t('actions.download')}
                  sx={{
                    bgcolor: 'transparent',
                    color: '#8B0000',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    boxShadow: 'none',
                    border: '2px solid #8B0000',
                    '&:hover': { bgcolor: '#8B0000', color: '#fff', transform: 'scale(1.08)' },
                    transition: 'all 0.18s ease',
                  }}
                >
                  <Download />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>

      <Box>

        {/* Full-size Image Display with Action Buttons */}
        {galleryItem.imageUrl && (
          <Box sx={{ position: 'relative', mb: 3, backgroundColor: 'transparent', p: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {prevPhoto && (
              <IconButton
                onClick={handlePrevClick}
                sx={{
                  position: 'absolute',
                  left: { xs: 8, md: '5%', lg: '10%' },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  color: '#8B0000',
                  border: '2px solid #8B0000',
                  zIndex: 5,
                  '&:hover': {
                    bgcolor: '#8B0000',
                    color: '#fff',
                  },
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  width: { xs: 40, md: 50 },
                  height: { xs: 40, md: 50 },
                  transition: 'all 0.2s ease',
                }}
              >
                <ChevronLeft sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }} />
              </IconButton>
            )}

            <OptimizedImage
              src={toAbsoluteMediaUrl(galleryItem.imageUrl)}
              alt={`${getContent(galleryItem.name)} - ${categoryDisplay} - Tamil Heritage | Meenkodi`}
              sx={{
                width: '100%',
                maxWidth: { xs: '100%', md: '70%', lg: '60%' },
                height: 'auto',
                maxHeight: { xs: '60vh', md: '70vh' },
                objectFit: 'contain',
                borderRadius: 0,
                boxShadow: 'none',
                backgroundColor: 'transparent',
                margin: '0 auto',
                transition: 'transform 0.25s ease',
              }}
              skeletonSx={{
                bgcolor: 'rgba(139, 0, 0, 0.08)',
                maxWidth: { xs: '100%', md: '70%', lg: '60%' },
                height: '400px',
                margin: '0 auto',
              }}
            />

            {nextPhoto && (
              <IconButton
                onClick={handleNextClick}
                sx={{
                  position: 'absolute',
                  right: { xs: 8, md: '5%', lg: '10%' },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  color: '#8B0000',
                  border: '2px solid #8B0000',
                  zIndex: 5,
                  '&:hover': {
                    bgcolor: '#8B0000',
                    color: '#fff',
                  },
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  width: { xs: 40, md: 50 },
                  height: { xs: 40, md: 50 },
                  transition: 'all 0.2s ease',
                }}
              >
                <ChevronRight sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }} />
              </IconButton>
            )}
          </Box>
        )}

        {galleryItem.videoUrl && !galleryItem.imageUrl && (
          <MediaDisplay
            imageUrl={galleryItem.imageUrl}
            videoUrl={galleryItem.videoUrl}
            title={getContent(galleryItem.name)}
          />
        )}

      </Box>


    </Box>
  );
}
