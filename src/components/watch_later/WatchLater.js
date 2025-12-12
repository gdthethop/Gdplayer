import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWatchLater, toggleWatchLaterAction } from '../../redux/userSlice';
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Paper,
  Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNavigate } from 'react-router-dom';
import Header from '../header/header';

const WatchLater = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { watchLaterVideos, loading, error } = useSelector(
    (state) => state.user
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchWatchLater());
    }
  }, [dispatch, user]);

  const handleRemove = async (e, videoId) => {
    e.stopPropagation();
    await dispatch(toggleWatchLaterAction(videoId));
    dispatch(fetchWatchLater()); // Refresh list
  };

  const handlePlay = (shortCode, id) => {
    if (shortCode) navigate(`/video/${shortCode}`);
    else navigate(`/video/${id}`);
  };

  if (!user) return <Box sx={{ p: 4, color: 'white' }}>Please log in.</Box>;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'black', color: 'white' }}>
      <Header />
      <Box
        sx={{
          p: { xs: 2, md: 4 },
          pt: '100px',
          maxWidth: '1600px',
          margin: 'auto',
        }}
      >
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          Watch Later
        </Typography>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : watchLaterVideos.length === 0 ? (
          <Typography sx={{ color: '#aaa' }}>
            Your Watch Later list is empty.
          </Typography>
        ) : (
          <Grid container spacing={3}>
            {watchLaterVideos.map((video) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={video._id}>
                <Paper
                  sx={{
                    bgcolor: '#1e1e1e',
                    color: 'white',
                    borderRadius: 2,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.02)' },
                  }}
                  onClick={() => handlePlay(video.shortCode, video._id)}
                >
                  <Box sx={{ position: 'relative', aspectRatio: '16/9' }}>
                    <img
                      src={
                        video.thumbnail ||
                        'https://placehold.co/600x400?text=No+Thumb'
                      }
                      alt={video.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <Box
                      className="hover-play"
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        '&:hover': { opacity: 1 },
                      }}
                    >
                      <PlayArrowIcon sx={{ fontSize: 50 }} />
                    </Box>
                  </Box>
                  <Box sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        noWrap
                        sx={{ maxWidth: '85%' }}
                      >
                        {video.title}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => handleRemove(e, video._id)}
                        sx={{
                          color: '#aaa',
                          '&:hover': { color: 'red' },
                          mt: -0.5,
                          mr: -1,
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#aaa', mt: 1 }}>
                      {video.views} views •{' '}
                      {new Date(video.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      <Typography
        variant="body2"
        sx={{
          marginTop: 8,
          marginBottom: 4,
          color: '#b3b3b3',
          textAlign: 'center',
          width: '100%',
        }}
      >
        &copy; 2025 Gd Player & Gd Enterprises. All rights reserved.
      </Typography>
    </Box>
  );
};

export default WatchLater;
