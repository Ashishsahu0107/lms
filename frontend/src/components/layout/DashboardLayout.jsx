import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { cn } from "../../utils/cn";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { useAuth } from "../../context/AuthContext";

export function DashboardLayout({ role = "student", user }) {
  const { user: authUser } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newTheme);
  };

  // Use authenticated user from context, fallback to prop or mock
  const currentUser = authUser || user || {
    name: "User",
    email: "user@lmspro.edu",
    role: role,
    avatar: "",
  };

  // Determine sidebar role from auth user or prop
  const sidebarRole = authUser?.role?.replace("_", "") || role;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        role={sidebarRole}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <div
        className={cn(
          "min-h-screen flex flex-col transition-all duration-300",
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        <Navbar
          user={currentUser}
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          onThemeToggle={toggleTheme}
          isDarkMode={isDarkMode}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;