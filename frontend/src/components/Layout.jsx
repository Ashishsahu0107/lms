import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import AppSidebar from "./AppSidebar";

const Layout = () => {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1">
        <Navbar />
        <main className="p-6 bg-gray-100 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;