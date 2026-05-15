import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Toast Provider
import { ToastProvider, ToastContainer } from "./components/Toast";

// Auth Provider
import { AuthProvider } from "./context/AuthContext";

// Route Components
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleProtectedRoute from "./routes/RoleProtectedRoute";

// Layout Components
import StudentLayout from "./layouts/StudentLayout";
import TeacherLayout from "./layouts/TeacherLayout";
import SuperAdminLayout from "./layouts/SuperAdminLayout";

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentCourses from "./pages/student/Courses";
import StudentCourseDetail from "./pages/student/CourseDetail";
import StudentAssignments from "./pages/student/Assignments";
import StudentQuiz from "./pages/student/Quiz";
import StudentAttendance from "./pages/student/Attendance";
import StudentSupport from "./pages/student/Support";
import StudentProfile from "./pages/student/Profile";
import StudentLeaderboard from "./pages/student/Leaderboard";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherCourses from "./pages/teacher/Courses";
import CreateCourse from "./pages/teacher/CreateCourse";
import TeacherStudents from "./pages/teacher/Students";
import TeacherAssignments from "./pages/teacher/Assignments";
import UploadContent from "./pages/teacher/UploadContent";
import TeacherAnalytics from "./pages/teacher/Analytics";
import TeacherProfile from "./pages/teacher/Profile";

// Super Admin Pages
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import ManageUsers from "./pages/superadmin/ManageUsers";
import ManageTeachers from "./pages/superadmin/ManageTeachers";
import ManageCourses from "./pages/superadmin/ManageCourses";
import SuperAdminAnalytics from "./pages/superadmin/Analytics";
import SuperAdminSettings from "./pages/superadmin/Settings";
import SystemLogs from "./pages/superadmin/SystemLogs";
import Reports from "./pages/superadmin/Reports";
import SuperAdminProfile from "./pages/superadmin/Profile";

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
              
              {/* 🎓 STUDENT ROUTES */}
              <Route element={<RoleProtectedRoute allowedRoles={['user']} />}>
                <Route element={<StudentLayout />}>
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
              </Route>

              {/* 🎓 TEACHER ROUTES */}
              <Route element={<RoleProtectedRoute allowedRoles={['teacher', 'superAdmin']} />}>
                <Route element={<TeacherLayout />}>
                  <Route path="teacher/dashboard" element={<TeacherDashboard />} />
                  <Route path="teacher/courses" element={<TeacherCourses />} />
                  <Route path="teacher/create-course" element={<CreateCourse />} />
                  <Route path="teacher/students" element={<TeacherStudents />} />
                  <Route path="teacher/assignments" element={<TeacherAssignments />} />
                  <Route path="teacher/upload-content" element={<UploadContent />} />
                  <Route path="teacher/analytics" element={<TeacherAnalytics />} />
                  <Route path="teacher/profile" element={<TeacherProfile />} />
                </Route>
              </Route>

              {/* 👑 SUPER ADMIN ROUTES */}
              <Route element={<RoleProtectedRoute allowedRoles={['superAdmin']} />}>
                <Route element={<SuperAdminLayout />}>
                  <Route path="superadmin/dashboard" element={<SuperAdminDashboard />} />
                  <Route path="superadmin/users" element={<ManageUsers />} />
                  <Route path="superadmin/teachers" element={<ManageTeachers />} />
                  <Route path="superadmin/courses" element={<ManageCourses />} />
                  <Route path="superadmin/analytics" element={<SuperAdminAnalytics />} />
                  <Route path="superadmin/settings" element={<SuperAdminSettings />} />
                  <Route path="superadmin/logs" element={<SystemLogs />} />
                  <Route path="superadmin/reports" element={<Reports />} />
                  <Route path="superadmin/profile" element={<SuperAdminProfile />} />
                </Route>
              </Route>

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

