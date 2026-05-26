import React from "react";
import { ChevronLeft, Users, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from "recharts";

export default function UserAnalytics({
  onBack,
  data,
}) {
  const defaultGrowth = [
    { month: "Jan", students: 180, teachers: 15 },
    { month: "Feb", students: 290, teachers: 22 },
    { month: "Mar", students: 420, teachers: 28 },
    { month: "Apr", students: 580, teachers: 35 },
    { month: "May", students: 840, teachers: 42 },
    { month: "Jun", students: 1100, teachers: 55 },
  ];

  const distribution = [
    { name: "Active Students", value: 920, color: "#3b82f6" },
    { name: "Inactive Students", value: 180, color: "#94a3b8" },
    { name: "Verified Instructors", value: 55, color: "#10b981" },
  ];

  const growthData = data?.userGrowthTrends || defaultGrowth;

  return (
    <div className="space-y-6" id="user-analytics-root">
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </Button>
        <h2 className="text-lg font-bold text-foreground">User Demographics & Growth</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">User Signups Growth (H1 2026)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                  <Legend />
                  <Line type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2.5} name="Students Registered" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="teachers" stroke="#10b981" strokeWidth={2} name="Teachers Onboarded" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">User Segmentation Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {distribution.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full mt-4 text-[10px] text-center font-medium">
              {distribution.map((d, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="h-2 w-2 rounded-full mx-auto" style={{ backgroundColor: d.color }} />
                  <p className="text-muted-foreground truncate">{d.name}</p>
                  <p className="font-bold text-foreground">{d.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cohort Acquisition Analysis</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Month</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Students Acquired</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Teachers Onboarded</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Active Daily Count</th>
                  <th className="px-4 py-3 text-xs font-semibold text-muted-foreground">Retention Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { m: "June 2026", s: 260, t: 13, active: "1,245", r: "96.4%" },
                  { m: "May 2026", s: 240, t: 8, active: "1,020", r: "94.2%" },
                  { m: "April 2026", s: 160, t: 7, active: "890", r: "91.8%" },
                  { m: "March 2026", s: 130, t: 6, active: "720", r: "89.5%" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/10">
                    <td className="px-4 py-3 text-sm font-semibold">{row.m}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground"><Badge variant="secondary">+{row.s} new</Badge></td>
                    <td className="px-4 py-3 text-sm text-muted-foreground"><Badge variant="outline">+{row.t} educators</Badge></td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">{row.active}</td>
                    <td className="px-4 py-3 text-sm text-emerald-600 font-bold">{row.r}</td>
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
