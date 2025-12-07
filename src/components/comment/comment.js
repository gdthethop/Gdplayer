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
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined';
import axios from 'axios';
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitComment } from '../../redux/videoSlice';

const CommentItem = ({ comment, user, token, onReply }) => {
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
    if (!userId) return alert('Please login to vote');

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
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/comments/${comment._id}/${type}`, // Endpoint needs to match route
        {},
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );
    } catch (e) {
      console.error('Vote failed', e);
      // Revert? (Complex without deep prop refresh)
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

  const fetchVideoComments = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/videos/${videoId}/comments`
      );
      const data = await response.json();
      setCommentList(data);
    } catch (e) {
      console.error('Failed to fetch comments', e);
    }
  };

  useEffect(() => {
    if (videoId) fetchVideoComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const handleSubmit = async (text, parentId = null) => {
    if (!user || !user.id || !text.trim()) return;

    const commentData = {
      text: text,
      videoId: videoId,
      user_id: user.id,
      name: user.name,
      date: new Date().toISOString(),
      parentId: parentId,
    };

    const action = await dispatch(submitComment(commentData));
    if (submitComment.fulfilled.match(action)) {
      if (!parentId) setMainComment('');
      fetchVideoComments(); // Refresh to rebuild tree
    }
  };

  // Convert flat list to tree
  const commentTree = useMemo(() => {
    const map = {};
    const roots = [];

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

    // Sort by date desc for roots? Or asc? usually top comments are popular or newest.
    return roots.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [commentList]);

  return (
    <Box sx={{ mt: 4, color: 'white' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
        {commentList.length} Comments
      </Typography>

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
          />
        ))}
      </Box>
    </Box>
  );
};

export default CommentSection;
