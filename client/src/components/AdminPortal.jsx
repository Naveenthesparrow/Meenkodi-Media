import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

export default function AdminPortal({ user, logout }) {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [open, setOpen] = useState(false);

  const fetchUsers = () => {
    axios
      .get("/api/admin/users", {
        withCredentials: true,
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          setUsers(res.data);
        } else {
          console.error("API response for users is not an array:", res.data);
          setUsers([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setUsers([]);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await axios.delete(`/api/admin/users/${id}`, {
        withCredentials: true,
      });
      fetchUsers();
    }
  };

  const handleRoleChange = async (id, newRole) => {
    await axios.put(
      `/api/admin/users/${id}/role`,
      { role: newRole },
      { withCredentials: true }
    );
    fetchUsers();
  };

  const handleEditOpen = (u) => {
    setEditUser(u);
    setEditName(u.displayName);
    setEditEmail(u.email);
    setEditRole(u.role);
    setOpen(true);
  };

  const handleEditSave = async () => {
    await axios.put(
      `/api/admin/users/${editUser._id}`,
      { displayName: editName, email: editEmail },
      { withCredentials: true }
    );
    if (editRole !== editUser.role) {
      await handleRoleChange(editUser._id, editRole);
    } else {
      fetchUsers();
    }
    setOpen(false);
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 4,
        p: 3,
        bgcolor: "background.default",
        borderRadius: 3,
        boxShadow: 2,
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
        Admin Portal
      </Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Welcome, {user.displayName} (Admin)
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={logout}
        sx={{ mb: 3 }}
      >
        Logout
      </Button>
      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        All Users
      </Typography>
      <List>
        {users.map((u, idx) => (
          <React.Fragment key={u._id}>
            <ListItem
              secondaryAction={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    size="small"
                    sx={{ mr: 1, minWidth: 90, height: 36 }}
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                  <IconButton onClick={() => handleEditOpen(u)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(u._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={`${u.displayName} (${u.email})`}
                secondary={u.role}
                sx={{ maxWidth: 'calc(100% - 220px)' }} // Adjust based on secondaryAction width
              />
            </ListItem>
            {idx < users.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Select
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="user">User</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
