import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCreatorStats } from '../../redux/analyticsSlice';
import { Box, Typography, Grid, Paper, Divider } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import StarIcon from '@mui/icons-material/Star';

const StatCard = ({ title, value, icon, color }) => (
  <Paper
    sx={{
      p: 3,
      bgcolor: '#1e1e1e',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      borderRadius: 2,
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        mb: 2,
      }}
    >
      <Box>
        <Typography
          variant="h6"
          sx={{
            color: '#aaa',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="h3"
          sx={{ fontWeight: 'bold', color: '#fff', mt: 1 }}
        >
          {value}
        </Typography>
      </Box>
      <Box sx={{ bgcolor: `${color}22`, p: 1, borderRadius: 2, color: color }}>
        {icon}
      </Box>
    </Box>
  </Paper>
);

const CreatorStudio = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.analytics);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchCreatorStats());
    }
  }, [dispatch, user]);

  if (!user) {
    return (
      <Box
        sx={{ p: 4, textAlign: 'center', color: 'white', minHeight: '80vh' }}
      >
        <Typography variant="h5">
          Please log in to access Creator Studio.
        </Typography>
      </Box>
    );
  }

  if (loading)
    return <Box sx={{ p: 4, color: 'white' }}>Loading dashboard...</Box>;
  if (error) return <Box sx={{ p: 4, color: 'red' }}>Error: {error}</Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '90vh', color: 'white' }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ mb: 4, fontFamily: '"Outfit", sans-serif' }}
      >
        Creator Studio
      </Typography>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Views"
            value={stats?.totalViews?.toLocaleString() || 0}
            icon={<VisibilityIcon fontSize="large" />}
            color="#4caf50" // Green
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Likes"
            value={stats?.totalLikes?.toLocaleString() || 0}
            icon={<ThumbUpIcon fontSize="large" />}
            color="#2196f3" // Blue
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Videos"
            value={stats?.totalVideos || 0}
            icon={<VideoLibraryIcon fontSize="large" />}
            color="#ff9800" // Orange
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Avg. Engagement"
            value={`${stats?.totalViews > 0 ? ((stats.totalLikes / stats.totalViews) * 100).toFixed(1) : 0}%`}
            icon={<StarIcon fontSize="large" />}
            color="#e91e63" // Pink
          />
        </Grid>
      </Grid>

      {stats?.mostViewedVideo && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Top Performing Video
          </Typography>
          <Paper
            sx={{
              p: 3,
              bgcolor: '#1e1e1e',
              borderRadius: 2,
              display: 'flex',
              gap: 3,
              flexDirection: { xs: 'column', md: 'row' },
            }}
          >
            <Box
              sx={{
                width: { xs: '100%', md: '300px' },
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <img
                src={stats.mostViewedVideo.thumbnail}
                alt="Thumbnail"
                style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  objectFit: 'cover',
                }}
              />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                {stats.mostViewedVideo.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#aaa', mb: 2 }}>
                Uploaded on{' '}
                {new Date(stats.mostViewedVideo.createdAt).toLocaleDateString()}
              </Typography>

              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#888' }}>
                    Views
                  </Typography>
                  <Typography variant="h6">
                    {stats.mostViewedVideo.views}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#888' }}>
                    Likes
                  </Typography>
                  <Typography variant="h6">
                    {stats.mostViewedVideo.likes}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default CreatorStudio;
