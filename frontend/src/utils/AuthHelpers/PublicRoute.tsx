import React from 'react';
import { useAuth } from '../../context/AuthProvider';
import { Navigate, Outlet } from 'react-router';
import ScreenLoader from '../../components/CustomElements/Loaders/ScreenLoader';

interface IPublicRoute {
  children?: React.ReactNode;
}

const PublicRoute = ({ children }: IPublicRoute) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <ScreenLoader />;
  }

  if (user) {
    return <Navigate to='/home' replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PublicRoute;
