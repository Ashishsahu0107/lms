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

import { useTheme } from "../../hooks/useTheme";
import { ThemeToggle } from "../common/ThemeToggle";

export function DashboardLayout({
  role = "student",
  user,
}) {
  const { user: authUser } = useAuth();
  const { isDarkMode } = useTheme();

  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(false);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState(false);

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
    <div className="h-screen overflow-hidden bg-base-200 transition-colors duration-300">

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
          "h-screen flex flex-col transition-all duration-300",
          isSidebarCollapsed
            ? "lg:ml-20"
            : "lg:ml-72"
        )}
      >

        {/* ========================= */}
        {/* TOP NAVBAR */}
        {/* ========================= */}
        <header className="navbar shrink-0 z-40 border-b border-base-300 bg-base-100/80 px-4 backdrop-blur-lg shadow-sm">

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
            <ThemeToggle variant="navbar" />

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
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

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