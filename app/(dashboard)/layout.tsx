"use client";

// app/(dashboard)/layout.tsx — Unified FlyonUI + Tailwind CSS Dashboard Layout with Collapsible Sidebar
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useSocket } from "@/context/SocketContext";
import {
  BreadcrumbProvider,
  useBreadcrumbs,
  BreadcrumbItem,
} from "@/context/BreadcrumbContext";
import {
  LayoutDashboard,
  BookOpen,
  Compass,
  FileText,
  HelpCircle,
  CalendarCheck,
  CalendarDays,
  Award,
  MessageSquare,
  ClipboardList,
  UserCheck,
  Users,
  StickyNote,
  Activity,
  Settings,
  LogOut,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LifeBuoy,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  roles: Array<"student" | "teacher" | "super_admin">;
}

const NAV_ITEMS: NavItem[] = [
  // Student Links
  {
    label: "Dashboard",
    href: "/student/dashboard",
    icon: LayoutDashboard,
    roles: ["student"],
  },
  {
    label: "Browse Courses",
    href: "/student/courses",
    icon: Compass,
    roles: ["student"],
  },
  {
    label: "My Courses",
    href: "/student/my-courses",
    icon: BookOpen,
    roles: ["student"],
  },
  {
    label: "Assignments",
    href: "/student/assignments",
    icon: FileText,
    roles: ["student"],
  },
  {
    label: "Quizzes",
    href: "/student/quizzes",
    icon: HelpCircle,
    roles: ["student"],
  },
  {
    label: "Attendance",
    href: "/student/attendance",
    icon: CalendarCheck,
    roles: ["student"],
  },
  {
    label: "Certificates",
    href: "/student/certificates",
    icon: Award,
    roles: ["student"],
  },
  {
    label: "Messages",
    href: "/student/messages",
    icon: MessageSquare,
    roles: ["student"],
  },
  {
    label: "Support",
    href: "/student/support",
    icon: LifeBuoy,
    roles: ["student"],
  },

  // Teacher Links
  {
    label: "Teacher Dashboard",
    href: "/teacher/dashboard",
    icon: LayoutDashboard,
    roles: ["teacher"],
  },
  {
    label: "Manage Courses",
    href: "/teacher/courses",
    icon: BookOpen,
    roles: ["teacher"],
  },
  {
    label: "Assignments & Grading",
    href: "/teacher/assignments",
    icon: ClipboardList,
    roles: ["teacher"],
  },
  {
    label: "Quiz Builder",
    href: "/teacher/quizzes",
    icon: HelpCircle,
    roles: ["teacher"],
  },
  {
    label: "Mark Attendance",
    href: "/teacher/attendance",
    icon: UserCheck,
    roles: ["teacher"],
  },
  {
    label: "Student Roster",
    href: "/teacher/students",
    icon: Users,
    roles: ["teacher"],
  },
  {
    label: "Course Notes",
    href: "/teacher/notes",
    icon: StickyNote,
    roles: ["teacher"],
  },
  {
    label: "Schedules",
    href: "/teacher/schedules",
    icon: CalendarDays,
    roles: ["teacher"],
  },

  // Admin Links
  {
    label: "Admin Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["super_admin"],
  },
  {
    label: "Courses",
    href: "/teacher/courses",
    icon: BookOpen,
    roles: ["super_admin"],
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: Users,
    roles: ["super_admin"],
  },
  {
    label: "System Health",
    href: "/admin/health",
    icon: Activity,
    roles: ["super_admin"],
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
    roles: ["super_admin"],
  },
];

const ROUTE_LABELS: Record<string, string> = {
  admin: "Admin",
  teacher: "Teacher",
  student: "Student",
  dashboard: "Dashboard",
  courses: "Courses",
  "my-courses": "My Courses",
  assignments: "Assignments",
  quizzes: "Quiz",
  quiz: "Quiz",
  attendance: "Attendance",
  certificates: "Certificates",
  messages: "Messages",
  students: "Student Roster",
  notes: "Course Notes",
  schedules: "Schedules",
  edit: "Edit Course",
  users: "Users",
  health: "System Health",
  settings: "Settings",
  support: "Support",
  topics: "Topics",
  docs: "Docs",
  videos: "Videos",
  resources: "Resources",
};

