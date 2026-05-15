import React from "react";
import { Route } from "react-router-dom";

import StudentLayout from "../layouts/StudentLayout";

import StudentDashboard from "../pages/student/Dashboard";
import StudentCourses from "../pages/student/Courses";
import StudentCourseDetail from "../pages/student/CourseDetail";
import StudentAssignments from "../pages/student/Assignments";
import StudentQuiz from "../pages/student/Quiz";
import StudentAttendance from "../pages/student/Attendance";
import StudentSupport from "../pages/student/Support";
import StudentProfile from "../pages/student/Profile";
import StudentLeaderboard from "../pages/student/Leaderboard";

import RoleProtectedRoute from "./RoleProtectedRoute";

export default function StudentRoutes() {
  return (
    <Route
      element={
        <RoleProtectedRoute allowedRoles={["user"]}>
          <StudentLayout />
        </RoleProtectedRoute>
      }
    >
      <Route path="student/dashboard" element={<StudentDashboard />} />
      <Route path="student/courses" element={<StudentCourses />} />
      <Route path="student/course/:id" element={<StudentCourseDetail />} />
      <Route path="student/assignments" element={<StudentAssignments />} />
      <Route path="student/quiz" element={<StudentQuiz />} />
      <Route path="student/attendance" element={<StudentAttendance />} />
      <Route path="student/support" element={<StudentSupport />} />
      <Route path="student/profile" element={<StudentProfile />} />
      <Route path="student/leaderboard" element={<StudentLeaderboard />} />
    </Route>
  );
}
