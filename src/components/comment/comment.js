import {
  Box,
  Button,
  FormControl,
  Input,
  InputLabel,
  Typography,
  Avatar,
  TextField,
  Paper,
  IconButton,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import axios from 'axios';
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitComment } from '../../redux/videoSlice';

const CommentItem = ({ comment, user, token, onReply, onShowMessage }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Local state for optimistic updates
  const [likes, setLikes] = useState(comment.likes || []);
  const [dislikes, setDislikes] = useState(comment.dislikes || []);

  const userId = user?.id || user?._id; // Handle both id formats
  const hasLiked = likes.includes(userId);
  const hasDisliked = dislikes.includes(userId);

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(replyText, comment._id);
      setReplyText('');
      setShowReplyInput(false);
    }
  };

  const handleVote = async (type) => {
    // type: 'like' or 'dislike'
    if (!userId) {
      if (onShowMessage) onShowMessage('Please login to vote', 'warning');
      else alert('Please login to vote');
      return;
    }

    try {
      // Optimistic update
      if (type === 'like') {
        if (hasLiked) {
          setLikes((prev) => prev.filter((id) => id !== userId));
        } else {
          setLikes((prev) => [...prev, userId]);
          if (hasDisliked)
            setDislikes((prev) => prev.filter((id) => id !== userId));
        }
      } else {
        if (hasDisliked) {
          setDislikes((prev) => prev.filter((id) => id !== userId));
        } else {
          setDislikes((prev) => [...prev, userId]);
          if (hasLiked) setLikes((prev) => prev.filter((id) => id !== userId));
        }
      }

      const currentToken = token || localStorage.getItem('token'); // Use prop token, fallback to localStorage
      const backendUrl =
        process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

      await axios.put(
        `${backendUrl}/api/comments/${comment._id}/${type}`, // Endpoint needs to match route
        {},
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
    } catch (e) {
      console.error('Vote failed', e);
      if (onShowMessage) onShowMessage('Vote failed', 'error');
      // Revert logic could be added here
    }
  };

  return (
    <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar
          sx={{ bgcolor: '#c10000', width: 32, height: 32, fontSize: 14 }}
        >
          {comment.name ? comment.name[0].toUpperCase() : 'U'}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
          >
            {comment.name}
            <Typography
              component="span"
              variant="caption"
              sx={{ color: '#aaa', ml: 1 }}
            >
              ({new Date(comment.date).toLocaleString()})
            </Typography>
          </Typography>
          <Typography variant="body1" sx={{ mt: 0.5, mb: 1, color: '#ddd' }}>
            {comment.text}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                size="small"
                onClick={() => handleVote('like')}
                sx={{ color: hasLiked ? 'white' : '#aaa', p: 0.5 }}
              >
                {hasLiked ? (
                  <ThumbUpIcon fontSize="small" />
                ) : (
                  <ThumbUpOutlinedIcon fontSize="small" />
                )}
              </IconButton>
              <Typography
                variant="caption"
                sx={{ color: '#aaa', minWidth: '16px' }}
              >
                {likes.length || 0}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                size="small"
                onClick={() => handleVote('dislike')}
                sx={{ color: hasDisliked ? 'white' : '#aaa', p: 0.5 }}
              >
                {hasDisliked ? (
                  <ThumbDownIcon fontSize="small" />
                ) : (
                  <ThumbDownOutlinedIcon fontSize="small" />
                )}
              </IconButton>
              <Typography
                variant="caption"
                sx={{ color: '#aaa', minWidth: '16px' }}
              >
                {dislikes.length || 0}
              </Typography>
            </Box>

            {user && (
              <Button
                size="small"
                sx={{
                  color: '#aaa',
                  textTransform: 'none',
                  minWidth: 0,
                  p: 0,
                  ml: 2,
                  '&:hover': { color: '#fff' },
                }}
                onClick={() => setShowReplyInput(!showReplyInput)}
              >
                Reply
              </Button>
            )}
          </Box>

          {showReplyInput && (
            <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                variant="standard"
                placeholder="Add a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                sx={{ input: { color: 'white', fontSize: '0.9rem' } }}
              />
              <Button
                variant="contained"
                size="small"
                onClick={handleReplySubmit}
                sx={{
                  bgcolor: '#333',
                  color: 'white',
                  '&:hover': { bgcolor: '#555' },
                }}
              >
                Reply
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Recursive Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <Box sx={{ ml: 6, mt: 2, display: 'flex', flexDirection: 'column' }}>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              user={user}
              token={token}
              onReply={onReply}
              onShowMessage={onShowMessage}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

const CommentSection = ({ videoId }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token); // Get token
  const [mainComment, setMainComment] = useState('');
  const [commentList, setCommentList] = useState([]);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'top'

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const handleShowMessage = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchVideoComments = async () => {
    const backendUrl =
      process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
    console.log(
      `Fetching comments from: ${backendUrl}/api/comments/${videoId}/comments`
    );

    try {
      const response = await axios.get(
        `${backendUrl}/api/comments/${videoId}/comments`
      );
      setCommentList(response.data);
    } catch (e) {
      console.error('Failed to fetch comments', e);
      // Log detailed error info
      if (e.response) {
        console.error('Response data:', e.response.data);
        console.error('Response status:', e.response.status);
      } else if (e.request) {
        console.error('Request made but no response:', e.request);
      } else {
        console.error('Error message:', e.message);
      }
      handleShowMessage(`Failed to load comments: ${e.message}`, 'error');
    }
  };

  useEffect(() => {
    // Only fetch if videoId is defined and not 'undefined' string
    if (videoId && videoId !== 'undefined') {
      fetchVideoComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const handleSubmit = async (text, parentId = null) => {
    console.log('handleSubmit called with:', { text, parentId, videoId, user });

    if (!user) {
      console.error('User is missing in handleSubmit');
      handleShowMessage('You must be logged in to comment', 'error');
      return;
    }

    const userId = user.id || user._id;
    if (!userId) {
      console.error('User ID is missing:', user);
      handleShowMessage('User profile error. Please relogin.', 'error');
      return;
    }

    if (!text.trim()) {
      return; // Button should be disabled anyway
    }

    const commentData = {
      text: text,
      videoId: videoId,
      user_id: userId,
      name: user.name || 'Anonymous',
      date: new Date().toISOString(),
      parentId: parentId,
    };

    console.log('Dispatching submitComment with:', commentData);

    try {
      const action = await dispatch(submitComment(commentData));
      console.log('submitComment action result:', action);

      if (submitComment.fulfilled.match(action)) {
        if (!parentId) setMainComment('');
        fetchVideoComments(); // Refresh to rebuild tree
        handleShowMessage('Comment added', 'success');
      } else {
        console.error('submitComment failed:', action.error);
        handleShowMessage(
          `Failed to post comment: ${action.error?.message || 'Unknown error'}`,
          'error'
        );
      }
    } catch (err) {
      console.error('Unexpected error in handleSubmit:', err);
      handleShowMessage('An unexpected error occurred', 'error');
    }
  };

  // Convert flat list to tree
  const commentTree = useMemo(() => {
    const map = {};
    const roots = [];

    if (!Array.isArray(commentList)) return [];

    // Copy and map
    commentList.forEach((c) => {
      map[c._id] = { ...c, replies: [] };
    });

    commentList.forEach((c) => {
      if (c.parentId && map[c.parentId]) {
        map[c.parentId].replies.push(map[c._id]);
      } else {
        roots.push(map[c._id]);
      }
    });

    // Sort
    return roots.sort((a, b) => {
      if (sortBy === 'top') {
        const scoreA = (a.likes?.length || 0) - (a.dislikes?.length || 0);
        const scoreB = (b.likes?.length || 0) - (b.dislikes?.length || 0);
        return scoreB - scoreA; // Descending score
      } else {
        // Newest
        return new Date(b.date) - new Date(a.date); // Descending date
      }
    });
  }, [commentList, sortBy]);

  return (
    <Box sx={{ mt: 4, color: 'white' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          {commentList.length} Comments
        </Typography>

        {/* Sort Dropdown */}
        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          sx={{
            color: 'white',
            '.MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#888' },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'white',
            },
            height: 40,
            fontSize: '0.9rem',
          }}
          variant="outlined"
          size="small"
        >
          <MenuItem value="newest">Newest First</MenuItem>
          <MenuItem value="top">Top Rated</MenuItem>
        </Select>
      </Box>

      {/* Main Comment Input */}
      {user ? (
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Avatar sx={{ bgcolor: '#c10000' }}>
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Input
              fullWidth
              placeholder="Add a comment..."
              value={mainComment}
              onChange={(e) => setMainComment(e.target.value)}
              sx={{ color: 'white', borderBottom: '1px solid #555' }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                disabled={!mainComment.trim()}
                onClick={() => handleSubmit(mainComment)}
                sx={{ color: '#aaa', '&:hover': { color: 'white' } }}
              >
                Comment
              </Button>
            </Box>
          </Box>
        </Box>
      ) : (
        <Typography sx={{ color: '#aaa', mb: 3 }}>
          Please{' '}
          <Button href="/login" sx={{ color: '#c10000' }}>
            sign in
          </Button>{' '}
          to comment.
        </Typography>
      )}

      {/* Render Comments */}
      <Box>
        {commentTree.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            user={user}
            token={token}
            onReply={handleSubmit}
            onShowMessage={handleShowMessage}
          />
        ))}
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CommentSection;
