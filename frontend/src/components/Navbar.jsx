import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LogOut, 
  User, 
  Settings,
  ChevronDown,
  Home,
  BookOpen,
  FileText,
  ClipboardList,
  Calendar,
  HelpCircle,
  LayoutDashboard,
  Menu,
  X,
  Bell,
  Grid
} from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navItems = [
    { name: "Home", path: "/home", icon: <Home className="w-5 h-5" /> },
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "Courses", path: "/courses", icon: <BookOpen className="w-5 h-5" /> },
    { name: "Assignments", path: "/assignments", icon: <FileText className="w-5 h-5" /> },
    { name: "Quizzes", path: "/quizzes", icon: <ClipboardList className="w-5 h-5" /> },
    { name: "Attendance", path: "/attendance", icon: <Calendar className="w-5 h-5" /> },
    { name: "Support", path: "/support", icon: <HelpCircle className="w-5 h-5" /> }
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.user-menu') && !e.target.closest('.nav-menu') && !e.target.closest('.notifications-menu')) {
        setShowUserMenu(false);
        setShowNavMenu(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              HustLMS
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative nav-menu hidden sm:block">
              <button
                onClick={() => {
                  setShowNavMenu(!showNavMenu);
                  setShowUserMenu(false);
                  setShowNotifications(false);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition flex items-center gap-1"
              >
                <Grid className="w-5 h-5 text-gray-600" />
                <span className="hidden sm:inline text-sm font-medium text-gray-700">Menu</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  showNavMenu ? 'rotate-180' : ''
                }`} />
              </button>

              {showNavMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border z-50">
                  <div className="p-2">
                    {navItems.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setShowNavMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                          location.pathname === item.path
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span className={location.pathname === item.path ? "text-white" : "text-gray-500"}>
                          {item.icon}
                        </span>
                        <span className="flex-1 text-left">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            <div className="relative notifications-menu">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                  setShowNavMenu(false);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition relative"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>

            <div className="relative user-menu">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNavMenu(false);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.avatar || "U"}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  showUserMenu ? 'rotate-180' : ''
                }`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border z-50">
                  <div className="p-4 border-b">
                    <p className="font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs text-blue-600 mt-1">{user?.role}</p>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      <User className="w-4 h-4 text-gray-500" />
                      My Profile
                    </button>

                    <div className="border-t my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showMobileMenu && (
        <div className="sm:hidden fixed inset-0 z-50 bg-white">
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-xl">Menu</h2>
              <button onClick={() => setShowMobileMenu(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg ${
                    location.pathname === item.path
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;