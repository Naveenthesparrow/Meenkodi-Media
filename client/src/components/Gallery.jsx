import React, { useState, useEffect, useMemo } from 'react';
import SEO, { pageSEO } from './common/SEO';
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
  Tabs,
  Tab,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Add, Edit, Delete, CreateNewFolder, Settings, DragIndicator, ArrowUpward, ArrowDownward, ArrowBack } from '@mui/icons-material';
import MediaUpload from './common/MediaUpload';
import PageHeading from './common/PageHeading';
import OptimizedImage from './common/OptimizedImage';
import { useTranslation } from 'react-i18next';
import GalleryDetail from './GalleryDetail';

let cachedGalleryData = null;

// helper to create stable slug from category names (supports unicode characters like Tamil)
const slugify = (str) => {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const isLegacyFolder = (item) => (
  item.category === 'Other' &&
  item.customCategoryName &&
  (item.customCategoryName.en || item.customCategoryName.ta) &&
  (item.name?.en?.includes(' - Folder') || item.name?.ta?.includes(' - Folder'))
);

const CATEGORIES = [
  { key: 'All', label: 'gallery.category.all', value: 'All' },
  { key: 'Kings', label: 'gallery.category.kings', value: 'Kings' },
  { key: 'Leaders', label: 'gallery.category.leaders', value: 'Leaders' },
  { key: 'Poets', label: 'gallery.category.poets', value: 'Poets' },
  { key: 'Freedom Fighters', label: 'gallery.category.freedomFighters', value: 'Freedom Fighters' },
  { key: 'Artists', label: 'gallery.category.artists', value: 'Artists' },
  { key: 'Temples', label: 'gallery.category.temples', value: 'Temples' },
  { key: 'Cultural Events', label: 'gallery.category.culturalEvents', value: 'Cultural Events' },
  { key: 'Traditional Crafts', label: 'gallery.category.traditionalCrafts', value: 'Traditional Crafts' },
  { key: 'Other', label: 'gallery.category.other', value: 'Other' }
];

export default function Gallery({ user }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { folderSlug } = useParams();
  const [galleryItems, setGalleryItems] = useState(cachedGalleryData || []);
  const [filteredItems, setFilteredItems] = useState(cachedGalleryData || []);
  const [loading, setLoading] = useState(!cachedGalleryData);

  const setGalleryItemsAndCache = (newItems) => {
    cachedGalleryData = newItems;
    setGalleryItems(newItems);
  };
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCreateCategoryDialog, setOpenCreateCategoryDialog] = useState(false);
  const [newCategoryName_en, setNewCategoryName_en] = useState('');
  const [newCategoryName_ta, setNewCategoryName_ta] = useState('');
  const [editLanguage, setEditLanguage] = useState('en');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('folders'); // 'folders' or 'images'
  const [selectedFolderName, setSelectedFolderName] = useState('');
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [folderOrder, setFolderOrder] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const [currentGalleryItem, setCurrentGalleryItem] = useState({
    name_en: '',
    name_ta: '',
    category: '',
    customCategoryName: '',
    customCategoryName_ta: '',
    description_en: '',
    description_ta: '',
    keywords: '',
    era: '',
    imageUrl: '',
    videoUrl: '',
    isFolder: false,
  });
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  const getContent = (field) => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    return i18n.language === 'ta' && field.ta ? field.ta : field.en || '';
  };

  const toAbsoluteMediaUrl = (url) => {
    if (!url) return url;
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('data:')) return url; // data URLs are already absolute
    const withLeading = url.startsWith("/") ? url : `/${url}`;
    return withLeading;
  };

  const getSelectedFolderDisplayName = () => {
    if (!selectedFolderName) return '';
    const resolveName = (bilingual) => {
      if (!bilingual) return '';
      if (typeof bilingual === 'string') return bilingual;
      return i18n.language === 'ta' && bilingual?.ta ? bilingual.ta : bilingual?.en || '';
    };
    const normalize = (value) => (value || '').toString().trim().toLowerCase();
    const target = normalize(selectedFolderName);
    const folder = galleryItems.find(item => {
      if (!(item.isFolder || isLegacyFolder(item))) return false;
      const candidates = [
        resolveName(item.customCategoryName || item.name),
        item.customCategoryName?.en,
        item.customCategoryName?.ta,
        item.name?.en,
        item.name?.ta,
      ].filter(Boolean);
      return candidates.some(name => normalize(name) === target || slugify(name) === target);
    });
    return folder ? resolveName(folder.customCategoryName || folder.name) : selectedFolderName;
  };

  const dynamicSEO = useMemo(() => {
    if (viewMode === 'images' && selectedFolderName) {
      const folderDisplayName = getSelectedFolderDisplayName();
      return {
        title: `${folderDisplayName} | Gallery`,
        description: `Explore photos, history, and media inside the ${folderDisplayName} folder of Meenkodi Tamil Heritage Gallery.`,
        keywords: `${folderDisplayName}, Tamil Heritage Gallery, ${folderDisplayName} photos, Meenkodi`
      };
    }
    return pageSEO.gallery;
  }, [viewMode, selectedFolderName, galleryItems, i18n.language]);

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const queryFolder = params.get('folder');
    const target = folderSlug || queryFolder;
    if (target) {
      setViewMode('images');
      setSelectedFolderName(target);
      setSearchTerm('');
    } else {
      setViewMode('folders');
      setSelectedFolderName('');
    }
  }, [folderSlug, location.search]);

  const isPhotoItem = useMemo(() => {
    if (!folderSlug) return false;
    if (galleryItems.length === 0) return false;
    const resolveName = (bilingual) => {
      if (!bilingual) return '';
      if (typeof bilingual === 'string') return bilingual;
      return i18n.language === 'ta' && bilingual?.ta ? bilingual.ta : bilingual?.en || '';
    };
    const folderExists = galleryItems.some(item => {
      if (!(item.isFolder || isLegacyFolder(item))) return false;
      const candidates = [
        resolveName(item.customCategoryName || item.name),
        item.customCategoryName?.en,
        item.customCategoryName?.ta,
        item.name?.en,
        item.name?.ta,
      ].filter(Boolean);
      return candidates.some(name => slugify(name) === folderSlug.toLowerCase() || name.toLowerCase().trim() === folderSlug.toLowerCase().trim());
    });
    if (!folderExists && galleryItems.some(item => item._id === folderSlug)) {
      return true;
    }
    return false;
  }, [folderSlug, galleryItems, i18n.language]);

  useEffect(() => {
    const resolveName = (bilingual) => {
      if (!bilingual) return '';
      if (typeof bilingual === 'string') return bilingual;
      return i18n.language === 'ta' && bilingual?.ta ? bilingual.ta : bilingual?.en || '';
    };

    const matchesSearch = (item, searchLower) => {
      const itemName = i18n.language === 'ta' && item.name?.ta ? item.name.ta : item.name?.en || '';
      const itemDescription = i18n.language === 'ta' && item.description?.ta ? item.description.ta : item.description?.en || '';
      const folderName = item.customCategoryName ? resolveName(item.customCategoryName) : '';
      const nameMatch = itemName.toLowerCase().includes(searchLower);
      const descriptionMatch = itemDescription.toLowerCase().includes(searchLower);
      const keywordsMatch = item.keywords && item.keywords.some(k => k.toLowerCase().includes(searchLower));
      const folderMatch = folderName.toLowerCase().includes(searchLower);
      return nameMatch || descriptionMatch || keywordsMatch || folderMatch;
    };

    const folderItems = galleryItems.filter(item => item.isFolder || isLegacyFolder(item));
    const photoItems = galleryItems.filter(item => !(item.isFolder || isLegacyFolder(item)));

    const searchLower = searchTerm.trim().toLowerCase();

    if (searchLower) {
      const folderCards = folderItems
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((folder) => {
          const folderName = resolveName(folder.customCategoryName || folder.name);
          const folderSlug = slugify(folderName);
          const folderPhotos = photoItems.filter(photo => {
            if (!photo.customCategoryName) return false;
            const photoFolderName = resolveName(photo.customCategoryName);
            return (
              photoFolderName.toString().trim().toLowerCase() === folderName.toString().trim().toLowerCase() ||
              slugify(photoFolderName) === folderSlug
            );
          });
          const itemCount = folderPhotos.length;
          const coverImage = folder.imageUrl || (folderPhotos.find(p => p.imageUrl)?.imageUrl || '');

          return {
            ...folder,
            name: folder.customCategoryName || folder.name,
            imageUrl: coverImage,
            itemCount,
            isFolder: true,
          };
        })
        .filter(folder => {
          const folderName = resolveName(folder.customCategoryName || folder.name);
          return folderName.toLowerCase().includes(searchLower);
        });

      const matchedImages = photoItems.filter(item => matchesSearch(item, searchLower));

      setFilteredItems([...folderCards, ...matchedImages]);
      return;
    }

    if (viewMode === 'folders') {
      const folderCards = folderItems
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((folder) => {
        const folderName = resolveName(folder.customCategoryName || folder.name);
        const folderSlug = slugify(folderName);
        const folderPhotos = photoItems.filter(photo => {
          if (!photo.customCategoryName) return false;
          const photoFolderName = resolveName(photo.customCategoryName);
          return (
            photoFolderName.toString().trim().toLowerCase() === folderName.toString().trim().toLowerCase() ||
            slugify(photoFolderName) === folderSlug
          );
        });
        const itemCount = folderPhotos.length;
        const coverImage = folder.imageUrl || (folderPhotos.find(p => p.imageUrl)?.imageUrl || '');

        return {
          ...folder,
          name: folder.customCategoryName || folder.name,
          imageUrl: coverImage,
          itemCount,
          isFolder: true,
        };
      });

      setFilteredItems(folderCards);
    } else if (viewMode === 'images' && selectedFolderName) {
      // Show images inside selected folder
      const normalize = (value) => (value || '').toString().trim().toLowerCase();
      const selectedNormalized = normalize(selectedFolderName);
      const selectedSlug = slugify(selectedFolderName);
      
      // First, find which folder was selected by checking all folders
      const selectedFolder = folderItems.find(folder => {
        const candidates = [
          resolveName(folder.customCategoryName || folder.name),
          folder.customCategoryName?.en,
          folder.customCategoryName?.ta,
          folder.name?.en,
          folder.name?.ta,
        ].filter(Boolean);
        return candidates.some(name => normalize(name) === selectedNormalized || slugify(name) === selectedSlug);
      });
      
      let images = photoItems.filter(item => {
        if (!item.customCategoryName) return false;
        
        // Get the folder name from the image's customCategoryName
        const imageFolderName = resolveName(item.customCategoryName);
        const imageFolderSlug = slugify(imageFolderName);
        
        // Also check against the selected folder's actual names
        if (selectedFolder) {
          const selectedFolderEnName = typeof selectedFolder.customCategoryName === 'string' 
            ? selectedFolder.customCategoryName 
            : (selectedFolder.customCategoryName?.en || '');
          const selectedFolderTaName = typeof selectedFolder.customCategoryName === 'string' 
            ? '' 
            : (selectedFolder.customCategoryName?.ta || '');
          
          const imageEnName = typeof item.customCategoryName === 'string' 
            ? item.customCategoryName 
            : (item.customCategoryName.en || '');
          const imageTaName = typeof item.customCategoryName === 'string' 
            ? '' 
            : (item.customCategoryName.ta || '');
          
          // Match if either English or Tamil names match
          if (
            (selectedFolderEnName && normalize(imageEnName) === normalize(selectedFolderEnName)) ||
            (selectedFolderTaName && normalize(imageTaName) === normalize(selectedFolderTaName)) ||
            normalize(imageFolderName) === selectedNormalized ||
            imageFolderSlug === selectedSlug
          ) {
            return true;
          }
        }
        
        // Fallback: compare the resolved names or slugified names
        return normalize(imageFolderName) === selectedNormalized || imageFolderSlug === selectedSlug;
      }).sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

      setFilteredItems(images);
    }
  }, [viewMode, selectedFolderName, galleryItems, i18n.language, searchTerm]);

  const fetchGalleryItems = async () => {
    try {
      const response = await fetch(`/api/gallery`);
      if (!response.ok) {
        throw new Error('Failed to fetch gallery items');
      }
      const data = await response.json();
      setGalleryItemsAndCache(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching gallery items:", err);
      if (!cachedGalleryData) {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  const handleAdd = () => {
    // Pre-fill form with current tab/category when adding from a category view
    const init = {
      name_en: '',
      name_ta: '',
      category: '',
      customCategoryName: '',
      customCategoryName_ta: '',
      description_en: '',
      description_ta: '',
      keywords: '',
      era: '',
      imageUrl: '',
      videoUrl: '',
      isFolder: false,
    };

    // If we're adding from within a folder view, auto-select that folder
    if (viewMode === 'images' && selectedFolderName) {
      // Find the folder to get its customCategoryName
      const folderItems = galleryItems.filter(item => item.isFolder);

      if (folderItems.length > 0) {
        const folder = folderItems.find(item => getContent(item.customCategoryName || item.name) === selectedFolderName) || folderItems[0];
        init.category = 'Other';
        init.customCategoryName = folder.customCategoryName?.en || '';
        init.customCategoryName_ta = folder.customCategoryName?.ta || '';
      }
    }

    setCurrentGalleryItem(init);
    setOpenDialog(true);
  };

  const handleEdit = (galleryItem) => {
    const state = {
      ...galleryItem,
      name_en: galleryItem.name?.en || '',
      name_ta: galleryItem.name?.ta || '',
      customCategoryName: galleryItem.customCategoryName?.en || '',
      customCategoryName_ta: galleryItem.customCategoryName?.ta || '',
      description_en: galleryItem.description?.en || '',
      description_ta: galleryItem.description?.ta || '',
      keywords: Array.isArray(galleryItem.keywords) ? galleryItem.keywords.join(', ') : '',
      isFolder: !!galleryItem.isFolder,
    };

    // If this item has a customCategoryName, set the category to the CUSTOM slug value (tolerant of older records)
    if (galleryItem.customCategoryName && (galleryItem.customCategoryName.en || galleryItem.customCategoryName.ta)) {
      const baseName = galleryItem.customCategoryName.en || galleryItem.customCategoryName.ta;
      const slug = slugify(baseName);
      state.category = `CUSTOM:${slug}`;
    }

    setCurrentGalleryItem(state);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const keywordsArray = currentGalleryItem.keywords
        .split(',')
        .map(k => k.trim())
        .filter(k => k);

      if (!currentGalleryItem.isFolder && (!currentGalleryItem.category || currentGalleryItem.category === 'All')) {
        setError("Please select a valid category.");
        return;
      }

      // Resolve final category and customCategoryName
      let finalCategory = currentGalleryItem.category;
      let finalCustomCategoryName = null;

      const isCustomCategory = typeof finalCategory === 'string' && finalCategory.startsWith('CUSTOM:');

      if (currentGalleryItem.isFolder) {
        finalCategory = 'Other';
        finalCustomCategoryName = {
          en: currentGalleryItem.name_en,
          ta: currentGalleryItem.name_ta
        };
      } else if (isCustomCategory) {
        finalCategory = 'Other';
        finalCustomCategoryName = {
          en: currentGalleryItem.customCategoryName,
          ta: currentGalleryItem.customCategoryName_ta
        };
      }

      // If user explicitly selected 'Other' and filled customCategoryName fields in the form
      if (!currentGalleryItem.isFolder && finalCategory === 'Other' && !isCustomCategory && (currentGalleryItem.customCategoryName || currentGalleryItem.customCategoryName_ta)) {
        finalCustomCategoryName = {
          en: currentGalleryItem.customCategoryName,
          ta: currentGalleryItem.customCategoryName_ta
        };
      }

      const payload = {
        name: {
          en: currentGalleryItem.name_en,
          ta: currentGalleryItem.name_ta
        },
        category: finalCategory,
        isFolder: !!currentGalleryItem.isFolder,
        ...(finalCustomCategoryName ? { customCategoryName: finalCustomCategoryName } : {}),
        description: {
          en: currentGalleryItem.description_en,
          ta: currentGalleryItem.description_ta
        },
        keywords: keywordsArray,
        era: currentGalleryItem.era,
        imageUrl: currentGalleryItem.imageUrl,
        videoUrl: currentGalleryItem.videoUrl,
      };

      const method = currentGalleryItem._id ? 'PUT' : 'POST';
      const url = currentGalleryItem._id
        ? (currentGalleryItem.isFolder ? `/api/gallery/folder/${currentGalleryItem._id}` : `/api/gallery/${currentGalleryItem._id}`)
        : `/api/gallery`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save gallery item');
      }

      const savedGalleryItem = await response.json();

      if (method === 'POST') {
        setGalleryItemsAndCache([...galleryItems, savedGalleryItem]);
      } else {
        setGalleryItemsAndCache(galleryItems.map(item =>
          item._id === savedGalleryItem._id ? savedGalleryItem : item
        ));
      }

      setOpenDialog(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this gallery item?')) {
      try {
        const response = await fetch(`/api/gallery/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to delete gallery item');
        }

        setGalleryItemsAndCache(galleryItems.filter(item => item._id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleDeleteFolder = async (folderItem) => {
    const folderName = getContent(folderItem.customCategoryName || folderItem.name);
    if (window.confirm(`Delete the folder "${folderName}" and all photos inside it?`)) {
      try {
        const response = await fetch(`/api/gallery/folder/${folderItem._id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to delete folder');
        }

        await fetchGalleryItems();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName_en.trim() && !newCategoryName_ta.trim()) {
      setError("Please enter a category name");
      return;
    }

    // Create a dummy gallery item to establish the category
    const categoryName = {
      en: newCategoryName_en.trim(),
      ta: newCategoryName_ta.trim()
    };

    const newItem = {
      name: { en: newCategoryName_en.trim(), ta: newCategoryName_ta.trim() },
      category: 'Other',
      customCategoryName: categoryName,
      description: { en: '', ta: '' },
      keywords: [],
      era: '',
      imageUrl: '',
      videoUrl: '',
      isFolder: true,
    };

    try {
      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newItem),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      const savedItem = await response.json();
      setGalleryItemsAndCache([...galleryItems, savedItem]);

      // Switch to the new category
      const slug = slugify(newCategoryName_en || newCategoryName_ta);
      setSelectedCategory(`CUSTOM:${slug}`);

      setOpenCreateCategoryDialog(false);
      setNewCategoryName_en('');
      setNewCategoryName_ta('');
    } catch (err) {
      setError(err.message);
    }
  };



  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDrop = (index) => {
    if (dragIndex === null || dragIndex === index) return;
    const updated = [...folderOrder];
    const [moved] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, moved);
    setFolderOrder(updated);
    setDragIndex(null);
  };

  const openReorderDialog = () => {
    if (viewMode === 'folders') {
      const folders = galleryItems
        .filter(item => item.isFolder || isLegacyFolder(item))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setFolderOrder(folders);
    } else {
      // Filter photos in the selected folder
      const resolveName = (bilingual) => {
        if (!bilingual) return '';
        if (typeof bilingual === 'string') return bilingual;
        return i18n.language === 'ta' && bilingual?.ta ? bilingual.ta : bilingual?.en || '';
      };
      const normalize = (value) => (value || '').toString().trim().toLowerCase();
      const selectedNormalized = normalize(selectedFolderName);
      const selectedSlug = slugify(selectedFolderName);
      
      const selectedFolder = galleryItems.find(folder => {
        const candidates = [
          resolveName(folder.customCategoryName || folder.name),
          folder.customCategoryName?.en,
          folder.customCategoryName?.ta,
          folder.name?.en,
          folder.name?.ta,
        ].filter(Boolean);
        return candidates.some(name => normalize(name) === selectedNormalized || slugify(name) === selectedSlug);
      });

      const photos = galleryItems.filter(item => {
        if (item.isFolder || isLegacyFolder(item)) return false;
        if (!item.customCategoryName) return false;
        
        const imageFolderName = resolveName(item.customCategoryName);
        const imageFolderSlug = slugify(imageFolderName);

        if (selectedFolder) {
          const selectedFolderEnName = typeof selectedFolder.customCategoryName === 'string' 
            ? selectedFolder.customCategoryName 
            : (selectedFolder.customCategoryName?.en || '');
          const selectedFolderTaName = typeof selectedFolder.customCategoryName === 'string' 
            ? '' 
            : (selectedFolder.customCategoryName?.ta || '');
          
          const imageEnName = typeof item.customCategoryName === 'string' 
            ? item.customCategoryName 
            : (item.customCategoryName.en || '');
          const imageTaName = typeof item.customCategoryName === 'string' 
            ? '' 
            : (item.customCategoryName.ta || '');
          
          if (
            (selectedFolderEnName && normalize(imageEnName) === normalize(selectedFolderEnName)) ||
            (selectedFolderTaName && normalize(imageTaName) === normalize(selectedFolderTaName)) ||
            normalize(imageFolderName) === selectedNormalized ||
            imageFolderSlug === selectedSlug
          ) {
            return true;
          }
        }
        return normalize(imageFolderName) === selectedNormalized || imageFolderSlug === selectedSlug;
      }).sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

      setFolderOrder(photos);
    }
    setOpenOrderDialog(true);
  };

  const handleSaveOrder = async () => {
    try {
      const orderedIds = folderOrder.map(folder => folder._id);
      const url = viewMode === 'folders' ? '/api/gallery/folders/order' : '/api/gallery/photos/order';
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderedIds })
      });

      if (!response.ok) {
        throw new Error(viewMode === 'folders' ? 'Failed to save folder order' : 'Failed to save picture order');
      }

      await fetchGalleryItems();
      setOpenOrderDialog(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const moveFolder = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= folderOrder.length) return;
    const updated = [...folderOrder];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setFolderOrder(updated);
  };

  if (isPhotoItem) {
    return <GalleryDetail user={user} />;
  }

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
    <>
      <SEO {...dynamicSEO} />
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
      <Container maxWidth="lg" sx={{ pt: { xs: 2, sm: 3, md: 3 }, pb: { xs: 3, sm: 4, md: 5 }, px: { xs: 1.5, sm: 2, md: 4 }, position: 'relative' }}>
        <PageHeading
          leftActions={user && user.role === 'admin' ? (
            <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, alignItems: 'center', gap: 0.5 }}>
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
                    : undefined,
                }}
              >
                {t('gallery.editOrder', 'Edit Order')}
              </Button>
            </Box>
          ) : null}
          typographySx={{ 
            fontSize: i18n.language === 'ta' 
              ? { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' }
              : { xs: '2.2rem', sm: '2.8rem', md: '3.6rem' }
          }}
          actions={user && user.role === 'admin' && viewMode === 'folders' ? (
            <Button
              onClick={() => setOpenCreateCategoryDialog(true)}
              variant="contained"
              startIcon={<Add />}
              sx={{
                bgcolor: '#8B0000',
                color: '#fff',
                px: 3,
                py: 1,
                fontSize: '0.85rem',
                fontWeight: 700,
                fontFamily: 'Georgia, serif',
                borderRadius: 0,
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                '&:hover': {
                  bgcolor: '#6B0000',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              {t('gallery.addFolder', 'Add Folder')}
            </Button>
          ) : null}
        >
          {viewMode === 'images' && selectedFolderName ? getSelectedFolderDisplayName() : t('gallery.title', 'Gallery')}
        </PageHeading>

        {/* Search Bar */}
        {viewMode === 'folders' && (
          <Box sx={{ 
            mb: { xs: 3, md: 5 }, 
            display: 'flex', 
            justifyContent: 'center',
            px: { xs: 0, sm: 1, md: 0 }
          }}>
            <TextField
              fullWidth
              label={t('gallery.searchLabel', 'Search photos by name')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
              size="medium"
              sx={{
                maxWidth: '720px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '999px',
                  backgroundColor: '#fff',
                  boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
                  transition: 'all 0.25s ease',
                  '& fieldset': {
                    borderColor: '#e2e2e2',
                    borderWidth: 1.5,
                  },
                  '&:hover': {
                    boxShadow: '0 12px 28px rgba(139,0,0,0.15)',
                    '& fieldset': {
                      borderColor: '#8B0000',
                    }
                  },
                  '&.Mui-focused': {
                    boxShadow: '0 14px 30px rgba(139,0,0,0.18)',
                    '& fieldset': {
                      borderColor: '#8B0000',
                      borderWidth: 2,
                    }
                  },
                },
                '& .MuiInputLabel-root': {
                  fontFamily: 'Georgia, serif',
                  color: '#777',
                  top: '50%',
                  transform: 'translate(14px, -50%) scale(1)',
                  transition: 'all 0.2s ease',
                  fontSize: { xs: '0.9rem', md: '1rem' },
                },
                '& .MuiInputLabel-root.Mui-focused, & .MuiInputLabel-root.MuiFormLabel-filled': {
                  transform: 'translate(14px, -26px) scale(0.75)',
                },
                '& .MuiOutlinedInput-input': {
                  fontFamily: 'Georgia, serif',
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  px: { xs: 2, md: 2.5 },
                  py: { xs: 1.2, md: 1.4 },
                }
              }}
            />
          </Box>
        )}

        {/* Folder Navigation */}
        {viewMode === 'images' && (
          <Box sx={{ mb: { xs: 3, md: 4 }, display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 }, px: { xs: 0, sm: 1, md: 0 }, justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                onClick={() => {
                  navigate('/gallery');
                }}
                variant="outlined"
                startIcon={<ArrowBack sx={{ fontSize: '1rem !important' }} />}
                sx={{
                  color: '#8B0000',
                  borderColor: '#8B0000',
                  borderRadius: 0,
                  '&:hover': {
                    bgcolor: 'rgba(139,0,0,0.08)',
                    borderColor: '#8B0000',
                  },
                  fontSize: i18n.language === 'ta'
                    ? { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
                    : { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                  px: { xs: 2, md: 3 },
                  py: { xs: 0.5, md: 1 },
                  letterSpacing: '0.05em',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}
              >
                {t('gallery.backToFolders', 'Back to Folders')}
              </Button>
            </Box>
            {user && user.role === "admin" && (
              <Button
                onClick={() => {
                  // Create new item with current folder pre-selected
                  setCurrentGalleryItem({
                    name_en: '',
                    name_ta: '',
                    category: 'Other',
                    customCategoryName: selectedFolderName,
                    customCategoryName_ta: selectedFolderName,
                    description_en: '',
                    description_ta: '',
                    keywords: '',
                    era: '',
                    imageUrl: '',
                    videoUrl: '',
                    isFolder: false,
                  });
                  setOpenDialog(true);
                }}
                variant="contained"
                startIcon={<Add />}
                sx={{
                  bgcolor: '#8B0000',
                  color: '#fff',
                  px: 3,
                  py: 1,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  fontFamily: 'Georgia, serif',
                  borderRadius: 0,
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  '&:hover': {
                    bgcolor: '#6B0000',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {t('gallery.addImage', 'Add Image')}
              </Button>
            )}
          </Box>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: viewMode === 'folders' ? 'repeat(auto-fit, minmax(280px, 1fr))' : 'repeat(3, 1fr)',
              lg: viewMode === 'folders' ? 'repeat(auto-fit, minmax(300px, 1fr))' : 'repeat(4, 1fr)'
            },
            gap: { xs: 2.5, sm: 3, md: 4 },
            pt: 2,
          }}
        >
          {filteredItems.map((item, index) => (
            <Fade
              in={true}
              timeout={350}
              key={item._id}
            >
              <Box
                sx={{
                  width: '100%',
                  transition: 'all 0.3s ease',
                }}
              >
                <Card
                  component={Link}
                  to={item.isFolder
                    ? `/gallery/${slugify(getContent(item.customCategoryName || item.name))}`
                    : `/gallery/${item._id}`
                  }
                  state={item.isFolder ? undefined : {
                    fromFolder: viewMode === 'images',
                    folderName: selectedFolderName,
                  }}
                  sx={{
                    textDecoration: 'none',
                    display: 'block',
                    width: '100%',
                    maxWidth: item.isFolder ? 320 : 'none',
                    mx: item.isFolder ? 'auto' : 0,
                    height: item.isFolder
                      ? 'auto'
                      : (viewMode === 'images'
                        ? { xs: 200, sm: 240, md: 280 }
                        : { xs: 200, sm: 240, md: 280, lg: 300 }),
                    aspectRatio: item.isFolder ? '1 / 1' : 'auto',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: viewMode === 'images' ? 0.5 : 0,
                    border: viewMode === 'images' && !item.isFolder ? '1px solid #eee' : 'none',
                    cursor: 'pointer',
                    backgroundColor: viewMode === 'images' && !item.isFolder ? '#fff' : 'transparent',
                    p: viewMode === 'images' && !item.isFolder ? { xs: 1, sm: 1.5 } : 0,
                    boxShadow: viewMode === 'images' && !item.isFolder
                      ? '0 8px 24px rgba(0,0,0,0.08)'
                      : '0 4px 20px rgba(0,0,0,0.12)',
                    transition: 'all 0.35s ease',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      border: '3px solid #8B0000',
                      opacity: 0,
                      transition: 'opacity 0.4s ease',
                      zIndex: 10,
                      pointerEvents: 'none',
                    },
                    '&:hover': {
                      transform: { xs: 'none', sm: 'translateY(-8px)', md: 'translateY(-12px)' },
                      boxShadow: { xs: '0 12px 28px rgba(139,0,0,0.2)', md: '0 20px 40px rgba(139,0,0,0.3)' },
                      '&::before': {
                        opacity: { xs: 0, sm: 1 },
                      },
                      ...(viewMode === 'images' && !item.isFolder ? {
                        transform: { xs: 'none', md: 'translateY(-4px)' },
                        boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
                      } : {}),
                      '& .image-overlay': {
                        opacity: 1,
                      },
                      '& .card-image': {
                        transform: viewMode === 'images' ? 'none' : { xs: 'scale(1.02)', sm: 'scale(1.05)', md: 'scale(1.08)' },
                        filter: viewMode === 'images' ? 'none' : 'brightness(0.85)',
                      },
                      '& .category-badge': {
                        transform: { xs: 'none', md: 'translateY(-4px)' },
                        backgroundColor: '#8B0000',
                      },
                      '& .card-title': {
                        color: '#DAA520',
                      },
                      '& .view-button': {
                        transform: { xs: 'translateX(0)', md: 'translateX(0)' },
                        opacity: 1,
                      },
                      '& .admin-controls': {
                        opacity: 1,
                        transform: 'translateY(0)',
                      }
                    },
                  }}
                >
                  {/* Image */}
                  {(item.imageUrl || item.imageLink) ? (
                    <OptimizedImage
                      src={toAbsoluteMediaUrl(item.imageUrl || item.imageLink)}
                      alt={`${getContent(item.name)} - Tamil Heritage ${item.category || ''} | Meenkodi`}
                      className="card-image"
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: viewMode === 'images' ? 'contain' : 'cover',
                        backgroundColor: viewMode === 'images' ? '#fff' : 'transparent',
                        transition: 'all 0.5s ease',
                        filter: viewMode === 'images' ? 'none' : 'brightness(0.95)',
                        borderRadius: viewMode === 'images' ? 6 : 0,
                      }}
                      skeletonSx={{
                        bgcolor: 'rgba(139, 0, 0, 0.08)',
                      }}
                      onError={(e) => {
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='350' height='400' viewBox='0 0 350 400'%3E%3Crect fill='%23e0e0e0' width='350' height='400'%3E%3C/rect%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18px' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#e0e0e0',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        No Image
                      </Typography>
                    </Box>
                  )}

                  {viewMode !== 'images' && !item.isFolder && (
                    <Box
                      className="image-overlay"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 30%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0) 100%)',
                        opacity: 0.8,
                        transition: 'opacity 0.4s ease',
                        pointerEvents: 'none',
                      }}
                    />
                  )}

                  {/* Category Badge - Top Left (removed) */}

                  {/* Info Section - Bottom */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      p: { xs: 1.5, sm: 2, md: 2.5 },
                      color: '#fff',
                      zIndex: 2,
                    }}
                  >
                    {viewMode !== 'images' && !item.isFolder && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          p: { xs: 2.5, md: 3 },
                          color: '#fff',
                          zIndex: 2,
                        }}
                      >
                        {/* Folder Badge for Folders */}
                        {item.isFolder && (
                          <Box
                            sx={{
                              display: 'inline-block',
                              px: 1.5,
                              py: 0.5,
                              bgcolor: 'rgba(139,0,0,0.85)',
                              color: '#fff',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              letterSpacing: 1,
                              textTransform: 'uppercase',
                              mb: 1,
                            }}
                          >
                            📁 Folder
                          </Box>
                        )}

                        <Typography
                          className="card-title"
                          variant="h5"
                          sx={{
                            fontFamily: 'Georgia, serif',
                            fontWeight: 700,
                            fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.6rem' },
                            lineHeight: 1.2,
                            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
                            mb: 1,
                            transition: 'color 0.3s ease',
                            display: viewMode === 'images' ? 'none' : 'block',
                            wordBreak: 'break-word',
                          }}
                        >
                          {getContent(item.name)}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            opacity: 0.9,
                            fontSize: '0.9rem',
                            textShadow: '0 2px 6px rgba(0,0,0,0.8)',
                          }}
                        >
                          {item.isFolder
                            ? `${item.itemCount || 0} ${item.itemCount === 1 ? 'photo' : 'photos'}`
                            : (item.description && getContent(item.description))
                          }
                        </Typography>
                      </Box>
                    )}

                    {/* Folder Item Count */}
                    {item.isFolder && (
                      <Typography
                        variant="body2"
                        sx={{
                          lineHeight: 1.5,
                          fontSize: '0.85rem',
                          color: 'rgba(255,255,255,0.85)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item.itemCount} {item.itemCount === 1 ? 'photo' : 'photos'}
                      </Typography>
                    )}

                    {/* Description */}
                    {!item.isFolder && (
                      <Typography
                        variant="body2"
                        sx={{
                          lineHeight: 1.5,
                          fontSize: '0.85rem',
                          color: 'rgba(255,255,255,0.85)',
                        display: viewMode === 'images' ? 'none' : '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        mb: 2,
                      }}
                    >
                      {getContent(item.description)}
                    </Typography>
                    )}

                    {/* View Button */}
                    <Box
                      className="view-button"
                      sx={{
                        display: { xs: 'none', sm: 'inline-flex' },
                        alignItems: 'center',
                        gap: 1,
                        color: '#DAA520',
                        fontSize: { xs: '0.75rem', md: '0.85rem' },
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        transform: { xs: 'translateX(0)', md: 'translateX(-8px)' },
                        opacity: { xs: 1, md: 0 },
                        transition: 'all 0.4s ease',
                        '& svg': {
                          transition: 'transform 0.3s ease',
                        },
                        '&:hover svg': {
                          transform: 'translateX(4px)',
                        }
                      }}
                    >
                      {viewMode === 'images' ? (i18n.language === 'ta' ? 'பார்' : 'VIEW') : 'View Details'}
                      <Box
                        component="svg"
                        sx={{ width: 16, height: 16, fill: 'currentColor' }}
                        viewBox="0 0 24 24"
                      >
                        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                      </Box>
                    </Box>
                  </Box>

                  {/* Admin Controls - Top Right */}
                  {user && user.role === "admin" && (
                    <Box
                      className="admin-controls"
                      sx={{
                        position: 'absolute',
                        top: { xs: 8, md: 12 },
                        right: { xs: 8, md: 12 },
                        display: "flex",
                        gap: { xs: 0.5, md: 1 },
                        zIndex: 12,
                        opacity: { xs: 1, md: 0 },
                        transform: { xs: 'none', md: 'translateY(-8px)' },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleEdit(item);
                        }}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.95)',
                          color: '#000',
                          width: { xs: 32, md: 36 },
                          height: { xs: 32, md: 36 },
                          '&:hover': { 
                            bgcolor: '#8B0000',
                            color: '#fff',
                          },
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (item.isFolder) {
                            handleDeleteFolder(item);
                          } else {
                            handleDelete(item._id);
                          }
                        }}
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.95)',
                          color: '#000',
                          width: { xs: 32, md: 36 },
                          height: { xs: 32, md: 36 },
                          '&:hover': { 
                            bgcolor: '#8B0000',
                            color: '#fff',
                          },
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  )}

                </Card>

                {viewMode === 'folders' && item.isFolder && (
                  <Typography
                    variant="body1"
                    sx={{
                      mt: { xs: 1, md: 1.5 },
                      textAlign: 'center',
                      fontWeight: 700,
                      color: '#8B0000',
                      fontFamily: 'Georgia, serif',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                      px: 1,
                      wordBreak: 'break-word',
                    }}
                  >
                    {getContent(item.customCategoryName || item.name)}
                  </Typography>
                )}
              </Box>
            </Fade>
          ))}
        </Box>

        {/* Edit/Add Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
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
              maxWidth: { xs: '100%', sm: 'md' }
            }
          }}
        >
          <DialogContent sx={{ mt: 3 }}>
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
                <ToggleButton value="en">ENGLISH</ToggleButton>
                <ToggleButton value="ta">தமிழ்</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Name Field */}
            <TextField
              label={editLanguage === 'en' ? 'Name (English)' : 'பெயர் (தமிழ்)'}
              fullWidth
              sx={{ mb: 2 }}
              value={editLanguage === 'en' ? currentGalleryItem.name_en : currentGalleryItem.name_ta}
              onChange={(e) => setCurrentGalleryItem({ 
                ...currentGalleryItem, 
                [editLanguage === 'en' ? 'name_en' : 'name_ta']: e.target.value 
              })}
            />

            {!currentGalleryItem.isFolder && (
              <>
                {/* Keywords/Tags for SEO */}
                <TextField
                  label={t('gallery.form.keywords')}
                  fullWidth
                  sx={{ mb: 2 }}
                  value={currentGalleryItem.keywords}
                  onChange={(e) => setCurrentGalleryItem({ ...currentGalleryItem, keywords: e.target.value })}
                />
              </>
            )}

            {/* Media Upload */}
            <MediaUpload
              onImageChange={(url) => setCurrentGalleryItem({ ...currentGalleryItem, imageUrl: url })}
              onVideoChange={null}
              currentImage={currentGalleryItem.imageUrl}
              currentVideo={''}
              showInputsOnly={false}
              isFolder={currentGalleryItem.isFolder}
              onUploadingChange={setIsUploading}
            />
          </DialogContent>
          <DialogActions sx={{ 
            borderTop: '1px solid #e0e0e0', 
            pt: { xs: 1.5, sm: 2 }, 
            px: { xs: 2, sm: 3 }, 
            pb: { xs: 1.5, sm: 2 },
            gap: { xs: 0.5, sm: 1 },
            flexWrap: 'wrap'
          }}>
            <Button onClick={() => { setOpenDialog(false); setIsUploading(false); }} sx={{ color: '#666', fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
              {i18n.language === 'ta' ? 'ரத்து' : 'Cancel'}
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={isUploading || !currentGalleryItem.category || currentGalleryItem.category === 'All'}
              sx={{
                bgcolor: '#8B0000',
                fontSize: { xs: '0.85rem', sm: '0.875rem' },
                '&:hover': { bgcolor: '#6B0000' }
              }}
            >
              {i18n.language === 'ta' ? 'சேமி' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Create Category Dialog */}
        <Dialog 
          open={openCreateCategoryDialog} 
          onClose={() => setOpenCreateCategoryDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            fontWeight: 700, 
            color: '#8B0000',
            fontFamily: 'Georgia, serif',
            fontSize: { xs: '1.1rem', sm: '1.3rem' },
            wordBreak: 'break-word',
            pb: { xs: 1, sm: 2 }
          }}>
            {t('gallery.createNewFolder', 'Create New Photo Folder')}
          </DialogTitle>
          <DialogContent sx={{ pt: { xs: 1, sm: 2 }, px: { xs: 2, sm: 3 } }}>
            <Typography variant="body2" sx={{ mb: { xs: 2, sm: 3 }, color: '#666', fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
              {t('gallery.folderDescription', 'Create a custom folder to organize your photos. You can upload photos directly to this folder.')}
            </Typography>
            
            {/* English Name */}
            <TextField
              autoFocus
              label={t('gallery.form.nameEnglish', 'Folder Name (English)')}
              fullWidth
              value={newCategoryName_en}
              onChange={(e) => setNewCategoryName_en(e.target.value)}
              sx={{ 
                mb: 2,
                '& .MuiInputBase-input': {
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }
              }}
              placeholder="e.g., Leaders, Kings, Saints"
            />

            {/* Tamil Name */}
            <TextField
              label={t('gallery.form.nameTamil', 'Folder Name (Tamil)')}
              fullWidth
              value={newCategoryName_ta}
              onChange={(e) => setNewCategoryName_ta(e.target.value)}
              sx={{ 
                mb: 2,
                '& .MuiInputBase-input': {
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }
              }}
              placeholder="எ.கா., தலைவர்கள், மன்னர்கள்"
            />
          </DialogContent>
          <DialogActions sx={{ p: { xs: 1.5, sm: 2 }, gap: { xs: 0.5, sm: 1 }, flexWrap: 'wrap' }}>
            <Button
              onClick={() => setOpenCreateCategoryDialog(false)}
              sx={{ color: '#666', fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
            >
              {t('actions.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleCreateCategory}
              variant="contained"
              sx={{
                bgcolor: '#8B0000',
                fontSize: { xs: '0.85rem', sm: '0.875rem' },
                '&:hover': {
                  bgcolor: '#6B0000',
                }
              }}
            >
              {t('gallery.createFolder', 'Create Folder')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reorder Folders Dialog */}
        <Dialog
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
            {viewMode === 'folders' ? 'Reorder Folders' : 'Reorder Pictures'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <DragIndicator sx={{ color: '#8B0000', fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                <Typography variant="body2" sx={{ color: '#666', fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                  Drag rows to reorder, or use the up/down arrows.
                </Typography>
              </Box>
              {folderOrder.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#666' }}>
                  {viewMode === 'folders' ? 'No folders to reorder.' : 'No pictures to reorder.'}
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {folderOrder.map((folder, index) => (
                    <Box
                      key={folder._id}
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
                      <Typography sx={{ fontWeight: 600, flex: 1, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                        {getContent(folder.isFolder || isLegacyFolder(folder) ? (folder.customCategoryName || folder.name) : folder.name)}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => moveFolder(index, index - 1)}
                          disabled={index === 0}
                          sx={{ bgcolor: '#f5f5f5', width: { xs: 32, md: 36 }, height: { xs: 32, md: 36 } }}
                        >
                          <ArrowUpward fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => moveFolder(index, index + 1)}
                          disabled={index === folderOrder.length - 1}
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
            <Button onClick={() => setOpenOrderDialog(false)} sx={{ color: '#666', fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveOrder}
              variant="contained"
              sx={{
                bgcolor: '#8B0000',
                fontSize: { xs: '0.85rem', sm: '0.875rem' },
                '&:hover': { bgcolor: '#6B0000' }
              }}
              disabled={folderOrder.length === 0}
            >
              Save Order
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bottom action - Back to home */}
        {!user && (
          <Box sx={{ 
            mt: { xs: 4, md: 6 }, 
            mb: { xs: 3, md: 4 }, 
            textAlign: 'center', 
            px: 2 
          }}>
            <Button
              onClick={() => navigate('/')}
              variant="outlined"
              sx={{
                color: '#000',
                borderColor: '#000',
                borderWidth: 2,
                borderRadius: 0,
                px: { xs: 3, md: 4 },
                py: { xs: 1, md: 1.5 },
                fontWeight: 700,
                fontFamily: 'Georgia, serif',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontSize: { xs: '0.8rem', md: '0.875rem' },
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
        )}
      </Container>
    </Box>
    </>
  );
}
