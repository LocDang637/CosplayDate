import React from 'react';
import { Navigate } from 'react-router-dom';
import { userUtils } from '../services/api';

const AdminProtectedRoute = ({ children }) => {
  const user = userUtils.getCurrentUser();
  const isAuthenticated = userUtils.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (user?.userType !== 'Admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default AdminProtectedRoute;
