import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

function AccountContainer() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleSignOut = () => {
    handleClose();
    dispatch(logoutUser());
    navigate('/');
  };

  // Get profile icon or use default
  const profileIcon =
    user?.profileIcon ||
    'https://i.pinimg.com/originals/bd/ee/4c/bdee4c328550aaf21aa9f43fd19e2136.png';

  return (
    <Box>
      <IconButton
        onClick={handleClick}
        sx={{
          padding: 0,
          '&:hover': { opacity: 0.8 },
        }}
      >
        <Avatar
          src={profileIcon}
          alt={user?.name || 'User'}
          variant="rounded"
          sx={{
            width: 32,
            height: 32,
            borderRadius: '4px',
          }}
        />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            minWidth: 200,
            mt: 1,
            border: '1px solid rgba(255, 255, 255, 0.15)',
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={profileIcon}
              alt={user?.name || 'User'}
              variant="rounded"
              sx={{ width: 40, height: 40, borderRadius: '4px' }}
            />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#b3b3b3' }}>
                {user?.email || ''}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.15)' }} />

        <MenuItem
          onClick={handleViewProfile}
          sx={{
            py: 1.5,
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
          }}
        >
          <PersonIcon sx={{ mr: 1.5, fontSize: 20 }} />
          View Profile
        </MenuItem>

        <MenuItem
          onClick={handleSignOut}
          sx={{
            py: 1.5,
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
          }}
        >
          <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
          Sign Out
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default AccountContainer;
