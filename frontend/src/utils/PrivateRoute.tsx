import React from 'react';
import { useAuth } from '../context/AuthProvider';
import { Navigate, Outlet, useLocation } from 'react-router';

interface IPrivateRoute {
  children?: React.ReactNode;
}

const PrivateRoute = ({ children }: IPrivateRoute) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user === null) {
    return <Navigate to='/signin' state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;
