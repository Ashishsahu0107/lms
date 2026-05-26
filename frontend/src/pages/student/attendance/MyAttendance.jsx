import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle, XCircle, Clock, Plane, Calendar, BookOpen,
  TrendingUp, AlertTriangle, Filter, RefreshCw
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { getMyAttendance, getMyAttendancePercentage } from "../../../services/attendanceService";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  present: { label: "Present", color: "#10b981", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCircle },
  absent:  { label: "Absent",  color: "#f43f5e", cls: "bg-red-500/10 text-red-500 border-red-500/20",           icon: XCircle   },
  late:    { label: "Late",    color: "#f59e0b", cls: "bg-amber-500/10 text-amber-600 border-amber-500/20",     icon: Clock     },
  leave:   { label: "Leave",   color: "#3b82f6", cls: "bg-blue-500/10 text-blue-500 border-blue-500/20",        icon: Plane     },
};

function PercentageMeter({ percentage, status }) {
  const color =
    status === "safe" ? "#10b981" :
    status === "warning" ? "#f59e0b" :
    status === "danger" ? "#f43f5e" : "#94a3b8";

  const label =
    status === "safe" ? "✓ Safe" :
    status === "warning" ? "⚠ At Risk" :
    status === "danger" ? "✗ Low" : "No Data";

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 h-2.5 bg-muted/30 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(percentage ?? 0, 100)}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold min-w-[36px]" style={{ color }}>
        {percentage !== null ? `${percentage}%` : "—"}
      </span>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${
        status === "safe"    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
        status === "warning" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
        status === "danger"  ? "bg-red-500/10 text-red-500 border-red-500/20" :
                               "bg-muted/30 text-muted-foreground border-muted/30"
      }`}>
        {label}
      </span>
    </div>
  );
}

export default function MyAttendance() {
  const [records, setRecords] = useState([]);
  const [percentages, setPercentages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview"); // overview | history
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filterCourse, setFilterCourse] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [recRes, pctRes] = await Promise.all([
        getMyAttendance({ from, to, courseId: filterCourse }),
        getMyAttendancePercentage(),
      ]);
      if (recRes.data?.success) setRecords(recRes.data.data || []);
      if (pctRes.data?.success) setPercentages(pctRes.data.data || []);
    } catch {
      toast.error("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, [from, to, filterCourse]);

  useEffect(() => { loadData(); }, []);

  const handleFilter = () => loadData();

  const totalCounts = { present: 0, absent: 0, late: 0, leave: 0 };
  records.forEach((r) => { if (totalCounts[r.status] !== undefined) totalCounts[r.status]++; });
  const totalRecords = records.length;
  const attended = totalCounts.present + totalCounts.late;
  const overallRate = totalRecords > 0 ? Math.round((attended / totalRecords) * 100) : null;

  const pieData = Object.entries(totalCounts)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ name: STATUS_CONFIG[key].label, value, color: STATUS_CONFIG[key].color }));

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="space-y-6 max-w-6xl mx-auto" id="my-attendance-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            My Attendance
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track your daily attendance across all enrolled courses</p>
        </div>
        <div className="flex gap-2">
          <Link to="/student/attendance/calendar">
            <Button variant="outline" size="sm" className="gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Calendar View
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleFilter} disabled={loading} className="gap-2 text-sm">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-1 p-1 bg-muted/30 rounded-xl border border-border w-fit">
        {["overview", "history"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              tab === t ? "bg-indigo-600 text-white shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}>
            {t === "overview" ? "📊 Overview" : "📋 Attendance History"}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === "overview" && (
        <div className="space-y-6">

          {/* Overall stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(totalCounts).map(([key, val]) => {
              const cfg = STATUS_CONFIG[key];
              return (
                <Card key={key} className="border-border shadow-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <cfg.icon className="h-5 w-5 flex-shrink-0" style={{ color: cfg.color }} />
                    <div>
                      <p className="text-xl font-bold text-foreground">{loading ? "…" : val}</p>
                      <p className="text-xs text-muted-foreground">{cfg.label}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pie */}
            <Card className="border-border shadow-sm">
              <div className="p-5 border-b border-border">
                <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-500" />
                  Overall Breakdown
                </h3>
              </div>
              <CardContent className="p-5">
                {loading ? (
                  <div className="h-48 bg-muted/20 animate-pulse rounded-xl" />
                ) : pieData.length > 0 ? (
                  <>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                            {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                          <Tooltip formatter={(v) => [v, "Classes"]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 text-center">
                      {overallRate !== null && (
                        <p className="text-2xl font-extrabold" style={{ color: overallRate >= 75 ? "#10b981" : overallRate >= 60 ? "#f59e0b" : "#f43f5e" }}>
                          {overallRate}%
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">Overall Attendance Rate</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                      {pieData.map((d) => (
                        <span key={d.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                          {d.name}: {d.value}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                    No attendance data yet.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Per-course breakdown */}
            <div className="lg:col-span-2">
              <Card className="border-border shadow-sm">
                <div className="p-5 border-b border-border">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-indigo-500" />
                    Course-wise Attendance
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-5 animate-pulse">
                        <div className="h-4 bg-muted/30 rounded mb-3 w-1/2" />
                        <div className="h-3 bg-muted/20 rounded w-full" />
                      </div>
                    ))
                  ) : percentages.length === 0 ? (
                    <div className="p-10 text-center text-muted-foreground text-sm">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      No course attendance recorded.
                    </div>
                  ) : (
                    percentages.map((course) => (
                      <motion.div key={course.courseId} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="p-5 hover:bg-muted/10 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm text-foreground truncate max-w-xs">{course.courseTitle}</h4>
                          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                            {course.attended}/{course.totalClasses} classes
                          </span>
                        </div>
                        <PercentageMeter percentage={course.percentage} status={course.status} />
                      </motion.div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === "history" && (
        <div className="space-y-4">
          {/* Filters */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">From</label>
                  <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-10 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">To</label>
                  <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-10 text-sm" />
                </div>
                <Button onClick={handleFilter} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white h-10">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Records Table */}
          <Card className="border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {["Date", "Course", "Status", "Remarks"].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {[1,2,3,4].map((j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-muted/30 rounded" /></td>)}
                      </tr>
                    ))
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-14 text-muted-foreground text-sm">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        No attendance records found.
                      </td>
                    </tr>
                  ) : (
                    records.map((record, idx) => {
                      const cfg = STATUS_CONFIG[record.status] || STATUS_CONFIG.present;
                      return (
                        <motion.tr key={record._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.02 }} className="hover:bg-primary/5 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                              <span className="text-sm font-semibold text-foreground">{formatDate(record.date)}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-muted-foreground">
                            {record.courseId?.title || "Unknown Course"}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${cfg.cls}`}>
                              <cfg.icon className="h-3 w-3" />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-muted-foreground">
                            {record.remarks || <span className="text-muted-foreground/40">—</span>}
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
