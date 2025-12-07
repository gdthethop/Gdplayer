import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async Thunks
export const fetchHistory = createAsyncThunk(
  'history/fetchHistory',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/history`,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch history'
      );
    }
  }
);

export const addToHistory = createAsyncThunk(
  'history/addToHistory',
  async ({ videoId, progress, completed }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) return; // Silent fail if not logged in

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/history`,
        { videoId, progress, completed },
        config
      );
      return response.data;
    } catch (error) {
      // Silent fail often desired for background sync, but we can log
      console.error('History sync failed', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update history'
      );
    }
  }
);

export const clearHistory = createAsyncThunk(
  'history/clearHistory',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/history`,
        config
      );
      return [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to clear history'
      );
    }
  }
);

const historySlice = createSlice({
  name: 'history',
  initialState: {
    history: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Clear
      .addCase(clearHistory.fulfilled, (state) => {
        state.history = [];
      });
    // AddToHistory - we often don't need to update the *list* state here unless we're on the history page,
    // but sticking it in can keep it in sync. For now, we assume fetchHistory reloads it when visiting the page.
  },
});

export default historySlice.reducer;
