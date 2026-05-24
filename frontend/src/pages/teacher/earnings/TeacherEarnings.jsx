import React from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, Award, Calendar, CreditCard, ArrowUpRight
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const earningsData = [
  { month: "Jan", earnings: 3800 },
  { month: "Feb", earnings: 4200 },
  { month: "Mar", earnings: 5100 },
  { month: "Apr", earnings: 4700 },
  { month: "May", earnings: 6200 },
  { month: "Jun", earnings: 5900 },
];

const transactions = [
  { id: "TX1001", course: "Advanced JavaScript Course", student: "Emma Thompson", amount: 150, date: "May 22, 2026", status: "completed" },
  { id: "TX1002", course: "Python Fundamentals", student: "Michael Chen", amount: 120, date: "May 20, 2026", status: "completed" },
  { id: "TX1003", course: "UI/UX Mobile Design Boot", student: "Sofia Rodriguez", amount: 200, date: "May 18, 2026", status: "completed" },
  { id: "TX1004", course: "React Development", student: "James Wilson", amount: 180, date: "May 15, 2026", status: "completed" },
];

export default function TeacherEarnings() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
      id="teacher-earnings-module-container"
    >
      {/* Header Panel */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Earnings & Revenue</h1>
        <p className="text-sm text-muted-foreground">Monitor course sales, student subscription shares, and transaction history.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-muted shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl"><DollarSign className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <h3 className="text-xl font-bold">$29,900</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl"><TrendingUp className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-muted-foreground">This Month</p>
              <h3 className="text-xl font-bold text-emerald-600">$5,900</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl"><CreditCard className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Next Payout</p>
              <h3 className="text-xl font-bold">$4,250</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl"><Award className="h-6 w-6" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Active Subscriptions</p>
              <h3 className="text-xl font-bold">34</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recharts Area Chart */}
      <Card className="border-muted shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Earning Trends <Badge variant="secondary" className="gap-1 border-0"><TrendingUp className="h-3 w-3" /> +18% Growth</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsData}>
                <defs>
                  <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                  }}
                  formatter={(value) => [`$${value}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2.5}
                  fill="url(#earningsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sales / Transactions Table */}
      <Card className="border-muted shadow-md overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle>Recent Enrollments Transactions</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="border-b border-muted">
                <th>Transaction ID</th>
                <th>Course Name</th>
                <th>Student</th>
                <th>Amount</th>
                <th>Date</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-muted/50 hover:bg-primary/5 transition-colors">
                  <td><span className="font-semibold text-primary">{tx.id}</span></td>
                  <td><span className="font-medium text-foreground">{tx.course}</span></td>
                  <td><span className="text-sm text-muted-foreground">{tx.student}</span></td>
                  <td><span className="font-bold text-sm text-foreground">${tx.amount}</span></td>
                  <td>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 select-none">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {tx.date}
                    </span>
                  </td>
                  <td className="text-right">
                    <Badge variant="success" className="gap-1 border-0">
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
  );
}

// Simple internal check icon wrapper if not imported
function Check(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
