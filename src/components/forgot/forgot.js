import React from "react";
import { Container, Typography, TextField, Button, Box, CssBaseline, Paper } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

// Custom theme
const theme = createTheme({
  palette: {
    primary: { main: "#ff0000" },
    background: { default: "#000000" },
    text: { primary: "#ffffff" },
  },
  typography: { fontFamily: "Arial, sans-serif" },
});

const ForgotPassword = () => {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle password reset logic here (e.g., API call)
    alert("Password reset instructions sent!");
    navigate("/login"); // Redirect to login after submission
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          backgroundImage: "url(background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container component="main" maxWidth="xs">
          <Paper
            elevation={10}
            sx={{
              padding: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              borderRadius: 2,
              width: "100%",
            }}
          >
            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", marginBottom: 3 }}>
              <img src="logo.png" alt="logo" style={{ width: 60, marginRight: 10 }} />
              <Typography variant="h6" sx={{ color: "#a80000", fontWeight: "bold" }}>
                Gd Player
              </Typography>
            </Box>

            {/* Forgot Password Form */}
            <Typography variant="h5" sx={{ marginBottom: 2, fontWeight: 800}}>
              Update Password, Email
            </Typography>
            <Typography variant="body2" sx={{ color: "#b3b3b3", textAlign: "center", marginBottom: 3 }}>
              We will send you an email with instructions on how to reset your password.
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: "100%" }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="name@example.com"
                name="email"
                autoComplete="email"
                sx={{ backgroundColor: "#333", borderRadius: 1, input: { color: "#ffffff" } }}
              />
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, padding: 1.5 }}>
                Email me
              </Button>
            </Box>
          </Paper>

          {/* Footer */}
          <Typography variant="body2" sx={{ marginTop: 4, color: "#b3b3b3", textAlign: "center" }}>
            &copy; 2025 Gd Player & Gd Enterprises. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ForgotPassword;
