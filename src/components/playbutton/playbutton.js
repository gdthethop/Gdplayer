import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Play = ()=>{
    const navigate = useNavigate();
    
      // Video Details
      const videoUrl =
        "https://www.youtube.com/watch?v=iyaJDq55cR4";
      const title = "I'll Never Be The Same";
      const description = "A deep and emotional music video.";
    
      // Handle Play Button Click
      const handlePlay = () => {
        navigate(
          `/video?video=${encodeURIComponent(videoUrl)}&title=${encodeURIComponent(
            title
          )}&description=${encodeURIComponent(description)}`
        );
      };
    return (
        <Box
      sx={{
        padding: "22px",
        maxWidth: "200px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Button
        onClick={handlePlay}
        variant="contained"
        sx={{
          backgroundColor: "#fff",
          borderRadius: "2px",
          padding: "6px 20px",
          display: "flex",
          alignItems: "center",
          fontWeight: "bold",
          color: "#000",
          textTransform: "none",
          "&:hover": { backgroundColor: "#ddd" },
        }}
      >
        <img
          src="https://iosmirror.cc/img/playdark2222.svg"
          alt="Play"
          style={{ width: "30px", marginRight: "10px" }}
        />
        <Typography sx={{ fontWeight: "bold" }}>Play</Typography>
      </Button>
    </Box>
    );
};
export default Play;