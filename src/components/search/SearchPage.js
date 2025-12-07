import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, CircularProgress } from '@mui/material';
import { useDispatch } from 'react-redux';
import {
  fetchVideoDetails,
  fetchVideoDetailsByShortCode,
} from '../../redux/videoSlice';
import Header from '../header/header';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api/videos`;

const SearchPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch videos');
        const data = await response.json();

        if (query) {
          const filtered = data.filter(
            (video) =>
              video.title.toLowerCase().includes(query.toLowerCase()) ||
              (video.genres &&
                video.genres.some((genre) =>
                  genre.toLowerCase().includes(query.toLowerCase())
                ))
          );
          setVideos(filtered);
        } else {
          setVideos([]);
        }
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [query]);

  const getThumbnailUrl = (link) => {
    if (!link) return '/fallback.jpg';
    if (link.includes('objectstorage') && link.endsWith('.mp4')) {
      return link.replace('.mp4', '-thumbnail.jpg');
    }
    return link;
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'black', color: 'white' }}>
      <Header />
      <Box sx={{ padding: '100px 40px 40px' }}>
        <Typography variant="h4" sx={{ marginBottom: '30px' }}>
          {query ? `Search Results for "${query}"` : 'Search'}
        </Typography>

        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '50px',
            }}
          >
            <CircularProgress sx={{ color: '#c10000' }} />
          </Box>
        ) : videos.length > 0 ? (
          <Grid container spacing={3}>
            {videos.map((video) => (
              <Grid item key={video._id} xs={12} sm={6} md={4} lg={3}>
                <Box
                  onClick={() => {
                    if (video.shortCode) {
                      dispatch(fetchVideoDetailsByShortCode(video.shortCode));
                      navigate(`/video/${encodeURIComponent(video.shortCode)}`);
                    } else {
                      dispatch(fetchVideoDetails(video._id));
                      navigate(`/video/${encodeURIComponent(video._id)}`);
                    }
                  }}
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      zIndex: 10,
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={getThumbnailUrl(video.thumbnail)}
                    alt={video.title}
                    sx={{
                      width: '100%',
                      height: '160px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                    }}
                    onError={(e) => {
                      e.target.src = '/fallback.jpg';
                    }}
                  />
                  <Typography
                    variant="subtitle1"
                    sx={{ marginTop: '10px', fontWeight: 'bold' }}
                  >
                    {video.title}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography
            variant="h6"
            sx={{ color: 'gray', textAlign: 'center', marginTop: '50px' }}
          >
            No results found for "{query}"
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default SearchPage;
