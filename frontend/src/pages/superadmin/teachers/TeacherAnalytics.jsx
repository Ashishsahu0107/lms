import {
  ChevronLeft,
  TrendingUp,
  Users,
  CheckCircle,
  BarChart3,
  Award,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TeacherAnalytics({ analyticsData = {}, onBack }) {
  const {
    totalTeachers = 0,
    activeTeachers = 0,
    performanceGrowth = [],
  } = analyticsData;

  return (
    <div className="space-y-6" id="teacher-analytics-root">
      <div className="flex items-center">
        <Button
          variant="ghost"
          className="gap-2 text-muted-foreground hover:text-foreground"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4" /> Back to Educators List
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border bg-card flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalTeachers}</p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Total Instructors
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl border bg-card flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{activeTeachers}</p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Active Educators
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl border bg-card flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">94%</p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Engagement Rate
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl border bg-card flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-600">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">4.8</p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Average Lesson Rating
            </p>
          </div>
        </div>
      </div>

      {/* Double charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trend */}
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Teacher Performance & Class Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceGrowth}>
                  <defs>
                    <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted/30"
                  />
                  <XAxis
                    dataKey="month"
                    className="text-xs text-muted-foreground font-medium"
                  />
                  <YAxis className="text-xs text-muted-foreground font-medium" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="engagement"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#engGrad)"
                    name="Engagement Rate (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Growth Trend */}
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-500" />
              Educator Course Deployments Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceGrowth}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted/30"
                  />
                  <XAxis
                    dataKey="month"
                    className="text-xs text-muted-foreground font-medium"
                  />
                  <YAxis className="text-xs text-muted-foreground font-medium" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                    }}
                  />
                  <Bar
                    dataKey="growth"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                    name="Courses Created"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
