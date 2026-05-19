import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, BookOpen, CurrencyDollar, TrendingUp, AlertCircle,
  CheckCircle2, Clock, DollarSign, UserPlus, Book, ArrowUpRight,
  ArrowDownRight, Activity, Shield, Bell, Settings, Eye, MoreVertical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { StatCard } from "../../../components/ui/StatCard";
import { Avatar } from "../../../components/ui/Avatar";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from "recharts";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const mockRevenueData = [
  { month: "Jan", revenue: 4200, enrollments: 120 },
  { month: "Feb", revenue: 5800, enrollments: 145 },
  { month: "Mar", revenue: 7200, enrollments: 180 },
  { month: "Apr", revenue: 6100, enrollments: 160 },
  { month: "May", revenue: 8900, enrollments: 210 },
  { month: "Jun", revenue: 9400, enrollments: 225 },
  { month: "Jul", revenue: 11200, enrollments: 280 },
  { month: "Aug", revenue: 10600, enrollments: 260 },
  { month: "Sep", revenue: 12300, enrollments: 310 },
  { month: "Oct", revenue: 14800, enrollments: 370 },
  { month: "Nov", revenue: 13200, enrollments: 340 },
  { month: "Dec", revenue: 16500, enrollments: 420 },
];

const mockUserGrowth = [
  { month: "Jan", teachers: 12, students: 245 },
  { month: "Feb", teachers: 15, students: 312 },
  { month: "Mar", teachers: 18, students: 410 },
  { month: "Apr", teachers: 22, students: 495 },
  { month: "May", teachers: 28, students: 580 },
  { month: "Jun", teachers: 35, students: 720 },
];

const mockCourseDistribution = [
  { name: "Published", value: 156, color: "#10b981" },
  { name: "Draft", value: 34, color: "#f59e0b" },
  { name: "Archived", value: 12, color: "#6b7280" },
];

const recentTransactions = [
  { id: 1, user: "Sarah Johnson", course: "Advanced JavaScript", amount: 99.99, date: "2 hours ago", status: "completed" },
  { id: 2, user: "Michael Chen", course: "Python for Data Science", amount: 149.99, date: "4 hours ago", status: "completed" },
  { id: 3, user: "Emma Davis", course: "UI/UX Design", amount: 79.99, date: "6 hours ago", status: "pending" },
  { id: 4, user: "James Wilson", course: "Machine Learning", amount: 199.99, date: "1 day ago", status: "completed" },
  { id: 5, user: "Lisa Brown", course: "React Native", amount: 129.99, date: "1 day ago", status: "refunded" },
];

const recentRegistrations = [
  { id: 1, name: "Dr. James Wilson", email: "james@university.edu", type: "Teacher", date: "Today", status: "pending" },
  { id: 2, name: "Maria Garcia", email: "maria@email.com", type: "Student", date: "Today", status: "approved" },
  { id: 3, name: "Prof. David Lee", email: "dlee@stanford.edu", type: "Teacher", date: "Yesterday", status: "pending" },
  { id: 4, name: "Anna Smith", email: "anna@email.com", type: "Student", date: "Yesterday", status: "approved" },
  { id: 5, name: "Robert Taylor", email: "rtaylor@email.com", type: "Student", date: "2 days ago", status: "approved" },
];

const systemAlerts = [
  { id: 1, type: "warning", message: "3 courses pending review", time: "1 hour ago" },
  { id: 2, type: "info", message: "2 new teacher applications", time: "3 hours ago" },
  { id: 3, type: "success", message: "Server performance nominal", time: "6 hours ago" },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated loading - in production would call getDashboardStats()
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const statsData = loading ? null : {
    totalRevenue: 125480,
    totalStudents: 2847,
    totalTeachers: 156,
    totalCourses: 202,
    activeUsers: 342,
    pendingApprovals: 8,
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Page Header */}
      <motion.div variants={item}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Platform overview and management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2"><Bell className="h-4 w-4" />Notifications</Button>
            <Button className="gap-2"><Settings className="h-4 w-4" />Settings</Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Revenue"
          value={statsData ? `$${(statsData.totalRevenue / 1000).toFixed(1)}K` : "—"}
          change="+12.5% from last month"
          changeType="positive"
          icon={CurrencyDollar}
          trend={75}
        />
        <StatCard
          title="Total Students"
          value={statsData?.totalStudents?.toLocaleString() || "—"}
          change="+8.2% this month"
          changeType="positive"
          icon={Users}
          trend={82}
        />
        <StatCard
          title="Total Teachers"
          value={statsData?.totalTeachers || "—"}
          change="+5 new this week"
          changeType="positive"
          icon={UserPlus}
        />
        <StatCard
          title="Total Courses"
          value={statsData?.totalCourses || "—"}
          change="+12 this month"
          changeType="positive"
          icon={BookOpen}
        />
        <StatCard
          title="Active Users"
          value={statsData?.activeUsers || "—"}
          change="Live right now"
          changeType="positive"
          icon={Activity}
        />
        <StatCard
          title="Pending Approvals"
          value={statsData?.pendingApprovals || "—"}
          change="需要审核"
          changeType="warning"
          icon={Clock}
        />
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Revenue Analytics</CardTitle>
            <div className="flex gap-2">
              {["Monthly", "Quarterly", "Yearly"].map((period, i) => (
                <Button key={period} variant={i === 0 ? "default" : "ghost"} size="sm" className="h-8 text-xs">
                  {period}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockRevenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                    }}
                    formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Course Distribution */}
        <Card>
          <CardHeader><CardTitle className="text-base">Course Status</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockCourseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockCourseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {mockCourseDistribution.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* User Growth Chart */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">User Growth</CardTitle>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-muted-foreground">Teachers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-muted-foreground">Students</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockUserGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                    }}
                  />
                  <Bar dataKey="teachers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="students" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />Recent Transactions
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8" fallback={tx.user.charAt(0)} />
                      <div>
                        <p className="text-sm font-medium">{tx.user}</p>
                        <p className="text-xs text-muted-foreground">{tx.course}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${tx.amount}</p>
                      <Badge
                        variant={tx.status === "completed" ? "success" : tx.status === "pending" ? "warning" : "destructive"}
                        className="text-xs"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Registrations */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <UserPlus className="h-4 w-4" />Recent Registrations
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs">View All</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentRegistrations.map((reg) => (
                  <div key={reg.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8" fallback={reg.name.charAt(0)} />
                      <div>
                        <p className="text-sm font-medium">{reg.name}</p>
                        <p className="text-xs text-muted-foreground">{reg.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={reg.type === "Teacher" ? "default" : "secondary"} className="text-xs mb-1">
                        {reg.type}
                      </Badge>
                      <p className="text-xs text-muted-foreground">{reg.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* System Alerts */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4" />System Alerts
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className={`p-1.5 rounded-full ${
                      alert.type === "warning" ? "bg-amber-100" :
                      alert.type === "success" ? "bg-emerald-100" : "bg-blue-100"
                    }`}>
                      {alert.type === "warning" ? (
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                      ) : alert.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Bell className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}