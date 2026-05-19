import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";

import RoleGuard from "../components/routeGuard/RoleGuard";
import { ROLES } from "../constants/roles";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import PublicLayout from "../layouts/PublicLayout";
import { PageLoader } from "../components/ui/Spinner";

// Lazy load login page
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));

// Lazy load all student pages
const StudentDashboard = lazy(() => import("../pages/student/dashboard/Dashboard"));
const MyCourses = lazy(() => import("../pages/student/courses/MyCourses"));
const CourseDetails = lazy(() => import("../pages/student/courses/CourseDetails"));
const CoursePlayer = lazy(() => import("../pages/student/courses/CoursePlayer"));
const Assignments = lazy(() => import("../pages/student/assignments/Assignments"));
const Quiz = lazy(() => import("../pages/student/quiz/Quiz"));
const Messages = lazy(() => import("../pages/student/messages/Messages"));
const Certificates = lazy(() => import("../pages/student/certificates/Certificates"));
const Profile = lazy(() => import("../pages/student/profile/Profile"));
const Settings = lazy(() => import("../pages/student/settings/Settings"));

// Lazy load teacher pages
const TeacherDashboard = lazy(() => import("../pages/teacher/dashboard/TeacherDashboard"));
const CourseManagement = lazy(() => import("../pages/teacher/courses/CourseManagement"));

// Lazy load admin pages (superadmin)
const AdminDashboard = lazy(() => import("../pages/superadmin/dashboard/AdminDashboard"));
const AdminTeachers = lazy(() => import("../pages/superadmin/teachers/AdminTeachers"));
const AdminStudents = lazy(() => import("../pages/superadmin/students/AdminStudents"));
const AdminCourses = lazy(() => import("../pages/superadmin/courses/AdminCourses"));
const AdminPayments = lazy(() => import("../pages/superadmin/payments/AdminPayments"));
const AdminReports = lazy(() => import("../pages/superadmin/reports/AdminReports"));
const AdminSettings = lazy(() => import("../pages/superadmin/settings/AdminSettings"));
const AdminNotifications = lazy(() => import("../pages/superadmin/notifications/AdminNotifications"));
const AdminSecurity = lazy(() => import("../pages/superadmin/security/AdminSecurity"));
const AdminAnalytics = lazy(() => import("../pages/superadmin/analytics/AdminAnalytics"));

// Page wrapper with loading state
function PageWrapper({ children }) {
  return (
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  );
}

// Student route config
const studentRoutes = {
  path: "/student",
  allowedRoles: [ROLES.STUDENT],
  routes: [
    { path: "dashboard", element: <StudentDashboard /> },
    { path: "courses", element: <MyCourses /> },
    { path: "course/:id", element: <CourseDetails /> },
    { path: "course/:courseId/player/:lectureId", element: <CoursePlayer /> },
    { path: "assignments", element: <Assignments /> },
    { path: "quizzes", element: <Quiz /> },
    { path: "messages", element: <Messages /> },
    { path: "certificates", element: <Certificates /> },
    { path: "profile", element: <Profile /> },
    { path: "settings", element: <Settings /> },
  ],
};

// Teacher route config
const teacherRoutes = {
  path: "/teacher",
  allowedRoles: [ROLES.TEACHER],
  routes: [
    { path: "dashboard", element: <TeacherDashboard /> },
    { path: "courses", element: <CourseManagement /> },
  ],
};

// Admin route config (superadmin)
const adminRoutes = {
  path: "/admin",
  allowedRoles: [ROLES.SUPER_ADMIN],
  routes: [
    { path: "dashboard", element: <AdminDashboard /> },
    { path: "teachers", element: <AdminTeachers /> },
    { path: "students", element: <AdminStudents /> },
    { path: "courses", element: <AdminCourses /> },
    { path: "payments", element: <AdminPayments /> },
    { path: "reports", element: <AdminReports /> },
    { path: "analytics", element: <AdminAnalytics /> },
    { path: "notifications", element: <AdminNotifications /> },
    { path: "security", element: <AdminSecurity /> },
    { path: "settings", element: <AdminSettings /> },
  ],
};

// Create route elements from config
function createRoutes(config) {
  return config.routes.map((route) => ({
    path: route.path,
    element: <PageWrapper>{route.element}</PageWrapper>,
  }));
}

// Create layout with nested routes
function createRoleRoutes(config) {
  return {
    path: config.path,
    element: (
      <RoleGuard allowedRoles={config.allowedRoles}>
        <DashboardLayout role={config.allowedRoles[0].replace("_", "")}>
          <Outlet />
        </DashboardLayout>
      </RoleGuard>
    ),
    children: createRoutes(config),
  };
}

const router = createBrowserRouter([
  // Login page (public)
  {
    path: "/login",
    element: (
      <PageWrapper>
        <PublicLayout>
          <LoginPage />
        </PublicLayout>
      </PageWrapper>
    ),
  },

  // Root redirect to login
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },

  // Student routes
  createRoleRoutes(studentRoutes),

  // Teacher routes
  createRoleRoutes(teacherRoutes),

  // Admin routes (superadmin)
  createRoleRoutes(adminRoutes),

  // Catch all - redirect to login
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}

export { router };