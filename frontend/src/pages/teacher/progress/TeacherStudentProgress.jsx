import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Award, Clock, GraduationCap, Percent, BookOpen, TrendingUp, Sparkles, Activity
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { ProgressBar } from "../../../components/ui/ProgressBar";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/Avatar";
import { useSocket } from "../../../context/SocketContext";
import { getLiveProgress } from "../../../services/teacherService";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, Legend
} from "recharts";
import toast from "react-hot-toast";

const initialOverviewTrend = [
  { day: "Mon", progress: 68, engagement: 210 },
  { day: "Tue", progress: 72, engagement: 245 },
  { day: "Wed", progress: 75, engagement: 310 },
  { day: "Thu", progress: 74, engagement: 290 },
  { day: "Fri", progress: 79, engagement: 340 },
  { day: "Sat", progress: 84, engagement: 390 },
  { day: "Sun", progress: 88, engagement: 420 },
];

const initialCourseCompletion = [
  { course: "JavaScript Advanced", rate: 85 },
  { course: "Python Fundamentals", rate: 70 },
  { course: "UI/UX Mobile Design", rate: 90 },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

export default function TeacherStudentProgress() {
  const [stats, setStats] = useState({
    activeLearners: 0,
    avgProgressRate: 0,
    certificationsEarned: 0,
    completedCourses: 0,
  });
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const { socket } = useSocket();

  const loadProgressTelemetry = async () => {
    try {
      setLoading(true);
      const res = await getLiveProgress();
      if (res && res.success) {
        const { activeLearners, avgProgressRate, certificationsEarned, completedCourses, studentsList } = res.data;
        setStats({ activeLearners, avgProgressRate, certificationsEarned, completedCourses });
        setStudents(studentsList || []);
      }
    } catch (err) {
      console.error("Error loading progress telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgressTelemetry();
  }, []);

  // Socket Live Synchronizer
  useEffect(() => {
    if (!socket) return;

    const handleProgressUpdated = (data) => {
      // Instantly update stats / progress lists
      toast.success(`Live sync: ${data.studentName || "A student"} completed a lesson!`, {
        icon: "⚡",
        style: {
          borderRadius: "0.75rem",
          background: "hsl(var(--card))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))"
        }
      });
      loadProgressTelemetry();
    };

    const handleQuizSubmitted = (data) => {
      toast.success(`Live sync: Quiz completed by ${data.studentName || "learner"}!`, {
        icon: "🎯"
      });
      loadProgressTelemetry();
    };

    socket.on("progressUpdated", handleProgressUpdated);
    socket.on("topicCompleted", handleProgressUpdated);
    socket.on("quizSubmitted", handleQuizSubmitted);

    return () => {
      socket.off("progressUpdated", handleProgressUpdated);
      socket.off("topicCompleted", handleProgressUpdated);
      socket.off("quizSubmitted", handleQuizSubmitted);
    };
  }, [socket]);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
      id="teacher-student-progress-container"
    >
      {/* Header Panel */}
      <motion.div variants={item} className="flex items-center justify-between border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Real-Time Progress Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor real-time syllabus learning rates, completed topics counts, and active daily presence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-muted-foreground">Sockets Live</span>
        </div>
      </motion.div>

      {/* Loading Skeletons */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse border-border">
              <CardContent className="h-24 bg-muted/20" />
            </Card>
          ))}
        </div>
      ) : (
        /* Stats Cards */
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Learners", value: stats.activeLearners, icon: GraduationCap, color: "blue" },
            { label: "Avg. Progress Rate", value: `${stats.avgProgressRate}%`, icon: Percent, color: "emerald" },
            { label: "Certifications", value: stats.certificationsEarned, icon: Award, color: "indigo" },
            { label: "Completed Courses", value: stats.completedCourses, icon: BookOpen, color: "amber" },
          ].map((stat, i) => (
            <Card key={i} className="border-border hover:shadow-md transition-all bg-card">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 bg-${stat.color}-500/10 text-${stat.color}-500 rounded-xl`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Analytics Charts */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Line Chart */}
        <Card className="lg:col-span-2 border-border hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" /> Syllabus Progress Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={initialOverviewTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                  <XAxis dataKey="day" className="text-xs text-muted-foreground font-semibold" />
                  <YAxis className="text-xs text-muted-foreground font-semibold" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                  <Line type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={2.5} name="Avg. Completion Rate" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Student Engagement Area Chart */}
        <Card className="border-border hover:shadow-md transition-all bg-card">
          <CardHeader>
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" /> Learning Growth & Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={initialOverviewTrend}>
                  <defs>
                    <linearGradient id="engagementGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                  <XAxis dataKey="day" className="text-xs text-muted-foreground font-semibold" />
                  <YAxis className="text-xs text-muted-foreground font-semibold" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                  <Area type="monotone" dataKey="engagement" stroke="#10b981" fill="url(#engagementGrad)" strokeWidth={2} name="Weekly Active Minutes" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Toolbar */}
      <motion.div variants={item} className="flex justify-between items-center gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 h-10 border-border bg-card text-foreground"
            placeholder="Search student progress..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Progress Cards List */}
      <motion.div variants={item} className="grid grid-cols-1 gap-4">
        {filteredStudents.map(student => (
          <Card key={student.id} className="border-border shadow-sm hover:shadow-md transition-all bg-card">
            <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-[240px]">
                <Avatar className="w-12 h-12 border border-border">
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
                    {student.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h4 className="font-bold text-foreground text-sm truncate">{student.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                </div>
              </div>

              {/* Course Enrolled Counts */}
              <div className="shrink-0 flex items-center gap-2">
                <Badge variant="secondary" className="font-semibold text-xs border-0 px-3 py-0.5">
                  {student.coursesCount} Enrolled Courses
                </Badge>
              </div>

              {/* Progress Bar Widget */}
              <div className="flex-1 max-w-md w-full">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-muted-foreground">Completion Progress</span>
                  <span className="text-blue-500 font-bold">{student.avgProgress}%</span>
                </div>
                <ProgressBar value={student.avgProgress} size="md" className="bg-blue-500/10" />
              </div>

              {/* Last Activity */}
              <div className="text-right shrink-0">
                <span className="text-xs text-muted-foreground flex items-center justify-end gap-1 select-none font-medium">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Active {student.lastActive}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </motion.div>
  );
}
