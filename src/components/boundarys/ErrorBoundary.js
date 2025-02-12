import React, { Component } from "react";
import { Box, Typography } from "@mui/material";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by Error Boundary:", error, errorInfo);
  }

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
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
