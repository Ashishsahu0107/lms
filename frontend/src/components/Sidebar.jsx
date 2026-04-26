import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  // 🔥 USER GET
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // 🎓 STUDENT MENU
  const studentMenu = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Courses", path: "/courses", icon: "📚" },
    { name: "Assignments", path: "/assignments", icon: "📝" },
    { name: "Quiz", path: "/quiz", icon: "❓" },
    { name: "Attendance", path: "/attendance", icon: "📅" },
    { name: "Support", path: "/support", icon: "💬" },
    { name: "Leaderboard", path: "/leaderboard", icon: "🏆" },
  ];

  // 👑 ADMIN MENU
  const adminMenu = [
    { name: "Admin Panel", path: "/admin", icon: "⚙️" },
    { name: "Admin Dashboard", path: "/admin-dashboard", icon: "📊" },
    { name: "Add Quiz", path: "/add-quiz", icon: "➕" },
    { name: "Upload Quiz", path: "/upload-quiz", icon: "📤" },
  ];

  // 🔥 ROLE BASED MENU
  const menu = user.role === "admin" ? adminMenu : studentMenu;

  return (
    <div className="w-64 min-h-screen bg-white dark:bg-gray-800 shadow-lg p-5 flex flex-col">

      {/* Logo */}
      <h2 className="text-2xl font-bold text-blue-600 mb-8">
        🎓 LMS
      </h2>

      {/* Menu */}
      <nav className="space-y-2 flex-1">
        {menu.map((item) => {
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                active
                  ? "bg-blue-500 text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="text-sm text-gray-400 text-center">
        © LMS
      </div>

    </div>
  );
}