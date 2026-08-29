import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthProvider';
import { UserRole } from '../../constants/Enumeration/UserEnum/UserEnum';

// Enforced for Owner accounts (table stakes once real customer financial data is
// in the system): redirect to the security settings until 2FA is enrolled, rather
// than blocking login outright - a brand-new Owner has to be able to reach the
// enrolment screen in the first place.
const RequireTwoFactorSetup = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  const mfaSetupRequired =
    !!user && user.role === UserRole.Owner && !user.twoFactorEnabled;

  if (mfaSetupRequired && location.pathname !== '/settings') {
    return <Navigate to='/settings' replace />;
  }

  return <Outlet />;
};

export default RequireTwoFactorSetup;
