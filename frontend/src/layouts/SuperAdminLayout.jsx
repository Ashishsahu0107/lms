import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const SuperAdminLayout = () => {
  const { user } = useAuth();

  const adminMenuItems = [
    {
      title: 'Dashboard',
      path: '/superadmin/dashboard',
      icon: 'LayoutDashboard'
    },
    {
      title: 'Users',
      path: '/superadmin/users',
      icon: 'Users'
    },
    {
      title: 'Teachers',
      path: '/superadmin/teachers',
      icon: 'GraduationCap'
    },
    {
      title: 'Courses',
      path: '/superadmin/courses',
      icon: 'BookOpen'
    },
    {
      title: 'Analytics',
      path: '/superadmin/analytics',
      icon: 'BarChart3'
    },
    {
      title: 'Settings',
      path: '/superadmin/settings',
      icon: 'Settings'
    },
    {
      title: 'System Logs',
      path: '/superadmin/logs',
      icon: 'FileText'
    },
    {
      title: 'Reports',
      path: '/superadmin/reports',
      icon: 'Clipboard'
    },
    {
      title: 'Profile',
      path: '/superadmin/profile',
      icon: 'User'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar menuItems={adminMenuItems} userRole="superAdmin" />
      
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

export default SuperAdminLayout;
