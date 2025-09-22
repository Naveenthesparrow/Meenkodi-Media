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
        maxWidth: { xs: '95%', sm: 600 }, // Responsive max width
        mx: "auto",
        mt: { xs: 2, sm: 4 }, // Responsive top margin
        p: { xs: 2, sm: 3 }, // Responsive padding
        bgcolor: "background.default",
        borderRadius: 3,
        boxShadow: 2,
      }}
    >
      <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
        Admin Portal
      </Typography>
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: { xs: 2, sm: 3 }
        }}
      >
        <Typography variant="h6">
          Welcome, {user.displayName} (Admin)
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={logout}
          sx={{ 
            ml: 2,
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.5 }
          }}
        >
          Logout
        </Button>
      </Box>
      <Typography variant="h6" sx={{ mt: { xs: 2, sm: 2 }, mb: 1 }}>
        All Users
      </Typography>
      <List>
        {users.map((u, idx) => (
          <React.Fragment key={u._id}>
            <ListItem
              sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                py: 1,
                gap: { xs: 1, sm: 2 },
              }}
              secondaryAction={
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                  }}
                >
                  <Select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                    size="small"
                    sx={{ 
                      width: { xs: '100%', sm: 120 },
                      minWidth: { xs: '100%', sm: 100 },
                      height: 36,
                      mr: { xs: 0, sm: 1 },
                    }}
                  >
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                  <IconButton 
                    onClick={() => handleEditOpen(u)} 
                    color="primary"
                    size="small"
                    sx={{ 
                      p: 0.5,
                      height: 36,
                      width: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(u._id)} 
                    color="error"
                    size="small"
                    sx={{ 
                      p: 0.5,
                      height: 36,
                      width: 36,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
            >
              <ListItemText
                primary={
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      maxWidth: { xs: 'calc(100% - 50px)', sm: 300 },
                      display: 'block',
                    }}
                  >
                    {`${u.displayName} (${u.email})`}
                  </Typography>
                }
                secondary={
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                    }}
                  >
                    {u.role}
                  </Typography>
                }
                sx={{ 
                  flex: 1,
                  width: '100%',
                  mb: { xs: 1, sm: 0 },
                }}
              />
            </ListItem>
            {idx < users.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}> // Responsive padding
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
        <DialogActions sx={{ p: { xs: 1, sm: 2 } }}> // Responsive padding
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
