import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { getStudentStats, getStudentProgress } from "../../../services/dashboardService";
import { getStudentEnrollments } from "../../../services/enrollmentService";
import { getImageUrl, handleImageError } from "../../../utils/image";
import {
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  Play,
  CheckCircle2,
  CalendarDays,
  ArrowRight,
  Loader2,
  Sparkles,
  Award,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { StatCard } from "../../../components/ui/StatCard";
import { Button } from "../../../components/ui/Button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    learningProgress: 0,
    quizAccuracy: 0,
    leaderboardRank: 12,
    upcomingAssignments: [],
    upcomingQuizzes: [],
  });
  const [progressData, setProgressData] = useState({
    scoreTrend: [],
    weeklyStudy: [],
  });
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [statsRes, progressRes] = await Promise.all([
          getStudentStats(),
          getStudentProgress(),
        ]);

        if (statsRes.data?.success) {
          setStats(statsRes.data.data);
        }
        if (progressRes.data?.success) {
          setProgressData(progressRes.data.data);
        }

        // Load actual enrolled courses
        if (user?.id) {
          const enrollRes = await getStudentEnrollments(user.id);
          if (enrollRes.data?.success) {
            setEnrollments(enrollRes.data.data.slice(0, 3)); // show top 3
          }
        }
      } catch (err) {
        console.error("Failed to load student dashboard metrics:", err);
        setError("Unable to sync dashboard with LMS server. Please check your network connection.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-32 space-y-4" id="student-dashboard-loading">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">Syncing dynamic curriculum maps...</p>
      </div>
    );
  }

  // Format real courses
  const courses = enrollments.map((enrollment) => {
    const course = enrollment.courseId ?? {};
    return {
      id: course._id,
      title: course.title || "Untitled Course",
      instructor: course.teacherId?.name || "LMS Instructor",
      progress: enrollment.progress || 0,
      thumbnail: course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300",
    };
  });

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
      id="student-dashboard-root"
    >
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl p-4 flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Welcome Banner */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8 shadow-lg shadow-indigo-600/10"
        id="student-welcome-banner"
      >
        <div className="relative z-10">
          <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-0 hover:bg-white/30 backdrop-blur-md">
            <Sparkles className="h-3 w-3 mr-1.5 fill-current" /> Enrolled Student Cockpit
          </Badge>
          <h1 className="text-3xl font-bold text-white mb-2" id="student-welcome-title">
            Hello, {user?.name || "Learner"}! Ready to learn?
          </h1>
          <p className="text-white/80 max-w-xl mb-6">
            Welcome to your updated learning center! You have completed {courses.filter(c => c.progress === 100).length} of your courses. Keep up the high standard!
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/student/courses">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-white/95 font-semibold shadow-md" id="continue-learning-btn">
                <Play className="h-4 w-4 mr-2 fill-current" />
                Continue Learning
              </Button>
            </Link>
            <Link to="/student/assignments">
              <Button size="lg" variant="outline" className="text-white border-white/30 bg-white/10 hover:bg-white/25 hover:border-white/50" id="view-assignments-btn">
                View Assignments
              </Button>
            </Link>
          </div>
        </div>
        {/* Dynamic Glowing background Orbs */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -right-5 -top-5 w-36 h-36 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
      </motion.div>

      {/* Analytics Statistics Metrics */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="student-stats-grid">
        <StatCard
          title="Enrolled Courses"
          value={stats.enrolledCourses}
          change="+1 this month"
          changeType="positive"
          icon={BookOpen}
          trend={stats.enrolledCourses > 0 ? Math.min(stats.enrolledCourses * 10, 100) : 0}
          id="stat-courses"
        />
        <StatCard
          title="Overall Learning Progress"
          value={`${stats.learningProgress}%`}
          change={stats.learningProgress > 50 ? "+5% improvement" : "Underway"}
          changeType="positive"
          icon={TrendingUp}
          trend={stats.learningProgress}
          id="stat-progress"
        />
        <StatCard
          title="Average Quiz Score"
          value={`${stats.quizAccuracy}%`}
          change="+3% vs last week"
          changeType="positive"
          icon={Trophy}
          id="stat-quizzes"
        />
        <div className="rounded-xl border bg-card p-6 shadow-card hover:shadow-elevated transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-card to-amber-600/5 border-amber-500/20">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">LMS Leaderboard</p>
              <p className="text-3xl font-extrabold tracking-tight text-amber-700 dark:text-amber-300">
                #{stats.leaderboardRank}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3 text-amber-500 fill-current" />
                <span>Top 15% overall</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Award className="h-6 w-6" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Double Dynamic Recharts layout */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="student-charts-section">
        {/* Weekly Study Hours Area Chart */}
        <Card className="lg:col-span-2 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-500" />
              Weekly Study Commitment (Hours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData.weeklyStudy}>
                  <defs>
                    <linearGradient id="studyHoursGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                  <XAxis dataKey="month" className="text-xs text-muted-foreground font-medium" />
                  <YAxis className="text-xs text-muted-foreground font-medium" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#studyHoursGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Accuracy Line Chart */}
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Quiz Performance Trend (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData.scoreTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                  <XAxis dataKey="name" className="text-xs text-muted-foreground font-medium text-ellipsis overflow-hidden" />
                  <YAxis domain={[0, 100]} className="text-xs text-muted-foreground font-medium" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ stroke: "#f59e0b", strokeWidth: 2, r: 4, fill: "#fff" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Continue Learning Grid */}
      <motion.div variants={item} id="student-continue-learning-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-500" /> Continue Learning
          </h2>
          <Link to="/student/courses" className="text-sm text-indigo-600 font-semibold hover:underline flex items-center gap-1">
            Browse Curriculum <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {courses.length === 0 ? (
          <Card className="p-8 text-center border-dashed border-2 border-muted">
            <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground/60" />
            <h3 className="text-base font-bold mb-1">No Active Enrollments</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
              You are not currently enrolled in active syllabus paths. Please ask your teacher to assign you access.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                variants={item}
                className="group cursor-pointer"
              >
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-card border hover:border-indigo-500/30 flex flex-col h-full">
                  <div className="relative h-40 overflow-hidden bg-base-300">
                    <img
                      src={getImageUrl(course.thumbnail)}
                      onError={handleImageError}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute top-3 right-3 bg-white/95 text-foreground hover:bg-white border-0 shadow-sm font-semibold">
                      {course.progress}% Complete
                    </Badge>
                  </div>
                  <CardContent className="p-4 flex flex-col justify-between flex-1">
                    <div className="space-y-1 mb-4">
                      <h3 className="font-semibold line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Instructor: {course.instructor}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <ProgressBar value={course.progress} size="sm" showLabel />
                      <Link to={`/student/courses/${course.id}`} className="block">
                        <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" size="sm">
                          <Play className="h-3.5 w-3.5 fill-current" />
                          Resume Study
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Deadlines Section */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="student-deadlines-section">
        {/* Assignments List */}
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-5 w-5 text-indigo-500" />
              Outstanding Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.upcomingAssignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <p className="text-sm font-semibold text-foreground">All Submissions Completed!</p>
                <p className="text-xs">No pending assignments to grade or upload.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.upcomingAssignments.map((assignment) => (
                  <div
                    key={assignment._id}
                    className="flex items-center justify-between p-3.5 rounded-xl border bg-card/50 hover:bg-muted/30 transition-all border-l-4 border-l-indigo-500"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-sm line-clamp-1">{assignment.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{assignment.course}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-semibold text-indigo-600">Due {assignment.dueDate}</p>
                        <Badge variant="warning" className="text-[10px] py-0.5">Pending</Badge>
                      </div>
                      <Link to="/student/assignments">
                        <Button size="sm" variant="ghost" className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-600 hover:text-indigo-700">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quizzes List */}
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Assigned Unattempted Quizzes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.upcomingQuizzes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                <p className="text-sm font-semibold text-foreground">Quizzes Fully Answered!</p>
                <p className="text-xs">No outstanding examinations pending attempts.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.upcomingQuizzes.map((quiz) => (
                  <div
                    key={quiz._id}
                    className="flex items-center justify-between p-3.5 rounded-xl border bg-card/50 hover:bg-muted/30 transition-all border-l-4 border-l-amber-500"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-sm line-clamp-1">{quiz.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{quiz.course}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-semibold text-amber-600">{quiz.duration} Mins Limit</p>
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-0 text-[10px] py-0.5">Attempt</Badge>
                      </div>
                      <Link to={`/student/courses/${quiz._id}`}>
                        <Button size="sm" variant="ghost" className="p-2 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-600 hover:text-amber-700">
                          <Play className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}