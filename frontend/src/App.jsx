import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Toast Provider
import { ToastProvider, ToastContainer } from "./components/Toast";

// Auth Provider
import { AuthProvider } from "./context/AuthContext";

// Route Components
import ProtectedRoute from "./routes/ProtectedRoute";

// Route Groups
import StudentRoutes from "./routes/StudentRoutes";
import TeacherRoutes from "./routes/TeacherRoutes";
import SuperAdminRoutes from "./routes/SuperAdminRoutes";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentCourses from "./pages/student/Courses";
import StudentCourseDetail from "./pages/student/CourseDetail";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* 🔓 PUBLIC ROUTES */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/courses" element={<StudentCourses />} />
            <Route path="/course/:id" element={<StudentCourseDetail />} />

            {/* 🔐 PROTECTED ROUTES */}
            <Route element={<ProtectedRoute />}>
              <StudentRoutes />
              <TeacherRoutes />
              <SuperAdminRoutes />
            </Route>

            {/* 🔁 FALLBACK */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          {/* Global Toast Container */}
          <ToastContainer position="top-right" />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

