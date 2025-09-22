import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  ArrowBack,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close,
  Add,
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Base styles that can be used across all detail components
export const detailStyles = {
  container: {
    py: 2,
    maxWidth: "1200px",
    mx: "auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    mt: 2,
    mb: 4,
  },
  backButton: {
    "&:hover": {
      transform: "translateX(-2px)",
      transition: "transform 0.3s",
    },
  },
  title: {
    fontWeight: 700,
    textAlign: "center",
    flex: 1,
    letterSpacing: "-0.5px",
    color: "rgba(0,0,0,0.87)",
  },
  adminActions: {
    display: "flex",
    gap: 1,
  },
  imageContainer: {
    maxWidth: 800,
    mx: "auto",
    width: "100%",
    height: 400,
    position: "relative",
    overflow: "hidden",
    borderRadius: 2,
    border: "1px solid rgba(0,0,0,0.12)",
    bgcolor: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  contentSection: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
    maxWidth: 800,
    mx: "auto",
    width: "100%",
    bgcolor: "#fff",
    p: 3,
    borderRadius: 2,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  metadataSection: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "2px solid rgba(0,0,0,0.1)",
    pb: 2,
    mb: 2,
    flexWrap: "wrap",
    gap: 2,
    bgcolor: "#f8f9fa",
    p: 3,
    borderRadius: "4px",
  },
  metadataText: {
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: "rgba(0,0,0,0.87)",
  },
  editField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "rgba(0, 0, 0, 0.1)",
      },
      "&:hover fieldset": {
        borderColor: "rgba(0, 0, 0, 0.3)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "rgba(0, 0, 0, 0.5)",
      },
    },
    "& .MuiInputBase-input": {
      lineHeight: 1.8,
    },
  },
  editBox: {
    bgcolor: "#fff",
    p: 3,
    borderRadius: 1,
  },
  sectionTitle: {
    mb: 3,
    fontWeight: 600,
    color: "rgba(0,0,0,0.87)",
    borderBottom: "2px solid rgba(0,0,0,0.1)",
    pb: 1,
  },
};

// Base content section component
export const ContentSection = ({
  section,
  index,
  isEditing,
  handleSectionChange,
}) => {
  return (
    <Box key={section.id || `content-section-${index}`} sx={{ mt: 4 }}>
      {section.subtitle && (
        <Typography variant="h6">{section.subtitle}</Typography>
      )}

      {section.content && (
        <Typography variant="body1">{section.content}</Typography>
      )}

      {section.imageUrl && (
        <img
          src={section.imageUrl}
          alt={section.subtitle || `Section ${index + 1} Image`}
          style={{ maxWidth: "100%", height: "auto", marginTop: 16 }}
        />
      )}

      {section.videoUrl && (
        <>
          <iframe
            src={`https://www.youtube.com/embed/${
              section.videoUrl.split("v=")[1] ||
              section.videoUrl.split("/").pop()
            }`}
            title={section.videoTitle || `Section ${index + 1} Video`}
            style={{
              width: "100%",
              height: "auto",
              aspectRatio: "16/9",
              marginTop: 16,
            }}
            allowFullScreen
          />
          {(section.videoTitle || section.videoDescription) && (
            <Box sx={{ mt: 2 }}>
              {section.videoTitle && (
                <Typography variant="h6">{section.videoTitle}</Typography>
              )}
              {section.videoDescription && (
                <Typography variant="body2" color="text.secondary">
                  {section.videoDescription}
                </Typography>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

// Base edit form fields component
export const EditFormFields = ({
  editableData,
  setEditableData,
  textFieldStyles,
}) => {
  return (
    <Box sx={textFieldStyles.container}>
      <TextField
        label="Name"
        value={editableData.name}
        onChange={(e) =>
          setEditableData({ ...editableData, name: e.target.value })
        }
        fullWidth
        variant="outlined"
        sx={textFieldStyles.field}
      />
      {/* Add other common fields here */}
    </Box>
  );
};

// Simple content display component for general use
export const ContentDisplay = ({
  title,
  content,
  editMode = false,
  editableContent,
  onChange,
  children,
}) => {
  return (
    <Box sx={{ mt: 4 }}>
      {title && (
        <Typography variant="h6" sx={detailStyles.sectionTitle}>
          {title}
        </Typography>
      )}

      {editMode ? (
        <TextField
          fullWidth
          multiline
          rows={4}
          value={editableContent || ""}
          onChange={(e) => onChange && onChange(e.target.value)}
          variant="outlined"
          sx={detailStyles.editField}
        />
      ) : (
        <Box>
          {typeof content === "string" ? (
            <Typography variant="body1">{content}</Typography>
          ) : (
            content
          )}
          {children}
        </Box>
      )}
    </Box>
  );
};
