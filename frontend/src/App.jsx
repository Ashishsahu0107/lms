import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Layout Components
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Auth Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Main Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

// Course Pages
import Courses from "./pages/Courses";
import CourseDetailPage from "./pages/CourseDetailPage";

// Learning Content Pages
import CourseLearn from "./pages/learning/CourseLearn";
import TopicView from "./pages/learning/TopicView";
import QuizTake from "./pages/learning/QuizTake";

// Feature Components
import AssignmentsPage from "./components/AssignmentsPage";
import AttendancePage from "./components/AttendancePage";
import QuizzesPage from "./components/QuizzesPage";
import QuizTakePage from "./components/QuizTakePage";
import LearningSupportPage from "./components/LearningSupportPage";

function App() {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Dashboard & Home */}
              <Route path="/home" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Course Routes */}
              <Route path="/courses" element={<Courses />} />
              <Route path="/course/:id" element={<CourseDetailPage />} />
              
              {/* Learning Routes */}
              <Route path="/course/:courseId/learn" element={<CourseLearn />} />
              <Route path="/course/:courseId/topic/:topicId" element={<TopicView />} />
              <Route path="/course/:courseId/quiz/:quizId" element={<QuizTake />} />
              
              {/* Feature Routes */}
              <Route path="/assignments" element={<AssignmentsPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/quizzes" element={<QuizzesPage />} />
              <Route path="/quiz/:id" element={<QuizTakePage />} />
              <Route path="/support" element={<LearningSupportPage />} />
              
              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// 404 Component
const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <a href="/home" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Go Home
        </a>
      </div>
    </div>
  );
};

export default App;