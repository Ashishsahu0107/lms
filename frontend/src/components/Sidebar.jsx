import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ menuItems, userRole }) {
  // Prefer AuthContext user; fallback to localStorage for hard refresh cases
  const { user } = useAuth();
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const resolvedUser = user || storedUser;

  // If layout passes menuItems (recommended), render from that
  const effectiveMenuItems = Array.isArray(menuItems)
    ? menuItems
    : null;

  const effectiveRole = userRole || resolvedUser?.role;


  const linkClass =
    "block px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition";

  const activeClass = "bg-blue-500 text-white";

  return (
    <div className="w-64 min-h-screen bg-white dark:bg-gray-900 shadow p-4">
      <h2 className="text-xl font-bold mb-6 dark:text-white">LMS Panel</h2>

      {/* ================= SUPER ADMIN SIDEBAR ================= */}
      {(effectiveRole === "superAdmin" || resolvedUser?.role === "superAdmin") && (
        <div className="space-y-2">
          {(effectiveMenuItems || [
            { title: 'Dashboard', path: '/superadmin/dashboard' },
            { title: 'Users', path: '/superadmin/users' },
            { title: 'Teachers', path: '/superadmin/teachers' },
            { title: 'Courses', path: '/superadmin/courses' },
            { title: 'Analytics', path: '/superadmin/analytics' },
            { title: 'Settings', path: '/superadmin/settings' },
            { title: 'System Logs', path: '/superadmin/logs' },
            { title: 'Reports', path: '/superadmin/reports' },
            { title: 'Profile', path: '/superadmin/profile' },
          ]).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${linkClass} ${isActive ? activeClass : ""}`
              }
            >
              {item.title}
            </NavLink>
          ))}
        </div>
      )}


      {/* ================= STUDENT SIDEBAR ================= */}
      {resolvedUser?.role !== "teacher" && resolvedUser?.role !== "superAdmin" && (
        <div className="space-y-2">
          <NavLink
            to="/student/dashboard"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/student/courses"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Courses
          </NavLink>

          <NavLink
            to="/student/assignments"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Assignments
          </NavLink>

          <NavLink
            to="/student/quiz"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Quiz
          </NavLink>

          <NavLink
            to="/student/attendance"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Attendance
          </NavLink>

          <NavLink
            to="/student/leaderboard"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Leaderboard
          </NavLink>

          <NavLink
            to="/student/profile"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Profile
          </NavLink>
        </div>
      )}

      {/* ================= TEACHER SIDEBAR ================= */}
      {resolvedUser?.role === "teacher" && (
        <div className="space-y-2">
          <NavLink
            to="/teacher/dashboard"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Teacher Dashboard
          </NavLink>

          <NavLink
            to="/teacher/courses"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            My Courses
          </NavLink>

          <NavLink
            to="/teacher/create-course"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Create Course
          </NavLink>

          <NavLink
            to="/teacher/students"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Students
          </NavLink>

          <NavLink
            to="/teacher/assignments"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Assignments
          </NavLink>

          <NavLink
            to="/teacher/upload-content"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Upload Content
          </NavLink>

          <NavLink
            to="/teacher/analytics"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Analytics
          </NavLink>

          <NavLink
            to="/teacher/profile"
            className={({ isActive }) =>
              `${linkClass} ${isActive ? activeClass : ""}`
            }
          >
            Profile
          </NavLink>
        </div>
      )}
    </div>
  );
}

