import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Define the initial state
const initialState = {
  videoUrl: '',
  videoTitle: '',
  videoDescription: '',
  videoThumbnail: '',
  videoRuntime: '',
  videoViews: 0,
  videoGenres: '',
  videoLikes: 0,
  videoDislikes: 0,
  status: 'idle',
  error: null,
};

// Create async thunks for API calls
export const fetchVideoDetails = createAsyncThunk('video/fetchVideoDetails', async (id) => {
  const response = await axios.get(`https://gdbackend.onrender.com/api/videos/${id}`);
  return response.data;
});

export const fetchVideoDetailsByShortCode = createAsyncThunk(
  'video/fetchVideoDetailsByShortCode',
  async (shortCode) => {
    const response = await axios.get(`https://gdbackend.onrender.com/api/videos/short/${shortCode}`);
    return response.data;
  }
);

export const updateVideoViews = createAsyncThunk(
  'video/updateVideoViews',
  async (id) => {
    const response = await axios.patch(`https://gdbackend.onrender.com/api/videos/${id}/incrementViews`);
    return response.data;
  }
);

export const submitComment = createAsyncThunk('video/submitComment', async (commentData) => {
  const response = await axios.post('https://gdbackend.onrender.com/api/videos/comment', commentData);
  return response.data;
});

// Slice to handle actions
const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    // Reducers to handle local state for likes and dislikes
    incrementVideoLikes: (state) => {
      state.videoLikes += 1;
    },
    decrementVideoLikes: (state) => {
      state.videoLikes -= 1;
    },
    updateVideoLikes: (state, action) => {
      state.videoLikes = action.payload;
    }, // Add this action
    incrementVideoDislikes: (state) => {
      state.videoDislikes += 1;
    },
    decrementVideoDislikes: (state) => {
      state.videoDislikes -= 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideoDetails.fulfilled, (state, action) => {
        state.videoUrl = action.payload.link;
        state.videoTitle = action.payload.title;
        state.videoDescription = action.payload.description;
        state.videoViews = action.payload.views;
        state.videoLikes = action.payload.likes;
        state.videoDislikes = action.payload.dislikes;
      })
      .addCase(fetchVideoDetailsByShortCode.fulfilled, (state, action) => {
        state.videoUrl = action.payload.link;
        state.videoTitle = action.payload.title;
        state.videoDescription = action.payload.description;
        state.videoViews = action.payload.views;
        state.videoLikes = action.payload.likes;
        state.videoDislikes = action.payload.dislikes;
      })
      .addCase(updateVideoViews.fulfilled, (state, action) => {
        state.videoViews = action.payload.views;
      });
  },
});

// Export the actions
export const {
  incrementVideoLikes,
  decrementVideoLikes,
  updateVideoLikes, // Add this to the exports
  incrementVideoDislikes,
  decrementVideoDislikes,
} = videoSlice.actions;

// Export the thunks and the slice reducer
export default videoSlice.reducer;
