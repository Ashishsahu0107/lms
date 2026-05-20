import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// Map roles to their dashboard paths
const roleRedirects = {
  super_admin: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
};

export default function RoleGuard({ children, allowedRoles = [] }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to the user's own dashboard based on their role
    const redirectPath = roleRedirects[role] || "/login";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

