import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail"; // ✅ NEW

import Assignments from "./pages/Assignments";
import Quiz from "./pages/Quiz";
import Attendance from "./pages/Attendance";
import Support from "./pages/Support";

import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Leaderboard from "./pages/Leaderboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
              <Route path="leaderboard" element={<Leaderboard />} />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />

          {/* 📚 Courses */}
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:id" element={<CourseDetail />} /> {/* ✅ NEW */}

          <Route path="assignments" element={<Assignments />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="support" element={<Support />} />

          {/* 👨‍🎓 Student */}
          <Route path="profile" element={<Profile />} />

          {/* 👑 Admin */}
          <Route path="admin" element={<Admin />} />
          <Route path="admin-dashboard" element={<AdminDashboard />} />
          

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App; 