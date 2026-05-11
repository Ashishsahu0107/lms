import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { GlassCard } from '../ui';

const RevenueChart = ({ data = [], className = '', ...props }) => {
  const defaultData = [
    { month: 'Jan', revenue: 12500, target: 15000, courses: 8 },
    { month: 'Feb', revenue: 15200, target: 15000, courses: 10 },
    { month: 'Mar', revenue: 18900, target: 18000, courses: 12 },
    { month: 'Apr', revenue: 22400, target: 20000, courses: 15 },
    { month: 'May', revenue: 26800, target: 25000, courses: 18 },
    { month: 'Jun', revenue: 31200, target: 30000, courses: 22 },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <span className="text-sm" style={{ color: entry.color }}>
                {entry.name}:
              </span>
              <span className="text-sm font-medium" style={{ color: entry.color }}>
                ${entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value) => {
    return `$${(value / 1000).toFixed(0)}k`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className={className}
      {...props}
    >
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Revenue Analytics
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Actual</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">Target</span>
            </div>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
            <XAxis 
              dataKey="month" 
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickFormatter={formatYAxis}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Area
              type="monotone"
              dataKey="target"
              stroke="#3B82F6"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#colorTarget)"
              animationDuration={1500}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              strokeWidth={3}
              fill="url(#colorRevenue)"
              animationDuration={1500}
              animationBegin={200}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Revenue</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              ${chartData[chartData.length - 1]?.revenue?.toLocaleString() || '0'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Growth Rate</p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              +24.5%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Courses</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {chartData[chartData.length - 1]?.courses || '0'}
            </p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default RevenueChart;
