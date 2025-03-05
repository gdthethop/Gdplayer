import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useDispatch } from "react-redux";
import { fetchVideoDetails } from "../../redux/videoSlice";
import { useNavigate } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/videos";

const Recommendation = ({ currentVideoId }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        if (!Array.isArray(data)) {
          setError("Failed to fetch videos. Please try again later.");
          console.error("Invalid data format:", data);
          return;
        }

        setVideos(data.filter(video => video._id !== currentVideoId)); 
      } catch (error) {
        setError("Error fetching data: " + error.message);
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); 
      }
    };

    fetchData();
  }, [currentVideoId]);

  return (
    <Box sx={{ padding: "30px" }}>
      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Typography sx={{ color: "#ffffff" }}>Loading videos...</Typography>
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} variant="rectangular" width="100%" height={200} sx={{ bgcolor: "grey.900" }} />
          ))}
        </Box>
      ) : error ? (
        <Typography sx={{ color: "#ff0000" }}>{error}</Typography>
      ) : (
        <Box
          sx={{
            display: { xs: "flex", md: "flex" },
            flexDirection: { xs: "row", md: "column" }, // Row for mobile (carousel), Column for desktop
            gap: "20px",
            overflowX: { xs: "auto", md: "hidden" }, // Scroll enabled only for mobile
            whiteSpace: { xs: "nowrap", md: "normal" }, // Prevent wrapping in mobile
            paddingBottom: { xs: "10px", md: "0px" },
            "&::-webkit-scrollbar": { height: "6px" }, // Style scrollbar in mobile view
            "&::-webkit-scrollbar-thumb": { background: "#aaa", borderRadius: "10px" },
          }}
        >
          {videos.map((video) => {
            const imageUrl = video.thumbnail || "/fallback.jpg"; 

            return (
              <Box
                key={video._id}
                component="a"
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(fetchVideoDetails(video._id));
                  navigate(
                    `/video?videoId=${encodeURIComponent(video._id)}&title=${encodeURIComponent(
                      video.title
                    )}&description=${encodeURIComponent(video.description)}`
                  );
                }}
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" }, // Column for mobile, row for desktop
                  alignItems: "center",
                  textDecoration: "none",
                  color: "inherit",
                  borderRadius: "10px",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": { transform: "scale(1.02)" },
                  gap: "15px",
                  flex: "0 0 auto", // Prevent shrinking in mobile view
                  width: { xs: "320px", md: "100%" }, // Fixed width in mobile for proper carousel spacing
                }}
              >
                {/* Video Thumbnail */}
                <Box
                  sx={{
                    width: { xs: "100%", md: "250px" }, // Full width on mobile, fixed width on desktop
                    position: "relative",
                    paddingBottom: {xs:"56.25%", md:'29.9%'}, // 16:9 Aspect Ratio
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={video.title}
                    style={{
                      position: "absolute",
                      top: "0",
                      left: "0",
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.src = "/fallback.jpg";
                    }}
                  />
                </Box>

                {/* Video Details */}
                <Box sx={{ flex: 1, maxWidth: { xs: "100%", md: "500px" } }}> 
                  <Typography variant="h6" sx={{ fontSize: "16px", fontWeight: "bold", color: "#fff" }}>
                    {video.title}
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#aaaaaa" }}>
                    {Array.isArray(video.genres) ? video.genres.join(" | ") : video.genres}
                  </Typography>
                  <Typography sx={{ fontSize: "12px", color: "#aaaaaa" }}>Views: {video.views}</Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default Recommendation;
