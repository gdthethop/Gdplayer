import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Play = (props) => { // Accept props to make the component dynamic
    const navigate = useNavigate();
    
    // Video Details (now from props)
    const videoUrl = props.videoUrl; // Use videoUrl from props
    const title = props.title; // Use title from props
    const description = props.description; // Use description from props

    // Handle Play Button Click
    const handlePlay = () => { // Handle Play Button Click
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
                onClick={() => handlePlay(videoUrl, title, description)} // Pass video details to handlePlay
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
