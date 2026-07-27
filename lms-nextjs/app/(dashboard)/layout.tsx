"use client";

// app/(dashboard)/layout.tsx — Unified FlyonUI + Tailwind CSS Dashboard Layout with Collapsible Sidebar
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useSocket } from "@/context/SocketContext";

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles: Array<"student" | "teacher" | "super_admin">;
}

const NAV_ITEMS: NavItem[] = [
  // Student Links
  { label: "Dashboard", href: "/student/dashboard", icon: "📊", roles: ["student"] },
  { label: "Browse Courses", href: "/student/courses", icon: "🔍", roles: ["student"] },
  { label: "My Courses", href: "/student/my-courses", icon: "📚", roles: ["student"] },
  { label: "Assignments", href: "/student/assignments", icon: "📝", roles: ["student"] },
  { label: "Quizzes", href: "/student/quizzes", icon: "🧠", roles: ["student"] },
  { label: "Attendance", href: "/student/attendance", icon: "📅", roles: ["student"] },
  { label: "Certificates", href: "/student/certificates", icon: "📜", roles: ["student"] },
  { label: "Messages", href: "/student/messages", icon: "💬", roles: ["student"] },

  // Teacher Links
  { label: "Teacher Dashboard", href: "/teacher/dashboard", icon: "👨‍🏫", roles: ["teacher"] },
  { label: "Manage Courses", href: "/teacher/courses", icon: "📖", roles: ["teacher"] },
  { label: "Assignments & Grading", href: "/teacher/assignments", icon: "✍️", roles: ["teacher"] },
  { label: "Quiz Builder", href: "/teacher/quizzes", icon: "❓", roles: ["teacher"] },
  { label: "Mark Attendance", href: "/teacher/attendance", icon: "📋", roles: ["teacher"] },
  { label: "Student Roster", href: "/teacher/students", icon: "👥", roles: ["teacher"] },
  { label: "Course Notes", href: "/teacher/notes", icon: "📌", roles: ["teacher"] },
  { label: "Schedules", href: "/teacher/schedules", icon: "🗓️", roles: ["teacher"] },

  // Admin Links
  { label: "Admin Dashboard", href: "/admin/dashboard", icon: "⚡", roles: ["super_admin"] },
  { label: "User Management", href: "/admin/users", icon: "👤", roles: ["super_admin"] },
  { label: "System Health", href: "/admin/health", icon: "🛡️", roles: ["super_admin"] },
  { label: "Settings", href: "/admin/settings", icon: "⚙️", roles: ["super_admin"] },

  // Shared Links
  { label: "API Docs (Swagger)", href: "/api-docs", icon: "⚡", roles: ["student", "teacher", "super_admin"] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isConnected } = useSocket();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Preserve Collapsed State Across Navigation & Page Refreshes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lms_sidebar_collapsed");
      if (saved === "true") setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem("lms_sidebar_collapsed", String(nextState));
    }
  };

  const filteredNav = NAV_ITEMS.filter((item) =>
    user ? item.roles.includes(user.role as "student" | "teacher" | "super_admin") : false
  );

  return (
    <div className="min-h-screen bg-base-200 text-base-content flex flex-col lg:flex-row transition-colors">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-neutral/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main Sidebar Shell with Smooth Collapsible Transitions */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-base-100 border-r border-base-300 flex flex-col transition-all duration-300 ease-in-out shrink-0 overflow-x-hidden ${
          isCollapsed ? "lg:w-20" : "lg:w-64"
        } ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand Logo Header */}
        <div className={`h-16 flex items-center border-b border-base-300 px-3 overflow-hidden ${isCollapsed ? "lg:justify-center" : "justify-between px-6"}`}>
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-content font-bold text-lg flex items-center justify-center shadow-sm shadow-primary/30 shrink-0">
              🎓
            </div>
            {!isCollapsed && (
              <div className="animate-fade-in truncate">
                <span className="font-bold text-base-content tracking-tight text-base font-display">
                  LMS Pro
                </span>
                <span className="block text-[10px] uppercase font-semibold tracking-wider text-primary truncate">
                  {user?.role?.replace("_", " ")}
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-base-content/40 hover:text-base-content p-1"
          >
            ✕
          </button>
        </div>

        {/* Navigation Links with Hover Tooltips when Collapsed */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 space-y-1">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => setSidebarOpen(false)}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative group ${
                  isCollapsed ? "lg:justify-center" : ""
                } ${
                  isActive
                    ? "bg-primary text-primary-content shadow-sm shadow-primary/30"
                    : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
                }`}
              >
                <span className="text-base shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {/* Floating Tooltip when Collapsed */}
                {isCollapsed && (
                  <span className="hidden lg:group-hover:block absolute left-full ml-2 px-2.5 py-1 rounded-lg bg-neutral text-neutral-content text-[11px] font-medium whitespace-nowrap shadow-md z-50 pointer-events-none">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Card & Bottom Collapse Toggle Button */}
        <div className="p-2.5 border-t border-base-300 bg-base-200/50 space-y-2 overflow-x-hidden">
          <div className={`flex items-center gap-2.5 ${isCollapsed ? "lg:justify-center" : ""}`}>
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 text-primary font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name?.[0] || "U"}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 animate-fade-in">
                <p className="text-xs font-semibold text-base-content truncate">
                  {user?.name}
                </p>
                <p className="text-[11px] text-base-content/60 truncate">
                  {user?.email}
                </p>
              </div>
            )}
          </div>

          <div className={`flex items-center gap-1.5 ${isCollapsed ? "lg:flex-col" : "flex-row"}`}>
            <button
              onClick={logout}
              title="Sign Out"
              className="w-full py-1.5 rounded-lg border border-error/30 text-error hover:bg-error/10 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
            >
              <span>🚪</span>
              {!isCollapsed && <span>Sign Out</span>}
            </button>

            {/* Bottom Desktop Toggle Collapse Button */}
            <button
              onClick={toggleCollapse}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              className="hidden lg:flex w-full h-8 rounded-lg bg-base-100 hover:bg-base-300 border border-base-300 items-center justify-center text-xs font-bold text-base-content/70 hover:text-base-content transition-all shrink-0"
            >
              {isCollapsed ? "▶" : "◀"}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace (Automatically Expands to Fill Available Width) */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
        {/* Top Header Navbar */}
        <header className="h-16 bg-base-100/80 backdrop-blur border-b border-base-300 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-base-content/70 hover:text-base-content text-xl p-1"
            >
              ☰
            </button>
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-base-200 hover:bg-base-300 border border-base-300 text-xs font-semibold text-base-content/80 transition-all"
              title={isCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
            >
              <span>{isCollapsed ? "▶" : "◀"}</span>
              <span>{isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}</span>
            </button>
            <h2 className="text-xs font-medium text-base-content/60 hidden sm:block">
              LMS Pro Platform v3.0
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Socket Realtime Status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-base-200 text-[11px] font-medium text-base-content/70 border border-base-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-success animate-pulse" : "bg-error"
                }`}
              />
              <span>{isConnected ? "Live" : "Offline"}</span>
            </div>

            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg bg-base-200 hover:bg-base-300 flex items-center justify-center text-sm transition-all text-base-content"
              title="Toggle theme"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main key={pathname} className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
