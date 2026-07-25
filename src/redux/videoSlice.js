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
  videoId: null,
  hlsUrl: null, // master.m3u8 URL — null until transcoding is 'ready'
  transcodingStatus: null, // 'pending' | 'processing' | 'ready' | 'failed'
  status: 'idle',
  error: null,
  isUpdatingLikes: false,
  isUpdatingDislikes: false,
};

const getBackendUrl = () =>
  process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

/**
 * Async thunk to fetch video details by ID.
 * Sends GET request to backend video details endpoint.
 */
export const fetchVideoDetails = createAsyncThunk(
  'video/fetchVideoDetails',
  async (id) => {
    const response = await axios.get(`${getBackendUrl()}/api/videos/${id}`);
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
      `${getBackendUrl()}/api/videos/short/${shortCode}`
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
      `${getBackendUrl()}/api/videos/${id}/incrementViews`
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
      `${getBackendUrl()}/api/videos/short/${shortCode}/incrementViews`
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
      `${getBackendUrl()}/api/comments/${commentData.videoId}/comments`,
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
      state.videoId = null;
      state.hlsUrl = null;
      state.transcodingStatus = null;
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
        state.videoId = action.payload._id;
        state.hlsUrl = action.payload.hlsUrl || null;
        state.transcodingStatus = action.payload.transcodingStatus || null;
        state.status = 'succeeded';
      })
      .addCase(fetchVideoDetails.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVideoDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchVideoDetailsByShortCode.fulfilled, (state, action) => {
        state.videoUrl = action.payload.link;
        state.videoTitle = action.payload.title;
        state.videoDescription = action.payload.description;
        state.videoViews = action.payload.views;
        state.videoLikes = action.payload.likes;
        state.videoDislikes = action.payload.dislikes;
        state.videoUploader = action.payload.userId;
        state.videoId = action.payload._id;
        state.hlsUrl = action.payload.hlsUrl || null;
        state.transcodingStatus = action.payload.transcodingStatus || null;
        state.status = 'succeeded';
      })
      .addCase(fetchVideoDetailsByShortCode.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVideoDetailsByShortCode.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
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
