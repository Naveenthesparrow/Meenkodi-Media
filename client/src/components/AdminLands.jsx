import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const emptyLand = {
  name: "",
  type: "Kurinji",
  description: "",
  poetry: [""],
  gods: [""],
  flora: [""],
  fauna: [""],
  people: [""],
  image: "",
};

const landTypes = ["Kurinji", "Mullai", "Marutham", "Neithal", "Palai"];

export default function AdminLands() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(-1);
  const [form, setForm] = useState(emptyLand);
  const [error, setError] = useState("");

  const fetchLands = () => {
    setLoading(true);
    fetch("/api/lands")
      .then((res) => res.json())
      .then((data) => {
        setLands(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLands();
  }, []);

  const handleOpen = (idx = -1) => {
    setEditIdx(idx);
    setForm(idx === -1 ? emptyLand : lands[idx]);
    setOpen(true);
    setError("");
  };
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleArrayChange = (field, idx, value) => {
    setForm({
      ...form,
      [field]: form[field].map((v, i) => (i === idx ? value : v)),
    });
  };
  const handleAddArray = (field) => {
    setForm({ ...form, [field]: [...form[field], ""] });
  };
  const handleRemoveArray = (field, idx) => {
    setForm({ ...form, [field]: form[field].filter((_, i) => i !== idx) });
  };

  const handleSubmit = async () => {
    setError("");
    const method = editIdx === -1 ? "POST" : "PUT";
    const url =
      editIdx === -1 ? "/api/lands" : `/api/lands/${lands[editIdx]._id}`;
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      credentials: "include",
    });
    if (res.ok) {
      fetchLands();
      handleClose();
    } else {
      const data = await res.json();
      setError(data.error || "Error");
    }
  };

  const handleDelete = async (idx) => {
    if (!window.confirm("Delete this land?")) return;
    await fetch(`/api/lands/${lands[idx]._id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchLands();
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", mt: 4, p: 2 }}>
      <Typography
        variant="h4"
        sx={{ color: "primary.main", fontWeight: 700, mb: 2 }}
      >
        Manage Five Lands
      </Typography>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => handleOpen()}
        sx={{ mb: 2, bgcolor: "primary.main", color: "#fff" }}
      >
        Add Land
      </Button>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {lands.map((land, idx) => (
            <Grid item xs={12} sm={6} md={4} key={land._id}>
              <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
                {land.image && (
                  <CardMedia
                    component="img"
                    image={land.image}
                    alt={land.name}
                    sx={{ height: 120, objectFit: "cover" }}
                  />
                )}
                <CardContent>
                  <Typography variant="h6" sx={{ color: "primary.main" }}>
                    {land.name} ({land.type})
                  </Typography>
                  <Typography variant="body2">{land.description}</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpen(idx)}>
                        <Edit color="primary" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(idx)}>
                        <Delete color="error" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editIdx === -1 ? "Add Land" : "Edit Land"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            select
            label="Type"
            name="type"
            value={form.type}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
            SelectProps={{ native: true }}
          >
            {landTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </TextField>
          <Typography variant="subtitle2">Description</Typography>
          <ReactQuill
            value={form.description}
            onChange={(val) => setForm({ ...form, description: val })}
            style={{ marginBottom: 16 }}
          />
          {form.poetry.map((v, i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <ReactQuill
                value={v}
                onChange={(val) => handleArrayChange("poetry", i, val)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                onClick={() => handleRemoveArray("poetry", i)}
                size="small"
                color="error"
              >
                Remove
              </Button>
            </Box>
          ))}
          <Button
            onClick={() => handleAddArray("poetry")}
            size="small"
            color="primary"
          >
            Add poetry
          </Button>
          <TextField
            label="Image URL"
            name="image"
            value={form.image}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button variant="outlined" component="label" sx={{ mb: 2 }}>
            Upload Image
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                  const formData = new FormData();
                  formData.append("image", e.target.files[0]);
                  const res = await fetch("/api/lands/upload-image", {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                  });
                  const data = await res.json();
                  if (data.url) setForm((f) => ({ ...f, image: data.url }));
                }
              }}
            />
          </Button>
          {form.image && (
            <img
              src={form.image}
              alt="Land"
              style={{ maxWidth: 200, marginBottom: 16, display: "block" }}
            />
          )}
          {error && <Typography color="error">{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
