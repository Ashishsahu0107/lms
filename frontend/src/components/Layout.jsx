import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 min-h-screen bg-gray-100 dark:bg-gray-900">
        <Topbar />

        <div className="p-6">
          <Outlet /> {/* 🔥 MUST */}
        </div>
      </div>

    </div>
  );
}