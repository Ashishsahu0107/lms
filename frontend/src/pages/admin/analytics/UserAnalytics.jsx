import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, UserCheck, RefreshCw, BarChart3 } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Line, ComposedChart } from "recharts";
import { getUserAnalytics } from "../../../services/adminAnalyticsService";
import AnalyticsCard from "./components/AnalyticsCard";
import FilterSystem from "./components/FilterSystem";
import ExportFeatures from "./components/ExportFeatures";

export default function UserAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getUserAnalytics(filters);
      if (res && res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load user analytics:", err);
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

  return (
    <div className="space-y-6">
      {/* Header and Exporter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-400" /> User Analytics & Audience Demographics
          </h2>
          <p className="text-xs text-white/50">Track student registrations, active session trends, and platform retention cohort curves.</p>
        </div>
        <div className="flex items-center gap-2">
          {data?.userGrowth && (
            <ExportFeatures
              data={data.userGrowth}
              title="User Growth Analytics"
              csvHeaders={["month", "users"]}
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

      {/* Dynamic Filters */}
      <FilterSystem onFilterChange={handleFilterChange} />

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <AnalyticsCard
          title="Total Registered Students"
          value={data?.totalStudents ?? 0}
          trendValue="+14% this mo"
          trendDirection="up"
          color="blue"
          icon={Users}
          loading={loading}
        />
        <AnalyticsCard
          title="Total Active Instructors"
          value={data?.totalTeachers ?? 0}
          trendValue="+8% this mo"
          trendDirection="up"
          color="purple"
          icon={UserPlus}
          loading={loading}
        />
        <AnalyticsCard
          title="Live Online Users"
          value={data?.online ?? 0}
          trendValue="Live Telemetry"
          trendDirection="up"
          color="emerald"
          icon={UserCheck}
          loading={loading}
        />
      </div>

      {/* Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold tracking-wider text-white/50 uppercase mb-4">
            Registration Growth Curve
          </h3>
          <div className="h-80 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-white/30">Loading charts...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.userGrowth}>
                  <defs>
                    <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="month" stroke="#ffffff40" fontSize={11} />
                  <YAxis stroke="#ffffff40" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#171717", borderColor: "#333", color: "#fff" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#growthGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Login Trends Composed Chart */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold tracking-wider text-white/50 uppercase mb-4">
            Login Volumes & Active Hours
          </h3>
          <div className="h-80 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-white/30">Loading trends...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data?.loginTrends}>
                  <CartesianGrid stroke="#ffffff08" />
                  <XAxis dataKey="date" stroke="#ffffff40" fontSize={11} />
                  <YAxis yAxisId="left" stroke="#ffffff40" fontSize={11} label={{ value: 'Logins', angle: -90, position: 'insideLeft', fill: '#999' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#ffffff40" fontSize={11} label={{ value: 'Hours', angle: 90, position: 'insideRight', fill: '#999' }} />
                  <Tooltip contentStyle={{ backgroundColor: "#171717", borderColor: "#333" }} />
                  <Bar yAxisId="left" dataKey="logins" barSize={20} fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="activeHours" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Heatmap & Cohort Retention Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Heatmap Representation */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold tracking-wider text-white/50 uppercase mb-4 flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" /> Platform Usage Heatmap (Active Hour Density)
          </h3>
          <div className="grid grid-cols-8 gap-1.5 text-center text-xs font-semibold select-none">
            {/* Hour headers */}
            <div className="h-8 flex items-center justify-center text-white/30">Day</div>
            <div className="h-8 flex items-center justify-center text-white/50">08:00</div>
            <div className="h-8 flex items-center justify-center text-white/50">10:00</div>
            <div className="h-8 flex items-center justify-center text-white/50">12:00</div>
            <div className="h-8 flex items-center justify-center text-white/50">14:00</div>
            <div className="h-8 flex items-center justify-center text-white/50">16:00</div>
            <div className="h-8 flex items-center justify-center text-white/50">18:00</div>
            <div className="h-8 flex items-center justify-center text-white/50">20:00</div>

            {/* Row generation */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => {
              const dayValues = data?.heatmap?.filter((h) => h.day === day) || [];
              return (
                <React.Fragment key={day}>
                  <div className="h-8 flex items-center justify-center text-white/40 border-r border-white/5 font-semibold bg-white/5 rounded">
                    {day}
                  </div>
                  {dayValues.map((hv, idx) => {
                    // Density styling
                    const opacity = hv.value / 100;
                    return (
                      <div
                        key={idx}
                        className="h-8 rounded relative group flex items-center justify-center border border-white/5 bg-blue-500 transition-all hover:scale-105"
                        style={{ backgroundColor: `rgba(59, 130, 246, ${opacity})` }}
                      >
                        <span className="text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          {hv.value}%
                        </span>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-neutral-900 text-white text-[9px] rounded py-0.5 px-1.5 shadow border border-white/10 z-10 whitespace-nowrap">
                          {hv.value} Active Users
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Cohort retention widget */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold tracking-wider text-white/50 uppercase mb-4">
            Audience Cohort Retention
          </h3>
          <div className="space-y-4">
            {data?.retention?.map((cohort, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/60 font-semibold">{cohort.cohort}</span>
                  <span className="text-white font-bold">{cohort.rate}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cohort.rate}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
