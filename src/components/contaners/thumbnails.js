import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwsOGWQ26lOmY67bqQyErxh9JhNvTanrSdeCqJGWzK0pCnJqoirD2--nwOG7WIsDXky/exec';

function decodeYouTubeLink(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'www.youtube.com' && urlObj.pathname === '/watch') {
      return urlObj.searchParams.get('v');
    }
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.split('/')[1];
    }
    return null;
  } catch (error) {
    console.error('Invalid URL:', error);
    return null;
  }
}

const CategoriesContainer = () => {
  const [categories, setCategories] = useState({});
  const trackRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();
        console.log('Fetched Data:', data); // Log the fetched data
        if (data) {
          const groupedData = {};
          data.forEach((row, index) => {
            const category = row['Category'] || 'Uncategorized';
            if (!groupedData[category]) groupedData[category] = [];
            groupedData[category].push({
              id: index + 1,
              youtubeLink: row['YouTube Link'],
              title: row['Title'],
              videoUrl: row['Video URL'],
              description: row['Description'],
            });
          });
          setCategories(groupedData);
        }
      } catch (error) {
        console.error('Error fetching data from Google Apps Script:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <Box sx={{ padding: '30px', overflow: 'hidden' }}>
      {Object.entries(categories).map(([category, videos]) => (
        <Box key={category} sx={{ marginBottom: '40px' }}>
          <Typography variant="h2" sx={{ fontSize: '24px', marginBottom: '10px', color: '#fff' }}>
            {category}
          </Typography>
          <VideoCarousel videos={videos} trackRef={(el) => (trackRefs.current[category] = el)} />
        </Box>
      ))}
    </Box>
  );
};

const VideoCarousel = ({ videos, trackRef }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);
  const [visibleSlides, setVisibleSlides] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const initializeCarousel = () => {
      if (containerRef.current) {
        const slide = containerRef.current.querySelector('.thumbnail-wrapper');
        if (slide) {
          const width = slide.offsetWidth + 20;
          const slidesToShow = Math.floor(containerRef.current.offsetWidth / width);
          setSlideWidth(width);
          setVisibleSlides(slidesToShow);
        }
      }
    };
    initializeCarousel();
    window.addEventListener('resize', initializeCarousel);
    return () => window.removeEventListener('resize', initializeCarousel);
  }, [videos]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      trackRef.scrollLeft -= slideWidth;
    }
  };

  const handleNext = () => {
    if (currentIndex < videos.length - visibleSlides) {
      setCurrentIndex((prev) => prev + 1);
      trackRef.scrollLeft += slideWidth;
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        ref={trackRef}
        className="carousel-track"
        sx={{
          display: 'flex',
          gap: '20px',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {videos.map((video) => {
          const videoId = decodeYouTubeLink(video.youtubeLink);
          console.log('Video ID:', videoId); // Log the video ID
          const imageUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
          console.log('Image URL:', imageUrl); // Log the image URL
          return (
            <Box
              key={video.id}
              className="thumbnail-wrapper"
              sx={{
                flex: '0 0 auto',
                width: '300px',
                height: '200px',
                position: 'relative',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': { transform: 'scale(1.05)' },
              }}
            >
                <a href={`/video?video=${encodeURIComponent(video.videoUrl)}&title=${encodeURIComponent(video.title)}&description=${encodeURIComponent(video.description)}`} onClick={(e) => { if (!video.videoUrl) { e.preventDefault(); alert('Video URL is missing or invalid.'); } }}>

                <img
                  src={imageUrl}
                  alt={video.title}
                  style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }}
                />
                <Box
                  className="overlay"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    padding: '10px',
                    opacity: 0,
                    transition: 'opacity 0.3s ease-in-out',
                    '&:hover': { opacity: 1 },
                  }}
                >
                  <Typography sx={{ color: '#ffffff', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                    {video.title}
                  </Typography>
                </Box>
              </a>
            </Box>
          );
        })}
      </Box>
      {videos.length > visibleSlides && (
        <>
          <IconButton onClick={handlePrev} disabled={currentIndex === 0} sx={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', backgroundColor: 'rgba(0, 0, 0, 0.6)', color: 'white' }}>
            <ArrowBackIosIcon />
          </IconButton>
          <IconButton onClick={handleNext} disabled={currentIndex >= videos.length - visibleSlides} sx={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', backgroundColor: 'rgba(0, 0, 0, 0.6)', color: 'white' }}>
            <ArrowForwardIosIcon />
          </IconButton>
        </>
      )}
    </Box>
  );
};

export default CategoriesContainer;
