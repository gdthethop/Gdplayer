import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
// import reportWebVitals from './reportWebVitals';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Signup from './components/signup/signup';
import ForgotPassword from './components/forgot/forgot';
import Login from './components/login/login';
import VideoPlayer from './components/videoplayer/video';
import NotFound from './components/notfound/NotFound';
import ErrorBoundary from './components/boundarys/ErrorBoundary';
import { Provider } from 'react-redux';
import store from './redux/store';
import Home from './components/home/home';
import UploadVideo from './components/UploadVideo';
import PrivateRoute from './components/PrivateRoute';
import SearchPage from './components/search/SearchPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary>
          <HashRouter>
            <Routes>
              <Route path="/" element={<App />} />
              <Route
                path="/home"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot" element={<ForgotPassword />} />
              <Route
                path="/video"
                element={
                  <PrivateRoute>
                    <VideoPlayer />
                  </PrivateRoute>
                }
              />
              <Route
                path="/video/:shortCode"
                element={
                  <PrivateRoute>
                    <VideoPlayer />
                  </PrivateRoute>
                }
              />
              <Route
                path="/gd"
                element={
                  <PrivateRoute>
                    <UploadVideo />
                  </PrivateRoute>
                }
              />
              <Route
                path="/search"
                element={
                  <PrivateRoute>
                    <SearchPage />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </ErrorBoundary>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
