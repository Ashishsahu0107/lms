import { useState, useEffect } from "react";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Star,
  HelpCircle,
  FileCheck,
  Clock,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getPerformanceAnalytics } from "../../../services/adminAnalyticsService";
import AnalyticsCard from "./components/AnalyticsCard";
import FilterSystem from "./components/FilterSystem";
import ExportFeatures from "./components/ExportFeatures";

export default function PerformanceAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getPerformanceAnalytics(filters);
      if (res && res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load performance academic analytics:", err);
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

  const COLORS = ["#10B981", "#EF4444"];
  const DIST_COLORS = ["#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444"];

  const pieData = data
    ? [
        { name: "Passed (>=60%)", value: data.metrics.passRate },
        { name: "Failed (<60%)", value: data.metrics.failRate },
      ]
    : [
        { name: "Passed (>=60%)", value: 85 },
        { name: "Failed (<60%)", value: 15 },
      ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" /> Quiz & Assignment
            Academic Performance
          </h2>
          <p className="text-xs text-white/50">
            Analyze student quiz accuracy, pass/fail compliance margins,
            assignment ratios, and top student rankings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data?.leaderboard && (
            <ExportFeatures
              data={data.leaderboard}
              title="Students Leaderboard Rankings"
              csvHeaders={[
                "name",
                "email",
                "avgScore",
                "avgAccuracy",
                "quizzesAttempted",
                "completedCourses",
              ]}
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

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <AnalyticsCard
          title="Avg Quiz Accuracy"
          value={`${data?.metrics?.avgQuizAccuracy ?? 0}%`}
          trendValue="Overall accuracy"
          trendDirection="up"
          color="blue"
          icon={HelpCircle}
          loading={loading}
        />
        <AnalyticsCard
          title="Quiz Pass Rate"
          value={`${data?.metrics?.passRate ?? 0}%`}
          trendValue="Target 80%"
          trendDirection="up"
          color="emerald"
          icon={CheckCircle2}
          loading={loading}
        />
        <AnalyticsCard
          title="Submission Rate"
          value={`${data?.metrics?.submissionRate ?? 0}%`}
          trendValue="Submitted count"
          trendDirection="up"
          color="purple"
          icon={FileCheck}
          loading={loading}
        />
        <AnalyticsCard
          title="Average Grade"
          value={`${data?.metrics?.averageGrade ?? 0}/100`}
          trendValue="Graded works"
          trendDirection="up"
          color="amber"
          icon={Trophy}
          loading={loading}
        />
        <AnalyticsCard
          title="Late Submissions"
          value={data?.metrics?.lateSubmissionsCount ?? 0}
          trendValue="Past deadline"
          trendDirection="down"
          color="rose"
          icon={Clock}
          loading={loading}
        />
        <AnalyticsCard
          title="Pending Grading"
          value={data?.metrics?.pendingSubmissions ?? 0}
          trendValue="Teacher action"
          trendDirection="up"
          color="blue"
          icon={XCircle}
          loading={loading}
        />
      </div>

      {/* Charts Panel Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quiz Attempts Trend */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold tracking-wider text-white/50 uppercase mb-4 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-400" /> Quiz Attempts
            Trend
          </h3>
          <div className="h-80 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-white/30">
                Loading attempts trend...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.attemptsTrend}>
                  <defs>
                    <linearGradient
                      id="attemptsGlow"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="date" stroke="#ffffff40" fontSize={11} />
                  <YAxis stroke="#ffffff40" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#171717",
                      borderColor: "#333",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="attempts"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#attemptsGlow)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Pass/Fail Ratio Pie */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold tracking-wider text-white/50 uppercase mb-4">
            Pass / Fail Ratio Split
          </h3>
          <div className="h-80 w-full flex items-center justify-center relative">
            {loading ? (
              <div className="text-white/30">Loading ratios...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#171717",
                      borderColor: "#333",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute top-[37%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-2xl font-black text-white">
                {data?.metrics?.passRate}%
              </span>
              <p className="text-[10px] text-white/40 uppercase font-semibold">
                Pass Compliance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Panel Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quiz Distribution */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold tracking-wider text-white/50 uppercase mb-4 flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-amber-400" /> Quiz Grade Accuracy
            Distribution
          </h3>
          <div className="h-80 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-white/30">
                Loading score distributions...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.quizDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="range" stroke="#ffffff40" fontSize={11} />
                  <YAxis stroke="#ffffff40" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#171717",
                      borderColor: "#333",
                    }}
                  />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
                    {data?.quizDistribution?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DIST_COLORS[index % DIST_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Most Difficult Questions */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-white/50 uppercase mb-4 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-rose-500" /> Most Difficult
              Questions
            </h3>
            <div className="space-y-4">
              {loading ? (
                <div className="text-white/30 text-center py-12">
                  Loading difficult questions...
                </div>
              ) : !data?.mostDifficultQuestions ||
                data.mostDifficultQuestions.length === 0 ? (
                <div className="text-white/30 text-center py-12">
                  No questions data available.
                </div>
              ) : (
                data.mostDifficultQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-white/5 bg-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white/90">
                        {q.questionText}
                      </p>
                      <span className="text-xs text-white/40">
                        {q.quizTitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <div className="text-right">
                        <span className="text-sm font-bold text-rose-400">
                          {q.failureRate}%
                        </span>
                        <p className="text-[10px] text-white/40 uppercase">
                          Failure Rate
                        </p>
                      </div>
                      <div className="w-16 bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-rose-500 h-1.5 rounded-full"
                          style={{ width: `${q.failureRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs text-white/40">
              💡 Tip: Review concepts related to these questions to optimize
              curriculum performance.
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard Table (Student Rankings) */}
      <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden backdrop-blur-xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wider text-white/50 uppercase flex items-center gap-1.5">
            <Star className="h-4 w-4 text-amber-400" /> Academic Hall of Fame
            (Top Student Rankings)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-white/5 text-xs text-white/40 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6 text-center">Rank</th>
                <th className="py-3 px-6">Student name</th>
                <th className="py-3 px-6">Student email</th>
                <th className="py-3 px-6 text-center">Avg Quiz Score</th>
                <th className="py-3 px-6 text-center">Avg Accuracy</th>
                <th className="py-3 px-6 text-center">Quizzes Taken</th>
                <th className="py-3 px-6 text-center">Completed Courses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-white/30">
                    Loading leaderboards...
                  </td>
                </tr>
              ) : data?.leaderboard?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-white/30">
                    No quiz submissions record found.
                  </td>
                </tr>
              ) : (
                data?.leaderboard?.map((student, index) => (
                  <tr
                    key={index}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center">
                        <span
                          className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            index === 0
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : index === 1
                                ? "bg-slate-300/20 text-slate-300 border border-slate-300/30"
                                : index === 2
                                  ? "bg-amber-700/20 text-amber-600 border border-amber-700/30"
                                  : "bg-white/5 text-white/60"
                          }`}
                        >
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-white">
                      {student.name}
                    </td>
                    <td className="py-4 px-6 text-white/50">{student.email}</td>
                    <td className="py-4 px-6 text-center font-bold text-blue-400">
                      {student.avgScore}/100
                    </td>
                    <td className="py-4 px-6 text-center font-black text-emerald-400">
                      {student.avgAccuracy}%
                    </td>
                    <td className="py-4 px-6 text-center text-white/60">
                      {student.quizzesAttempted}
                    </td>
                    <td className="py-4 px-6 text-center font-semibold text-purple-400">
                      {student.completedCourses} courses
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
