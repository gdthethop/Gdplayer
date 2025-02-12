import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import Header from '../header/header';
import CommentSection from '../comment/comment';

const VideoPlayer = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [isYouTubeVideo, setIsYouTubeVideo] = useState(false);
  const [isGoogleDriveVideo, setIsGoogleDriveVideo] = useState(false);
  const videoRef = useRef(null);

  // Function to get query parameters
  const getQueryParam = (param) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  };

  // Function to check if a URL is a YouTube video
  const isYouTubeUrl = (url) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Function to check if a URL is a Google Drive video
  const isGoogleDriveUrl = (url) => {
    return url.includes('drive.google.com');
  };

  // Function to extract YouTube video ID
  const extractYouTubeVideoId = (url) => {
    try {
      const urlObj = new URL(url);

      // Handle full YouTube links
      if (urlObj.hostname === 'www.youtube.com' && urlObj.pathname === '/watch') {
        return urlObj.searchParams.get('v');
      }

      // Handle shortened YouTube links
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.split('/')[1];
      }

      return null;
    } catch (error) {
      console.error('Invalid URL:', error);
      return null;
    }
  };

  // Function to modify Google Drive URL for embedding
  const modifyGoogleDriveUrl = (url) => {
    const match = url.match(/\/d\/(.+?)\//);
    return match ? `https://drive.google.com/file/d/${match[1]}/preview` : url;
  };
  

  // Load video details
  useEffect(() => {
    const url = getQueryParam('video');
    const title = getQueryParam('title');
    const description = getQueryParam('description');

    if (url) {
      if (isYouTubeUrl(url)) {
        setIsYouTubeVideo(true);
        const videoId = extractYouTubeVideoId(url);
        if (videoId) {
          setVideoUrl(`https://www.youtube.com/embed/${videoId}`);
        }
      } else if (isGoogleDriveUrl(url)) {
        setIsGoogleDriveVideo(true);
        setVideoUrl(modifyGoogleDriveUrl(url)); // Use the modified Google Drive URL
      } else {
        setVideoUrl(url);
        if (videoRef.current) {
          videoRef.current.load();
          videoRef.current.play().catch((error) => {
            console.error('Video play failed:', error);
          });
        }
      }
    } else {
      alert('Video not found.');
    }

    if (title) {
      setVideoTitle(title);
      document.title = title;
    }

    if (description) {
      setVideoDescription(description);
    }
  }, []);

  return (
    <Box sx={{ backgroundColor: 'black', color: 'white', minHeight: '100vh' }}>
      {/* Header */}
      <Header />

      {/* Main Content */}
      <Box sx={{ maxWidth: '90%', margin: 'auto', paddingTop: '100px' }}>
        <Box sx={{ display: 'flex', gap: '20px' }}>
          {/* Video Container */}
          <Box sx={{ flex: 2 }}>
            {isYouTubeVideo ? (
              // YouTube video embed
              <iframe
                src={videoUrl}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ width: '100%', height: '400px', borderRadius: '10px', border: 'none' }}
              />
            ) : isGoogleDriveVideo ? (
              // Google Drive video
              <iframe
                src={videoUrl}
                title="Google Drive Video"
                allow="autoplay; fullscreen"
                style={{ width: '100%', height: '400px', borderRadius: '10px', border: 'none' }}
                >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
                </iframe>
            ) : (
              // Regular video
              <video
                ref={videoRef}
                controls
                autoPlay
                style={{ width: '100%', borderRadius: '10px', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.8)' }}
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            <Typography variant="h2" sx={{ fontSize: '24px', fontWeight: 'bold', marginTop: '20px' }}>
              {videoTitle}
            </Typography>
            <Typography sx={{ fontSize: '16px', color: '#aaaaaa', marginTop: '10px' }}>
              {videoDescription}
            </Typography>
            <CommentSection />
          </Box>

          {/* Recommendations */}
          <Box sx={{ flex: 1, padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px' }}>
            <Typography variant="h3" sx={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
              Recommended Videos
            </Typography>
            {/* Render recommendations here */}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoPlayer;