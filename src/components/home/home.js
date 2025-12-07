import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CategoriesContainer from '../contaners/thumbnails';
import Header from '../header/header';
import HeroSection from './HeroSection';
import { Box, Typography } from '@mui/material';

function Home() {
  const [categories, setCategories] = useState({});
  const [latestVideo, setLatestVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/videos`
      );
      const data = response.data;

      if (Array.isArray(data) && data.length > 0) {
        // Set latest video
        setLatestVideo(data[0]);

        const groupedData = {};
        data.forEach((video) => {
          const genre = video.genres?.[0] || 'Uncategorized';
          if (!groupedData[genre]) groupedData[genre] = [];
          groupedData[genre].push(video);
        });
        setCategories(groupedData);
      } else {
        setCategories({});
        setLatestVideo(null);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="main" style={{ background: 'black', minHeight: '100vh' }}>
      <div className="header">
        <Header />
      </div>

      {latestVideo && <HeroSection video={latestVideo} />}

      <div
        style={{
          background: 'black',
          display: 'flex',
          alignContent: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 20,
          marginTop: latestVideo ? '-100px' : '20px',
        }}
      >
        <div
          className="categories"
          style={{ width: '100%', paddingBottom: '50px' }}
        >
          {loading ? (
            <Typography sx={{ color: 'white', ml: 4 }}>
              Loading videos...
            </Typography>
          ) : (
            <CategoriesContainer categories={categories} loading={loading} />
          )}

          {!loading && Object.keys(categories).length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 5 }}>
              <Typography variant="h6" color="gray">
                No videos found.
              </Typography>
            </Box>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
