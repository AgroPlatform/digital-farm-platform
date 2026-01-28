import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

type ProtectedRouteProps = {
  isAuthenticated: boolean;
  children: React.ReactElement;
};

function ProtectedRoute({ isAuthenticated, children }: ProtectedRouteProps) {
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
