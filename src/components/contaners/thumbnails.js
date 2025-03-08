import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useDispatch } from "react-redux";
import { fetchVideoDetails } from "../../redux/videoSlice";
import { useNavigate } from "react-router-dom"; // useNavigate for React Router v6
import Skeleton from '@mui/material/Skeleton';

const API_URL = "https://gdbackend.onrender.com/api/videos";

// CategoriesContainer component
const CategoriesContainer = () => {
  const [categories, setCategories] = useState({});
  const [loading, setLoading] = useState(true); // Add loading state
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const trackRefs = useRef({});

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(API_URL);
      try {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        if (!Array.isArray(data)) {
          console.error("Invalid data format:", data);
          return;
        }

        const groupedData = {};
        data.forEach((video) => {
          const category = video.genres?.[0] || "Uncategorized";
          if (!groupedData[category]) groupedData[category] = [];
          groupedData[category].push(video);
        });

        setCategories(groupedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ padding: "30px", overflow: "hidden" }}>
      {loading ? (
        // Display skeleton while loading
        <Box sx={{ marginBottom: "40px" }}>
          <Skeleton variant="text" width={200} height={40} sx={{ bgcolor: 'grey.900' }} />
          <Box sx={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" width={300} height={200} sx={{ bgcolor: 'grey.900' }} />
            ))}
          </Box>
        </Box>
      ) : (
        // Display actual content once data is loaded
        Object.entries(categories).map(([category, videos]) => (
          <Box key={category} sx={{ marginBottom: "40px" }}>
            <Typography variant="h2" sx={{ fontSize: "24px", marginBottom: "10px", color: "#fff" }}>
              {category}
            </Typography>
            <VideoCarousel
              videos={videos}
              trackRef={(el) => (trackRefs.current[category] = el)}
              dispatch={dispatch}
              navigate={navigate}
            />
          </Box>
        ))
      )}
    </Box>
  );
};

// VideoCarousel component
const VideoCarousel = ({ videos, trackRef, dispatch, navigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideWidth, setSlideWidth] = useState(0);
  const [visibleSlides, setVisibleSlides] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const initializeCarousel = () => {
      if (containerRef.current) {
        const slide = containerRef.current.querySelector(".thumbnail-wrapper");
        if (slide) {
          const width = slide.offsetWidth + 20; // Account for the gap between slides
          const slidesToShow = Math.floor(containerRef.current.offsetWidth / width);
          setSlideWidth(width);
          setVisibleSlides(slidesToShow);
        }
      }

      // Add keyboard navigation support
      const handleKeyDown = (event) => {
        if (event.key === "ArrowLeft") {
          handlePrev();
        } else if (event.key === "ArrowRight") {
          handleNext();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    };

    initializeCarousel();
    window.addEventListener("resize", initializeCarousel);
    return () => window.removeEventListener("resize", initializeCarousel);
  }, [videos.length]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      trackRef?.current?.scrollBy({ left: -slideWidth, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    if (currentIndex < videos.length - visibleSlides) {
      setCurrentIndex((prev) => prev + 1);
      trackRef?.current?.scrollBy({ left: slideWidth, behavior: "smooth" });
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Box
        ref={trackRef}
        className="carousel-track"
        sx={{
          display: "flex",
          gap: "20px",
          overflowX: "auto",
          scrollBehavior: "smooth",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {videos.map((video) => {
          const imageUrl = getThumbnailUrl(video.thumbnail); // Use getThumbnailUrl function

          return (
            <Box
              key={video._id}
              className="thumbnail-wrapper"
              component="a"
              onClick={(e) => {
                e.preventDefault();
                dispatch(fetchVideoDetails(video._id));
                navigate(
                  `/video?videoId=${encodeURIComponent(video._id)}&title=${encodeURIComponent(video.title)}&description=${encodeURIComponent(video.description)}&videoUrl=${encodeURIComponent(video.link)}`
                );
              }}
              sx={{
                flex: "0 0 auto",
                width: "300px",
                height: "200px",
                position: "relative",
                transition: "transform 0.3s ease-in-out",
                "&:hover": { transform: "scale(1.05)" },
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <img
                src={imageUrl}
                alt={video.title}
                style={{ width: "100%", height: "100%", borderRadius: "10px", objectFit: "cover" }}
                onError={(e) => {
                  e.target.src = "/fallback.jpg"; // Use fallback image if error occurs
                }}
              />
              <Box
                className="overlay"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  padding: "10px",
                  opacity: 0,
                  transition: "opacity 0.3s ease-in-out",
                  "&:hover": { opacity: 1 },
                }}
              >
                <Typography
                  sx={{
                    color: "#ffffff",
                    textAlign: "center",
                    fontSize: "14px",
                    fontWeight: "bold",
                  }}
                >
                  {video.title}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      {videos.length > visibleSlides && (
        <>
          <IconButton
            onClick={handlePrev}
            disabled={currentIndex === 0}
            sx={{
              position: "absolute",
              top: "50%",
              left: "10px",
              transform: "translateY(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
            }}
            aria-label="Previous"
          >
            <ArrowBackIosIcon />
          </IconButton>
          <IconButton
            onClick={handleNext}
            disabled={currentIndex >= videos.length - visibleSlides}
            sx={{
              position: "absolute",
              top: "50%",
              right: "10px",
              transform: "translateY(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
            }}
            aria-label="Next"
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </>
      )}
    </Box>
  );
};

// Function to generate thumbnail URL based on video link
const getThumbnailUrl = (link) => {
  if (!link) return '/fallback.jpg'; // Fallback if no link

  // Handle Oracle Cloud URLs directly for thumbnail (assuming video URLs end in .mp4)
  if (link.includes('objectstorage') && link.endsWith('.mp4')) {
    return link.replace('.mp4', '-thumbnail.jpg'); // Assuming thumbnail is stored like this
  }

  // Return the link if it's already an image URL
  return link; 
};

export default CategoriesContainer;