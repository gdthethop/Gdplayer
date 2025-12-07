import React from 'react';
import { Box, Typography, Slider, IconButton, Stack } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { styled } from '@mui/material/styles';

const TinyText = styled(Typography)({
  fontSize: '0.75rem',
  opacity: 0.38,
  fontWeight: 500,
  letterSpacing: 0.2,
  color: '#fff',
});

const CustomControls = ({
  onPlayPause,
  isPlaying,
  onSeek,
  onSeekMouseUp,
  onSeekMouseDown,
  currentTime,
  duration,
  onVolumeChange,
  onMute,
  volume,
  isMuted,
  onFullscreen,
  isFullscreen,
  showControls,
}) => {
  // Format time helper
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // Slight overlay
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 10,
        opacity: showControls || !isPlaying ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        pointerEvents: showControls || !isPlaying ? 'auto' : 'none',
      }}
    >
      {/* Center Play Button (Logo) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        }}
        onClick={onPlayPause}
      >
        {!isPlaying && (
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '2px solid white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                transform: 'scale(1.1)',
                transition: 'all 0.2s',
              },
            }}
          >
            <img
              src={process.env.PUBLIC_URL + '/logo.png'}
              alt="Play"
              style={{ width: '40px', height: 'auto' }}
            />
          </Box>
        )}
      </Box>

      {/* Bottom Controls Bar */}
      <Box
        sx={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
          padding: '10px 20px',
        }}
        onClick={(e) => e.stopPropagation()} // Prevent clicking bar from pausing
      >
        {/* Progress Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
          <Slider
            size="small"
            value={currentTime}
            min={0}
            max={duration || 100} // Avoid 0 max
            onChange={onSeek}
            onChangeCommitted={onSeekMouseUp}
            onMouseDown={onSeekMouseDown}
            sx={{
              color: '#ff0000', // YouTube red
              height: 4,
              '& .MuiSlider-thumb': {
                width: 12, // Initially smaller thumb like YouTube
                height: 12,
                transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                '&:before': {
                  boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
                },
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: `0px 0px 0px 8px ${'rgb(255 255 255 / 16%)'}`,
                  width: 20, // Grow on hover
                  height: 20,
                },
                '&.Mui-active': {
                  width: 20,
                  height: 20,
                },
              },
              '& .MuiSlider-rail': {
                opacity: 0.28,
                color: '#bfbfbf',
              },
            }}
          />
        </Box>

        {/* Controls Row */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={onPlayPause} sx={{ color: 'white' }}>
              {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>

            <IconButton onClick={onMute} sx={{ color: 'white' }}>
              {isMuted || volume === 0 ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>

            <Slider
              size="small"
              value={isMuted ? 0 : volume}
              min={0}
              max={1}
              step={0.1}
              onChange={onVolumeChange}
              sx={{
                width: 80,
                color: 'white',
                '& .MuiSlider-track': { border: 'none' },
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                  backgroundColor: '#fff',
                  '&:before': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
                  },
                  '&:hover, &.Mui-focusVisible, &.Mui-active': {
                    boxShadow: 'none',
                  },
                },
              }}
            />

            <Typography sx={{ color: 'white', fontSize: '14px', ml: 2 }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center">
            <IconButton onClick={onFullscreen} sx={{ color: 'white' }}>
              {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default CustomControls;
