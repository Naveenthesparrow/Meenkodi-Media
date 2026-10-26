import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
  InputAdornment
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import Add from "@mui/icons-material/Add";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import GetApp from "@mui/icons-material/GetApp";
import Favorite from "@mui/icons-material/Favorite";
import SearchIcon from "@mui/icons-material/Search";
import AddPhotoAlternate from "@mui/icons-material/AddPhotoAlternate";
import MediaUpload from './common/MediaUpload';
import ArchiveBookField from './common/ArchiveBookField';
import BookCover from './common/BookCover';
import ReorderDialog from './common/ReorderDialog';
import SwapVert from "@mui/icons-material/SwapVert";
import { downloadLinkProps } from '../utils/download';
import { hasTamil } from '../utils/tamilText';
import SEO, { pageSEO } from './common/SEO';
import PageHeading from './common/PageHeading';

import { useBilingualContent } from "../utils/bilingualContent";
import { useTranslation } from 'react-i18next';
import API_BASE_URL from '../utils/api';
import cldImg from "../utils/cloudinaryImage";

let cachedResourcesData = null;

export default function Resources({ user }) {
  const getContent = useBilingualContent();
  const { t, i18n } = useTranslation();
  const [resourcesRaw, setResourcesRaw] = useState(cachedResourcesData || []);
  const setResources = (val) => {
    if (typeof val === 'function') {
      setResourcesRaw(prev => { const next = val(prev); cachedResourcesData = next; return next; });
    } else { cachedResourcesData = val; setResourcesRaw(val); }
  };
  const resources = resourcesRaw;
  // Search by title/author in either language; the slug also lets people find
  // Tamil titles by typing them in English letters
  const [search, setSearch] = useState('');
  const [openOrder, setOpenOrder] = useState(false);

  // Admin "Arrange order": save the new order, then show it right away
  const saveBookOrder = async (orderedIds) => {
    const res = await fetch(`${API_BASE_URL}/api/resources/order`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ orderedIds }),
    });
    if (!res.ok) throw new Error('Could not save the book order');
    setResources((prev) => orderedIds.map((id, i) => ({ ...prev.find((r) => r._id === id), order: i + 1 })));
  };
  const query = search.trim().toLowerCase();
  const visibleResources = !query ? resources : resources.filter((r) => {
    const field = (v) => (!v ? '' : typeof v === 'string' ? v : `${v.en || ''} ${v.ta || ''}`);
    const haystack = `${field(r.title)} ${field(r.author)} ${(r.slug || '').replace(/-/g, ' ')}`.toLowerCase();
    return query.split(/s+/).every((word) => haystack.includes(word));
  });
  const [loading, setLoading] = useState(!cachedResourcesData);
  const [error, setError] = useState(null);
  // Save errors show inside the dialog (typed data stays); delete errors as a toast
  const [dialogError, setDialogError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editLanguage, setEditLanguage] = useState('ta');
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [currentResource, setCurrentResource] = useState({
    title_en: '', title_ta: '',
    description_en: '', description_ta: '',
    category_en: '', category_ta: '',
    author_en: '', author_ta: '',
    image: '',
    downloadLink: '',
    pdfName: '',
    pdfSize: '',
    archiveId: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    if (!cachedResourcesData) setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/resources`);
      if (!response.ok) throw new Error('Failed to fetch resources');
      const data = await response.json();
      setResources(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching resources:', err);
      if (!cachedResourcesData) { setError(err.message); setResources(dummyResources); }
      setLoading(false);
    }
  };

  // Dummy data for Resources
  const dummyResources = [
    {
      _id: "1",
      title: "Ancient Tamil Literature",
      description: "A collection of classical Tamil literary works, including Sangam literature and epics.",
      category: "Books",
      author: "Various Ancient Poets",
      image: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
      downloadLink: "#",
      createdAt: new Date(),
    },
    {
      _id: "2",
      title: "Tamil History Documentary",
      description: "A documentary exploring the rich history and cultural heritage of the Tamil people.",
      category: "Videos",
      author: "Tamil Heritage Foundation",
      image: "data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'1200\' height=\'600\' viewBox=\'0 0 1200 600\'%3E%3Crect fill=\'%23cccccc\' width=\'1200\' height=\'600\'%3E%3C/rect%3E%3Ctext x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' font-family=\'monospace\' font-size=\'100px\' fill=\'%23333333\'%3E1200x600%3C/text%3E%3C/svg%3E",
      downloadLink: "#",
      createdAt: new Date(),
    },
  ];

  const handleAdd = () => {
    setCurrentResource({
      title_en: '', title_ta: '',
      description_en: '', description_ta: '',
      category_en: 'Sangam Literature', category_ta: 'சங்க இலக்கியம்',
      author_en: '', author_ta: '',
      image: '',
      downloadLink: '',
      pdfName: '',
      pdfSize: '',
      archiveId: '',
    });
    setDialogError(null);
    setOpenDialog(true);
  };

  const handleEdit = (resource) => {
    const part = (val, lang) => {
      if (!val) return '';
      if (typeof val === 'string') return lang === 'en' ? val : '';
      return val[lang] || '';
    };
    setCurrentResource({
      _id: resource._id,
      title_en: part(resource.title, 'en'), title_ta: part(resource.title, 'ta'),
      description_en: part(resource.description, 'en'), description_ta: part(resource.description, 'ta'),
      category_en: part(resource.category, 'en'), category_ta: part(resource.category, 'ta'),
      author_en: part(resource.author, 'en'), author_ta: part(resource.author, 'ta'),
      image: resource.image || '',
      downloadLink: resource.downloadLink || '',
      pdfName: resource.pdfName || '',
      pdfSize: resource.pdfSize || '',
      archiveId: resource.archiveId || '',
    });
    setDialogError(null);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const method = currentResource._id ? 'PUT' : 'POST';
      const url = currentResource._id
        ? `${API_BASE_URL}/api/resources/${currentResource.slug || currentResource._id}`
        : `${API_BASE_URL}/api/resources`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: { en: currentResource.title_en, ta: currentResource.title_ta },
          description: { en: currentResource.description_en, ta: currentResource.description_ta },
          category: { en: currentResource.category_en, ta: currentResource.category_ta },
          author: { en: currentResource.author_en, ta: currentResource.author_ta },
          image: currentResource.image,
          downloadLink: currentResource.downloadLink,
          pdfName: currentResource.pdfName,
          pdfSize: currentResource.pdfSize,
          archiveId: currentResource.archiveId || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save resource');
      }

      const savedResource = await response.json();

      if (method === 'POST') {
        setResources([...resources, savedResource]);
      } else {
        setResources(resources.map(resource =>
          resource._id === savedResource._id ? savedResource : resource
        ));
      }

      setOpenDialog(false);
    } catch (err) {
      setDialogError(err.message);
    }
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      setUploadingThumbnail(true);
      const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to upload thumbnail photo');
      const data = await response.json();
      const uploadedUrl = data.imageUrl || data.url;
      setCurrentResource(prev => ({ ...prev, image: uploadedUrl }));
    } catch (err) {
      console.error('Thumbnail upload error:', err);
      alert('Failed to upload thumbnail photo: ' + err.message);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/resources/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to delete resource');
        }

        setResources(resources.filter(resource => resource._id !== id));
      } catch (err) {
        setActionError(err.message);
      }
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{
      width: '100%',
      backgroundColor: '#fff',
      backgroundImage: {
        xs: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.02' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`,
        md: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.03' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`
      },
      backgroundSize: { xs: '8px 8px', md: '6px 6px' },
      backgroundRepeat: 'repeat',
      backgroundPosition: 'center top',
      '@media (min-resolution: 1.5dppx)': {
        backgroundImage: {
          xs: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.12' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`,
          md: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%23000000' fill-opacity='0.14' d='M2 12c1-3 6-7 12-5 4 1.5 7 5 8.5 7.5-1.5 2.5-4.5 5-8.5 5-6 0-11-4-12-7zM6 8L2 6v12l4-2V8z'/></svg>")`
        },
        backgroundSize: { xs: '18px 18px', md: '14px 14px' }
      }
    }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 2, sm: 3, md: 3 }, pb: 4, position: 'relative' }}>
        <SEO {...pageSEO.resources} />
        <PageHeading typographySx={{ fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.6rem' } }}>
          {t('resources.title', 'Resources')}
        </PageHeading>

        {/* Admin tools: on their own row (left), not over the heading */}
        {user && user.role === 'admin' && (
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'flex-start', mb: 2.5 }}>
            <Button
              onClick={handleAdd}
              variant="contained"
              startIcon={<Add />}
              sx={{ bgcolor: '#8B0000', color: '#fff', borderRadius: 0, px: 2.5, py: 1, fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', '&:hover': { bgcolor: '#6B0000' } }}
            >
              {t('resources.add', 'Add Resource')}
            </Button>
            <Button
              onClick={() => setOpenOrder(true)}
              variant="outlined"
              startIcon={<SwapVert />}
              sx={{ color: '#8B0000', borderColor: '#8B0000', borderRadius: 0, px: 2.5, py: 1, fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Georgia, serif', textTransform: 'uppercase', letterSpacing: '0.05em', '&:hover': { borderColor: '#6B0000', bgcolor: 'rgba(139,0,0,0.05)' } }}
            >
              {i18n.language === 'ta' ? 'வரிசையை மாற்று' : 'Arrange order'}
            </Button>
          </Box>
        )}

        {/* Search */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: { xs: 3, md: 4 }, mt: 1 }}>
          <TextField
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={i18n.language === 'ta' ? 'நூல் அல்லது ஆசிரியர் பெயரைத் தேடுங்கள்…' : 'Search books by title or author…'}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#8B0000' }} /></InputAdornment> }}
            sx={{
              flex: '1 1 280px',
              maxWidth: 520,
              bgcolor: '#fff',
              '& .MuiOutlinedInput-root': { borderRadius: 10 },
              '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#8B0000' },
            }}
          />
          <Typography sx={{ color: '#7a6a55', fontSize: '0.95rem' }}>
            {visibleResources.length} {i18n.language === 'ta' ? 'நூல்கள்' : (visibleResources.length === 1 ? 'book' : 'books')}
          </Typography>
        </Box>

        {visibleResources.length === 0 && (
          <Typography sx={{ textAlign: 'center', color: '#7a6a55', py: 8 }}>
            {i18n.language === 'ta' ? 'எந்த நூலும் கிடைக்கவில்லை' : 'No books match your search'}
          </Typography>
        )}

        {/* Bookshelf */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' },
            columnGap: { xs: 2, md: 3.5 },
            rowGap: { xs: 4, md: 5 },
            pb: 4,
          }}
        >
          {visibleResources.map((resource) => {
            const title = getContent(resource.title);
            const author = getContent(resource.author);
            const likes = resource.likes ? (Array.isArray(resource.likes) ? resource.likes.length : resource.likes) : 0;
            return (
              <Box
                key={resource._id}
                component={Link}
                to={`/resources/${resource.slug || resource._id}`}
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: 0,
                  '&:hover .book-cover': { transform: 'translateY(-6px)', boxShadow: '0 18px 34px rgba(0,0,0,0.25)' },
                  '&:hover .book-title': { color: '#B8860B' },
                  '&:hover .admin-actions': { opacity: 1 },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <BookCover
                    className="book-cover"
                    image={resource.image}
                    title={title}
                    author={author}
                    width={500}
                    sx={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                  />

                  {likes > 0 && (
                    <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.92)', px: 0.8, py: 0.2, borderRadius: 5, display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <Favorite sx={{ color: '#8B0000', fontSize: 14 }} />
                      <Typography sx={{ fontWeight: 700, fontSize: '0.75rem' }}>{likes}</Typography>
                    </Box>
                  )}

                  {user && user.role === 'admin' && (
                    <Box className="admin-actions" sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 0.5, opacity: { xs: 1, md: 0 }, transition: 'opacity 0.2s ease' }}>
                      <IconButton
                        size="small"
                        aria-label="Edit book"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(resource); }}
                        sx={{ bgcolor: 'rgba(0,0,0,0.75)', color: '#fff', width: 30, height: 30, '&:hover': { bgcolor: '#8B0000' } }}
                      >
                        <Edit sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="Delete book"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(resource._id); }}
                        sx={{ bgcolor: 'rgba(0,0,0,0.75)', color: '#fff', width: 30, height: 30, '&:hover': { bgcolor: '#8B0000' } }}
                      >
                        <Delete sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 1.5 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      className="book-title"
                      sx={{
                        fontWeight: 700,
                        color: '#8B0000',
                        fontFamily: 'Georgia, serif',
                        fontSize: { xs: '0.92rem', md: '1rem' },
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        transition: 'color 0.2s ease',
                      }}
                    >
                      {title}
                    </Typography>
                    {author && (
                      <Typography sx={{ color: '#6b5b45', fontSize: '0.8rem', mt: 0.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {author}
                      </Typography>
                    )}
                    {resource.pdfSize && (
                      <Typography sx={{ color: '#9a8a75', fontSize: '0.72rem', mt: 0.3 }}>
                        PDF · {resource.pdfSize}
                      </Typography>
                    )}
                  </Box>
                  {resource.downloadLink && (
                    <IconButton
                      {...downloadLinkProps(resource.downloadLink)}
                      onClick={(e) => e.stopPropagation()}
                      size="small"
                      aria-label={i18n.language === 'ta' ? 'பதிவிறக்கு' : 'Download PDF'}
                      title={i18n.language === 'ta' ? 'பதிவிறக்கு' : 'Download PDF'}
                      sx={{ color: '#B8860B', border: '1px solid rgba(184,134,11,0.5)', mt: 0.2, '&:hover': { bgcolor: '#B8860B', color: '#fff' } }}
                    >
                      <GetApp sx={{ fontSize: 18 }} />
                    </IconButton>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Arrange order dialog */}
        <ReorderDialog
          open={openOrder}
          onClose={() => setOpenOrder(false)}
          title={i18n.language === 'ta' ? 'நூல்களின் வரிசை' : 'Arrange books'}
          items={resources.map((r) => ({ id: r._id, title: getContent(r.title), subtitle: getContent(r.author), image: r.image }))}
          onSave={saveBookOrder}
        />

        {/* Edit/Add Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: 0,
              border: '3px solid #8B0000',
              maxHeight: '90vh',
            }
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: '#8B0000',
              color: '#fff',
              textAlign: 'center',
              fontWeight: 700,
              fontFamily: 'Georgia, serif',
              letterSpacing: '0.05em',
              py: 2
            }}
          >
            {currentResource._id ? t('resources.edit', 'Edit Resource') : t('resources.addNew', 'Add New Resource')}
          </DialogTitle>
          <DialogContent sx={{ p: 3, maxHeight: '90vh', overflow: 'auto' }}>
            {dialogError && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{dialogError}</Alert>}
            {/* Language Toggle */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1.5,
                  fontWeight: 600,
                  color: '#333',
                  fontSize: '0.9rem'
                }}
              >
                {i18n.language === 'ta' ? 'எழுத மொழியைத் தேர்ந்தெடுக்கவும்:' : 'Select Language to Edit:'}
              </Typography>
              <ToggleButtonGroup
                value={editLanguage}
                exclusive
                onChange={(e, newLang) => newLang && setEditLanguage(newLang)}
                sx={{
                  '& .MuiToggleButton-root': {
                    px: 3,
                    py: 1,
                    border: '1px solid #8B0000',
                    color: '#8B0000',
                    fontWeight: 600,
                    '&.Mui-selected': {
                      bgcolor: '#8B0000',
                      color: '#fff',
                      '&:hover': {
                        bgcolor: '#6B0000',
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="ta">தமிழ்</ToggleButton>
                <ToggleButton value="en">ENGLISH</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <TextField
              label={editLanguage === 'en' ? "Book Title" : "புத்தகத் தலைப்பு"}
              fullWidth
              sx={{ mb: 2 }}
              value={editLanguage === 'en' ? currentResource.title_en : currentResource.title_ta}
              onChange={(e) => setCurrentResource({
                ...currentResource,
                [editLanguage === 'en' ? 'title_en' : 'title_ta']: e.target.value
              })}
            />
            <TextField
              label={editLanguage === 'en' ? "Author Name" : "ஆசிரியர் பெயர்"}
              fullWidth
              sx={{ mb: 2 }}
              value={editLanguage === 'en' ? currentResource.author_en : currentResource.author_ta}
              onChange={(e) => setCurrentResource({
                ...currentResource,
                [editLanguage === 'en' ? 'author_en' : 'author_ta']: e.target.value
              })}
            />
            <TextField
              label={editLanguage === 'en' ? "Book Description" : "நூல் விளக்கம்"}
              fullWidth
              multiline
              minRows={4}
              sx={{ mb: 2.5 }}
              value={editLanguage === 'en' ? currentResource.description_en : currentResource.description_ta}
              onChange={(e) => setCurrentResource({
                ...currentResource,
                [editLanguage === 'en' ? 'description_en' : 'description_ta']: e.target.value
              })}
            />

            {/* Book hosted on archive.org (preferred: free, unlimited, keeps PDFs out of our database) */}
            <ArchiveBookField
              archiveId={currentResource.archiveId}
              language={editLanguage}
              onFetched={(book) => setCurrentResource((prev) => {
                // Only fill empty fields; Tamil text goes to the Tamil field
                const fill = (field, value) => {
                  if (!value) return {};
                  const key = `${field}_${hasTamil(value) ? 'ta' : 'en'}`;
                  return prev[key] ? {} : { [key]: value };
                };
                return {
                  ...prev,
                  ...fill('title', book.title),
                  ...fill('author', book.author),
                  ...fill('description', book.description),
                  image: prev.image || book.cover,
                  archiveId: book.archiveId,
                  downloadLink: book.downloadLink || prev.downloadLink,
                  pdfName: book.pdfName || prev.pdfName,
                  pdfSize: book.pdfSize || prev.pdfSize,
                };
              })}
              onClear={() => setCurrentResource((prev) => ({ ...prev, archiveId: '' }))}
            />

            {/* Upload Thumbnail Photo Only */}
            <Box sx={{ mb: 2.5, mt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#333', fontFamily: 'Georgia, serif' }}>
                {editLanguage === 'en' ? "Thumbnail Image" : "முகப்புப் படம்"}
              </Typography>
              {currentResource.image ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, border: '1px solid #ccc', borderRadius: 1, bgcolor: '#f9f9f9' }}>
                  <Box
                    component="img"
                    src={cldImg(currentResource.image, 1600)}
                    alt="Thumbnail Preview"
                    sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 1, border: '1px solid #ddd' }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 700, display: 'block' }}>
                      ✓ Thumbnail Photo Uploaded
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Photo ready for book card cover
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => setCurrentResource({ ...currentResource, image: '' })}
                  >
                    Remove
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  component="label"
                  disabled={uploadingThumbnail}
                  startIcon={uploadingThumbnail ? <CircularProgress size={18} /> : <AddPhotoAlternate />}
                  sx={{
                    color: '#8B0000',
                    borderColor: '#8B0000',
                    py: 1.2,
                    px: 3,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { bgcolor: 'rgba(139,0,0,0.05)', borderColor: '#8B0000' }
                  }}
                >
                  {uploadingThumbnail
                    ? (editLanguage === 'en' ? "Uploading Thumbnail..." : "படம் பதிவேற்றப்படுகிறது...")
                    : (editLanguage === 'en' ? "Upload Photo of Thumbnail" : "முகப்புப் படம் பதிவேற்றுக")
                  }
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                  />
                </Button>
              )}
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
              onClick={() => setOpenDialog(false)}
              sx={{ color: '#000' }}
            >
              {t('actions.cancel', 'Cancel')} / {t('actions.cancel_ta', 'ரத்துசெய்')}
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              sx={{
                bgcolor: '#8B0000',
                color: '#fff',
                '&:hover': { bgcolor: '#6B0000' },
                borderRadius: 0,
                fontWeight: 700,
                px: 3
              }}
            >
              {currentResource._id
                ? `${t('actions.update', 'Update')} / ${t('actions.update_ta', 'புதுப்பி')}`
                : `${t('actions.save', 'Save')} / ${t('actions.save_ta', 'சேமி')}`
              }
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!actionError}
          autoHideDuration={6000}
          onClose={() => setActionError(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setActionError(null)} sx={{ width: '100%' }}>
            {actionError}
          </Alert>
        </Snackbar>

        {/* Back Button */}
        <Box sx={{ mt: 6, mb: 4, textAlign: 'center' }}>
          <Button
            onClick={() => navigate('/')}
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
            ← {t('actions.backToHome', 'Back to Home')}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
