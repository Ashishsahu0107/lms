import React from 'react';

import StudentLayout from '../layouts/StudentLayout';
import TeacherLayout from '../layouts/TeacherLayout';
import SuperAdminLayout from '../layouts/SuperAdminLayout';

import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';

import Login from '../pages/Login';
import Register from '../pages/Register';

import StudentDashboard from '../pages/student/Dashboard';
import StudentCourses from '../pages/student/Courses';
import StudentCourseDetail from '../pages/student/CourseDetail';
import StudentAssignments from '../pages/student/Assignments';
import StudentQuiz from '../pages/student/Quiz';
import StudentAttendance from '../pages/student/Attendance';
import StudentSupport from '../pages/student/Support';
import StudentProfile from '../pages/student/Profile';
import StudentLeaderboard from '../pages/student/Leaderboard';

import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import TeacherCourses from '../pages/teacher/Courses';
import CreateCourse from '../pages/teacher/CreateCourse';
import TeacherStudents from '../pages/teacher/Students';
import TeacherAssignments from '../pages/teacher/Assignments';
import UploadContent from '../pages/teacher/UploadContent';
import TeacherAnalytics from '../pages/teacher/Analytics';
import TeacherProfile from '../pages/teacher/Profile';

import SuperAdminDashboard from '../pages/superadmin/Dashboard';
import ManageUsers from '../pages/superadmin/ManageUsers';
import ManageTeachers from '../pages/superadmin/ManageTeachers';
import ManageCourses from '../pages/superadmin/ManageCourses';
import SuperAdminAnalytics from '../pages/superadmin/Analytics';
import SuperAdminSettings from '../pages/superadmin/Settings';
import SystemLogs from '../pages/superadmin/SystemLogs';
import Reports from '../pages/superadmin/Reports';
import SuperAdminProfile from '../pages/superadmin/Profile';

export const ROLE_ROUTE_TABLE = {
  student: {
    layout: StudentLayout,
    roleGuard: (children) => (
      <RoleProtectedRoute allowedRoles={['user']}>{children}</RoleProtectedRoute>
    ),
  },
  teacher: {
    layout: TeacherLayout,
    roleGuard: (children) => (
      <RoleProtectedRoute allowedRoles={['teacher', 'superAdmin']}>{children}</RoleProtectedRoute>
    ),
  },
  superAdmin: {
    layout: SuperAdminLayout,
    roleGuard: (children) => (
      <RoleProtectedRoute allowedRoles={['superAdmin']}>{children}</RoleProtectedRoute>
    ),
  },
};

export const routeDefinitions = {
  public: [
    { path: '/', element: <Login /> },
    { path: '/register', element: <Register /> },
    { path: '/courses', element: <StudentCourses /> },
    { path: '/course/:id', element: <StudentCourseDetail /> },
  ],
  protected: {
    element: <ProtectedRoute />,
    children: [
      {
        role: 'student',
        children: [
          { path: 'student/dashboard', element: <StudentDashboard /> },
          { path: 'student/courses', element: <StudentCourses /> },
          { path: 'student/course/:id', element: <StudentCourseDetail /> },
          { path: 'student/assignments', element: <StudentAssignments /> },
          { path: 'student/quiz', element: <StudentQuiz /> },
          { path: 'student/attendance', element: <StudentAttendance /> },
          { path: 'student/support', element: <StudentSupport /> },
          { path: 'student/profile', element: <StudentProfile /> },
          { path: 'student/leaderboard', element: <StudentLeaderboard /> },
        ],
      },
      {
        role: 'teacher',
        children: [
          { path: 'teacher/dashboard', element: <TeacherDashboard /> },
          { path: 'teacher/courses', element: <TeacherCourses /> },
          { path: 'teacher/create-course', element: <CreateCourse /> },
          { path: 'teacher/students', element: <TeacherStudents /> },
          { path: 'teacher/assignments', element: <TeacherAssignments /> },
          { path: 'teacher/upload-content', element: <UploadContent /> },
          { path: 'teacher/analytics', element: <TeacherAnalytics /> },
          { path: 'teacher/profile', element: <TeacherProfile /> },
        ],
      },
      {
        role: 'superAdmin',
        children: [
          { path: 'superadmin/dashboard', element: <SuperAdminDashboard /> },
          { path: 'superadmin/users', element: <ManageUsers /> },
          { path: 'superadmin/teachers', element: <ManageTeachers /> },
          { path: 'superadmin/courses', element: <ManageCourses /> },
          { path: 'superadmin/analytics', element: <SuperAdminAnalytics /> },
          { path: 'superadmin/settings', element: <SuperAdminSettings /> },
          { path: 'superadmin/logs', element: <SystemLogs /> },
          { path: 'superadmin/reports', element: <Reports /> },
          { path: 'superadmin/profile', element: <SuperAdminProfile /> },
        ],
      },
    ],
  },
};

