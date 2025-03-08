import { useState} from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './App.css';

function App() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  const handleVideoEnd = () => {
    setTimeout(() => {
      setShowContent(true);
    }, 1000); // 1-second delay after video ends (5s video + 1s delay = 6s total transition)
  };

  return (
    <div className="App">
      {!showContent && (
        <video
          className="background-video"
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
        >
          <source
            src="https://res.cloudinary.com/dgumrxhqy/video/upload/quohqkq4btnldjorkl5h.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      )}
      <div className={`content ${showContent ? 'fade-in' : ''}`}>
        <div className="overlay"></div>
        <div className="head">
          <img src="https://static.wixstatic.com/media/248e22_bcee6db47d30487d92553a8147c86cad~mv2.png" alt="Logo" id="logo" />
          <Typography variant="h3" sx={{ color: '#a80000', fontWeight: 600, fontSize:{ xs:'34px', md: '40px'}}}>
            Welcome to Gd Player
          </Typography>
        </div>
        <Box className="but">
          <Button
            aria-label="Login"
            variant="contained"
            sx={{ mt: 3, mb: 2, padding: 1.5, backgroundColor: '#a80000', color: 'white' }}
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
          <Typography variant="h6" sx={{ color: '#a80000' }}>or</Typography>
          <Button
            aria-label="Sign Up"
            variant="contained"
            sx={{ mt: 3, mb: 2, padding: 1.5, backgroundColor: '#a80000', color: 'white' }}
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </Button>
        </Box>
      </div>
    </div>
  );
}

export default App;
