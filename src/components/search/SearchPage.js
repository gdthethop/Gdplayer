import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Button,
  FormControl,
  Select,
  InputLabel,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import {
  fetchVideoDetails,
  fetchVideoDetailsByShortCode,
} from '../../redux/videoSlice';
import Header from '../header/header';
import FilterListIcon from '@mui/icons-material/FilterList';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api/videos`;

const SearchPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [uploadDate, setUploadDate] = useState('any');

  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch videos');
        const data = await response.json();

        let filtered = [];

        if (query) {
          filtered = data.filter(
            (video) =>
              video.title.toLowerCase().includes(query.toLowerCase()) ||
              (video.genres &&
                video.genres.some((genre) =>
                  genre.toLowerCase().includes(query.toLowerCase())
                ))
          );
        } else {
          // If no query, maybe show all? Or usually search page shows nothing.
          // Let's assume blank unless query.
          filtered = [];
        }

        // --- Apply Advanced Filters ---
        if (uploadDate !== 'any') {
          const now = new Date();
          filtered = filtered.filter((video) => {
            const videoDate = new Date(video.createdAt);
            const diffTime = Math.abs(now - videoDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            switch (uploadDate) {
              case 'hour':
                return diffTime < 1000 * 60 * 60;
              case 'today':
                return diffDays <= 1;
              case 'week':
                return diffDays <= 7;
              case 'month':
                return diffDays <= 30;
              case 'year':
                return diffDays <= 365;
              default:
                return true;
            }
          });
        }

        // --- Sorting ---
        filtered.sort((a, b) => {
          switch (sortBy) {
            case 'date_desc':
              return new Date(b.createdAt) - new Date(a.createdAt);
            case 'date_asc':
              return new Date(a.createdAt) - new Date(b.createdAt);
            case 'views_desc':
              return b.views - a.views;
            case 'views_asc':
              return a.views - b.views;
            case 'relevance':
            default:
              return 0; // Keep original order (usually by relevance/find order)
          }
        });

        setVideos(filtered);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [query, sortBy, uploadDate]);

  const getThumbnailUrl = (link) => {
    if (!link) return 'https://placehold.co/600x400?text=No+Thumbnail';
    if (link.includes('objectstorage') && link.endsWith('.mp4')) {
      return link.replace('.mp4', '-thumbnail.jpg');
    }
    return link;
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'black', color: 'white' }}>
      <Header />
      <Box
        sx={{ padding: '100px 40px 40px', maxWidth: '1600px', margin: 'auto' }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
          }}
        >
          <Typography variant="h4">
            {query ? `Search Results for "${query}"` : 'Search'}
          </Typography>
          <Button
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ color: 'white', borderColor: 'white' }}
            variant="outlined"
          >
            Filters
          </Button>
        </Box>

        {showFilters && (
          <Paper sx={{ p: 3, mb: 4, bgcolor: '#1e1e1e', borderRadius: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl
                  fullWidth
                  variant="filled"
                  sx={{ bgcolor: '#333', borderRadius: 1 }}
                >
                  <InputLabel sx={{ color: '#aaa' }}>Upload Date</InputLabel>
                  <Select
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    sx={{ color: 'white' }}
                  >
                    <MenuItem value="any">Any time</MenuItem>
                    <MenuItem value="hour">Last hour</MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="week">This week</MenuItem>
                    <MenuItem value="month">This month</MenuItem>
                    <MenuItem value="year">This year</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl
                  fullWidth
                  variant="filled"
                  sx={{ bgcolor: '#333', borderRadius: 1 }}
                >
                  <InputLabel sx={{ color: '#aaa' }}>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    sx={{ color: 'white' }}
                  >
                    <MenuItem value="relevance">Relevance</MenuItem>
                    <MenuItem value="date_desc">Upload date (Latest)</MenuItem>
                    <MenuItem value="date_asc">Upload date (Oldest)</MenuItem>
                    <MenuItem value="views_desc">
                      View count (High to Low)
                    </MenuItem>
                    <MenuItem value="views_asc">
                      View count (Low to High)
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        )}

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
                      aspectRatio: '16/9',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      backgroundColor: '#202020',
                    }}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/600x400?text=Error';
                    }}
                  />
                  <Box sx={{ mt: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 'bold', lineHeight: 1.2, mb: 0.5 }}
                      noWrap
                    >
                      {video.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#aaa' }}>
                      {video.views} views •{' '}
                      {new Date(video.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
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
