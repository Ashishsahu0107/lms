import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign, TrendingUp, Award, Calendar, CreditCard, ArrowUpRight, Check, Activity
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { getLiveEarnings, getLiveRevenueStats } from "../../../services/teacherService";
import { useSocket } from "../../../context/SocketContext";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import toast from "react-hot-toast";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

export default function TeacherEarnings() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    thisMonth: 0,
    nextPayout: 0,
    activeSubscriptions: 0,
    transactions: [],
  });
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  const { socket } = useSocket();

  const loadEarningsTelemetry = async () => {
    try {
      setLoading(true);
      const [earningsRes, statsRes] = await Promise.all([
        getLiveEarnings(),
        getLiveRevenueStats(),
      ]);

      if (earningsRes && earningsRes.success) {
        setStats(earningsRes.data);
      }
      if (statsRes && statsRes.success) {
        setRevenueTrend(statsRes.data?.monthlyTrend || []);
      }
    } catch (err) {
      console.error("Error loading earnings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarningsTelemetry();
  }, []);

  // Socket Live Synchronizer
  useEffect(() => {
    if (!socket) return;

    const handleRevenueUpdated = (data) => {
      toast.success(`Live sync: Platform purchase complete! +$${data.amount || 150} earned!`, {
        icon: "💰",
        style: {
          borderRadius: "0.75rem",
          background: "hsl(var(--card))",
          color: "hsl(var(--foreground))",
          border: "1px solid hsl(var(--border))"
        }
      });
      loadEarningsTelemetry();
    };

    socket.on("paymentCompleted", handleRevenueUpdated);
    socket.on("revenueUpdated", handleRevenueUpdated);
    socket.on("payoutProcessed", loadEarningsTelemetry);

    return () => {
      socket.off("paymentCompleted", handleRevenueUpdated);
      socket.off("revenueUpdated", handleRevenueUpdated);
      socket.off("payoutProcessed", loadEarningsTelemetry);
    };
  }, [socket]);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8"
      id="teacher-earnings-module-container"
    >
      {/* Header Panel */}
      <motion.div variants={item} className="flex items-center justify-between border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
            Real-Time Revenue Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor dynamic course sales, student subscription shares, and transaction history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-muted-foreground">Sockets Live</span>
        </div>
      </motion.div>

      {/* Loading states */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border">
              <CardContent className="h-24 bg-muted/20" />
            </Card>
          ))}
        </div>
      ) : (
        /* Stats Cards */
        <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Earnings", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "amber" },
            { label: "This Month", value: `$${stats.thisMonth.toLocaleString()}`, icon: TrendingUp, color: "emerald" },
            { label: "Pending Payout", value: `$${stats.nextPayout.toLocaleString()}`, icon: CreditCard, color: "indigo" },
            { label: "Active Subscriptions", value: stats.activeSubscriptions, icon: Award, color: "amber" },
          ].map((stat, i) => (
            <Card key={i} className="border-border hover:shadow-md transition-all bg-card">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 bg-${stat.color}-500/10 text-${stat.color}-500 rounded-xl`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Charts Row */}
      {revenueTrend.length > 0 && (
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recharts Area Chart */}
          <Card className="lg:col-span-2 border-border hover:shadow-md transition-all">
            <CardHeader>
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-amber-500" /> Revenue Growth Timeline ($)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend}>
                    <defs>
                      <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis dataKey="month" className="text-xs text-muted-foreground font-semibold" />
                    <YAxis className="text-xs text-muted-foreground font-semibold" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} formatter={(value) => [`$${value}`, "Earnings"]} />
                    <Area type="monotone" dataKey="earnings" stroke="#f59e0b" strokeWidth={2.5} fill="url(#earningsGradient)" name="Monthly Revenue ($)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Earnings Bar Graph */}
          <Card className="border-border hover:shadow-md transition-all bg-card">
            <CardHeader>
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" /> Monthly sales Target
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis dataKey="month" className="text-xs text-muted-foreground font-semibold" />
                    <YAxis className="text-xs text-muted-foreground font-semibold" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }} />
                    <Bar dataKey="earnings" fill="#10b981" radius={[4, 4, 0, 0]} name="Sales Volume" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Recent Sales / Transactions Table */}
      <motion.div variants={item}>
        <Card className="border-border shadow-md overflow-hidden bg-card">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-bold text-foreground">Recent Enrollments Transactions</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-5 py-4 text-xs font-semibold text-muted-foreground">Transaction ID</th>
                  <th className="px-5 py-4 text-xs font-semibold text-muted-foreground">Course Name</th>
                  <th className="px-5 py-4 text-xs font-semibold text-muted-foreground">Student Enrolled</th>
                  <th className="px-5 py-4 text-xs font-semibold text-muted-foreground">Amount Paid</th>
                  <th className="px-5 py-4 text-xs font-semibold text-muted-foreground">Transaction Date</th>
                  <th className="px-5 py-4 text-xs font-semibold text-muted-foreground text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-5 py-4 text-sm font-semibold text-primary">{tx.id.substring(0, 8)}</td>
                    <td className="px-5 py-4 text-sm font-bold text-foreground">{tx.course}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{tx.student}</td>
                    <td className="px-5 py-4 text-sm font-extrabold text-emerald-600">${tx.amount}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-muted-foreground flex items-center gap-1 select-none font-medium">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {tx.date}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Badge variant="success" className="gap-1 border-0 font-semibold px-2 py-0.5 text-[9px] uppercase tracking-wider">
                        <Check className="h-3 w-3" /> Completed
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}


