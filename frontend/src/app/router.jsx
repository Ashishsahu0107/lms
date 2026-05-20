// src/app/router.jsx

import React, { Suspense, lazy } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  Link,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  ClipboardList,
  MessageSquare,
  Award,
  Settings,
  LogOut,
  CreditCard,
  Shield,
  Bell,
  BarChart3,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";
import PublicLayout from "../layouts/PublicLayout";

// ===============================
// LAZY IMPORTS
// ===============================

// AUTH
const LoginPage = lazy(() =>
  import("../pages/auth/LoginPage")
);

// STUDENT
const StudentDashboard = lazy(() =>
  import("../pages/student/dashboard/Dashboard")
);

const MyCourses = lazy(() =>
  import("../pages/student/courses/MyCourses")
);

const Assignments = lazy(() =>
  import("../pages/student/assignments/Assignments")
);

const Quiz = lazy(() =>
  import("../pages/student/quiz/Quiz")
);

const Messages = lazy(() =>
  import("../pages/student/messages/Messages")
);

const Certificates = lazy(() =>
  import("../pages/student/certificates/Certificates")
);

const Profile = lazy(() =>
  import("../pages/student/profile/Profile")
);

const SettingsPage = lazy(() =>
  import("../pages/student/settings/Settings")
);

// TEACHER
const TeacherDashboard = lazy(() =>
  import("../pages/teacher/dashboard/TeacherDashboard")
);

const CourseManagement = lazy(() =>
  import("../pages/teacher/courses/CourseManagement")
);

// ADMIN
const AdminDashboard = lazy(() =>
  import("../pages/superadmin/dashboard/AdminDashboard")
);

const AdminTeachers = lazy(() =>
  import("../pages/superadmin/teachers/AdminTeachers")
);

const AdminStudents = lazy(() =>
  import("../pages/superadmin/students/AdminStudents")
);

const AdminCourses = lazy(() =>
  import("../pages/superadmin/courses/AdminCourses")
);

const AdminPayments = lazy(() =>
  import("../pages/superadmin/payments/AdminPayments")
);

const AdminReports = lazy(() =>
  import("../pages/superadmin/reports/AdminReports")
);

const AdminAnalytics = lazy(() =>
  import("../pages/superadmin/analytics/AdminAnalytics")
);

const AdminNotifications = lazy(() =>
  import("../pages/superadmin/notifications/AdminNotifications")
);

const AdminSecurity = lazy(() =>
  import("../pages/superadmin/security/AdminSecurity")
);

const AdminSettings = lazy(() =>
  import("../pages/superadmin/settings/AdminSettings")
);

// ===============================
// LOADER
// ===============================
function Loader() {
  return (
    <div className="flex min-h-screen items-center justify-center text-2xl font-bold">
      Loading...
    </div>
  );
}

// ===============================
// PAGE WRAPPER
// ===============================
function PageWrapper({ children }) {
  return (
    <Suspense fallback={<Loader />}>
      {children}
    </Suspense>
  );
}

// ===============================
// ROLE GUARD
// ===============================
function RoleGuard({ allowedRoles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// ===============================
// SIDEBAR ITEMS
// ===============================
const sidebarConfig = {
  student: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/student/dashboard",
    },
    {
      label: "Courses",
      icon: BookOpen,
      path: "/student/courses",
    },
    {
      label: "Assignments",
      icon: ClipboardList,
      path: "/student/assignments",
    },
    {
      label: "Quiz",
      icon: GraduationCap,
      path: "/student/quizzes",
    },
    {
      label: "Messages",
      icon: MessageSquare,
      path: "/student/messages",
    },
    {
      label: "Certificates",
      icon: Award,
      path: "/student/certificates",
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/student/settings",
    },
  ],

  teacher: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/teacher/dashboard",
    },
    {
      label: "Courses",
      icon: BookOpen,
      path: "/teacher/courses",
    },
  ],

  super_admin: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      label: "Teachers",
      icon: Users,
      path: "/admin/teachers",
    },
    {
      label: "Students",
      icon: GraduationCap,
      path: "/admin/students",
    },
    {
      label: "Courses",
      icon: BookOpen,
      path: "/admin/courses",
    },
    {
      label: "Payments",
      icon: CreditCard,
      path: "/admin/payments",
    },
    {
      label: "Reports",
      icon: ClipboardList,
      path: "/admin/reports",
    },
    {
      label: "Analytics",
      icon: BarChart3,
      path: "/admin/analytics",
    },
    {
      label: "Notifications",
      icon: Bell,
      path: "/admin/notifications",
    },
    {
      label: "Security",
      icon: Shield,
      path: "/admin/security",
    },
    {
      label: "Settings",
      icon: Settings,
      path: "/admin/settings",
    },
  ],
};

