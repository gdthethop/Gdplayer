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

const VideoPlayer = () => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const { shortCode } = useParams();
  const location = useLocation();

  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);

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

  useEffect(() => {
    if (!videoUrl) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (
      videoRef.current &&
      !videoUrl.startsWith('https://player.cloudinary.com/embed/')
    ) {
      // Only initialize hls.js if not a Cloudinary embed URL
      const isHlsStream =
        videoUrl.includes('.m3u8') || videoUrl.includes('cloudinary.com');

      if (Hls.isSupported() && isHlsStream) {
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(videoUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current.play();
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS.js error:', data);
        });
      } else if (
        videoRef.current.canPlayType('application/vnd.apple.mpegurl')
      ) {
        videoRef.current.src = videoUrl;
        videoRef.current.addEventListener('loadedmetadata', () => {
          videoRef.current.play();
        });
      } else {
        videoRef.current.src = videoUrl;
        videoRef.current.load();
      }
    }
  }, [videoUrl]);

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
            ) : videoUrl ? (
              <>
                {/* Video Player Container */}
                <Box
                  sx={{
                    width: '100%',
                    overflow: 'hidden',
                    backgroundColor: 'black',
                    aspectRatio: '16/9',
                    position: 'relative',
                  }}
                >
                  {videoUrl.startsWith(
                    'https://player.cloudinary.com/embed/'
                  ) ? (
                    <iframe
                      title="Cloudinary Video Player"
                      src={videoUrl}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="autoplay; fullscreen"
                      allowFullScreen
                      style={{ border: 'none' }}
                    />
                  ) : (
                    <video
                      ref={videoRef}
                      controls
                      autoPlay
                      muted
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    >
                      {!videoUrl.includes('.m3u8') && (
                        <source src={videoUrl} type="video/mp4" />
                      )}
                      Your browser does not support the video tag.
                    </video>
                  )}
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
