import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: "center", mt: 10, display:'flex', justifyContent:'center', alignItems:'center', flexDirection:'column', marginTop:'200px'}}>
      <Typography variant="h3" sx={{ fontWeight: "bold", color: "#FF5722" }}>
        404
      </Typography>
     <Box
             sx={{
               textDecoration: 'none',
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center',
               marginLeft: '1rem',
             }}
           >
             <img
               src="https://www.gstatic.com/youtube/src/web/htdocs/img/monkey.png"
               alt="logo"
               style={{ width: '220px' }}
             />
        </Box>
      <Typography variant="h5" sx={{ color: "#757575", mt: 2 }}>
        Oops! The page you're looking for doesn't exist.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 4 }}
        onClick={() => navigate("/")}
      >
        Go Home
      </Button>
    </Box>
  );
};

export default NotFound;
