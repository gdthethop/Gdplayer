import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './axiosConfig'; // Import axios interceptor configuration
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
// import reportWebVitals from './reportWebVitals';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import Signup from './components/signup/signup';
import ForgotPassword from './components/forgot/forgot';
import Login from './components/login/login';
import VideoPlayer from './components/videoplayer/video';
import NotFound from './components/notfound/NotFound';
import ErrorBoundary from './components/boundarys/ErrorBoundary';
import { Provider } from 'react-redux';
import store from './redux/store';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Home from './components/home/home';
import UploadVideo from './components/UploadVideo';
import PrivateRoute from './components/PrivateRoute';
import SearchPage from './components/search/SearchPage';
import Profile from './components/acount/Profile';
import ResetPassword from './components/forgot/ResetPassword';
import History from './components/history/History';
import CreatorStudio from './components/studio/CreatorStudio';
import WatchLater from './components/watch_later/WatchLater';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider
      clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}
    >
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ErrorBoundary>
            <HashRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot" element={<ForgotPassword />} />
                <Route
                  path="/reset-password/:token"
                  element={<ResetPassword />}
                />
                <Route path="/video" element={<VideoPlayer />} />
                <Route path="/video/:shortCode" element={<VideoPlayer />} />
                <Route
                  path="/gd"
                  element={
                    <PrivateRoute>
                      <UploadVideo />
                    </PrivateRoute>
                  }
                />
                <Route path="/search" element={<SearchPage />} />
                <Route
                  path="/profile"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <PrivateRoute>
                      <History />
                    </PrivateRoute>
                  }
                />

                {/* ... */}

                <Route
                  path="/studio"
                  element={
                    <PrivateRoute>
                      <CreatorStudio />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/watch-later"
                  element={
                    <PrivateRoute>
                      <WatchLater />
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </HashRouter>
          </ErrorBoundary>
        </ThemeProvider>
      </Provider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

// register the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${process.env.PUBLIC_URL}/service-worker.js`)
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
