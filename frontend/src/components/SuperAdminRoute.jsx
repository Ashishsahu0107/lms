import { Navigate, Outlet } from "react-router-dom";

export default function SuperAdminRoute() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!user || user.role !== "superAdmin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

