import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const StudentLayout = () => {
  const { user } = useAuth();

  const studentMenuItems = [
    {
      title: 'Dashboard',
      path: '/student/dashboard',
      icon: 'LayoutDashboard'
    },
    {
      title: 'My Courses',
      path: '/student/courses',
      icon: 'BookOpen'
    },
    {
      title: 'Assignments',
      path: '/student/assignments',
      icon: 'FileText'
    },
    {
      title: 'Quiz',
      path: '/student/quiz',
      icon: 'HelpCircle'
    },
    {
      title: 'Attendance',
      path: '/student/attendance',
      icon: 'Calendar'
    },
    {
      title: 'Support',
      path: '/student/support',
      icon: 'MessageSquare'
    },
    {
      title: 'Profile',
      path: '/student/profile',
      icon: 'User'
    },
    {
      title: 'Leaderboard',
      path: '/student/leaderboard',
      icon: 'Trophy'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar menuItems={studentMenuItems} userRole="student" />
      
      <div className="lg:pl-64">
        <Topbar user={user} />
        
        <main className="p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
