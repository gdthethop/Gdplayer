import React, { useState } from 'react';
import {
  Box,
  Typography,
  Slider,
  IconButton,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import PictureInPictureAltIcon from '@mui/icons-material/PictureInPictureAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SpeedIcon from '@mui/icons-material/Speed';
import Replay10Icon from '@mui/icons-material/Replay10';
import Forward10Icon from '@mui/icons-material/Forward10';
import ClosedCaptionIcon from '@mui/icons-material/ClosedCaption';
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
  onPip,
  isPip,
  playbackRate,
  onPlaybackRateChange,
  onSkipForward,
  onSkipBackward,
}) => {
  // Settings Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuView, setMenuView] = useState('main'); // 'main', 'speed'

  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuView('main');
  };

  const handleClose = () => {
    setAnchorEl(null);
    setMenuView('main');
  };

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

  const handleSpeedChange = (rate) => {
    onPlaybackRateChange(rate);
    handleClose();
  };

  const renderSettingsMenu = () => {
    const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

    if (menuView === 'main') {
      return (
        <Box sx={{ width: 200 }}>
          <MenuItem onClick={() => setMenuView('speed')}>
            <ListItemIcon>
              <SpeedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="Playback Speed"
              secondary={playbackRate === 1 ? 'Normal' : `${playbackRate}x`}
            />
            <Typography variant="body2" color="text.secondary">
              {'>'}
            </Typography>
          </MenuItem>
          {/* Quality placeholder */}
          <MenuItem disabled>
            <ListItemText primary="Quality" secondary="Auto (1080p)" />
          </MenuItem>
        </Box>
      );
    }

    if (menuView === 'speed') {
      return (
        <Box sx={{ width: 200, maxHeight: 300, overflowY: 'auto' }}>
          <MenuItem onClick={() => setMenuView('main')}>
            <ListItemIcon>
              <ArrowBackIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Back" />
          </MenuItem>
          {speeds.map((rate) => (
            <MenuItem key={rate} onClick={() => handleSpeedChange(rate)}>
              <ListItemIcon>
                {playbackRate === rate && <CheckIcon fontSize="small" />}
              </ListItemIcon>
              <ListItemText primary={rate === 1 ? 'Normal' : `${rate}x`} />
            </MenuItem>
          ))}
        </Box>
      );
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: isPlaying ? 'transparent' : 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        opacity: showControls || !isPlaying || Boolean(anchorEl) ? 1 : 0,
        transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents:
          showControls || !isPlaying || Boolean(anchorEl) ? 'auto' : 'none',
      }}
    >
      {/* Top Controls (Settings & CC) */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 15, sm: 20 },
          right: { xs: 15, sm: 20 },
          display: 'flex',
          gap: 1.5,
        }}
      >
        <IconButton
          sx={{
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
          }}
        >
          <ClosedCaptionIcon
            sx={{ fontSize: { xs: 24, sm: 26 }, opacity: 0.8 }}
          />
        </IconButton>
        <IconButton
          onClick={handleSettingsClick}
          sx={{
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
          }}
        >
          <SettingsIcon sx={{ fontSize: { xs: 24, sm: 26 } }} />
        </IconButton>
      </Box>

      {/* Center Controls (Skip/Play/Skip) */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <IconButton
          onClick={onSkipBackward}
          sx={{
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            width: { xs: 45, sm: 60 },
            height: { xs: 45, sm: 60 },
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s',
          }}
        >
          <Replay10Icon sx={{ fontSize: { xs: 30, sm: 38 } }} />
        </IconButton>

        <Box
          onClick={onPlayPause}
          sx={{
            width: { xs: 80, sm: 100 },
            height: { xs: 80, sm: 100 },
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              transform: 'scale(1.08)',
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
          }}
        >
          {isPlaying ? (
            <PauseIcon sx={{ color: 'white', fontSize: { xs: 45, sm: 55 } }} />
          ) : (
            <img
              src={process.env.PUBLIC_URL + '/logo.png'}
              alt="Play"
              style={{
                width: '35%',
                height: 'auto',
                marginLeft: '2px', // Fine-tuned for the smaller size
                opacity: 0.9, // Subtle transparency for premium feel
              }}
            />
          )}
        </Box>

        <IconButton
          onClick={onSkipForward}
          sx={{
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(10px)',
            width: { xs: 45, sm: 60 },
            height: { xs: 45, sm: 60 },
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s',
          }}
        >
          <Forward10Icon sx={{ fontSize: { xs: 30, sm: 38 } }} />
        </IconButton>
      </Box>

      {/* Floating Bottom Info (Time & Fullscreen) */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 30, sm: 40 },
          left: { xs: 15, sm: 25 },
          right: { xs: 15, sm: 25 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Time Display Pill */}
        <Box
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            padding: '6px 16px',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography
            sx={{
              color: 'white',
              fontSize: { xs: '13px', sm: '15px' },
              fontWeight: 600,
              letterSpacing: '0.5px',
            }}
          >
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>
        </Box>

        {/* Fullscreen Icon Circle */}
        <IconButton
          onClick={onFullscreen}
          sx={{
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '50%',
            padding: { xs: '10px', sm: '12px' },
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              transform: 'scale(1.1)',
            },
            transition: 'all 0.2s',
          }}
        >
          {isFullscreen ? (
            <FullscreenExitIcon sx={{ fontSize: { xs: 26, sm: 30 } }} />
          ) : (
            <FullscreenIcon sx={{ fontSize: { xs: 26, sm: 30 } }} />
          )}
        </IconButton>
      </Box>

      {/* Absolute Bottom Seek Bar */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '0 10px',
          height: '24px',
          display: 'flex',
          alignItems: 'flex-end',
        }}
      >
        <Slider
          size="small"
          value={currentTime}
          min={0}
          max={duration || 100}
          onChange={onSeek}
          onChangeCommitted={onSeekMouseUp}
          onMouseDown={onSeekMouseDown}
          sx={{
            color: '#ff0000',
            height: 3,
            padding: '10px 0',
            '& .MuiSlider-thumb': {
              width: 14,
              height: 14,
              transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
              '&:before': {
                boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
              },
              '&:hover, &.Mui-focusVisible': {
                boxShadow: `0px 0px 0px 8px ${'rgb(255 0 0 / 16%)'}`,
              },
              '&.Mui-active': {
                width: 18,
                height: 18,
              },
            },
            '& .MuiSlider-rail': {
              opacity: 0.2,
              color: '#fff',
            },
            '& .MuiSlider-track': {
              border: 'none',
              height: 3,
            },
          }}
        />
      </Box>

      {/* Settings Menu Popover */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(28, 28, 28, 0.95)',
            color: 'white',
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        {renderSettingsMenu()}
      </Menu>
    </Box>
  );
};

export default CustomControls;
