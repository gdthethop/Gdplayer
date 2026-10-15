import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeDownRoundedIcon from '@mui/icons-material/VolumeDownRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';
import PictureInPictureAltRoundedIcon from '@mui/icons-material/PictureInPictureAltRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SubtitlesOutlinedIcon from '@mui/icons-material/SubtitlesOutlined';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import SlowMotionVideoRoundedIcon from '@mui/icons-material/SlowMotionVideoRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import Replay10RoundedIcon from '@mui/icons-material/Replay10Rounded';
import Forward10RoundedIcon from '@mui/icons-material/Forward10Rounded';

/**
 * YouTube-style player chrome.
 *
 * Layout (desktop):
 *   ┌──────────────────────────────────────────────┐
 *   │                                              │
 *   │              (bezel flash on toggle)         │
 *   │▁▁▁▁▁▁▁▁▁▁▁▁▁ bottom gradient ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁│
 *   │━━━━━━━━━●───────────────────── progress bar  │
 *   │ ▶  🔊━━  0:03 / 1:31           CC ⚙ ⧉ ⛶      │
 *   └──────────────────────────────────────────────┘
 * Mobile adds YouTube-mobile style centre controls (‑10 / play / +10).
 */

const RED = '#ff0000';

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  const m = Math.floor((seconds / 60) % 60);
  const h = Math.floor(seconds / 3600);
  return h ? `${h}:${m.toString().padStart(2, '0')}:${s}` : `${m}:${s}`;
};

