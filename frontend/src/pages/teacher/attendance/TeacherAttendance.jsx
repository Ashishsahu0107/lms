import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon, Check, X, Search, CheckCircle, AlertTriangle, Users, BarChart3, PieChart as PieIcon, Activity
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/Avatar";
import { getTeacherCourses, getLiveAttendance, markLiveAttendance, getLiveAttendanceStats } from "../../../services/teacherService";
import { useSocket } from "../../../context/SocketContext";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts";
import toast from "react-hot-toast";

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

export default function TeacherAttendance() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const { socket } = useSocket();

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const courseRes = await getTeacherCourses();
      if (courseRes && courseRes.success && courseRes.data?.length > 0) {
        setCourses(courseRes.data);
        setSelectedCourse(courseRes.data[0]._id);
      } else {
        setCourses([]);
        setSelectedCourse("");
      }
    } catch (err) {
      console.error("Error loading teacher courses:", err);
      toast.error("Failed to load courses.");
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceStats = async () => {
    try {
      const statsRes = await getLiveAttendanceStats();
      if (statsRes && statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadAttendanceList = async () => {
    if (!selectedCourse) {
      setStudents([]);
      return;
    }
    try {
      setLoading(true);
      const res = await getLiveAttendance(selectedCourse, date);
      if (res && res.success) {
        setStudents(res.data || []);
      }
    } catch (err) {
      console.error("Error loading daily attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
    loadAttendanceStats();
  }, []);

  useEffect(() => {
    loadAttendanceList();
  }, [selectedCourse, date]);

  // Sockets Listener
  useEffect(() => {
    if (!socket) return;

    const handleAttendanceUpdated = (data) => {
      if (data.courseId === selectedCourse && data.date === date) {
        loadAttendanceList();
      }
      loadAttendanceStats();
    };

    socket.on("attendanceUpdated", handleAttendanceUpdated);
    return () => {
      socket.off("attendanceUpdated", handleAttendanceUpdated);
    };
  }, [socket, selectedCourse, date]);

  const handleToggleAttendance = (id, isPresent) => {
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, attendance: isPresent } : s))
    );
  };

  const handleSaveAttendance = async () => {
    try {
      const res = await markLiveAttendance({
        courseId: selectedCourse,
        date,
        students,
      });
      if (res && res.success) {
        toast.success("Attendance register saved successfully!");
        loadAttendanceStats();
        // Emit live sync update
        if (socket) {
          socket.emit("attendanceUpdated", { courseId: selectedCourse, date, students });
        }
      }
    } catch (err) {
      toast.error(err?.message || "Failed to mark attendance.");
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = students.filter(s => s.attendance).length;
  const absentCount = students.length - presentCount;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
      id="teacher-attendance-module-container"
    >
      {/* Header Panel */}
      <motion.div variants={item} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Live Attendance Register
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Log student daily attendance, monitor presence rates, and audit real-time class lists.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSaveAttendance}
            disabled={courses.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600 text-white font-semibold shadow-sm"
            id="save-attendance-btn"
          >
            <Check className="h-4 w-4" /> Save Marked Roll Call
          </Button>
        </div>
      </motion.div>

      {!loading && courses.length === 0 ? (
        <motion.div
          variants={item}
          className="flex flex-col items-center justify-center p-8 sm:p-12 md:p-16 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-md text-center max-w-2xl mx-auto shadow-xl"
        >
          <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-full mb-6">
            <AlertTriangle className="h-12 w-12 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">No Courses Created or Assigned</h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md mb-8">
            You do not currently have any active courses created or assigned to your profile. Please navigate to Course Management to set up your first course and begin marking daily attendance.
          </p>
          <Button
            onClick={() => window.location.href = "/teacher/courses"}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-md transition-all"
          >
            Go to Course Management
          </Button>
        </motion.div>
      ) : (
        <>
          {/* Stats Cards */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border shadow-sm bg-card hover:shadow-md transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><Users className="h-6 w-6" /></div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{students.length} Registered</h3>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Enrolled Learners</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm bg-card hover:shadow-md transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><CheckCircle className="h-6 w-6" /></div>
                <div>
                  <h3 className="text-2xl font-bold text-emerald-500">{presentCount} Present</h3>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Checked Present Today</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border shadow-sm bg-card hover:shadow-md transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-red-500/10 text-red-500 rounded-xl"><AlertTriangle className="h-6 w-6" /></div>
                <div>
                  <h3 className="text-2xl font-bold text-red-500">{absentCount} Absent</h3>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Absent / Unmarked Today</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Toolbar filters */}
          <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card border border-border p-4 rounded-xl items-center shadow-sm">
            <div>
              <label className="text-xs font-semibold mb-1.5 block text-muted-foreground uppercase tracking-wider">Target Course</label>
              <select
                className="w-full h-10 rounded-lg border border-border bg-card text-foreground px-3 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block text-muted-foreground uppercase tracking-wider">Date Selection</label>
              <Input
                type="date"
                className="border-border bg-card text-foreground h-10 text-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block text-muted-foreground uppercase tracking-wider">Filter Students</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 h-10 border-border bg-card text-foreground text-sm"
                  placeholder="Search student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </motion.div>

          {/* Charts Row */}
          {stats && (
            <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Weekly attendance trend */}
              <Card className="lg:col-span-2 border-border hover:shadow-md transition-all">
                <CardHeader>
                  <CardTitle className="text-base text-foreground flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-500" /> Weekly Presence Rates (%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.weeklyTrend}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                        <XAxis dataKey="week" className="text-xs text-muted-foreground font-semibold" />
                        <YAxis className="text-xs text-muted-foreground font-semibold" />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                        <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} name="Presence Rate (%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Student attendance pie chart */}
              <Card className="border-border hover:shadow-md transition-all bg-card">
                <CardHeader>
                  <CardTitle className="text-base text-foreground flex items-center gap-2">
                    <PieIcon className="h-5 w-5 text-teal-500" /> Today's Division Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.distribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {stats.distribution.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Attendance Register Grid */}
          <motion.div variants={item}>
            <Card className="border-border shadow-md overflow-hidden bg-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="px-5 py-4 text-xs font-semibold text-muted-foreground">Student ID</th>
                      <th className="px-5 py-4 text-xs font-semibold text-muted-foreground">Name</th>
                      <th className="px-5 py-4 text-xs font-semibold text-muted-foreground">Email Address</th>
                      <th className="px-5 py-4 text-xs font-semibold text-muted-foreground">Presence Status</th>
                      <th className="px-5 py-4 text-xs font-semibold text-muted-foreground text-right">Mark Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-muted-foreground font-semibold text-sm">
                          Loading roll call details...
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-muted-foreground font-semibold text-sm">
                          No student records match selected parameters.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-primary/5 transition-colors">
                          <td className="px-5 py-4 text-sm font-semibold text-primary">{student.id.substring(0, 8)}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8 border border-border">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{student.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-bold text-foreground text-sm">{student.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-muted-foreground">{student.email}</td>
                          <td className="px-5 py-4 text-sm">
                            <Badge
                              className={`font-semibold uppercase tracking-wider text-[9px] ${
                                student.attendance ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                              }`}
                            >
                              {student.attendance ? "Present" : "Absent"}
                            </Badge>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                className={`rounded-xl px-3 py-1 flex items-center gap-1.5 h-8 text-xs font-semibold ${student.attendance ? "bg-emerald-600 text-white hover:bg-emerald-700" : "border border-emerald-600/30 text-emerald-500 hover:bg-emerald-500/10 bg-transparent"}`}
                                onClick={() => handleToggleAttendance(student.id, true)}
                              >
                                <Check className="h-3.5 w-3.5" /> Present
                              </Button>
                              <Button
                                size="sm"
                                className={`rounded-xl px-3 py-1 flex items-center gap-1.5 h-8 text-xs font-semibold ${!student.attendance ? "bg-red-500 text-white hover:bg-red-600" : "border border-red-500/30 text-red-500 hover:bg-red-500/10 bg-transparent"}`}
                                onClick={() => handleToggleAttendance(student.id, false)}
                              >
                                <X className="h-3.5 w-3.5" /> Absent
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
