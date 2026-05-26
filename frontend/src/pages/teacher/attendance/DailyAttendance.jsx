import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, X, Clock, Plane, Search, CheckCircle, AlertTriangle,
  Users, Save, RefreshCw, ClipboardList, History, BarChart3,
  ChevronDown, TrendingUp, BookOpen
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { Avatar, AvatarFallback } from "../../../components/ui/Avatar";
import {
  getCourseAttendanceStudents,
  markDailyAttendance,
} from "../../../services/attendanceService";
import { getTeacherCourses } from "../../../services/teacherService";
import { useSocket } from "../../../context/SocketContext";
import toast from "react-hot-toast";

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUSES = [
  { key: "present", label: "Present", color: "bg-emerald-600 text-white hover:bg-emerald-700", badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: Check },
  { key: "absent",  label: "Absent",  color: "bg-red-500 text-white hover:bg-red-600",         badgeClass: "bg-red-500/10 text-red-500 border-red-500/20",         icon: X    },
  { key: "late",    label: "Late",    color: "bg-amber-500 text-white hover:bg-amber-600",      badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",    icon: Clock },
  { key: "leave",   label: "Leave",   color: "bg-blue-500 text-white hover:bg-blue-600",        badgeClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",       icon: Plane },
];

const statusOf = (key) => STATUSES.find((s) => s.key === key) || STATUSES[0];

const NAV_TABS = [
  { label: "Daily Attendance", path: "/teacher/attendance",         icon: ClipboardList },
  { label: "History",          path: "/teacher/attendance/history", icon: History       },
  { label: "Course Report",    path: "/teacher/attendance/report",  icon: BarChart3     },
];

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-5 py-4"><div className="h-4 bg-muted/50 rounded-md" /></td>
      ))}
    </tr>
  );
}

