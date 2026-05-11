import { Navigate, Outlet } from "react-router-dom";

export default function StudentRoute() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (user.role === "teacher") {
    return <Navigate to="/teacher/dashboard" replace />;
  }
  if (user.role === "superAdmin") {
    return <Navigate to="/superadmin/dashboard" replace />;
  }


  return <Outlet />;
}