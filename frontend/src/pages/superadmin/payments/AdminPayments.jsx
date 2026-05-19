import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, Filter, Download, DollarSign, TrendingUp, CreditCard,
  ChevronLeft, ChevronRight, RefreshCw, Eye, CheckCircle2, XCircle,
  ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Card, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Avatar } from "../../../components/ui/Avatar";
import { Modal } from "../../../components/ui/Modal";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/Tabs";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

const mockPayments = [
  { _id: "1", courseId: "c1", courseTitle: "Advanced JavaScript", teacherName: "Dr. James Wilson", studentName: "Sarah Johnson", amount: 99.99, platformFee: 19.99, teacherEarning: 79.99, status: "completed", date: new Date("2024-06-15") },
  { _id: "2", courseId: "c2", courseTitle: "Python for Data Science", teacherName: "Prof. Emily Chen", studentName: "Michael Chen", amount: 149.99, platformFee: 29.99, teacherEarning: 119.99, status: "completed", date: new Date("2024-06-14") },
  { _id: "3", courseId: "c3", courseTitle: "UI/UX Design", teacherName: "Sarah Johnson", studentName: "Emma Davis", amount: 79.99, platformFee: 15.99, teacherEarning: 63.99, status: "pending", date: new Date("2024-06-14") },
  { _id: "4", courseId: "c1", courseTitle: "Advanced JavaScript", teacherName: "Dr. James Wilson", studentName: "James Wilson", amount: 99.99, platformFee: 19.99, teacherEarning: 79.99, status: "completed", date: new Date("2024-06-13") },
  { _id: "5", courseId: "c5", courseTitle: "React Native", teacherName: "Alex Turner", studentName: "Lisa Brown", amount: 129.99, platformFee: 25.99, teacherEarning: 103.99, status: "refunded", date: new Date("2024-06-12") },
];

const mockMonthlyRevenue = [
  { month: "Jan", revenue: 4200 }, { month: "Feb", revenue: 5800 }, { month: "Mar", revenue: 7200 },
  { month: "Apr", revenue: 6100 }, { month: "May", revenue: 8900 }, { month: "Jun", revenue: 9400 },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function AdminPayments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPayment, setSelectedPayment] = useState(null);

  const filteredPayments = mockPayments.filter(p => {
    const matchesSearch = p.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "completed") return matchesSearch && p.status === "completed";
    if (activeTab === "pending") return matchesSearch && p.status === "pending";
    if (activeTab === "refunded") return matchesSearch && p.status === "refunded";
    return matchesSearch;
  });

  const totalRevenue = mockPayments.filter(p => p.status === "completed").reduce((a, p) => a + p.amount, 0);
  const platformFees = mockPayments.filter(p => p.status === "completed").reduce((a, p) => a + p.platformFee, 0);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Payment Management</h1>
          <p className="text-muted-foreground">Track all transactions and revenue</p>
        </div>
        <Button variant="outline" className="gap-2"><Download className="h-4 w-4" />Export Report</Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `$${totalRevenue.toFixed(0)}`, change: "+12%", color: "emerald", icon: DollarSign },
          { label: "Platform Fees", value: `$${platformFees.toFixed(0)}`, change: "+8%", color: "blue", icon: TrendingUp },
          { label: "Transactions", value: mockPayments.filter(p => p.status === "completed").length, color: "purple", icon: CreditCard },
          { label: "Pending Payouts", value: mockPayments.filter(p => p.status === "pending").length, color: "amber", icon: RefreshCw },
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

      {/* Revenue Chart */}
      <motion.div variants={item}>
        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Revenue</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockMonthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} formatter={(v) => [`$${v.toLocaleString()}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search and Filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search transactions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" />Filters</Button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({mockPayments.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({mockPayments.filter(p => p.status === "completed").length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({mockPayments.filter(p => p.status === "pending").length})</TabsTrigger>
            <TabsTrigger value="refunded">Refunded ({mockPayments.filter(p => p.status === "refunded").length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Payments Table */}
      <motion.div variants={item}>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Transaction</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Platform Fee</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Teacher Earnings</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{payment.courseTitle}</p>
                      <p className="text-xs text-muted-foreground">{payment.teacherName} → {payment.studentName}</p>
                    </td>
                    <td className="px-4 py-3"><span className="font-medium">${payment.amount}</span></td>
                    <td className="px-4 py-3"><span className="text-muted-foreground">${payment.platformFee}</span></td>
                    <td className="px-4 py-3"><span className="text-emerald-600 font-medium">${payment.teacherEarning}</span></td>
                    <td className="px-4 py-3">
                      <Badge variant={payment.status === "completed" ? "success" : payment.status === "pending" ? "warning" : "destructive"}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3"><span className="text-sm text-muted-foreground">{payment.date.toLocaleDateString()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">Showing {filteredPayments.length} transactions</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm">1</Button>
              <Button variant="outline" size="sm"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}