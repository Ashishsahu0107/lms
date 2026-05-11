import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import api from "../utils/api";
import toast from "react-hot-toast";

const Stat = ({ label, value, hint, gradient }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-2xl shadow-sm ring-1 ring-black/5 p-5 bg-white dark:bg-gray-900`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold">{label}</p>
          <p className={`text-2xl font-extrabold ${gradient}`}>{value}</p>
          {hint ? <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</p> : null}
        </div>
        <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
          <div className={`h-2.5 w-2.5 rounded-full ${gradient}`} />
        </div>
      </div>
    </motion.div>
  );
};

const SegmentedTabs = ({ value, onChange, items }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => onChange(it.key)}
          className={
            value === it.key
              ? "px-4 py-2 rounded-full bg-blue-600 text-white font-semibold shadow-sm"
              : "px-4 py-2 rounded-full bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-semibold ring-1 ring-black/5 hover:bg-gray-50 dark:hover:bg-gray-800"
          }
        >
          {it.label}
        </button>
      ))}
    </div>
  );
};

const FallbackChart = ({ title }) => {
  const data = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        name: `W${i + 1}`,
        value: Math.round(60 + Math.random() * 40),
      })),
    []
  );

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/5 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-gray-900 dark:text-gray-100">{title}</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">Demo</span>
      </div>
      <div className="h-64 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="name" stroke="rgba(0,0,0,0.35)" />
            <YAxis stroke="rgba(0,0,0,0.35)" />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default function SuperAdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(false);

  // Dashboard data
  const [analytics, setAnalytics] = useState(null);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [courseRes, userRes, analyticsRes] = await Promise.all([
          api.get("/courses/all"),
          api.get("/auth/users"),
          api.get("/analytics/superadmin"),
        ]);

        setCourses(courseRes.data || []);
        setUsers((userRes.data || []).filter(Boolean));
        setAnalytics(analyticsRes.data || null);
      } catch (err) {
        console.log("SuperAdminDashboard fetch error:", err);
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const totals = useMemo(() => {
    const totalUsers = users.length;
    const totalTeachers = users.filter((u) => u.role === "teacher").length;
    const totalStudents = users.filter((u) => u.role === "student").length;
    const totalCourses = courses.length;

    return {
      totalUsers,
      totalTeachers,
      totalStudents,
      totalCourses,
      revenue: Math.round(totalCourses * 1200 + totalUsers * 35),
      activeEnrollments: courses.reduce((acc, c) => acc + (c.users?.length || 0), 0),
    };
  }, [users, courses]);

  const recentUsers = useMemo(() => users.slice(0, 6), [users]);
  const latestCourses = useMemo(() => courses.slice(0, 6), [courses]);
  const topTeachers = useMemo(() => {
    // Since Course.instructor is a string, we can still derive a “top list” safely.
    const map = new Map();
    (courses || []).forEach((c) => {
      const key = c.instructor || "Unknown";
      map.set(key, (map.get(key) || 0) + (c.users?.length || 0));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [courses]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-3xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/5 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              👑 Super Admin
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
              Premium Analytics Console
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage users, teachers, students, courses, analytics, categories, announcements and platform settings.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
            <p className="font-extrabold text-gray-900 dark:text-gray-100">
              {loading ? "Loading…" : "Live"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Stat
            label="Total Users"
            value={totals.totalUsers}
            gradient="text-blue-600"
            hint={analytics ? `Analytics avgScore: ${analytics.avgScore || 0}` : ""}
          />
          <Stat label="Total Teachers" value={totals.totalTeachers} gradient="text-indigo-600" />
          <Stat label="Total Students" value={totals.totalStudents} gradient="text-emerald-600" />
          <Stat label="Total Courses" value={totals.totalCourses} gradient="text-purple-600" />
          <Stat label="Revenue" value={`$${totals.revenue}`} gradient="text-amber-600" />
          <Stat
            label="Active Enrollments"
            value={totals.activeEnrollments}
            gradient="text-rose-600"
          />
        </div>
      </motion.div>

      <SegmentedTabs
        value={tab}
        onChange={setTab}
        items={[
          { key: "overview", label: "Dashboard" },
          { key: "analytics", label: "Analytics" },
          { key: "tables", label: "Tables" },
        ]}
      />

      {tab === "overview" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FallbackChart title="Student Growth (Sample)" />
          </div>
          <div>
            <FallbackChart title="Course Analytics (Sample)" />
          </div>
        </div>
      )}

      {tab === "analytics" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <FallbackChart title="Revenue Analytics (Sample)" />
          <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/5 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-gray-900 dark:text-gray-100">Admin KPIs</h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">From backend</span>
            </div>

            <div className="mt-4 space-y-3">
              <KpiRow label="Users" value={analytics?.users ?? "—"} />
              <KpiRow label="Courses" value={analytics?.courses ?? "—"} />
              <KpiRow label="Attempts" value={analytics?.attempts ?? "—"} />
              <KpiRow label="Assignments" value={analytics?.assignments ?? "—"} />
              <KpiRow label="Submissions" value={analytics?.submissions ?? "—"} />
              <KpiRow label="Pending Submissions" value={analytics?.pendingSubmissions ?? "—"} />
            </div>
          </div>
        </div>
      )}

      {tab === "tables" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <TableCard title="Recent Users" items={recentUsers} renderRow={(u) => ({ left: u.name, right: u.role })} />
          </div>
          <div>
            <TableCard
              title="Latest Courses"
              items={latestCourses}
              renderRow={(c) => ({ left: c.title, right: `${c.users?.length || 0} enrolled` })}
            />
          </div>
          <div>
            <TableCard
              title="Top Teachers"
              items={topTeachers}
              renderRow={(t) => ({ left: t.name, right: `${t.value} students` })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const KpiRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 ring-1 ring-black/5">
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</span>
      <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{value}</span>
    </div>
  );
};

const TableCard = ({ title, items, renderRow }) => {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-black/5 p-5">
      <h3 className="font-extrabold text-gray-900 dark:text-gray-100">{title}</h3>
      <div className="mt-4 space-y-2">
        {items?.length ? (
          items.map((it, idx) => {
            const row = renderRow(it);
            return (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 ring-1 ring-black/5"
              >
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{row.left}</span>
                <span className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{row.right}</span>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No data.</p>
        )}
      </div>
    </div>
  );
};

