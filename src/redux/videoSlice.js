import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

/**
 * Initial state for video slice.
 * Contains video metadata and status/error info.
 */
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
  videoUploader: null,
  status: 'idle',
  error: null,
};

/**
 * Async thunk to fetch video details by ID.
 * Sends GET request to backend video details endpoint.
 */
export const fetchVideoDetails = createAsyncThunk(
  'video/fetchVideoDetails',
  async (id) => {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/api/videos/${id}`
    );
    return response.data;
  }
);

/**
 * Async thunk to fetch video details by short code.
 * Sends GET request to backend video short code endpoint.
 */
export const fetchVideoDetailsByShortCode = createAsyncThunk(
  'video/fetchVideoDetailsByShortCode',
  async (shortCode) => {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/api/videos/short/${shortCode}`
    );
    return response.data;
  }
);

/**
 * Async thunk to update video views count by ID.
 * Sends PATCH request to increment views endpoint by video ID.
 */
export const updateVideoViewsById = createAsyncThunk(
  'video/updateVideoViewsById',
  async (id) => {
    const response = await axios.patch(
      `${process.env.REACT_APP_BACKEND_URL}/api/videos/${id}/incrementViews`
    );
    return response.data;
  }
);

/**
 * Async thunk to update video views count by shortCode.
 * Sends PATCH request to increment views endpoint by shortCode.
 */
export const updateVideoViewsByShortCode = createAsyncThunk(
  'video/updateVideoViewsByShortCode',
  async (shortCode) => {
    const response = await axios.patch(
      `${process.env.REACT_APP_BACKEND_URL}/api/videos/short/${shortCode}/incrementViews`
    );
    return response.data;
  }
);

/**
 * Async thunk to submit a comment on a video.
 * Sends POST request to backend comment endpoint.
 */
export const submitComment = createAsyncThunk(
  'video/submitComment',
  async (commentData) => {
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/api/videos/comment`,
      commentData
    );
    return response.data;
  }
);

/**
 * Video slice to manage video-related state.
 * Includes reducers for likes/dislikes and extraReducers for async thunks.
 */
const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    /**
     * Increment video likes count.
     */
    incrementVideoLikes: (state) => {
      state.videoLikes += 1;
    },
    /**
     * Decrement video likes count.
     */
    decrementVideoLikes: (state) => {
      state.videoLikes -= 1;
    },
    /**
     * Update video likes count with a specific value.
     */
    updateVideoLikes: (state, action) => {
      state.videoLikes = action.payload;
    },
    /**
     * Increment video dislikes count.
     */
    incrementVideoDislikes: (state) => {
      state.videoDislikes += 1;
    },
    /**
     * Decrement video dislikes count.
     */
    decrementVideoDislikes: (state) => {
      state.videoDislikes -= 1;
    },
    /**
     * Clear video details (reset to initial state).
     */
    clearVideoDetails: (state) => {
      state.videoUrl = '';
      state.videoTitle = '';
      state.videoDescription = '';
      state.videoThumbnail = '';
      state.videoRuntime = '';
      state.videoViews = 0;
      state.videoGenres = '';
      state.videoLikes = 0;
      state.videoDislikes = 0;
      state.status = 'idle';
      state.error = null;
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
        state.videoUploader = action.payload.userId;
      })
      .addCase(fetchVideoDetailsByShortCode.fulfilled, (state, action) => {
        state.videoUrl = action.payload.link;
        state.videoTitle = action.payload.title;
        state.videoDescription = action.payload.description;
        state.videoViews = action.payload.views;
        state.videoLikes = action.payload.likes;
        state.videoDislikes = action.payload.dislikes;
        state.videoUploader = action.payload.userId;
      })
      .addCase(updateVideoViewsById.fulfilled, (state, action) => {
        state.videoViews = action.payload.views;
      })
      .addCase(updateVideoViewsByShortCode.fulfilled, (state, action) => {
        state.videoViews = action.payload.views;
      });
  },
});

/**
 * Export video slice actions.
 */
export const {
  incrementVideoLikes,
  decrementVideoLikes,
  updateVideoLikes,
  incrementVideoDislikes,
  decrementVideoDislikes,
  clearVideoDetails,
} = videoSlice.actions;

/**
 * Export video slice reducer as default.
 */
export default videoSlice.reducer;
