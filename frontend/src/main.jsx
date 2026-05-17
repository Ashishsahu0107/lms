import React from "react";
import ReactDOM from "react-dom/client";
import AppRoot from "./app";
import "./index.css";              // Tailwind
import { Toaster } from "react-hot-toast";  // Toast

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <AppRoot />
    <Toaster position="top-right" />
  </>
);