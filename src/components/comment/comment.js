import { Box, Button, FormControl, Input, InputLabel, Typography } from "@mui/material";
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { submitComment } from '../../redux/videoSlice'; // Import the action to submit comments

const CommentSection = ({ videoId }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user); // Get user from Redux store
  const [comments, setComment] = useState("");
  const [commentList, setCommentList] = useState([]); // State to store comments

  // Fetch comments when component mounts or when videoId changes
  useEffect(() => {
    if (videoId) {
      const fetchVideoComments = async () => {
        const response = await fetch(`http://localhost:5000/api/videos/${videoId}/comments`);
        const data = await response.json();
        setCommentList(data);  // Set the fetched comments in state
      };
      fetchVideoComments();
    }
  }, [videoId]);  // Re-run if videoId changes

  // Submit comment to the backend
  const Submit = async () => {
    const date = new Date().toISOString(); // Get current date in ISO format
    if (!comments.trim()) return; // Prevent empty comments

    let commentData = {
      text: comments, // Use 'text' as the backend expects this key, not 'comment'
      videoId: videoId,
      user_id: user?.id, // Ensure user.id is correctly available
      name: user?.name,
      date: date, // Use the current date
    };

    console.log("Submitting comment data:", commentData); // Log comment data before submission
    const resultAction = await dispatch(submitComment(commentData)); // Dispatch the action to submit the comment
    if (submitComment.fulfilled.match(resultAction)) {
      // If the submission was successful, update the comment list
      setCommentList((prevState) => [...prevState, commentData]);
      setComment(""); // Clear the input field

      // Fetch the updated list of comments after submission
      const fetchUpdatedComments = async () => {
        const response = await fetch(`http://localhost:5000/api/videos/${videoId}/comments`);
        const data = await response.json();
        setCommentList(data);  // Update the comment list with the latest data
      };

      fetchUpdatedComments();  // Trigger the refetch of comments
    } else {
      // Handle submission error if needed
      console.error("Failed to submit comment:", resultAction.error.message);
    }
  };

  return (
    <div>
      <Box sx={{ marginTop: '20px' }}>
        <FormControl fullWidth sx={{ m: 1 }} variant="standard">
          <div>
            <InputLabel htmlFor="text" sx={{ color: 'white', borderBlockColor: 'white' }}>Type your comment here</InputLabel>
            <Input sx={{ color: 'white', width: '81%', marginTop: '20px' }} onChange={(e) => setComment(e.target.value)} id="text" type="text" value={comments} />
            <Button onClick={Submit} sx={{ color: 'red' }}>Submit</Button>
          </div>
          <Typography variant="h2" sx={{ fontSize: '24px', fontWeight: 'bold', marginTop: '20px' }}>Comments</Typography>
          {commentList.map((comment) => (
            <Typography key={comment._id} sx={{ fontSize: '16px', color: '#aaaaaa', marginTop: '10px' }}>
              {comment.text} - <strong>{comment.name}</strong> on {new Date(comment.date).toLocaleString()}
            </Typography>
          ))}
        </FormControl>
      </Box>
    </div>
  );
};

export default CommentSection;