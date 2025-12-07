import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHistory, clearHistory } from '../../redux/historySlice';
import {
  Box,
  Typography,
  Grid,
  Button,
  LinearProgress,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';

const History = () => {
  const dispatch = useDispatch();
  const { history, loading, error } = useSelector((state) => state.history);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchHistory());
    }
  }, [dispatch, user]);

  const handleClearHistory = () => {
    if (
      window.confirm(
        'Are you sure you want to clear your entire watch history?'
      )
    ) {
      dispatch(clearHistory());
    }
  };

  if (!user) {
    return (
      <Box
        sx={{ p: 4, textAlign: 'center', color: 'white', minHeight: '80vh' }}
      >
        <Typography variant="h5">
          Please log in to view your history.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, minHeight: '90vh', color: 'white' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          Watch History
        </Typography>
        {history.length > 0 && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleClearHistory}
          >
            Clear History
          </Button>
        )}
      </Box>

      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      {!loading && history.length === 0 && (
        <Typography variant="body1" sx={{ color: '#aaa' }}>
          You haven't watched any videos yet.
        </Typography>
      )}

      <Grid container spacing={3}>
        {history.map((item) => {
          const video = item.video;
          if (!video) return null; // Skip if video was deleted

          // Calculate percentage
          const percentage = video.duration
            ? (item.progress / video.duration) * 100
            : 0; // Duration might be missing in schema, assume we might need to fix that or just show absolute progress
          // Actually, standard Video model doesn't enforce duration storage yet unless I missed it.
          // However, let's assume if we don't know duration, we just show a bar if progress > 0.
          // Ideally we should store duration in Video model.

          return (
            <Grid item key={item._id} xs={12} sm={6} md={4} lg={3}>
              <Box
                component={Link}
                to={`/video/${video.shortCode}`}
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    aspectRatio: '16/9',
                    mb: 1,
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={video.thumbnail || 'https://placehold.co/600x400'}
                    alt={video.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  {/* Progress Bar Overlay */}
                  <Box
                    sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
                  >
                    <LinearProgress
                      variant="determinate"
                      value={
                        item.completed ? 100 : percentage > 0 ? percentage : 0
                      }
                      sx={{
                        height: 4,
                        bgcolor: 'rgba(255,255,255,0.3)',
                        '& .MuiLinearProgress-bar': { bgcolor: 'red' },
                      }}
                    />
                  </Box>
                </Box>
                <Typography variant="subtitle1" fontWeight="bold" noWrap>
                  {video.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#aaa' }}>
                  {video.views} views
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default History;
