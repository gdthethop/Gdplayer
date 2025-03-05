import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Signup user (ASYNC ACTION)
export const signupUser = createAsyncThunk('auth/signup', async (userData, { rejectWithValue }) => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', userData, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data; // If successful, return data
    } catch (error) {
        // If error, reject with message from the backend or a default message
        return rejectWithValue(error.response?.data || { message: 'Signup failed' });
    }
});

// Login user (ASYNC ACTION)
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', credentials, {
            headers: { 'Content-Type': 'application/json' }
        });
        return response.data; // If successful, return data
    } catch (error) {
        // If error, reject with message from the backend or a default message
        return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: localStorage.getItem('token') || null,
        user: JSON.parse(localStorage.getItem('user')) || null,
        status: 'idle',
        error: null,
    },
    reducers: {
        logoutUser: (state) => {
            state.token = null;
            state.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
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
                state.user = action.payload.user;
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
            });
    },
});

export default authSlice.reducer;
export const { logoutUser } = authSlice.actions;
