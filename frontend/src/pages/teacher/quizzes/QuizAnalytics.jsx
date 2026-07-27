import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  Users,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { getQuizAnalytics } from "../../../services/quizService";
import { Card, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import toast from "react-hot-toast";

const COLORS = ["#EF4444", "#F59E0B", "#3B82F6", "#8B5CF6", "#10B981"];

export default function QuizAnalytics() {
  const { id } = useParams(); // quizId
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await getQuizAnalytics(id);
        if (res.data?.success) {
          setAnalytics(res.data.data);
        } else {
          toast.error("Failed to load quiz analytics");
        }
      } catch (err) {
        console.error("Error fetching quiz analytics:", err);
        toast.error("Error preparing quiz metrics calculations");
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [id]);

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[70vh] gap-4"
        id="quiz-analytics-loading"
      >
        <div className="loading loading-spinner loading-lg text-primary"></div>
        <p className="text-sm text-muted-foreground animate-pulse">
          Computing scoring aggregates and student leaderboard...
        </p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-20 bg-base-100 rounded-3xl border border-base-300 shadow-xl max-w-lg mx-auto mt-10">
        <HelpCircle className="mx-auto mb-4 h-16 w-16 text-warning animate-bounce" />
        <h2 className="text-2xl font-bold mb-2">Metrics Empty</h2>
        <p className="text-muted-foreground text-sm mb-6">
          No completed attempts recorded to analyze yet.
        </p>
        <Button onClick={() => navigate(-1)} className="rounded-2xl gap-2">
          <ArrowLeft className="h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  // Format Recharts data
  const chartData = Object.keys(analytics.scoreBuckets).map((bucket) => ({
    name: bucket,
    count: analytics.scoreBuckets[bucket],
  }));

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-8" id="quiz-analytics-workspace">
      {/* HEADER CONTROLS */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="rounded-2xl gap-2 hover:bg-base-200 border border-base-300"
          id="quiz-analytics-back-btn"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Quizzes
        </Button>

        <span className="badge badge-primary gap-1 py-3 px-3 rounded-full text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Metrics Dashboard
        </span>
      </div>

      {/* QUICK STATS PANELS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        <Card className="border border-base-300 shadow-lg hover:shadow-xl transition-all rounded-3xl bg-base-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-primary/10 text-primary rounded-2xl">
              <TrendingUp className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Total Attempts
              </p>
              <h3 className="text-2xl font-extrabold text-foreground">
                {analytics.totalAttempts} Attempts
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-base-300 shadow-lg hover:shadow-xl transition-all rounded-3xl bg-base-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-success/10 text-success rounded-2xl">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Unique Students
              </p>
              <h3 className="text-2xl font-extrabold text-foreground">
                {analytics.uniqueStudents} Learners
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-base-300 shadow-lg hover:shadow-xl transition-all rounded-3xl bg-base-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-warning/10 text-warning rounded-2xl">
              <Award className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Average Grade Score
              </p>
              <h3 className="text-2xl font-extrabold text-foreground">
                {analytics.averageScore} Marks
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-base-300 shadow-lg hover:shadow-xl transition-all rounded-3xl bg-base-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-secondary/10 text-secondary rounded-2xl">
              <CheckCircle className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Quiz Pass Rate
              </p>
              <h3 className="text-2xl font-extrabold text-foreground">
                {analytics.passRate}% Rate
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CHARTS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SCORE SPREAD CHART */}
        <div className="lg:col-span-2">
          <Card className="border border-base-300 bg-base-100 shadow-2xl rounded-3xl overflow-hidden h-[420px]">
            <div className="p-6 bg-base-200 border-b border-base-300">
              <h3 className="font-extrabold text-sm text-foreground">
                Score Frequency Distribution
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Quantity of attempts falling inside score percentiles.
              </p>
            </div>
            <CardContent className="p-6 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#1F2937",
                      border: "none",
                      borderRadius: "12px",
                      color: "#FFFFFF",
                      fontSize: "11px",
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* QUIZ ATTEMPTS LEADERBOARD */}
        <div className="lg:col-span-1">
          <Card className="border border-base-300 bg-base-100 shadow-2xl rounded-3xl overflow-hidden h-[420px]">
            <div className="p-6 bg-base-200 border-b border-base-300 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-foreground">
                  Learners Leaderboard
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Top performing student attempts.
                </p>
              </div>
              <span className="badge badge-warning rounded-lg text-[10px] font-black py-2 px-2">
                Top 10
              </span>
            </div>
            <CardContent className="p-4 overflow-y-auto h-[320px] space-y-3">
              {analytics.leaderboard.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-20">
                  Leaderboard empty.
                </p>
              ) : (
                analytics.leaderboard.map((item, idx) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between bg-base-200 p-3 rounded-2xl border border-base-300 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank badge */}
                      <span
                        className={`w-6 h-6 rounded-lg font-black flex items-center justify-center text-xs ${
                          idx === 0
                            ? "bg-warning/25 text-amber-700"
                            : idx === 1
                              ? "bg-slate-300 text-slate-800"
                              : idx === 2
                                ? "bg-orange-200 text-orange-800"
                                : "bg-base-300 text-muted-foreground"
                        }`}
                      >
                        #{idx + 1}
                      </span>

                      <div className="avatar placeholder">
                        <div className="w-8 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                          {item.studentId?.name?.charAt(0) || "S"}
                        </div>
                      </div>

                      <div className="space-y-0.5 max-w-[110px]">
                        <span className="block font-bold text-foreground truncate">
                          {item.studentId?.name}
                        </span>
                        <span className="block text-[10px] text-muted-foreground font-mono">
                          {formatDuration(item.timeSpent)}
                        </span>
                      </div>
                    </div>

                    <span className="font-mono font-bold text-success text-sm">
                      {item.score} pts
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FULL STUDENT COMPLETED ATTEMPTS TABLE */}
      <Card
        className="border border-base-300 bg-base-100 shadow-2xl rounded-3xl overflow-hidden"
        id="analytics-attempts-log"
      >
        <div className="p-6 bg-base-200 border-b border-base-300">
          <h3 className="font-extrabold text-sm text-foreground">
            Completed Exam Attempts Log
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Comprehensive audit history of all learners completions.
          </p>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="table w-full text-xs">
              <thead>
                <tr className="border-b border-base-300 bg-base-200/20 text-muted-foreground">
                  <th>Student</th>
                  <th>Submitted Timestamp</th>
                  <th>Accuracy %</th>
                  <th>Duration Spent</th>
                  <th>Score Grade</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {analytics.attemptsHistory.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground italic"
                    >
                      No attempts registered in history logs yet.
                    </td>
                  </tr>
                ) : (
                  analytics.attemptsHistory.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-base-200 hover:bg-base-200/40 transition-colors"
                    >
                      <td className="font-bold flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="w-8 rounded-full bg-primary/25 text-primary text-[10px] font-bold flex items-center justify-center">
                            {item.studentId?.name?.charAt(0) || "S"}
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <span className="block font-bold text-foreground">
                            {item.studentId?.name}
                          </span>
                          <span className="block text-[10px] text-muted-foreground">
                            {item.studentId?.email}
                          </span>
                        </div>
                      </td>
                      <td className="text-muted-foreground font-semibold">
                        {new Date(item.submittedAt).toLocaleString()}
                      </td>
                      <td>
                        <span className="badge badge-outline border-primary/20 text-primary text-[10px] font-bold py-2 px-2.5 rounded-xl">
                          {item.accuracy}% Accuracy
                        </span>
                      </td>
                      <td className="font-mono text-muted-foreground font-semibold">
                        {formatDuration(item.timeSpent)}
                      </td>
                      <td className="font-bold text-success text-sm">
                        {item.score} Marks
                      </td>
                      <td className="text-right">
                        <Button
                          onClick={() =>
                            navigate(`/student/quizzes/result/${item._id}`)
                          }
                          className="btn btn-sm btn-ghost hover:btn-primary text-[10px] rounded-xl"
                        >
                          Audit review{" "}
                          <ChevronRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
