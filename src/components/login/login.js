import React from 'react';
import { useDispatch } from 'react-redux';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  CssBaseline,
  Paper,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error, setError] = React.useState('');
  const [requires2FA, setRequires2FA] = React.useState(false); // New state for 2FA
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const onSubmit = async (data) => {
    // Log the submitted data
    setError('');
    console.log('Logging in...', data);

    try {
      const result = await dispatch(loginUser(data)).unwrap();

      if (result.requires2FA) {
        setRequires2FA(true);
        // Don't navigate yet
        return;
      }

      const from = location.state?.from?.pathname || '/home';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login Error Object:', error);
      // Handle 2FA specific error or general error
      // Redux toolkit rejectWithValue might return the error payload directly or wrapped.
      // Adjust based on how authSlice returns errors.
      // Assuming standard error string or object:
      if (requires2FA && error.message === 'Invalid 2FA Code') {
        setError('Invalid 2FA Code. Please try again.');
      } else {
        setError(error.message || error.error || 'Invalid email or password');
      }
    }
  };

  const handleClk = () => {
    navigate('/signup');
  };

  const handleForgotClk = () => {
    navigate('/forgot');
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
              onClick={() => navigate('/')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 3,
                cursor: 'pointer',
              }}
            >
              <img
                src="logo.png"
                alt="logo"
                style={{ width: 60, marginRight: 10 }}
              />
              <Typography
                variant="h6"
                sx={{ color: '#a80000', fontWeight: 'bold' }}
              >
                Gd Player
                <Typography
                  component="span"
                  sx={{
                    fontSize: '10px',
                    color: 'gray',
                    marginLeft: '4px',
                    verticalAlign: 'super',
                  }}
                >
                  v1.3.0
                </Typography>
              </Typography>
            </Box>

            {/* Login Form */}
            <Typography
              component="h1"
              variant="h5"
              sx={{ marginBottom: 2, fontWeight: 800 }}
            >
              {requires2FA ? 'Two-Factor Authentication' : 'Sign In'}
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: 2 }}>
              {requires2FA
                ? 'Please enter the code from your authenticator app'
                : 'Welcome, please sign in to continue'}
            </Typography>
            <Box
              component="form"
              noValidate
              sx={{ width: '100%' }}
              onSubmit={handleSubmit(onSubmit)}
            >
              {!requires2FA ? (
                <>
                  <Controller
                    name="email"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: 'Email is required',
                      pattern: {
                        value:
                          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: 'Invalid email address',
                      },
                    }}
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
                        sx={{
                          backgroundColor: '#333',
                          borderRadius: 1,
                          input: { color: '#ffffff' },
                        }}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                      />
                    )}
                  />
                  <Controller
                    name="password"
                    control={control}
                    defaultValue=""
                    rules={{
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    }}
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
                        sx={{
                          backgroundColor: '#333',
                          borderRadius: 1,
                          input: { color: '#ffffff' },
                        }}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                      />
                    )}
                  />
                </>
              ) : (
                <Controller
                  name="token"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: '2FA Code is required',
                    minLength: {
                      value: 6,
                      message: 'Code must be 6 digits',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      margin="normal"
                      required
                      fullWidth
                      name="token"
                      label="Authentication Code"
                      type="text"
                      id="token"
                      autoFocus
                      autoComplete="one-time-code"
                      sx={{
                        backgroundColor: '#333',
                        borderRadius: 1,
                        input: {
                          color: '#ffffff',
                          letterSpacing: 4,
                          textAlign: 'center',
                        },
                      }}
                      error={!!errors.token}
                      helperText={errors.token?.message}
                    />
                  )}
                />
              )}

              {error && (
                <Typography
                  color="error"
                  sx={{ textAlign: 'center', color: '#a80000', mt: 1 }}
                >
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, padding: 1.5 }}
              >
                {requires2FA ? 'Verify' : 'Login'}
              </Button>
              <Box sx={{ textAlign: 'right' }}>
                {!requires2FA && (
                  <Link
                    onClick={handleForgotClk}
                    variant="body2"
                    sx={{
                      color: '#ffffff',
                      textDecoration: 'none',
                      '&:hover': { color: '#a80000' },
                    }}
                  >
                    Forgot Password?
                  </Link>
                )}
              </Box>
            </Box>

            {/* Registration Link */}
            <Box sx={{ marginTop: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#ffffff' }}>
                New to Gd Player?{' '}
                <Link
                  onClick={handleClk}
                  sx={{
                    color: '#ffffff',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    '&:hover': { color: '#a80000' },
                  }}
                >
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
