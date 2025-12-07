import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CssBaseline,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Custom theme
const theme = createTheme({
  palette: {
    primary: { main: '#ff0000' },
    background: { default: '#000000' },
    text: { primary: '#ffffff' },
  },
  typography: { fontFamily: '"Outfit", Arial, sans-serif' },
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/reset-password/${token}`,
        { password, confirmPassword },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setMessage(response.data.message || 'Password reset successful!');
      setPassword('');
      setConfirmPassword('');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Failed to reset password. The link may be expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          backgroundImage: 'url(background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#141414',
        }}
      >
        <Container component="main" maxWidth="xs">
          <Paper
            elevation={10}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              borderRadius: 2,
              width: '100%',
            }}
          >
            {/* Header */}
            <Box
              sx={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}
            >
              <img
                src={process.env.PUBLIC_URL + '/logo.png'}
                alt="logo"
                style={{ width: 60, marginRight: 10 }}
              />
              <Typography
                variant="h6"
                sx={{ color: '#a80000', fontWeight: 'bold' }}
              >
                Gd Player
              </Typography>
            </Box>

            {/* Reset Password Form */}
            <Typography variant="h5" sx={{ marginBottom: 2, fontWeight: 800 }}>
              Create New Password
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#b3b3b3', textAlign: 'center', marginBottom: 3 }}
            >
              Enter your new password below.
            </Typography>

            {message && (
              <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                {message}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{ width: '100%' }}
            >
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#b3b3b3' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  backgroundColor: '#333',
                  borderRadius: 1,
                  input: { color: '#ffffff' },
                  label: { color: '#b3b3b3' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#555' },
                    '&:hover fieldset': { borderColor: '#777' },
                    '&.Mui-focused fieldset': { borderColor: '#a80000' },
                  },
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                        sx={{ color: '#b3b3b3' }}
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  backgroundColor: '#333',
                  borderRadius: 1,
                  input: { color: '#ffffff' },
                  label: { color: '#b3b3b3' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#555' },
                    '&:hover fieldset': { borderColor: '#777' },
                    '&.Mui-focused fieldset': { borderColor: '#a80000' },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  padding: 1.5,
                  backgroundColor: '#a80000',
                  '&:hover': { backgroundColor: '#8a0000' },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Reset Password'
                )}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => navigate('/login')}
                sx={{
                  color: '#b3b3b3',
                  '&:hover': { color: 'white' },
                }}
              >
                Back to Login
              </Button>
            </Box>
          </Paper>

          {/* Footer */}
          <Typography
            variant="body2"
            sx={{ marginTop: 4, color: '#b3b3b3', textAlign: 'center' }}
          >
            © 2025 Gd Player & Gd Enterprises. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ResetPassword;
