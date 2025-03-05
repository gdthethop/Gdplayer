import { configureStore } from '@reduxjs/toolkit';
import videoReducer from './videoSlice'; // Import the video slice
import authReducer from './authSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    video: videoReducer, // Add the video slice to the store
  },
});
