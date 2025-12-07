import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

/**
 * Async thunk to signup a new user.
 * Sends a POST request to the backend register endpoint with user data.
 * Returns user and token on success.
 * Rejects with error message on failure.
 */
export const signupUser = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/register`,
        userData,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return { user: response.data.user, token: response.data.token }; // Ensure user and token are returned
    } catch (error) {
      // If error, reject with message from the backend or a default message
      return rejectWithValue(
        error.response?.data || { message: 'Signup failed' }
      );
    }
  }
);

/**
 * Async thunk to login a user.
 * Sends a POST request to the backend login endpoint with credentials.
 * Returns user and token on success.
 * Rejects with error message on failure.
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/login`,
        credentials,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return { user: response.data.user, token: response.data.token }; // Ensure user and token are returned
    } catch (error) {
      // If error, reject with message from the backend or a default message
      return rejectWithValue(
        error.response?.data || { message: 'Login failed' }
      );
    }
  }
);

/**
 * Async thunk to update user profile.
 * Sends a PUT request to the backend update-profile endpoint.
 * Returns updated user data on success.
 * Rejects with error message on failure.
 */
export const updateUserProfileAsync = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const email = state.auth.user?.email;

      if (!email) {
        return rejectWithValue({ message: 'User email not found' });
      }

      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/update-profile`,
        { ...profileData, email },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: 'Profile update failed' }
      );
    }
  }
);

/**
 * Auth slice to manage authentication state.
 * Handles token, user info, status, and error state.
 * Includes logout reducer to clear auth data.
 * Handles async thunk lifecycle actions for login and signup.
 */
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    status: 'idle',
    error: null,
  },
  reducers: {
    /**
     * Logout user by clearing token and user from state and localStorage.
     */
    logoutUser: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    /**
     * Update user profile information (name, profileIcon, etc.)
     */
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'; // Set status to 'loading' when login starts
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded'; // Set status to 'succeeded' on success
        state.token = action.payload.token;
        state.user = action.payload.user; // Set user in state
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'; // Set status to 'failed' on error
        state.error = action.payload?.message || 'Login failed';
      })
      .addCase(signupUser.pending, (state) => {
        state.status = 'loading'; // Set status to 'loading' when signup starts
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.status = 'succeeded'; // Set status to 'succeeded' on success
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = 'failed'; // Set status to 'failed' on error
        state.error = action.payload?.message || 'Signup failed';
      })
      .addCase(updateUserProfileAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateUserProfileAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      })
      .addCase(updateUserProfileAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Profile update failed';
      });
  },
});

export default authSlice.reducer;
export const { logoutUser, updateUserProfile } = authSlice.actions;
