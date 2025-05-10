import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import VideoPlayer from './video';
import * as videoSlice from '../../redux/videoSlice';

describe('VideoPlayer Component', () => {
  let store;

  beforeEach(() => {
    const initialState = {
      video: {
        videoUrl: 'http://example.com/video.mp4',
        videoTitle: 'Test Video',
        videoDescription: 'Test Description',
        videoViews: 10,
        videoLikes: 5,
        status: 'succeeded',
        error: null,
        isUpdatingLikes: false,
      },
      auth: {
        user: { id: 'user1', name: 'Test User' },
      },
    };

    const mockReducer = (state = initialState, action) => state;

   store = configureStore({
  reducer: mockReducer,
});

    jest.spyOn(videoSlice, 'fetchVideoDetails').mockImplementation(() => ({ type: 'video/fetchVideoDetails' }));
    jest.spyOn(videoSlice, 'fetchVideoDetailsByShortCode').mockImplementation(() => ({ type: 'video/fetchVideoDetailsByShortCode' }));
    jest.spyOn(videoSlice, 'updateVideoViews').mockImplementation(() => ({ type: 'video/incrementViews' }));
    jest.spyOn(videoSlice, 'updateVideoLikes').mockImplementation(() => ({ type: 'video/incrementLikes' }));
  });

  it('renders video details when accessed by shortCode', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/video/abc123']}>
          <Routes>
            <Route path="/video/:shortCode" element={<VideoPlayer />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Video')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText(/Views: 10/i)).toBeInTheDocument();
      expect(screen.getByText(/5 Likes/i)).toBeInTheDocument();
    });
  });
});
