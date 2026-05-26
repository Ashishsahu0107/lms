import React from "react";
import { ChevronLeft, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

export default function QuizAnalytics({
  onBack,
  data,
}) {
  const quizScores = [
    { range: "0-50%", count: 18 },
    { range: "50-60%", count: 42 },
    { range: "60-70%", count: 95 },
    { range: "70-80%", count: 245 },
    { range: "80-90%", count: 520 },
    { range: "90-100%", count: 320 },
  ];

  const topQuizzes = [
    { title: "JavaScript Intermediate Scope", course: "Advanced JavaScript", attempts: 840, avgScore: "86.5%", passRate: "94%" },
    { title: "Pandas DataFrames Manipulation", course: "Python for Data Science", attempts: 620, avgScore: "78.2%", passRate: "89%" },
    { title: "Visual Hierarchies & Layouts", course: "UI/UX Design Fundamentals", attempts: 410, avgScore: "82.4%", passRate: "91%" },
    { title: "Linear Regressions Analysis", course: "Machine Learning Basics", attempts: 310, avgScore: "72.0%", passRate: "81%" },
  ];

  return (
    <div className="space-y-6" id="quiz-analytics-root">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
        <h2 className="text-lg font-bold text-foreground">Quiz & Score Distribution</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">Quiz Scores Range Spread (Total attempts)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizScores}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="range" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                  <Legend />
                  <Bar dataKey="count" fill="#8b5cf6" name="Total Submissions Count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-base font-bold text-foreground">Platform Quiz Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-600">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-xl">84.2%</h3>
                <p className="text-xs text-muted-foreground">Average Quiz Score Percentage</p>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Total Quiz Attempts</span>
                <span className="font-bold text-foreground">2,180</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Platform Passing rate</span>
                <span className="font-bold text-emerald-600">91.2%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">Failed/Retaken Quizzes</span>
                <span className="font-bold text-red-500">192</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Active Quizzes Auditing</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Quiz Template</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Parent Course</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Attempts Audited</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Avg accuracy</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Pass Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {topQuizzes.map((q, idx) => (
                  <tr key={idx} className="hover:bg-muted/10">
                    <td className="px-4 py-3 text-sm font-semibold">{q.title}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{q.course}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">{q.attempts}</td>
                    <td className="px-4 py-3 text-sm text-purple-600 font-bold">{q.avgScore}</td>
                    <td className="px-4 py-3 text-sm text-emerald-600 font-bold">{q.passRate}</td>
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