function formatSegmentLabel(seg: string): string {
  const lower = seg.toLowerCase();
  if (ROUTE_LABELS[lower]) {
    return ROUTE_LABELS[lower];
  }
  // Check if it's a mongo ID, long hash or numeric ID
  if (/^[0-9a-fA-F]{24}$/.test(seg) || seg.length > 20 || /^\d+$/.test(seg)) {
    return "Details";
  }
  return seg
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function HeaderBreadcrumbBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { breadcrumbs, breadcrumbPath } = useBreadcrumbs();

  const crumbs: BreadcrumbItem[] = React.useMemo(() => {
    // 1. If explicit custom breadcrumbs were passed and match current path, use them (strip any LMS/Teacher/Student/Admin)
    if (
      breadcrumbs &&
      breadcrumbs.length > 0 &&
      (!breadcrumbPath || breadcrumbPath === pathname)
    ) {
      const sanitized = breadcrumbs.filter(
        (c) =>
          !["lms", "teacher", "student", "admin", "super_admin"].includes(
            c.label.trim().toLowerCase()
          )
      );
      if (sanitized.length > 0) return sanitized;
    }

    // 2. Parse URL path segments
    const rawSegments = pathname.split("/").filter(Boolean);

    // If on root "/" or empty, show Dashboard
    if (rawSegments.length === 0) {
      return [{ label: "Dashboard" }];
    }

    // Strip out role prefix ("teacher", "student", "admin") so it never appears
    const rolePrefixes = ["teacher", "student", "admin"];
    const hasRolePrefix = rolePrefixes.includes(rawSegments[0]?.toLowerCase());
    const rolePrefix = hasRolePrefix ? rawSegments[0].toLowerCase() : (user?.role || "student");
    const segments = hasRolePrefix ? rawSegments.slice(1) : rawSegments;

    // If path was just "/teacher" or "/student", show only Dashboard
    if (segments.length === 0) {
      return [{ label: "Dashboard" }];
    }

    // First breadcrumb = current main sidebar tab!
    // Nested child routes = appended to the right
    const items: BreadcrumbItem[] = [];
    let accumHref = hasRolePrefix ? `/${rolePrefix}` : "";

    segments.forEach((seg, index) => {
      accumHref += `/${seg}`;
      const isLast = index === segments.length - 1;
      const label = formatSegmentLabel(seg);

      items.push({
        label,
        href: isLast ? undefined : accumHref,
      });
    });

    return items;
  }, [breadcrumbs, breadcrumbPath, pathname, user?.role]);

  return (
    <nav
      aria-label="Breadcrumb navigation"
      className="flex items-center min-w-0 overflow-x-auto no-scrollbar py-0.5"
    >
      <div className="flex items-center gap-1.5 text-xs shrink-0">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <span
                  className="text-base-content/30 select-none text-[12px] font-light px-1 shrink-0"
                  aria-hidden="true"
                >
                  /
                </span>
              )}
              {crumb.href && !isLast ? (
                <Link
                  href={crumb.href}
                  className="inline-flex items-center px-1.5 py-0.5 rounded-md font-medium text-base-content/60 hover:text-primary hover:bg-base-200/80 transition-all shrink-0 max-w-[140px] sm:max-w-[200px] truncate"
                  title={`Navigate to ${crumb.label}`}
                >
                  <span>{crumb.label}</span>
                </Link>
              ) : isLast ? (
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20 shrink-0 shadow-2xs whitespace-nowrap"
                  aria-current="page"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                  <span>{crumb.label}</span>
                </span>
              ) : (
                <span className="font-medium text-base-content/60 px-1.5 py-0.5 shrink-0 max-w-[140px] truncate">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
}

function DashboardLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
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

  // Keyboard shortcut (Ctrl+B / Cmd+B) to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapse();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCollapsed]);

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    if (typeof window !== "undefined") {
      localStorage.setItem("lms_sidebar_collapsed", String(nextState));
    }
  };

  const filteredNav = NAV_ITEMS.filter((item) =>
    user
      ? item.roles.includes(user.role as "student" | "teacher" | "super_admin")
      : false,
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
        <div
          className={`h-16 flex items-center border-b border-base-300 px-3 overflow-hidden ${
            isCollapsed ? "lg:justify-center" : "justify-between px-5"
          }`}
        >
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-primary-content font-bold flex items-center justify-center shadow-md shadow-primary/25 shrink-0 group-hover:scale-105 transition-transform">
              <GraduationCap size={20} />
            </div>
            {!isCollapsed && (
              <div className="animate-fade-in truncate">
                <span className="font-bold text-base-content tracking-tight text-base font-display">
                  LMS Pro
                </span>
                <span className="block text-[9px] uppercase font-bold tracking-wider text-primary truncate">
                  {user?.role?.replace("_", " ")}
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-base-content/50 hover:text-base-content hover:bg-base-200 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links with Hover Tooltips when Collapsed */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-4 space-y-1">
          {filteredNav.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

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
                    ? "bg-primary text-primary-content shadow-sm shadow-primary/25"
                    : "text-base-content/70 hover:bg-base-200/80 hover:text-base-content"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {/* Floating Tooltip when Collapsed */}
                {isCollapsed && (
                  <span className="hidden lg:group-hover:block absolute left-full ml-2.5 px-2.5 py-1 rounded-lg bg-neutral text-neutral-content text-[11px] font-medium whitespace-nowrap shadow-xl z-50 pointer-events-none animate-fade-in">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* User Card & Bottom Actions */}
        <div className="p-3 border-t border-base-300 bg-base-200/40 space-y-2 shrink-0 overflow-x-hidden">
          {/* User Profile Info */}
          <div
            className={`flex items-center gap-2.5 ${isCollapsed ? "justify-center" : "justify-between"}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/25 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 flex-1 animate-fade-in">
                  <p className="text-xs font-bold text-base-content truncate leading-tight">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[11px] text-base-content/60 truncate">
                    {user?.email}
                  </p>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-base-content/50 hover:text-error hover:bg-error/10 border border-transparent hover:border-error/20 transition-all shrink-0"
                aria-label="Sign Out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>

          {/* Collapsed State: Icon-only Sign Out Button */}
          {isCollapsed && (
            <button
              onClick={logout}
              title="Sign Out"
              className="w-8 h-8 mx-auto rounded-xl text-base-content/60 hover:text-error hover:bg-error/10 flex items-center justify-center transition-all"
              aria-label="Sign Out"
            >
              <LogOut size={16} />
            </button>
          )}

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            onClick={toggleCollapse}
            title={isCollapsed ? "Expand Sidebar (Ctrl+B)" : "Collapse Sidebar (Ctrl+B)"}
            className="hidden lg:flex w-full h-8 rounded-xl bg-base-100 hover:bg-base-200 border border-base-300 items-center justify-center gap-1.5 text-xs font-semibold text-base-content/70 hover:text-base-content transition-all shadow-xs"
          >
            {isCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <>
                <ChevronLeft size={14} />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Workspace (Automatically Expands to Fill Available Width) */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
        {/* Top Header Navbar with Breadcrumb Bar */}
        <header className="h-16 bg-base-100/90 backdrop-blur border-b border-base-300 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-base-content/70 hover:text-base-content p-1.5 rounded-lg hover:bg-base-200 transition-colors shrink-0"
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </button>
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-base-200 hover:bg-base-300 border border-base-300 text-xs font-semibold text-base-content/80 transition-all shrink-0"
              title={
                isCollapsed
                  ? "Expand Sidebar (Ctrl+B)"
                  : "Collapse Sidebar (Ctrl+B)"
              }
            >
              {isCollapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
              <span>{isCollapsed ? "Expand" : "Collapse"}</span>
            </button>

            {/* Subtle Divider */}
            <div className="hidden sm:block w-px h-5 bg-base-300/80 shrink-0" aria-hidden="true" />

            {/* Breadcrumb Bar in Top Header */}
            <HeaderBreadcrumbBar />
          </div>

          <div className="flex items-center gap-3 shrink-0">
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
              {resolvedTheme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main
          key={pathname}
          className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BreadcrumbProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </BreadcrumbProvider>
  );
}
