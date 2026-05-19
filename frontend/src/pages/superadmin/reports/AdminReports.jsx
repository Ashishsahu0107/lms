import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Download, FileText, BarChart3, Users, BookOpen, DollarSign,
  Calendar, TrendingUp, ChevronLeft, ChevronRight, FileSpreadsheet,
  Printer, RefreshCw, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/Tabs";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

const mockUserReport = [
  { month: "Jan", students: 120, teachers: 8 },
  { month: "Feb", students: 145, teachers: 10 },
  { month: "Mar", students: 180, teachers: 12 },
  { month: "Apr", students: 210, teachers: 15 },
  { month: "May", students: 260, teachers: 18 },
  { month: "Jun", students: 320, teachers: 22 },
];

const mockCourseReport = [
  { category: "Programming", count: 45, revenue: 12500 },
  { category: "Design", count: 28, revenue: 8200 },
  { category: "Business", count: 22, revenue: 6800 },
  { category: "Data Science", count: 18, revenue: 9400 },
  { category: "Marketing", count: 15, revenue: 4500 },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate and export platform reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><FileSpreadsheet className="h-4 w-4" />Export CSV</Button>
          <Button variant="outline" className="gap-2"><Printer className="h-4 w-4" />Print Report</Button>
          <Button className="gap-2"><Download className="h-4 w-4" />Export PDF</Button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: "3,003", icon: Users, color: "blue" },
          { label: "Total Revenue", value: "$125,480", icon: DollarSign, color: "emerald" },
          { label: "Total Courses", value: "202", icon: BookOpen, color: "purple" },
          { label: "Avg Rating", value: "4.7", icon: TrendingUp, color: "amber" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <Tabs defaultValue="users" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="users">User Growth</TabsTrigger>
            <TabsTrigger value="courses">Course Analytics</TabsTrigger>
            <TabsTrigger value="financial">Financial Report</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Charts */}
      {activeTab === "users" && (
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">User Growth Over Time</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockUserReport}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                    <Area type="monotone" dataKey="students" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="teachers" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">User Distribution</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ name: "Students", value: 2847 }, { name: "Teachers", value: 156 }]} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                      <Cell fill="#3b82f6" /><Cell fill="#10b981" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === "courses" && (
        <motion.div variants={item}>
          <Card>
            <CardHeader><CardTitle className="text-base">Courses by Category</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockCourseReport}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="category" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                    <Bar dataKey="count" fill="#3b82f6" name="Courses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === "financial" && (
        <motion.div variants={item}>
          <Card>
            <CardHeader><CardTitle className="text-base">Revenue by Category</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCourseReport.map((row) => (
                  <div key={row.category} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="font-medium">{row.category}</span>
                    <span className="text-emerald-600 font-bold">${row.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === "engagement" && (
        <motion.div variants={item}>
          <Card>
            <CardHeader><CardTitle className="text-base">Platform Engagement Metrics</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { metric: "Avg. Course Rating", value: "4.7/5" },
                  { metric: "Completion Rate", value: "68%" },
                  { metric: "Daily Active Users", value: "342" },
                ].map((m, i) => (
                  <div key={i} className="text-center p-4 rounded-xl bg-muted/50">
                    <p className="text-2xl font-bold">{m.value}</p>
                    <p className="text-sm text-muted-foreground">{m.metric}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}