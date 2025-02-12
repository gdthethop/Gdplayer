import * as React from 'react';
import { AuthenticationContext, SessionContext } from '@toolpad/core/AppProvider';
import { Account } from '@toolpad/core/Account';
// import { NavigateBefore } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const demoSession = {
  user: {
    name: 'Gd Player',
    email: 'gdpvtl@gmail.com',
    image: '12345',
  },
};

const AccountContainer = () => {
  const [session, setSession] = React.useState(demoSession);
  const navigate = useNavigate();

  const authentication = React.useMemo(() => ({
    signIn: () => navigate("/login"),
    signOut: () => setSession(null),
  }), [navigate]);

  return (
    <AuthenticationContext.Provider value={authentication} >
      <SessionContext.Provider value={session} >
        <Account />
      </SessionContext.Provider>
    </AuthenticationContext.Provider>
  );
};

export default AccountContainer;
