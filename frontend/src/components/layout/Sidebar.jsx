import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  GraduationCap,
  ClipboardList,
  Trophy,
  CheckSquare,
  User,
  ChevronLeft,
  ChevronRight,
  Shield,
  FileText,
  Settings,
  Bell,
  MessageSquare,
  X,
  Calendar,
  Sun,
  Moon,
} from "lucide-react";

import { cn } from "../../utils/cn";
import { useTheme } from "../../hooks/useTheme";
import { ThemeToggle } from "../common/ThemeToggle";

// ============================================
// STUDENT NAVIGATION
// ============================================
const studentNavItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/student/dashboard",
  },
  {
    icon: BookOpen,
    label: "My Courses",
    path: "/student/courses",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    path: "/student/analytics",
  },
  {
    icon: ClipboardList,
    label: "Assignments",
    path: "/student/assignments",
  },
  {
    icon: CheckSquare,
    label: "Quizzes",
    path: "/student/quizzes",
  },
  {
    icon: Trophy,
    label: "Certificates",
    path: "/student/certificates",
  },
  {
    icon: Calendar,
    label: "Attendance",
    path: "/student/attendance",
  },
  {
    icon: MessageSquare,
    label: "Messages",
    path: "/student/messages",
  },
];

// ============================================
// TEACHER NAVIGATION
// ============================================
const teacherNavItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/teacher/dashboard",
  },
  {
    icon: BookOpen,
    label: "Courses",
    path: "/teacher/courses",
  },
  {
    icon: Users,
    label: "Students",
    path: "/teacher/students",
  },
  {
    icon: ClipboardList,
    label: "Assignments",
    path: "/teacher/assignments",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    path: "/teacher/analytics",
  },
  {
    icon: Bell,
    label: "Notifications",
    path: "/teacher/notifications",
  },
  {
    icon: Trophy,
    label: "Certificates",
    path: "/teacher/certificates",
  },
  {
    icon: Calendar,
    label: "Attendance",
    path: "/teacher/attendance",
  },
];

// ============================================
// ADMIN NAVIGATION
// ============================================
const adminNavItems = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/admin/dashboard",
  },
  {
    icon: Users,
    label: "Teachers",
    path: "/admin/teachers",
  },
  {
    icon: GraduationCap,
    label: "Students",
    path: "/admin/students",
  },
  {
    icon: BookOpen,
    label: "Courses",
    path: "/admin/courses",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    path: "/admin/analytics",
  },
  {
    icon: FileText,
    label: "Reports",
    path: "/admin/reports",
  },
  {
    icon: Bell,
    label: "Notifications",
    path: "/admin/notifications",
  },
  {
    icon: Shield,
    label: "Security",
    path: "/admin/security",
  },
  {
    icon: Trophy,
    label: "Certificates",
    path: "/admin/certificates",
  },
];

