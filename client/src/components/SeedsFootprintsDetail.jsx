import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    CircularProgress,
    Breadcrumbs,
    Link,
    Fade,
    Grid,
    Dialog,
    DialogContent,
    IconButton,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    DialogTitle,
    DialogActions
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ArrowBack, Add, Image as ImageIcon, Edit, DragIndicator, ArrowUpward, ArrowDownward, ArrowForward, Close as CloseIcon, PlayCircleOutline } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import SEO, { pageSEO } from './common/SEO';

export default function SeedsFootprintsDetail({ user }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [folder, setFolder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [photos, setPhotos] = useState([]);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadForm, setUploadForm] = useState({
        file: null,
        captionEn: '',
        captionTa: '',
        nameEn: '',
        nameTa: '',
        keywords: '',
        credit: '',
        sourceLink: '',
        videoLink: '',
        editLanguage: 'en'
    });
    const [editingPhotoId, setEditingPhotoId] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [openOrderDialog, setOpenOrderDialog] = useState(false);
    const [photoOrder, setPhotoOrder] = useState([]);
    const [dragIndex, setDragIndex] = useState(null);

    // Touch/swipe support state
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Folder editing states
    const [editingFolder, setEditingFolder] = useState(false);
    const [folderForm, setFolderForm] = useState({
        descriptionEn: '',
        descriptionTa: '',
        coverPhoto: null,
        editLanguage: 'en'
    });

    // Ensure body can scroll properly
    React.useEffect(() => {
        document.body.style.overflow = 'unset';
        document.documentElement.style.overflow = 'unset';
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, []);

    const getContent = (field) => {
        if (!field) return '';
        if (typeof field === 'string') return field;
        return i18n.language === 'ta' && field.ta ? field.ta : field.en || '';
    };

    // Convert YouTube/Vimeo/Facebook URLs to embed format
    const getVideoEmbedUrl = (url) => {
        if (!url) return null;
        
        // Check if it's a direct video file (mp4, webm, etc.)
        if (url.match(/\.(mp4|webm|ogg)$/i)) {
            return { type: 'direct', url };
        }
        
        // YouTube patterns
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const youtubeMatch = url.match(youtubeRegex);
        if (youtubeMatch && youtubeMatch[1]) {
            return { type: 'embed', url: `https://www.youtube.com/embed/${youtubeMatch[1]}` };
        }

        // Vimeo patterns
        const vimeoRegex = /vimeo\.com\/(?:.*\/)?(\d+)/;
        const vimeoMatch = url.match(vimeoRegex);
        if (vimeoMatch && vimeoMatch[1]) {
            return { type: 'embed', url: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
        }

        // Facebook patterns
        // Handles: facebook.com/share/r/ID/, facebook.com/watch/?v=ID, facebook.com/username/videos/ID
        if (url.includes('facebook.com')) {
            const encodedUrl = encodeURIComponent(url);
            return { 
                type: 'embed', 
                url: `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=734`
            };
        }

        // If it's already an embed URL, return as is
        if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/video/') || url.includes('facebook.com/plugins/video.php')) {
            return { type: 'embed', url };
        }

        return null;
    };

    useEffect(() => {
        let mounted = true;

        if (!id || id === 'undefined') {
            console.error('Invalid folder ID:', id);
            setFolder(null);
            setLoading(false);
        } else {
            setLoading(true);

            fetch(`/api/seedsandfootprints/folders/${id}`)
                .then((r) => {
                    if (!r.ok) {
                        return r.text().then(text => {
                            console.error('Folder fetch failed:', r.status, text);
                            throw new Error(`HTTP ${r.status}: ${text}`);
                        });
                    }
                    return r.json();
                })
                .then((data) => {
                    if (!mounted) return;
                    // Photos come pre-sorted by order from backend; fall back to createdAt
                    const sortedPhotos = (data.photos || []).slice().sort((a, b) => {
                        if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
                        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                    });
                    console.log('📸 Loaded photos:', sortedPhotos.map(p => ({
                        id: p._id,
                        hasUrl: !!p.url,
                        hasVideoLink: !!p.videoLink,
                        videoLink: p.videoLink
                    })));
                    setFolder(data);
                    setPhotos(sortedPhotos);
                })
                .catch((err) => {
                    console.error('Failed to load collection', err);
                    if (mounted) setFolder(null);
                })
                .finally(() => mounted && setLoading(false));
        }

        return () => { mounted = false; };
    }, [id]);

    // Keyboard navigation for image viewer
    React.useEffect(() => {
        const handleKeyPress = (e) => {
            if (!viewerOpen) return;
            if (e.key === 'Escape') {
                setViewerOpen(false);
            }
            if (e.key === 'ArrowRight') {
                setActiveIndex((prev) => (prev + 1) % Math.max(photos.filter(p => p.url).length, 1));
            }
            if (e.key === 'ArrowLeft') {
                setActiveIndex((prev) => {
                    const len = Math.max(photos.filter(p => p.url).length, 1);
                    return (prev - 1 + len) % len;
                });
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [viewerOpen, photos]);

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 3 }, textAlign: 'center' }}>
                <CircularProgress sx={{ color: '#8B0000' }} />
                <Typography sx={{ mt: 2, color: '#666' }}>
                    {t('loading', 'Loading...')}
                </Typography>
            </Container>
        );
    }

    if (!folder) {
        return (
            <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 3 } }}>
                <Paper
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        borderRadius: 3,
                        border: '2px dashed #e0e0e0'
                    }}
                >
                    <Box sx={{ fontSize: 80, mb: 2, opacity: 0.3 }}>ðŸ“¸</Box>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#999' }}>
                        {t('research.folderNotFound', 'Collection not found')}
                    </Typography>
                    <Button
                        component={RouterLink}
                        to="/seeds-and-footprints"
                        variant="contained"
                        startIcon={<ArrowBack />}
                        sx={{
                            bgcolor: '#8B0000',
                            mt: 2,
                            px: 3,
                            py: 1.5,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': { bgcolor: '#6B0000' }
                        }}
                    >
                        {t('actions.backToResearch', 'Back to Collections')}
                    </Button>
                </Paper>
            </Container>
        );
    }

    // Server resolves language, but add defensive handling for edge cases
    const getStringValue = (value, fallback = '') => {
        if (!value) return fallback;
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && value !== null) {
            // Handle bilingual objects defensively
            return (i18n.language === 'ta' && value.ta) ? value.ta : (value.en || value.ta || fallback);
        }
        return String(value);
    };

    const folderName = getStringValue(folder.name, 'Untitled');
    const folderDescription = getStringValue(folder.description, '');

    // Only display photos that have a URL (filter out metadata-only entries)
    const displayPhotos = photos.filter(p => p.url);

    const getCaption = (caption) => {
        return getStringValue(caption, '');
    };

    const openViewer = (index) => {
        const photo = displayPhotos[index];
        console.log('🖼️ Opening viewer for photo:', {
            index,
            photoId: photo?._id,
            hasVideoLink: !!photo?.videoLink,
            videoLink: photo?.videoLink
        });
        setActiveIndex(index);
        setViewerOpen(true);
    };

    const closeViewer = () => {
        setViewerOpen(false);
    };

    const goToNext = () => {
        if (displayPhotos.length > 0) {
            setActiveIndex((prev) => (prev + 1) % displayPhotos.length);
        }
    };

    const goToPrev = () => {
        if (displayPhotos.length > 0) {
            setActiveIndex((prev) => (prev - 1 + displayPhotos.length) % displayPhotos.length);
        }
    };

    const handleTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe) goToNext();
        if (isRightSwipe) goToPrev();
    };

    const openReorderDialog = () => {
        const sortedPhotos = [...photos].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setPhotoOrder(sortedPhotos);
        setOpenOrderDialog(true);
    };

    const handleDragStart = (index) => {
        setDragIndex(index);
    };

    const handleDrop = (index) => {
        if (dragIndex === null || dragIndex === index) return;
        const updated = [...photoOrder];
        const [moved] = updated.splice(dragIndex, 1);
        updated.splice(index, 0, moved);
        setPhotoOrder(updated);
        setDragIndex(null);
    };

    const handleSaveOrder = async () => {
        try {
            const orderedIds = photoOrder.map(photo => photo._id);
            const response = await fetch(`/api/seedsandfootprints/folders/${id}/photos/order`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ orderedIds })
            });

            if (!response.ok) {
                throw new Error('Failed to save photo order');
            }

            // Reload folder data
            const r = await fetch(`/api/seedsandfootprints/folders/${id}`);
            if (r.ok) {
                const data = await r.json();
                const sortedPhotos = (data.photos || []).slice().sort((a, b) => {
                    if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
                    return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                });
                setFolder(data);
                setPhotos(sortedPhotos);
            }
            setOpenOrderDialog(false);
        } catch (err) {
            console.error('Failed to save order:', err);
            alert('Failed to save photo order');
        }
    };

    const movePhoto = (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= photoOrder.length) return;
        const updated = [...photoOrder];
        const [moved] = updated.splice(fromIndex, 1);
        updated.splice(toIndex, 0, moved);
        setPhotoOrder(updated);
    };

    const handleUploadFieldChange = (field) => (event) => {
        const value = field === 'file' ? (event.target.files?.[0] || null) : event.target.value;
        setUploadForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleEditPhoto = (photo) => {
        // populate form with existing photo data and open dialog for editing
        setEditingPhotoId(photo._id);
        setUploadForm(prev => ({
            ...prev,
            file: null,
            captionEn: photo.caption?.en || '',
            captionTa: photo.caption?.ta || '',
            nameEn: photo.name?.en || '',
            nameTa: photo.name?.ta || '',
            keywords: Array.isArray(photo.keywords) ? photo.keywords.join(', ') : (photo.keywords || ''),
            credit: photo.credit || '',
            sourceLink: photo.sourceLink || '',
            videoLink: photo.videoLink || '',
            editLanguage: 'en'
        }));
        setIsFormVisible(true);
    };

    // Handle folder editing
    const handleEditFolder = () => {
        setFolderForm({
            descriptionEn: (typeof folder.description === 'object' ? folder.description.en : folder.description) || '',
            descriptionTa: (typeof folder.description === 'object' ? folder.description.ta : '') || '',
            coverPhoto: null,
            editLanguage: 'en'
        });
        setEditingFolder(true);
    };

    const handleSaveFolder = async (e) => {
        e.preventDefault();
        if (!user || user.role !== 'admin') return;

        try {
            const formData = new FormData();

            // Add text data
            formData.append('nameEn', folderForm.nameEn);
            formData.append('nameTa', folderForm.nameTa);
            formData.append('descriptionEn', folderForm.descriptionEn);
            formData.append('descriptionTa', folderForm.descriptionTa);

            // Add cover photo if selected
            if (folderForm.coverPhoto) {
                formData.append('coverPhoto', folderForm.coverPhoto);
            }

            const response = await fetch(`/api/seedsandfootprints/folders/${id}`, {
                method: 'PUT',
                credentials: 'include',
                body: formData
            });

            if (response.ok) {
                const updatedFolder = await response.json();
                setFolder(updatedFolder);
                setEditingFolder(false);
                setFolderForm({
                    descriptionEn: '',
                    descriptionTa: '',
                    coverPhoto: null,
                    editLanguage: 'en'
                });
            } else {
                console.error('Failed to update folder');
            }
        } catch (error) {
            console.error('Error updating folder:', error);
        }
    };

    const refreshPhotos = async () => {
        try {
            setRefreshing(true);
            const res = await fetch(`/api/seedsandfootprints/folders/${id}`);
            if (!res.ok) return;
            const data = await res.json();
            const sortedPhotos = (data.photos || []).slice().sort((a, b) => {
                if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
                return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            });
            setPhotos(sortedPhotos);
            setFolder(data);
        } catch (err) {
            console.error('Failed to refresh photos:', err);
        } finally {
            setRefreshing(false);
        }
    };

    const handleUpload = async (event) => {
        event.preventDefault();

        try {
            setUploading(true);
            setUploadError('');

            // 1) Upload image to backend (Cloudinary)
            let imageUrl = null;
            if (uploadForm.file) {
                const formData = new FormData();
                formData.append('image', uploadForm.file);

                const uploadRes = await fetch('/api/upload/image', {
                    method: 'POST',
                    body: formData,
                    credentials: 'include'
                });

                if (!uploadRes.ok) {
                    const errBody = await uploadRes.json().catch(() => ({}));
                    throw new Error(errBody.error || 'Image upload failed');
                }

                const uploadJson = await uploadRes.json();
                imageUrl = uploadJson.imageUrl || uploadJson.url;

                if (!imageUrl) {
                    throw new Error('No image URL returned from upload');
                }
            }

            // 2) Create or update photo on this collection
            const isEdit = !!editingPhotoId;
            const url = isEdit ? `/api/seedsandfootprints/folders/${id}/photos/${editingPhotoId}` : `/api/seedsandfootprints/folders/${id}/photos`;
            const method = isEdit ? 'PUT' : 'POST';

            // prepare keywords array
            const keywordsArray = uploadForm.keywords ? uploadForm.keywords.split(',').map(k => k.trim()).filter(Boolean) : [];

            const body = {
                ...(imageUrl ? { imageUrl } : {}),
                caption: { en: uploadForm.captionEn, ta: uploadForm.captionTa },
                credit: uploadForm.credit,
                name: { en: uploadForm.nameEn, ta: uploadForm.nameTa },
                keywords: keywordsArray,
                sourceLink: uploadForm.sourceLink,
                videoLink: uploadForm.videoLink
            };

            const photoRes = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body)
            });

            if (!photoRes.ok) {
                const errBody = await photoRes.json().catch(() => ({}));
                console.error('Photo attachment failed:', errBody);
                throw new Error(errBody.error || 'Failed to attach photo to collection');
            }

            const photoResponseJson = await photoRes.json();

            const { photo } = photoResponseJson;

            if (!photo) {
                console.warn('No photo object in response, trying to refresh folder data instead');
                // Fallback: refresh the entire folder data
                const refreshRes = await fetch(`/api/seedsandfootprints/folders/${id}`);
                if (refreshRes.ok) {
                    const refreshedData = await refreshRes.json();
                    const sortedPhotos = (refreshedData.photos || []).slice().sort((a, b) => {
                        if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
                        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                    });
                    setPhotos(sortedPhotos);
                    setFolder(refreshedData);
                }
            } else {
                if (editingPhotoId) {
                    // replace existing photo in state
                    setPhotos((prev) => prev.map(p => (p._id === editingPhotoId ? photo : p)));
                } else {
                    console.log('✅ New photo added with videoLink:', photo.videoLink);
                    setPhotos((prev) => {
                        const next = [...prev, photo];
                        return next.slice().sort((a, b) => {
                            if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
                            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
                        });
                    });
                }
            }

            setUploadForm({
                file: null,
                captionEn: '',
                captionTa: '',
                nameEn: '',
                nameTa: '',
                keywords: '',
                credit: '',
                sourceLink: '',
                videoLink: '',
                editLanguage: 'en'
            });
            setEditingPhotoId(null);
            setIsFormVisible(false);
        } catch (err) {
            console.error('Upload error', err);
            setUploadError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDeletePhoto = async (photoId) => {
        if (!user || user.role !== 'admin') return;
        if (!window.confirm(t('research.deletePhotoConfirm', 'Delete this photo?'))) return;
        try {
            const res = await fetch(`/api/seedsandfootprints/folders/${id}/photos/${photoId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to delete photo');
            // Refresh photos
            setPhotos((prev) => prev.filter((p) => p._id !== photoId));
        } catch (err) {
            alert(t('research.deletePhotoError', 'Failed to delete photo'));
        }
    };

    return (
        <Container
            maxWidth="lg"
            sx={{
                py: { xs: 3, md: 6 },
                px: { xs: 2, sm: 3 },
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'visible'
            }}
        >
            <SEO
                title={folderName ? `${folderName} - Seeds & Footprints` : 'Discovery Collection - Seeds & Footprints'}
                description={folderDescription || `Archaeological discoveries and Tamil heritage traces in ${folderName}. Documenting the footprints of our ancestors and seeds of Tamil civilization.`}
                keywords={`Tamil Heritage, Archaeological Discoveries, ${folderName}, Heritage Evidence, Tamil History, Cultural Traces, Heritage Documentation`}
                type="article"
                tags={folderName ? [folderName, 'Seeds & Footprints', 'Tamil Heritage', 'Archaeological Discovery'] : ['Seeds & Footprints']}
            />

            <Box
                sx={{
                    width: '100%',
                    mb: { xs: 4, md: 5 },
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
                }}
            >
                <Box
                    sx={{
                        py: { xs: 3, md: 3.5 },
                        position: 'relative',
                        textAlign: 'center'
                    }}
                >
                    <Box
                        sx={{
                            position: { xs: 'static', md: 'absolute' },
                            left: { md: 0 },
                            top: { md: '50%' },
                            transform: { xs: 'none', md: 'translateY(-50%)' },
                            mb: { xs: 2, md: 0 },
                            display: 'flex',
                            justifyContent: { xs: 'flex-start', md: 'flex-start' },
                            gap: 1,
                            flexWrap: 'wrap',
                            zIndex: 10, // Ensure proper layering
                            maxWidth: { md: '30%' } // Prevent overlap with center content
                        }}
                    >
                        <Button
                            component={RouterLink}
                            to="/seeds-and-footprints"
                            variant="outlined"
                            startIcon={<ArrowBack />}
                            sx={{
                                borderColor: '#8B0000',
                                color: '#8B0000',
                                '&:hover': {
                                    bgcolor: 'rgba(139,0,0,0.05)',
                                    borderColor: '#8B0000',
                                },
                                fontSize: i18n.language === 'ta'
                                    ? { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
                                    : { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                                px: { xs: 2, md: 3 },
                                py: { xs: 0.5, md: 1 },
                                borderRadius: 0,
                            }}
                        >
                            {t('gallery.backToFolders', 'Back to Folders')}
                        </Button>

                        {user && user.role === 'admin' && photos.length > 0 && (
                            <Button
                                onClick={openReorderDialog}
                                variant="outlined"
                                startIcon={<Edit />}
                                size="small"
                                sx={{
                                    borderColor: '#8B0000',
                                    color: '#8B0000',
                                    '&:hover': {
                                        bgcolor: 'rgba(139,0,0,0.08)',
                                        borderColor: '#8B0000',
                                    },
                                    borderRadius: 0,
                                    fontSize: i18n.language === 'ta'
                                        ? { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
                                        : { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                                    px: { xs: 2, md: 3 },
                                    py: { xs: 0.5, md: 1 },
                                }}
                            >
                                {t('gallery.editOrder', 'Edit Order')}
                            </Button>
                        )}
                    </Box>

                    <Typography
                        variant="h2"
                        sx={{
                            fontWeight: 700,
                            color: '#8B0000',
                            position: 'relative',
                            display: 'inline-block',
                            letterSpacing: -1,
                            padding: { xs: '0 5px', md: '0 10px' },
                            fontSize: i18n.language === 'ta'
                                ? { xs: '1.6rem', md: '2.4rem' }
                                : { xs: '2rem', md: '3rem' },
                            textAlign: 'center',
                            maxWidth: { md: '40%' }, // Constrain width to prevent overlap
                            wordBreak: 'break-word', // Handle long text gracefully
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: '50%',
                                left: { xs: '-30px', md: '-50px' },
                                width: { xs: '25px', md: '40px' },
                                height: '3px',
                                backgroundColor: '#DAA520',
                                transform: 'translateY(-50%)',
                                display: { xs: 'none', sm: 'block' } // Hide decorative lines on very small screens
                            },
                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                top: '50%',
                                right: { xs: '-30px', md: '-50px' },
                                width: { xs: '25px', md: '40px' },
                                height: '3px',
                                backgroundColor: '#DAA520',
                                transform: 'translateY(-50%)',
                                display: { xs: 'none', sm: 'block' } // Hide decorative lines on very small screens
                            }
                        }}
                    >
                        {folderName}
                    </Typography>

                    {/* Edit folder icon - positioned near title for admin */}
                    {user && user.role === 'admin' && (
                        <IconButton
                            onClick={handleEditFolder}
                            sx={{
                                position: 'absolute',
                                right: { xs: 10, md: 20 },
                                top: '50%',
                                transform: 'translateY(-50%)',
                                zIndex: 5,
                                bgcolor: 'rgba(255,255,255,0.9)',
                                color: '#8B0000',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                '&:hover': {
                                    bgcolor: '#fff',
                                    color: '#c00000',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                },
                                borderRadius: '50%',
                                p: 0.75,
                                width: 36,
                                height: 36,
                            }}
                            title={t('research.editFolder', 'Edit Folder')}
                        >
                            <Edit fontSize="small" />
                        </IconButton>
                    )}

                    {user && user.role === 'admin' && (
                        <Box
                            sx={{
                                position: { xs: 'static', md: 'absolute' },
                                right: { md: 0 },
                                top: { md: '50%' },
                                transform: { xs: 'none', md: 'translateY(-50%)' },
                                transition: 'all 0.3s ease',
                                mt: { xs: 2, md: 0 },
                                display: 'flex',
                                justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                width: { xs: '100%', md: 'auto' },
                                zIndex: 10, // Ensure proper layering
                                maxWidth: { md: '30%' }, // Prevent overlap with center content
                                // Keep hover effect only on larger screens
                                '&:hover': {
                                    '@media (min-width:900px)': {
                                        transform: 'translateY(-50%) scale(1.05)',
                                    },
                                    '& button': {
                                        '@media (min-width:900px)': {
                                            boxShadow: '0 8px 15px rgba(0,0,0,0.2)',
                                            transform: 'translateY(-3px)',
                                        }
                                    }
                                }
                            }}
                        >
                            <Button
                                onClick={() => setIsFormVisible(true)}
                                variant="contained"
                                startIcon={<Add />}
                                sx={{
                                    bgcolor: "#000",
                                    color: "#fff",
                                    transition: 'all 0.3s ease',
                                    "&:hover": {
                                        bgcolor: "#333",
                                        boxShadow: '0 8px 15px rgba(0,0,0,0.2)',
                                        transform: { xs: 'none', md: 'translateY(-3px)' },
                                    },
                                    borderRadius: 0,
                                    px: { xs: 2, md: 3 },
                                    py: { xs: 0.5, md: 1 },
                                    fontSize: i18n.language === 'ta'
                                        ? { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
                                        : { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                                }}
                            >
                                {t('gallery.addImage', 'Add Image')}
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>

            {folderDescription && (
                <Fade in={true} timeout={600}>
                    <Box sx={{ mb: 4 }}>
                        <Typography
                            variant="body1"
                            sx={{
                                color: '#666',
                                fontSize: { xs: '0.95rem', sm: '1.05rem' },
                                maxWidth: '760px',
                                lineHeight: 1.7,
                                fontFamily: '"Inter", sans-serif'
                            }}
                        >
                            {folderDescription}
                        </Typography>
                    </Box>
                </Fade>
            )}

            {/* Content Section */}
            <Fade in={true} timeout={800}>
                <Box sx={{ flex: 1, minHeight: 'auto', width: '100%', pb: 4 }}>
                    {/* Admin Upload Modal */}
                    {user && user.role === 'admin' && (
                        <Dialog
                            open={isFormVisible}
                            onClose={() => setIsFormVisible(false)}
                            maxWidth="md"
                            fullWidth
                            sx={{
                                '& .MuiDialog-container': {
                                    alignItems: { xs: 'flex-start', sm: 'center' }
                                },
                                '& .MuiDialog-paper': {
                                    maxHeight: { xs: '95vh', md: '90vh' },
                                    m: { xs: 1, sm: 2 },
                                    width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' },
                                    maxWidth: { xs: '100%', sm: 'md' },
                                    borderRadius: 2,
                                    boxShadow: '0 18px 60px rgba(0,0,0,0.25)'
                                }
                            }}
                        >
                            <DialogContent sx={{ p: { xs: 3, sm: 4 } }}>
                                <Box component="form" id="upload-photo-form" onSubmit={handleUpload} sx={{ maxWidth: 720, mx: 'auto' }}>
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
                                            {uploadForm.editLanguage === 'en' ? 'Select Language to Edit:' : 'à®Žà®´à¯à®¤ à®®à¯Šà®´à®¿à®¯à¯ˆà®¤à¯ à®¤à¯‡à®°à¯à®¨à¯à®¤à¯†à®Ÿà¯à®•à¯à®•à®µà¯à®®à¯:'}
                                        </Typography>
                                        <ToggleButtonGroup
                                            value={uploadForm.editLanguage}
                                            exclusive
                                            onChange={(e, v) => v && setUploadForm(prev => ({ ...prev, editLanguage: v }))}
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
                                            <ToggleButton value="en">ENGLISH</ToggleButton>
                                            <ToggleButton value="ta">à®¤à®®à®¿à®´à¯</ToggleButton>
                                        </ToggleButtonGroup>
                                    </Box>

                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                                        <TextField
                                            label={uploadForm.editLanguage === 'en' ? 'Name (English)' : 'à®ªà¯†à®¯à®°à¯ (à®¤à®®à®¿à®´à¯)'}
                                            fullWidth
                                            variant="outlined"
                                            value={uploadForm.editLanguage === 'en' ? uploadForm.nameEn : uploadForm.nameTa}
                                            onChange={handleUploadFieldChange(uploadForm.editLanguage === 'en' ? 'nameEn' : 'nameTa')}
                                        />
                                        <TextField
                                            label={uploadForm.editLanguage === 'en' ? 'Caption (English)' : 'à®¤à®²à¯ˆà®ªà¯à®ªà¯ (à®¤à®®à®¿à®´à¯)'}
                                            fullWidth
                                            variant="outlined"
                                            multiline
                                            rows={2}
                                            value={uploadForm.editLanguage === 'en' ? uploadForm.captionEn : uploadForm.captionTa}
                                            onChange={handleUploadFieldChange(uploadForm.editLanguage === 'en' ? 'captionEn' : 'captionTa')}
                                        />
                                    </Box>

                                    <TextField label="Keywords (comma-separated)" fullWidth variant="outlined" value={uploadForm.keywords} onChange={handleUploadFieldChange('keywords')} sx={{ mb: 2 }} />
                                    <TextField label={t('research.sourceLinkLabel', 'Source Link (optional)')} fullWidth variant="outlined" value={uploadForm.sourceLink} onChange={handleUploadFieldChange('sourceLink')} sx={{ mb: 2 }} />
                                    <TextField 
                                        label="Video Link (optional)" 
                                        fullWidth 
                                        variant="outlined" 
                                        value={uploadForm.videoLink} 
                                        onChange={handleUploadFieldChange('videoLink')} 
                                        sx={{ 
                                            mb: 3,
                                            '& .MuiOutlinedInput-root': {
                                                '&:hover fieldset': {
                                                    borderColor: '#8B0000',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#8B0000',
                                                }
                                            }
                                        }} 
                                        helperText="📺 Paste YouTube, Vimeo, Facebook video URL or direct video link (.mp4, .webm). Video will play in the viewer alongside the image."
                                        FormHelperTextProps={{
                                            sx: { 
                                                fontSize: '0.8rem',
                                                color: '#666',
                                                mt: 1
                                            }
                                        }}
                                    />

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="h6" sx={{ mb: 1, color: '#333', fontWeight: 600 }}>{t('research.upload', 'Upload Photo')}</Typography>
                                        <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>Supported formats: JPG, PNG, GIF, WEBP</Typography>
                                        <Button component="label" variant="outlined" startIcon={<ImageIcon />} sx={{ borderRadius: 1.5, px: 3, py: 1 }}>
                                            {t('research.selectImage', 'Select Image')}
                                            <input type="file" accept="image/*" hidden onChange={handleUploadFieldChange('file')} />
                                        </Button>
                                        {uploadForm.file && <Typography variant="body2" sx={{ mt: 1 }}>{t('research.selectedFile', 'Selected')}: {uploadForm.file.name}</Typography>}
                                    </Box>

                                    {uploadError && <Typography variant="body2" sx={{ color: '#d32f2f', textAlign: 'center', mb: 2 }}>{uploadError}</Typography>}
                                </Box>
                            </DialogContent>

                            <Box sx={{ px: { xs: 3, sm: 4 }, py: 2, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button variant="text" onClick={() => { setUploadForm({ file: null, captionEn: '', captionTa: '', nameEn: '', nameTa: '', keywords: '', credit: '', sourceLink: '', videoLink: '', editLanguage: 'en' }); setEditingPhotoId(null); setIsFormVisible(false); }} sx={{ color: '#777' }}>Cancel</Button>
                                <Button type="submit" form="upload-photo-form" variant="contained" disabled={uploading} sx={{ bgcolor: '#8B0000' }}>{uploading ? 'Saving...' : 'Save'}</Button>
                            </Box>
                        </Dialog>
                    )}

                    {/* Folder Edit Dialog */}
                    {user && user.role === 'admin' && (
                        <Dialog
                            open={editingFolder}
                            onClose={() => setEditingFolder(false)}
                            maxWidth="md"
                            fullWidth
                            sx={{
                                '& .MuiDialog-container': {
                                    alignItems: { xs: 'flex-start', sm: 'center' }
                                },
                                '& .MuiDialog-paper': {
                                    maxHeight: { xs: '95vh', md: '90vh' },
                                    m: { xs: 1, sm: 2 },
                                    width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' },
                                    maxWidth: { xs: '100%', sm: 'md' },
                                    borderRadius: 2,
                                    boxShadow: '0 18px 60px rgba(0,0,0,0.25)'
                                }
                            }}
                        >
                            <DialogContent sx={{ mt: 3, p: { xs: 2, sm: 3 } }}>
                                <Box sx={{ maxWidth: 720, mx: 'auto' }}>
                                    <Typography variant="h5" sx={{ mb: 4, fontWeight: 700, textAlign: 'center', color: '#8B0000', fontFamily: 'Georgia, serif' }}>
                                        {t('research.editFolder', 'Edit Folder Details')}
                                    </Typography>

                                    <form id="folder-edit-form" onSubmit={handleSaveFolder}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    mb: 1.5,
                                                    fontWeight: 600,
                                                    color: '#333',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                {folderForm.editLanguage === 'en' ? 'Select Language to Edit:' : 'à®Žà®´à¯à®¤ à®®à¯Šà®´à®¿à®¯à¯ˆà®¤à¯ à®¤à¯‡à®°à¯à®¨à¯à®¤à¯†à®Ÿà¯à®•à¯à®•à®µà¯à®®à¯:'}
                                            </Typography>
                                            <ToggleButtonGroup
                                                value={folderForm.editLanguage}
                                                exclusive
                                                onChange={(e, v) => v && setFolderForm(prev => ({ ...prev, editLanguage: v }))}
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
                                                <ToggleButton value="en">ENGLISH</ToggleButton>
                                                <ToggleButton value="ta">à®¤à®®à®¿à®´à¯</ToggleButton>
                                            </ToggleButtonGroup>
                                        </Box>

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
                                            <TextField
                                                label={folderForm.editLanguage === 'en' ? 'Folder Name (English)' : 'à®•à¯‹à®ªà¯à®ªà¯à®±à¯ˆ à®ªà¯†à®¯à®°à¯ (à®¤à®®à®¿à®´à¯)'}
                                                type="text"
                                                fullWidth
                                                required
                                                value={folderForm.editLanguage === 'en' ? folderForm.nameEn : folderForm.nameTa}
                                                onChange={(e) => setFolderForm({ ...folderForm, [folderForm.editLanguage === 'en' ? 'nameEn' : 'nameTa']: e.target.value })}
                                                variant="outlined"
                                            />

                                            <TextField
                                                label={folderForm.editLanguage === 'en' ? 'Description (English)' : 'à®µà®¿à®³à®•à¯à®•à®®à¯ (à®¤à®®à®¿à®´à¯)'}
                                                type="text"
                                                fullWidth
                                                multiline
                                                rows={4}
                                                value={folderForm.editLanguage === 'en' ? folderForm.descriptionEn : folderForm.descriptionTa}
                                                onChange={(e) => setFolderForm({ ...folderForm, [folderForm.editLanguage === 'en' ? 'descriptionEn' : 'descriptionTa']: e.target.value })}
                                                variant="outlined"
                                            />
                                        </Box>

                                        {/* Cover Photo Upload */}
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ mb: 1, color: '#555' }}>
                                                {t('research.folderCoverPhoto', 'Cover Photo (optional)')}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    border: '2px dashed #ddd',
                                                    borderRadius: 2,
                                                    p: 3,
                                                    textAlign: 'center',
                                                    cursor: 'pointer',
                                                    '&:hover': { borderColor: '#8B0000' }
                                                }}
                                                onClick={() => document.getElementById('folder-cover-input').click()}
                                            >
                                                <input
                                                    id="folder-cover-input"
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => setFolderForm({ ...folderForm, coverPhoto: e.target.files[0] || null })}
                                                />
                                                <ImageIcon sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
                                                <Typography variant="body2" sx={{ color: '#666' }}>
                                                    {folderForm.coverPhoto ? folderForm.coverPhoto.name : t('research.selectCoverPhoto', 'Click to select cover photo')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </form>
                                </Box>
                            </DialogContent>

                            <DialogActions sx={{ borderTop: '1px solid #e0e0e0', pt: 3, px: 3, pb: 2, gap: 2 }}>
                                <Button onClick={() => setEditingFolder(false)} sx={{ color: '#666' }}>
                                    {t('actions.cancel', 'Cancel')}
                                </Button>
                                <Button type="submit" form="folder-edit-form" variant="contained" sx={{ bgcolor: '#8B0000', px: 4, '&:hover': { bgcolor: '#6B0000' } }}>
                                    {t('actions.save', 'Save Changes')}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    )}

                    {/* Gallery Section */}
                    {
                        displayPhotos.length === 0 ? (
                            <Paper
                                sx={{
                                    p: { xs: 3, sm: 5 },
                                    borderRadius: 3,
                                    border: '1px solid #f0f0f0',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                                    minHeight: '260px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    mb: 4
                                }}
                            >
                                <Box sx={{ fontSize: 90, mb: 3, opacity: 0.12 }}>ðŸ“¸</Box>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: '#999',
                                        maxWidth: '500px',
                                        lineHeight: 1.7,
                                        mb: 2.5
                                    }}
                                >
                                    {t(
                                        'research.folderEmptyMessage',
                                        'This collection is currently empty. Upload the first heritage photo for this country/region.'
                                    )}
                                </Typography>
                            </Paper>
                        ) : (
                            <>
                                <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: 8 }}>
                                    {displayPhotos.map((photo, index) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={photo._id || index}>
                                            <Box>
                                                <Box
                                                    onClick={() => openViewer(index)}
                                                    className="heritage-photo-card"
                                                    sx={{
                                                        position: 'relative',
                                                        borderRadius: '4px', // Sharper corners for frame look
                                                        overflow: 'hidden',
                                                        cursor: 'pointer',
                                                        background: '#0a0500', // Deep Museum Velvet Black/Brown
                                                        aspectRatio: '1 / 1',
                                                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                                        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                                                        transform: 'translateY(0)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',

                                                        // The Main Gold Frame
                                                        border: '4px solid transparent',
                                                        borderImage: 'linear-gradient(to bottom right, #8B7355, #FFD700, #D4AF37, #8B7355) 1',
                                                        outline: '1px solid #000', // Crisp edge definition

                                                        '&:hover': {
                                                            transform: 'scale(1.02) translateY(-5px)',
                                                            boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 30px rgba(212, 175, 55, 0.4)', // Golden bloom

                                                            '& .corner-accent': {
                                                                borderColor: '#FFF', // Flash white on hover
                                                                opacity: 1
                                                            },

                                                            '& .frame-shine': {
                                                                opacity: 1,
                                                                transform: 'translateX(100%)'
                                                            },

                                                            '& .photo-image': {
                                                                transform: 'scale(1.03)',
                                                                filter: 'brightness(1.1) contrast(1.1)'
                                                            },

                                                            '& .caption-glass': {
                                                                background: 'linear-gradient(to top, rgba(15, 10, 5, 0.95), rgba(15, 10, 5, 0.8))',
                                                                backdropFilter: 'blur(10px)',
                                                                transform: 'translateY(0)',
                                                                opacity: 1
                                                            }
                                                        },

                                                        '@keyframes heritageTrail': {
                                                            '0%': {
                                                                background: 'linear-gradient(90deg, rgba(212, 175, 55, 0) 90%, rgba(212, 175, 55, 0.8) 100%)',
                                                                opacity: 0
                                                            },
                                                            '30%': {
                                                                background: 'linear-gradient(90deg, rgba(212, 175, 55, 0) 70%, rgba(212, 175, 55, 0.8) 100%)',
                                                                opacity: 1
                                                            },
                                                            '70%': {
                                                                background: 'linear-gradient(90deg, rgba(212, 175, 55, 0) 70%, rgba(212, 175, 55, 0.8) 100%)',
                                                                opacity: 1
                                                            },
                                                            '95%': {
                                                                background: 'linear-gradient(90deg, rgba(212, 175, 55, 0) 90%, rgba(212, 175, 55, 0.8) 100%)',
                                                                opacity: 0
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {/* Metallic Shine Animation Layer */}
                                                    <Box
                                                        className="frame-shine"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
                                                            transform: 'translateX(-100%)',
                                                            transition: 'transform 0.8s',
                                                            opacity: 0,
                                                            zIndex: 2,
                                                            pointerEvents: 'none'
                                                        }}
                                                    />

                                                    {/* Corner Accents (Top-Left & Bottom-Right) */}
                                                    <Box
                                                        className="corner-accent"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 12,
                                                            left: 12,
                                                            width: 24,
                                                            height: 24,
                                                            borderTop: '2px solid #D4AF37',
                                                            borderLeft: '2px solid #D4AF37',
                                                            transition: 'all 0.4s ease',
                                                            opacity: 0.7,
                                                            zIndex: 2
                                                        }}
                                                    />
                                                    <Box
                                                        className="corner-accent"
                                                        sx={{
                                                            position: 'absolute',
                                                            bottom: 12,
                                                            right: 12,
                                                            width: 24,
                                                            height: 24,
                                                            borderBottom: '2px solid #D4AF37',
                                                            borderRight: '2px solid #D4AF37',
                                                            transition: 'all 0.4s ease',
                                                            opacity: 0.7,
                                                            zIndex: 2
                                                        }}
                                                    />

                                                    {/* Deep Background (No blurred ambient, clean museum look) */}
                                                    <Box
                                                        component="img"
                                                        src={photo.url}
                                                        alt={getCaption(photo.caption) || folderName}
                                                        loading="lazy"
                                                        className="photo-image"
                                                        sx={{
                                                            height: '90%',
                                                            width: 'auto',
                                                            maxWidth: '90%',
                                                            objectFit: 'contain',
                                                            display: 'block',
                                                            zIndex: 1,
                                                            transition: 'all 0.6s ease-out',
                                                            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.8))'
                                                        }}
                                                    />

                                                    {/* Animated trail effect */}
                                                    <Box
                                                        className="heritage-trail"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            right: 0,
                                                            height: '100%',
                                                            width: '100%',
                                                            opacity: 0,
                                                            zIndex: 2
                                                        }}
                                                    />

                                                    {/* Overlay gradient */}
                                                    <Box
                                                        className="photo-overlay"
                                                        sx={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.05) 100%)',
                                                            transition: 'all 0.5s ease-in-out',
                                                            zIndex: 3
                                                        }}
                                                    />

                                                    {/* Elegant Caption */}
                                                    <Box
                                                        className="caption-glass"
                                                        sx={{
                                                            position: 'absolute',
                                                            inset: 'auto 0 0 0',
                                                            p: 2,
                                                            background: 'rgba(10, 5, 0, 0.85)',
                                                            zIndex: 5,
                                                            transition: 'all 0.5s ease',
                                                            transform: 'translateY(15px)',
                                                            opacity: 0,
                                                            display: getCaption(photo.caption) ? 'flex' : 'none',
                                                            flexDirection: 'column',
                                                            borderTop: '1px solid #D4AF37'
                                                        }}
                                                    >
                                                        <Typography
                                                            className="photo-caption"
                                                            variant="body2"
                                                            sx={{
                                                                color: '#D4AF37',
                                                                fontWeight: 500,
                                                                fontSize: '0.95rem',
                                                                letterSpacing: '0.05em',
                                                                fontFamily: '"Cinzel", serif', // More royal font if available, else standard serif
                                                                textAlign: 'center'
                                                            }}
                                                        >
                                                            {getCaption(photo.caption)}
                                                        </Typography>
                                                    </Box>

                                                    {user && user.role === 'admin' && (
                                                        <>
                                                            <IconButton
                                                                onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo._id); }}
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: 8,
                                                                    left: 8,
                                                                    zIndex: 6,
                                                                    bgcolor: 'rgba(255,255,255,0.9)',
                                                                    color: '#c00000',
                                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                                                                    '&:hover': { bgcolor: '#fff', color: '#8B0000' },
                                                                    borderRadius: '50%',
                                                                    p: 0.5,
                                                                }}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>

                                                            <IconButton
                                                                onClick={(e) => { e.stopPropagation(); handleEditPhoto(photo); }}
                                                                sx={{
                                                                    position: 'absolute',
                                                                    top: 8,
                                                                    left: 56,
                                                                    zIndex: 6,
                                                                    bgcolor: 'rgba(255,255,255,0.95)',
                                                                    color: '#333',
                                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                                                                    '&:hover': { bgcolor: '#fff', color: '#8B0000' },
                                                                    borderRadius: '50%',
                                                                    p: 0.5,
                                                                }}
                                                            >
                                                                <Edit fontSize="small" />
                                                            </IconButton>
                                                        </>
                                                    )}

                                                    {/* Video indicator badge */}
                                                    {photo.videoLink && (
                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                top: 8,
                                                                right: 8,
                                                                zIndex: 6,
                                                                bgcolor: 'rgba(139, 0, 0, 0.9)',
                                                                color: '#fff',
                                                                borderRadius: '50%',
                                                                p: 0.8,
                                                                boxShadow: '0 2px 12px rgba(139,0,0,0.5)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                animation: 'pulse 2s ease-in-out infinite',
                                                                '@keyframes pulse': {
                                                                    '0%, 100%': { transform: 'scale(1)', opacity: 0.9 },
                                                                    '50%': { transform: 'scale(1.1)', opacity: 1 }
                                                                }
                                                            }}
                                                        >
                                                            <PlayCircleOutline fontSize="small" />
                                                        </Box>
                                                    )}

                                                    {/* badge removed per request */}
                                                </Box>

                                                {photo.sourceLink && (
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.5 }}>
                                                        <Box
                                                            component="a"
                                                            href={photo.sourceLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            sx={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                gap: 0.5,
                                                                px: 2,
                                                                py: 0.75,
                                                                bgcolor: '#fff',
                                                                color: '#8B0000',
                                                                borderRadius: 1,
                                                                fontSize: '0.8rem',
                                                                fontWeight: 600,
                                                                textDecoration: 'none',
                                                                textTransform: 'uppercase',
                                                                letterSpacing: '0.05em',
                                                                border: '2px solid #8B0000',
                                                                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                                                                transition: 'all 0.3s ease',
                                                                '&:hover': {
                                                                    bgcolor: '#8B0000',
                                                                    color: '#fff',
                                                                    transform: 'translateY(-2px)',
                                                                    boxShadow: '0 4px 12px rgba(139,0,0,0.25)'
                                                                }
                                                            }}
                                                        >
                                                            {t('research.source', 'Source')}
                                                        </Box>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </>
                        )
                    }
                </Box >
            </Fade >

            {/* Fullscreen Viewer */}
            < Dialog
                fullScreen
                open={viewerOpen}
                onClose={closeViewer}
                PaperProps={{
                    sx: {
                        backgroundColor: 'rgba(5, 3, 0, 0.96)', // Deep Royal Black
                        color: '#fff'
                    }
                }
                }
                disableScrollLock
            >
                <DialogContent
                    sx={{
                        p: 0,
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        height: '100vh',
                        position: 'relative',
                        bgcolor: 'transparent' // Let PaperProps handle bg
                    }}
                >
                    {/* Close button */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 20,
                            right: 20,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            zIndex: 10
                        }}
                    >
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#D4AF37',
                                fontSize: '1rem',
                                fontWeight: 500,
                                fontFamily: '"Cinzel", serif',
                                letterSpacing: '0.1em'
                            }}
                        >
                            {displayPhotos.length > 0 ? `${activeIndex + 1} / ${displayPhotos.length}` : ''}
                        </Typography>
                        <IconButton
                            onClick={closeViewer}
                            sx={{
                                color: '#D4AF37',
                                border: '1px solid rgba(212, 175, 55, 0.5)',
                                bgcolor: 'rgba(0,0,0,0.6)',
                                '&:hover': {
                                    bgcolor: 'rgba(212, 175, 55, 0.2)',
                                    borderColor: '#D4AF37'
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Left side - Image */}
                    {displayPhotos[activeIndex] && (
                        <Box
                            sx={{
                                flex: { xs: 1, md: '0 0 65%' },
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: { xs: 2, sm: 4 },
                                position: 'relative'
                            }}
                        >
                            {/* Navigation arrows */}
                            {displayPhotos.length > 1 && (
                                <>
                                    <IconButton
                                        onClick={goToPrev}
                                        sx={{
                                            position: 'absolute',
                                            left: 20,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 10,
                                            color: '#D4AF37',
                                            bgcolor: 'rgba(10, 5, 0, 0.6)',
                                            border: '1px solid rgba(212, 175, 55, 0.3)',
                                            width: 56,
                                            height: 56,
                                            '&:hover': {
                                                bgcolor: 'rgba(212, 175, 55, 0.1)',
                                                borderColor: '#D4AF37',
                                                boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)'
                                            }
                                        }}
                                    >
                                        <ArrowBack />
                                    </IconButton>

                                    <IconButton
                                        onClick={goToNext}
                                        sx={{
                                            position: 'absolute',
                                            right: 20,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            zIndex: 10,
                                            color: '#D4AF37',
                                            bgcolor: 'rgba(10, 5, 0, 0.6)',
                                            border: '1px solid rgba(212, 175, 55, 0.3)',
                                            width: 56,
                                            height: 56,
                                            '&:hover': {
                                                bgcolor: 'rgba(212, 175, 55, 0.1)',
                                                borderColor: '#D4AF37',
                                                boxShadow: '0 0 15px rgba(212, 175, 55, 0.3)'
                                            }
                                        }}
                                    >
                                        <ArrowForward />
                                    </IconButton>
                                </>
                            )}
                            
                            <Box
                                component="img"
                                src={displayPhotos[activeIndex].url}
                                alt={getCaption(displayPhotos[activeIndex].caption) || folderName}
                                sx={{
                                    maxWidth: '100%',
                                    maxHeight: 'calc(100vh - 80px)',
                                    width: 'auto',
                                    height: 'auto',
                                    objectFit: 'contain',
                                    borderRadius: '4px',
                                    border: '2px solid rgba(212, 175, 55, 0.5)',
                                    boxShadow: '0 0 50px rgba(0,0,0,0.9), 0 0 20px rgba(212, 175, 55, 0.2)'
                                }}
                            />
                        </Box>
                    )}

                    {/* Right side - Caption and Details */}
                    {displayPhotos[activeIndex] && (
                        <Box
                            sx={{
                                flex: { xs: 0, md: '0 0 35%' },
                                display: { xs: 'none', md: 'flex' },
                                flexDirection: 'column',
                                p: 4,
                                overflowY: 'auto',
                                borderLeft: '1px solid rgba(212, 175, 55, 0.2)',
                                background: 'linear-gradient(to bottom, rgba(10, 5, 0, 0.8), rgba(10, 5, 0, 0.95))'
                            }}
                        >
                            {/* Photo counter for mobile */}
                            <Box sx={{ mb: 3, display: { xs: 'none', md: 'block' } }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: '#8B7355',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        letterSpacing: '0.1em'
                                    }}
                                >
                                    {t('research.photo', 'Photo')} {activeIndex + 1} {t('research.of', 'of')} {displayPhotos.length}
                                </Typography>
                            </Box>

                            {/* Thumbnail navigation dots */}
                            {displayPhotos.length > 1 && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'flex-start',
                                        gap: 1.5,
                                        mb: 4,
                                        flexWrap: 'wrap'
                                    }}
                                >
                                    {displayPhotos.map((_, index) => (
                                        <Box
                                            key={index}
                                            onClick={() => setActiveIndex(index)}
                                            sx={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: '50%',
                                                bgcolor: index === activeIndex ? '#D4AF37' : 'rgba(212, 175, 55, 0.3)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                border: index === activeIndex ? '2px solid #D4AF37' : '1px solid rgba(212, 175, 55, 0.3)',
                                                '&:hover': {
                                                    bgcolor: index === activeIndex ? '#D4AF37' : 'rgba(212, 175, 55, 0.6)',
                                                    transform: 'scale(1.2)'
                                                }
                                            }}
                                        />
                                    ))}
                                </Box>
                            )}

                            {/* Caption */}
                            {getCaption(displayPhotos[activeIndex].caption) && (
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 600,
                                        mb: 3,
                                        color: '#D4AF37',
                                        fontFamily: '"Cinzel", serif',
                                        letterSpacing: '0.05em',
                                        lineHeight: 1.6,
                                        borderBottom: '2px solid rgba(212, 175, 55, 0.3)',
                                        pb: 2
                                    }}
                                >
                                    {getCaption(displayPhotos[activeIndex].caption)}
                                </Typography>
                            )}

                            {/* Photo name if available */}
                            {displayPhotos[activeIndex].name && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#8B7355',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            mb: 1
                                        }}
                                    >
                                        {t('research.photoName', 'Photo Name')}
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: '#D4AF37',
                                            fontSize: '0.95rem',
                                            lineHeight: 1.6
                                        }}
                                    >
                                        {getCaption(displayPhotos[activeIndex].name)}
                                    </Typography>
                                </Box>
                            )}

                            {/* Source Link */}
                            {displayPhotos[activeIndex].sourceLink && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#8B7355',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            mb: 1
                                        }}
                                    >
                                        {t('research.source', 'Source')}
                                    </Typography>
                                    <Box
                                        component="a"
                                        href={displayPhotos[activeIndex].sourceLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            color: '#D4AF37',
                                            textDecoration: 'none',
                                            fontSize: '0.9rem',
                                            fontWeight: 500,
                                            px: 2,
                                            py: 1,
                                            borderRadius: '4px',
                                            border: '1px solid #D4AF37',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                bgcolor: 'rgba(212, 175, 55, 0.15)',
                                                boxShadow: '0 0 10px rgba(212, 175, 55, 0.3)',
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        {t('research.viewSource', 'View Source')}
                                    </Box>
                                </Box>
                            )}

                            {/* Video Player */}
                            {(() => {
                                const currentPhoto = displayPhotos[activeIndex];
                                if (!currentPhoto?.videoLink) {
                                    console.log('No video link for current photo');
                                    return null;
                                }
                                
                                const videoData = getVideoEmbedUrl(currentPhoto.videoLink);
                                const isFacebook = currentPhoto.videoLink.includes('facebook.com');
                                console.log('🎥 Video check:', {
                                    photoId: currentPhoto._id,
                                    videoLink: currentPhoto.videoLink,
                                    embedUrl: videoData,
                                    isFacebook
                                });
                                
                                if (!videoData) {
                                    console.log('❌ Invalid video URL format');
                                    return null;
                                }
                                
                                return (
                                    <Box sx={{ mb: 4 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#D4AF37',
                                                fontSize: '0.85rem',
                                                fontWeight: 700,
                                                letterSpacing: '0.15em',
                                                textTransform: 'uppercase',
                                                mb: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}
                                        >
                                            <PlayCircleOutline sx={{ fontSize: '1.2rem' }} />
                                            {t('research.relatedVideo', 'Related Video')}
                                        </Typography>
                                        
                                        {isFacebook ? (
                                            // Facebook videos often can't be embedded, show direct link
                                            <Box
                                                sx={{
                                                    p: 4,
                                                    borderRadius: '6px',
                                                    border: '3px solid #D4AF37',
                                                    background: 'linear-gradient(135deg, rgba(10, 5, 0, 0.95) 0%, rgba(20, 10, 5, 0.95) 100%)',
                                                    boxShadow: '0 6px 20px rgba(212, 175, 55, 0.4)',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 80,
                                                        height: 80,
                                                        borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, #1877F2, #0866FF)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        margin: '0 auto 20px',
                                                        boxShadow: '0 4px 15px rgba(24, 119, 242, 0.4)'
                                                    }}
                                                >
                                                    <PlayCircleOutline sx={{ fontSize: 50, color: '#fff' }} />
                                                </Box>
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        color: '#D4AF37',
                                                        fontWeight: 600,
                                                        mb: 1,
                                                        fontFamily: '"Cinzel", serif'
                                                    }}
                                                >
                                                    Facebook Video
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: '#8B7355',
                                                        mb: 3,
                                                        lineHeight: 1.6
                                                    }}
                                                >
                                                    Due to privacy settings, this video must be watched on Facebook
                                                </Typography>
                                                <Button
                                                    variant="contained"
                                                    component="a"
                                                    href={currentPhoto.videoLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    startIcon={<PlayCircleOutline />}
                                                    sx={{
                                                        bgcolor: '#1877F2',
                                                        color: '#fff',
                                                        px: 4,
                                                        py: 1.5,
                                                        fontSize: '1rem',
                                                        fontWeight: 700,
                                                        textTransform: 'none',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 12px rgba(24, 119, 242, 0.4)',
                                                        '&:hover': {
                                                            bgcolor: '#0866FF',
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 6px 20px rgba(24, 119, 242, 0.6)'
                                                        }
                                                    }}
                                                >
                                                    Watch on Facebook
                                                </Button>
                                            </Box>
                                        ) : (
                                            // Non-Facebook videos: try to embed
                                            <Box
                                                sx={{
                                                    position: 'relative',
                                                    width: '100%',
                                                    paddingBottom: videoData.type === 'direct' ? '0' : '56.25%',
                                                    borderRadius: '6px',
                                                    overflow: 'hidden',
                                                    border: '3px solid #D4AF37',
                                                    boxShadow: '0 6px 20px rgba(212, 175, 55, 0.4), 0 0 30px rgba(212, 175, 55, 0.2)',
                                                    background: '#000',
                                                    '&::before': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        inset: '-3px',
                                                        background: 'linear-gradient(45deg, #D4AF37, #8B0000, #D4AF37)',
                                                        borderRadius: '6px',
                                                        zIndex: -1,
                                                        animation: 'shimmer 3s ease-in-out infinite',
                                                        opacity: 0.3
                                                    },
                                                    '@keyframes shimmer': {
                                                        '0%, 100%': { opacity: 0.3 },
                                                        '50%': { opacity: 0.6 }
                                                    }
                                                }}
                                            >
                                                {videoData.type === 'embed' ? (
                                                    <Box
                                                        component="iframe"
                                                        src={videoData.url}
                                                        title="Heritage Video"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                        allowFullScreen
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            border: 'none'
                                                        }}
                                                    />
                                                ) : (
                                                    <Box
                                                        component="video"
                                                        src={videoData.url}
                                                        controls
                                                        sx={{
                                                            width: '100%',
                                                            maxHeight: '400px',
                                                            display: 'block',
                                                            borderRadius: '3px'
                                                        }}
                                                    >
                                                        Your browser does not support the video tag.
                                                    </Box>
                                                )}
                                            </Box>
                                        )}
                                        
                                        {!isFacebook && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    display: 'block',
                                                    mt: 1,
                                                    color: '#8B7355',
                                                    fontSize: '0.75rem',
                                                    fontStyle: 'italic',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {t('research.clickToPlay', 'Click play button to watch the video')}
                                            </Typography>
                                        )}
                                    </Box>
                                );
                            })()}

                            {/* Credit */}
                            {displayPhotos[activeIndex].credit && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#8B7355',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            letterSpacing: '0.1em',
                                            textTransform: 'uppercase',
                                            mb: 1
                                        }}
                                    >
                                        {t('research.credit', 'Credit')}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: '#D4AF37',
                                            fontSize: '0.9rem',
                                            lineHeight: 1.6
                                        }}
                                    >
                                        {displayPhotos[activeIndex].credit}
                                    </Typography>
                                </Box>
                            )}

                            {/* Hint text */}
                            <Box
                                sx={{
                                    mt: 'auto',
                                    pt: 3,
                                    borderTop: '1px solid rgba(212, 175, 55, 0.1)'
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: '#8B7355',
                                        fontSize: '0.8rem',
                                        lineHeight: 1.6,
                                        fontStyle: 'italic'
                                    }}
                                >
                                    {t(
                                        'research.viewerHint',
                                        'Use arrow keys or buttons to navigate. Press ESC or click outside to close.'
                                    )}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
            </Dialog >

            {/* Reorder Photos Dialog */}
            < Dialog
                open={openOrderDialog}
                onClose={() => setOpenOrderDialog(false)}
                maxWidth="sm"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        m: { xs: 1, sm: 2 },
                        width: { xs: 'calc(100% - 16px)', sm: 'calc(100% - 32px)' },
                    }
                }}
            >
                <DialogTitle sx={{ borderBottom: '1px solid #e0e0e0', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                    Reorder Photos
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DragIndicator sx={{ color: '#8B0000', fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                        <Typography variant="body2" sx={{ color: '#666', fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                            Drag rows to reorder, or use the up/down arrows.
                        </Typography>
                    </Box>
                    {photoOrder.length === 0 ? (
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            No photos to reorder.
                        </Typography>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {photoOrder.map((photo, index) => (
                                <Box
                                    key={photo._id}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDrop(index)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: { xs: 1, md: 1.5 },
                                        p: { xs: 1.5, md: 2 },
                                        border: '1px dashed #c4c4c4',
                                        borderRadius: 1,
                                        bgcolor: '#fff',
                                        cursor: 'grab',
                                        '&:active': { cursor: 'grabbing' },
                                        '&:hover': {
                                            borderColor: '#8B0000',
                                            bgcolor: '#faf6f6'
                                        }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: { xs: 28, md: 36 },
                                            height: { xs: 28, md: 36 },
                                            borderRadius: 1,
                                            bgcolor: 'rgba(139,0,0,0.08)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <DragIndicator sx={{ color: '#8B0000', fontSize: { xs: '1rem', md: '1.5rem' } }} />
                                    </Box>
                                    <Box
                                        component="img"
                                        src={photo.url}
                                        alt={getCaption(photo.caption)}
                                        sx={{
                                            width: 50,
                                            height: 50,
                                            objectFit: 'cover',
                                            borderRadius: 1,
                                            border: '1px solid #ddd'
                                        }}
                                    />
                                    <Typography sx={{ fontWeight: 600, flex: 1, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                                        {getCaption(photo.caption) || `Photo ${index + 1}`}
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => movePhoto(index, index - 1)}
                                            disabled={index === 0}
                                            sx={{ bgcolor: '#f5f5f5', width: { xs: 32, md: 36 }, height: { xs: 32, md: 36 } }}
                                        >
                                            <ArrowUpward fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => movePhoto(index, index + 1)}
                                            disabled={index === photoOrder.length - 1}
                                            sx={{ bgcolor: '#f5f5f5', width: { xs: 32, md: 36 }, height: { xs: 32, md: 36 } }}
                                        >
                                            <ArrowDownward fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, gap: { xs: 0.5, sm: 1 }, flexWrap: 'wrap' }}>
                    <Button onClick={() => setOpenOrderDialog(false)} sx={{
                        color: '#666',
                        fontSize: i18n.language === 'ta'
                            ? { xs: '0.75rem', sm: '0.8rem' }
                            : { xs: '0.85rem', sm: '0.875rem' }
                    }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveOrder}
                        variant="contained"
                        sx={{
                            bgcolor: '#8B0000',
                            fontSize: i18n.language === 'ta'
                                ? { xs: '0.75rem', sm: '0.8rem' }
                                : { xs: '0.85rem', sm: '0.875rem' },
                            '&:hover': { bgcolor: '#6B0000' }
                        }}
                        disabled={photoOrder.length === 0}
                    >
                        Save Order
                    </Button>
                </DialogActions>
            </Dialog >
        </Container >
    );
}
