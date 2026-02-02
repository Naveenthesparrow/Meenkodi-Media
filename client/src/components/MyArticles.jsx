import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  Container,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  HourglassEmpty,
  Cancel,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../utils/api';

export default function MyArticles({ user }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchMyArticles();
    }
  }, [user]);

  const fetchMyArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/articles/my-articles`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch articles');
      
      const data = await response.json();
      setArticles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'published':
        return {
          label: i18n.language === 'ta' ? 'வெளியிடப்பட்டது' : 'Published',
          color: 'success',
          icon: <CheckCircle sx={{ fontSize: 18 }} />,
          bgcolor: '#d4edda',
          textColor: '#155724',
        };
      case 'pending':
        return {
          label: i18n.language === 'ta' ? 'நிலுவையில்' : 'Pending',
          color: 'warning',
          icon: <HourglassEmpty sx={{ fontSize: 18 }} />,
          bgcolor: '#fff3cd',
          textColor: '#856404',
        };
      case 'rejected':
        return {
          label: i18n.language === 'ta' ? 'நிராகரிக்கப்பட்டது' : 'Rejected',
          color: 'error',
          icon: <Cancel sx={{ fontSize: 18 }} />,
          bgcolor: '#f8d7da',
          textColor: '#721c24',
        };
      default:
        return {
          label: status,
          color: 'default',
          icon: null,
          bgcolor: '#e0e0e0',
          textColor: '#333',
        };
    }
  };

  const handleDelete = async (articleId) => {
    if (!window.confirm(i18n.language === 'ta' ? 'நிச்சயமாக நீக்க விரும்புகிறீர்களா?' : 'Are you sure you want to delete this article?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/articles/${articleId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete article');
      
      setArticles(articles.filter(article => article._id !== articleId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">
          {i18n.language === 'ta' ? 'உங்கள் கட்டுரைகளைக் காண உள்நுழைக.' : 'Please log in to see your articles.'}
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#8B0000' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (articles.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">
          {i18n.language === 'ta' ? 'நீங்கள் இன்னும் எந்த கட்டுரையும் எழுதவில்லை.' : 'You haven\'t written any articles yet.'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: 3, 
          fontWeight: 700, 
          color: '#8B0000',
          fontFamily: "'Poppins', sans-serif"
        }}
      >
        {i18n.language === 'ta' ? 'என் கட்டுரைகள்' : 'My Articles'}
      </Typography>

      {articles.map((article) => {
        const statusConfig = getStatusConfig(article.status);
        const title = article.title[i18n.language] || article.title.en || article.title.ta;
        const content = article.content[i18n.language] || article.content.en || article.content.ta;

        return (
          <Card 
            key={article._id} 
            sx={{ 
              mb: 3, 
              p: 3,
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: '0 4px 20px rgba(139, 0, 0, 0.1)',
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1,
                    color: '#333'
                  }}
                >
                  {title}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#666',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 2
                  }}
                >
                  {content}
                </Typography>
              </Box>

              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: statusConfig.bgcolor,
                }}
              >
                {statusConfig.icon}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 600,
                    color: statusConfig.textColor,
                  }}
                >
                  {statusConfig.label}
                </Typography>
              </Box>
            </Box>

            {article.rejectionReason && article.status === 'rejected' && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {i18n.language === 'ta' ? 'நிராகரிப்பு காரணம்:' : 'Rejection Reason:'}
                </Typography>
                {article.rejectionReason}
              </Alert>
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#999' }}>
                {i18n.language === 'ta' ? 'சமர்ப்பிக்கப்பட்டது:' : 'Submitted:'} {new Date(article.submittedAt).toLocaleDateString()}
              </Typography>

              <Box sx={{ display: 'flex', gap: 1 }}>
                {article.status === 'published' && (
                  <Tooltip title={i18n.language === 'ta' ? 'பார்க்க' : 'View'}>
                    <IconButton 
                      size="small"
                      onClick={() => navigate(`/articles/${article._id}`)}
                      sx={{ 
                        color: '#8B0000',
                        '&:hover': { bgcolor: 'rgba(139, 0, 0, 0.1)' }
                      }}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}

                {(article.status === 'pending' || article.status === 'rejected') && (
                  <Tooltip title={i18n.language === 'ta' ? 'நீக்கு' : 'Delete'}>
                    <IconButton 
                      size="small"
                      onClick={() => handleDelete(article._id)}
                      sx={{ 
                        color: '#d32f2f',
                        '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.1)' }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Card>
        );
      })}
    </Container>
  );
}
