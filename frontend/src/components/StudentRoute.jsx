import { Navigate, Outlet } from "react-router-dom";

export default function StudentRoute() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Outlet />;
}