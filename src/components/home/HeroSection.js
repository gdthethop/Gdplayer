import React, { useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { useNavigate } from 'react-router-dom';

const HeroSection = ({ video }) => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(true);

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
        <div className="loading-spinner"></div> {/* Could add a spinner here */}
      </Box>
    );
  }

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

  const getTitleFontSize = (title) => {
    const length = title ? title.length : 0;
    if (length < 10) return { xs: '3rem', md: '5rem', lg: '7rem' };
    if (length < 20) return { xs: '3rem', md: '5rem', lg: '6rem' };
    if (length < 40) return { xs: '2.5rem', md: '4rem', lg: '5rem' };
    return { xs: '2rem', md: '3rem', lg: '4rem' };
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: '95vh', // Slightly taller
        width: '100%',
        overflow: 'hidden',
        color: 'white',
      }}
    >
      {/* Background Image with Slow Zoom */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${backgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'slowZoom 40s ease-in-out infinite alternate',
          transformOrigin: 'center center',
          zIndex: 0,
        }}
      />

      {/* Vignette / Gradients */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%),
            linear-gradient(to top, #141414 0%, transparent 40%)
          `,
          zIndex: 1,
        }}
      />

      {/* Content Container */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 10,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingLeft: { xs: '4%', md: '60px' },
          width: { xs: '100%', md: '62%' },
          maxWidth: '900px',
          paddingTop: '60px', // Offset header
        }}
      >
        <Box sx={{ animation: 'fadeInUp 1s ease-out' }}>
          {/* Title */}
          <Typography
            variant="h1"
            sx={{
              fontSize: getTitleFontSize(video.title),
              fontWeight: 900,
              marginBottom: '1rem',
              lineHeight: 1,
              textTransform: 'uppercase', // Optional, depends on style
              textShadow: '2px 4px 6px rgba(0,0,0,0.5)',
              fontFamily: '"Outfit", sans-serif',
              letterSpacing: '-2px',
            }}
          >
            {video.title}
          </Typography>

          {/* Meta Info (Optional: "New", "2024", "HD") */}
          {/* <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
             <Typography sx={{ color: '#46d369', fontWeight: 'bold' }}>98% Match</Typography>
             <Typography>2024</Typography>
          </Box> */}

          {/* Description */}
          <Typography
            variant="h5"
            sx={{
              fontSize: { xs: '1rem', md: '1.25rem' },
              fontWeight: 500,
              marginBottom: '2rem',
              color: '#e5e5e5',
              textShadow: '1px 2px 3px rgba(0,0,0,0.8)',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              maxWidth: '700px',
              fontFamily: '"Outfit", sans-serif',
              lineHeight: 1.5,
            }}
          >
            {video.description}
          </Typography>

          {/* Buttons */}
          <Box sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon sx={{ fontSize: '2rem !important' }} />}
              onClick={handlePlay}
              sx={{
                backgroundColor: 'white',
                color: 'black',
                fontSize: { xs: '1rem', md: '1.2rem' },
                fontWeight: 'bold',
                padding: '0.8rem 2.4rem',
                textTransform: 'none',
                borderRadius: '4px',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.75)',
                  transform: 'scale(1.05)',
                },
              }}
            >
              Play
            </Button>

            <Button
              variant="contained"
              startIcon={
                <InfoOutlinedIcon sx={{ fontSize: '2rem !important' }} />
              }
              sx={{
                backgroundColor: 'rgba(109, 109, 110, 0.7)',
                color: 'white',
                fontSize: { xs: '1rem', md: '1.2rem' },
                fontWeight: 'bold',
                padding: '0.8rem 2.4rem',
                textTransform: 'none',
                borderRadius: '4px',
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: 'rgba(109, 109, 110, 0.4)',
                  transform: 'scale(1.05)',
                },
              }}
            >
              More Info
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Dynamic Mute/Replay controls could go here on the right */}
      {/* <Box sx={{ position: 'absolute', right: 0, bottom: '35%', zIndex: 20, display: 'flex', alignItems: 'center' }}>
            <div style={{ height: '40px', background: 'rgba(51,51,51,.6)', borderLeft: '3px solid #dcdcdc', paddingLeft: '10px' }}>
                <Typography variant="caption" sx={{ color: 'white' }}>18+</Typography>
            </div>
        </Box> */}
    </Box>
  );
};

export default HeroSection;
