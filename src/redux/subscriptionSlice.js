import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Check if subscribed
export const checkSubscriptionStatus = createAsyncThunk(
  'subscription/checkStatus',
  async (channelId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/subscriptions/check/${channelId}`,
        config
      );
      return response.data.isSubscribed;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error checking status'
      );
    }
  }
);

// Subscribe
export const subscribeToChannel = createAsyncThunk(
  'subscription/subscribe',
  async (channelId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/subscriptions/${channelId}`,
        {},
        config
      );
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error subscribing'
      );
    }
  }
);

// Unsubscribe
export const unsubscribeFromChannel = createAsyncThunk(
  'subscription/unsubscribe',
  async (channelId, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/subscriptions/${channelId}`,
        config
      );
      return false;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error unsubscribing'
      );
    }
  }
);

// Get Subscriber Count
export const getSubscriberCount = createAsyncThunk(
  'subscription/getCount',
  async (channelId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/subscriptions/count/${channelId}`
      );
      return response.data.count;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Error fetching count'
      );
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    isSubscribed: false,
    subscriberCount: 0,
    loading: false,
    error: null,
  },
  reducers: {
    resetSubscriptionState: (state) => {
      state.isSubscribed = false;
      state.subscriberCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkSubscriptionStatus.fulfilled, (state, action) => {
        state.isSubscribed = action.payload;
      })
      .addCase(subscribeToChannel.fulfilled, (state) => {
        state.isSubscribed = true;
        state.subscriberCount += 1;
      })
      .addCase(unsubscribeFromChannel.fulfilled, (state) => {
        state.isSubscribed = false;
        state.subscriberCount = Math.max(0, state.subscriberCount - 1);
      })
      .addCase(getSubscriberCount.fulfilled, (state, action) => {
        state.subscriberCount = action.payload;
      });
  },
});

export const { resetSubscriptionState } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
