import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted location for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if specific role is required
  if (requiredRole && user.role !== requiredRole) {
    // Role-based redirect logic
    const roleRedirectMap = {
      'superAdmin': '/superadmin/dashboard',
      'teacher': '/teacher/dashboard',
      'user': '/student/dashboard'
    };
    
    const userRedirect = roleRedirectMap[user.role];
    return <Navigate to={userRedirect || '/'} replace />;
  }

  // Check role hierarchy
  const roleHierarchy = {
    'superAdmin': 3,
    'teacher': 2,
    'user': 1
  };

  if (!user || !user.role) {
    // If user data is incomplete, redirect to login
    return <Navigate to="/login" replace />;
  }

  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  if (userLevel < requiredLevel) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
