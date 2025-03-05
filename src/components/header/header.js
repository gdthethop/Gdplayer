import React from 'react';
import { Box, Typography } from '@mui/material';
import SearchComponent from '../search/search';
import AccountContainer from '../acount/acount';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const handelClk =() => {
    navigate("/home");
}
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        position: 'fixed',
        justifyContent: 'space-between',
        padding: '1rem',
        background: 'linear-gradient(black, transparent)',
        zIndex: 1000,
      }}
    >
      {/* Logo and Heading */}
      <Box
        component="a"
        onClick={handelClk}
        sx={{
          textDecoration: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginLeft: '1rem',
        }}
      >
        <img
          src="logo.png"
          alt="logo"
          style={{
            width: '60px', // Default size for desktop
            height: 'auto',
            marginRight: '10px',
            '@media (max-width: 600px)': {
              width: '40px', // Smaller size for mobile
            },
          }}
        />
        {/* Typography for mobile view */}
        <Typography
          component="a"
          variant="h1"
          sx={{
            fontSize: '18px',
            fontWeight: 700,
            color: 'white',
            cursor:'default',
            display: { xs: 'none', md: 'block' } // Show on mobile
          }}
          onClick={handelClk}
        >
          Gd Player
        </Typography>
      </Box>

      {/* Search and Login Section */}
      <Box
        sx={{
          display: 'flex', // Keep visible on mobile
          alignItems: 'center',
          gap : '2rem',
          marginRight: '5rem',
          height: 'auto', // Set height for desktop view
          '@media (max-width: 600px)': {
              gap: '1rem', // Smaller size for mobile
              marginRight: '2rem'
            },
        }}
      >
        <SearchComponent />
        <AccountContainer/>
      </Box>
    </Box>
  );
};

export default Header;
