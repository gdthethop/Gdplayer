import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../header/header';
import HeroSection from './HeroSection';
import { Box, Typography, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  fetchVideoDetails,
  fetchVideoDetailsByShortCode,
} from '../../redux/videoSlice';

function Home() {
  const [videos, setVideos] = useState([]);
  const [latestVideo, setLatestVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/videos`
      );
      const data = response.data;

      if (Array.isArray(data) && data.length > 0) {
        // Set latest video (random or first, let's pick random for variety on refresh, or just first)
        // For hero section, typically we want something visually stunning.
        const randomIndex = Math.floor(Math.random() * data.length);
        setLatestVideo(data[randomIndex]);
        setVideos(data);
      } else {
        setVideos([]);
        setLatestVideo(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVideoClick = (video) => {
    if (video.shortCode) {
      dispatch(fetchVideoDetailsByShortCode(video.shortCode));
      navigate(`/video/${encodeURIComponent(video.shortCode)}`);
    } else {
      dispatch(fetchVideoDetails(video._id));
      navigate(`/video/${encodeURIComponent(video._id)}`);
    }
  };

  const getThumbnailUrl = (link) => {
    if (!link) return 'https://placehold.co/600x400?text=No+Thumbnail';
    if (link.includes('objectstorage') && link.endsWith('.mp4')) {
      return link.replace('.mp4', '-thumbnail.jpg');
    }
    return link;
  };

  return (
    <Box
      sx={{ backgroundColor: '#0f0f0f', minHeight: '100vh', color: 'white' }}
    >
      <Header />

      {/* Hero Section */}
      {latestVideo && <HeroSection video={latestVideo} />}

      {/* Category Bar & Video Grid Container */}
      <Box sx={{ px: { xs: 2, md: 4, lg: 5 }, pb: 8 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <Typography>Loading videos...</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {videos.map((video) => (
              <Grid item key={video._id} xs={12} sm={6} md={4} lg={3}>
                <Box
                  onClick={() => handleVideoClick(video)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  {/* Thumbnail */}
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '16/9',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      mb: 1.5,
                      backgroundColor: '#202020',
                    }}
                  >
                    <img
                      src={getThumbnailUrl(video.thumbnail)}
                      alt={video.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        e.target.src =
                          'https://placehold.co/600x400?text=Error';
                      }}
                    />
                    {/* Duration (Mock) */}
                    {/* <Box sx={{ 
                        position: 'absolute', bottom: 8, right: 8, 
                        bgcolor: 'rgba(0,0,0,0.8)', color: 'white', 
                        fontSize: '12px', px: 0.5, borderRadius: 1 
                    }}>
                        12:34
                    </Box> */}
                  </Box>

                  {/* Video Info */}
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    {/* Channel Icon (Mock) */}
                    {/* <Avatar sx={{ width: 36, height: 36, bgcolor: '#a80000' }}>
                        {video.title[0]}
                    </Avatar> */}

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          lineHeight: 1.2,
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {video.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: '#aaa', fontSize: '0.9rem' }}
                      >
                        {video.userId ? video.userId.name : 'Gd Player'}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: '#aaa', fontSize: '0.9rem' }}
                      >
                        {video.views} views
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && videos.length === 0 && (
          <Box sx={{ textAlign: 'center', mt: 10 }}>
            <Typography variant="h6" color="gray">
              No videos found.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Home;
