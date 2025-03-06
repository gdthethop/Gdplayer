import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ✅ Async Thunk to fetch video details
export const fetchVideoDetails = createAsyncThunk('video/fetchVideoDetails', async (videoId, { rejectWithValue }) => {
    try {
        const response = await fetch(`https://gdbackend.onrender.com/api/videos/${videoId}`);
        if (!response.ok) {
            return rejectWithValue(`Failed to fetch video details: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return rejectWithValue(error.message || 'Something went wrong');
    }
});

// ✅ Async Thunk to update views
export const updateVideoViews = createAsyncThunk('video/incrementViews', async (videoId, { rejectWithValue }) => {
    try {
        const response = await fetch(`https://gdbackend.onrender.com/api/videos/${videoId}/incrementViews`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            return rejectWithValue(`Failed to update views: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        return rejectWithValue(error.message || 'Failed to update views');
    }
});

// ✅ Async Thunk to submit a comment
export const submitComment = createAsyncThunk('video/submitComment', async (commentData, { rejectWithValue }) => {
    try {
        const response = await fetch(`https://gdbackend.onrender.com/api/videos/${commentData.videoId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: commentData.text,  // Pass 'text' as it matches the backend schema
                user_id: commentData.user_id,  // Pass 'user_id' for the user making the comment
                name: commentData.name,  // Pass 'name' as part of the comment
                date: commentData.date,  // Pass 'date' as part of the comment
            }),
        });

        if (!response.ok) {
            return rejectWithValue(`Failed to submit comment: ${response.statusText}`);
        }

        const data = await response.json();  // Parse the response from the backend
        return data;
    } catch (error) {
        return rejectWithValue(error.message || 'Failed to submit comment');
    }
});

// ✅ Async Thunk to update likes
export const updateVideoLikes = createAsyncThunk('video/incrementLikes', async (videoId, { rejectWithValue }) => {
    if (!videoId) {
        return rejectWithValue('Invalid video ID');
    }
    try {
        const response = await fetch(`https://gdbackend.onrender.com/api/videos/${videoId}/incrementLikes`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            return rejectWithValue(`Failed to update likes: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Response from API (Likes):", data);
        return data;
    } catch (error) {
        return rejectWithValue(error.message || 'Failed to update likes');
    }
});

// ✅ Redux slice for video state management
const videoSlice = createSlice({
    name: 'video',
    initialState: {
        videoUrl: '',
        videoTitle: '',
        videoDescription: '',
        videoThumbnail: '',
        videoRuntime: '',
        videoViews: 0,
        videoGenres: '',
        videoLikes: 0,
        status: 'idle',
        error: null,
        isUpdatingViews: false,
        isUpdatingLikes: false,
    },

    reducers: {
        incrementViews: (state) => {
            state.videoViews += 1;
        },
        incrementLikes: (state, action) => {
            state.videoLikes = action.payload.likes; // Ensure correct update
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVideoDetails.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchVideoDetails.fulfilled, (state, action) => {
                if (action.payload) {
                    state.videoUrl = action.payload.link || '';
                    state.videoTitle = action.payload.title || 'Unknown Title';
                    state.videoDescription = action.payload.description || 'No description available';
                    state.videoThumbnail = action.payload.thumbnail || '/fallback.jpg';
                    state.videoRuntime = action.payload.runtime || '';
                    state.videoViews = action.payload.views || 0;
                    state.videoGenres = action.payload.genres || '';
                    state.videoLikes = action.payload.likes || 0;
                }
                state.status = 'succeeded';
            })
            .addCase(fetchVideoDetails.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Failed to fetch video details';
            })
            .addCase(updateVideoViews.pending, (state) => {
                state.isUpdatingViews = true;
            })
            .addCase(updateVideoViews.fulfilled, (state) => {
                state.videoViews += 1;
                state.isUpdatingViews = false;
            })
            .addCase(updateVideoViews.rejected, (state, action) => {
                state.isUpdatingViews = false;
                state.error = action.payload || 'Failed to update views';
            })
            .addCase(updateVideoLikes.pending, (state) => {
                state.isUpdatingLikes = true;
            })
            .addCase(updateVideoLikes.fulfilled, (state, action) => {
                if (action.payload && action.payload.likes !== undefined) {
                    state.videoLikes = action.payload.likes; // Set updated likes
                }
                state.isUpdatingLikes = false;
            })
            .addCase(updateVideoLikes.rejected, (state, action) => {
                state.isUpdatingLikes = false;
                state.error = action.payload || 'Failed to update likes';
            });
    },
});

export const { incrementViews, incrementLikes } = videoSlice.actions;
export default videoSlice.reducer;
