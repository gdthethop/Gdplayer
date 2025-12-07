import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { useNavigate } from 'react-router-dom';

const HeroSection = ({ video }) => {
  const navigate = useNavigate();

  if (!video) {
    return (
      <Box
        sx={{
          height: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#141414',
        }}
      >
        <Typography variant="h5" color="white">
          Loading Featured Video...
        </Typography>
      </Box>
    );
  }

  // Helper to get thumbnail URL (reused logic or imported if possible, but simple enough to inline or assume full URL for now)
  // Assuming video.thumbnail is the URL or we need to process it. Based on thumbnails.js, it might need processing if it's an objectstorage link.
  // For safety, let's copy the helper or just use valid URL.
  // "https://res.cloudinary.com/..." or similar. existing code usage suggests direct usage or simple replace.
  const backgroundUrl =
    video.thumbnail &&
    video.thumbnail.includes('objectstorage') &&
    video.thumbnail.endsWith('.mp4')
      ? video.thumbnail.replace('.mp4', '-thumbnail.jpg')
      : video.thumbnail ||
        'https://assets.nflxext.com/ffe/siteui/vlv3/c38a2d52-138e-48a3-ab68-36787ece46b3/eeb03fc9-99bf-4188-84aa-23605eb75bc7/IN-en-20240101-popsignuptwoweeks-perspective_alpha_website_large.jpg';

  const handlePlay = () => {
    if (video.shortCode) {
      navigate(`/video/${encodeURIComponent(video.shortCode)}`);
    } else {
      navigate(`/video/${encodeURIComponent(video._id)}`);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: '80vh', // Occupy significant screen height
        width: '100%',
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to top, #141414, transparent 50%)', // Fade to black at bottom
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 10,
          paddingLeft: { xs: '20px', md: '60px' },
          maxWidth: '600px',
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '3rem', md: '5rem' },
            fontWeight: 900,
            marginBottom: '1rem',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            color: 'white',
          }}
        >
          {video.title}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            marginBottom: '2rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            fontSize: { xs: '1rem', md: '1.2rem' },
            color: 'white',
          }}
        >
          {video.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: '1rem' }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PlayArrowIcon />}
            onClick={handlePlay}
            sx={{
              backgroundColor: 'white',
              color: 'black',
              fontSize: '1.2rem',
              padding: '0.8rem 2rem',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.75)' },
            }}
          >
            Play
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<InfoOutlinedIcon />}
            sx={{
              backgroundColor: 'rgba(109, 109, 110, 0.7)',
              color: 'white',
              fontSize: '1.2rem',
              padding: '0.8rem 2rem',
              '&:hover': { backgroundColor: 'rgba(109, 109, 110, 0.4)' },
            }}
          >
            More Info
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default HeroSection;
