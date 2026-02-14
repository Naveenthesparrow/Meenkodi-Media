import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Avatar,
  Paper,
  Divider,
  Chip,
  InputAdornment,
  Fade,
  Tooltip,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Send as SendIcon,
  Person as PersonIcon,
  ChatBubbleOutline as CommentIcon,
  FavoriteBorder as LikeIcon,
  MoreVert as MoreIcon,
} from "@mui/icons-material";

export default function Comments({ relatedType, relatedId, user }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = () => {
    setLoading(true);
    fetch(`/api/comments/${relatedType}/${relatedId}`)
      .then((res) => res.json())
      .then((data) => {
        setComments(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [relatedType, relatedId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content, relatedType, relatedId }),
    });
    if (res.ok) {
      setContent("");
      fetchComments();
    } else {
      const data = await res.json();
      setError(data.error || "Error");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this comment?")) return;
    await fetch(`/api/comments/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchComments();
  };

  // Helper function to get initials
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to format timestamp
  const formatTimestamp = (date) => {
    if (!date) return "Recently";
    try {
      const now = new Date();
      const commentDate = new Date(date);
      const diffMs = now - commentDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return commentDate.toLocaleDateString();
    } catch {
      return "Recently";
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <CommentIcon sx={{ fontSize: 28, color: '#8B0000' }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            Community Discussion
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </Typography>
        </Box>
      </Box>

      {/* Comment Input Form */}
      {user ? (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            bgcolor: '#f8f9fa',
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            transition: 'all 0.3s ease',
            '&:focus-within': {
              bgcolor: '#fff',
              borderColor: '#8B0000',
              boxShadow: '0 4px 12px rgba(139,0,0,0.1)',
            }
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Avatar
              sx={{
                bgcolor: '#8B0000',
                width: 40,
                height: 40,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {getInitials(user?.name || user?.email)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Share your thoughts..."
                  variant="outlined"
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#fff',
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#8B0000',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#8B0000',
                      },
                    },
                  }}
                />
                {error && (
                  <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                    {error}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  {content.trim() && (
                    <Button
                      onClick={() => setContent('')}
                      sx={{ 
                        color: '#666',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting || !content.trim()}
                    endIcon={<SendIcon />}
                    sx={{
                      bgcolor: '#8B0000',
                      px: 3,
                      '&:hover': { bgcolor: '#6B0000' },
                      '&:disabled': {
                        bgcolor: '#e0e0e0',
                        color: '#999',
                      },
                    }}
                  >
                    {submitting ? 'Posting...' : 'Post'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            bgcolor: '#fff8e1',
            border: '1px solid #ffe082',
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <PersonIcon sx={{ fontSize: 40, color: '#f57c00', mb: 1 }} />
          <Typography variant="body1" sx={{ fontWeight: 600, color: '#e65100', mb: 0.5 }}>
            Join the conversation
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Please log in to share your thoughts and engage with the community
          </Typography>
        </Paper>
      )}

      {/* Comments List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#8B0000' }} />
        </Box>
      ) : comments.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            bgcolor: '#f8f9fa',
            border: '2px dashed #e0e0e0',
            borderRadius: 2,
          }}
        >
          <CommentIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#999', fontWeight: 600, mb: 1 }}>
            No comments yet
          </Typography>
          <Typography variant="body2" sx={{ color: '#999' }}>
            Be the first to share your thoughts!
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {comments.map((comment, index) => (
            <Fade key={comment._id} in timeout={300 + index * 100}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#8B0000',
                    boxShadow: '0 4px 12px rgba(139,0,0,0.08)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: '#DAA520',
                      width: 36,
                      height: 36,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                    }}
                  >
                    {getInitials(comment.author)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                          {comment.author || 'Anonymous User'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          {formatTimestamp(comment.createdAt)}
                        </Typography>
                      </Box>
                      {user && user.role === 'admin' && (
                        <Tooltip title="Delete comment">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(comment._id)}
                            sx={{
                              color: '#666',
                              '&:hover': {
                                color: '#d32f2f',
                                bgcolor: 'rgba(211,47,47,0.08)',
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#333',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {comment.content}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Fade>
          ))}
        </Box>
      )}
    </Box>
  );
}
