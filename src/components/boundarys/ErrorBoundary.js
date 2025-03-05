import React, { Component } from "react";
import { Box, Typography, Button } from "@mui/material";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by Error Boundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ textAlign: "center", mt: 10 }}>
          <Typography variant="h4" sx={{ color: "#FF5722" }}>
            Something went wrong!
          </Typography>
          <Typography variant="body1" sx={{ color: "#757575", mt: 2 }}>
            Please refresh the page or try again later.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 3, backgroundColor: "#FF5722", "&:hover": { backgroundColor: "#E64A19" } }}
            onClick={this.handleReset}
          >
            Try Again
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
