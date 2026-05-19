import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  Play,
  CheckCircle2,
  CalendarDays,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { StatCard } from "../../components/ui/StatCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const weeklyActivity = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 1.8 },
  { day: "Wed", hours: 3.2 },
  { day: "Thu", hours: 2.0 },
  { day: "Fri", hours: 4.1 },
  { day: "Sat", hours: 3.5 },
  { day: "Sun", hours: 2.8 },
];

const courseProgress = [
  { name: "Completed", value: 65, color: "#10b981" },
  { name: "In Progress", value: 25, color: "#3b82f6" },
  { name: "Not Started", value: 10, color: "#e5e7eb" },
];

const upcomingAssignments = [
  {
    title: "Mathematics Homework",
    course: "Advanced Calculus",
    dueDate: "Tomorrow",
    status: "Pending",
  },
  {
    title: "Physics Lab Report",
    course: "Classical Mechanics",
    dueDate: "In 2 days",
    status: "In Progress",
  },
  {
    title: "Essay Submission",
    course: "English Literature",
    dueDate: "In 4 days",
    status: "Pending",
  },
];

const recentCourses = [
  {
    title: "Advanced JavaScript",
    instructor: "Dr. James Wilson",
    progress: 75,
    totalLessons: 24,
    completedLessons: 18,
    thumbnail: "https://images.unsplash.com/photo-1627392662291-4c2ac9c424e9?w=300",
  },
  {
    title: "Python for Data Science",
    instructor: "Prof. Emily Chen",
    progress: 45,
    totalLessons: 32,
    completedLessons: 14,
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0c9359?w=300",
  },
  {
    title: "UI/UX Design Fundamentals",
    instructor: "Sarah Johnson",
    progress: 20,
    totalLessons: 18,
    completedLessons: 4,
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300",
  },
];

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
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Welcome Section */}
      <motion.div
        variants={item}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-8"
      >
        <div className="relative z-10">
          <Badge variant="secondary" className="mb-4 bg-white/20 text-white border-0">
            Welcome Back!
          </Badge>
          <h1 className="text-3xl font-bold text-white mb-2">
            Hello, Sarah! Ready to learn?
          </h1>
          <p className="text-white/80 max-w-xl mb-6">
            You've completed 3 courses this month. Keep up the great work and
            continue your learning journey!
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-primary rounded-lg font-medium hover:bg-white/90 transition-colors">
              <Play className="h-4 w-4" />
              Continue Learning
            </button>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors">
              View Courses
            </button>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -right-5 -top-5 w-32 h-32 bg-white/5 rounded-full" />
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Courses"
          value="12"
          change="+2 this month"
          changeType="positive"
          icon={BookOpen}
          trend={75}
        />
        <StatCard
          title="Hours Learned"
          value="48.5"
          change="+12.5 this week"
          changeType="positive"
          icon={Clock}
          trend={60}
        />
        <StatCard
          title="Quiz Score Avg"
          value="87%"
          change="+5% improvement"
          changeType="positive"
          icon={Trophy}
        />
        <StatCard
          title="Completion Rate"
          value="73%"
          change="-2% from last month"
          changeType="negative"
          icon={TrendingUp}
        />
      </motion.div>

      {/* Charts Section */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Learning Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyActivity}>
                  <defs>
                    <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
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
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#activityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Course Progress Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Course Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseProgress}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {courseProgress.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {courseProgress.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Ongoing Courses */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Continue Learning</h2>
          <button className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentCourses.map((course, index) => (
            <motion.div
              key={course.title}
              variants={item}
              className="group cursor-pointer"
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className="absolute top-3 right-3 bg-white/90 text-foreground">
                    {course.progress}% Complete
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {course.instructor}
                  </p>
                  <ProgressBar value={course.progress} size="sm" showLabel />
                  <p className="text-xs text-muted-foreground mt-2">
                    {course.completedLessons}/{course.totalLessons} lessons
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Upcoming Deadlines */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAssignments.map((assignment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        assignment.status === "Pending"
                          ? "bg-amber-500/10"
                          : "bg-blue-500/10"
                      }`}
                    >
                      {assignment.status === "Pending" ? (
                        <Clock className="h-4 w-4 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{assignment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {assignment.course}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{assignment.dueDate}</p>
                    <Badge
                      variant={
                        assignment.status === "Pending" ? "warning" : "default"
                      }
                    >
                      {assignment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}