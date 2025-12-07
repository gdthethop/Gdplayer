import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Paper,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import ClearIcon from '@mui/icons-material/Clear';
import { useNavigate } from 'react-router-dom';

const SearchComponent = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const addToHistory = (term) => {
    let newHistory = [term, ...history.filter((h) => h !== term)];
    if (newHistory.length > 5) newHistory = newHistory.slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const removeFromHistory = (e, term) => {
    e.stopPropagation();
    const newHistory = history.filter((h) => h !== term);
    setHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      addToHistory(searchTerm.trim());
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setIsFocused(false); // Close dropdown
      // Blur input
      if (document.activeElement instanceof HTMLElement)
        document.activeElement.blur();
    }
  };

  const handleHistoryClick = (term) => {
    setSearchTerm(term);
    addToHistory(term);
    navigate(`/search?q=${encodeURIComponent(term)}`);
    setIsFocused(false);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSearch}
      sx={{
        position: 'relative',
        width: isHovered || isFocused ? '300px' : '50px',
        transition: 'width 0.3s ease-in-out',
        marginLeft: 'auto',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 1100, // Higher than header
        '@media (max-width: 600px)': {
          width: isHovered || isFocused ? '200px' : '50px',
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        if (!isFocused) setIsHovered(false);
      }}
    >
      {/* Search Input */}
      <TextField
        placeholder="Search..."
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setTimeout(() => {
            // Delay to allow click on item
            setIsFocused(false);
            setIsHovered(false);
          }, 200);
        }}
        sx={{
          width: '100%',
          opacity: isHovered || isFocused ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          '& .MuiOutlinedInput-root': {
            maxWidth: '100%',
            borderRadius: '20px',
            paddingRight: '40px',
            border: '1px solid white',
            bgcolor: 'rgba(0,0,0,0.5)',
          },
          '& .MuiOutlinedInput-input': {
            padding: '10px 15px',
            fontSize: '13px',
            color: 'white',
          },
        }}
      />

      {/* History Dropdown */}
      {isFocused && history.length > 0 && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            bgcolor: '#1e1e1e',
            color: 'white',
            borderRadius: 2,
            overflow: 'hidden',
            zIndex: 1200,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          }}
        >
          <List dense sx={{ py: 0 }}>
            {history.map((term, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => removeFromHistory(e, term)}
                    sx={{ color: '#aaa', '&:hover': { color: 'white' } }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                }
                disablePadding
              >
                <ListItemButton
                  onClick={() => handleHistoryClick(term)}
                  sx={{ '&:hover': { bgcolor: '#333' } }}
                >
                  <HistoryIcon sx={{ fontSize: 16, mr: 2, color: '#aaa' }} />
                  <ListItemText
                    primary={term}
                    primaryTypographyProps={{ fontSize: '14px' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Search Button */}
      <IconButton
        type="submit"
        sx={{
          position: 'absolute',
          top: '50%',
          right: '0px',
          transform:
            isHovered || isFocused
              ? 'translateY(-50%) rotate(360deg)'
              : 'translateY(-50%)',
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