// Plain, background-less control button (YouTube style)
const CtrlButton = ({ title, onClick, children, sx, ...rest }) => (
  <Tooltip
    title={title}
    placement="top"
    disableInteractive
    slotProps={{
      tooltip: {
        sx: {
          bgcolor: 'rgba(28,28,28,0.9)',
          fontSize: 12,
          fontWeight: 500,
          px: 1,
          py: 0.5,
          borderRadius: '4px',
        },
      },
    }}
  >
    <IconButton
      onClick={onClick}
      aria-label={title}
      disableRipple
      sx={{
        color: '#fff',
        width: { xs: 40, sm: 48 },
        height: { xs: 40, sm: 48 },
        borderRadius: '50%',
        opacity: 0.92,
        transition: 'opacity .1s, background-color .15s',
        '&:hover': { opacity: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
        '& svg': {
          fontSize: { xs: 24, sm: 28 },
          filter: 'drop-shadow(0 0 2px rgba(0,0,0,.5))',
        },
        ...sx,
      }}
      {...rest}
    >
      {children}
    </IconButton>
  </Tooltip>
);

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
  bufferProgress = 0,
  hlsQualityLevels = [],
  currentHlsLevel = -1,
  onQualityChange,
}) => {
  // ── Settings menu ──────────────────────────────────────────
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuView, setMenuView] = useState('main'); // 'main' | 'speed' | 'quality'
  const menuOpen = Boolean(anchorEl);

  const openSettings = (e) => {
    setAnchorEl(e.currentTarget);
    setMenuView('main');
  };
  const closeSettings = () => {
    setAnchorEl(null);
    setMenuView('main');
  };

  // ── Progress bar (custom, for YouTube look + hover preview) ─
  const barRef = useRef(null);
  const [hover, setHover] = useState(null); // { pct, time }
  const [dragging, setDragging] = useState(false);

  const timeAt = (clientX) => {
    const rect = barRef.current.getBoundingClientRect();
    const pct = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    return { pct, time: pct * (duration || 0) };
  };
  const onBarPointerDown = (e) => {
    if (!duration) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    onSeekMouseDown?.();
    const { time } = timeAt(e.clientX);
    onSeek?.(e, time);
  };
  const onBarPointerMove = (e) => {
    if (!duration) return;
    const h = timeAt(e.clientX);
    setHover(h);
    if (dragging) onSeek?.(e, h.time);
  };
  const onBarPointerUp = (e) => {
    if (!dragging) return;
    setDragging(false);
    onSeekMouseUp?.(e, timeAt(e.clientX).time);
  };

  // ── Centre "bezel" flash when play state toggles ──────────
  const [bezel, setBezel] = useState(null); // { type: 'play' | 'pause', id }
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return undefined;
    }
    setBezel((prev) => ({
      type: isPlaying ? 'play' : 'pause',
      id: (prev?.id || 0) + 1,
    }));
    const t = setTimeout(
      () => setBezel((b) => (b ? { ...b, done: true } : b)),
      500
    );
    return () => clearTimeout(t);
  }, [isPlaying]);

  // ── Volume slider expands on hover (like YouTube) ─────────
  const [volHover, setVolHover] = useState(false);
  const volRef = useRef(null);
  const setVolFromPointer = (clientX) => {
    const rect = volRef.current.getBoundingClientRect();
    const v = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    onVolumeChange?.(null, v);
  };
  const effectiveVolume = isMuted ? 0 : volume;
  const VolumeIcon =
    effectiveVolume === 0
      ? VolumeOffRoundedIcon
      : effectiveVolume < 0.5
        ? VolumeDownRoundedIcon
        : VolumeUpRoundedIcon;

  // ── Derived ───────────────────────────────────────────────
  const visible = showControls || !isPlaying || menuOpen || dragging;
  const playedPct = duration
    ? Math.min((currentTime / duration) * 100, 100)
    : 0;
  const activeLevel = hlsQualityLevels.find((l) => l.index === currentHlsLevel);
  const qualityLabel =
    currentHlsLevel === -1 || !activeLevel ? 'Auto' : activeLevel.name;
  const maxHeight = hlsQualityLevels.reduce(
    (m, l) => Math.max(m, Math.min(l.width || 0, l.height || 0)),
    0
  );
  const isHD = maxHeight >= 720;
  const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // ── Settings menu content ─────────────────────────────────
  const menuRow = (icon, label, value, onClick) => (
    <MenuItem onClick={onClick} sx={menuItemSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
        {icon}
        <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{label}</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: 'rgba(255,255,255,.8)',
        }}
      >
        <Typography sx={{ fontSize: 13 }}>{value}</Typography>
        <ChevronRightRoundedIcon sx={{ fontSize: 22 }} />
      </Box>
    </MenuItem>
  );

  const subHeader = (label) => (
    <MenuItem
      onClick={() => setMenuView('main')}
      sx={{
        ...menuItemSx,
        borderBottom: '1px solid rgba(255,255,255,.12)',
        mb: 0.5,
      }}
    >
      <ChevronLeftRoundedIcon sx={{ fontSize: 22, mr: 1 }} />
      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{label}</Typography>
    </MenuItem>
  );

  const optionRow = (key, label, selected, onClick, hint) => (
    <MenuItem key={key} onClick={onClick} sx={menuItemSx}>
      <Box sx={{ width: 28, display: 'flex' }}>
        {selected && <CheckRoundedIcon sx={{ fontSize: 20 }} />}
      </Box>
      <Typography sx={{ fontSize: 14, flex: 1 }}>{label}</Typography>
      {hint && (
        <Typography
          sx={{ fontSize: 12, color: 'rgba(255,255,255,.55)', ml: 2 }}
        >
          {hint}
        </Typography>
      )}
    </MenuItem>
  );

  const renderSettingsMenu = () => {
    if (menuView === 'speed') {
      return [
        subHeader('Playback speed'),
        ...speeds.map((rate) =>
          optionRow(
            rate,
            rate === 1 ? 'Normal' : String(rate),
            playbackRate === rate,
            () => {
              onPlaybackRateChange(rate);
              closeSettings();
            }
          )
        ),
      ];
    }
    if (menuView === 'quality') {
      return [
        subHeader('Quality'),
        ...[...hlsQualityLevels].reverse().map((level) =>
          optionRow(
            level.index,
            <>
              {level.name}
              {Math.min(level.width || 0, level.height || 0) >= 720 && (
                <Box
                  component="sup"
                  sx={{ color: RED, fontSize: 10, fontWeight: 700, ml: 0.5 }}
                >
                  HD
                </Box>
              )}
            </>,
            currentHlsLevel === level.index,
            () => {
              onQualityChange?.(level.index);
              closeSettings();
            }
          )
        ),
        optionRow(
          'auto',
          'Auto',
          currentHlsLevel === -1,
          () => {
            onQualityChange?.(-1);
            closeSettings();
          },
          activeLevel && currentHlsLevel === -1 ? activeLevel.name : undefined
        ),
      ];
    }
    return [
      <React.Fragment key="speed">
        {menuRow(
          <SlowMotionVideoRoundedIcon sx={{ fontSize: 22 }} />,
          'Playback speed',
          playbackRate === 1 ? 'Normal' : playbackRate,
          () => setMenuView('speed')
        )}
      </React.Fragment>,
      <React.Fragment key="quality">
        {menuRow(
          <TuneRoundedIcon sx={{ fontSize: 22 }} />,
          'Quality',
          hlsQualityLevels.length ? qualityLabel : 'Auto',
          () => hlsQualityLevels.length && setMenuView('quality')
        )}
      </React.Fragment>,
    ];
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        pointerEvents: 'none', // only the bars below receive input; clicks fall through to <video>
        '& .gd-chrome': {
          opacity: visible ? 1 : 0,
          transition: visible
            ? 'opacity .1s'
            : 'opacity .5s cubic-bezier(0.4,0,0.2,1)',
        },
      }}
    >
      {/* ── Centre bezel (desktop) ── */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 52,
          height: 52,
          ml: '-26px',
          mt: '-26px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0,0,0,.5)',
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
          ...(bezel && { animation: 'gdBezel .5s linear 1 normal forwards' }),
          '@keyframes gdBezel': {
            '0%': { opacity: 1, transform: 'scale(1)' },
            '100%': { opacity: 0, transform: 'scale(2)' },
          },
          '& svg': { fontSize: 34, color: '#fff' },
        }}
        key={bezel ? `bezel-${bezel.id}` : 'idle'}
      >
        {bezel?.type === 'pause' ? (
          <PauseRoundedIcon />
        ) : (
          <PlayArrowRoundedIcon />
        )}
      </Box>

      {/* ── Centre controls (mobile, YouTube-mobile style) ── */}
      <Box
        className="gd-chrome"
        sx={{
          position: 'absolute',
          inset: 0,
          display: { xs: 'flex', sm: 'none' },
          alignItems: 'center',
          justifyContent: 'center',
          gap: 5,
          backgroundColor: 'rgba(0,0,0,.35)',
          pointerEvents: visible ? 'auto' : 'none',
        }}
        onClick={(e) => e.target === e.currentTarget && onPlayPause()}
      >
        {[
          {
            key: 'back',
            onClick: onSkipBackward,
            icon: <Replay10RoundedIcon />,
            size: 44,
          },
          {
            key: 'play',
            onClick: onPlayPause,
            icon: isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />,
            size: 60,
          },
          {
            key: 'fwd',
            onClick: onSkipForward,
            icon: <Forward10RoundedIcon />,
            size: 44,
          },
        ].map((b) => (
          <IconButton
            key={b.key}
            onClick={b.onClick}
            disableRipple
            sx={{
              width: b.size,
              height: b.size,
              color: '#fff',
              backgroundColor: 'rgba(0,0,0,.45)',
              '& svg': { fontSize: b.size * 0.6 },
            }}
          >
            {b.icon}
          </IconButton>
        ))}
      </Box>

      {/* ── Bottom gradient ── */}
      <Box
        className="gd-chrome"
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: { xs: 90, sm: 140 },
          background:
            'linear-gradient(to top, rgba(0,0,0,.75) 0%, rgba(0,0,0,.45) 45%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Bottom chrome: progress + control row ── */}
      <Box
        className="gd-chrome"
        sx={{
          position: 'absolute',
          left: { xs: 8, sm: 12 },
          right: { xs: 8, sm: 12 },
          bottom: 0,
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        {/* Progress bar */}
        <Box
          ref={barRef}
          onPointerDown={onBarPointerDown}
          onPointerMove={onBarPointerMove}
          onPointerUp={onBarPointerUp}
          onPointerLeave={() => !dragging && setHover(null)}
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration || 0)}
          aria-valuenow={Math.round(currentTime || 0)}
          sx={{
            position: 'relative',
            height: 16,
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            touchAction: 'none',
            '&:hover .gd-track, &.dragging .gd-track': {
              transform: 'scaleY(1.67)',
            },
            '&:hover .gd-thumb, &.dragging .gd-thumb': {
              transform: 'translate(-50%,-50%) scale(1)',
            },
          }}
          className={dragging ? 'dragging' : undefined}
        >
          <Box
            className="gd-track"
            sx={{
              position: 'relative',
              width: '100%',
              height: 3,
              backgroundColor: 'rgba(255,255,255,.2)',
              transition: 'transform .1s cubic-bezier(0.4,0,1,1)',
            }}
          >
            {/* buffered */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                width: `${bufferProgress}%`,
                backgroundColor: 'rgba(255,255,255,.4)',
              }}
            />
            {/* hover preview fill */}
            {hover && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: `${hover.pct * 100}%`,
                  backgroundColor: 'rgba(255,255,255,.5)',
                }}
              />
            )}
            {/* played */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                width: `${playedPct}%`,
                backgroundColor: RED,
              }}
            />
          </Box>
          {/* scrubber thumb */}
          <Box
            className="gd-thumb"
            sx={{
              position: 'absolute',
              top: '50%',
              left: `${playedPct}%`,
              width: 13,
              height: 13,
              borderRadius: '50%',
              backgroundColor: RED,
              transform: 'translate(-50%,-50%) scale(0)',
              transition: 'transform .1s cubic-bezier(0.4,0,1,1)',
              pointerEvents: 'none',
            }}
          />
          {/* hover time tooltip */}
          {hover && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 22,
                left: `clamp(24px, ${hover.pct * 100}%, calc(100% - 24px))`,
                transform: 'translateX(-50%)',
                px: 1,
                py: 0.25,
                borderRadius: '4px',
                backgroundColor: 'rgba(28,28,28,.9)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 500,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {formatTime(hover.time)}
            </Box>
          )}
        </Box>

        {/* Control row */}
        <Box
          sx={{
            height: { xs: 40, sm: 48 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: { xs: 0.5, sm: 0.5 },
          }}
        >
          {/* Left cluster */}
          <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
            <CtrlButton
              title={isPlaying ? 'Pause (k)' : 'Play (k)'}
              onClick={onPlayPause}
            >
              {isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
            </CtrlButton>

            <Box
              onMouseEnter={() => setVolHover(true)}
              onMouseLeave={() => setVolHover(false)}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <CtrlButton
                title={isMuted ? 'Unmute (m)' : 'Mute (m)'}
                onClick={onMute}
              >
                <VolumeIcon />
              </CtrlButton>
              {/* expanding volume slider (desktop) */}
              <Box
                sx={{
                  width: volHover ? 60 : 0,
                  overflow: 'hidden',
                  transition: 'width .2s cubic-bezier(0.4,0,1,1)',
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  height: 40,
                }}
              >
                <Box
                  ref={volRef}
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setVolFromPointer(e.clientX);
                  }}
                  onPointerMove={(e) =>
                    e.buttons === 1 && setVolFromPointer(e.clientX)
                  }
                  role="slider"
                  aria-label="Volume"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(effectiveVolume * 100)}
                  sx={{
                    position: 'relative',
                    width: 52,
                    height: 40,
                    mx: '4px',
                    cursor: 'pointer',
                    touchAction: 'none',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: 0,
                      right: 0,
                      height: 3,
                      mt: '-1.5px',
                      backgroundColor: 'rgba(255,255,255,.2)',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: 0,
                      width: `${effectiveVolume * 100}%`,
                      height: 3,
                      mt: '-1.5px',
                      backgroundColor: '#fff',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: `${effectiveVolume * 100}%`,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      transform: 'translate(-50%,-50%)',
                    }}
                  />
                </Box>
              </Box>
            </Box>

            <Typography
              sx={{
                color: '#fff',
                fontSize: { xs: 12, sm: 13 },
                fontWeight: 500,
                ml: { xs: 0.5, sm: 1 },
                whiteSpace: 'nowrap',
                textShadow: '0 0 2px rgba(0,0,0,.5)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatTime(currentTime)}
              <Box component="span" sx={{ opacity: 0.7 }}>
                {' / '}
                {formatTime(duration)}
              </Box>
            </Typography>
          </Box>

          {/* Right cluster */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CtrlButton
              title="Subtitles"
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              <SubtitlesOutlinedIcon />
            </CtrlButton>

            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CtrlButton title="Settings" onClick={openSettings}>
                <SettingsOutlinedIcon
                  sx={{
                    transition: 'transform .25s',
                    transform: menuOpen ? 'rotate(30deg)' : 'none',
                  }}
                />
              </CtrlButton>
              {isHD && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: { xs: 7, sm: 9 },
                    right: { xs: 4, sm: 6 },
                    px: '3px',
                    borderRadius: '2px',
                    backgroundColor: RED,
                    color: '#fff',
                    fontSize: 8,
                    fontWeight: 700,
                    lineHeight: '11px',
                    pointerEvents: 'none',
                  }}
                >
                  HD
                </Box>
              )}
            </Box>

            <CtrlButton
              title={isPip ? 'Exit miniplayer' : 'Miniplayer'}
              onClick={onPip}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              <PictureInPictureAltRoundedIcon />
            </CtrlButton>

            <CtrlButton
              title={isFullscreen ? 'Exit full screen (f)' : 'Full screen (f)'}
              onClick={onFullscreen}
            >
              {isFullscreen ? (
                <FullscreenExitRoundedIcon />
              ) : (
                <FullscreenRoundedIcon />
              )}
            </CtrlButton>
          </Box>
        </Box>
      </Box>

      {/* ── Settings panel ── */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={closeSettings}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        disablePortal={isFullscreen} // keep menu visible inside the fullscreen element
        MenuListProps={{ sx: { py: 1 } }}
        slotProps={{
          paper: {
            sx: {
              mt: -1,
              minWidth: 250,
              maxHeight: 360,
              backgroundColor: 'rgba(28,28,28,.92)',
              backdropFilter: 'blur(8px)',
              color: '#fff',
              borderRadius: '12px',
              boxShadow: '0 4px 32px rgba(0,0,0,.4)',
            },
          },
        }}
      >
        {renderSettingsMenu()}
      </Menu>
    </Box>
  );
};

const menuItemSx = {
  minHeight: 40,
  px: 2,
  '&:hover': { backgroundColor: 'rgba(255,255,255,.1)' },
};

export default CustomControls;
