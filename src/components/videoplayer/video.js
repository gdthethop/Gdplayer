import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchVideoDetails,
  fetchVideoDetailsByShortCode,
  updateVideoViewsById,
  updateVideoViewsByShortCode,
  updateVideoLikes,
  incrementVideoLikes,
  decrementVideoLikes,
  incrementVideoDislikes,
  decrementVideoDislikes,
} from '../../redux/videoSlice';
import { Box, Typography, Button, Grid } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ShareIcon from '@mui/icons-material/Share';
import Header from '../header/header';
import CommentSection from '../comment/comment';
import Recommendation from '../recomendations/recomendation';
import { useParams, useLocation } from 'react-router-dom';
import Hls from 'hls.js';

import CustomControls from './CustomControls';

const VideoPlayer = () => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const videoContainerRef = useRef(null); // Ref for fullscreen
  const { shortCode } = useParams();
  const location = useLocation();

  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);

  // Custom Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false); // Start unmuted
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  // Extract videoId from URL query params if available
  const getQueryParam = (param) =>
    new URLSearchParams(location.search).get(param);
  const videoIdFromQuery = getQueryParam('videoId');

  const {
    videoUrl,
    videoTitle,
    videoDescription,
    videoViews,
    videoLikes,
    videoDislikes,
    videoId,
    status,
    error,
    isUpdatingLikes,
    isUpdatingDislikes,
  } = useSelector((state) => state.video);

  // Helper to convert Cloudinary embed URL to direct MP4 URL
  const getDirectVideoUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('https://player.cloudinary.com/embed/')) {
      try {
        const urlObj = new URL(url);
        const publicId = urlObj.searchParams.get('public_id');
        const cloudName = urlObj.searchParams.get('cloud_name');
        if (publicId && cloudName) {
          return `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}.mp4`;
        }
      } catch (e) {
        console.error('Error parsing Cloudinary URL:', e);
      }
    }
    return url;
  };

  const processedVideoUrl = getDirectVideoUrl(videoUrl);

  // --- Handlers ---
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    // formatting issue if seeking, don't update
    if (!isSeeking && videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setVolume(videoRef.current.volume);
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleSeek = (e, newValue) => {
    setCurrentTime(newValue);
  };

  const handleSeekMouseDown = () => {
    setIsSeeking(true);
  };

  const handleSeekMouseUp = (e, newValue) => {
    setIsSeeking(false);
    if (videoRef.current) {
      videoRef.current.currentTime = newValue;
    }
  };

  const handleVolumeChange = (e, newValue) => {
    setVolume(newValue);
    if (videoRef.current) {
      videoRef.current.volume = newValue;
      videoRef.current.muted = newValue === 0;
      setIsMuted(newValue === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
      // If unmuting and volume was 0, set to default 1
      if (!videoRef.current.muted && volume === 0) {
        setVolume(1);
        videoRef.current.volume = 1;
      } else if (videoRef.current.muted) {
        setVolume(0);
      } else {
        setVolume(videoRef.current.volume);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
      } else if (videoContainerRef.current.webkitRequestFullscreen) {
        /* Safari */
        videoContainerRef.current.webkitRequestFullscreen();
      } else if (videoContainerRef.current.msRequestFullscreen) {
        /* IE11 */
        videoContainerRef.current.msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        /* Safari */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        /* IE11 */
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen change events (esc key)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange
      );
      document.removeEventListener(
        'mozfullscreenchange',
        handleFullscreenChange
      );
      document.removeEventListener(
        'msfullscreenchange',
        handleFullscreenChange
      );
    };
  }, []);

  // Sync state on load/update
  useEffect(() => {
    if (videoRef.current) {
      // Sync initial state if needed
      setIsMuted(videoRef.current.muted);
      // Auto play logic might start video, so check
      const checkPlay = () => {
        if (!videoRef.current.paused) setIsPlaying(true);
      };
      videoRef.current.addEventListener('play', () => setIsPlaying(true));
      videoRef.current.addEventListener('pause', () => setIsPlaying(false));
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('play', () =>
            setIsPlaying(true)
          );
          videoRef.current.removeEventListener('pause', () =>
            setIsPlaying(false)
          );
        }
      };
    }
  }, [processedVideoUrl]);

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (shortCode) {
      dispatch(fetchVideoDetailsByShortCode(shortCode));
      dispatch(updateVideoViewsByShortCode(shortCode));
    } else if (videoIdFromQuery) {
      dispatch(fetchVideoDetails(videoIdFromQuery));
      dispatch(updateVideoViewsById(videoIdFromQuery));
    } else {
      console.error('No valid video ID or shortCode provided.');
    }
  }, [dispatch, shortCode, videoIdFromQuery]);
  const getCurrentVideoId = () => shortCode || videoIdFromQuery || videoId;

  const handleLike = () => {
    if (!isUpdatingLikes) {
      if (hasLiked) {
        dispatch(decrementVideoLikes());
        setHasLiked(false);
      } else {
        dispatch(incrementVideoLikes());
        setHasLiked(true);
        if (hasDisliked) {
          dispatch(decrementVideoDislikes());
          setHasDisliked(false);
        }
      }
    }
  };

  const handleDislike = () => {
    if (!isUpdatingDislikes) {
      if (hasDisliked) {
        dispatch(decrementVideoDislikes());
        setHasDisliked(false);
      } else {
        dispatch(incrementVideoDislikes());
        setHasDisliked(true);
        if (hasLiked) {
          dispatch(decrementVideoLikes());
          setHasLiked(false);
        }
      }
    }
  };

  return (
    <Box
      sx={{ backgroundColor: '#0f0f0f', color: 'white', minHeight: '100vh' }}
    >
      <Header />
      <Box
        sx={{
          maxWidth: '1600px',
          margin: 'auto',
          paddingTop: '80px',
          paddingX: { xs: 2, md: 4 },
        }}
      >
        <Grid container spacing={3}>
          {/* Left Column: Video Player & Info */}
          <Grid item xs={12} lg={8.5}>
            {status === 'loading' ? (
              <Typography sx={{ fontSize: '18px', color: 'gray' }}>
                Loading video...
              </Typography>
            ) : error ? (
              <Typography sx={{ fontSize: '18px', color: 'red' }}>
                Error: {error}
              </Typography>
            ) : processedVideoUrl ? (
              <>
                {/* Video Player Container */}
                <Box
                  ref={videoContainerRef}
                  onMouseEnter={() => setShowControls(true)}
                  onMouseLeave={() => setShowControls(false)}
                  sx={{
                    width: '100%',
                    overflow: 'hidden',
                    backgroundColor: 'black',
                    aspectRatio: '16/9',
                    position: 'relative',
                  }}
                >
                  <>
                    <video
                      ref={videoRef}
                      onClick={togglePlay}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                      autoPlay
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    >
                      {!processedVideoUrl.includes('.m3u8') && (
                        <source src={processedVideoUrl} type="video/mp4" />
                      )}
                      Your browser does not support the video tag.
                    </video>

                    <CustomControls
                      onPlayPause={togglePlay}
                      isPlaying={isPlaying}
                      onSeek={handleSeek}
                      onSeekMouseUp={handleSeekMouseUp}
                      onSeekMouseDown={handleSeekMouseDown}
                      currentTime={currentTime}
                      duration={duration}
                      onVolumeChange={handleVolumeChange}
                      onMute={toggleMute}
                      volume={volume}
                      isMuted={isMuted}
                      onFullscreen={toggleFullscreen}
                      isFullscreen={isFullscreen}
                      showControls={showControls}
                    />
                  </>
                </Box>

                {/* Video Title */}
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '18px', md: '22px' },
                    fontWeight: 700,
                    marginTop: '16px',
                    lineHeight: 1.4,
                  }}
                >
                  {videoTitle}
                </Typography>

                {/* Metadata & Actions Row */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    marginTop: '12px',
                    gap: 2,
                  }}
                >
                  {/* Views & Date (Placeholder for date) */}
                  <Typography
                    sx={{ fontSize: '14px', color: '#aaaaaa', fontWeight: 500 }}
                  >
                    {videoViews} views
                  </Typography>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        backgroundColor: '#272727',
                        borderRadius: '20px',
                        overflow: 'hidden',
                      }}
                    >
                      <Button
                        onClick={handleLike}
                        startIcon={
                          hasLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />
                        }
                        sx={{
                          color: 'white',
                          padding: '6px 16px',
                          textTransform: 'none',
                          borderRight: '1px solid #3f3f3f',
                          borderRadius: 0,
                          '&:hover': { backgroundColor: '#3f3f3f' },
                        }}
                      >
                        {videoLikes}
                      </Button>
                      <Button
                        onClick={handleDislike}
                        startIcon={
                          hasDisliked ? (
                            <ThumbDownIcon />
                          ) : (
                            <ThumbDownOutlinedIcon />
                          )
                        }
                        sx={{
                          color: 'white',
                          padding: '6px 16px',
                          textTransform: 'none',
                          borderRadius: 0,
                          '&:hover': { backgroundColor: '#3f3f3f' },
                        }}
                      >
                        {videoDislikes}
                      </Button>
                    </Box>

                    <Button
                      startIcon={<ShareIcon />}
                      sx={{
                        backgroundColor: '#272727',
                        color: 'white',
                        borderRadius: '20px',
                        padding: '6px 16px',
                        textTransform: 'none',
                        '&:hover': { backgroundColor: '#3f3f3f' },
                      }}
                    >
                      Share
                    </Button>
                  </Box>
                </Box>

                {/* Description Box */}
                <Box
                  sx={{
                    backgroundColor: '#272727',
                    borderRadius: '12px',
                    padding: '12px',
                    marginTop: '16px',
                    '&:hover': { backgroundColor: '#3f3f3f' },
                    cursor: 'pointer',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '14px',
                      color: 'white',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {videoDescription}
                  </Typography>
                </Box>

                {/* Comments Section */}
                <Box sx={{ marginTop: '24px' }}>
                  <Typography
                    variant="h3"
                    sx={{ fontSize: '20px', marginBottom: '16px' }}
                  >
                    Comments
                  </Typography>
                  <CommentSection
                    videoId={getCurrentVideoId()}
                    userId={user?.id}
                    name={user?.name}
                  />
                </Box>
              </>
            ) : (
              <Typography sx={{ fontSize: '18px', color: 'red' }}>
                Video URL is missing.
              </Typography>
            )}
          </Grid>

          {/* Right Column: Recommendations */}
          <Grid item xs={12} lg={3.5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Recommendation
                currentVideoId={getCurrentVideoId()}
                currentVideoShortCode={shortCode}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default VideoPlayer;
