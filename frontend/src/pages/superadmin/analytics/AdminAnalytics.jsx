import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, BookOpen, DollarSign, Target, Clock,
  ArrowUpRight, ArrowDownRight, Download, RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/Tabs";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";

const mockOverviewTrend = [
  { month: "Jan", users: 1200, revenue: 4200 },
  { month: "Feb", users: 1450, revenue: 5800 },
  { month: "Mar", users: 1800, revenue: 7200 },
  { month: "Apr", users: 2100, revenue: 6100 },
  { month: "May", users: 2600, revenue: 8900 },
  { month: "Jun", users: 3200, revenue: 9400 },
];

const mockEnrollmentTrend = [
  { month: "Jan", enrollments: 340 },
  { month: "Feb", enrollments: 420 },
  { month: "Mar", enrollments: 510 },
  { month: "Apr", enrollments: 580 },
  { month: "May", enrollments: 680 },
  { month: "Jun", enrollments: 780 },
];

const mockCategoryDistribution = [
  { name: "Programming", value: 35, color: "#3b82f6" },
  { name: "Design", value: 25, color: "#10b981" },
  { name: "Business", value: 18, color: "#f59e0b" },
  { name: "Data Science", value: 15, color: "#8b5cf6" },
  { name: "Marketing", value: 7, color: "#ec4899" },
];

const topPerformingCourses = [
  { title: "Advanced JavaScript", students: 1245, revenue: 45680, rating: 4.8, completion: 72 },
  { title: "Python for Data Science", students: 890, revenue: 32450, rating: 4.9, completion: 65 },
  { title: "UI/UX Design Fundamentals", students: 567, revenue: 18230, rating: 4.7, completion: 58 },
  { title: "Machine Learning Basics", students: 432, revenue: 15670, rating: 4.6, completion: 45 },
  { title: "React Native Development", students: 789, revenue: 28900, rating: 4.8, completion: 68 },
];

const engagementMetrics = [
  { metric: "Avg. Time on Platform", value: "2.4h/day", change: "+12%", positive: true },
  { metric: "Course Completion Rate", value: "68%", change: "+5%", positive: true },
  { metric: "Avg. Quiz Score", value: "82%", change: "+3%", positive: true },
  { metric: "Retention Rate", value: "91%", change: "-2%", positive: false },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground">Deep dive into platform performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" />Refresh</Button>
          <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Export</Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {engagementMetrics.map((metric, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{metric.metric}</p>
              <div className="flex items-end justify-between mt-2">
                <p className="text-2xl font-bold">{metric.value}</p>
                <Badge variant={metric.positive ? "success" : "destructive"} className="gap-1">
                  {metric.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {metric.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">User Growth & Revenue Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockOverviewTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="users" stroke="#3b82f6" name="Users" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue ($)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Course Category Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={mockCategoryDistribution} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {mockCategoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={item}>
        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Enrollments</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockEnrollmentTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                  <Area type="monotone" dataKey="enrollments" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Performing Courses */}
      <motion.div variants={item}>
        <Card>
          <CardHeader><CardTitle className="text-base">Top Performing Courses</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Course</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Students</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Revenue</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Rating</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Completion</th>
                  </tr>
                </thead>
                <tbody>
                  {topPerformingCourses.map((course, i) => (
                    <tr key={i} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3"><p className="font-medium">{course.title}</p></td>
                      <td className="px-4 py-3"><Badge variant="secondary">{course.students.toLocaleString()}</Badge></td>
                      <td className="px-4 py-3"><span className="text-emerald-600 font-medium">${course.revenue.toLocaleString()}</span></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1"><Target className="h-4 w-4 text-amber-500" />{course.rating}</div></td>
                      <td className="px-4 py-3">
                        <div className="w-24">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${course.completion}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{course.completion}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}