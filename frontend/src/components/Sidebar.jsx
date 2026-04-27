import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user"));

  const linkClass =
    "block px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700";

  const activeClass = "bg-blue-500 text-white";

  return (
    <div className="w-64 min-h-screen bg-white dark:bg-gray-900 shadow p-4">
      <h2 className="text-xl font-bold mb-6 dark:text-white">
        LMS Panel
      </h2>

      {/* STUDENT */}
      <div className="space-y-2">

        <NavLink to="/dashboard" className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : ""}`
        }>
          Dashboard
        </NavLink>

        <NavLink to="/courses" className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : ""}`
        }>
          Courses
        </NavLink>

        <NavLink to="/assignments" className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : ""}`
        }>
          Assignments
        </NavLink>

        <NavLink to="/quiz" className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : ""}`
        }>
          Quiz
        </NavLink>

        <NavLink to="/attendance" className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : ""}`
        }>
          Attendance
        </NavLink>

        <NavLink to="/leaderboard" className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : ""}`
        }>
          Leaderboard
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) =>
          `${linkClass} ${isActive ? activeClass : ""}`
        }>
          Profile
        </NavLink>

      </div>

      {/* ADMIN */}
      {user?.role === "admin" && (
        <div className="mt-8">
          <h3 className="text-sm text-gray-500 mb-2">
            Admin
          </h3>

          <div className="space-y-2">

            <NavLink to="/admin/dashboard" className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }>
              Admin Dashboard
            </NavLink>

            <NavLink to="/admin/lessons" className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }>
              Manage Lessons
            </NavLink>

            <NavLink to="/admin/add-lesson" className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }>
              Add Lesson
            </NavLink>

            {/* 🔥 FIXED */}
            <NavLink to="/admin/quiz" className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }>
              Quiz Panel
            </NavLink>

          </div>
        </div>
      )}
    </div>
  );
}