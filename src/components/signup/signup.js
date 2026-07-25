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
  Divider,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { signupUser, googleLogin } from '../../redux/authSlice';
import { GoogleLogin } from '@react-oauth/google';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff0000',
    },
    background: {
      default: '#000000',
    },
    text: {
      primary: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
  },
});

const Signup = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const password = watch('password', '');

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      await dispatch(
        signupUser({
          name: data.name,
          email: data.email,
          password: data.password,
        })
      ).unwrap();
      navigate('/');
    } catch (error) {
      setError(
        error.response?.data?.error || 'Signup failed. Please try again.'
      );
      console.error('Signup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClk = () => {
    navigate('/login');
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      await dispatch(googleLogin(credentialResponse.credential)).unwrap();
      navigate('/home');
    } catch (err) {
      setError(
        err?.error || err?.message || 'Google sign-in failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed.');
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
              onClick={() => navigate('/')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 2,
                cursor: 'pointer',
              }}
            >
              <img
                src="logo.png"
                alt="logo"
                style={{ width: 60, marginRight: 10 }}
              />
              <Typography variant="h6" sx={{ color: '#a80000' }}>
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

            {/* Signup Form */}
            <Typography
              component="h1"
              variant="h5"
              sx={{ marginBottom: 2, fontWeight: 800 }}
            >
              Sign Up
            </Typography>
            <Typography variant="body2" sx={{ marginBottom: 2 }}>
              Please fill in this form to create an account.
            </Typography>
            <Box
              component="form"
              noValidate
              sx={{ width: '100%' }}
              onSubmit={handleSubmit(onSubmit)}
            >
              <Controller
                name="name"
                control={control}
                defaultValue=""
                rules={{ required: 'Name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label="Name"
                    autoComplete="name"
                    autoFocus
                    sx={{
                      backgroundColor: '#333',
                      borderRadius: 1,
                      input: { color: '#ffffff' },
                    }}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
              <Controller
                name="email"
                control={control}
                defaultValue=""
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
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
                    label="Email"
                    autoComplete="email"
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
                    autoComplete="new-password"
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
              <Controller
                name="confirmPassword"
                control={control}
                defaultValue=""
                rules={{
                  required: 'Confirm Password is required',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    id="confirm_password"
                    autoComplete="new-password"
                    sx={{
                      backgroundColor: '#333',
                      borderRadius: 1,
                      input: { color: '#ffffff' },
                    }}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                  />
                )}
              />
              {error && (
                <Typography
                  color="error"
                  sx={{ textAlign: 'center', color: '#a80000' }}
                >
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2, mb: 2, padding: 1 }}
                disabled={loading}
              >
                {loading ? 'Signing Up...' : 'Sign Up'}
              </Button>
            </Box>

            {/* OR Divider */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                my: 2,
                width: '100%',
              }}
            >
              <Divider sx={{ flex: 1, borderColor: '#444' }} />
              <Typography
                variant="body2"
                sx={{ px: 2, color: '#888', whiteSpace: 'nowrap' }}
              >
                or sign up with
              </Typography>
              <Divider sx={{ flex: 1, borderColor: '#444' }} />
            </Box>

            {/* Google Sign-Up Button */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                mb: 2,
              }}
            >
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="filled_black"
                shape="rectangular"
                size="large"
                width="100%"
                text="signup_with"
                logo_alignment="center"
              />
            </Box>

            {/* Login Link */}
            <Box sx={{ marginTop: 1, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#ffffff' }}>
                Already have an account?{' '}
                <Link
                  onClick={handleClk}
                  sx={{
                    color: '#ffffff',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    '&:hover': { color: '#a80000' },
                  }}
                >
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
