import { Suspense, lazy } from "react";
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
const AssignmentDetails = lazy(() => import("../pages/student/assignments/AssignmentDetails"));
const Quiz = lazy(() => import("../pages/student/quiz/Quiz"));
const Messages = lazy(() => import("../pages/student/messages/Messages"));
const Certificates = lazy(() => import("../pages/student/certificates/Certificates"));
const Profile = lazy(() => import("../pages/student/profile/Profile"));
const Settings = lazy(() => import("../pages/student/settings/Settings"));

// Lazy load teacher pages
const TeacherDashboard = lazy(() => import("../pages/teacher/dashboard/TeacherDashboard"));
const CourseManagement = lazy(() => import("../pages/teacher/courses/CourseManagement"));
const TeacherQuizzes = lazy(() => import("../pages/teacher/quizzes/TeacherQuizManagement"));
const TeacherAssignments = lazy(() => import("../pages/teacher/assignments/TeacherAssignmentManagement"));
const TeacherAssignmentDetails = lazy(() => import("../pages/teacher/assignments/TeacherAssignmentDetails"));
const TeacherProgress = lazy(() => import("../pages/teacher/progress/TeacherStudentProgress"));
const TeacherAttendance = lazy(() => import("../pages/teacher/attendance/TeacherAttendance"));

// Lazy load admin pages
const AdminDashboard = lazy(() => import("../pages/admin/dashboard/AdminDashboard"));
const UserManagement = lazy(() => import("../pages/admin/users/UserManagement"));

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
    { path: "assignments/:id", element: <AssignmentDetails /> },
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
    { path: "quizzes", element: <TeacherQuizzes /> },
    { path: "assignments", element: <TeacherAssignments /> },
    { path: "assignments/:id", element: <TeacherAssignmentDetails /> },
    { path: "student-progress", element: <TeacherProgress /> },
    { path: "attendance", element: <TeacherAttendance /> },
    { path: "messages", element: <Messages /> },
    { path: "profile", element: <Profile /> },
  ],
};

// Admin route config
const adminRoutes = {
  path: "/admin",
  allowedRoles: [ROLES.SUPER_ADMIN],
  routes: [
    { path: "dashboard", element: <AdminDashboard /> },
    { path: "users", element: <UserManagement /> },
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
  // Root redirect
  {
    path: "/",
    element: <Navigate to="/student/dashboard" replace />,
  },

  // Student routes
  createRoleRoutes(studentRoutes),

  // Teacher routes
  createRoleRoutes(teacherRoutes),

  // Admin routes
  createRoleRoutes(adminRoutes),

  // Auth routes (lazy loaded from shared)
  {
    path: "login",
    element: (
      <PageWrapper>
        <PublicLayout>
          <LoginPage />
        </PublicLayout>
      </PageWrapper>
    ),
  },

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
export { routesConfig } from "./routesConfig";