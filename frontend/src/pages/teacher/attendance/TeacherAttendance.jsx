import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, X, Search, CheckCircle, AlertTriangle, Users, BarChart3,
  PieChart as PieIcon, BookOpen, RefreshCw, ClipboardList, TrendingUp, Save
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { Avatar, AvatarFallback } from "../../../components/ui/Avatar";
import {
  getTeacherCourses,
  getLiveAttendance,
  markLiveAttendance,
  getLiveAttendanceStats,
} from "../../../services/teacherService";
import { useSocket } from "../../../context/SocketContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import toast from "react-hot-toast";

// ─── Animation Variants ───────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-muted/50 rounded-md w-full" />
        </td>
      ))}
    </tr>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, colorClass, bgClass }) {
  return (
    <Card className="border-border shadow-sm bg-card hover:shadow-md transition-all duration-200">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`p-3 ${bgClass} ${colorClass} rounded-xl flex-shrink-0`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className={`text-2xl font-bold ${colorClass}`}>{value}</h3>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TeacherAttendance() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [dirty, setDirty] = useState(false); // tracks unsaved changes

  const { socket } = useSocket();

  // ── Load Teacher Courses ───────────────────────────────────────────────────
  const loadCourses = useCallback(async () => {
    try {
      setCoursesLoading(true);
      const res = await getTeacherCourses();
      // axios response: res.data = API body { success, data }
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setCourses(res.data.data);
        setSelectedCourse((prev) => prev || res.data.data[0]._id);
      } else {
        setCourses([]);
        setSelectedCourse("");
      }
    } catch (err) {
      console.error("loadCourses error:", err);
      toast.error("Failed to load your courses.");
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  // ── Load Attendance Stats ──────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    try {
      const res = await getLiveAttendanceStats();
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("loadStats error:", err);
    }
  }, []);

  // ── Load Students for Selected Course + Date ───────────────────────────────
  const loadStudents = useCallback(async (courseId, selectedDate) => {
    if (!courseId) {
      setStudents([]);
      return;
    }
    try {
      setStudentsLoading(true);
      setDirty(false);
      const res = await getLiveAttendance(courseId, selectedDate);
      if (res.data?.success) {
        setStudents(res.data.data || []);
      } else {
        setStudents([]);
        toast.error(res.data?.message || "Failed to load students.");
      }
    } catch (err) {
      console.error("loadStudents error:", err);
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    loadCourses();
    loadStats();
  }, [loadCourses, loadStats]);

  useEffect(() => {
    if (selectedCourse) {
      loadStudents(selectedCourse, date);
    }
  }, [selectedCourse, date, loadStudents]);

  // ── Socket: live attendance sync from other devices ────────────────────────
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = (data) => {
      if (data.courseId === selectedCourse) {
        loadStudents(selectedCourse, date);
        loadStats();
      }
    };
    socket.on("attendanceUpdated", handleUpdate);
    return () => socket.off("attendanceUpdated", handleUpdate);
  }, [socket, selectedCourse, date, loadStudents, loadStats]);

  // ── Toggle Individual Student ──────────────────────────────────────────────
  const handleToggle = (id, isPresent) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, attendance: isPresent } : s))
    );
    setDirty(true);
  };

  // ── Mark All Present / All Absent ─────────────────────────────────────────
  const handleMarkAll = (present) => {
    setStudents((prev) => prev.map((s) => ({ ...s, attendance: present })));
    setDirty(true);
  };

  // ── Save Attendance ────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedCourse) return toast.error("Please select a course first.");
    if (students.length === 0) return toast.error("No students to save.");

    try {
      setSaving(true);
      const res = await markLiveAttendance({ courseId: selectedCourse, date, students });
      if (res.data?.success) {
        toast.success(res.data.message || "Attendance saved successfully!");
        setDirty(false);
        loadStats();
        // emit for real-time sync across tabs
        socket?.emit("attendanceUpdated", { courseId: selectedCourse, date });
      } else {
        toast.error(res.data?.message || "Failed to save attendance.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  // ── Derived State ──────────────────────────────────────────────────────────
  const filteredStudents = students.filter(
    (s) => s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const presentCount = students.filter((s) => s.attendance).length;
  const absentCount = students.length - presentCount;
  const selectedCourseName = courses.find((c) => c._id === selectedCourse)?.title || "";

  // ── No Courses State ───────────────────────────────────────────────────────
  if (!coursesLoading && courses.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-12 md:p-20 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-md text-center max-w-2xl mx-auto mt-10 shadow-xl"
        id="teacher-attendance-no-courses"
      >
        <div className="p-5 bg-emerald-500/10 text-emerald-500 rounded-full mb-6">
          <BookOpen className="h-14 w-14" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">No Courses Found</h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-md mb-8">
          You don't have any courses assigned to your account yet. Create your first course to
          start managing attendance for enrolled students.
        </p>
        <Button
          onClick={() => (window.location.href = "/teacher/courses")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-2.5 rounded-xl shadow-md transition-all"
        >
          Go to Course Management
        </Button>
      </motion.div>
    );
  }

  // ── Main UI ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
      id="teacher-attendance-module-container"
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Live Attendance Register
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Course-wise daily attendance — select a course and mark present or absent.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {dirty && (
            <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/30 text-xs font-semibold px-3 py-1 animate-pulse">
              Unsaved Changes
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadStudents(selectedCourse, date)}
            disabled={studentsLoading || !selectedCourse}
            className="flex items-center gap-1.5 text-xs"
            id="refresh-attendance-btn"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${studentsLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !selectedCourse || students.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold shadow-sm"
            id="save-attendance-btn"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Saving…" : "Save Roll Call"}
          </Button>
        </div>
      </motion.div>

      {/* ── Course Selector + Date + Search ────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card border border-border p-4 rounded-xl items-end shadow-sm"
      >
        {/* Course Dropdown */}
        <div>
          <label className="text-xs font-semibold mb-1.5 block text-muted-foreground uppercase tracking-wider">
            Select Course
          </label>
          {coursesLoading ? (
            <div className="h-10 bg-muted/40 animate-pulse rounded-lg" />
          ) : (
            <select
              className="w-full h-10 rounded-lg border border-border bg-card text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              value={selectedCourse}
              onChange={(e) => {
                setSelectedCourse(e.target.value);
                setSearchTerm("");
              }}
              id="course-select"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Date Picker */}
        <div>
          <label className="text-xs font-semibold mb-1.5 block text-muted-foreground uppercase tracking-wider">
            Attendance Date
          </label>
          <Input
            type="date"
            className="border-border bg-card text-foreground h-10 text-sm"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            id="date-picker"
          />
        </div>

        {/* Search Students */}
        <div>
          <label className="text-xs font-semibold mb-1.5 block text-muted-foreground uppercase tracking-wider">
            Search Student
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-9 h-10 border-border bg-card text-foreground text-sm"
              placeholder="Search by name…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id="student-search"
            />
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row ───────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Total Enrolled"
          value={studentsLoading ? "…" : students.length}
          colorClass="text-blue-500"
          bgClass="bg-blue-500/10"
        />
        <StatCard
          icon={CheckCircle}
          label="Present Today"
          value={studentsLoading ? "…" : presentCount}
          colorClass="text-emerald-500"
          bgClass="bg-emerald-500/10"
        />
        <StatCard
          icon={AlertTriangle}
          label="Absent / Unmarked"
          value={studentsLoading ? "…" : absentCount}
          colorClass="text-red-500"
          bgClass="bg-red-500/10"
        />
      </motion.div>

      {/* ── Charts Row (only when stats exist) ─────────────────────────────── */}
      <AnimatePresence>
        {stats && (
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="show"
          >
            {/* Weekly Trend */}
            <Card className="lg:col-span-2 border-border hover:shadow-md transition-all">
              <CardHeader>
                <CardTitle className="text-base text-foreground flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-500" />
                  Weekly Presence Rate (%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.weeklyTrend?.length > 0 ? (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.weeklyTrend}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
                        <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "0.75rem",
                          }}
                          formatter={(v) => [`${v}%`, "Presence Rate"]}
                        />
                        <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} name="Rate (%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-56 flex items-center justify-center text-muted-foreground text-sm">
                    No attendance data yet for your courses.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Distribution Pie */}
            <Card className="border-border hover:shadow-md transition-all bg-card">
              <CardHeader>
                <CardTitle className="text-base text-foreground flex items-center gap-2">
                  <PieIcon className="h-5 w-5 text-teal-500" />
                  Overall Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.distribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={78}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                        labelLine={false}
                      >
                        {stats.distribution.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [`${v}%`]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {stats.overallRate !== undefined && (
                  <p className="text-center text-xs text-muted-foreground mt-1">
                    Overall Rate:{" "}
                    <span className="font-bold text-emerald-500">{stats.overallRate}%</span> across{" "}
                    {stats.totalRecords} record(s)
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Student Table ────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="border-border shadow-md overflow-hidden bg-card">
          {/* Table Toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3 border-b border-border bg-muted/20">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-bold text-foreground">
                {selectedCourseName
                  ? `${selectedCourseName} — ${date}`
                  : "Select a course above"}
              </span>
            </div>
            {students.length > 0 && !studentsLoading && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkAll(true)}
                  className="text-xs h-7 border-emerald-500/40 text-emerald-600 hover:bg-emerald-50"
                >
                  <CheckCircle className="h-3 w-3 mr-1" /> Mark All Present
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkAll(false)}
                  className="text-xs h-7 border-red-500/40 text-red-500 hover:bg-red-50"
                >
                  <X className="h-3 w-3 mr-1" /> Mark All Absent
                </Button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {studentsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                ) : !selectedCourse ? (
                  <tr>
                    <td colSpan={5} className="text-center py-14 text-muted-foreground text-sm">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      Select a course to view enrolled students.
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-14 text-muted-foreground text-sm">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      {searchTerm
                        ? `No students match "${searchTerm}".`
                        : "No students are enrolled in this course yet."}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student, idx) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-primary/5 transition-colors"
                    >
                      {/* Index */}
                      <td className="px-5 py-4 text-xs text-muted-foreground font-medium">
                        {idx + 1}
                      </td>

                      {/* Name + Avatar */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 border border-border flex-shrink-0">
                            <AvatarFallback className="bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                              {student.name?.charAt(0)?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground text-sm leading-tight">
                              {student.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {student.id?.substring(0, 8)}…
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {student.email}
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4">
                        <Badge
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 ${
                            student.attendance
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-500 border border-red-500/20"
                          }`}
                        >
                          {student.attendance ? "● Present" : "● Absent"}
                        </Badge>
                      </td>

                      {/* Mark Buttons */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            className={`h-8 px-3 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                              student.attendance
                                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20"
                                : "bg-transparent border border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                            }`}
                            onClick={() => handleToggle(student.id, true)}
                          >
                            <Check className="h-3.5 w-3.5" />
                            Present
                          </Button>
                          <Button
                            size="sm"
                            className={`h-8 px-3 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all ${
                              !student.attendance
                                ? "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/20"
                                : "bg-transparent border border-red-400/30 text-red-500 hover:bg-red-500/10"
                            }`}
                            onClick={() => handleToggle(student.id, false)}
                          >
                            <X className="h-3.5 w-3.5" />
                            Absent
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          {!studentsLoading && filteredStudents.length > 0 && (
            <div className="px-5 py-3 border-t border-border bg-muted/10 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Showing {filteredStudents.length} of {students.length} student(s)
              </span>
              <span className="font-semibold">
                <span className="text-emerald-500">{presentCount} Present</span>
                {" · "}
                <span className="text-red-500">{absentCount} Absent</span>
                {students.length > 0 && (
                  <>
                    {" · "}
                    <span className="text-foreground">
                      {Math.round((presentCount / students.length) * 100)}% rate
                    </span>
                  </>
                )}
              </span>
            </div>
          )}
        </Card>
      </motion.div>

      {/* ── Floating Save Bar (appears when there are unsaved changes) ───────── */}
      <AnimatePresence>
        {dirty && !saving && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-card border border-emerald-500/30 shadow-2xl shadow-emerald-500/10 rounded-2xl px-6 py-3"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              You have unsaved attendance changes
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-8 px-5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              Save Now
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
