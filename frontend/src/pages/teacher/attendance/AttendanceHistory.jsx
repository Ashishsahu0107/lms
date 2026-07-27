import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  ClipboardList,
  History,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Plane,
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { getAttendanceHistory } from "../../../services/attendanceService";
import { getTeacherCourses } from "../../../services/teacherService";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  present: {
    label: "Present",
    color: "#10b981",
    cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: CheckCircle,
  },
  absent: {
    label: "Absent",
    color: "#f43f5e",
    cls: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: XCircle,
  },
  late: {
    label: "Late",
    color: "#f59e0b",
    cls: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: Clock,
  },
  leave: {
    label: "Leave",
    color: "#3b82f6",
    cls: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: Plane,
  },
};

const NAV_TABS = [
  {
    label: "Daily Attendance",
    path: "/teacher/attendance",
    icon: ClipboardList,
  },
  { label: "History", path: "/teacher/attendance/history", icon: History },
  {
    label: "Course Report",
    path: "/teacher/attendance/report",
    icon: BarChart3,
  },
];

function RateBar({ rate }) {
  const color = rate >= 75 ? "#10b981" : rate >= 50 ? "#f59e0b" : "#f43f5e";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted/40 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${rate}%`, backgroundColor: color }}
        />
      </div>
      <span
        className="text-xs font-bold min-w-[36px] text-right"
        style={{ color }}
      >
        {rate}%
      </span>
    </div>
  );
}

export default function AttendanceHistory() {
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const loadCourses = useCallback(async () => {
    try {
      setCoursesLoading(true);
      const res = await getTeacherCourses();
      if (res.data?.success && res.data.data?.length > 0) {
        setCourses(res.data.data);
        setSelectedCourse(res.data.data[0]._id);
      }
    } catch {
      toast.error("Failed to load courses");
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  const loadHistory = useCallback(async (courseId, params) => {
    if (!courseId) return;
    try {
      setLoading(true);
      const res = await getAttendanceHistory(courseId, params);
      if (res.data?.success) {
        setSessions(res.data.data || []);
        setPagination(res.data.pagination || { total: 0, pages: 1 });
      }
    } catch {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);
  useEffect(() => {
    if (selectedCourse)
      loadHistory(selectedCourse, { from, to, page, limit: 20 });
  }, [selectedCourse, page, loadHistory]);

  const handleFilter = () => {
    setPage(1);
    loadHistory(selectedCourse, { from, to, page: 1, limit: 20 });
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="attendance-history-page">
      {/* Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
          Attendance History
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View past attendance sessions by course
        </p>
      </div>

      {/* Nav Tabs */}
      <div className="flex gap-1 p-1 bg-muted/30 rounded-xl border border-border w-fit">
        {NAV_TABS.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Course
              </label>
              {coursesLoading ? (
                <div className="h-10 bg-muted/30 animate-pulse rounded-lg" />
              ) : (
                <select
                  className="w-full h-10 rounded-lg border border-border bg-card text-foreground px-3 text-sm focus:outline-none"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                From
              </label>
              <Input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                To
              </label>
              <Input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            <Button
              onClick={handleFilter}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-10"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Banner */}
      {pagination.total > 0 && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 text-emerald-500" />
          <span>
            <strong className="text-foreground">{pagination.total}</strong>{" "}
            session(s) found
          </span>
        </div>
      )}

      {/* Sessions Table */}
      <Card className="border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {[
                  "Date",
                  "Total",
                  "Present",
                  "Absent",
                  "Late",
                  "Leave",
                  "Rate",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-muted/30 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : sessions.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-14 text-muted-foreground text-sm"
                  >
                    <History className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    No attendance sessions found.
                  </td>
                </tr>
              ) : (
                sessions.map((session, idx) => (
                  <motion.tr
                    key={session.date}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        <span className="font-semibold text-sm text-foreground">
                          {formatDate(session.date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground font-medium">
                      {session.total}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_CONFIG.present.cls}`}
                      >
                        {session.present}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_CONFIG.absent.cls}`}
                      >
                        {session.absent}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_CONFIG.late.cls}`}
                      >
                        {session.late}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_CONFIG.leave.cls}`}
                      >
                        {session.leave}
                      </span>
                    </td>
                    <td className="px-5 py-4 min-w-[120px]">
                      <RateBar rate={session.rate} />
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Page {page} of {pagination.pages} ({pagination.total} sessions)
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setPage((p) => Math.min(pagination.pages, p + 1))
                }
                disabled={page === pagination.pages}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
