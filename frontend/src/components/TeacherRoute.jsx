import { Navigate, Outlet } from "react-router-dom";

export default function TeacherRoute() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // old admin => teacher (handled in backend too, but keep UI safe)
  if (!user || (user.role !== "teacher" && user.role !== "admin")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

