import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVideoDetails, updateVideoViews, updateVideoLikes } from '../../redux/videoSlice';
import { Box, Typography, IconButton } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ShareIcon from '@mui/icons-material/Share';
import Header from '../header/header';
import CommentSection from '../comment/comment';
import Recommendation from '../recomendations/recomendation';

const VideoPlayer = () => {
  const dispatch = useDispatch();
  const videoRef = useRef(null);

  const getQueryParam = (param) => {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  };

    const videoId = getQueryParam('videoId') || 'defaultVideoId'; // Set a default video ID if none is provided

  const {
    videoUrl,
    videoTitle,
    videoDescription,
    videoViews,
    videoLikes,
    status,
    error,
    isUpdatingLikes,
  } = useSelector((state) => state.video);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (videoId && videoId !== 'defaultVideoId') {
      dispatch(fetchVideoDetails(videoId));
      dispatch(updateVideoViews(videoId));
    } else {
      console.error("No valid video ID provided.");
    }
  }, [dispatch, videoId]);

  const handleLike = () => {
    if (!isUpdatingLikes && videoId) {
      dispatch(updateVideoLikes(videoId));
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
            ) : (
              <>
                {videoUrl ? (
                  <iframe
                    src={videoUrl}
                    width="100%"
                    height="400px"
                    frameBorder="0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    style={{ borderRadius: '10px' }}
                  />
                ) : videoUrl ? (
                  <video
                    ref={videoRef}
                    controls
                    autoPlay
                    muted
                    style={{ width: '100%',height:"400px", borderRadius: '10px', boxShadow: '0 6px 20px rgba(0, 0, 0, 0.8)' }}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <Typography sx={{ fontSize: '18px', color: 'red' }}>Video URL is missing.</Typography>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '16px', color: '#aaaaaa' }}>Views: {videoViews}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '16px', color: '#aaaaaa' }}>{videoLikes} Likes</Typography>
                    <IconButton onClick={handleLike} sx={{ color: 'white' }}>
                      <ThumbUpIcon />
                    </IconButton>
                    <IconButton sx={{ color: 'white' }}>
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
                <CommentSection videoId={videoId} userId={user.id} name={user.name} />
              </>
            )}
          </Box>
          <Box sx={{ flex: 1, padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '10px' }}>
            <Typography variant="h3" sx={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
              Recommended Videos
            </Typography>
            <Recommendation currentVideoId={videoId} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default VideoPlayer;
