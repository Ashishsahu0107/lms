import React from "react";
import { ChevronLeft, Clock, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

export default function EngagementAnalytics({
  onBack,
  data,
}) {
  const defaultTimeline = [
    { week: "Wk 1", time: 1.8, active: 310 },
    { week: "Wk 2", time: 2.1, active: 340 },
    { week: "Wk 3", time: 2.4, active: 380 },
    { week: "Wk 4", time: 2.2, active: 350 },
    { week: "Wk 5", time: 2.5, active: 410 },
    { week: "Wk 6", time: 2.7, active: 480 },
  ];

  const timelineData = data?.engagementTimeline || defaultTimeline;

  return (
    <div className="space-y-6" id="engagement-analytics-root">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
        <h2 className="text-lg font-bold text-foreground">Platform Activity & Engagement</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">Weekly Average Learning Hours & Active Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="week" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                  <Legend />
                  <Area type="monotone" dataKey="time" stroke="#ec4899" fill="#ec4899" fillOpacity={0.15} name="Learning Hours/Day" />
                  <Area type="monotone" dataKey="active" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} name="Active Students Count" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">Telemetry Benchmarks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3.5 rounded-xl bg-pink-500/10 text-pink-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl">2.4h</h3>
                <p className="text-xs text-muted-foreground">Average daily student learning session</p>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Daily Active Users (DAU)</span>
                <span className="font-bold text-foreground">412 students</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Monthly Active Users (MAU)</span>
                <span className="font-bold text-foreground">2,840 students</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Platform Completion Index</span>
                <span className="font-bold text-pink-600">68% Finished</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Acquisition Cohort Activity Metrics</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Cohort group</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Avg. lessons completed</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Avg. session length</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Monthly Retention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { cohort: "Q1 2026 Cohort", lessons: "24.5 lessons", session: "2.8 hrs/day", retention: "94.8%" },
                  { cohort: "Q4 2025 Cohort", lessons: "42.0 lessons", session: "2.5 hrs/day", retention: "91.2%" },
                  { cohort: "Q3 2025 Cohort", lessons: "68.2 lessons", session: "2.1 hrs/day", retention: "88.6%" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/10">
                    <td className="px-4 py-3 text-sm font-semibold">{row.cohort}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{row.lessons}</td>
                    <td className="px-4 py-3 text-sm text-foreground font-semibold">{row.session}</td>
                    <td className="px-4 py-3 text-sm text-emerald-600 font-bold">{row.retention}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
