import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Moon,
  Sun,
  Menu,
  Search,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import { cn } from "../../utils/cn";
import { useAuth } from "../../context/AuthContext";
import { ThemeToggle } from "../common/ThemeToggle";

export function Navbar({
  user,
  onMenuClick,
  onThemeToggle,
  isDarkMode,
  notifications = [],
  className,
}) {
  const navigate = useNavigate();

  const { logout } = useAuth();

  const unreadCount = notifications.filter(
    (n) => !n.read
  ).length;

  const handleLogout = () => {
    logout();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header
      className={cn(
        "navbar sticky top-0 z-40 border-b border-base-300 bg-base-100/80 px-4 backdrop-blur-xl shadow-sm",
        className
      )}
    >

      {/* LEFT */}
      <div className="flex-1 gap-3">

        {/* MOBILE MENU */}
        <button
          onClick={onMenuClick}
          className="btn btn-ghost btn-circle lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* SEARCH */}
        <div className="hidden w-full max-w-md sm:block">

          <label className="input input-bordered flex items-center gap-2 rounded-2xl border-base-300 bg-base-200/60 focus-within:border-primary">

            <Search className="h-4 w-4 text-base-content/50" />

            <input
              type="text"
              className="grow"
              placeholder="Search courses, assignments..."
            />

          </label>

        </div>

      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">

        {/* THEME */}
        <ThemeToggle variant="navbar" />

        {/* NOTIFICATIONS */}
        <div className="dropdown dropdown-end">

          <label
            tabIndex={0}
            className="btn btn-ghost btn-circle"
          >

            <div className="indicator">

              <Bell className="h-5 w-5" />

              {unreadCount > 0 && (
                <span className="badge badge-primary badge-sm indicator-item">

                  {unreadCount > 9
                    ? "9+"
                    : unreadCount}

                </span>
              )}

            </div>

          </label>

          {/* DROPDOWN */}
          <div
            tabIndex={0}
            className="card dropdown-content card-compact mt-3 w-80 border border-base-300 bg-base-100 shadow-2xl"
          >

            <div className="card-body">

              <div className="flex items-center justify-between">

                <h3 className="font-bold">
                  Notifications
                </h3>

                <span className="badge badge-primary badge-sm">
                  {unreadCount}
                </span>

              </div>

              <div className="mt-2 space-y-3">

                {notifications.length > 0 ? (
                  notifications.map(
                    (notification, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-base-300 bg-base-200 p-3"
                      >

                        <p className="text-sm font-medium">
                          {notification.title}
                        </p>

                        <p className="mt-1 text-xs text-base-content/60">
                          {notification.message}
                        </p>

                      </div>
                    )
                  )
                ) : (
                  <div className="py-6 text-center text-sm text-base-content/60">

                    No notifications

                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

        {/* USER MENU */}
        <div className="dropdown dropdown-end">

          <label
            tabIndex={0}
            className="btn btn-ghost gap-3 rounded-xl px-2"
          >

            {/* AVATAR */}
            <div className="avatar online placeholder">

              <div className="w-10 rounded-full bg-primary text-primary-content">

                <span className="text-sm font-bold">

                  {user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "U"}

                </span>

              </div>

            </div>

            {/* INFO */}
            <div className="hidden text-left md:block">

              <p className="text-sm font-semibold text-base-content">
                {user?.name || "User"}
              </p>

              <p className="text-xs capitalize text-base-content/60">
                {user?.role?.replace(
                  "_",
                  " "
                ) || "Student"}
              </p>

            </div>

          </label>

          {/* USER DROPDOWN */}
          <ul
            tabIndex={0}
            className="menu dropdown-content mt-3 w-60 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-2xl"
          >

            {/* PROFILE */}
            <li>
              <a className="rounded-xl">
                <User className="h-4 w-4" />
                Profile
              </a>
            </li>

            {/* SETTINGS */}
            <li>
              <a className="rounded-xl">
                <Settings className="h-4 w-4" />
                Settings
              </a>
            </li>

            <div className="divider my-1"></div>

            {/* LOGOUT */}
            <li>
              <button
                onClick={handleLogout}
                className="rounded-xl text-error hover:bg-error hover:text-error-content"
              >

                <LogOut className="h-4 w-4" />

                Logout

              </button>
            </li>

          </ul>

        </div>

      </div>

    </header>
  );
}

export default Navbar;