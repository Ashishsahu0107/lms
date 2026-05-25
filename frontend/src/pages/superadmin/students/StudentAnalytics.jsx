import React from "react";
import { ChevronLeft, TrendingUp, Users, CheckCircle, Clock, BarChart3, Award } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function StudentAnalytics({
  analyticsData = {},
  onBack,
}) {
  const { totalStudents = 0, activeStudents = 0, learningTrend = [] } = analyticsData;

  return (
    <div className="space-y-6" id="student-analytics-root">
      <div className="flex items-center">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back to Students List
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border bg-card flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalStudents}</p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Enrolled</p>
          </div>
        </div>

        <div className="p-5 rounded-xl border bg-card flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">{activeStudents}</p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Active Students</p>
          </div>
        </div>

        <div className="p-5 rounded-xl border bg-card flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">58 Hrs</p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Average Study Hours</p>
          </div>
        </div>

        <div className="p-5 rounded-xl border bg-card flex items-center gap-4 hover:shadow-md transition-all">
          <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-600">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold">84%</p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Quiz Accuracy Mean</p>
          </div>
        </div>
      </div>

      {/* Double Dynamic Recharts layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Activity curve AreaChart */}
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Monthly Average Study commitment (Hours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={learningTrend}>
                  <defs>
                    <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                  <XAxis dataKey="month" className="text-xs text-muted-foreground font-medium" />
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
                    dataKey="studyHours"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#studyGrad)"
                    name="Study Commitment (Hrs)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Index and quiz Accuracy BarChart */}
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-500" />
              Average Class Attendance Rate (%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={learningTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                  <XAxis dataKey="month" className="text-xs text-muted-foreground font-medium" />
                  <YAxis domain={[80, 100]} className="text-xs text-muted-foreground font-medium" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                    }}
                  />
                  <Bar
                    dataKey="attendance"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                    name="Attendance Index (%)"
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
