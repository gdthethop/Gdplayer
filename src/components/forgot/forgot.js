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
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EmailIcon from '@mui/icons-material/Email';

// Custom theme
const theme = createTheme({
  palette: {
    primary: { main: '#ff0000' },
    background: { default: '#000000' },
    text: { primary: '#ffffff' },
  },
  typography: { fontFamily: '"Outfit", Arial, sans-serif' },
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [resendCount, setResendCount] = useState(0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await sendResetEmail();
  };

  const sendResetEmail = async () => {
    setMessage('');
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/forgot-password`,
        { email },
        { headers: { 'Content-Type': 'application/json' } }
      );

      setMessage(
        response.data.message ||
          'Password reset email sent! Please check your inbox.'
      );
      setEmailSent(true);

      // First send: 60 seconds, subsequent resends: 20 seconds
      const cooldownTime = resendCount === 0 ? 60 : 20;
      setResendCount((prev) => prev + 1);
      setResendCooldown(cooldownTime);

      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Failed to send reset email. Please try again.'
      );
      setEmailSent(false);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (resendCooldown === 0) {
      sendResetEmail();
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

            {/* Forgot Password Form */}
            <Typography variant="h5" sx={{ marginBottom: 2, fontWeight: 800 }}>
              Reset Password
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#b3b3b3', textAlign: 'center', marginBottom: 3 }}
            >
              Enter your email address and we'll send you a link to reset your
              password.
            </Typography>

            {message && (
              <Alert
                severity="success"
                icon={<EmailIcon />}
                sx={{ width: '100%', mb: 2 }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  {message}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                  📧 Check your inbox and spam folder
                </Typography>
                <Typography variant="caption" sx={{ display: 'block' }}>
                  ⏱️ The link expires in 1 hour
                </Typography>
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
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
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

              {!emailSent && (
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
                    'Send Reset Link'
                  )}
                </Button>
              )}

              {emailSent && (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    padding: 1.5,
                    backgroundColor: resendCooldown > 0 ? '#666' : '#a80000',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: resendCooldown > 0 ? '#666' : '#8a0000',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  ) : resendCooldown > 0 ? (
                    `Resend in ${resendCooldown}s`
                  ) : (
                    'Resend Email'
                  )}
                </Button>
              )}

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

            {emailSent && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: 1,
                  width: '100%',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: '#b3b3b3', display: 'block', mb: 1 }}
                >
                  💡 <strong>Didn't receive the email?</strong>
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#999', display: 'block', mb: 0.5 }}
                >
                  • Check your spam/junk folder
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#999', display: 'block', mb: 0.5 }}
                >
                  • Wait a few minutes for delivery
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: '#999', display: 'block' }}
                >
                  • Click "Resend Email" to try again
                </Typography>
              </Box>
            )}
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

export default ForgotPassword;
