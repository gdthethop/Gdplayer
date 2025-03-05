import { Box, Button, Typography } from '@mui/material';
import './App.css';
import { useNavigate } from 'react-router-dom';


function App() {
  const navigate = useNavigate();

  const handleClk = () => {
    try {
      navigate('/login');
    } catch (error) {
      console.error("Navigation to login failed:", error);
    }
  };

  const submit = () => {
    try {
      navigate('/signup');
    } catch (error) {
      console.error("Navigation to signup failed:", error);
    }
  };

  return (
    <div className="App">
      <div className="overlay"></div>
      <div className="head">
        <img src="https://static.wixstatic.com/media/248e22_bcee6db47d30487d92553a8147c86cad~mv2.png" alt="Logo" id='logo'/>
      <Typography variant="h3" sx={{ color: '#a80000' ,fontWeight:600}}>
        Welcome to Gd Player
      </Typography>
      </div>
      <Box className="but">
      <Button 
        aria-label="Login"
        type="submit"
        variant="contained"
        sx={{ mt: 3, mb: 2, padding: 1.5, backgroundColor: '#a80000', color: 'white' }}
        onClick={handleClk}
      >
        Login
      </Button>
      <Typography variant="h6" sx={{ color: '#a80000' }}>
        or
      </Typography>
      <Button
        aria-label="Sign Up"
        type="submit"
        variant="contained"
        sx={{ mt: 3, mb: 2, padding: 1.5, backgroundColor: '#a80000', color: 'white' }}
        onClick={submit}
      >
        Sign Up
      </Button>
      </Box>
    </div>
  );
}

export default App;
