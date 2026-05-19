import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, Users, BarChart3, GraduationCap, ClipboardList,
  Award, Settings, Bell, MessageSquare, Trophy, CheckSquare, User, DollarSign,
  ChevronLeft, ChevronRight, Shield, FileText
} from "lucide-react";

const studentNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/student/dashboard" },
  { icon: BookOpen, label: "My Courses", path: "/student/courses" },
  { icon: ClipboardList, label: "Assignments", path: "/student/assignments" },
  { icon: CheckSquare, label: "Quizzes", path: "/student/quizzes" },
  { icon: Trophy, label: "Certificates", path: "/student/certificates" },
  { icon: MessageSquare, label: "Messages", path: "/student/messages" },
];

const teacherNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/teacher/dashboard" },
  { icon: BookOpen, label: "Manage Courses", path: "/teacher/courses" },
  { icon: Users, label: "Students", path: "/teacher/students" },
  { icon: ClipboardList, label: "Assignments", path: "/teacher/assignments" },
  { icon: BarChart3, label: "Analytics", path: "/teacher/analytics" },
  { icon: DollarSign, label: "Earnings", path: "/teacher/earnings" },
  { icon: Bell, label: "Notifications", path: "/teacher/notifications" },
];

const adminNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin/dashboard" },
  { icon: Users, label: "Teachers", path: "/admin/teachers" },
  { icon: GraduationCap, label: "Students", path: "/admin/students" },
  { icon: BookOpen, label: "Courses", path: "/admin/courses" },
  { icon: DollarSign, label: "Payments", path: "/admin/payments" },
  { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  { icon: FileText, label: "Reports", path: "/admin/reports" },
  { icon: Bell, label: "Notifications", path: "/admin/notifications" },
  { icon: Shield, label: "Security", path: "/admin/security" },
];

export function Sidebar({
  role = "student",
  isCollapsed,
  onToggle,
  isMobileOpen,
  onMobileClose,
}) {
  const location = useLocation();

  const navItems =
    role === "admin"
      ? adminNavItems
      : role === "teacher"
      ? teacherNavItems
      : studentNavItems;

  const bottomNavItems =
    role === "admin"
      ? [
          { icon: Settings, label: "Settings", path: "/admin/settings" },
        ]
      : role === "teacher"
      ? [
          { icon: User, label: "Profile", path: "/teacher/profile" },
          { icon: Settings, label: "Settings", path: "/teacher/settings" },
        ]
      : [
          { icon: User, label: "Profile", path: "/student/profile" },
          { icon: Settings, label: "Settings", path: "/student/settings" },
        ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              LMS Pro
            </span>
          </motion.div>
        )}
        {isCollapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 mx-auto">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isCollapsed && "mx-auto")} />
              {!isCollapsed && <span>{item.label}</span>}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 h-8 w-1 rounded-r-full bg-primary"
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t px-3 py-4 space-y-1">
        {bottomNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isCollapsed && "mx-auto")} />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Collapse Toggle */}
      <div className="hidden lg:block border-t p-3">
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isMobileOpen ? 0 : -280 }}
        className="fixed left-0 top-0 z-50 h-full w-64 bg-card lg:hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex h-screen sticky top-0 flex-col bg-card border-r transition-all duration-300",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}

export default Sidebar;