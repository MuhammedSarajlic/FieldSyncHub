import React from 'react';
import { useAuth } from '../context/AuthProvider';
import { Navigate, Outlet } from 'react-router';

interface PublicRouteProps {
  children?: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('[Public]', {
    loading,
    user,
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to='/home' replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PublicRoute;
