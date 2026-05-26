import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckSquare, AlertCircle, RefreshCw, Sparkles, BookOpen, Clock } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from "recharts";
import { getAttendanceAnalytics } from "../../../services/adminAnalyticsService";
import AnalyticsCard from "./components/AnalyticsCard";
import FilterSystem from "./components/FilterSystem";
import ExportFeatures from "./components/ExportFeatures";

export default function EngagementAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getAttendanceAnalytics(filters);
      if (res && res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load attendance engagement analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-emerald-400" /> Attendance & Student Engagement Analytics
          </h2>
          <p className="text-xs text-white/50">Monitor student presence statistics, course-wise compliance rates, and trigger low attendance warning flags.</p>
        </div>
        <div className="flex items-center gap-2">
          {data?.courseAttendance && (
            <ExportFeatures
              data={data.courseAttendance}
              title="Course Attendance compliance"
              csvHeaders={["title", "rate"]}
            />
          )}
          <button
            onClick={loadData}
            disabled={loading}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <FilterSystem onFilterChange={handleFilterChange} />

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Overall Presence Ratio"
          value={`${data?.metrics?.presentRate ?? 0}%`}
          trendValue="Industry benchmark"
          trendDirection="up"
          color="emerald"
          icon={CheckSquare}
          loading={loading}
        />
        <AnalyticsCard
          title="Absence Ratio"
          value={`${data?.metrics?.absentRate ?? 0}%`}
          trendValue="Approved/Unapproved"
          trendDirection="down"
          color="rose"
          icon={AlertCircle}
          loading={loading}
        />
        <AnalyticsCard
          title="Tardiness (Late) Rate"
          value={`${data?.metrics?.lateRate ?? 0}%`}
          trendValue="Within acceptable range"
          trendDirection="down"
          color="amber"
          icon={Clock}
          loading={loading}
        />
        <AnalyticsCard
          title="Leave/Excused Percentage"
          value={`${data?.metrics?.leaveRate ?? 0}%`}
          trendValue="Requested online"
          trendDirection="up"
          color="blue"
          icon={Sparkles}
          loading={loading}
        />
      </div>

      {/* Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Daily Curves */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold tracking-wider text-white/50 uppercase mb-4 flex items-center gap-1.5">
            <CheckSquare className="h-4 w-4 text-emerald-400" /> Daily Compliance & Presence Curve
          </h3>
          <div className="h-80 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-white/30">Loading presence trends...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.dailyTrends}>
                  <defs>
                    <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="date" stroke="#ffffff40" fontSize={11} />
                  <YAxis stroke="#ffffff40" fontSize={11} domain={[60, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#171717", borderColor: "#333", color: "#fff" }}
                    formatter={(value) => [`${value}% Attendance`, ""]}
                  />
                  <Area
                    name="Compliance"
                    type="monotone"
                    dataKey="attendance"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#attGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Course Wise Attendance Rates */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold tracking-wider text-white/50 uppercase mb-4">
            Course-Wise Presence compliance
          </h3>
          <div className="h-80 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-white/30">Loading course metrics...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.courseAttendance} layout="vertical">
                  <CartesianGrid stroke="#ffffff05" />
                  <XAxis type="number" stroke="#ffffff40" fontSize={10} domain={[50, 100]} />
                  <YAxis type="category" dataKey="title" stroke="#ffffff40" fontSize={8} width={80} tickFormatter={(tick) => tick.substring(0, 12) + ".."} />
                  <Tooltip contentStyle={{ backgroundColor: "#171717", borderColor: "#333" }} />
                  <Bar dataKey="rate" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={12}>
                    {data?.courseAttendance?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Critical Warnings Alert Panel */}
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 backdrop-blur-xl">
        <h3 className="text-sm font-bold tracking-wider text-rose-400 uppercase flex items-center gap-2 mb-4">
          <AlertCircle className="h-5 w-5" /> Low Attendance Student Alerts (Compliance Risk)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="text-white/30 text-xs col-span-full">Loading warning alerts...</div>
          ) : data?.alerts?.length === 0 ? (
            <div className="text-emerald-400/60 text-xs font-semibold col-span-full">Excellent! All enrolled students satisfy attendance requirements.</div>
          ) : (
            data?.alerts?.map((alert, idx) => (
              <motion.div
                whileHover={{ scale: 1.02 }}
                key={idx}
                className="flex items-center gap-4 rounded-xl border border-rose-500/10 bg-black/40 p-4"
              >
                <div className="h-10 w-10 rounded-full border border-rose-500/20 bg-rose-500/10 flex items-center justify-center font-black text-rose-400 text-lg uppercase">
                  {alert.name ? alert.name.substring(0, 2) : "ST"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{alert.name}</p>
                  <p className="text-[10px] text-white/50 truncate flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> {alert.courseTitle}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-rose-400">{alert.rate}%</span>
                  <p className="text-[8px] uppercase tracking-wider text-rose-400/50 font-bold">compliance</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
