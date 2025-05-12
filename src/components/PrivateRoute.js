import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = useSelector((state) => state.auth.token);
  const location = useLocation();

  if (!token) {
    // Not logged in, redirect to login page with state to return after login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logged in, render the children components
  return children;
};

export default PrivateRoute;
