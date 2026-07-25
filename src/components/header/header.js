import React from 'react';
import { Box, Typography } from '@mui/material';
import SearchComponent from '../search/search';
import AccountContainer from '../acount/acount';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const handelClk = () => {
    navigate('/home');
  };
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        position: 'fixed',
        justifyContent: 'space-between',
        padding: { xs: '0.75rem 1rem', md: '1rem 2rem' },
        background: 'linear-gradient(rgba(0,0,0,0.8), transparent)',
        backdropFilter: 'blur(5px)',
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
          marginLeft: 0,
        }}
      >
        <img
          src={process.env.PUBLIC_URL + '/logo.png'}
          alt="logo"
          style={{
            width: '40px', // Default size for desktop
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
            fontWeight: 900,
            color: 'white',
            cursor: 'default',
            display: { xs: 'none', md: 'block' }, // Show on mobile
          }}
          onClick={handelClk}
        >
          Gd Player
          <Typography
            component="span"
            sx={{
              fontSize: '10px',
              color: 'gray',
              marginLeft: '4px',
              verticalAlign: 'super',
            }}
          >
            v1.4.O
          </Typography>
        </Typography>
      </Box>

      {/* Search and Login Section */}
      <Box
        sx={{
          display: 'flex', // Keep visible on mobile
          alignItems: 'center',
          gap: { xs: '0.5rem', sm: '1rem' },
          marginRight: 0,
          height: 'auto', // Set height for desktop view
        }}
      >
        <SearchComponent />
        <AccountContainer />
      </Box>
    </Box>
  );
};

export default Header;
