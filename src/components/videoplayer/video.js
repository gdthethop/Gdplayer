import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchVideoDetails,
  fetchVideoDetailsByShortCode,
  updateVideoViews,
  updateVideoLikes,
  incrementVideoLikes,
  decrementVideoLikes,
  incrementVideoDislikes,
  decrementVideoDislikes,
} from '../../redux/videoSlice';
import { Box, Typography, IconButton } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ShareIcon from '@mui/icons-material/Share';
import Header from '../header/header';
import CommentSection from '../comment/comment';
import Recommendation from '../recomendations/recomendation';
import { useParams, useLocation } from 'react-router-dom';

const VideoPlayer = () => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);
  const { shortCode } = useParams();
  const location = useLocation();

  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);

  // Extract videoId from URL query params if available
  const getQueryParam = (param) => new URLSearchParams(location.search).get(param);
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

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [videoUrl]);

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (shortCode) {
      dispatch(fetchVideoDetailsByShortCode(shortCode));
      dispatch(updateVideoViews(shortCode));
    } else if (videoIdFromQuery) {
      dispatch(fetchVideoDetails(videoIdFromQuery));
      dispatch(updateVideoViews(videoIdFromQuery));
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
    <Box sx={{ backgroundColor: 'black', color: 'white', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ maxWidth: '90%', margin: 'auto', paddingTop: '100px' }}>
        <Box sx={{ display: 'flex', gap: '20px', flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: 2 }}>
            {status === 'loading' ? (
              <Typography sx={{ fontSize: '18px', color: 'gray' }}>Loading video...</Typography>
            ) : error ? (
              <Typography sx={{ fontSize: '18px', color: 'red' }}>Error: {error}</Typography>
            ) : videoUrl ? (
              <>
                <Box sx={{ width: '100%', height: '400px', borderRadius: '10px', overflow: 'hidden' }}>
                  <video
                    ref={videoRef}
                    controls
                    autoPlay
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '10px',
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.8)',
                    }}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '16px', color: '#aaaaaa' }}>
                    Views: {videoViews}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '16px', color: '#aaaaaa', marginRight: '10px' }}>
                      {videoLikes} Likes
                    </Typography>
                    <IconButton onClick={handleLike} sx={{ color: hasLiked ? 'blue' : 'white' }}>
                      <ThumbUpIcon />
                    </IconButton>
                    <Typography sx={{ fontSize: '16px', color: '#aaaaaa', marginRight: '10px' }}>
                      {videoDislikes} Dislikes
                    </Typography>
                    <IconButton onClick={handleDislike} sx={{ color: hasDisliked ? 'blue' : 'white' }}>
                      <ThumbDownIcon />
                    </IconButton>
                    <IconButton sx={{ color: 'white' }}>
                      <ShareIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="h2" sx={{ fontSize: '24px', fontWeight: 'bold', marginTop: '20px' }}>
                  {videoTitle}
                </Typography>
                <Typography sx={{ fontSize: '16px', color: '#aaaaaa', marginTop: '10px' }}>
                  {videoDescription}
                </Typography>

                <CommentSection
                  videoId={getCurrentVideoId()}
                  userId={user?.id}
                  name={user?.name}
                />
              </>
            ) : (
              <Typography sx={{ fontSize: '18px', color: 'red' }}>
                Video URL is missing.
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              flex: 1,
              padding: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
            }}
          >
            <Typography variant="h3" sx={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
              Recommended Videos
            </Typography>
            <Recommendation currentVideoId={getCurrentVideoId()} currentVideoShortCode={shortCode} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoPlayer;
