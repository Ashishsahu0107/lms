import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getAdminStats,
  getAdminAnalytics,
} from "../../../services/dashboardService";
import {
  Users,
  BookOpen,
  AlertCircle,
  DollarSign,
  UserPlus,
  Loader2,
  Shield,
  Activity,
  Award,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { StatCard } from "../../../components/ui/StatCard";
import {
  AreaChart,
  Area,
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
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    activeUsers: 0,
    recentSignups: [],
    mostEnrolledCourses: [],
    topTeachers: [],
  });
  const [analytics, setAnalytics] = useState({
    userGrowth: [],
    revenueGrowth: [],
    courseEnrollment: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true);
        const [statsRes, analyticsRes] = await Promise.all([
          getAdminStats(),
          getAdminAnalytics(),
        ]);

        if (statsRes.data?.success) {
          setStats(statsRes.data.data);
        }
        if (analyticsRes.data?.success) {
          setAnalytics(analyticsRes.data.data);
        }
      } catch (err) {
        console.error("Failed to load admin dashboard statistics:", err);
        setError(
          "Unable to sync global system statistics with the LMS backend.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, []);

  if (loading) {
    return (
      <div
        className="flex flex-col justify-center items-center py-32 space-y-4"
        id="admin-dashboard-loading"
      >
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">
          Syncing platform metrics and telemetry logs...
        </p>
      </div>
    );
  }

  // Define top course
  const topCourse = stats.mostEnrolledCourses[0];

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
      id="admin-dashboard-root"
    >
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl p-4 flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Page Header */}
      <motion.div variants={item}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" /> Super Admin Cockpit
            </h1>
            <p className="text-muted-foreground">
              Global platform telemetry and curriculum deployment logs
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/students">
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" /> Manage Students
              </Button>
            </Link>
            <Link to="/admin/courses">
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0">
                <BookOpen className="h-4 w-4" /> Course Archives
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Analytics Statistics Grid */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
        id="admin-stats-grid"
      >
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change="+12% enrollment fees"
          changeType="positive"
          icon={DollarSign}
          trend={75}
          id="stat-revenue"
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          change="+8.2% this month"
          changeType="positive"
          icon={Users}
          trend={85}
          id="stat-students"
        />
        <StatCard
          title="Total Teachers"
          value={stats.totalTeachers}
          change="+2 new this week"
          changeType="positive"
          icon={UserPlus}
          id="stat-teachers"
        />
        <StatCard
          title="Active Courses"
          value={stats.totalCourses}
          change="+6 this term"
          changeType="positive"
          icon={BookOpen}
          id="stat-courses"
        />
        <StatCard
          title="Telemetry Users"
          value={stats.activeUsers}
          change="Real-time count"
          changeType="positive"
          icon={Activity}
          id="stat-telemetry"
        />
        <div className="rounded-xl border bg-card p-6 shadow-card hover:shadow-elevated transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-card to-amber-600/5 border-amber-500/20">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                Best Seller
              </p>
              <p className="text-sm font-extrabold tracking-tight text-amber-700 dark:text-amber-300 line-clamp-1">
                {topCourse ? topCourse.title : "None yet"}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Sparkles className="h-3 w-3 text-amber-500 fill-current" />
                <span>
                  {topCourse
                    ? `${topCourse.studentsCount} enrolls`
                    : "No classes yet"}
                </span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Award className="h-6 w-6" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Double Analytics Panel charts */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        id="admin-charts-section"
      >
        {/* Revenue Analytics Curve Area Chart */}
        <Card className="lg:col-span-2 hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              Monthly Platform Billing Growth ($)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.revenueGrowth}>
                  <defs>
                    <linearGradient
                      id="revenueGrowthGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted/30"
                  />
                  <XAxis
                    dataKey="month"
                    className="text-xs text-muted-foreground font-medium"
                  />
                  <YAxis
                    className="text-xs text-muted-foreground font-medium"
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                    }}
                    formatter={(val) => [`$${val.toLocaleString()}`, "Billing"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#revenueGrowthGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Signups Growth Bar Chart */}
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-emerald-500" />
              User Registrations Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.userGrowth}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted/30"
                  />
                  <XAxis
                    dataKey="month"
                    className="text-xs text-muted-foreground font-medium"
                  />
                  <YAxis className="text-xs text-muted-foreground font-medium" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                    }}
                  />
                  <Bar
                    dataKey="users"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Platform Audits & Rankings section */}
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        id="admin-auditing-tables"
      >
        {/* Most Enrolled Courses */}
        <motion.div variants={item}>
          <Card className="hover:shadow-md transition-all h-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-500" />
                Top Performing Courses
              </CardTitle>
              <Link
                to="/admin/courses"
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                View All
              </Link>
            </CardHeader>
            <CardContent>
              {stats.mostEnrolledCourses.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-xs">
                  No courses enrolled yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.mostEnrolledCourses.map((course, idx) => (
                    <div
                      key={course._id}
                      className="flex items-center justify-between border-b border-muted/30 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm line-clamp-1 text-foreground">
                          {course.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Instructor: {course.instructor}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-0 text-xs font-semibold">
                          {course.studentsCount} Students
                        </Badge>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          ${course.price} Fee
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Teachers */}
        <motion.div variants={item}>
          <Card className="hover:shadow-md transition-all h-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                Educator Class Rankings
              </CardTitle>
              <Link
                to="/admin/teachers"
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                View All
              </Link>
            </CardHeader>
            <CardContent>
              {stats.topTeachers.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-xs">
                  No active instructors registered.
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.topTeachers.map((teacher, idx) => (
                    <div
                      key={teacher._id}
                      className="flex items-center justify-between border-b border-muted/30 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm line-clamp-1 text-foreground">
                          {teacher.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {teacher.email}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border-0 text-xs font-semibold">
                          {teacher.studentsCount} Students
                        </Badge>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          Rank #{idx + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Audit Feed: Recent Registrations */}
        <motion.div variants={item}>
          <Card className="hover:shadow-md transition-all h-full">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-emerald-500" />
                Audit Log: Registrations
              </CardTitle>
              <Badge
                variant="secondary"
                className="text-[10px] uppercase font-semibold"
              >
                Live Feed
              </Badge>
            </CardHeader>
            <CardContent>
              {stats.recentSignups.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-xs">
                  No recent signups found.
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentSignups.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between border-b border-muted/30 pb-3 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm line-clamp-1 text-foreground">
                          {user.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border-0 text-[10px] font-semibold capitalize">
                          Student
                        </Badge>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(user.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" },
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
