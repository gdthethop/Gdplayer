import { configureStore } from '@reduxjs/toolkit';
import videoReducer from './videoSlice'; // Import the video slice
import authReducer from './authSlice';
import historyReducer from './historySlice';
import analyticsReducer from './analyticsSlice';
import userReducer from './userSlice';
import subscriptionReducer from './subscriptionSlice';
import notificationReducer from './notificationSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    video: videoReducer,
    history: historyReducer,
    analytics: analyticsReducer,
    user: userReducer,
    subscription: subscriptionReducer,
    notifications: notificationReducer,
  },
});
