import React, { useEffect, useState } from "react"; 
import { Box, Typography } from "@mui/material"; // Import Box and Typography from MUI
import Play from "../playbutton/playbutton";

const VideoCard = (props) => { // Accept props to make the component dynamic
    const { videoId } = props; // Extract videoId from props
    const [videoDetails, setVideoDetails] = useState(null);

    useEffect(() => {
        const fetchVideoDetails = async () => {
            try {
                const response = await fetch(`http://your-backend-api/videos/${videoId}`);
                const data = await response.json();
                setVideoDetails(data); // Assuming data contains video details
            } catch (error) {
                console.error("Error fetching video details:", error);
            }
        };

        if (videoId) {
            fetchVideoDetails();
        }
    }, [videoId]);

    if (!videoDetails) {
        return <Typography>Loading...</Typography>; // Loading state
    }

    return ( 
    <Box 
      sx={{
        width: "100%",
        height: "35em",
        backgroundImage: `url('${videoDetails.thumbnailUrl}')`, // Use thumbnailUrl from fetched data
        backgroundPosition: "center",
        backgroundSize: "cover",
        position: "relative",
        marginTop: "0px",
      }}
    >
      {/* Gradient Overlay */}
      <Box
        sx={{
          background: "linear-gradient(#ffffff00 40%, #000000c2, #000 95%)",
          width: "100%",
          height: "110%",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />

      {/* Left Content (Genre & Play Button) */}
      <Box
        sx={{
          width: "100%",
          position: "absolute",
          bottom: "-70px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Genre Section */}
        <Typography
          sx={{
            fontSize: "22px",
            color: "#ccc",
            padding: "15px 10px",
            textOverflow: "ellipsis",
            overflow: "hidden",
          }}
        >
          {props.genre} {/* Use genre from props */}
          <span
            style={{
              margin: "0px 10px",
              color: "rgb(195, 32, 32)",
              fontSize: "60px",
            }}
          >
            .
          </span>
          GdMusic
          <span
            style={{
              margin: "0px 10px",
              color: "rgb(195, 32, 32)",
              fontSize: "60px",
            }}
          >
            .
          </span>
          Emotional
        </Typography>
        <Play videoUrl={props.videoUrl} title={props.title} description={props.description} videoId={videoId}/> {/* Pass video details to Play */}
      </Box>
    </Box>
  );
};

export default VideoCard;
