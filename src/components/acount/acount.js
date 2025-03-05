import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AuthenticationContext, SessionContext } from '@toolpad/core/AppProvider';
import { Account } from '@toolpad/core/Account';
import { logoutUser } from '../../redux/authSlice';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';

function AccountContainer() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user); // Get user from Redux store
  const [session, setSession] = React.useState(user ? { user } : null); // Initialize session with user
  const navigate = useNavigate();

  // Use useEffect to update session whenever user data changes
  React.useEffect(() => {
    setSession(user ? { user } : null); // Update session when Redux user state changes
  }, [user]); // Dependency on `user` to re-render when it changes

  const authentication = React.useMemo(() => ({
    signOut: () => {
      setSession(null);
      dispatch(logoutUser()); // Clear Redux state on sign out
      navigate('/'); // Redirect to login page after sign out
    },
  }), [dispatch]);

  return (
    <AuthenticationContext.Provider value={authentication}>
    <SessionContext.Provider value={session}>
      <Box sx={{ padding: '10px' }}> {/* Added padding for mobile view */}
        {user ? (
        <Account 
          user={user} 
          sx={{ width: '100%', height: 'auto' }} // Ensure it fits well in mobile view
        /> 
      ) : null}
      </Box>
    </SessionContext.Provider>
  </AuthenticationContext.Provider>
  );
}

export default AccountContainer;
