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
  FileText,
  Sparkles,
  Video,
  Sliders,
  Search,
  Sun,
  Moon,
} from "lucide-react";

import { motion } from "framer-motion";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { globalSearch } from "../services/searchService";
import { ROLES } from "../constants/roles";
import PublicLayout from "../layouts/PublicLayout";
import { AuthModalProvider } from "../context/AuthModalContext";

// ===============================
// LAZY IMPORTS
// ===============================

// AUTH
const LoginPage = lazy(() =>
  import("../pages/auth/LoginPage")
);

const CourseDetails = lazy(() =>
  import("../pages/courses/CourseDetails")
);

const RegisterPage = lazy(() =>
  import("../pages/auth/RegisterPage")
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

const TeacherQuizzes = lazy(() =>
  import("../pages/teacher/quizzes/TeacherQuizManagement")
);

const TeacherAssignments = lazy(() =>
  import("../pages/teacher/assignments/TeacherAssignmentManagement")
);

const TeacherProgress = lazy(() =>
  import("../pages/teacher/progress/TeacherStudentProgress")
);

const TeacherAttendance = lazy(() =>
  import("../pages/teacher/attendance/TeacherAttendance")
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

const AdminReports = lazy(() =>
  import("../pages/superadmin/reports/AdminReports")
);

const AdminAnalytics = lazy(() =>
  import("../pages/admin/analytics/AnalyticsDashboard")
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

// CERTIFICATE UPGRADES
const TeacherCertificates = lazy(() =>
  import("../pages/teacher/certificates/StudentCertificates")
);
const TeacherIssueCertificate = lazy(() =>
  import("../pages/teacher/certificates/IssueCertificate")
);
const AdminCertificates = lazy(() =>
  import("../pages/admin/certificates/CertificateDashboard")
);
const AdminIssueCertificate = lazy(() =>
  import("../pages/admin/certificates/IssueCertificate")
);
const AdminCertificateTemplates = lazy(() =>
  import("../pages/admin/certificates/CertificateTemplates")
);
const AdminCertificateHistory = lazy(() =>
  import("../pages/admin/certificates/CertificateHistory")
);


// ASSIGNMENT UPGRADES
const AssignmentDetails = lazy(() =>
  import("../pages/assignments/AssignmentDetails")
);

const ReviewSubmission = lazy(() =>
  import("../pages/assignments/ReviewSubmission")
);

const AdminAssignments = lazy(() =>
  import("../pages/superadmin/assignments/AdminAssignments")
);

// QUIZ UPGRADES
const QuizAttempt = lazy(() =>
  import("../pages/student/quiz/QuizAttempt")
);

const QuizResult = lazy(() =>
  import("../pages/student/quiz/QuizResult")
);

const CreateQuiz = lazy(() =>
  import("../pages/teacher/quizzes/CreateQuiz")
);

const QuizAnalytics = lazy(() =>
  import("../pages/teacher/quizzes/QuizAnalytics")
);

const AdminQuizzes = lazy(() =>
  import("../pages/superadmin/quizzes/AdminQuizzes")
);

// ADVANCED PLATFORM UPGRADES
const VerifyEmail = lazy(() => import("../pages/auth/VerifyEmail"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const VerifyOTP = lazy(() => import("../pages/auth/VerifyOTP"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const LandingPage = lazy(() => import("../pages/landing/LandingPage"));

const MyNotes = lazy(() => import("../pages/student/notes/MyNotes"));
const NotesDashboard = lazy(() => import("../pages/teacher/notes/NotesDashboard"));

const CalendarDashboard = lazy(() => import("../pages/shared/CalendarDashboard"));
const ScheduleManager = lazy(() => import("../pages/shared/ScheduleManager"));
const LiveClasses = lazy(() => import("../pages/shared/LiveClasses"));

const Achievements = lazy(() => import("../pages/student/gamification/Achievements"));
const Leaderboard = lazy(() => import("../pages/student/gamification/Leaderboard"));

const AIAssistant = lazy(() => import("../pages/shared/AIAssistant"));
const AIAnalytics = lazy(() => import("../pages/shared/AIAnalytics"));

const GlobalControls = lazy(() => import("../pages/admin/controls/GlobalControls"));


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
      icon: Calendar,
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
      icon: Calendar,
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
      setSearchResults({});
      return;
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
      data-theme={isDarkMode ? "dark" : "light"}
      className={`min-h-screen font-sans antialiased transition-colors duration-300 ${
        isDarkMode ? "bg-slate-950 text-slate-100 dark" : "bg-slate-50 text-slate-800"
      }`}
    >
      {/* GLOW DECORATIONS */}
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <div className="flex relative z-10">
        {/* MOBILE OVERLAY */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`fixed lg:static z-50 h-screen w-72 transform border-r transition-all duration-300 ${
            isDarkMode
              ? "border-white/10 bg-black/60 backdrop-blur-xl"
              : "border-slate-200 bg-white/80 backdrop-blur-xl text-slate-800"
          } ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          {/* LOGO */}
          <div className={`flex items-center justify-between border-b px-6 py-5 ${isDarkMode ? "border-white/10" : "border-slate-200"}`}>
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-400 animate-pulse" />
              <div>
                <h1 className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
                  LMS PREMIUM
                </h1>
                <p className="text-[10px] uppercase font-bold text-slate-505 tracking-wider">
                  Enterprise Suite
                </p>
              </div>
            </div>

            <button
              className={`btn btn-sm btn-circle btn-ghost lg:hidden ${isDarkMode ? "text-slate-400 hover:text-white" : "text-slate-500 hover:text-slate-800"}`}
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* USER CARD */}
          <div className="border-b border-white/10 p-5">
            <div className={`flex items-center gap-3 rounded-2xl border p-3.5 ${isDarkMode ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"}`}>
              <div className="avatar placeholder">
                <div className="w-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg">
                  <span className="text-md font-bold uppercase">
                    {user?.name?.charAt(0) || "U"}
                  </span>
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <h3 className={`font-semibold text-sm truncate ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                  {user?.name || "User"}
                </h3>
                <p className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">
                  {user?.role?.replace("_", " ")}
                </p>
              </div>
            </div>
          </div>

          {/* MENU LINKS */}
          <div className="space-y-1 p-4 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-none">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center justify-between rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? isDarkMode
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xl shadow-blue-500/10"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/10"
                      : isDarkMode
                      ? "text-slate-400 hover:text-white hover:bg-white/5"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? "text-white" : isDarkMode ? "text-slate-400 group-hover:text-blue-400" : "text-slate-500 group-hover:text-blue-600"}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className={`h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 ${isActive ? "opacity-100" : "opacity-40"}`} />
                </Link>
              );
            })}
          </div>

          {/* LOGOUT */}
          <div className={`absolute bottom-0 w-full border-t p-4 ${isDarkMode ? "border-white/10 bg-black/40" : "border-slate-200 bg-slate-50"}`}>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition text-xs font-bold flex items-center justify-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 min-h-screen flex flex-col">
          {/* HEADER TOPBAR */}
          <header className={`sticky top-0 z-30 border-b py-3 px-4 lg:px-8 backdrop-blur-xl transition-colors duration-300 ${isDarkMode ? "border-white/10 bg-slate-950/80 text-white" : "border-slate-200 bg-white/80 text-slate-800"}`}>
            <div className="flex items-center justify-between gap-4">
              
              {/* LEFT: Menu Toggle & Welcome */}
              <div className="flex items-center gap-4">
                <button
                  className={`p-2 rounded-xl border transition lg:hidden ${isDarkMode ? "bg-white/5 border-white/10 text-slate-400 hover:text-white" : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"}`}
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="hidden sm:block">
                  <h2 className={`text-md font-bold uppercase tracking-wider ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                    {user?.role?.replace("_", " ")} Workspace
                  </h2>
                </div>
              </div>

              {/* SEARCH BAR INPUT RIG */}
              <div className="flex-1 max-w-md relative hidden md:block">
                <button
                  onClick={() => setSearchOpen(true)}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-xl border transition ${
                    isDarkMode
                      ? "border-white/10 hover:border-blue-500/30 bg-white/5 text-slate-400 hover:text-slate-300"
                      : "border-slate-200 hover:border-blue-600/30 bg-slate-100 text-slate-600 hover:text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-slate-400" />
                    <span>Search anything...</span>
                  </div>
                  <kbd className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${isDarkMode ? "bg-white/10 text-slate-400 border-white/10" : "bg-slate-200 text-slate-600 border-slate-300"}`}>
                    Ctrl + K
                  </kbd>
                </button>
              </div>

              {/* RIGHT: Notifications, Search & Profile */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSearchOpen(true)}
                  className={`p-2 rounded-xl border transition md:hidden ${isDarkMode ? "bg-white/5 border-white/10 text-slate-400 hover:text-white" : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"}`}
                >
                  <Search className="h-4 w-4" />
                </button>

                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-xl border transition ${
                    isDarkMode
                      ? "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-950"
                  }`}
                >
                  {isDarkMode ? <Sun className="h-4 w-4 text-amber-400 animate-spin-slow" /> : <Moon className="h-4 w-4 text-indigo-600" />}
                </button>

                <button className={`p-2 rounded-xl border relative transition ${isDarkMode ? "bg-white/5 border-white/10 text-slate-400 hover:text-white" : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"}`}>
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-slate-950 animate-pulse" />
                </button>

                <div className="avatar placeholder">
                  <div className="w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-bold text-xs uppercase shadow-md animate-pulse">
                    <span>{user?.name?.charAt(0) || "U"}</span>
                  </div>
                </div>
              </div>

            </div>
          </header>

          {/* MAIN OUTLET CONTAINER */}
          <div className="flex-1 p-4 lg:p-8 overflow-x-hidden">
            <Outlet />
          </div>
        </main>
      </div>

      {/* GLOBAL SEARCH DIALOG MODAL */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-md">
          <div
            className="absolute inset-0 bg-transparent"
            onClick={() => setSearchOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`relative w-full max-w-2xl border shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[70vh] z-10 transition-colors ${
              isDarkMode ? "bg-slate-900 border-white/10" : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            {/* Search Input bar */}
            <div className={`p-4 border-b flex items-center gap-3 bg-black/5 ${isDarkMode ? "border-white/10" : "border-slate-200"}`}>
              <Search className="h-5 w-5 text-blue-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, notes, schedules..."
                className={`w-full bg-transparent text-sm focus:outline-none placeholder-slate-500 ${isDarkMode ? "text-white" : "text-slate-800"}`}
                autoFocus
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results Grid */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {searchLoading && (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                  <span className="text-xs text-slate-400">Searching the database...</span>
                </div>
              )}
              
              {!searchLoading && searchQuery.trim() === "" && (
                <div className="text-center py-12">
                  <p className="text-xs text-slate-400">Search for courses, schedules, or classroom summaries...</p>
                  <p className="text-[10px] text-slate-500 mt-1">Results populate dynamically based on your request.</p>
                </div>
              )}

              {!searchLoading && searchQuery.trim() !== "" && Object.keys(searchResults).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-xs text-rose-400">No records found matching "{searchQuery}"</p>
                </div>
              )}

              {!searchLoading && Object.keys(searchResults).map((category) => {
                const items = searchResults[category];
                if (!items || items.length === 0) return null;
                return (
                  <div key={category} className="space-y-2">
                    <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest px-2.5">
                      {category}
                    </h3>
                    <div className="space-y-1.5">
                      {items.map((item, idx) => {
                        let path = "/student/dashboard";
                        let title = item.name || item.title || "";
                        let subtitle = item.email || item.description || "";
                        
                        if (category === "courses") {
                          path = user?.role === "student" ? `/student/courses/${item._id}` : `/teacher/courses`;
                        } else if (category === "notes") {
                          path = user?.role === "student" ? "/student/notes" : "/teacher/notes";
                        } else if (category === "schedules") {
                          path = user?.role === "student" ? "/student/calendar" : "/teacher/calendar";
                        }
                        
                        return (
                          <Link
                            key={idx}
                            to={path}
                            onClick={() => setSearchOpen(false)}
                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                              isDarkMode
                                ? "bg-white/5 border-white/5 hover:border-blue-500/20 hover:bg-white/10 text-white"
                                : "bg-slate-50 border-slate-100 hover:border-blue-600/20 hover:bg-slate-100 text-slate-800"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs font-semibold truncate ${isDarkMode ? "text-white" : "text-slate-800"}`}>{title}</p>
                              {subtitle && <p className="text-[10px] text-slate-400 truncate max-w-lg mt-0.5">{subtitle}</p>}
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-white ml-2 shrink-0" />
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