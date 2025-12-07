import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch Watch Later List (populated videos)
export const fetchWatchLater = createAsyncThunk(
  'user/fetchWatchLater',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/users/watch-later`,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch Watch Later'
      );
    }
  }
);

// Toggle Watch Later (Add/Remove)
export const toggleWatchLaterAction = createAsyncThunk(
  'user/toggleWatchLater',
  async (videoId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/users/watch-later`,
        { videoId },
        config
      );
      return response.data; // { message, watchLater: [ids] }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to toggle Watch Later'
      );
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    watchLaterVideos: [], // Full objects for the page
    watchLaterIds: [], // IDs for quick check
    loading: false,
    error: null,
  },
  reducers: {
    setWatchLaterIds: (state, action) => {
      state.watchLaterIds = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchWatchLater.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWatchLater.fulfilled, (state, action) => {
        state.loading = false;
        state.watchLaterVideos = action.payload;
        // Also update IDs
        state.watchLaterIds = action.payload.map((v) => v._id);
      })
      .addCase(fetchWatchLater.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Toggle
      .addCase(toggleWatchLaterAction.fulfilled, (state, action) => {
        state.watchLaterIds = action.payload.watchLater;
        // Ideally we'd update the Videos list too if we were on the page, but mostly we use this for the IDs.
        // If we are removing, we can filter locally
        // But the response only returns IDs.
      });
  },
});

export const { setWatchLaterIds } = userSlice.actions;
export default userSlice.reducer;
