import React from 'react';
import { Box, Typography } from '@mui/material';
import SearchComponent from '../search/search';
import AccountContainer from '../acount/acount';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const handelClk =() => {
    navigate("/");
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
          style={{ width: '60px', marginRight: '15px' }}
        />
        <Typography
        component="a"
          variant="h1"
          sx={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#830000',
            cursor:'default'
          }}
          onClick={handelClk}
        >
          Gd Player
        </Typography>
      </Box>

      {/* Search and Login Section */}
      <Box
        sx={{
            width: '30%',
          display: 'flex',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          padding: '10px 0px',
        }}
      >
        <SearchComponent />
        <AccountContainer/>
      </Box>
    </Box>
  );
};

export default Header;