// ===============================
// DASHBOARD LAYOUT
// ===============================
function DashboardLayout() {
  const { user, logout } = useAuth();

  const location = useLocation();

  const menuItems =
    sidebarConfig[user?.role] || [];

  return (
    <div className="flex min-h-screen bg-slate-100">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">

        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold">
            LMS PRO
          </h1>
        </div>

        {/* Menu */}
        <div className="flex-1 p-4 space-y-2">

          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-800"
                }`}
              >
                <Icon className="h-5 w-5" />

                <span>{item.label}</span>
              </Link>
            );
          })}

        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">

          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl bg-red-500 px-4 py-3 hover:bg-red-600"
          >
            <LogOut className="h-5 w-5" />

            Logout
          </button>

        </div>

      </aside>

      {/* Main */}
      <main className="flex-1">

        {/* Topbar */}
        <div className="flex items-center justify-between border-b bg-white px-6 py-4">

          <h2 className="text-xl font-semibold capitalize">
            {user?.role?.replace("_", " ")}
          </h2>

          <div className="font-medium">
            {user?.name || "User"}
          </div>

        </div>

        {/* Content */}
        <div className="p-6">
          <Outlet />
        </div>

      </main>

    </div>
  );
}

// ===============================
// ROUTER
// ===============================
const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },

      {
        path: "login",
        element: (
          <PageWrapper>
            <LoginPage />
          </PageWrapper>
        ),
      },
    ],
  },

  // STUDENT
  {
    path: "/student",
    element: (
      <RoleGuard
        allowedRoles={[ROLES.STUDENT]}
      />
    ),

    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "dashboard",
            element: (
              <PageWrapper>
                <StudentDashboard />
              </PageWrapper>
            ),
          },

          {
            path: "courses",
            element: (
              <PageWrapper>
                <MyCourses />
              </PageWrapper>
            ),
          },

          {
            path: "assignments",
            element: (
              <PageWrapper>
                <Assignments />
              </PageWrapper>
            ),
          },

          {
            path: "quizzes",
            element: (
              <PageWrapper>
                <Quiz />
              </PageWrapper>
            ),
          },

          {
            path: "messages",
            element: (
              <PageWrapper>
                <Messages />
              </PageWrapper>
            ),
          },

          {
            path: "certificates",
            element: (
              <PageWrapper>
                <Certificates />
              </PageWrapper>
            ),
          },

          {
            path: "settings",
            element: (
              <PageWrapper>
                <SettingsPage />
              </PageWrapper>
            ),
          },
        ],
      },
    ],
  },

  // TEACHER
  {
    path: "/teacher",
    element: (
      <RoleGuard
        allowedRoles={[ROLES.TEACHER]}
      />
    ),

    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "dashboard",
            element: (
              <PageWrapper>
                <TeacherDashboard />
              </PageWrapper>
            ),
          },

          {
            path: "courses",
            element: (
              <PageWrapper>
                <CourseManagement />
              </PageWrapper>
            ),
          },
        ],
      },
    ],
  },

  // ADMIN
  {
    path: "/admin",
    element: (
      <RoleGuard
        allowedRoles={[ROLES.SUPER_ADMIN]}
      />
    ),

    children: [
      {
        element: <DashboardLayout />,

        children: [
          {
            path: "dashboard",
            element: (
              <PageWrapper>
                <AdminDashboard />
              </PageWrapper>
            ),
          },

          {
            path: "teachers",
            element: (
              <PageWrapper>
                <AdminTeachers />
              </PageWrapper>
            ),
          },

          {
            path: "students",
            element: (
              <PageWrapper>
                <AdminStudents />
              </PageWrapper>
            ),
          },

          {
            path: "courses",
            element: (
              <PageWrapper>
                <AdminCourses />
              </PageWrapper>
            ),
          },

          {
            path: "payments",
            element: (
              <PageWrapper>
                <AdminPayments />
              </PageWrapper>
            ),
          },

          {
            path: "reports",
            element: (
              <PageWrapper>
                <AdminReports />
              </PageWrapper>
            ),
          },

          {
            path: "analytics",
            element: (
              <PageWrapper>
                <AdminAnalytics />
              </PageWrapper>
            ),
          },

          {
            path: "notifications",
            element: (
              <PageWrapper>
                <AdminNotifications />
              </PageWrapper>
            ),
          },

          {
            path: "security",
            element: (
              <PageWrapper>
                <AdminSecurity />
              </PageWrapper>
            ),
          },

          {
            path: "settings",
            element: (
              <PageWrapper>
                <AdminSettings />
              </PageWrapper>
            ),
          },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

// ===============================
// APP ROUTER
// ===============================
export default function AppRouter() {
  return <RouterProvider router={router} />;
}