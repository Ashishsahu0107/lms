// src/app/router.jsx

import React, { Suspense, lazy, useState, useEffect } from "react";

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
  Calendar,
  Clock,
  FileText,
  Sparkles,
  Video,
  Sliders,
  Search,
  Sun,
  Moon,
  RefreshCw,
} from "lucide-react";

import { motion } from "framer-motion";

import { cn } from "../utils/cn";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { globalSearch } from "../services/searchService";
import ThemeToggle from "../components/common/ThemeToggle";
import { ROLES } from "../constants/roles";
import PublicLayout from "../layouts/PublicLayout";
import { AuthModalProvider } from "../context/AuthModalContext";

// ===============================
// LAZY IMPORTS
// ===============================

// AUTH
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));

const CourseDetails = lazy(() => import("../pages/courses/CourseDetails"));

const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));

// STUDENT
const StudentDashboard = lazy(
  () => import("../pages/student/dashboard/Dashboard"),
);

const MyCourses = lazy(() => import("../pages/student/courses/MyCourses"));

const Assignments = lazy(
  () => import("../pages/student/assignments/Assignments"),
);

const Quiz = lazy(() => import("../pages/student/quiz/Quiz"));

const Messages = lazy(() => import("../pages/student/messages/Messages"));

const Certificates = lazy(
  () => import("../pages/student/certificates/Certificates"),
);

const SettingsPage = lazy(() => import("../pages/student/settings/Settings"));

// TEACHER
const TeacherDashboard = lazy(
  () => import("../pages/teacher/dashboard/TeacherDashboard"),
);

const CourseManagement = lazy(
  () => import("../pages/teacher/courses/CourseManagement"),
);

const TeacherQuizzes = lazy(
  () => import("../pages/teacher/quizzes/TeacherQuizManagement"),
);

const TeacherAssignments = lazy(
  () => import("../pages/teacher/assignments/TeacherAssignmentManagement"),
);

const TeacherProgress = lazy(
  () => import("../pages/teacher/progress/TeacherStudentProgress"),
);

const TeacherAttendance = lazy(
  () => import("../pages/teacher/attendance/TeacherAttendance"),
);

// ADMIN
const AdminDashboard = lazy(
  () => import("../pages/superadmin/dashboard/AdminDashboard"),
);

const AdminTeachers = lazy(
  () => import("../pages/superadmin/teachers/AdminTeachers"),
);

const AdminStudents = lazy(
  () => import("../pages/superadmin/students/AdminStudents"),
);

const AdminCourses = lazy(
  () => import("../pages/superadmin/courses/AdminCourses"),
);

const AdminReports = lazy(
  () => import("../pages/superadmin/reports/AdminReports"),
);

const AdminAnalytics = lazy(
  () => import("../pages/admin/analytics/AnalyticsDashboard"),
);

const AdminNotifications = lazy(
  () => import("../pages/superadmin/notifications/AdminNotifications"),
);

const AdminSecurity = lazy(
  () => import("../pages/superadmin/security/AdminSecurity"),
);

const AdminSettings = lazy(
  () => import("../pages/superadmin/settings/AdminSettings"),
);

// CERTIFICATE UPGRADES
const TeacherCertificates = lazy(
  () => import("../pages/teacher/certificates/StudentCertificates"),
);
const TeacherIssueCertificate = lazy(
  () => import("../pages/teacher/certificates/IssueCertificate"),
);
const AdminCertificates = lazy(
  () => import("../pages/admin/certificates/CertificateDashboard"),
);
const AdminIssueCertificate = lazy(
  () => import("../pages/admin/certificates/IssueCertificate"),
);
const AdminCertificateTemplates = lazy(
  () => import("../pages/admin/certificates/CertificateTemplates"),
);
const AdminCertificateHistory = lazy(
  () => import("../pages/admin/certificates/CertificateHistory"),
);

// ASSIGNMENT UPGRADES
const AssignmentDetails = lazy(
  () => import("../pages/assignments/AssignmentDetails"),
);

const ReviewSubmission = lazy(
  () => import("../pages/assignments/ReviewSubmission"),
);

const AdminAssignments = lazy(
  () => import("../pages/superadmin/assignments/AdminAssignments"),
);

