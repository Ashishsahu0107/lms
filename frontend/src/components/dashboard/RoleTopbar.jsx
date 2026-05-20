import React from "react";
import {
  Bell,
  Search,
  Settings,
} from "lucide-react";

export default function RoleTopbar({
  title,
  subtitle,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-base-300 bg-base-100/80 backdrop-blur-xl">

      <div className="flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between lg:px-6">

        {/* LEFT */}
        <div>

          <h1 className="text-2xl font-bold text-base-content">
            {title}
          </h1>

          {subtitle ? (
            <p className="mt-1 text-sm text-base-content/60">
              {subtitle}
            </p>
          ) : null}

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

          {/* Search */}
          <label className="input input-bordered hidden w-64 items-center gap-2 rounded-2xl md:flex">

            <Search className="h-4 w-4 opacity-60" />

            <input
              type="text"
              className="grow"
              placeholder="Search..."
            />

          </label>

          {/* Notification */}
          <button className="btn btn-circle btn-ghost relative">

            <Bell className="h-5 w-5" />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />

          </button>

          {/* Settings */}
          <button className="btn btn-circle btn-ghost">
            <Settings className="h-5 w-5" />
          </button>

          {/* User */}
          <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 px-3 py-2 shadow-sm">

            <div className="avatar placeholder">
              <div className="w-10 rounded-full bg-primary text-primary-content">
                <span className="font-semibold">
                  A
                </span>
              </div>
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-base-content">
                Admin User
              </p>

              <p className="text-xs text-base-content/60">
                LMS Manager
              </p>
            </div>

          </div>

        </div>

      </div>

    </header>
  );
}