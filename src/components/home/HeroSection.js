import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const HeroSection = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        height: '80vh', // Occupy significant screen height
        width: '100%',
        backgroundImage:
          'url(https://assets.nflxext.com/ffe/siteui/vlv3/c38a2d52-138e-48a3-ab68-36787ece46b3/eeb03fc9-99bf-4188-84aa-23605eb75bc7/IN-en-20240101-popsignuptwoweeks-perspective_alpha_website_large.jpg)', // Placeholder Netflix-like background
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
          }}
        >
          Featured Title
        </Typography>
        <Typography
          variant="h5"
          sx={{
            marginBottom: '2rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            fontSize: { xs: '1rem', md: '1.2rem' },
          }}
        >
          This is a brief description of the featured movie or show. It captures
          the user's attention and encourages them to watch.
        </Typography>
        <Box sx={{ display: 'flex', gap: '1rem' }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PlayArrowIcon />}
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
