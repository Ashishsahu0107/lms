import React from "react";
import { Route } from "react-router-dom";

import TeacherLayout from "../layouts/TeacherLayout";

import TeacherDashboard from "../pages/teacher/TeacherDashboard";
import TeacherCourses from "../pages/teacher/Courses";
import CreateCourse from "../pages/teacher/CreateCourse";
import TeacherStudents from "../pages/teacher/Students";
import TeacherAssignments from "../pages/teacher/Assignments";
import UploadContent from "../pages/teacher/UploadContent";
import TeacherAnalytics from "../pages/teacher/Analytics";
import TeacherProfile from "../pages/teacher/Profile";

import RoleProtectedRoute from "./RoleProtectedRoute";

export default function TeacherRoutes() {
  return (
    <Route
      element={
        <RoleProtectedRoute allowedRoles={["teacher", "superAdmin"]}>
          <TeacherLayout />
        </RoleProtectedRoute>
      }
    >
      <Route path="teacher/dashboard" element={<TeacherDashboard />} />
      <Route path="teacher/courses" element={<TeacherCourses />} />
      <Route path="teacher/create-course" element={<CreateCourse />} />
      <Route path="teacher/students" element={<TeacherStudents />} />
      <Route path="teacher/assignments" element={<TeacherAssignments />} />
      <Route path="teacher/upload-content" element={<UploadContent />} />
      <Route path="teacher/analytics" element={<TeacherAnalytics />} />
      <Route path="teacher/profile" element={<TeacherProfile />} />
    </Route>
  );
}
