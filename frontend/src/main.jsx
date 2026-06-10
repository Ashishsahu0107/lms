import React from "react";
import ReactDOM from "react-dom/client";
import AppRoot from "./app";
import "./index.css";              // Tailwind CSS v4 & FlyonUI
import { Toaster } from "react-hot-toast";  // Notifications

// Root entry point wrapping the LMS Pro Application
// Global Store, Theme, Auth, and Socket providers are managed inside AppRoot via AppProvider


ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <AppRoot />
    <Toaster position="top-right" />
  </>
);