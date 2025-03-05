import React from 'react';
import { useDispatch } from 'react-redux';
import { Container, Typography, TextField, Button, Box, Link, CssBaseline, Paper } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { loginUser } from '../../redux/authSlice';

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
  const { control, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = React.useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Declare dispatch here

const onSubmit = async (data) => {
  console.log("Submitting data:", data); // Log the submitted data
  setError(''); // Reset error state before login attempt
  console.error("Login failed:", error);

    try {
      await dispatch(loginUser(data)).unwrap();
      navigate("/home");
    } catch (error) {
      setError(error.response?.data?.error || "Invalid email or password");
      console.error("Login failed:", error);
    }
  };

  const handleClk = () => {
    navigate("/signup");
  };

  const handleForgotClk = () => {
    navigate("/forgot");
  };

  return (
    <Box
    sx={{
      backgroundImage: 'url(./background.png)',
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
            <Box component="form" noValidate sx={{ width: '100%' }} onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="email"
                control={control}
                defaultValue=""
                rules={{ required: 'Email is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email or Phone Number"
                    autoComplete="username"
                    autoFocus
                    sx={{ backgroundColor: '#333', borderRadius: 1, input: { color: '#ffffff' } }}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
              <Controller
                name="password"
                control={control}
                defaultValue=""
                rules={{ required: 'Password is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    sx={{ backgroundColor: '#333', borderRadius: 1, input: { color: '#ffffff' } }}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                  />
                )}
              />
              {error && (
                <Typography color="error" sx={{ textAlign: 'center', color: '#a80000'}}>
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, padding: 1.5 }}
              >
                Login
              </Button>
              <Box sx={{ textAlign: 'right' }}>
                <Link onClick={handleForgotClk} variant="body2" sx={{ color: '#ffffff', textDecoration: 'none', '&:hover': { color: '#a80000' } }}>
                  Forgot Password?
                </Link>
              </Box>
            </Box>

            {/* Registration Link */}
            <Box sx={{ marginTop: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#ffffff' }}>
                New to Gd Player?{' '}
                <Link onClick={handleClk} sx={{ color: '#ffffff', textDecoration: 'none', cursor: 'pointer', '&:hover': { color: '#a80000' } }}>
                  Sign up now
                </Link>
              </Typography>
            </Box>
          </Paper>

          {/* Footer */}
          <Typography variant="body2" sx={{ marginTop: 4, color: '#b3b3b3', textAlign: 'center' }}>
            &copy; 2025 Gd Player & Gd Enterprises. All rights reserved.
          </Typography>
        </Container>
      </ThemeProvider>
    </Box>
  );
};


export default Login;
