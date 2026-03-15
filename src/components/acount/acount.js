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
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {
  fetchNotifications,
  markNotificationRead,
} from '../../redux/notificationSlice';

function AccountContainer() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items: notifications, unreadCount } = useSelector(
    (state) => state.notifications
  );
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const notifOpen = Boolean(notifAnchorEl);

  React.useEffect(() => {
    if (user) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, user]);

  const handleNotifClick = (event) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const handleNotifClose = () => {
    setNotifAnchorEl(null);
    // Optional: mark all read on close? No, prefer explicit click or explicit 'Mark All' button.
  };

  const handleNotificationItemClick = (notification) => {
    dispatch(markNotificationRead(notification._id));
    if (notification.link) {
      navigate(notification.link);
    }
    handleNotifClose();
  };

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

  const handleLogin = () => navigate('/login');
  const handleSignup = () => navigate('/signup');

  if (!user) {
    return (
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <Button
          onClick={handleLogin}
          sx={{
            color: 'white',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: { xs: '13px', sm: '14px' },
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          }}
        >
          Login
        </Button>
        <Button
          onClick={handleSignup}
          variant="contained"
          sx={{
            bgcolor: '#c10000',
            color: 'white',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: { xs: '13px', sm: '14px' },
            borderRadius: '24px',
            px: { xs: 2, sm: 3 },
            '&:hover': { bgcolor: '#a00000' },
          }}
        >
          Sign Up
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <IconButton onClick={handleNotifClick} sx={{ color: 'white' }}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={notifAnchorEl}
        open={notifOpen}
        onClose={handleNotifClose}
        PaperProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            color: 'white',
            minWidth: 300,
            maxHeight: 400,
            mt: 1,
            border: '1px solid rgba(255, 255, 255, 0.15)',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="h6" fontSize="16px">
            Notifications
          </Typography>
        </Box>
        <List sx={{ p: 0 }}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText primary="No notifications" />
            </ListItem>
          ) : (
            notifications.map((notif) => (
              <ListItem
                key={notif._id}
                button
                onClick={() => handleNotificationItemClick(notif)}
                sx={{
                  opacity: notif.isRead ? 0.6 : 1,
                  bgcolor: notif.isRead
                    ? 'transparent'
                    : 'rgba(255,255,255,0.05)',
                }}
              >
                <ListItemText
                  primary={notif.message}
                  secondary={new Date(notif.createdAt).toLocaleDateString()}
                  primaryTypographyProps={{
                    fontSize: '14px',
                    fontWeight: notif.isRead ? 400 : 700,
                  }}
                  secondaryTypographyProps={{ fontSize: '12px', color: '#aaa' }}
                />
              </ListItem>
            ))
          )}
        </List>
      </Menu>
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
          onClick={() => {
            handleClose();
            navigate('/gd');
          }}
          sx={{
            py: 1.5,
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
          }}
        >
          <VideoCallIcon sx={{ mr: 1.5, fontSize: 20 }} />
          Create Video
        </MenuItem>

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
