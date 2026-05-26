import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, BookOpen, DollarSign, Target, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

export default function AnalyticsDashboard({
  data,
  onNavigateToView,
}) {
  const mockOverviewTrend = [
    { month: "Jan", users: 1200, revenue: 4200 },
    { month: "Feb", users: 1450, revenue: 5800 },
    { month: "Mar", users: 1800, revenue: 7200 },
    { month: "Apr", users: 2100, revenue: 6100 },
    { month: "May", users: 2600, revenue: 8900 },
    { month: "Jun", users: 3200, revenue: 9400 },
  ];

  const mockCategoryDistribution = [
    { name: "Programming", value: 35, color: "#3b82f6" },
    { name: "Design", value: 25, color: "#10b981" },
    { name: "Business", value: 18, color: "#f59e0b" },
    { name: "Data Science", value: 15, color: "#8b5cf6" },
    { name: "Marketing", value: 7, color: "#ec4899" },
  ];

  const categories = [
    { id: "users", label: "User Demographics", icon: Users, desc: "Audit active students, teachers, and growth metrics.", color: "blue" },
    { id: "courses", label: "Course Curriculum", icon: BookOpen, desc: "Detailed breakdown of syllabus creation & pricing.", color: "indigo" },
    { id: "quizzes", label: "Quiz & Grades", icon: Target, desc: "Evaluate student score distributions and quiz completions.", color: "purple" },
    { id: "engagement", label: "Student Engagement", icon: Activity, desc: "Track average active hours, retention, and completions.", color: "rose" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6" id="analytics-dashboard-root">
      {/* Cards */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Platform Users", value: data?.usersCount || "3,250", change: "+12.5%", icon: Users, color: "blue" },
          { label: "Active Courses", value: data?.coursesCount || "245", change: "+8.4%", icon: BookOpen, color: "indigo" },
          { label: "Total Platform Revenue", value: `$${(data?.revenueTotal || 128450).toLocaleString()}`, change: "+18.2%", icon: DollarSign, color: "emerald" },
          { label: "Avg. Student Grade", value: `${data?.avgGrade || 84}%`, change: "+2.1%", icon: Target, color: "purple" },
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-all border border-border">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Charts Row */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Revenue & User Signups Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockOverviewTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                  <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} name="Users Signed Up" />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.15} name="Revenue ($)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="text-base text-foreground">Course Category Shares</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockCategoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {mockCategoryDistribution.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Navigating Blocks */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card key={cat.id} className="p-5 flex flex-col justify-between hover:shadow-lg hover:border-blue-500/20 border transition-all h-full bg-card">
              <div className="space-y-3">
                <div className={`p-2.5 w-fit rounded-lg bg-${cat.color}-500/10 text-${cat.color}-500`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-sm text-foreground">{cat.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{cat.desc}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4 text-xs font-semibold"
                onClick={() => onNavigateToView(cat.id)}
              >
                Inspect Telemetry
              </Button>
            </Card>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
