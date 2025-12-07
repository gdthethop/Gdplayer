import axios from 'axios';
import store from './redux/store';
import { logoutUser } from './redux/authSlice';

// Setup axios interceptor to handle 401 errors globally
axios.interceptors.response.use(
  (response) => {
    // If the response is successful, just return it
    return response;
  },
  (error) => {
    // Check if the error is a 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Get the current state
      const state = store.getState();
      const isAuthenticated = state.auth.token !== null;

      // Only logout if user was previously authenticated
      // This prevents logout on login/signup failures
      if (isAuthenticated) {
        console.log('Token expired or invalid. Logging out...');

        // Dispatch logout action
        store.dispatch(logoutUser());

        // Show user-friendly message
        alert('Your session has expired. Please log in again.');

        // Redirect to login page
        window.location.hash = '#/login';
      }
    }

    // Return the error so it can still be handled by individual components
    return Promise.reject(error);
  }
);

export default axios;
