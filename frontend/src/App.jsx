import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";

import Assignments from "./pages/Assignments";
import Quiz from "./pages/Quiz";
import Attendance from "./pages/Attendance";
import Support from "./pages/Support";

import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLessons from "./pages/AdminLessons";
import AddLesson from "./pages/AddLesson";

import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Student */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="support" element={<Support />} />
          <Route path="profile" element={<Profile />} />
          <Route path="leaderboard" element={<Leaderboard />} />

          {/* Admin */}
          <Route
            path="admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="lessons" element={<AdminLessons />} />
            <Route path="add-lesson" element={<AddLesson />} />

            {/* 🔥 FIX */}
            <Route path="quiz" element={<Quiz />} />
          </Route>

          {/* Redirects */}
          <Route path="admin-dashboard" element={<Navigate to="/admin/dashboard" />} />
          <Route path="add-lesson" element={<Navigate to="/admin/add-lesson" />} />
          <Route path="manage-lessons" element={<Navigate to="/admin/lessons" />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;