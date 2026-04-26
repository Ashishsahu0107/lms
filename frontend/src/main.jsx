import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";              // Tailwind
import { Toaster } from "react-hot-toast";  // Toast

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <App />
    <Toaster position="top-right" />
  </>
);