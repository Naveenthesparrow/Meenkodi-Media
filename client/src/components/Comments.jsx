import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

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

  return (
    <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: "#fff8e1", borderRadius: 2 }}>
      <Typography variant="h6" sx={{ color: "primary.main", mb: 1 }}>
        Comments
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <List>
          {comments.map((c) => (
            <ListItem
              key={c._id}
              alignItems="flex-start"
              secondaryAction={
                user &&
                user.role === "admin" && (
                  <IconButton edge="end" onClick={() => handleDelete(c._id)}>
                    <DeleteIcon color="error" />
                  </IconButton>
                )
              }
            >
              <ListItemText
                primary={
                  <span style={{ fontWeight: 600 }}>{c.author || "User"}</span>
                }
                secondary={<span>{c.content}</span>}
              />
            </ListItem>
          ))}
        </List>
      )}
      {user ? (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Add a comment"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            sx={{ mb: 1 }}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !content.trim()}
          >
            {submitting ? "Posting..." : "Post Comment"}
          </Button>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Login to comment.
        </Typography>
      )}
    </Box>
  );
}
