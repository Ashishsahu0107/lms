import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import {
  getTeacherStats,
  getTeacherAnalytics,
} from "../../../services/dashboardService";
import {
  Users,
  BookOpen,
  ClipboardList,
  PlusCircle,
  FileSpreadsheet,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Award,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { StatCard } from "../../../components/ui/StatCard";
import { Button } from "../../../components/ui/Button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    pendingReviews: 0,
    averageRating: 4.8,
    recentSubmissions: [],
  });
  const [analytics, setAnalytics] = useState({
    averageProgress: 75,
    courseEnrollment: [],
    quizAccuracy: 82,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTeacherData() {
      try {
        setLoading(true);
        const [statsRes, analyticsRes] = await Promise.all([
          getTeacherStats(),
          getTeacherAnalytics(),
        ]);

        if (statsRes.data?.success) {
          setStats(statsRes.data.data);
        }
        if (analyticsRes.data?.success) {
          setAnalytics(analyticsRes.data.data);
        }
      } catch (err) {
        console.error("Failed to load teacher dashboard details:", err);
        setError("Unable to sync instructor portal data with LMS server.");
      } finally {
        setLoading(false);
      }
    }

    loadTeacherData();
  }, []);

  if (loading) {
    return (
      <div
        className="flex flex-col justify-center items-center py-32 space-y-4"
        id="teacher-dashboard-loading"
      >
        <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          Syncing course analytics and submissions...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
      id="teacher-dashboard-root"
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
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 p-8 shadow-lg shadow-teal-600/10"
        id="teacher-welcome-banner"
      >
        <div className="relative z-10">
          <Badge
            variant="secondary"
            className="mb-4 bg-white/20 text-white border-0 hover:bg-white/30 backdrop-blur-md"
          >
            <Sparkles className="h-3 w-3 mr-1.5 fill-current" /> Instructor
            Command Center
          </Badge>
          <h1
            className="text-3xl font-bold text-white mb-2"
            id="teacher-welcome-title"
          >
            Welcome back, {user?.name || "Educator"}!
          </h1>
          <p className="text-white/80 max-w-xl">
            You are teaching {stats.totalCourses} active courses. Your class
            average progress rate is {analytics.averageProgress}% completed.
            Keep setting high marks!
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -right-5 -top-5 w-36 h-36 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        id="teacher-stats-grid"
      >
        <StatCard
          title="Taught Courses"
          value={stats.totalCourses}
          change="+1 new course"
          changeType="positive"
          icon={BookOpen}
          trend={
            stats.totalCourses > 0 ? Math.min(stats.totalCourses * 15, 100) : 0
          }
          id="stat-courses-taught"
        />
        <StatCard
          title="Active Students"
          value={stats.totalStudents}
          change="+12 this month"
          changeType="positive"
          icon={Users}
          trend={Math.min(stats.totalStudents * 2, 100)}
          id="stat-active-students"
        />
        <div className="rounded-xl border bg-card p-6 shadow-card hover:shadow-elevated transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-card to-amber-600/5 border-amber-500/20">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                Review Queue
              </p>
              <p className="text-3xl font-extrabold tracking-tight text-amber-700 dark:text-amber-300">
                {stats.pendingReviews}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ClipboardList className="h-3 w-3 text-amber-500" />
                <span>Pending assignments</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <ClipboardList className="h-6 w-6" />
            </div>
          </div>
        </div>
        <StatCard
          title="Class Quiz Average"
          value={`${analytics.quizAccuracy}%`}
          change="+2.4% vs last term"
          changeType="positive"
          icon={Award}
          id="stat-quiz-accuracy"
        />
      </motion.div>

      {/* Quick Action Drawer */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        id="teacher-quick-actions"
      >
        <Link to="/teacher/courses" className="block">
          <Button className="w-full h-16 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm border-0 flex items-center justify-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Create Course Syllabus
          </Button>
        </Link>
        <Link to="/teacher/assignments" className="block">
          <Button className="w-full h-16 text-base font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm border-0 flex items-center justify-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Post Homework Assignment
          </Button>
        </Link>
        <Link to="/teacher/quizzes" className="block">
          <Button className="w-full h-16 text-base font-semibold bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-sm border-0 flex items-center justify-center gap-2">
            <Award className="h-5 w-5" />
            Publish Quiz Examination
          </Button>
        </Link>
      </motion.div>

      {/* Analytics Panel charts */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 gap-6"
        id="teacher-charts-section"
      >
        {/* Enrollments Bar Chart */}
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-500" />
              Enrollments Distribution by Course
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.courseEnrollment.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                No students enrolled in courses yet.
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.courseEnrollment} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted/30"
                    />
                    <XAxis
                      type="number"
                      className="text-xs text-muted-foreground font-medium"
                    />
                    <YAxis
                      dataKey="course"
                      type="category"
                      className="text-xs text-muted-foreground font-medium"
                      width={90}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.75rem",
                      }}
                    />
                    <Bar
                      dataKey="students"
                      fill="#0d9488"
                      radius={[0, 6, 6, 0]}
                      barSize={16}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Submissions auditing */}
      <motion.div variants={item} id="teacher-submissions-section">
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
              Recent Homework Submissions Audit
            </CardTitle>
            <Link to="/teacher/assignments">
              <Button
                size="sm"
                variant="outline"
                className="text-xs font-semibold"
              >
                Manage Submissions <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.recentSubmissions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-10 w-10 text-emerald-500/70 mx-auto mb-3" />
                <p className="font-semibold text-foreground">
                  No recent submissions found
                </p>
                <p className="text-xs mt-1">
                  Students have not posted assignments for your classes
                  recently.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-muted text-xs text-muted-foreground font-semibold uppercase">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Assignment Topic</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentSubmissions.map((sub) => (
                      <tr
                        key={sub._id}
                        className="border-b border-muted/50 hover:bg-muted/10 transition-colors text-sm"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground">
                            {sub.studentName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {sub.studentEmail}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-muted-foreground line-clamp-1">
                            {sub.assignmentTitle}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {new Date(sub.submittedAt).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant={
                              sub.status === "graded" ? "success" : "warning"
                            }
                            className="capitalize text-[10px] border-0"
                          >
                            {sub.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link to="/teacher/assignments">
                            <Button
                              size="xs"
                              variant="outline"
                              className="text-xs h-7 px-2.5"
                            >
                              Review
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
