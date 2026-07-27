import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Award,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

export default function PaymentDashboard({
  payments = [],
  onNavigateToTransactions,
  onNavigateToRefunds,
}) {
  const completed = payments.filter((p) => p.status === "completed");
  const totalRevenue = completed.reduce((acc, p) => acc + p.amount, 0);
  const totalCommission = completed.reduce((acc, p) => acc + p.commission, 0);

  // Group monthly billing growth
  const mockRevenueGrowth = [
    { month: "Jan", revenue: 2400 },
    { month: "Feb", revenue: 3100 },
    { month: "Mar", revenue: 4500 },
    { month: "Apr", revenue: 3800 },
    { month: "May", revenue: 5900 },
    { month: "Jun", revenue: totalRevenue > 0 ? totalRevenue : 7200 },
  ];

  return (
    <div className="space-y-6" id="payment-dashboard-root">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border bg-card hover:shadow-md transition-all flex items-center gap-4 bg-gradient-to-br from-emerald-500/10 via-card to-emerald-600/5 border-emerald-500/20">
          <div className="p-3.5 rounded-xl bg-emerald-500/20 text-emerald-600">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-600">
              ${totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Total Sales Billings
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl border bg-card hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-600">
            <ArrowUpRight className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              ${totalCommission.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              LMS Commission (20%)
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl border bg-card hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-indigo-500/10 text-indigo-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo-600">
              ${(totalRevenue - totalCommission).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Teacher Earnings (80%)
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl border bg-card hover:shadow-md transition-all flex items-center gap-4 bg-gradient-to-br from-amber-500/10 via-card to-amber-600/5 border-amber-500/20">
          <div className="p-3.5 rounded-xl bg-amber-500/20 text-amber-600">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">96.4%</p>
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Payment Success Rate
            </p>
          </div>
        </div>
      </div>

      {/* Revenue growth graph */}
      <Card className="hover:shadow-md transition-all">
        <div className="p-6 pb-2 border-b">
          <h3 className="font-bold text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" /> Platform Billings
            growth Timeline ($)
          </h3>
        </div>
        <div className="p-6">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockRevenueGrowth}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-muted/30"
                />
                <XAxis
                  dataKey="month"
                  className="text-xs text-muted-foreground font-medium"
                />
                <YAxis className="text-xs text-muted-foreground font-medium" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.75rem",
                  }}
                  formatter={(val) => [`$${val}`, "Billing"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Direct links footer */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-muted/20 border border-dashed rounded-xl p-5">
        <div className="flex items-center gap-2.5">
          <Award className="h-5 w-5 text-indigo-600" />
          <div>
            <p className="font-semibold text-sm">
              Need to review transaction records or refunds?
            </p>
            <p className="text-xs text-muted-foreground">
              Manage invoices, refund request approvals, and transactional logs.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToTransactions}
          >
            View Transactions Log
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
            onClick={onNavigateToRefunds}
          >
            Refund Queue (
            {payments.filter((p) => p.status === "refunded").length})
          </Button>
        </div>
      </div>
    </div>
  );
}
