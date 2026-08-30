import React from 'react';
import { useAuth } from '../../context/AuthProvider';
import { Navigate, Outlet, useLocation } from 'react-router';
import ScreenLoader from '../../components/CustomElements/Loaders/ScreenLoader';

interface IPrivateRoute {
  children?: React.ReactNode;
}

const PrivateRoute = ({ children }: IPrivateRoute) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <ScreenLoader />;
  }

  if (user === null) {
    return <Navigate to='/signin' state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;
