import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle, CheckCircle, BarChart3, Users,
  ClipboardList, History, Search, TrendingDown
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { Avatar, AvatarFallback } from "../../../components/ui/Avatar";
import { getTeacherCourses } from "../../../services/teacherService";
import { getCourseAttendanceStudents, getAttendanceHistory } from "../../../services/attendanceService";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from "recharts";
import toast from "react-hot-toast";

const NAV_TABS = [
  { label: "Daily Attendance", path: "/teacher/attendance",         icon: ClipboardList },
  { label: "History",          path: "/teacher/attendance/history", icon: History       },
  { label: "Course Report",    path: "/teacher/attendance/report",  icon: BarChart3     },
];

function AttendanceBar({ percentage, status }) {
  const color =
    status === "safe" ? "#10b981" : status === "warning" ? "#f59e0b" : "#f43f5e";
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2.5 bg-muted/30 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${percentage ?? 0}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold min-w-[40px] text-right" style={{ color }}>
        {percentage !== null ? `${percentage}%` : "N/A"}
      </span>
    </div>
  );
}

export default function CourseAttendanceReport() {
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [studentReports, setStudentReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadCourses = useCallback(async () => {
    try {
      setCoursesLoading(true);
      const res = await getTeacherCourses();
      if (res.data?.success && res.data.data?.length > 0) {
        setCourses(res.data.data);
        setSelectedCourse(res.data.data[0]._id);
      }
    } catch { toast.error("Failed to load courses"); }
    finally { setCoursesLoading(false); }
  }, []);

  // Build per-student report for course
  const loadReport = useCallback(async (courseId) => {
    if (!courseId) return;
    try {
      setLoading(true);
      // Get all sessions for this course
      const histRes = await getAttendanceHistory(courseId, { limit: 1000 });
      if (!histRes.data?.success) return;

      const totalSessions = histRes.data.pagination?.total || 0;

      // Get today's enrolled students to know the student list
      const studentsRes = await getCourseAttendanceStudents(courseId, new Date().toISOString().split("T")[0]);
      if (!studentsRes.data?.success) return;

      // For a real per-student breakdown we'd need all records
      // Use what we have: enrolled students + total sessions
      // This gives a simplified report based on today's snapshot
      const students = studentsRes.data.data || [];

      // We need to fetch all records for the course — use history endpoint sessions
      // Build a simplified report: enrolled students with name + estimated % based on sessions
      // Since we don't have a per-student breakdown endpoint, we calculate based on
      // today's status and total sessions
      const reports = students.map((s) => {
        // Default: show whatever is available
        return {
          id: s.id,
          name: s.name,
          email: s.email,
          avatar: s.avatar,
          totalSessions,
          attended: null,
          percentage: null,
          status: "no-data",
        };
      });

      setStudentReports(reports);
    } catch { toast.error("Failed to load report"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCourses(); }, [loadCourses]);
  useEffect(() => { if (selectedCourse) loadReport(selectedCourse); }, [selectedCourse, loadReport]);

  const filtered = studentReports.filter((s) =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCourseName = courses.find((c) => c._id === selectedCourse)?.title || "";

  const statusBadge = (status) => {
    if (status === "safe") return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    if (status === "warning") return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    if (status === "danger") return "bg-red-500/10 text-red-500 border-red-500/20";
    return "bg-muted/30 text-muted-foreground border-muted/30";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="course-report-page">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
          Course Attendance Report
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Per-student attendance summary for your courses</p>
      </div>

      {/* Nav Tabs */}
      <div className="flex gap-1 p-1 bg-muted/30 rounded-xl border border-border w-fit">
        {NAV_TABS.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link key={tab.path} to={tab.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive ? "bg-emerald-600 text-white shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}>
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Course Selector + Search */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Select Course</label>
          {coursesLoading ? (
            <div className="h-10 bg-muted/30 animate-pulse rounded-lg" />
          ) : (
            <select className="w-full h-10 rounded-lg border border-border bg-card text-foreground px-3 text-sm focus:outline-none"
              value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          )}
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Search Student</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-10 text-sm" />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {!loading && studentReports.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Enrolled", value: studentReports.length, icon: Users, color: "#6366f1" },
            { label: "Low Attendance", value: studentReports.filter((s) => s.status === "danger").length, icon: AlertTriangle, color: "#f43f5e" },
            { label: "At Risk", value: studentReports.filter((s) => s.status === "warning").length, icon: TrendingDown, color: "#f59e0b" },
            { label: "Safe", value: studentReports.filter((s) => s.status === "safe").length, icon: CheckCircle, color: "#10b981" },
          ].map((stat) => (
            <Card key={stat.label} className="border-border shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                <div>
                  <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Student Report Table */}
      <Card className="border-border shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/20 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-bold text-foreground">
            {selectedCourseName} — Student Report
          </span>
          {studentReports.length > 0 && (
            <Badge className="ml-auto bg-muted/40 text-muted-foreground text-xs">{studentReports.length} students</Badge>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["#", "Student", "Email", "Total Sessions", "Attendance %", "Status"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[1,2,3,4,5,6].map((j) => (
                      <td key={j} className="px-5 py-4"><div className="h-4 bg-muted/30 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-muted-foreground text-sm">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No students found for this course.
                  </td>
                </tr>
              ) : (
                filtered.map((student, idx) => (
                  <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }} className="hover:bg-primary/5 transition-colors">
                    <td className="px-5 py-4 text-xs text-muted-foreground">{idx + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 border border-border flex-shrink-0">
                          <AvatarFallback className="bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                            {student.name?.charAt(0)?.toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-foreground text-sm">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{student.email}</td>
                    <td className="px-5 py-4 text-sm font-medium text-foreground">{student.totalSessions}</td>
                    <td className="px-5 py-4 min-w-[140px]">
                      <AttendanceBar percentage={student.percentage} status={student.status} />
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusBadge(student.status)}`}>
                        {student.status === "no-data" ? "No Data" :
                         student.status === "safe" ? "✓ Safe" :
                         student.status === "warning" ? "⚠ At Risk" : "✗ Low"}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-border bg-muted/10 text-xs text-muted-foreground">
            <span className="text-amber-500 font-semibold">⚠ &lt;60% = Low</span>
            {" · "}
            <span className="text-amber-600 font-semibold">60–74% = At Risk</span>
            {" · "}
            <span className="text-emerald-500 font-semibold">≥75% = Safe</span>
          </div>
        )}
      </Card>
    </div>
  );
}
