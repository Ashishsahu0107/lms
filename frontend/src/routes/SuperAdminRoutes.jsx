import React from "react";
import { Route } from "react-router-dom";

import SuperAdminLayout from "../layouts/SuperAdminLayout";

import SuperAdminDashboard from "../pages/superadmin/Dashboard";
import ManageUsers from "../pages/superadmin/ManageUsers";
import ManageTeachers from "../pages/superadmin/ManageTeachers";
import ManageCourses from "../pages/superadmin/ManageCourses";
import SuperAdminAnalytics from "../pages/superadmin/Analytics";
import SuperAdminSettings from "../pages/superadmin/Settings";
import SystemLogs from "../pages/superadmin/SystemLogs";
import Reports from "../pages/superadmin/Reports";
import SuperAdminProfile from "../pages/superadmin/Profile";

import RoleProtectedRoute from "./RoleProtectedRoute";

/**
 * Super Admin route group:
 * - Dedicated layout
 * - Dedicated protected role guard
 * - Dedicated route tree
 */
export default function SuperAdminRoutes() {
  return (
    <Route
      element={
        <RoleProtectedRoute allowedRoles={["superAdmin"]}>
          <SuperAdminLayout />
        </RoleProtectedRoute>
      }
    >
      <Route path="superadmin/dashboard" element={<SuperAdminDashboard />} />
      <Route path="superadmin/users" element={<ManageUsers />} />
      <Route path="superadmin/teachers" element={<ManageTeachers />} />
      <Route path="superadmin/courses" element={<ManageCourses />} />
      <Route path="superadmin/analytics" element={<SuperAdminAnalytics />} />
      <Route path="superadmin/settings" element={<SuperAdminSettings />} />
      <Route path="superadmin/logs" element={<SystemLogs />} />
      <Route path="superadmin/reports" element={<Reports />} />
      <Route path="superadmin/profile" element={<SuperAdminProfile />} />
    </Route>
  );
}