export default function DailyAttendance() {
  const location = useLocation();
  const { socket } = useSocket();

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("present");

  // ── Load Courses ──────────────────────────────────────────────────────────
  const loadCourses = useCallback(async () => {
    try {
      setCoursesLoading(true);
      const res = await getTeacherCourses();
      if (res.data?.success && res.data.data?.length > 0) {
        setCourses(res.data.data);
        setSelectedCourse((prev) => prev || res.data.data[0]._id);
      } else {
        setCourses([]);
      }
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  // ── Load Students ─────────────────────────────────────────────────────────
  const loadStudents = useCallback(async (courseId, d) => {
    if (!courseId) { setStudents([]); return; }
    try {
      setStudentsLoading(true);
      setDirty(false);
      const res = await getCourseAttendanceStudents(courseId, d);
      if (res.data?.success) {
        setStudents(res.data.data || []);
      } else {
        setStudents([]);
        toast.error(res.data?.message || "Failed to load students");
      }
    } catch {
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  useEffect(() => { loadCourses(); }, [loadCourses]);
  useEffect(() => {
    if (selectedCourse) loadStudents(selectedCourse, date);
  }, [selectedCourse, date, loadStudents]);

  // ── Socket Sync ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const handler = (data) => {
      if (data.courseId === selectedCourse) loadStudents(selectedCourse, date);
    };
    socket.on("attendanceUpdated", handler);
    return () => socket.off("attendanceUpdated", handler);
  }, [socket, selectedCourse, date, loadStudents]);

  // ── Change individual student status ─────────────────────────────────────
  const handleStatusChange = (id, status) => {
    setStudents((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
    setDirty(true);
  };

  // ── Change remarks ────────────────────────────────────────────────────────
  const handleRemarksChange = (id, remarks) => {
    setStudents((prev) => prev.map((s) => s.id === id ? { ...s, remarks } : s));
    setDirty(true);
  };

  // ── Bulk Mark ─────────────────────────────────────────────────────────────
  const handleBulkMark = (status) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
    setDirty(true);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedCourse) return toast.error("Select a course first.");
    if (students.length === 0) return toast.error("No students to save.");
    try {
      setSaving(true);
      const res = await markDailyAttendance({ courseId: selectedCourse, date, students });
      if (res.data?.success) {
        toast.success(res.data.message || "Attendance saved!");
        setDirty(false);
        socket?.emit("attendanceUpdated", { courseId: selectedCourse, date });
      } else {
        toast.error(res.data?.message || "Save failed.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered = students.filter((s) =>
    !search || s.name?.toLowerCase().includes(search.toLowerCase())
  );
  const counts = { present: 0, absent: 0, late: 0, leave: 0 };
  students.forEach((s) => counts[s.status]++);
  const selectedCourseName = courses.find((c) => c._id === selectedCourse)?.title || "";

  // ── No Courses ────────────────────────────────────────────────────────────
  if (!coursesLoading && courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center max-w-lg mx-auto mt-10 rounded-2xl border border-border bg-card/40">
        <BookOpen className="h-14 w-14 text-emerald-500/50 mb-4" />
        <h2 className="text-xl font-bold mb-2">No Courses Found</h2>
        <p className="text-muted-foreground text-sm mb-6">Create a course first to manage attendance.</p>
        <Button onClick={() => (window.location.href = "/teacher/courses")} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          Go to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="daily-attendance-page">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Daily Attendance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Mark daily attendance for your course students</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {dirty && (
            <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/30 text-xs font-semibold px-3 py-1 animate-pulse">
              Unsaved Changes
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => loadStudents(selectedCourse, date)}
            disabled={studentsLoading || !selectedCourse} className="text-xs gap-1.5">
            <RefreshCw className={`h-3.5 w-3.5 ${studentsLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={saving || !selectedCourse || students.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold" id="save-btn">
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving…" : "Save Attendance"}
          </Button>
        </div>
      </div>

      {/* ── Nav Tabs ── */}
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

      {/* ── Controls Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-card border border-border p-4 rounded-xl items-end shadow-sm">
        {/* Course */}
        <div>
          <label className="text-xs font-semibold mb-1.5 block text-muted-foreground uppercase tracking-wider">Course</label>
          {coursesLoading ? (
            <div className="h-10 bg-muted/40 animate-pulse rounded-lg" />
          ) : (
            <select
              className="w-full h-10 rounded-lg border border-border bg-card text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={selectedCourse}
              onChange={(e) => { setSelectedCourse(e.target.value); setSearch(""); }}
              id="course-select"
            >
              {courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          )}
        </div>
        {/* Date */}
        <div>
          <label className="text-xs font-semibold mb-1.5 block text-muted-foreground uppercase tracking-wider">Date</label>
          <Input type="date" value={date} max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setDate(e.target.value)} className="h-10 text-sm" id="date-picker" />
        </div>
        {/* Search */}
        <div>
          <label className="text-xs font-semibold mb-1.5 block text-muted-foreground uppercase tracking-wider">Search Student</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-sm" id="student-search" />
          </div>
        </div>
      </div>

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {STATUSES.map((s) => (
          <Card key={s.key} className="border-border shadow-sm bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className="h-5 w-5 flex-shrink-0"
                style={{ color: { present: "#10b981", absent: "#f43f5e", late: "#f59e0b", leave: "#3b82f6" }[s.key] }} />
              <div>
                <p className="text-xl font-bold text-foreground">{studentsLoading ? "…" : counts[s.key]}</p>
                <p className="text-xs text-muted-foreground capitalize">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Student Table ── */}
      <Card className="border-border shadow-md overflow-hidden bg-card" id="attendance-table">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <ClipboardList className="h-4 w-4 text-emerald-500" />
            {selectedCourseName ? `${selectedCourseName} — ${date}` : "Select a course"}
          </div>

          {students.length > 0 && !studentsLoading && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground font-semibold">Bulk:</span>
              {STATUSES.map((s) => (
                <button key={s.key} onClick={() => handleBulkMark(s.key)}
                  className={`h-7 px-2.5 text-xs font-semibold rounded-lg border transition-all ${
                    s.key === "present" ? "border-emerald-500/30 text-emerald-600 hover:bg-emerald-50" :
                    s.key === "absent"  ? "border-red-400/30 text-red-500 hover:bg-red-50" :
                    s.key === "late"    ? "border-amber-400/30 text-amber-600 hover:bg-amber-50" :
                                         "border-blue-400/30 text-blue-500 hover:bg-blue-50"
                  }`}>
                  All {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-10">#</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Remarks</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Mark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {studentsLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : !selectedCourse ? (
                <tr>
                  <td colSpan={5} className="text-center py-14 text-muted-foreground text-sm">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    Select a course to view students.
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-14 text-muted-foreground text-sm">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    {search ? `No students match "${search}".` : "No enrolled students in this course."}
                  </td>
                </tr>
              ) : (
                filtered.map((student, idx) => {
                  const cfg = statusOf(student.status);
                  return (
                    <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }} className="hover:bg-primary/5 transition-colors">

                      <td className="px-5 py-3.5 text-xs text-muted-foreground font-medium">{idx + 1}</td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 border border-border flex-shrink-0">
                            <AvatarFallback className="bg-emerald-500/10 text-emerald-600 text-xs font-bold">
                              {student.name?.charAt(0)?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground text-sm">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${cfg.badgeClass}`}>
                          <cfg.icon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <input
                          type="text"
                          placeholder="Optional note…"
                          value={student.remarks || ""}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          className="h-7 w-36 text-xs px-2 rounded-lg border border-border bg-transparent text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                        />
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end gap-1">
                          {STATUSES.map((s) => (
                            <button key={s.key}
                              onClick={() => handleStatusChange(student.id, s.key)}
                              title={s.label}
                              className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                                student.status === s.key ? s.color : "bg-muted/30 text-muted-foreground hover:bg-muted/60"
                              }`}>
                              <s.icon className="h-3.5 w-3.5" />
                            </button>
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!studentsLoading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-border bg-muted/10 flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing {filtered.length} of {students.length} student(s)</span>
            <span className="font-semibold">
              <span className="text-emerald-500">{counts.present} Present</span>{" · "}
              <span className="text-red-500">{counts.absent} Absent</span>{" · "}
              <span className="text-amber-500">{counts.late} Late</span>{" · "}
              <span className="text-blue-500">{counts.leave} Leave</span>
              {students.length > 0 && (
                <>{" · "}<span className="text-foreground">{Math.round(((counts.present + counts.late) / students.length) * 100)}% rate</span></>
              )}
            </span>
          </div>
        )}
      </Card>

      {/* ── Floating Save Bar ── */}
      <AnimatePresence>
        {dirty && !saving && (
          <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-card border border-emerald-500/30 shadow-2xl rounded-2xl px-6 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              You have unsaved attendance changes
            </div>
            <Button onClick={handleSave} disabled={saving}
              className="h-8 px-5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl">
              <Save className="h-3.5 w-3.5 mr-1" />
              Save Now
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
