import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireAll = false 
}) => {
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role(s)
  const hasRequiredRole = requireAll
    ? allowedRoles.every(role => user.role === role)
    : allowedRoles.includes(user.role);

  if (!hasRequiredRole) {
    // Redirect to appropriate dashboard based on user role
    const roleRedirectMap = {
      'superAdmin': '/superadmin/dashboard',
      'teacher': '/teacher/dashboard',
      'user': '/student/dashboard'
    };
    
    const redirectPath = roleRedirectMap[user.role] || '/';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default RoleProtectedRoute;
