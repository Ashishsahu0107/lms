import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import {
  PanelLeft,
  Moon,
  Sun,
} from "lucide-react";

import { cn } from "../../utils/cn";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { useAuth } from "../../context/AuthContext";
import FloatingAIChat from "../ai/FloatingAIChat";

export function DashboardLayout({
  role = "student",
  user,
}) {
  const { user: authUser } = useAuth();

  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(false);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark";
  });

  // =========================
  // THEME
  // =========================
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";

    document.documentElement.classList.toggle(
      "dark",
      isDark
    );
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;

    setIsDarkMode(newTheme);

    localStorage.setItem(
      "theme",
      newTheme ? "dark" : "light"
    );

    document.documentElement.classList.toggle(
      "dark",
      newTheme
    );
  };

  // =========================
  // USER
  // =========================
  const currentUser =
    authUser ||
    user || {
      name: "John Doe",
      email: "john@lmspro.edu",
      role: role,
      avatar: "",
    };

  // =========================
  // ROLE
  // =========================
  const sidebarRole =
    authUser?.role || role;

  return (
    <div className="min-h-screen bg-base-200 transition-colors duration-300">

      {/* ========================= */}
      {/* SIDEBAR */}
      {/* ========================= */}
      <Sidebar
        role={sidebarRole}
        isCollapsed={isSidebarCollapsed}
        onToggle={() =>
          setIsSidebarCollapsed(
            !isSidebarCollapsed
          )
        }
        isMobileOpen={
          isMobileSidebarOpen
        }
        onMobileClose={() =>
          setIsMobileSidebarOpen(false)
        }
      />

      {/* ========================= */}
      {/* MAIN WRAPPER */}
      {/* ========================= */}
      <div
        className={cn(
          "min-h-screen flex flex-col transition-all duration-300",
          isSidebarCollapsed
            ? "lg:ml-20"
            : "lg:ml-72"
        )}
      >

        {/* ========================= */}
        {/* TOP NAVBAR */}
        {/* ========================= */}
        <header className="navbar sticky top-0 z-40 border-b border-base-300 bg-base-100/80 px-4 backdrop-blur-lg shadow-sm">

          {/* LEFT */}
          <div className="flex-1">

            {/* MOBILE MENU */}
            <button
              onClick={() =>
                setIsMobileSidebarOpen(true)
              }
              className="btn btn-ghost btn-square lg:hidden"
            >
              <PanelLeft className="h-5 w-5" />
            </button>

            {/* TITLE */}
            <div className="ml-2">
              <h1 className="text-lg font-bold capitalize text-base-content">
                {sidebarRole.replace(
                  "_",
                  " "
                )}{" "}
                Dashboard
              </h1>

              <p className="text-xs text-base-content/60">
                Welcome back,{" "}
                {currentUser.name}
              </p>
            </div>

          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">

            {/* THEME */}
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-circle"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-warning" />
              ) : (
                <Moon className="h-5 w-5 text-primary" />
              )}
            </button>

            {/* USER */}
            <div className="dropdown dropdown-end">

              <label
                tabIndex={0}
                className="btn btn-ghost gap-3 px-2"
              >

                <div className="avatar">
                  <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">

                    <img
                      src={
                        currentUser.avatar ||
                        "https://i.pravatar.cc/100"
                      }
                      alt="user"
                    />

                  </div>
                </div>

                <div className="hidden text-left md:block">
                  <p className="text-sm font-semibold text-base-content">
                    {currentUser.name}
                  </p>

                  <p className="text-xs capitalize text-base-content/60">
                    {sidebarRole.replace(
                      "_",
                      " "
                    )}
                  </p>
                </div>

              </label>

              {/* DROPDOWN */}
              <ul
                tabIndex={0}
                className="menu dropdown-content mt-3 w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
              >

                <li>
                  <a>Profile</a>
                </li>

                <li>
                  <a>Settings</a>
                </li>

                <li>
                  <a className="text-error">
                    Logout
                  </a>
                </li>

              </ul>

            </div>

          </div>

        </header>

        {/* ========================= */}
        {/* PAGE CONTENT */}
        {/* ========================= */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">

          {/* CONTENT WRAPPER */}
          <div className="animate-fade-in space-y-6">

            <Outlet />

          </div>

        </main>

      </div>

      <FloatingAIChat />

    </div>
  );
}

export default DashboardLayout;