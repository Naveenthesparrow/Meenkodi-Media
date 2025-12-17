import React from "react";
import { Box, Card, CardMedia, Typography } from "@mui/material";
import API_BASE_URL from "../../utils/api";

const MediaDisplay = ({
  imageUrl,
  videoUrl,
  videoLink,
  title,
  height = 300,
}) => {
  const toAbsoluteMediaUrl = (url) => {
    if (!url) return url;
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('data:')) return url;
    const withLeading = url.startsWith("/") ? url : `/${url}`;
    return `${API_BASE_URL}${withLeading}`;
  };
  const getYouTubeVideoId = (url) => {
    const regExp =
      /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : false;
  };

  const getVimeoVideoId = (url) => {
    const regExp = /^.*(?:vimeo.com\/)([0-9]+)/;
    const match = url.match(regExp);
    return match ? match[1] : false;
  };

  const renderMedia = () => {
    // Priority: Video Link > Video Upload > Image
    if (videoLink) {
      const youtubeId = getYouTubeVideoId(videoLink);
      const vimeoId = getVimeoVideoId(videoLink);

      if (youtubeId) {
        return (
          <Box
            component="iframe"
            sx={{
              width: "100%",
              height: height,
              border: "none",
              borderRadius: 0,
            }}
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={title || "Video"}
            allowFullScreen
          />
        );
      } else if (vimeoId) {
        return (
          <Box
            component="iframe"
            sx={{
              width: "100%",
              height: height,
              border: "none",
              borderRadius: 0,
            }}
            src={`https://player.vimeo.com/video/${vimeoId}`}
            title={title || "Video"}
            allowFullScreen
          />
        );
      } else {
        // Generic video link
        return (
          <video
            controls
            style={{
              width: "100%",
              height: height,
              objectFit: "cover",
              backgroundColor: "#000",
            }}
            src={videoLink}
            title={title || "Video"}
          />
        );
      }
    } else if (videoUrl) {
      return (
        <video
          controls
          style={{
            width: "100%",
            height: height,
            objectFit: "cover",
            backgroundColor: "#000",
          }}
          src={toAbsoluteMediaUrl(videoUrl)}
          title={title || "Video"}
        />
      );
    } else if (imageUrl) {
      return (
        <CardMedia
          component="img"
          image={toAbsoluteMediaUrl(imageUrl)}
          alt={title || "Image"}
          sx={{
            width: "100%",
            height: height,
            objectFit: "cover",
          }}
        />
      );
    } else {
      return (
        <Box
          sx={{
            width: "100%",
            height: height,
            backgroundColor: "#f5f5f5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px dashed #ddd",
          }}
        >
          <Typography variant="body2" color="textSecondary">
            No media available
          </Typography>
        </Box>
      );
    }
  };

  return <Box sx={{ width: "100%", overflow: "hidden" }}>{renderMedia()}</Box>;
};

export default MediaDisplay;
