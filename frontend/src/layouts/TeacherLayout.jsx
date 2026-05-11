import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const TeacherLayout = () => {
  const { user } = useAuth();

  const teacherMenuItems = [
    {
      title: 'Dashboard',
      path: '/teacher/dashboard',
      icon: 'LayoutDashboard'
    },
    {
      title: 'My Courses',
      path: '/teacher/courses',
      icon: 'BookOpen'
    },
    {
      title: 'Create Course',
      path: '/teacher/create-course',
      icon: 'PlusCircle'
    },
    {
      title: 'Students',
      path: '/teacher/students',
      icon: 'Users'
    },
    {
      title: 'Assignments',
      path: '/teacher/assignments',
      icon: 'FileText'
    },
    {
      title: 'Upload Content',
      path: '/teacher/upload-content',
      icon: 'Upload'
    },
    {
      title: 'Analytics',
      path: '/teacher/analytics',
      icon: 'BarChart3'
    },
    {
      title: 'Profile',
      path: '/teacher/profile',
      icon: 'User'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar menuItems={teacherMenuItems} userRole="teacher" />
      
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

export default TeacherLayout;
