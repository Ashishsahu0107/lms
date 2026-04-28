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
import AdminCourses from "./pages/AdminCourses";

import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";

import Layout from "./components/Layout";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import StudentRoute from "./components/StudentRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔓 PUBLIC */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* 🔐 AUTH REQUIRED */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>

            {/* 🎓 STUDENT */}
            <Route element={<StudentRoute />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="courses" element={<Courses />} />
              <Route path="courses/:id" element={<CourseDetail />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="quiz" element={<Quiz />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="support" element={<Support />} />
              <Route path="profile" element={<Profile />} />
              <Route path="leaderboard" element={<Leaderboard />} />
            </Route>

            {/* 👑 ADMIN */}
            <Route path="admin" element={<AdminRoute />}>
              <Route element={<Admin />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="lessons" element={<AdminLessons />} />
                <Route path="add-lesson" element={<AddLesson />} />
                <Route path="quiz" element={<Quiz />} />
              </Route>
            </Route>

          </Route>
        </Route>

        {/* 🔁 FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;