// QUIZ UPGRADES
const QuizAttempt = lazy(() => import("../pages/student/quiz/QuizAttempt"));

const QuizResult = lazy(() => import("../pages/student/quiz/QuizResult"));

const CreateQuiz = lazy(() => import("../pages/teacher/quizzes/CreateQuiz"));

const QuizAnalytics = lazy(
  () => import("../pages/teacher/quizzes/QuizAnalytics"),
);

const AdminQuizzes = lazy(
  () => import("../pages/superadmin/quizzes/AdminQuizzes"),
);

// ADVANCED PLATFORM UPGRADES
const VerifyEmail = lazy(() => import("../pages/auth/VerifyEmail"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const VerifyOTP = lazy(() => import("../pages/auth/VerifyOTP"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const LandingPage = lazy(() => import("../pages/landing/LandingPage"));

const MyNotes = lazy(() => import("../pages/student/notes/MyNotes"));
const NotesDashboard = lazy(
  () => import("../pages/teacher/notes/NotesDashboard"),
);

const CalendarDashboard = lazy(
  () => import("../pages/shared/CalendarDashboard"),
);
const ScheduleManager = lazy(() => import("../pages/shared/ScheduleManager"));
const LiveClasses = lazy(() => import("../pages/shared/LiveClasses"));

const Achievements = lazy(
  () => import("../pages/student/gamification/Achievements"),
);
const Leaderboard = lazy(
  () => import("../pages/student/gamification/Leaderboard"),
);

const AIAssistant = lazy(() => import("../pages/shared/AIAssistant"));
const AIAnalytics = lazy(() => import("../pages/shared/AIAnalytics"));

const GlobalControls = lazy(
  () => import("../pages/admin/controls/GlobalControls"),
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
  return <Suspense fallback={<Loader />}>{children}</Suspense>;
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
// ROOT LAYOUT
// ===============================
function RootLayout() {
  return (
    <AuthModalProvider>
      <Outlet />
    </AuthModalProvider>
  );
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
      label: "Notes",
      icon: FileText,
      path: "/student/notes",
    },
    {
      label: "Calendar",
      icon: Calendar,
      path: "/student/calendar",
    },
    {
      label: "Achievements",
      icon: Sparkles,
      path: "/student/achievements",
    },
    {
      label: "Leaderboard",
      icon: Award,
      path: "/student/leaderboard",
    },
    {
      label: "Live Classes",
      icon: Video,
      path: "/student/live-classes",
    },
    {
      label: "AI Chatbot",
      icon: MessageSquare,
      path: "/student/ai-assistant",
    },
    {
      label: "AI Analytics",
      icon: BarChart3,
      path: "/student/ai-analytics",
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
    {
      label: "Quizzes",
      icon: GraduationCap,
      path: "/teacher/quizzes",
    },
    {
      label: "Assignments",
      icon: ClipboardList,
      path: "/teacher/assignments",
    },
    {
      label: "Notes Hub",
      icon: FileText,
      path: "/teacher/notes",
    },
    {
      label: "Calendar",
      icon: Calendar,
      path: "/teacher/calendar",
    },
    {
      label: "Manage Schedule",
      icon: Clock,
      path: "/teacher/schedule-manager",
    },
    {
      label: "Live Classes",
      icon: Video,
      path: "/teacher/live-classes",
    },
    {
      label: "AI Planner",
      icon: Sparkles,
      path: "/teacher/ai-assistant",
    },
    {
      label: "Progress",
      icon: Users,
      path: "/teacher/student-progress",
    },
    {
      label: "Attendance",
      icon: ClipboardList,
      path: "/teacher/attendance",
    },
    {
      label: "Messages",
      icon: MessageSquare,
      path: "/teacher/messages",
    },
    {
      label: "Certificates",
      icon: Award,
      path: "/teacher/certificates",
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
      label: "Assignments",
      icon: ClipboardList,
      path: "/admin/assignments",
    },
    {
      label: "Quizzes",
      icon: GraduationCap,
      path: "/admin/quizzes",
    },
    {
      label: "Platform Calendar",
      icon: Calendar,
      path: "/admin/calendar",
    },
    {
      label: "Manage Schedule",
      icon: Clock,
      path: "/admin/schedule-manager",
    },
    {
      label: "Live Classes",
      icon: Video,
      path: "/admin/live-classes",
    },
    {
      label: "AI Helper",
      icon: Sparkles,
      path: "/admin/ai-assistant",
    },
    {
      label: "Global Controls",
      icon: Sliders,
      path: "/admin/global-controls",
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
      label: "Certificates",
      icon: Award,
      path: "/admin/certificates",
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
  const { isDarkMode, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({});
  const [searchLoading, setSearchLoading] = useState(false);

  const GOLD = "#C9A227";
  const GOLD_LIGHT = "#F59E0B";
  const DARK_BG = "#0F172A";
  const CARD_BG = "#1E293B";

  const menuItems = sidebarConfig[user?.role] || [];

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      const timer = setTimeout(() => {
        setSearchResults({});
      }, 0);
      return () => clearTimeout(timer);
    }

    setSearchLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await globalSearch(searchQuery);
        if (res && res.success && res.data) {
          setSearchResults(res.data);
        } else {
          setSearchResults({});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  return (
    <div
      className="h-screen overflow-hidden font-sans antialiased bg-base-200 text-base-content transition-colors duration-300"
    >
      {/* LUXURY GOLD GLOW ORBS (only in dark mode) */}
      {isDarkMode && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-8"
            style={{
              background:
                "radial-gradient(circle, rgba(201,162,39,0.3) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          <div
            className="absolute bottom-1/4 right-0 w-80 h-80 rounded-full opacity-6"
            style={{
              background:
                "radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)",
              filter: "blur(70px)",
            }}
          />
        </div>
      )}

      <div className="flex h-screen relative z-10">
        {/* MOBILE OVERLAY */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── LUXURY SIDEBAR ── */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 flex flex-col overflow-hidden overscroll-none transition-all duration-300 bg-base-100/95 border-r border-base-300/40 backdrop-blur-2xl -translate-x-full lg:translate-x-0",
            sidebarOpen && "translate-x-0"
          )}
          style={{
            transform: sidebarOpen ? "translateX(0)" : undefined,
          }}
        >
          {/* Logo */}
          <div
            className="flex items-center justify-between px-6 py-5 border-b border-base-300/40"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary text-primary-content shadow-sm"
              >
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1
                  className="text-lg font-black tracking-tight text-primary"
                >
                  LMS <span className="text-base-content">PRO</span>
                </h1>
                <p
                  className="text-[9px] uppercase font-bold tracking-widest text-primary/75"
                >
                  Enterprise Suite
                </p>
              </div>
            </div>
            <button
              className="p-1.5 rounded-lg lg:hidden bg-base-200/60 border border-base-300/40 hover:bg-base-200"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4 text-base-content/60" />
            </button>
          </div>

          {/* User Card */}
          <div
            className="px-4 py-4 border-b border-base-300/30"
          >
            <div
              className="flex items-center gap-3 p-3 rounded-2xl bg-base-200/50 border border-base-300/30"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 bg-primary text-primary-content"
              >
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-base-content truncate">
                  {user?.name || "User"}
                </p>
                <p
                  className="text-[10px] font-bold uppercase tracking-wider text-primary"
                >
                  {user?.role?.replace("_", " ")}
                </p>
              </div>
              <div
                className="w-2 h-2 rounded-full shrink-0 bg-success"
              />
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 scrollbar-none">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border border-transparent",
                    isActive
                      ? "bg-primary/10 border-primary/20 text-primary"
                      : "text-base-content/70 hover:bg-base-200/60 hover:text-base-content"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        isActive ? "text-primary" : "text-base-content/60 group-hover:text-base-content"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {isActive && (
                    <ChevronRight
                      className="h-3.5 w-3.5 text-primary"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Theme Switcher */}
          <div
            className="px-4 py-3 border-t border-base-300/30"
          >
            <ThemeToggle variant="sidebar" />
          </div>

          {/* Logout */}
          <div
            className="px-4 py-4"
          >
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-200 bg-error/10 border border-error/20 text-error hover:bg-error/20"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 min-w-0 h-screen flex flex-col lg:ml-72 overflow-y-auto">
          {/* LUXURY TOPBAR */}
          <header
            className="sticky top-0 z-30 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4 transition-all duration-300 bg-base-100/80 border-b border-base-300/40 backdrop-blur-xl shadow-sm"
          >
            {/* Left: Menu + Title */}
            <div className="flex items-center gap-4">
              <button
                className="p-2 rounded-xl lg:hidden transition-all bg-base-200/60 border border-base-300/40 hover:bg-base-200"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5 text-primary" />
              </button>
              <div className="hidden sm:flex items-center gap-2">
                <div
                  className="w-1.5 h-5 rounded-full bg-primary"
                />
                <h2 className="text-sm font-black uppercase tracking-wider text-base-content">
                  {user?.role?.replace("_", " ")}{" "}
                  <span className="text-primary">Workspace</span>
                </h2>
              </div>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-md hidden md:block">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center justify-between px-4 py-2 rounded-xl transition-all duration-200 bg-base-200/60 border border-base-300/30 hover:border-primary/40 text-base-content/60 hover:text-base-content"
              >
                <div className="flex items-center gap-2 text-sm">
                  <Search className="h-4 w-4 text-primary" />
                  <span>Search anything...</span>
                </div>
                <kbd
                  className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-base-300 border border-base-300/60 text-base-content/80"
                >
                  Ctrl+K
                </kbd>
              </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-xl md:hidden bg-base-200/60 border border-base-300/40 hover:bg-base-200 text-primary"
              >
                <Search className="h-4 w-4" />
              </button>

              <ThemeToggle variant="navbar" />

              <button
                className="p-2 rounded-xl relative bg-base-200/40 border border-base-300/30 text-base-content/70 hover:bg-base-200"
              >
                <Bell className="h-4 w-4" />
                <span
                  className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full animate-pulse bg-primary"
                />
              </button>

              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-black text-xs cursor-pointer bg-primary text-primary-content shadow-sm"
              >
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 p-4 lg:p-8 overflow-x-hidden">
            <Outlet />
          </div>
        </main>
      </div>

      {/* GLOBAL SEARCH MODAL */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4"
          style={{
            background: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            className="absolute inset-0"
            onClick={() => setSearchOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="relative w-full max-w-2xl flex flex-col max-h-[70vh] z-10 overflow-hidden bg-base-100 border border-base-300/60 rounded-3xl shadow-2xl backdrop-blur-xl"
          >
            {/* Search Input */}
            <div
              className="p-4 flex items-center gap-3 border-b border-base-300/30"
            >
              <Search
                className="h-5 w-5 shrink-0 text-primary"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, notes, schedules..."
                className="flex-1 bg-transparent text-sm text-base-content focus:outline-none placeholder-base-content/40"
                autoFocus
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1.5 rounded-lg text-base-content/60 hover:text-base-content hover:bg-base-200 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {searchLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <RefreshCw
                    className="h-6 w-6 animate-spin text-primary"
                  />
                  <span className="text-xs text-base-content/60">
                    Searching database...
                  </span>
                </div>
              )}
              {!searchLoading && searchQuery.trim() === "" && (
                <div className="text-center py-12">
                  <Search
                    className="h-10 w-10 mx-auto mb-3 opacity-20 text-primary"
                  />
                  <p className="text-xs text-base-content/60">
                    Search for courses, schedules, or summaries...
                  </p>
                </div>
              )}
              {!searchLoading &&
                searchQuery.trim() !== "" &&
                Object.keys(searchResults).length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-sm text-base-content/60">
                      No results for{" "}
                      <span className="text-primary font-bold">"{searchQuery}"</span>
                    </p>
                  </div>
                )}
              {!searchLoading &&
                Object.keys(searchResults).map((category) => {
                  const items = searchResults[category];
                  if (!items || items.length === 0) return null;
                  return (
                    <div key={category} className="space-y-2">
                      <h3
                        className="text-[10px] font-black uppercase tracking-widest px-2 text-primary"
                      >
                        {category}
                      </h3>
                      <div className="space-y-1.5">
                        {items.map((item, idx) => {
                          let path = "/student/dashboard";
                          const title = item.name || item.title || "";
                          const subtitle = item.email || item.description || "";
                          if (category === "courses")
                            path =
                              user?.role === "student"
                                ? `/student/courses/${item._id}`
                                : `/teacher/courses`;
                          else if (category === "notes")
                            path =
                              user?.role === "student"
                                ? "/student/notes"
                                : "/teacher/notes";
                          else if (category === "schedules")
                            path =
                              user?.role === "student"
                                ? "/student/calendar"
                                : "/teacher/calendar";
                          return (
                            <Link
                              key={idx}
                              to={path}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center justify-between p-3 rounded-xl transition-all group bg-base-200/40 border border-base-300/30 hover:border-primary/40 hover:bg-base-200/80"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-base-content truncate">
                                  {title}
                                </p>
                                {subtitle && (
                                  <p className="text-[10px] text-base-content/50 truncate mt-0.5">
                                    {subtitle}
                                  </p>
                                )}
                              </div>
                              <ChevronRight className="h-4 w-4 text-base-content/50 group-hover:text-primary shrink-0 ml-2 transition-colors duration-200" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: (
          <PageWrapper>
            <LandingPage />
          </PageWrapper>
        ),
      },
      {
        element: <PublicLayout />,
        children: [
          {
            path: "login",
            element: <Navigate to="/?auth=login" replace />,
          },

          {
            path: "register",
            element: <Navigate to="/?auth=register" replace />,
          },

          {
            path: "verify-email",
            element: (
              <PageWrapper>
                <VerifyEmail />
              </PageWrapper>
            ),
          },

          {
            path: "forgot-password",
            element: (
              <PageWrapper>
                <ForgotPassword />
              </PageWrapper>
            ),
          },

          {
            path: "verify-otp",
            element: (
              <PageWrapper>
                <VerifyOTP />
              </PageWrapper>
            ),
          },

          {
            path: "reset-password",
            element: (
              <PageWrapper>
                <ResetPassword />
              </PageWrapper>
            ),
          },
        ],
      },

      // STUDENT
      {
        path: "/student",
        element: <RoleGuard allowedRoles={[ROLES.STUDENT]} />,

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
                path: "courses/:id",
                element: (
                  <PageWrapper>
                    <CourseDetails />
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
                path: "assignments/:id",
                element: (
                  <PageWrapper>
                    <AssignmentDetails />
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
                path: "quizzes/attempt/:quizId",
                element: (
                  <PageWrapper>
                    <QuizAttempt />
                  </PageWrapper>
                ),
              },

              {
                path: "quizzes/result/:attemptId",
                element: (
                  <PageWrapper>
                    <QuizResult />
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

              {
                path: "notes",
                element: (
                  <PageWrapper>
                    <MyNotes />
                  </PageWrapper>
                ),
              },

              {
                path: "calendar",
                element: (
                  <PageWrapper>
                    <CalendarDashboard />
                  </PageWrapper>
                ),
              },

              {
                path: "achievements",
                element: (
                  <PageWrapper>
                    <Achievements />
                  </PageWrapper>
                ),
              },

              {
                path: "leaderboard",
                element: (
                  <PageWrapper>
                    <Leaderboard />
                  </PageWrapper>
                ),
              },

              {
                path: "live-classes",
                element: (
                  <PageWrapper>
                    <LiveClasses />
                  </PageWrapper>
                ),
              },

              {
                path: "ai-assistant",
                element: (
                  <PageWrapper>
                    <AIAssistant />
                  </PageWrapper>
                ),
              },

              {
                path: "ai-analytics",
                element: (
                  <PageWrapper>
                    <AIAnalytics />
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
        element: <RoleGuard allowedRoles={[ROLES.TEACHER]} />,

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

              {
                path: "courses/:id",
                element: (
                  <PageWrapper>
                    <CourseDetails />
                  </PageWrapper>
                ),
              },

              {
                path: "quizzes",
                element: (
                  <PageWrapper>
                    <TeacherQuizzes />
                  </PageWrapper>
                ),
              },

              {
                path: "quizzes/create",
                element: (
                  <PageWrapper>
                    <CreateQuiz />
                  </PageWrapper>
                ),
              },

              {
                path: "quizzes/edit/:id",
                element: (
                  <PageWrapper>
                    <CreateQuiz />
                  </PageWrapper>
                ),
              },

              {
                path: "quizzes/analytics/:id",
                element: (
                  <PageWrapper>
                    <QuizAnalytics />
                  </PageWrapper>
                ),
              },

              {
                path: "assignments",
                element: (
                  <PageWrapper>
                    <TeacherAssignments />
                  </PageWrapper>
                ),
              },

              {
                path: "assignments/:id",
                element: (
                  <PageWrapper>
                    <AssignmentDetails />
                  </PageWrapper>
                ),
              },

              {
                path: "assignments/submissions/:id",
                element: (
                  <PageWrapper>
                    <ReviewSubmission />
                  </PageWrapper>
                ),
              },

              {
                path: "student-progress",
                element: (
                  <PageWrapper>
                    <TeacherProgress />
                  </PageWrapper>
                ),
              },

              {
                path: "attendance",
                element: (
                  <PageWrapper>
                    <TeacherAttendance />
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
                path: "settings",
                element: (
                  <PageWrapper>
                    <SettingsPage />
                  </PageWrapper>
                ),
              },
              {
                path: "certificates",
                element: (
                  <PageWrapper>
                    <TeacherCertificates />
                  </PageWrapper>
                ),
              },
              {
                path: "certificates/issue",
                element: (
                  <PageWrapper>
                    <TeacherIssueCertificate />
                  </PageWrapper>
                ),
              },

              {
                path: "notes",
                element: (
                  <PageWrapper>
                    <NotesDashboard />
                  </PageWrapper>
                ),
              },

              {
                path: "calendar",
                element: (
                  <PageWrapper>
                    <CalendarDashboard />
                  </PageWrapper>
                ),
              },

              {
                path: "schedule-manager",
                element: (
                  <PageWrapper>
                    <ScheduleManager />
                  </PageWrapper>
                ),
              },

              {
                path: "live-classes",
                element: (
                  <PageWrapper>
                    <LiveClasses />
                  </PageWrapper>
                ),
              },

              {
                path: "ai-assistant",
                element: (
                  <PageWrapper>
                    <AIAssistant />
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
        element: <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]} />,

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
                path: "courses/:id",
                element: (
                  <PageWrapper>
                    <CourseDetails />
                  </PageWrapper>
                ),
              },

              {
                path: "assignments",
                element: (
                  <PageWrapper>
                    <AdminAssignments />
                  </PageWrapper>
                ),
              },

              {
                path: "assignments/:id",
                element: (
                  <PageWrapper>
                    <AssignmentDetails />
                  </PageWrapper>
                ),
              },

              {
                path: "assignments/submissions/:id",
                element: (
                  <PageWrapper>
                    <ReviewSubmission />
                  </PageWrapper>
                ),
              },

              {
                path: "quizzes",
                element: (
                  <PageWrapper>
                    <AdminQuizzes />
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
              {
                path: "certificates",
                element: (
                  <PageWrapper>
                    <AdminCertificates />
                  </PageWrapper>
                ),
              },
              {
                path: "certificates/issue",
                element: (
                  <PageWrapper>
                    <AdminIssueCertificate />
                  </PageWrapper>
                ),
              },
              {
                path: "certificates/templates",
                element: (
                  <PageWrapper>
                    <AdminCertificateTemplates />
                  </PageWrapper>
                ),
              },
              {
                path: "certificates/history",
                element: (
                  <PageWrapper>
                    <AdminCertificateHistory />
                  </PageWrapper>
                ),
              },

              {
                path: "calendar",
                element: (
                  <PageWrapper>
                    <CalendarDashboard />
                  </PageWrapper>
                ),
              },

              {
                path: "schedule-manager",
                element: (
                  <PageWrapper>
                    <ScheduleManager />
                  </PageWrapper>
                ),
              },

              {
                path: "live-classes",
                element: (
                  <PageWrapper>
                    <LiveClasses />
                  </PageWrapper>
                ),
              },

              {
                path: "ai-assistant",
                element: (
                  <PageWrapper>
                    <AIAssistant />
                  </PageWrapper>
                ),
              },

              {
                path: "global-controls",
                element: (
                  <PageWrapper>
                    <GlobalControls />
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
    ],
  },
]);

// ===============================
// APP ROUTER
// ===============================
export default function AppRouter() {
  return <RouterProvider router={router} />;
}
