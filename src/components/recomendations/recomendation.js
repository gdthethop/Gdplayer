import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import {
  prefetchHandlers,
  prefetchVideo,
  toPreview,
} from '../../utils/videoPrefetch';

const API_URL =
  process.env.REACT_APP_API_URL ||
  `${process.env.REACT_APP_BACKEND_URL}/api/videos`;

const UP_NEXT_PREFETCH_DELAY_MS = 8000; // after the current video has started

const Recommendation = ({ currentVideoId, currentVideoShortCode }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        if (!Array.isArray(data)) {
          setError('Failed to fetch videos. Please try again later.');
          console.error('Invalid data format:', data);
          return;
        }

        setVideos(
          data.filter(
            (video) =>
              video._id !== currentVideoId &&
              video.shortCode !== currentVideoShortCode
          )
        );
      } catch (error) {
        setError('Error fetching data: ' + error.message);
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentVideoId]);

  // Warm the first "up next" video once the current one has had time to start
  useEffect(() => {
    if (!videos.length) return undefined;
    const t = setTimeout(
      () => prefetchVideo(videos[0]),
      UP_NEXT_PREFETCH_DELAY_MS
    );
    return () => clearTimeout(t);
  }, [videos]);

  return (
    <Box sx={{ padding: { xs: '20px 0', md: '0 0 0 20px' } }}>
      <Typography
        variant="h6"
        sx={{ color: 'white', marginBottom: '15px', fontWeight: 'bold' }}
      >
        Recommended
      </Typography>
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[...Array(5)].map((_, index) => (
            <Box key={index} sx={{ display: 'flex', gap: '10px' }}>
              <Skeleton
                variant="rectangular"
                width={168}
                height={94}
                sx={{ bgcolor: 'grey.900', borderRadius: '8px' }}
              />
              <Box sx={{ flex: 1 }}>
                <Skeleton
                  variant="text"
                  width="80%"
                  sx={{ bgcolor: 'grey.900' }}
                />
                <Skeleton
                  variant="text"
                  width="60%"
                  sx={{ bgcolor: 'grey.900' }}
                />
              </Box>
            </Box>
          ))}
        </Box>
      ) : error ? (
        <Typography sx={{ color: '#ff0000' }}>{error}</Typography>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {videos.map((video) => {
            const imageUrl = video.thumbnail || '/fallback.jpg';

            return (
              <Box
                key={video._id}
                component="a"
                {...prefetchHandlers(video)}
                onClick={(e) => {
                  e.preventDefault();
                  const id = video.shortCode || video._id;
                  navigate(`/video/${encodeURIComponent(id)}`, {
                    state: { preview: toPreview(video) },
                  });
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  gap: '8px',
                  '&:hover .thumbnail': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                {/* Thumbnail Container */}
                <Box
                  sx={{
                    position: 'relative',
                    minWidth: '168px',
                    width: '168px',
                    height: '94px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <img
                    className="thumbnail"
                    src={imageUrl}
                    alt={video.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.2s ease-in-out',
                    }}
                    onError={(e) => {
                      e.target.src = '/fallback.jpg';
                    }}
                  />
                </Box>

                {/* Video Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#fff',
                      lineHeight: '1.2rem',
                      maxHeight: '2.4rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      marginBottom: '4px',
                    }}
                  >
                    {video.title}
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#aaaaaa' }}>
                    {Array.isArray(video.genres)
                      ? video.genres[0]
                      : video.genres || 'Unknown'}
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#aaaaaa' }}>
                    {video.views} views
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default Recommendation;
