import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Paper,
  Alert,
  TextField,
  IconButton,
  Tooltip,
  Tab,
  Tabs
} from '@mui/material';
import {
  PictureAsPdf,
  CloudUpload,
  Link as LinkIcon,
  Delete,
  CheckCircle,
  OpenInNew,
  LibraryBooks
} from '@mui/icons-material';

export default function PdfUpload({
  pdfUrl = '',
  pdfName = '',
  pdfSize = '',
  onPdfChange,
  label = 'PDF Book File'
}) {
  const [tabValue, setTabValue] = useState(0); // 0: Upload File, 1: Enter URL
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [customUrl, setCustomUrl] = useState(pdfUrl || '');
  const fileInputRef = useRef(null);

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelected = (file) => {
    if (!file) return;

    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    if (!isPdf) {
      setError('Please select a valid PDF document (.pdf)');
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('pdf', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload/pdf', true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          const uploadedUrl = res.url || res.downloadLink;
          const uploadedName = res.originalName || file.name;
          const uploadedSize = res.pdfSize || formatBytes(file.size);

          onPdfChange && onPdfChange({
            url: uploadedUrl,
            name: uploadedName,
            size: uploadedSize
          });
          setCustomUrl(uploadedUrl);
        } catch (e) {
          setError('Failed to parse upload response.');
        }
      } else {
        try {
          const res = JSON.parse(xhr.responseText);
          setError(res.error || res.details || 'Failed to upload PDF book.');
        } catch (e) {
          setError(`Upload failed with status code ${xhr.status}`);
        }
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setError('Network error occurred while uploading PDF book.');
    };

    xhr.send(formData);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = () => {
    if (!customUrl) {
      onPdfChange && onPdfChange({ url: '', name: '', size: '' });
      return;
    }

    // Block local file:// paths - they don't work on web
    if (customUrl.startsWith('file://') || customUrl.startsWith('file:///')) {
      setError('Local file paths (file:///) are not supported. Please upload the PDF file using the "Upload PDF File" tab instead.');
      return;
    }

    // Must start with http:// or https://
    if (!customUrl.startsWith('http://') && !customUrl.startsWith('https://') && !customUrl.startsWith('/api/')) {
      setError('Please enter a valid web URL starting with https:// (e.g. https://example.com/book.pdf)');
      return;
    }

    const filename = customUrl.split('/').pop().split('?')[0] || 'PDF Document';
    onPdfChange && onPdfChange({
      url: customUrl,
      name: pdfName || filename,
      size: pdfSize || 'External Link'
    });
  };

  const handleRemove = () => {
    onPdfChange && onPdfChange({ url: '', name: '', size: '' });
    setCustomUrl('');
    setProgress(0);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        mb: 2.5,
        borderRadius: 1,
        borderColor: dragOver ? '#8B0000' : '#e0e0e0',
        bgcolor: dragOver ? 'rgba(139,0,0,0.02)' : '#fafafa',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LibraryBooks sx={{ color: '#8B0000', fontSize: 24 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#333', fontFamily: 'Georgia, serif' }}>
            {label}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* If PDF is attached, show preview card */}
      {pdfUrl ? (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            border: '2px solid #8B0000',
            borderRadius: 1,
            bgcolor: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
            <PictureAsPdf sx={{ color: '#8B0000', fontSize: 36, flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  color: '#111',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: { xs: 220, sm: 360 }
                }}
              >
                {pdfName || pdfUrl.split('/').pop()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircle sx={{ fontSize: 14 }} /> Ready for Book Resource
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="View / Test PDF">
              <IconButton
                component="a"
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{ color: '#8B0000' }}
              >
                <OpenInNew />
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove PDF">
              <IconButton onClick={handleRemove} size="small" sx={{ color: '#d32f2f' }}>
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      ) : (
        <Box>
          <Tabs
            value={tabValue}
            onChange={(e, val) => setTabValue(val)}
            sx={{
              minHeight: 36,
              mb: 2,
              '& .MuiTab-root': {
                minHeight: 36,
                py: 0.5,
                fontWeight: 600,
                fontSize: '0.85rem'
              },
              '& .Mui-selected': { color: '#8B0000' },
              '& .MuiTabs-indicator': { backgroundColor: '#8B0000' }
            }}
          >
            <Tab icon={<CloudUpload sx={{ fontSize: 18 }} />} iconPosition="start" label="Upload PDF File" />
            <Tab icon={<LinkIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="External PDF Link" />
          </Tabs>

          {tabValue === 0 ? (
            <Box
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                border: '2px dashed',
                borderColor: dragOver ? '#8B0000' : '#ccc',
                borderRadius: 1,
                p: 3,
                textAlign: 'center',
                bgcolor: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#8B0000',
                  bgcolor: 'rgba(139,0,0,0.01)'
                }
              }}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,application/pdf"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelected(e.target.files[0]);
                  }
                }}
              />

              <PictureAsPdf sx={{ fontSize: 44, color: '#8B0000', mb: 1, opacity: 0.8 }} />

              <Typography variant="body1" sx={{ fontWeight: 700, color: '#222', mb: 0.5 }}>
                {dragOver ? 'Drop PDF Book file here' : 'Click or Drag & Drop PDF Book here'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#888', mb: 1.5, display: 'block' }}>
                Stored permanently in the database
              </Typography>

              <Button
                variant="contained"
                size="small"
                disabled={uploading}
                sx={{
                  bgcolor: '#8B0000',
                  color: '#fff',
                  borderRadius: 0,
                  px: 3,
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#6B0000' }
                }}
              >
                Choose PDF Book File
              </Button>

              {uploading && (
                <Box sx={{ width: '100%', mt: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#8B0000' }}>
                      Uploading PDF Book...
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#8B0000' }}>
                      {progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: '#ffebee',
                      '& .MuiLinearProgress-bar': { bgcolor: '#8B0000' }
                    }}
                  />
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ bgcolor: '#fff', p: 2, borderRadius: 1, border: '1px solid #e0e0e0' }}>
              <Alert severity="info" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
                Enter a direct HTTPS link to the PDF (e.g. from Google Drive, Dropbox, or your own server). Do NOT enter local file paths.
              </Alert>
              <TextField
                fullWidth
                size="small"
                label="Direct PDF URL"
                placeholder="https://example.com/books/tamil-history.pdf"
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  setError(null);
                }}
                sx={{ mb: 1.5 }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleUrlSubmit}
                disabled={!customUrl}
                sx={{
                  bgcolor: '#8B0000',
                  color: '#fff',
                  borderRadius: 0,
                  '&:hover': { bgcolor: '#6B0000' }
                }}
              >
                Set PDF Link
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
}
