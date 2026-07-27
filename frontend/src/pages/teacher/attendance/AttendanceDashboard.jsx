import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ClipboardList,
  History,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  Plane,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { getAttendanceStats } from "../../../services/attendanceService";
import { getTeacherCourses } from "../../../services/teacherService";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import toast from "react-hot-toast";

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  present: {
    label: "Present",
    color: "#10b981",
    icon: CheckCircle,
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
  },
  absent: {
    label: "Absent",
    color: "#f43f5e",
    icon: XCircle,
    bg: "bg-red-500/10",
    text: "text-red-500",
  },
  late: {
    label: "Late",
    color: "#f59e0b",
    icon: Clock,
    bg: "bg-amber-500/10",
    text: "text-amber-500",
  },
  leave: {
    label: "Leave",
    color: "#3b82f6",
    icon: Plane,
    bg: "bg-blue-500/10",
    text: "text-blue-500",
  },
};

// ─── Navigation Tabs ──────────────────────────────────────────────────────────
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

// ─── Container Variants ───────────────────────────────────────────────────────
const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, bgClass, textClass, sub }) {
  return (
    <Card className="border-border shadow-sm bg-card hover:shadow-md transition-all">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`p-3 ${bgClass} ${textClass} rounded-xl flex-shrink-0`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className={`text-2xl font-bold ${textClass}`}>{value ?? "—"}</h3>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            {label}
          </p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AttendanceDashboard() {
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, coursesRes] = await Promise.all([
        getAttendanceStats(),
        getTeacherCourses(),
      ]);
      if (statsRes.data?.success) setStats(statsRes.data.data);
      if (coursesRes.data?.success) setCourses(coursesRes.data.data || []);
    } catch {
      toast.error("Failed to load attendance dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto" id="attendance-dashboard">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Attendance Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Course-wise daily attendance system for your {courses.length}{" "}
            course(s)
          </p>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
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

      {/* ── Stats Row ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 bg-muted/30 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeIn}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <StatCard
            label="Total Records"
            value={stats?.totalRecords ?? 0}
            icon={ClipboardList}
            bgClass="bg-primary/10"
            textClass="text-primary"
            sub="All time"
          />
          <StatCard
            label="Present"
            value={stats?.presentCount ?? 0}
            icon={CheckCircle}
            bgClass={STATUS_CONFIG.present.bg}
            textClass={STATUS_CONFIG.present.text}
            sub="Last 6 weeks"
          />
          <StatCard
            label="Absent"
            value={stats?.absentCount ?? 0}
            icon={XCircle}
            bgClass={STATUS_CONFIG.absent.bg}
            textClass={STATUS_CONFIG.absent.text}
          />
          <StatCard
            label="Overall Rate"
            value={
              stats?.overallRate !== undefined ? `${stats.overallRate}%` : "—"
            }
            icon={TrendingUp}
            bgClass="bg-teal-500/10"
            textClass="text-teal-500"
            sub="Present + Late"
          />
        </motion.div>
      )}

      {/* ── Charts ── */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Trend */}
          <Card className="lg:col-span-2 border-border">
            <div className="p-5 border-b border-border">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Weekly Attendance Rate (%)
              </h3>
            </div>
            <CardContent className="p-5">
              {stats.weeklyTrend?.length > 0 ? (
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.weeklyTrend}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        strokeOpacity={0.3}
                      />
                      <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.75rem",
                        }}
                        formatter={(v) => [`${v}%`, "Rate"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        dot={{ fill: "#10b981", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-52 flex items-center justify-center text-muted-foreground text-sm">
                  No attendance data recorded yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribution Pie */}
          <Card className="border-border">
            <div className="p-5 border-b border-border">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-teal-500" />
                Status Distribution
              </h3>
            </div>
            <CardContent className="p-5">
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {stats.distribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {stats.distribution.map((d) => (
                  <div
                    key={d.name}
                    className="flex items-center gap-1.5 text-xs"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="text-muted-foreground">
                      {d.name}:{" "}
                      <strong className="text-foreground">{d.value}%</strong>
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Quick Links ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            to: "/teacher/attendance",
            label: "Take Daily Attendance",
            desc: "Mark present/absent/late/leave for today",
            icon: ClipboardList,
            color: "emerald",
          },
          {
            to: "/teacher/attendance/history",
            label: "Attendance History",
            desc: "View and filter past attendance sessions",
            icon: History,
            color: "blue",
          },
          {
            to: "/teacher/attendance/report",
            label: "Course Report",
            desc: "Per-student attendance % and low-attendance alerts",
            icon: BarChart3,
            color: "purple",
          },
        ].map((card) => (
          <Link key={card.to} to={card.to}>
            <Card className="border-border hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-5 flex items-start gap-4">
                <div
                  className={`p-3 bg-${card.color}-500/10 text-${card.color}-500 rounded-xl group-hover:scale-110 transition-transform`}
                >
                  <card.icon className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">
                    {card.label}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {card.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
