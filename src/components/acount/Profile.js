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
import { updateUserProfileAsync } from '../../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios'; // Import axios
import { CircularProgress, Snackbar, Alert } from '@mui/material';

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
  const token = useSelector((state) => state.auth.token); // Need token for direct calls

  const [name, setName] = useState(user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(
    user?.profileIcon ||
      'https://i.pinimg.com/originals/bd/ee/4c/bdee4c328550aaf21aa9f43fd19e2136.png'
  );
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 2FA State
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [twoFactorToken, setTwoFactorToken] = useState('');

  // Session State
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // Fetch Sessions
  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/sessions`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSessions(res.data);
    } catch (error) {
      console.error('Failed to fetch sessions', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (token) fetchSessions();
  }, [token]);

  const handleRevokeSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to revoke this session?'))
      return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/sessions/${sessionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh list
      fetchSessions();
    } catch (error) {
      console.error('Failed to revoke session', error);
      alert('Failed to revoke session');
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      // If user has a profileIcon, ensure it's selected. If not, default to red avatar
      setSelectedAvatar(
        user.profileIcon ||
          'https://i.pinimg.com/originals/bd/ee/4c/bdee4c328550aaf21aa9f43fd19e2136.png'
      );
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(
        updateUserProfileAsync({ name, profileIcon: selectedAvatar })
      ).unwrap();
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  // 2FA Handlers
  const handleSetup2FA = async () => {
    setShow2FASetup(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/2fa/generate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setQrCodeUrl(res.data.qrCode);
    } catch (error) {
      console.error('Failed to generate 2FA', error);
      alert('Failed to start 2FA setup');
      setShow2FASetup(false);
    }
  };

  const handleVerify2FA = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/2fa/verify`,
        { token: twoFactorToken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('2FA Enabled Successfully!');
      setShow2FASetup(false);
      setQrCodeUrl(null);
      setTwoFactorToken('');
      // Update local user state
      dispatch({
        type: 'auth/updateUserProfile',
        payload: { isTwoFactorEnabled: true },
      });
    } catch (error) {
      console.error('Failed to verify 2FA', error);
      alert('Invalid Code. Please try again.');
    }
  };

  const handleDisable2FA = async () => {
    if (
      !window.confirm(
        'Are you sure you want to disable 2FA? This makes your account less secure.'
      )
    )
      return;

    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/2fa/disable`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('2FA Disabled.');
      // Update local user state
      dispatch({
        type: 'auth/updateUserProfile',
        payload: { isTwoFactorEnabled: false },
      });
    } catch (error) {
      console.error('Failed to disable 2FA', error);
      alert('Failed to disable 2FA');
    }
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
          justifyContent: 'space-between',
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

        <Button
          variant="contained"
          onClick={() => navigate('/studio')}
          sx={{
            bgcolor: '#252525',
            color: 'white',
            '&:hover': { bgcolor: '#444' },
          }}
        >
          Creator Studio
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
            disabled={saving}
            sx={{
              backgroundColor: 'white',
              color: 'black',
              fontWeight: 'bold',
              px: 4,
              py: 1,
              '&:hover': { backgroundColor: '#c0c0c0' },
            }}
          >
            {saving ? (
              <CircularProgress size={24} sx={{ color: 'black' }} />
            ) : (
              'Save'
            )}
          </Button>
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={saving}
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

      {/* Security Section */}
      <Paper
        sx={{
          p: 4,
          mt: 4,
          backgroundColor: '#1f1f1f',
          maxWidth: '600px',
          width: '100%',
          borderRadius: '8px',
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, color: '#e5e5e5' }}>
          Security
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ color: 'white' }}>
              Two-Factor Authentication
            </Typography>
            <Typography variant="body2" sx={{ color: '#b3b3b3' }}>
              Add an extra layer of security to your account.
            </Typography>
          </Box>
          <Button
            variant={user?.isTwoFactorEnabled ? 'contained' : 'outlined'}
            color={user?.isTwoFactorEnabled ? 'success' : 'primary'}
            onClick={() => {
              if (user?.isTwoFactorEnabled) {
                handleDisable2FA();
              } else {
                handleSetup2FA();
              }
            }}
          >
            {user?.isTwoFactorEnabled ? 'Enabled' : 'Enable 2FA'}
          </Button>
        </Box>

        {/* 2FA Setup Area */}
        {show2FASetup && (
          <Box sx={{ mt: 3, p: 2, border: '1px solid #333', borderRadius: 2 }}>
            {qrCodeUrl ? (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Scan this QR code with your authenticator app (e.g. Google
                  Authenticator)
                </Typography>
                <img
                  src={qrCodeUrl}
                  alt="2FA QR Code"
                  style={{ borderRadius: 8, marginBottom: 16 }}
                />

                <TextField
                  label="Enter 6-digit Code"
                  variant="filled"
                  fullWidth
                  value={twoFactorToken}
                  onChange={(e) => setTwoFactorToken(e.target.value)}
                  sx={{
                    backgroundColor: '#333',
                    input: {
                      color: 'white',
                      textAlign: 'center',
                      letterSpacing: 4,
                    },
                    mb: 2,
                  }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleVerify2FA}
                  disabled={!twoFactorToken || twoFactorToken.length < 6}
                >
                  Verify & Enable
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
        )}

        {/* Active Sessions */}
        <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #333' }}>
          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            Active Sessions
          </Typography>
          <Typography variant="body2" sx={{ color: '#b3b3b3', mb: 3 }}>
            Manage devices and locations where you are signed in.
          </Typography>

          {sessions.map((session) => (
            <Box
              key={session._id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
                p: 2,
                bgcolor: '#252525',
                borderRadius: 2,
              }}
            >
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ color: '#fff', fontWeight: 'bold' }}
                >
                  {session.userAgent
                    ? session.userAgent.includes('Mac')
                      ? 'Mac/iOS Device'
                      : session.userAgent.includes('Windows')
                        ? 'Windows Device'
                        : 'Unknown Device'
                    : 'Unknown Device'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#888', display: 'block' }}
                >
                  IP: {session.ipAddress}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: session.isCurrent ? '#4caf50' : '#888' }}
                >
                  {session.isCurrent
                    ? 'Current Session'
                    : `Last active: ${new Date(session.lastActive).toLocaleDateString()}`}
                </Typography>
              </Box>
              {!session.isCurrent && (
                <Button
                  color="error"
                  size="small"
                  onClick={() => handleRevokeSession(session._id)}
                >
                  Revoke
                </Button>
              )}
            </Box>
          ))}

          {loadingSessions && <CircularProgress size={20} />}
        </Box>
      </Paper>

      <Snackbar
        open={showSuccess}
        autoHideDuration={1500}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Profile updated successfully!
        </Alert>
      </Snackbar>
      <Typography
        variant="body2"
        sx={{
          marginTop: 8,
          marginBottom: 4,
          color: '#b3b3b3',
          textAlign: 'center',
          width: '100%',
        }}
      >
        &copy; 2025 Gd Player & Gd Enterprises. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Profile;
