import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Paper,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '../../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Mock set of Netflix-ish avatars
const AVATARS = [
  {
    id: 1,
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png',
    label: 'Classic',
  },
  {
    id: 2,
    url: 'https://i.pinimg.com/originals/b6/77/cd/b677cd1cde292f261166533d6fe75872.png',
    label: 'Blue',
  }, // Use reliable sources or placeholders
  {
    id: 3,
    url: 'https://i.pinimg.com/originals/1b/54/ef/1b54ef28c3109503487f551724af13aa.png',
    label: 'Yellow',
  },
  {
    id: 4,
    url: 'https://i.pinimg.com/originals/bd/ee/4c/bdee4c328550aaf21aa9f43fd19e2136.png',
    label: 'Red',
  },
  {
    id: 5,
    url: 'https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-88wkdmjop8eg057t.jpg',
    label: 'Green',
  }, // Placeholder
];

// Fallback if images fail (using Dicebear)
const FALLBACK_AVATARS = [
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Molly',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Spooky',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=Bubba',
];

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [name, setName] = useState(user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.profileIcon || AVATARS[0].url
  );

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      // If user has a profileIcon, ensure it's selected. If not, default to first.
      setSelectedAvatar(user.profileIcon || AVATARS[0].url);
    }
  }, [user]);

  const handleSave = () => {
    // Dispatch update action (we need to create this in authSlice)
    dispatch(updateUserProfile({ name, profileIcon: selectedAvatar }));
    navigate('/home');
  };

  const handleCancel = () => {
    navigate('/home');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#141414',
        color: 'white',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), #141414)',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '800px',
          display: 'flex',
          justifyContent: 'flex-start',
          mb: 4,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleCancel}
          sx={{ color: '#b3b3b3', '&:hover': { color: 'white' } }}
        >
          Back to Home
        </Button>
      </Box>

      <Typography
        variant="h2"
        sx={{ fontWeight: 700, mb: 4, fontFamily: '"Outfit", sans-serif' }}
      >
        Edit Profile
      </Typography>

      <Paper
        sx={{
          p: 4,
          backgroundColor: '#1f1f1f',
          maxWidth: '600px',
          width: '100%',
          borderRadius: '8px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            mb: 4,
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Avatar
            src={selectedAvatar}
            sx={{ width: 120, height: 120, borderRadius: '4px' }}
            variant="rounded"
          />
          <Box sx={{ flexGrow: 1, width: '100%' }}>
            <TextField
              fullWidth
              label="Name"
              variant="filled"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{
                backgroundColor: '#333',
                borderRadius: '4px',
                input: { color: 'white' },
                label: { color: '#8c8c8c' },
                '& .MuiFilledInput-root': {
                  backgroundColor: '#333',
                  '&:hover': { backgroundColor: '#444' },
                  '&.Mui-focused': { backgroundColor: '#444' },
                },
              }}
            />
          </Box>
        </Box>

        <Typography variant="h5" sx={{ mb: 2, color: '#e5e5e5' }}>
          Choose Icon
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {AVATARS.map((avatar, index) => (
            <Grid item key={avatar.id}>
              <Avatar
                src={avatar.url}
                alt={avatar.label}
                variant="rounded"
                sx={{
                  width: 80,
                  height: 80,
                  cursor: 'pointer',
                  border:
                    selectedAvatar === avatar.url
                      ? '3px solid white'
                      : '3px solid transparent',
                  '&:hover': { border: '3px solid #b3b3b3' },
                  transition: 'all 0.2s',
                  borderRadius: '4px',
                }}
                onClick={() => setSelectedAvatar(avatar.url)}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    FALLBACK_AVATARS[index % FALLBACK_AVATARS.length];
                }}
              />
            </Grid>
          ))}
          {/* Add a few purely colored ones as requested "blue red yellow color icos" */}
          {[
            { color: '#e50914', label: 'Red' }, // Netflix Red
            { color: '#0071eb', label: 'Blue' },
            { color: '#f5c518', label: 'Yellow' }, // IMDb Yellow-ish
          ].map((item) => (
            <Grid item key={item.color}>
              <Box
                onClick={() =>
                  setSelectedAvatar(
                    `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=${item.color.replace('#', '')}&color=fff&size=256`
                  )
                }
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: item.color,
                  cursor: 'pointer',
                  borderRadius: '4px',
                  border: selectedAvatar.includes(item.color.replace('#', ''))
                    ? '3px solid white'
                    : '3px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  '&:hover': { opacity: 0.8 },
                }}
              >
                <Typography variant="h4">^_^</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start' }}>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              backgroundColor: 'white',
              color: 'black',
              fontWeight: 'bold',
              px: 4,
              py: 1,
              '&:hover': { backgroundColor: '#c0c0c0' },
            }}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{
              color: '#8c8c8c',
              borderColor: '#8c8c8c',
              fontWeight: 'bold',
              px: 4,
              py: 1,
              '&:hover': { borderColor: 'white', color: 'white' },
            }}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;
