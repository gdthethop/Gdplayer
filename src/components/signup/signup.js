import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Container, Typography, TextField, Button, Box, Link, CssBaseline, Paper } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles'; // Import createTheme
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { signupUser } from '../../redux/authSlice'; // Import signupUser action

// Define the theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#ff0000', // Red color
    },
    background: {
      default: '#000000', // Black background
    },
    text: {
      primary: '#ffffff', // White text
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
  },
});

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); // Reset error state
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      await dispatch(signupUser({ name, email, password })).unwrap();
      navigate("/"); // Navigate to home page after successful signup
    } catch (error) {
      setError(error.response?.data?.error || "Signup failed. Please try again.");
      console.error("Signup failed:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleClk = () => {
    navigate("/login");
  };

  return (
    <Box
      sx={{
        backgroundImage: 'url(background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ThemeProvider theme={theme}> {/* Wrap with ThemeProvider */}
        <CssBaseline />
        <Container
          component="main"
          maxWidth="xs"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Paper
            elevation={10}
            sx={{
              padding: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              borderRadius: 2,
              width: '100%',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 2,
              }}
            >
              <img
                src="logo.png"
                alt="logo"
                style={{ width: 60, marginRight: 10 }}
              />
              <Typography variant="h6" sx={{ color: '#a80000' }}>
                Gd Player
              </Typography>
            </Box>

            {/* Signup Form */}
            <Typography component="h1" variant="h5" sx={{ marginBottom: 2, fontWeight: 800 }}>
              Sign Up
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: 2 }}>
              Please fill in this form to create an account.
            </Typography>
            <Box component="form" noValidate sx={{ width: '100%' }} onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Name"
                name="name"
                autoComplete="name"
                autoFocus
                sx={{ backgroundColor: '#333', borderRadius: 1, input: { color: '#ffffff' } }}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                sx={{ backgroundColor: '#333', borderRadius: 1, input: { color: '#ffffff' } }}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="new-password"
                sx={{ backgroundColor: '#333', borderRadius: 1, input: { color: '#ffffff' } }}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirm_password"
                autoComplete="new-password"
                sx={{ backgroundColor: '#333', borderRadius: 1, input: { color: '#ffffff' } }}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2, mb: 2, padding: 1 }}
                disabled={loading}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </Button>
            </Box>

            {/* Login Link */}
            <Box sx={{ marginTop: 2, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#ffffff' }}>
                Already have an account?{' '}
                <Link onClick={handleClk} sx={{ color: '#ffffff', cursor: 'pointer', textDecoration: 'none', '&:hover': { color: '#a80000' } }}>
                  Login
                </Link>
              </Typography>
            </Box>
          </Paper>

          {/* Footer */}
          <Typography
            variant="body2"
            sx={{ marginTop: 3, color: '#b3b3b3', textAlign: 'center' }}
          >
            &copy; 2025 Gd Player & Gd Enterprises. All rights reserved.
          </Typography>
        </Container>
      </ThemeProvider>
    </Box>
  );
};

export default Signup;
