import React from "react";
import { Box, Typography } from "@mui/material";
import Play from "../playbutton/playbutton";

const VideoCard = () => {

  return (
    <Box 
      sx={{
        width: "100%",
        height: "35em",
        backgroundImage: `url('https://img.youtube.com/vi/iyaJDq55cR4/hqdefault.jpg')`,
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
          Lyrical Song
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
        <Play/>
      </Box>
    </Box>
  );
};

export default VideoCard;
