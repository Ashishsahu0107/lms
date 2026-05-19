import React from "react";
import { Outlet } from "react-router-dom";
import { GraduationCap } from "lucide-react";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">LMS Pro</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-sm text-white/80 hover:text-white">Help</a>
            <a href="#" className="text-sm text-white/80 hover:text-white">Contact</a>
          </div>
        </div>
      </div>

      {/* Content */}
      <Outlet />
    </div>
  );
}