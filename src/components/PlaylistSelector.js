import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Button,
} from '@mui/material';
import axios from 'axios';

const PlaylistSelector = ({
  selectedPlaylist,
  onPlaylistChange,
  onNewPlaylist,
}) => {
  const [playlists, setPlaylists] = useState([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('');

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/videos/playlists`
      );
      setPlaylists(response.data);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const handleCreateNew = () => {
    onNewPlaylist(newPlaylistTitle);
    // Optimistic update: Add to local list so it renders in Select
    setPlaylists((prev) => [
      ...prev,
      { title: newPlaylistTitle, _id: 'new-' + Date.now() },
    ]);
    setNewPlaylistTitle('');
    setIsCreatingNew(false);
  };

  return (
    <Box sx={{ minWidth: 120, mb: 2 }}>
      {!isCreatingNew ? (
        <FormControl fullWidth>
          <InputLabel id="playlist-select-label">Playlist</InputLabel>
          <Select
            labelId="playlist-select-label"
            id="playlist-select"
            multiple
            value={selectedPlaylist}
            label="Playlist"
            onChange={(e) => {
              const {
                target: { value },
              } = e;

              // Check if "NEW" was selected in the multi-select array
              if (value.includes('NEW')) {
                setIsCreatingNew(true);
                // Remove 'NEW' from valid selection to avoid error
                onPlaylistChange(
                  typeof value === 'string'
                    ? value.split(',')
                    : value.filter((v) => v !== 'NEW')
                );
              } else {
                onPlaylistChange(
                  // On autofill we get a stringified value.
                  typeof value === 'string' ? value.split(',') : value
                );
              }
            }}
          >
            {playlists.map((playlist) => (
              <MenuItem key={playlist._id} value={playlist.title}>
                {playlist.title}
              </MenuItem>
            ))}
            <MenuItem
              value="NEW"
              sx={{ fontWeight: 'bold', color: 'primary.main' }}
            >
              + Create New Playlist
            </MenuItem>
          </Select>
        </FormControl>
      ) : (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            label="New Playlist Name"
            variant="outlined"
            fullWidth
            size="small"
            value={newPlaylistTitle}
            onChange={(e) => setNewPlaylistTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCreateNew();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleCreateNew}
            disabled={!newPlaylistTitle.trim()}
          >
            Add
          </Button>
          <Button variant="text" onClick={() => setIsCreatingNew(false)}>
            Cancel
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PlaylistSelector;
