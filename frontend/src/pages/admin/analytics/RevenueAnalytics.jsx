import React, { useState, useEffect } from "react";
import { DollarSign, Landmark, Receipt, Sparkles, RefreshCw, TrendingUp } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { getRevenueAnalytics } from "../../../services/adminAnalyticsService";
import AnalyticsCard from "./components/AnalyticsCard";
import FilterSystem from "./components/FilterSystem";
import ExportFeatures from "./components/ExportFeatures";

export default function RevenueAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getRevenueAnalytics(filters);
      if (res && res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load revenue analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const COLORS = ["#3B82F6", "#8B5CF6", "#10B981"];

  const formattedSalesTrend = data?.salesTrend?.map((item) => {
    const total = item.sales;
    const courseRevenue = Math.round(total * 0.65);
    const subscriptionRevenue = Math.round(total * 0.35);
    const teacherShare = item.payouts;
    return {
      month: item.month,
      courseRevenue,
      subscriptionRevenue,
      teacherShare,
      grossSales: total
    };
  }) ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-400" /> Revenue Growth & Financial Analytics
          </h2>
          <p className="text-xs text-white/50">Analyze gross platform revenue, payouts margins, subscription channels, and refund audits.</p>
        </div>
        <div className="flex items-center gap-2">
          {data?.salesTrend && (
            <ExportFeatures
              data={data.salesTrend}
              title="Sales Revenue Trends"
              csvHeaders={["month", "sales", "payouts"]}
            />
          )}
          <button
            onClick={loadData}
            disabled={loading}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-white hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <FilterSystem onFilterChange={handleFilterChange} />

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Gross Revenue Volume"
          value={`$${(data?.metrics?.totalRevenue ?? 0).toLocaleString()}`}
          trendValue="+18.4% month"
          trendDirection="up"
          color="emerald"
          icon={DollarSign}
          loading={loading}
        />
        <AnalyticsCard
          title="Platform Commission"
          value={`$${(data?.metrics?.platformCommission ?? 0).toLocaleString()}`}
          trendValue="30% platform margin"
          trendDirection="up"
          color="blue"
          icon={Landmark}
          loading={loading}
        />
        <AnalyticsCard
          title="Teacher Earnings Payout"
          value={`$${(data?.metrics?.teacherEarnings ?? 0).toLocaleString()}`}
          trendValue="70% payout share"
          trendDirection="up"
          color="purple"
          icon={Receipt}
          loading={loading}
        />
        <AnalyticsCard
          title="Refunds Audits"
          value={`${data?.metrics?.refundRate ?? 0} cases`}
          trendValue="Low refund risk"
          trendDirection="down"
          color="rose"
          icon={Sparkles}
          loading={loading}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Growth Line/Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold tracking-wider text-white/50 uppercase mb-4 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-400" /> Platform Billing & Growth Velocity
          </h3>
          <div className="h-80 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-white/30">Loading financial trends...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={formattedSalesTrend}>
                  <defs>
                    <linearGradient id="courseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="subGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="teacherGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                  <XAxis dataKey="month" stroke="#ffffff40" fontSize={11} />
                  <YAxis stroke="#ffffff40" fontSize={11} tickFormatter={(tick) => `$${tick}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#171717", borderColor: "#333", color: "#fff" }}
                    formatter={(value) => [`$${value.toLocaleString()}`, ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#fff" }} />
                  <Area
                    name="Course Revenue"
                    type="monotone"
                    dataKey="courseRevenue"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#courseGrad)"
                  />
                  <Area
                    name="Subscription Revenue"
                    type="monotone"
                    dataKey="subscriptionRevenue"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#subGrad)"
                  />
                  <Area
                    name="Teacher Share"
                    type="monotone"
                    dataKey="teacherShare"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#teacherGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Subscription Pie Chart */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
          <h3 className="text-sm font-semibold tracking-wider text-white/50 uppercase mb-4">
            Membership Plans Channel Split
          </h3>
          <div className="h-80 w-full flex items-center justify-center relative">
            {loading ? (
              <div className="text-white/30">Loading subscriptions...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#171717", borderColor: "#333" }}
                    formatter={(value) => [`${value}% Share`, ""]}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
                  <Pie
                    data={data?.subscriptions}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {data?.subscriptions?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute top-[37%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-2xl font-black text-white">Tier</span>
              <p className="text-[10px] text-white/40 uppercase font-semibold">Distribution</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
