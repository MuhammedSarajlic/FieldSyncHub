import React from 'react';
import { useAuth } from '../context/AuthProvider';
import { Navigate, Outlet } from 'react-router';

interface IPublicRoute {
  children?: React.ReactNode;
}

const PublicRoute = ({ children }: IPublicRoute) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to='/home' replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PublicRoute;
