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
import { useParams, useNavigate } from "react-router-dom";

export default function ArticleDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
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
        setTitle(data.title);
        setContent(data.content);
        setAuthor(data.author);
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
    if (!title.trim()) {
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
          title,
          content,
          author,
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
        {editMode ? "Edit Article" : article.title}
      </Typography>
      {editMode ? (
        <Box>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            minRows={4}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
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
            {article.content}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Author: {article.author}
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
