import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import MediaUpload from "./common/MediaUpload";
import MediaDisplay from "./common/MediaDisplay";
import { useBilingualContent } from "../utils/bilingualContent";
import { useParams, useNavigate } from "react-router-dom";

export default function ArticleDetail({ user }) {
  const getContent = useBilingualContent();
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
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

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setArticle(data);
        const part = (val, lang) => {
          if (!val) return '';
          if (typeof val === 'string') return lang === 'en' ? val : '';
          return val[lang] || '';
        };
        setTitleEn(part(data.title,'en'));
        setTitleTa(part(data.title,'ta'));
        setContentEn(part(data.content,'en'));
        setContentTa(part(data.content,'ta'));
        setAuthorEn(part(data.author,'en'));
        setAuthorTa(part(data.author,'ta'));
        setImageLink(data.imageLink || "");
        setImage(data.image || "");
        setVideoUrl(data.videoUrl || "");
        setVideoLink(data.videoLink || "");
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load article details");
        setLoading(false);
      });
  }, [id]);

  const handleSave = async () => {
    setSubmitting(true);
    setError(null);
    if (!title_en.trim() && !title_ta.trim()) {
      setError("Title is required");
      setSubmitting(false);
      return;
    }
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: { en: title_en, ta: title_ta },
          content: { en: content_en, ta: content_ta },
          author: { en: author_en, ta: author_ta },
          imageLink,
          image,
          videoUrl,
          videoLink,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update article");
      }
      setEditMode(false);
      navigate(`/articles`);
    } catch (err) {
      setError(err.message || "Failed to update article");
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

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      <Typography variant="h4" gutterBottom>
        {editMode ? "Edit Article" : getContent(article.title)}
      </Typography>
      {editMode ? (
        <Box>
          <TextField label="Title (EN)" value={title_en} onChange={(e)=>setTitleEn(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="Title (TA)" value={title_ta} onChange={(e)=>setTitleTa(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="Content (EN)" value={content_en} onChange={(e)=>setContentEn(e.target.value)} fullWidth multiline minRows={4} sx={{ mb: 2 }} />
          <TextField label="Content (TA)" value={content_ta} onChange={(e)=>setContentTa(e.target.value)} fullWidth multiline minRows={4} sx={{ mb: 2 }} />
          <TextField label="Author (EN)" value={author_en} onChange={(e)=>setAuthorEn(e.target.value)} fullWidth sx={{ mb: 2 }} />
          <TextField label="Author (TA)" value={author_ta} onChange={(e)=>setAuthorTa(e.target.value)} fullWidth sx={{ mb: 2 }} />
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
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={submitting}
            sx={{ mt: 2 }}
          >
            {submitting ? "Saving..." : "Save"}
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {getContent(article.content)}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Author: {getContent(article.author)}
          </Typography>
          <MediaDisplay
            imageUrl={article.image}
            videoUrl={article.videoUrl}
            videoLink={article.videoLink}
            title={article.title}
          />
          {user && user.role === "admin" && (
            <Box sx={{ mt: 2 }}>
              <Button
                onClick={() => setEditMode(true)}
                variant="contained"
                sx={{ mr: 2 }}
              >
                Edit
              </Button>
              <Button onClick={handleDelete} variant="contained" color="error">
                Delete
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
