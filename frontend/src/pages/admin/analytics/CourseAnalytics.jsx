import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, GraduationCap, Clock, AlertTriangle, RefreshCw, BarChart2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList } from "recharts";
import { getCourseAnalytics } from "../../../services/adminAnalyticsService";
import AnalyticsCard from "./components/AnalyticsCard";
import FilterSystem from "./components/FilterSystem";
import ExportFeatures from "./components/ExportFeatures";

export default function CourseAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getCourseAnalytics(filters);
      if (res && res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load course analytics:", err);
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

  const COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" /> Course Health & Completion Funnels
          </h2>
          <p className="text-xs text-white/50">Analyze which courses attract the highest enrollments and monitor dropout rates.</p>
        </div>
        <div className="flex items-center gap-2">
          {data?.popularCourses && (
            <ExportFeatures
              data={data.popularCourses}
              title="Course Popularity Analytics"
              csvHeaders={["title", "teacherName", "enrollments", "completionRate"]}
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

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Total Enrollments"
          value={data?.metrics?.totalEnrollments ?? 0}
          trendValue="+12% growth"
          trendDirection="up"
          color="blue"
          icon={GraduationCap}
          loading={loading}
        />
        <AnalyticsCard
          title="Avg Completion Rate"
          value={`${data?.metrics?.avgCompletionRate ?? 0}%`}
          trendValue="+4% progress"
          trendDirection="up"
          color="emerald"
          icon={BookOpen}
          loading={loading}
        />
        <AnalyticsCard
          title="Avg Daily Active Hours"
          value={`${data?.metrics?.avgActiveHours ?? 0}h`}
          trendValue="+1.2h growth"
          trendDirection="up"
          color="amber"
          icon={Clock}
          loading={loading}
        />
        <AnalyticsCard
          title="Dropout Danger Flag"
          value={`${data?.metrics?.dropoutRate ?? 0}%`}
          trendValue="-2% drop"
          trendDirection="down"
          color="rose"
          icon={AlertTriangle}
          loading={loading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popularity Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold tracking-wider text-white/50 uppercase mb-4 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-blue-400" /> Enrollment Trends & Syllabus Popularity
          </h3>
          <div className="h-80 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-white/30">Loading course stats...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.popularCourses}>
                  <CartesianGrid stroke="#ffffff08" strokeDasharray="3 3" />
                  <XAxis dataKey="title" stroke="#ffffff40" fontSize={9} tickFormatter={(tick) => tick.substring(0, 15) + "..."} />
                  <YAxis stroke="#ffffff40" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: "#171717", borderColor: "#333" }} />
                  <Bar dataKey="enrollments" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
                    {data?.popularCourses?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Completion Funnel Chart */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold tracking-wider text-white/50 uppercase mb-4">
            Active Completion Funnel
          </h3>
          <div className="h-80 w-full flex items-center justify-center">
            {loading ? (
              <div className="text-white/30">Loading funnel...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip contentStyle={{ backgroundColor: "#171717", borderColor: "#333" }} />
                  <Funnel data={data?.completionFunnel} dataKey="count" nameKey="name">
                    <LabelList position="right" fill="#fff" stroke="none" dataKey="name" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Courses Detailed List Table */}
      <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden backdrop-blur-xl">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-sm font-semibold tracking-wider text-white/50 uppercase">
            Top Performing Course Catalogue
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-white/5 text-xs text-white/40 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Course Name</th>
                <th className="py-3 px-6">Instructor Name</th>
                <th className="py-3 px-6 text-center">Enrolled Students</th>
                <th className="py-3 px-6 text-center">Avg Progress Rate</th>
                <th className="py-3 px-6 text-center">Retail Price</th>
                <th className="py-3 px-6 text-center">Publishing State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-white/30">Loading courses matrix...</td>
                </tr>
              ) : data?.popularCourses?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-white/30">No courses match selected filters.</td>
                </tr>
              ) : (
                data?.popularCourses?.map((course) => (
                  <tr key={course.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-semibold text-white">{course.title}</td>
                    <td className="py-4 px-6 text-white/60">{course.teacherName}</td>
                    <td className="py-4 px-6 text-center font-bold text-blue-400">{course.enrollments}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-bold text-emerald-400">{course.completionRate}%</span>
                        <div className="w-16 bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${course.completionRate}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center font-semibold text-amber-400">${course.price}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        course.status === "published"
                          ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                          : "bg-amber-500/20 border border-amber-500/30 text-amber-400"
                      }`}>
                        {course.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
