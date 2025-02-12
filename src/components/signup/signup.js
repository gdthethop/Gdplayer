import React from 'react';
import { Container, Typography, TextField, Button, Box, Link, CssBaseline, Paper } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
    const handelClk =() => {
        navigate("/login");
    }

  return (
    <Box
      sx={{
        backgroundImage: 'url(background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh', // Ensure the background covers the full screen
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ThemeProvider theme={theme}>
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
              padding: 3, // Reduced padding to decrease height
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
                marginBottom: 2, // Reduced margin to decrease height
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
            <Box component="form" noValidate sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                sx={{ backgroundColor: '#333', borderRadius: 1, input: { color: '#ffffff' } }}
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
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirm_password"
                label="Confirm Password"
                type="password"
                id="confirm_password"
                autoComplete="new-password"
                sx={{ backgroundColor: '#333', borderRadius: 1, input: { color: '#ffffff' } }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2, mb: 2, padding: 1 }} // Reduced margin and padding
              >
                Sign Up
              </Button>
            </Box>

            {/* Login Link */}
            <Box sx={{ marginTop: 2, textAlign: 'center' }}> {/* Reduced margin */}
              <Typography variant="body2" sx={{ color: '#ffffff' }}>
                Already have an account?{' '}
                <Link onClick={()=>handelClk()}sx={{ color: '#ffffff', cursor: 'pointer', textDecoration: 'none', '&:hover': { color: '#a80000'}}}>
                  Login
                </Link>
              </Typography>
            </Box>
          </Paper>

          {/* Footer */}
          <Typography
            variant="body2"
            sx={{ marginTop: 3, color: '#b3b3b3', textAlign: 'center'}} // Adjusted margin
          >
            &copy; 2025 Gd Player & Gd Enterprises. All rights reserved.
          </Typography>
        </Container>
      </ThemeProvider>
    </Box>
  );
};

export default Signup;