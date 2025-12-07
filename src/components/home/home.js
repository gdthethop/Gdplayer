import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CategoriesContainer from '../contaners/thumbnails';
import Header from '../header/header';
import HeroSection from './HeroSection';

function Home() {
  const [categories, setCategories] = useState({});
  const [latestVideo, setLatestVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/videos`
        );
        const data = response.data;

        if (Array.isArray(data) && data.length > 0) {
          // Set the latest video (assuming the API returns them in order or we pick the last one)
          // Ideally backend sorts it, but here we take the last one or sort by date if available.
          // For now, assuming chronological order, last is latest.
          setLatestVideo(data[data.length - 1]);

          const groupedData = {};
          data.forEach((video) => {
            const category = video.genres?.[0] || 'Uncategorized';
            if (!groupedData[category]) groupedData[category] = [];
            groupedData[category].push(video);
          });

          setCategories(groupedData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="main" style={{ background: 'black' }}>
      <div className="header">
        <Header />
      </div>
      <HeroSection video={latestVideo} />
      <div
        style={{
          background: 'black',
          display: 'flex',
          alignContent: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 20,
          marginTop: '-100px',
        }}
      >
        <div
          className="categories"
          style={{ width: '100%', paddingBottom: '50px' }}
        >
          <CategoriesContainer categories={categories} loading={loading} />
        </div>
      </div>
    </div>
  );
}

export default Home;
