import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileText,
  Calendar,
  HelpCircle,
  LogOut,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Bell,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Menu
} from "lucide-react";

const AppSidebar = () => {
  const location = useLocation();
  const { user, enrolledCourses, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCoursesDropdown, setShowCoursesDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const menu = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={isCollapsed ? 20 : 18} />,
      badge: null
    },
    {
      name: "Courses",
      path: "/courses",
      icon: <BookOpen size={isCollapsed ? 20 : 18} />,
      badge: enrolledCourses?.length || "0",
      hasDropdown: true
    },
    {
      name: "Assignments",
      path: "/assignments",
      icon: <FileText size={isCollapsed ? 20 : 18} />,
      badge: "2"
    },
    {
      name: "Quizzes",
      path: "/quizzes",
      icon: <ClipboardList size={isCollapsed ? 20 : 18} />,
      badge: null
    },
    {
      name: "Attendance",
      path: "/attendance",
      icon: <Calendar size={isCollapsed ? 20 : 18} />,
      badge: null
    },
    {
      name: "Learning Support",
      path: "/support",
      icon: <HelpCircle size={isCollapsed ? 20 : 18} />,
      badge: "1"
    }
  ];

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
        setIsMobileMenuOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowCoursesDropdown(false);
  }, [location.pathname]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  const getCourseIcon = (index) => {
    const icons = ["🔵", "🟢", "🟠", "🟣", "🔴", "🟡"];
    return icons[index % icons.length];
  };

  const toggleSidebar = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    } else {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };

  const handleNavigation = (path, hasDropdown) => {
    if (hasDropdown) {
      setShowCoursesDropdown(!showCoursesDropdown);
    } else {
      window.location.href = path;
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-30 md:hidden bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition"
      >
        <Menu size={24} className="text-gray-700" />
      </button>

      {/* Overlay for mobile */}
      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-screen bg-white border-r shadow-lg transition-all duration-300 z-30
          ${isMobile 
            ? (isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full') 
            : (isCollapsed ? 'w-20' : 'w-64')
          }`}
      >
        {/* Collapse Toggle Button (Desktop only) */}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-10 bg-white border rounded-full p-1 shadow-md hover:bg-gray-50 transition"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}

        {/* Header */}
        <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'justify-between'} p-4 sm:p-5 border-b`}>
          {(!isCollapsed || isMobile) ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">H</span>
                </div>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  HustLMS
                </span>
              </div>
              
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Bell size={18} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </>
          ) : (
            <div className="w-10 h-10 mx-auto bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'gap-2 sm:gap-3'} p-3 sm:p-4 border-b bg-gray-50`}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
            {user?.avatar || "U"}
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs sm:text-sm truncate">{user?.name || "User"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.role || "Student"}</p>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className={`flex flex-col ${isCollapsed && !isMobile ? 'items-center' : ''} p-3 sm:p-4 gap-1 overflow-y-auto max-h-[calc(100vh-280px)]`}>
          {menu.map((item, index) => (
            <div key={index} className="w-full">
              <div
                className={`relative group flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'gap-2 sm:gap-3'} p-2 sm:p-3 rounded-lg transition-all cursor-pointer
                  ${isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
                onClick={() => handleNavigation(item.path, item.hasDropdown)}
              >
                <span className={`${isActive(item.path) ? 'text-white' : 'text-gray-500'} flex-shrink-0`}>
                  {item.icon}
                </span>
                
                {(!isCollapsed || isMobile) && (
                  <>
                    <span className="flex-1 font-medium text-xs sm:text-sm truncate">{item.name}</span>
                    {item.badge && (
                      <span className={`px-1.5 sm:px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${
                        isActive(item.path)
                          ? 'bg-white text-blue-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.hasDropdown && (
                      <span className="ml-1 flex-shrink-0">
                        {showCoursesDropdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Courses Dropdown */}
              {item.hasDropdown && showCoursesDropdown && (!isCollapsed || isMobile) && (
                <div className={`${isCollapsed && !isMobile ? 'ml-0' : 'ml-6 sm:ml-8'} mt-1 space-y-1`}>
                  {enrolledCourses && enrolledCourses.length > 0 ? (
                    <>
                      <div className="text-xs text-gray-500 px-2 sm:px-3 py-1">
                        Your Courses ({enrolledCourses.length})
                      </div>
                      {enrolledCourses.map((course, idx) => (
                        <div
                          key={course.id}
                          onClick={() => window.location.href = `/course/${course.id}`}
                          className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm text-gray-600 hover:bg-gray-100 cursor-pointer transition group"
                        >
                          <span className="text-sm sm:text-base">{getCourseIcon(idx)}</span>
                          <span className="flex-1 truncate">{course.title}</span>
                          <span className="text-green-600 opacity-0 group-hover:opacity-100">
                            <PlayCircle size={14} />
                          </span>
                        </div>
                      ))}
                      <div
                        onClick={() => window.location.href = "/courses"}
                        className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 mt-1 rounded-lg text-xs text-blue-600 hover:bg-blue-50 cursor-pointer transition"
                      >
                        <BookOpen size={14} />
                        <span className="truncate">Browse All Courses</span>
                      </div>
                    </>
                  ) : (
                    <div className="px-2 sm:px-3 py-2 text-xs text-gray-500">
                      No courses enrolled yet
                      <div
                        onClick={() => window.location.href = "/courses"}
                        className="mt-1 text-blue-600 hover:underline cursor-pointer"
                      >
                        Browse Courses →
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t bg-white ${isCollapsed && !isMobile ? 'text-center' : ''}`}>
          <div className={`flex ${isCollapsed && !isMobile ? 'flex-col' : 'flex-row'} gap-1 sm:gap-2`}>
            <Link 
              to="/profile"
              className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'gap-1 sm:gap-2'} p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition w-full`}
            >
              <User size={16} className="text-gray-600" />
              {(!isCollapsed || isMobile) && <span className="text-xs sm:text-sm">Profile</span>}
            </Link>
            <button 
              onClick={handleLogout}
              className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center' : 'gap-1 sm:gap-2'} p-1.5 sm:p-2 rounded-lg hover:bg-red-50 transition w-full text-red-600`}
            >
              <LogOut size={16} />
              {(!isCollapsed || isMobile) && <span className="text-xs sm:text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Spacer */}
      <div className={`transition-all duration-300 
        ${isMobile ? 'ml-0' : (isCollapsed ? 'ml-20' : 'ml-64')}
      `} />
    </>
  );
};

export default AppSidebar;