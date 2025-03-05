import React, { useState } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchComponent = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Box
      sx={{
        position: 'relative',
        width: isHovered || isFocused ? '300px' : '50px', // Adjusted width for mobile view
        transition: 'width 0.3s ease-in-out',
        marginLeft: 'auto', // Aligns to the right
        display: 'flex',
        justifyContent: 'flex-end',
        '@media (max-width: 600px)': {
              width: isHovered || isFocused ? '200px' : '50px', // Smaller size for mobile
            },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!isFocused) setIsHovered(false); // Collapse only if not focused
      }}
    >
      {/* Search Input */}
      <TextField
        placeholder="Search for a movie or TV show..."
        variant="outlined"
        size="small"
        onFocus={() => setIsFocused(true)} // Keeps expanded on focus
        onBlur={() => {
          setIsFocused(false);
          setIsHovered(false); // Collapse when focus is lost
        }}
        sx={{
          width: '100%',
          opacity: isHovered || isFocused ? 1 : 0, // Input remains visible while typing
          transition: 'opacity 0.3s ease-in-out',
          '& .MuiOutlinedInput-root': { 
            maxWidth: '100%', // Ensure it fits well in mobile view
            borderRadius: '20px',
            paddingRight: '40px',
            border: '1px solid white', // Ensure the border is visible and white
          },
          '& .MuiOutlinedInput-input': {
            padding: '10px 15px',
            fontSize: '13px',
            color: 'white',
          },
        }}
      />

      {/* Search Button */}
      <IconButton
        sx={{
          position: 'absolute',
          top: '50%',
          right: '0px',
          transform: isHovered || isFocused ? 'translateY(-50%) rotate(360deg)' : 'translateY(-50%)',
          backgroundColor: '#c10000',
          borderRadius: '50%',
          width: '30px',
          height: '30px',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            backgroundColor: '#a80000',
          },
        }}
      >
        <SearchIcon sx={{ color: '#ffffff', fontSize: '18px' }} />
      </IconButton>
    </Box>
  );
};

export default SearchComponent;
