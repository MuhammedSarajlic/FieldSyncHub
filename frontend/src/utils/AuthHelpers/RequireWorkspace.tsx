import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../context/AuthProvider';

const RequireWorkspace = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user && !user.workspace && user.role !== 2) {
    return <Navigate to='/workspace' replace />;
  }

  return <Outlet />;
};

export default RequireWorkspace;
