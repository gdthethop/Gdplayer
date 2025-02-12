import React, { useState } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchComponent = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      sx={{
        position: 'relative',
        width: isHovered ? '250px' : '50px', // Width changes on hover
        transition: 'width 0.3s ease-in-out',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Search Input */}
      <TextField
        placeholder="Search for a movie or TV show..."
        variant="outlined"
        size="small"
        sx={{
          width: '100%',
          opacity: isHovered ? 1 : 0, // Input appears on hover
          transition: 'opacity 0.3s ease-in-out',
          '& .MuiOutlinedInput-root': {
            borderRadius: '20px',
            paddingRight: '40px', 
            borderColor: '#fff',// Space for the button
          },
          '& .MuiOutlinedInput-input': {
            padding: '10px 15px',
            fontSize: '13px',
            color:'white',
          },
        }}
      />

      {/* Search Button */}
      <IconButton
        sx={{
          position: 'absolute',
          top: '50%',
          right: '-10px',
          transform: isHovered ? 'translateY(-50%) rotate(360deg)' : 'translateY(-50%)', // Rotate on hover
          backgroundColor: '#c10000',
          borderRadius: '50%',
          width: '30px',
          height: '30px',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            backgroundColor: '#a80000', // Darker red on hover
          },
        }}
      >
        <SearchIcon sx={{ color: '#ffffff', fontSize: '18px' }} />
      </IconButton>
    </Box>
  );
};

export default SearchComponent;