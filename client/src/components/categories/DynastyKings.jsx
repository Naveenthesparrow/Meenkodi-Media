import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from "react-router-dom";
import SEO, { pageSEO } from '../common/SEO';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  Container,
  IconButton,
  Fade,
  CircularProgress,
  TextField,
} from "@mui/material";
import {
  Edit,
  Delete,
  Favorite,
  ArrowBack,
  Search,
} from "@mui/icons-material";
import API_BASE_URL from "../../utils/api";
import { useBilingualContent } from "../../utils/bilingualContent";

export default function DynastyKings({ user }) {
  const navigate = useNavigate();
  const { dynastyId } = useParams();
  const getContent = useBilingualContent();
  const { t } = useTranslation();
  const [kings, setKings] = useState([]);
  const [filteredKings, setFilteredKings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const dynastyInfo = {
    pandiya: {
      name: { en: 'Pandiya Dynasty', ta: 'பாண்டியர் வம்சம்' },
      color: '#DC143C',
      bgColor: '#FFF0F0',
    },
    chera: {
      name: { en: 'Chera Dynasty', ta: 'சேரர் வம்சம்' },
      color: '#FFD700',
      bgColor: '#FFFEF0',
    },
    chola: {
      name: { en: 'Chola Dynasty', ta: 'சோழர் வம்சம்' },
      color: '#8B0000',
      bgColor: '#FFF5F5',
    },
    pallava: {
      name: { en: 'Pallava Dynasty', ta: 'பல்லவர் வம்சம்' },
      color: '#DAA520',
      bgColor: '#FFF9E6',
    },
  };

  const currentDynasty = dynastyInfo[dynastyId] || dynastyInfo.chola;

  const fetchKingsByDynasty = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/kings`);
      if (!res.ok) throw new Error("Failed to fetch kings");
      const data = await res.json();
      
      // Filter kings by dynasty
      const filteredKings = data.filter(king => {
        const dynastyName = getContent(king.dynasty).toLowerCase();
        return dynastyName.includes(dynastyId);
      });
      
      setKings(filteredKings);
    } catch (err) {
      console.error(err);
      setKings([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKingsByDynasty();
  }, [dynastyId]);

  // Apply search filter to kings
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredKings(kings);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = kings.filter(king => {
        const nameMatch = getContent(king.name).toLowerCase().includes(searchLower);
        const periodMatch = getContent(king.period).toLowerCase().includes(searchLower);
        return nameMatch || periodMatch;
      });
      setFilteredKings(filtered);
    }
  }, [kings, searchTerm, getContent]);

  const handleEdit = (king) => {
    navigate(`/explore/kings/edit/${king._id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this king's profile?")) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/kings/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        
        if (!res.ok) throw new Error("Delete failed");
        
        setKings(prevKings => prevKings.filter((king) => king._id !== id));
        await fetchKingsByDynasty();
      } catch (err) {
        console.error(err);
        alert("Failed to delete king's profile");
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: currentDynasty.color }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
      <SEO {...pageSEO.dynasties} />
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/explore/kings')}
        sx={{
          mb: 3,
          color: currentDynasty.color,
          fontWeight: 700,
          '&:hover': {
            bgcolor: `${currentDynasty.color}15`,
          }
        }}
      >
        {t('actions.back', 'Back to Dynasties')}
      </Button>

      <Box 
        sx={{ 
          mb: 6, 
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h2" 
          sx={{
            fontFamily: 'Georgia, serif',
            fontWeight: 800, 
            color: currentDynasty.color,
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            letterSpacing: '0.05em',
            mb: 1,
          }}
        >
          {getContent(currentDynasty.name)}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            color: '#666',
            fontSize: '1.1rem',
            mb: 2,
          }}
        >
          {filteredKings.length} {t('kings.rulers', 'Rulers')}
        </Typography>

        {/* Search Bar */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          px: { xs: 1, md: 0 },
          maxWidth: '100%',
        }}>
          <TextField
            placeholder={t('kings.searchPlaceholder', 'Search rulers by name or period...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              maxWidth: '500px',
              width: '100%',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: '#f5f5f5',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#fff',
                  '& fieldset': {
                    borderColor: currentDynasty.color,
                  }
                },
                '&.Mui-focused': {
                  backgroundColor: '#fff',
                  '& fieldset': {
                    borderColor: currentDynasty.color,
                  }
                },
              },
              '& .MuiOutlinedInput-input': {
                fontFamily: 'Georgia, serif',
                fontSize: '0.95rem',
                '&::placeholder': {
                  color: '#999',
                  opacity: 1,
                }
              }
            }}
          />
        </Box>
      </Box>

      {filteredKings.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="textSecondary">
            {searchTerm ? t('kings.noResults', 'No rulers found matching your search') : t('kings.noKings', 'No kings found for this dynasty')}
          </Typography>
        </Box>
      ) : (
        <Grid 
          container 
          spacing={4} 
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'stretch',
          }}
        >
          {filteredKings.map((king, index) => (
            <Fade 
              in={true} 
              timeout={500 + index * 200} 
              key={king._id}
            >
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                }}
              >
                <Card
                  component={Link}
                  to={`/explore/kings/${king._id}`}
                  sx={{
                    textDecoration: 'none',
                    width: '100%',
                    height: { xs: 460, md: 500 },
                    display: 'flex',
                    flexDirection: 'column',
                    border: 'none',
                    borderRadius: 0,
                    bgcolor: '#fff',
                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    cursor: "pointer",
                    position: 'relative',
                    overflow: 'visible',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: -8,
                      left: -8,
                      right: -8,
                      bottom: -8,
                      border: `2px solid ${currentDynasty.color}`,
                      opacity: 0,
                      transition: 'opacity 0.4s ease',
                      zIndex: -1,
                    },
                    "&:hover": {
                      transform: "translateY(-16px)",
                      boxShadow: '0 25px 50px rgba(0,0,0,0.12)',
                      '& .temple-image': {
                        transform: 'scale(1.1) rotate(2deg)',
                      },
                      '& .temple-overlay': {
                        opacity: 1,
                      },
                      '& .temple-title': {
                        color: currentDynasty.color,
                      },
                      '& .view-button': {
                        bgcolor: currentDynasty.color,
                        color: '#fff',
                        transform: 'translateY(-4px)',
                      },
                      '& .admin-controls': {
                        opacity: 1,
                        transform: 'translateY(0)',
                      },
                      '& .like-badge': {
                        transform: 'scale(1.1) rotate(-5deg)',
                      }
                    },
                  }}
                  >
                  {(king.image || king.imageLink) ? (
                    <Box sx={{ position: 'relative', height: 240, overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                      <CardMedia
                        component="img"
                        image={king.image || king.imageLink}
                        alt={getContent(king.name)}
                        className="temple-image"
                        sx={{ 
                          objectFit: "cover",
                          width: '100%',
                          height: '100%',
                          transition: 'all 0.6s ease',
                        }}
                        onError={(e) => {
                          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' viewBox='0 0 400 240'%3E%3Crect fill='%23e0e0e0' width='400' height='240'%3E%3C/rect%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-size='18px' fill='%23999'%3ENo Image%3C/text%3E%3C/svg%3E";
                        }}
                      />

                      {/* Gradient Overlay */}
                      <Box
                        className="temple-overlay"
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '60%',
                          background: `linear-gradient(to top, ${currentDynasty.color} 0%, ${currentDynasty.color}66 50%, transparent 100%)`,
                          opacity: 0.7,
                          transition: 'opacity 0.4s ease',
                        }}
                      />

                      {/* Admin Controls */}
                      {user && user.role === "admin" && (
                        <Box 
                          className="admin-controls"
                          sx={{
                            position: 'absolute',
                            bottom: 10,
                            right: 10,
                            display: "flex", 
                            gap: 1,
                            opacity: 0,
                            transform: 'translateY(8px)',
                            transition: 'opacity 0.3s ease, transform 0.25s ease',
                          }}
                        >
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(king);
                            }}
                            size="small"
                            sx={{
                              bgcolor: "#FFF",
                              color: currentDynasty.color,
                              "&:hover": { 
                                bgcolor: currentDynasty.color,
                                color: '#FFF',
                                transform: 'scale(1.15)' 
                              },
                              transition: 'all 0.2s ease',
                              border: `2px solid ${currentDynasty.color}`,
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(king._id);
                            }}
                            size="small"
                            sx={{
                              bgcolor: "#FFF",
                              color: currentDynasty.color,
                              "&:hover": { 
                                bgcolor: currentDynasty.color,
                                color: '#FFF',
                                transform: 'scale(1.15)' 
                              },
                              transition: 'all 0.2s ease',
                              border: `2px solid ${currentDynasty.color}`,
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        height: 240,
                        width: '100%',
                        backgroundColor: '#e0e0e0',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        color="textSecondary"
                        sx={{ fontFamily: 'Georgia, serif', fontSize: '1rem' }}
                      >
                        No Image Available
                      </Typography>
                    </Box>
                  )}
                  <CardContent
                    sx={{
                      p: 3,
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      bgcolor: '#fff',
                      position: 'relative',
                    }}
                  >
                    <Box>
                      <Typography
                        variant="h5"
                        className="temple-title"
                        sx={{
                          fontFamily: 'Georgia, serif',
                          fontWeight: 700,
                          color: '#000',
                          mb: 1.25,
                          lineHeight: 1.12,
                          fontSize: { xs: '1.35rem', md: '1.6rem' },
                          textTransform: 'capitalize',
                          letterSpacing: '0.02em',
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -8,
                            left: 0,
                            width: '48px',
                            height: '3px',
                            bgcolor: currentDynasty.color,
                            borderRadius: 1,
                          }
                        }}
                      >
                        {getContent(king.name)}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: "#666",
                          fontStyle: "italic",
                          fontSize: { xs: '0.95rem', md: '1rem' },
                          mb: 2.5,
                          fontFamily: 'Georgia, serif',
                        }}
                      >
                        {getContent(king.period)}
                      </Typography>

                      {/* Heart box with count */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 46,
                          height: 46,
                          border: '1px solid #eee',
                          borderRadius: 1,
                          color: '#000',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                        }}>
                          <Favorite sx={{ fontSize: '1.1rem' }} />
                        </Box>
                        <Typography variant="body2" sx={{ color: '#000', fontWeight: 700, fontFamily: 'Georgia, serif', fontSize: '1rem' }}>
                          {king.likes ? (Array.isArray(king.likes) ? king.likes.length : 0) : 0}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      component={Link}
                      to={`/explore/kings/${king._id}`}
                      variant="text"
                      fullWidth
                      className="view-button"
                      sx={{
                        bgcolor: 'transparent',
                        color: '#000',
                        borderRadius: 0,
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        mt: 'auto',
                        py: 1.2,
                        transition: 'all 0.25s ease',
                        border: '1px solid #000',
                        fontFamily: 'Georgia, serif',
                        fontSize: '0.95rem',
                        '&:hover': {
                          bgcolor: 'transparent'
                        }
                      }}
                    >
                      {t('actions.readMore', 'Read more').toUpperCase()}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Fade>
          ))}
        </Grid>
      )}
    </Container>
  );
}
