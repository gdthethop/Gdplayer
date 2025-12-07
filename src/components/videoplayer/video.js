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
  clearVideoDetails,
} from '../../redux/videoSlice';
import { toggleWatchLaterAction } from '../../redux/userSlice';
import { addToHistory } from '../../redux/historySlice'; // Import History Action
import { Box, Typography, Button, Grid, Avatar } from '@mui/material';
import {
  checkSubscriptionStatus,
  subscribeToChannel,
  unsubscribeFromChannel,
} from '../../redux/subscriptionSlice';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import ShareIcon from '@mui/icons-material/Share';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

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

  const [inWatchLater, setInWatchLater] = useState(false); // Watch Later State

  const { isSubscribed } = useSelector((state) => state.subscription);
  const { videoUploader } = useSelector((state) => state.video);

  // Custom Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false); // Start unmuted
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isPip, setIsPip] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

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

  const user = useSelector((state) => state.auth.user);
  const { watchLaterIds } = useSelector((state) => state.user); // Watch Later IDs

  // Sync Watch Later State
  useEffect(() => {
    if (watchLaterIds && videoId) {
      setInWatchLater(watchLaterIds.includes(videoId));
    }
  }, [watchLaterIds, videoId]);

  useEffect(() => {
    if (videoUploader && videoUploader._id) {
      if (user) dispatch(checkSubscriptionStatus(videoUploader._id));
    }
  }, [dispatch, videoUploader, user]);

  const handleSubscribe = async () => {
    if (!user) {
      alert('Please sign in to subscribe.');
      return;
    }
    if (isSubscribed) {
      await dispatch(unsubscribeFromChannel(videoUploader._id));
    } else {
      await dispatch(subscribeToChannel(videoUploader._id));
    }
  };

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
    // Reset state when video changes
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setShowControls(false); // Hide controls initially for new video

    if (videoRef.current) {
      videoRef.current.load(); // Explicitly load the new source
    }
  }, [processedVideoUrl]); // Trigger whenever the URL changes

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName))
        return;

      const video = videoRef.current;
      if (!video) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'arrowleft':
          e.preventDefault();
          video.currentTime = Math.max(video.currentTime - 5, 0);
          break;
        case 'arrowright':
          e.preventDefault();
          video.currentTime = Math.min(video.currentTime + 5, video.duration);
          break;
        case 'j':
          e.preventDefault();
          video.currentTime = Math.max(video.currentTime - 10, 0);
          break;
        case 'l':
          e.preventDefault();
          video.currentTime = Math.min(video.currentTime + 10, video.duration);
          break;
        case 'arrowup':
          e.preventDefault();

          handleVolumeChange(null, Math.min(volume + 0.1, 1));
          break;
        case 'arrowdown':
          e.preventDefault();
          handleVolumeChange(null, Math.max(volume - 0.1, 0));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, isPlaying]);

  // --- New Handlers for Controls ---
  const togglePip = async () => {
    try {
      if (videoRef.current) {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          setIsPip(false);
        } else {
          await videoRef.current.requestPictureInPicture();
          setIsPip(true);
        }
      }
    } catch (err) {
      console.error('Failed to enter PiP:', err);
    }
  };

  const handlePlaybackRateChange = (newRate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = newRate;
      setPlaybackRate(newRate);
    }
  };

  // --- Watch History Sync ---
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (isPlaying && videoRef.current && videoId && user) {
        dispatch(
          addToHistory({
            videoId,
            progress: videoRef.current.currentTime,
            completed: videoRef.current.ended,
          })
        );
      }
    }, 15000); // Pulse every 15 seconds

    return () => clearInterval(intervalId);
  }, [isPlaying, videoId, user, dispatch]);

  // Also save on pause
  useEffect(() => {
    if (videoRef.current) {
      const onPause = () => {
        if (videoId && user) {
          dispatch(
            addToHistory({
              videoId,
              progress: videoRef.current.currentTime,
              completed: videoRef.current.ended,
            })
          );
        }
        setIsPlaying(false);
      };
      const onPlay = () => setIsPlaying(true);

      videoRef.current.addEventListener('pause', onPause);
      videoRef.current.addEventListener('play', onPlay);

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('pause', onPause);
          videoRef.current.removeEventListener('play', onPlay);
        }
      };
    }
  }, [videoId, user, dispatch, processedVideoUrl]);

  useEffect(() => {
    // Clear previous video details immediately to prevent showing old content
    dispatch(clearVideoDetails());

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
    if (!user) {
      alert('Please sign in to like this video.');
      return;
    }
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
    if (!user) {
      alert('Please sign in to dislike this video.');
      return;
    }
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

  const handleWatchLater = async () => {
    if (!user) {
      alert('Please sign in to save to Watch Later.');
      return;
    }
    // Optimistic Update
    setInWatchLater(!inWatchLater);
    await dispatch(toggleWatchLaterAction(videoId));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  const controlsTimeoutRef = useRef(null);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 2500);
  };

  const handleMouseLeave = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(false);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setShowControls(true)}
                  onMouseLeave={handleMouseLeave}
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
                      key={processedVideoUrl}
                      ref={videoRef}
                      onClick={togglePlay}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                      // Listen for PiP events to sync state
                      onEnterPictureInPicture={() => setIsPip(true)}
                      onLeavePictureInPicture={() => setIsPip(false)}
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
                      // New Props
                      onPip={togglePip}
                      isPip={isPip}
                      playbackRate={playbackRate}
                      onPlaybackRateChange={handlePlaybackRateChange}
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
                      onClick={handleShare}
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

                    <Button
                      onClick={handleWatchLater}
                      startIcon={
                        inWatchLater ? <WatchLaterIcon /> : <AccessTimeIcon />
                      }
                      sx={{
                        backgroundColor: '#272727',
                        color: 'white',
                        borderRadius: '20px',
                        padding: '6px 16px',
                        textTransform: 'none',
                        '&:hover': { backgroundColor: '#3f3f3f' },
                      }}
                    >
                      {inWatchLater ? 'Saved' : 'Save'}
                    </Button>
                  </Box>
                </Box>

                {/* Channel Info & Subscribe */}
                {videoUploader && (
                  <Box
                    sx={{
                      mt: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #333',
                      borderBottom: '1px solid #333',
                      py: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        cursor: 'pointer' /* navigate to profile? */,
                      }}
                    >
                      <Avatar
                        src={videoUploader.profileIcon}
                        alt={videoUploader.name}
                      />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {videoUploader.name}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Description Box */}
                <Box
                  sx={{
                    marginTop: '16px',
                    backgroundColor: '#272727',
                    borderRadius: '12px',
                    padding: '12px',
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
