import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" />;
  }

  // 🔥 ADMIN restriction
  if (user.role === "admin") {
    // admin ko student pages me nahi jane dena
    if (
      location.pathname.includes("dashboard") ||
      location.pathname.includes("courses") ||
      location.pathname.includes("quiz") ||
      location.pathname.includes("attendance")
    ) {
      return <Navigate to="/admin-dashboard" />;
    }
  }

  // 🔥 STUDENT restriction
  if (user.role !== "admin") {
    if (location.pathname.includes("admin")) {
      return <Navigate to="/dashboard" />;
    }
  }

  return children;
}