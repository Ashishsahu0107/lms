import React from "react";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { cn } from "../../utils/cn";

const defaultItems = [
  {
    key: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    key: "courses",
    label: "Courses",
    icon: BookOpen,
  },
  {
    key: "reports",
    label: "Reports",
    icon: BarChart3,
  },
];

export default function SidebarShell({
  className,
  items = defaultItems,
  activeKey = "overview",
  onNavigate,
}) {
  return (
    <aside
      className={cn(
        "flex h-screen w-72 shrink-0 flex-col border-r border-base-300 bg-base-100 shadow-xl",
        className
      )}
    >
      {/* LOGO */}
      <div className="border-b border-base-300 px-6 py-6">

        <div className="flex items-center gap-3">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-lg">
            <Sparkles className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-base-content">
              LMS Pro
            </h1>

            <p className="text-xs text-base-content/60">
              FlyonUI Dashboard
            </p>
          </div>

        </div>

      </div>

      {/* MENU */}
      <div className="flex-1 overflow-y-auto px-4 py-5">

        <div className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-base-content/50">
          Main Menu
        </div>

        <div className="space-y-2">

          {items.map((it) => {
            const active = it.key === activeKey;

            const Icon = it.icon;

            return (
              <button
                key={it.key}
                type="button"
                onClick={() => onNavigate?.(it.key)}
                className={cn(
                  "group flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-all duration-300",
                  active
                    ? "bg-primary text-primary-content shadow-lg"
                    : "hover:bg-base-200 text-base-content"
                )}
              >
                <div className="flex items-center gap-3">

                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                      active
                        ? "bg-white/20"
                        : "bg-base-200 group-hover:bg-primary/10"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-medium">
                      {it.label}
                    </p>

                    <p
                      className={cn(
                        "text-xs",
                        active
                          ? "text-primary-content/70"
                          : "text-base-content/50"
                      )}
                    >
                      Manage {it.label.toLowerCase()}
                    </p>
                  </div>

                </div>

                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform duration-300",
                    active && "translate-x-1"
                  )}
                />

              </button>
            );
          })}

        </div>

        {/* QUICK CARD */}
        <div className="mt-8 rounded-3xl bg-gradient-to-br from-primary to-secondary p-5 text-primary-content shadow-xl">

          <div className="badge badge-neutral mb-3 border-none">
            PRO
          </div>

          <h3 className="text-lg font-bold">
            Upgrade Dashboard
          </h3>

          <p className="mt-2 text-sm text-primary-content/80">
            Unlock analytics, reports, premium themes and AI tools.
          </p>

          <button className="btn btn-sm mt-5 w-full border-none bg-white text-black hover:bg-base-200">
            Upgrade Now
          </button>

        </div>

      </div>

      {/* FOOTER */}
      <div className="border-t border-base-300 p-4">

        <div className="flex items-center gap-3 rounded-2xl bg-base-200 p-3">

          <div className="avatar placeholder">
            <div className="w-12 rounded-full bg-primary text-primary-content">
              <span className="font-semibold">
                A
              </span>
            </div>
          </div>

          <div className="flex-1">
            <p className="font-semibold text-base-content">
              Admin User
            </p>

            <p className="text-xs text-base-content/60">
              Super Admin
            </p>
          </div>

        </div>

      </div>

    </aside>
  );
}