import React from 'react';
import { Container, Typography, TextField, Button, Box, Link, CssBaseline, Paper } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// Custom theme for Material-UI
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

const Login = () => {
    const navigate = useNavigate();
    const handelClk =() => {
        navigate("/signup");
    }
    const handleForgotClk = () => {
        navigate("/forgot");
        }

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
              padding: 4,
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
                marginBottom: 3,
              }}
            >
              <img
                src="logo.png"
                alt="logo"
                style={{ width: 60, marginRight: 10 }}
              />
              <Typography variant="h6" sx={{ color: '#a80000', fontWeight: 'bold' }}>
                Gd Player
              </Typography>
            </Box>

            {/* Login Form */}
            <Typography component="h1" variant="h5" sx={{ marginBottom: 2, fontWeight: 800 }}>
              Sign In
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: 2 }}>
            Welcome, please sign in to continue
            </Typography>
            <Box component="form" noValidate sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Email or Phone Number"
                name="username"
                autoComplete="username"
                autoFocus
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
                autoComplete="current-password"
                sx={{ backgroundColor: '#333', borderRadius: 1, input: { color: '#ffffff' } }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, padding: 1.5 }}
              >
                Login
              </Button>
              <Box sx={{ textAlign: 'right' }}>
                <Link onClick= {()=> handleForgotClk()}variant="body2" sx={{ color: '#ffffff' , textDecoration: 'none', '&:hover': { color: '#a80000' } }}>
                  Forgot Password?
                </Link>
              </Box>
            </Box>

            {/* Registration Link */}
            <Box sx={{ marginTop: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#ffffff' }}>
                New to Gd Player?{' '}
                <Link onClick={() => handelClk()} sx={{ color: '#ffffff', textDecoration: 'none', cursor: 'pointer', '&:hover': { color: '#a80000' } }}>
                  Sign up now
                </Link>
              </Typography>
            </Box>
          </Paper>

          {/* Footer */}
          <Typography
            variant="body2"
            sx={{ marginTop: 4, color: '#b3b3b3', textAlign: 'center' }}
          >
            &copy; 2025 Gd Player & Gd Enterprises. All rights reserved.
          </Typography>
        </Container>
    </ThemeProvider>
    </Box>
  );
};

export default Login;