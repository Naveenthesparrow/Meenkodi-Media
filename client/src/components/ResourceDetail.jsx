import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Container,
  Divider,
  Chip,
} from "@mui/material";
import { Download, MenuBook } from "@mui/icons-material";
import MediaUpload from "./common/MediaUpload";
import { useParams, useNavigate } from "react-router-dom";
import { useBilingualContent } from "../utils/bilingualContent";
import { useTranslation } from 'react-i18next';

export default function ResourceDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const getContent = useBilingualContent();
  const { t } = useTranslation();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [title_en, setTitle_en] = useState("");
  const [title_ta, setTitle_ta] = useState("");
  const [description_en, setDescription_en] = useState("");
  const [description_ta, setDescription_ta] = useState("");
  const [category_en, setCategory_en] = useState("");
  const [category_ta, setCategory_ta] = useState("");
  const [author_en, setAuthor_en] = useState("");
  const [author_ta, setAuthor_ta] = useState("");
  const [image, setImage] = useState("");
  const [downloadLink, setDownloadLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/resources/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setResource(data);
        const part = (val, lang) => {
          if (!val) return '';
          if (typeof val === 'string') return lang === 'en' ? val : '';
          return val[lang] || '';
        };
        setTitle_en(part(data.title, 'en'));
        setTitle_ta(part(data.title, 'ta'));
        setDescription_en(part(data.description, 'en'));
        setDescription_ta(part(data.description, 'ta'));
        setCategory_en(part(data.category, 'en'));
        setCategory_ta(part(data.category, 'ta'));
        setAuthor_en(part(data.author, 'en'));
        setAuthor_ta(part(data.author, 'ta'));
        setImage(data.image || "");
        setDownloadLink(data.downloadLink || "");
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load resource details");
        setLoading(false);
      });
  }, [id]);

  const handleSave = async () => {
    setSubmitting(true);
    setError(null);
    if (!title_en.trim()) {
      setError("Title (English) is required");
      setSubmitting(false);
      return;
    }
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: { en: title_en, ta: title_ta },
          description: { en: description_en, ta: description_ta },
          category: { en: category_en, ta: category_ta },
          author: { en: author_en, ta: author_ta },
          image,
          downloadLink,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update resource");
      }
      setEditMode(false);
      window.location.reload();
    } catch (err) {
      setError(err.message || "Failed to update resource");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this resource?")) {
      try {
        await fetch(`/api/resources/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        navigate(`/resources`);
      } catch {
        setError("Failed to delete resource");
      }
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!resource) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
          Resource Not Found
        </Typography>
        <Typography variant="body1">
          The resource you are looking for does not exist or has been removed.
        </Typography>
        <Button onClick={() => navigate('/resources')} sx={{ mt: 2 }}>Back to Resources</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {editMode ? (
        <Box sx={{ maxWidth: 800, mx: "auto" }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, fontFamily: 'Georgia, serif' }}>
            Edit Resource
          </Typography>
          <TextField label="Title (EN)" value={title_en} onChange={(e) => setTitle_en(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="Title (TA)" value={title_ta} onChange={(e) => setTitle_ta(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="Author (EN)" value={author_en} onChange={(e) => setAuthor_en(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="Author (TA)" value={author_ta} onChange={(e) => setAuthor_ta(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="Category (EN)" value={category_en} onChange={(e) => setCategory_en(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="Category (TA)" value={category_ta} onChange={(e) => setCategory_ta(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="Description (EN)" value={description_en} onChange={(e) => setDescription_en(e.target.value)} fullWidth multiline minRows={4} sx={{ mb: 2 }} />
          <TextField label="Description (TA)" value={description_ta} onChange={(e) => setDescription_ta(e.target.value)} fullWidth multiline minRows={4} sx={{ mb: 2 }} />
          <TextField label="Download Link (PDF URL)" value={downloadLink} onChange={(e) => setDownloadLink(e.target.value)} fullWidth sx={{ mb: 2 }} placeholder="https://example.com/book.pdf" />
          <MediaUpload
            onImageChange={setImage}
            currentImage={image}
            label="Book Cover Image"
            showInputsOnly={true}
          />
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button onClick={handleSave} variant="contained" disabled={submitting} sx={{ bgcolor: '#8B0000', '&:hover': { bgcolor: '#6B0000' } }}>
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
            <Button onClick={() => setEditMode(false)} variant="outlined">Cancel</Button>
          </Box>
        </Box>
      ) : (
        <Box>
          {/* Header Section */}
          <Box sx={{ mb: 4, pb: 3, borderBottom: '2px solid rgba(139,0,0,0.2)' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 2, fontFamily: 'Georgia, serif' }}>
              {getContent(resource.title)}
            </Typography>
            {getContent(resource.author) && (
              <Typography variant="h6" sx={{ color: '#8B0000', fontFamily: 'Georgia, serif', fontWeight: 500 }}>
                by {getContent(resource.author)}
              </Typography>
            )}
            {getContent(resource.category) && (
              <Chip label={getContent(resource.category)} sx={{ mt: 2, bgcolor: 'rgba(139,0,0,0.1)', color: '#8B0000', fontWeight: 600 }} />
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 5 }}>
            {/* Book Cover */}
            <Box sx={{ flex: { xs: '1', md: '0 0 350px' } }}>
              {resource.image ? (
                <Box
                  component="img"
                  src={resource.image}
                  alt={getContent(resource.title)}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: 500,
                    objectFit: 'contain',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                />
              ) : (
                <Box sx={{ width: '100%', height: 400, bgcolor: '#f8f7f5', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.1)' }}>
                  <Typography variant="h4" sx={{ opacity: 0.5 }}>📚</Typography>
                </Box>
              )}

              {/* Action Buttons */}
              <Box sx={{ mt: 3 }}>
                {resource.downloadLink && (
                  <Button
                    href={resource.downloadLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="contained"
                    fullWidth
                    startIcon={<Download />}
                    sx={{ mb: 2, bgcolor: '#8B0000', '&:hover': { bgcolor: '#6B0000' }, py: 1.5, fontWeight: 600 }}
                  >
                    Download PDF
                  </Button>
                )}
                {resource.downloadLink && (
                  <Button
                    href={resource.downloadLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    fullWidth
                    startIcon={<MenuBook />}
                    sx={{ borderColor: '#B8860B', color: '#B8860B', '&:hover': { borderColor: '#8B6508', bgcolor: 'rgba(184,134,11,0.05)' }, py: 1.5, fontWeight: 600 }}
                  >
                    Read Online
                  </Button>
                )}
              </Box>
            </Box>

            {/* Content Section */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, fontFamily: 'Georgia, serif' }}>
                About This Resource
              </Typography>
              <Typography variant="body1" sx={{ color: '#444', lineHeight: 1.8, fontSize: '1.05rem', mb: 4, whiteSpace: 'pre-wrap' }}>
                {getContent(resource.description)}
              </Typography>

              {/* PDF Viewer */}
              {resource.downloadLink && (
                <Box sx={{ mt: 4 }}>
                  <Divider sx={{ mb: 3 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontFamily: 'Georgia, serif' }}>
                    Preview
                  </Typography>
                  <Box
                    component="iframe"
                    src={`${resource.downloadLink}#toolbar=1&navpanes=1&scrollbar=1`}
                    sx={{
                      width: '100%',
                      height: { xs: 500, md: 700 },
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: 1,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                    title={getContent(resource.title)}
                  />
                </Box>
              )}

              {/* Admin Actions */}
              {user && user.role === "admin" && (
                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                  <Button onClick={() => setEditMode(true)} variant="contained" sx={{ mr: 2, bgcolor: '#8B0000', '&:hover': { bgcolor: '#6B0000' } }}>Edit</Button>
                  <Button onClick={handleDelete} variant="outlined" color="error">Delete</Button>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Standardized Back Button */}
      <Box sx={{ mt: 6, mb: 2, textAlign: 'center' }}>
        <Button
          onClick={() => navigate('/resources')}
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
          ← Back to Resources
        </Button>
      </Box>
    </Container>
  );
}
