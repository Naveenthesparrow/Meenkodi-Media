import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Dialog, 
  DialogContent 
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import Mermaid from './Mermaid';
import YouTube from 'react-youtube';

const DetailPageTemplate = ({
  title,
  subtitle,
  description,
  learningObjectives = [],
  mindmapContent = '',
  youtubeVideoId,
  sections = [],
  images = [],
  realWorldApplications = []
}) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageOpen = (image) => {
    setSelectedImage(image);
  };

  const handleImageClose = () => {
    setSelectedImage(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 4, 
        borderBottom: '2px solid #000',
        pb: 2 
      }}>
        <Typography 
          variant="h2" 
          sx={{ 
            fontWeight: 900, 
            color: "#000",
            mb: 2
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="h5" 
          color="text.secondary"
        >
          {subtitle}
        </Typography>
      </Box>

      {/* Description */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
          {description}
        </Typography>
      </Paper>

      {/* Learning Objectives */}
      {learningObjectives.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: '#f4f4f4' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Learning Objectives
          </Typography>
          {learningObjectives.map((obj, index) => (
            <Typography 
              key={index} 
              variant="body2" 
              component="div" 
              sx={{ 
                mb: 1, 
                pl: 2, 
                borderLeft: '4px solid #000' 
              }}
            >
              • {obj}
            </Typography>
          ))}
        </Paper>
      )}

      {/* Mindmap */}
      {mindmapContent && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Conceptual Mindmap
          </Typography>
          <Mermaid chart={mindmapContent} />
        </Box>
      )}

      {/* YouTube Video */}
      {youtubeVideoId && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 4 
        }}>
          <YouTube 
            videoId={youtubeVideoId}
            opts={{
              height: '390',
              width: '640',
              playerVars: { autoplay: 0 }
            }}
          />
        </Box>
      )}

      {/* Sections */}
      {sections.map((section, index) => (
        <Paper 
          key={index} 
          elevation={2} 
          sx={{ 
            p: 3, 
            mb: 3,
            bgcolor: index % 2 === 0 ? '#f9f9f9' : 'white'
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            {section.title}
          </Typography>
          <ReactMarkdown>{section.content}</ReactMarkdown>
        </Paper>
      ))}

      {/* Images */}
      {images.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Gallery
          </Typography>
          <Grid container spacing={2}>
            {images.map((img, index) => (
              <Grid item xs={6} md={4} key={index}>
                <img 
                  src={img.url} 
                  alt={img.alt} 
                  style={{ 
                    width: '100%', 
                    height: '200px', 
                    objectFit: 'cover',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleImageOpen(img)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Real-World Applications */}
      {realWorldApplications.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, bgcolor: '#e6f3ff' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Real-World Applications
          </Typography>
          {realWorldApplications.map((app, index) => (
            <Typography 
              key={index} 
              variant="body2" 
              component="div" 
              sx={{ 
                mb: 1, 
                pl: 2, 
                borderLeft: '4px solid #1976d2' 
              }}
            >
              • {app}
            </Typography>
          ))}
        </Paper>
      )}

      {/* Image Dialog */}
      <Dialog 
        open={!!selectedImage} 
        onClose={handleImageClose}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {selectedImage && (
            <img 
              src={selectedImage.url} 
              alt={selectedImage.alt} 
              style={{ 
                width: '100%', 
                maxHeight: '70vh', 
                objectFit: 'contain' 
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default DetailPageTemplate; 