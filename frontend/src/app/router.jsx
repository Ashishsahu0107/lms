// src/app/router.jsx

import React, { Suspense, lazy, useState } from "react";

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  Link,
  useLocation,
  useNavigate,
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
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

import { motion } from "framer-motion";

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
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="loading loading-spinner loading-lg text-primary"></div>
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
// SIDEBAR CONFIG
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

  const navigate = useNavigate();

  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const menuItems =
    sidebarConfig[user?.role] || [];

  const handleLogout = () => {
    logout();

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div
      data-theme="light"
      className="min-h-screen bg-base-200"
    >
      <div className="flex">

        {/* MOBILE OVERLAY */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`fixed lg:static z-50 h-screen w-72 transform border-r border-base-300 bg-base-100 transition-all duration-300 ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* LOGO */}
          <div className="flex items-center justify-between border-b border-base-300 px-6 py-5">
            <div>
              <h1 className="text-2xl font-extrabold text-primary">
                LMS PRO
              </h1>

              <p className="text-xs text-base-content/60">
                Learning Platform
              </p>
            </div>

            <button
              className="btn btn-sm btn-circle btn-ghost lg:hidden"
              onClick={() =>
                setSidebarOpen(false)
              }
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* USER */}
          <div className="border-b border-base-300 p-5">
            <div className="flex items-center gap-3 rounded-2xl bg-primary/10 p-3">

              <div className="avatar placeholder">
                <div className="w-12 rounded-full bg-primary text-primary-content">
                  <span className="text-lg font-bold">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold">
                  {user?.name || "User"}
                </h3>

                <p className="text-sm capitalize text-base-content/60">
                  {user?.role?.replace("_", " ")}
                </p>
              </div>

            </div>
          </div>

          {/* MENU */}
          <div className="space-y-2 p-4">

            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() =>
                    setSidebarOpen(false)
                  }
                  className={`group flex items-center justify-between rounded-2xl px-4 py-3 font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-content shadow-lg"
                      : "hover:bg-base-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />

                    <span>{item.label}</span>
                  </div>

                  <ChevronRight className="h-4 w-4 opacity-60" />
                </Link>
              );
            })}

          </div>

          {/* LOGOUT */}
          <div className="absolute bottom-0 w-full border-t border-base-300 p-4">

            <button
              onClick={handleLogout}
              className="btn btn-error w-full rounded-2xl text-white"
            >
              <LogOut className="h-5 w-5" />

              Logout
            </button>

          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1">

          {/* TOPBAR */}
          <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100/80 backdrop-blur-xl">

            <div className="flex items-center justify-between px-4 py-4 lg:px-8">

              {/* LEFT */}
              <div className="flex items-center gap-4">

                <button
                  className="btn btn-circle btn-ghost lg:hidden"
                  onClick={() =>
                    setSidebarOpen(true)
                  }
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div>
                  <h2 className="text-xl font-bold capitalize">
                    {user?.role?.replace("_", " ")}
                  </h2>

                  <p className="text-sm text-base-content/60">
                    Welcome back 👋
                  </p>
                </div>

              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-3">

                <button className="btn btn-circle btn-ghost">
                  <Bell className="h-5 w-5" />
                </button>

                <div className="hidden text-right md:block">
                  <h4 className="font-semibold">
                    {user?.name || "User"}
                  </h4>

                  <p className="text-xs capitalize text-base-content/60">
                    {user?.role?.replace("_", " ")}
                  </p>
                </div>

                <div className="avatar placeholder">
                  <div className="w-10 rounded-full bg-primary text-primary-content">
                    <span>
                      {user?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </header>

          {/* CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 lg:p-8"
          >
            <Outlet />
          </motion.div>

        </main>

      </div>
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