// ============================================
// SIDEBAR
// ============================================
export function Sidebar({
  role = "student",
  isCollapsed,
  onToggle,
  isMobileOpen,
  onMobileClose,
}) {
  const location = useLocation();
  const { isDarkMode, setTheme } = useTheme();

  // ============================================
  // ROLE NAVIGATION
  // ============================================
  const navItems =
    role === "super_admin"
      ? adminNavItems
      : role === "teacher"
      ? teacherNavItems
      : studentNavItems;

  // ============================================
  // BOTTOM NAVIGATION
  // ============================================
  const bottomNavItems =
    role === "super_admin"
      ? [
          {
            icon: Settings,
            label: "Settings",
            path: "/admin/settings",
          },
        ]
      : role === "teacher"
      ? [
          {
            icon: User,
            label: "Profile",
            path: "/teacher/profile",
          },
          {
            icon: Settings,
            label: "Settings",
            path: "/teacher/settings",
          },
        ]
      : [
          {
            icon: User,
            label: "Profile",
            path: "/student/profile",
          },
          {
            icon: Settings,
            label: "Settings",
            path: "/student/settings",
          },
        ];

  // ============================================
  // SIDEBAR CONTENT
  // ============================================
  const renderSidebarContent = () => (
    <div className="flex h-full flex-col bg-base-100 sticky top-0">

      {/* LOGO */}
      <div className="flex h-20 items-center justify-between border-b border-base-300 px-4">

        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed &&
              "justify-center w-full"
          )}
        >

          {/* LOGO ICON */}
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-lg">

            <GraduationCap className="h-6 w-6" />

          </div>

          {/* LOGO TEXT */}
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >

              <h1 className="text-xl font-bold text-base-content">
                LMS Pro
              </h1>

              <p className="text-xs text-base-content/60 capitalize">
                {role.replace("_", " ")}
              </p>

            </motion.div>
          )}

        </div>

        {/* MOBILE CLOSE */}
        <button
          onClick={onMobileClose}
          className="btn btn-ghost btn-sm lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>

      </div>

      {/* NAVIGATION */}
      <div className="flex-1 overflow-hidden px-3 py-5">

        <ul className="menu gap-2">

          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path;

            return (
              <li key={item.path}>

                <NavLink
                  to={item.path}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-primary text-primary-content shadow-md"
                      : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
                  )}
                >

                  {/* ACTIVE INDICATOR */}
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 rounded-2xl bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}

                  {/* ICON */}
                  <item.icon
                    className={cn(
                      "relative z-10 h-5 w-5 shrink-0",
                      isCollapsed &&
                        "mx-auto"
                    )}
                  />

                  {/* LABEL */}
                  {!isCollapsed && (
                    <span className="relative z-10">
                      {item.label}
                    </span>
                  )}

                </NavLink>

              </li>
            );
          })}

        </ul>

      </div>

      {/* BOTTOM NAV */}
      <div className="border-t border-base-300 px-3 py-4">

        <ul className="menu gap-2">

          {bottomNavItems.map((item) => {
            const isActive =
              location.pathname === item.path;

            return (
              <li key={item.path}>

                <NavLink
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-secondary text-secondary-content"
                      : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
                  )}
                >

                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      isCollapsed &&
                        "mx-auto"
                    )}
                  />

                  {!isCollapsed && (
                    <span>{item.label}</span>
                  )}

                </NavLink>

              </li>
            );
          })}

        </ul>

      </div>

      {/* THEME SWITCHER */}
      <div className="border-t border-base-300 p-4">
        {isCollapsed ? (
          <button
            onClick={() => setTheme(isDarkMode ? "light" : "dark")}
            className="btn btn-ghost btn-circle w-full flex items-center justify-center mx-auto"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="h-5 w-5 text-warning" /> : <Moon className="h-5 w-5 text-primary" />}
          </button>
        ) : (
          <ThemeToggle variant="sidebar" />
        )}
      </div>

      {/* COLLAPSE BUTTON */}
      <div className="hidden border-t border-base-300 p-4 lg:block">

        <button
          onClick={onToggle}
          className="btn btn-outline btn-sm w-full rounded-xl"
        >

          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              Collapse
            </>
          )}

        </button>

      </div>

    </div>
  );

  return (
    <>
      {/* MOBILE OVERLAY */}
      <AnimatePresence>

        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}

      </AnimatePresence>

      {/* MOBILE SIDEBAR */}
      <motion.aside
        initial={{ x: -320 }}
        animate={{
          x: isMobileOpen ? 0 : -320,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 25,
        }}
        className="fixed inset-y-0 left-0 z-50 w-72 overflow-hidden overscroll-none border-r border-base-300 shadow-2xl lg:hidden"
      >

        {renderSidebarContent()}

      </motion.aside>

      {/* DESKTOP SIDEBAR */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden overflow-hidden overscroll-none flex-col border-r border-base-300 bg-base-100 shadow-sm transition-all duration-300 lg:flex",
          isCollapsed
            ? "w-24"
            : "w-72"
        )}
      >

        {renderSidebarContent()}

      </aside>
    </>
  );
}

export default Sidebar;