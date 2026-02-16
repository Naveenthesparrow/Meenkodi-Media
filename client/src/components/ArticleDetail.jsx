import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Container,
  Paper,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Divider
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import Favorite from "@mui/icons-material/Favorite";
import FavoriteBorder from "@mui/icons-material/FavoriteBorder";
import { useTranslation } from 'react-i18next';
import MediaUpload from "./common/MediaUpload";
import MediaDisplay from "./common/MediaDisplay";
import { useBilingualContent } from "../utils/bilingualContent";
import { useParams, useNavigate } from "react-router-dom";

export default function ArticleDetail({ user }) {
  const getContent = useBilingualContent();
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editLanguage, setEditLanguage] = useState('en');
  const [title_en, setTitleEn] = useState("");
  const [title_ta, setTitleTa] = useState("");
  const [content_en, setContentEn] = useState("");
  const [content_ta, setContentTa] = useState("");
  const [author_en, setAuthorEn] = useState("");
  const [author_ta, setAuthorTa] = useState("");
  const [imageLink, setImageLink] = useState("");
  const [image, setImage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Parse markdown-like formatting to HTML
  const parseContent = (content) => {
    if (!content) return '';
    
    // Split content into lines for better processing
    let lines = content.split('\n');
    let html = '';
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Skip empty lines
      if (!line.trim()) {
        html += '<br />';
        continue;
      }
      
      // Headers (must be at start of line)
      if (line.match(/^### /)) {
        line = line.replace(/^### (.*)$/, '<h3 style="font-size: 1.3rem; font-weight: 600; margin: 16px 0 8px; color: #333;">$1</h3>');
      } else if (line.match(/^## /)) {
        line = line.replace(/^## (.*)$/, '<h2 style="font-size: 1.6rem; font-weight: 700; margin: 20px 0 12px; color: #1a1a1a;">$1</h2>');
      } else if (line.match(/^# /)) {
        line = line.replace(/^# (.*)$/, '<h1 style="font-size: 2rem; font-weight: 700; margin: 24px 0 16px; color: #000;">$1</h1>');
      }
      // Numbered lists
      else if (line.match(/^\d+\.\s+/)) {
        line = line.replace(/^(\d+)\.\s+(.*)$/, '<li style="margin-left: 20px; list-style-type: decimal; margin-bottom: 8px;">$2</li>');
      }
      // Bullet lists
      else if (line.match(/^-\s+/)) {
        line = line.replace(/^-\s+(.*)$/, '<li style="margin-left: 20px; list-style-type: disc; margin-bottom: 8px;">$1</li>');
      }
      // Regular paragraph
      else {
        line = '<p style="margin-bottom: 12px;">' + line + '</p>';
      }
      
      // Now apply inline formatting (bold, italic, code, links, images)
      // Images (must be before links)
      line = line.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; margin: 16px 0; border-radius: 8px; display: block;" />');
      
      // Links
      line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #8B0000; text-decoration: underline; font-weight: 600;">$1</a>');
      
      // Bold (must be before italic)
      line = line.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight: 700; color: #000;">$1</strong>');
      
      // Italic
      line = line.replace(/\*([^*]+)\*/g, '<em style="font-style: italic; color: #333;">$1</em>');
      
      // Code
      line = line.replace(/`([^`]+)`/g, '<code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; font-size: 0.9em; color: #d63384;">$1</code>');
      
      html += line;
    }
    
    return html;
  };

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch article");
        return res.json();
      })
      .then((data) => {
        setArticle(data);
        setTitleEn(data.title?.en || "");
        setTitleTa(data.title?.ta || "");
        setContentEn(data.content?.en || "");
        setContentTa(data.content?.ta || "");
        setAuthorEn(data.author?.en || "");
        setAuthorTa(data.author?.ta || "");
        setImageLink(data.imageLink || "");
        setVideoLink(data.videoLink || "");
        setImage(data.image || "");
        setVideoUrl(data.videoUrl || "");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleLike = async () => {
    if (!user) {
      setError(t('articles.loginToLike', 'Please login to like articles'));
      return;
    }

    try {
      const response = await fetch(`/api/articles/${id}/like`, {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to like article");

      setArticle((prev) => prev ? { ...prev, likesCount: data.likesCount, userLiked: data.userLiked } : prev);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const updatedArticle = {
        title: { en: title_en, ta: title_ta },
        content: { en: content_en, ta: content_ta },
        author: { en: author_en, ta: author_ta },
        imageLink,
        videoLink,
        image,
        videoUrl,
      };

      const res = await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedArticle),
      });

      if (!res.ok) throw new Error("Failed to update article");

      const data = await res.json();
      // Refetch to get the full article with all fields
      const refreshRes = await fetch(`/api/articles/${id}`);
      const refreshData = await refreshRes.json();
      setArticle(refreshData);
      setTitleEn(refreshData.title?.en || "");
      setTitleTa(refreshData.title?.ta || "");
      setContentEn(refreshData.content?.en || "");
      setContentTa(refreshData.content?.ta || "");
      setAuthorEn(refreshData.author?.en || "");
      setAuthorTa(refreshData.author?.ta || "");
      setImageLink(refreshData.imageLink || "");
      setVideoLink(refreshData.videoLink || "");
      setImage(refreshData.image || "");
      setVideoUrl(refreshData.videoUrl || "");
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this article?")) {
      try {
        await fetch(`/api/articles/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        navigate(`/articles`);
      } catch {
        setError("Failed to delete article");
      }
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!article) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Article Not Found
        </Typography>
        <Typography variant="body1">
          The article you are looking for does not exist or has been removed.
        </Typography>
      </Box>
    );
  }

  // --- ADMIN EDIT VIEW ---
  if (editMode) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, sm: 3, md: 5 }, 
            border: '1px solid #e0e0e0', 
            borderRadius: 2, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)' 
          }}
        >
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3, 
            pb: 2,
            borderBottom: '2px solid #8B0000'
          }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                fontFamily: 'Georgia, serif', 
                color: '#8B0000',
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              {t('articles.edit', 'Edit Article')}
            </Typography>
            <IconButton 
              onClick={() => setEditMode(false)}
              sx={{ 
                '&:hover': { bgcolor: 'rgba(139,0,0,0.08)' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Language Toggle */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            mb: 4,
            py: 3,
            bgcolor: '#fafafa',
            borderRadius: 2
          }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 2, 
                fontWeight: 600, 
                color: '#333',
                fontSize: { xs: '0.85rem', md: '0.9rem' }
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
                  px: { xs: 2.5, md: 3.5 },
                  py: { xs: 0.8, md: 1 },
                  border: '2px solid #8B0000',
                  color: '#8B0000',
                  fontWeight: 700,
                  fontSize: { xs: '0.85rem', md: '0.9rem' },
                  letterSpacing: '0.5px',
                  '&.Mui-selected': {
                    bgcolor: '#8B0000',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: '#6B0000',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(139,0,0,0.08)',
                  }
                },
              }}
            >
              <ToggleButton value="en">ENGLISH</ToggleButton>
              <ToggleButton value="ta">தமிழ்</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Form Fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Title Section */}
            <Box>
              <Typography 
                variant="overline" 
                sx={{ 
                  color: '#8B0000', 
                  fontWeight: 700, 
                  fontSize: '0.75rem',
                  letterSpacing: '1px',
                  mb: 1,
                  display: 'block'
                }}
              >
                {editLanguage === 'en' ? 'ARTICLE TITLE' : 'கட்டுரை தலைப்பு'}
              </Typography>
              <TextField 
                label={editLanguage === 'en' ? 'Title (English)' : 'தலைப்பு (தமிழ்)'} 
                value={editLanguage === 'en' ? title_en : title_ta} 
                onChange={(e) => editLanguage === 'en' ? setTitleEn(e.target.value) : setTitleTa(e.target.value)} 
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#8B0000',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#8B0000',
                      borderWidth: 2,
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#8B0000',
                  }
                }}
              />
            </Box>

            {/* Author Section */}
            <Box>
              <Typography 
                variant="overline" 
                sx={{ 
                  color: '#8B0000', 
                  fontWeight: 700, 
                  fontSize: '0.75rem',
                  letterSpacing: '1px',
                  mb: 1,
                  display: 'block'
                }}
              >
                {editLanguage === 'en' ? 'AUTHOR NAME' : 'ஆசிரியர் பெயர்'}
              </Typography>
              <TextField 
                label={editLanguage === 'en' ? 'Author (English)' : 'ஆசிரியர் (தமிழ்)'} 
                value={editLanguage === 'en' ? author_en : author_ta} 
                onChange={(e) => editLanguage === 'en' ? setAuthorEn(e.target.value) : setAuthorTa(e.target.value)} 
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#8B0000',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#8B0000',
                      borderWidth: 2,
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#8B0000',
                  }
                }}
              />
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Content Section */}
            <Box>
              <Typography 
                variant="overline" 
                sx={{ 
                  color: '#8B0000', 
                  fontWeight: 700, 
                  fontSize: '0.75rem',
                  letterSpacing: '1px',
                  mb: 1,
                  display: 'block'
                }}
              >
                {editLanguage === 'en' ? 'ARTICLE CONTENT' : 'கட்டுரை உள்ளடக்கம்'}
              </Typography>
              <TextField 
                label={editLanguage === 'en' ? 'Content (English)' : 'உள்ளடக்கம் (தமிழ்)'} 
                value={editLanguage === 'en' ? content_en : content_ta} 
                onChange={(e) => editLanguage === 'en' ? setContentEn(e.target.value) : setContentTa(e.target.value)} 
                fullWidth 
                multiline 
                rows={12}
                variant="outlined"
                placeholder={editLanguage === 'en' 
                  ? 'Write your article content here...' 
                  : 'உங்கள் கட்டுரை உள்ளடக்கத்தை இங்கே எழுதவும்...'
                }
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'Georgia, serif',
                    fontSize: '1rem',
                    lineHeight: 1.8,
                    '&:hover fieldset': {
                      borderColor: '#8B0000',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#8B0000',
                      borderWidth: 2,
                    }
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#8B0000',
                  }
                }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#666', 
                  mt: 1, 
                  display: 'block',
                  fontStyle: 'italic'
                }}
              >
                {editLanguage === 'en' 
                  ? 'Tip: Make sure to fill content in both languages for better accessibility' 
                  : 'குறிப்பு: சிறந்த அணுகலுக்காக இரு மொழிகளிலும் உள்ளடக்கத்தை நிரப்புங்கள்'
                }
              </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Media Settings Section */}
            <Box>
              <Typography 
                variant="overline" 
                sx={{ 
                  color: '#8B0000', 
                  fontWeight: 700, 
                  fontSize: '0.75rem',
                  letterSpacing: '1px',
                  mb: 2,
                  display: 'block'
                }}
              >
                MEDIA SETTINGS
              </Typography>
              <Box sx={{ 
                p: { xs: 2, md: 3 }, 
                bgcolor: '#f9f9f9', 
                borderRadius: 2,
                border: '1px dashed #ccc'
              }}>
                <MediaUpload
                  onImageLinkChange={setImageLink}
                  onVideoLinkChange={setVideoLink}
                  onImageChange={setImage}
                  onVideoChange={setVideoUrl}
                  currentImageLink={imageLink}
                  currentVideoLink={videoLink}
                  currentImage={image}
                  currentVideo={videoUrl}
                  label="Media Links"
                  showInputsOnly={true}
                />
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 3,
              pt: 3,
              borderTop: '1px solid #e0e0e0',
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                sx={{
                  borderWidth: 2,
                  fontWeight: 600,
                  px: 3,
                  py: 1.2,
                  order: { xs: 2, sm: 1 },
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Delete Article
              </Button>
              <Box sx={{ 
                display: 'flex', 
                gap: 2,
                order: { xs: 1, sm: 2 },
                width: { xs: '100%', sm: 'auto' }
              }}>
                <Button
                  variant="outlined"
                  onClick={() => setEditMode(false)}
                  sx={{
                    borderColor: '#666',
                    color: '#666',
                    fontWeight: 600,
                    px: 3,
                    py: 1.2,
                    flex: { xs: 1, sm: 'none' },
                    '&:hover': {
                      borderColor: '#333',
                      bgcolor: 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  variant="contained"
                  disabled={submitting}
                  startIcon={!submitting && <SaveIcon />}
                  sx={{
                    bgcolor: '#8B0000',
                    color: '#fff',
                    fontWeight: 700,
                    px: 4,
                    py: 1.2,
                    flex: { xs: 1, sm: 'none' },
                    '&:hover': { 
                      bgcolor: '#6B0000',
                      boxShadow: '0 4px 12px rgba(139,0,0,0.3)'
                    },
                    '&:disabled': {
                      bgcolor: '#ccc',
                      color: '#666'
                    }
                  }}
                >
                  {submitting ? t('actions.saving', 'Saving...') : t('actions.save', 'Save Changes')}
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#fff',
      py: { xs: 4, md: 6 },
    }}>
      <Box sx={{
        maxWidth: 900,
        mx: "auto",
        px: { xs: 2, md: 4 },
      }}>
        {/* Reading Mode */}
        <Box>
          {/* Hero Image Section */}
          {(article.image || article.imageLink) && (
            <Box sx={{
              width: '100%',
              height: { xs: 300, md: 450 },
              mb: 4,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 30px rgba(0,0,0,0.15)',
            }}>
              <Box
                component="img"
                src={article.imageLink || article.image}
                alt={getContent(article.title)}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              {/* Decorative border */}
              <Box sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                right: 12,
                bottom: 12,
                border: '3px solid rgba(255,255,255,0.3)',
                pointerEvents: 'none',
              }} />
            </Box>
          )}

          {/* Article Content Card */}
          <Box sx={{
            bgcolor: '#fff',
            p: { xs: 3, md: 5 },
            boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              bgcolor: '#8B0000',
            }
          }}>
            {/* Title */}
            <Typography
              variant="h3"
              sx={{
                fontFamily: 'Georgia, serif',
                fontWeight: 700,
                color: '#000',
                mb: 3,
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                lineHeight: 1.3,
                letterSpacing: -0.5,
              }}
            >
              {getContent(article.title)}
            </Typography>

            {/* Likes */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Button
                onClick={handleLike}
                startIcon={article.userLiked ? <Favorite /> : <FavoriteBorder />}
                variant="text"
                sx={{
                  color: article.userLiked ? '#8B0000' : '#666',
                  fontWeight: 700,
                  textTransform: 'none',
                  '&:hover': { bgcolor: 'rgba(139,0,0,0.08)' },
                }}
                disabled={!user}
              >
                {t('articles.like', 'Like')}
              </Button>
              <Typography variant="body2" sx={{ color: '#666', fontWeight: 600 }}>
                {article.likesCount || 0} {t('articles.likes', 'likes')}
              </Typography>
            </Box>

            {/* Author & Date Info */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              pb: 3,
              mb: 4,
              borderBottom: '2px solid #e0e0e0',
            }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: '#8B0000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.2rem',
              }}>
                {(article.authorName || getContent(article.author) || 'A')[0].toUpperCase()}
              </Box>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#000', lineHeight: 1.2 }}>
                  {getContent(article.author) || article.authorName || 'Anonymous'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', fontSize: '0.85rem', mt: 0.5 }}>
                  Published on {new Date(article.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </Box>
            </Box>

            {/* Article Content */}
            <Box
              sx={{
                lineHeight: 1.9,
                fontSize: { xs: '1.05rem', md: '1.15rem' },
                color: '#333',
                fontFamily: 'Georgia, serif',
                mb: 4,
                '& p': {
                  mb: 2,
                },
                '& h1, & h2, & h3': {
                  fontFamily: 'Georgia, serif',
                },
                '& strong': {
                  fontWeight: 700,
                  color: '#000',
                },
                '& em': {
                  fontStyle: 'italic',
                },
                '& a': {
                  color: '#8B0000',
                  textDecoration: 'underline',
                  fontWeight: 600,
                },
                textAlign: 'justify',
              }}
              dangerouslySetInnerHTML={{ __html: parseContent(getContent(article.content)) }}
            />

            {/* Media Display */}
            <MediaDisplay
              imageUrl={article.imageLink || article.image}
              videoUrl={article.videoUrl}
              videoLink={article.videoLink}
              title={article.title}
            />

            {/* Admin Actions */}
            {user && user.role === "admin" && (
              <Box sx={{
                mt: 4,
                pt: 4,
                borderTop: '1px solid #e0e0e0',
                display: 'flex',
                gap: 2,
              }}>
                <Button
                  onClick={() => setEditMode(true)}
                  variant="contained"
                  sx={{
                    bgcolor: '#8B0000',
                    '&:hover': { bgcolor: '#6d0000' },
                    borderRadius: 0,
                    px: 3,
                  }}
                >
                  Edit Article
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="outlined"
                  color="error"
                  sx={{
                    borderRadius: 0,
                    px: 3,
                  }}
                >
                  {t('actions.delete', 'Delete')}
                </Button>
              </Box>
            )}
          </Box>

          {/* Standardized Back Button */}
          <Box sx={{ mt: 6, mb: 2, textAlign: 'center' }}>
            <Button
              onClick={() => navigate('/articles')}
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
              ← Back to Articles
            </Button>
          </Box>
        </Box>

      </Box>
    </Box>
  );
}
