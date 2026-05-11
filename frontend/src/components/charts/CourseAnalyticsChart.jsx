import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { GlassCard } from '../ui';

const CourseAnalyticsChart = ({ data = [], className = '', ...props }) => {
  const defaultBarData = [
    { course: 'React Basics', students: 145, completion: 78, revenue: 4350 },
    { course: 'Advanced JS', students: 89, completion: 65, revenue: 2670 },
    { course: 'Node.js', students: 112, completion: 82, revenue: 3360 },
    { course: 'CSS Mastery', students: 98, completion: 71, revenue: 2940 },
    { course: 'Vue.js', students: 67, completion: 58, revenue: 2010 },
  ];

  const defaultPieData = [
    { name: 'Completed', value: 35, color: '#10B981' },
    { name: 'In Progress', value: 45, color: '#3B82F6' },
    { name: 'Not Started', value: 20, color: '#6B7280' },
  ];

  const barData = data.length > 0 ? data : defaultBarData;
  const pieData = defaultPieData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name === 'Revenue' ? '$' : entry.name === 'Completion' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`} {...props}>
      {/* Course Performance Bar Chart */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassCard className="p-6 h-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Course Performance
          </h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
              <XAxis 
                dataKey="course" 
                stroke="#6B7280"
                fontSize={11}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Bar
                dataKey="students"
                fill="#3B82F6"
                radius={[8, 8, 0, 0]}
                animationDuration={1500}
              />
              <Bar
                dataKey="completion"
                fill="#10B981"
                radius={[8, 8, 0, 0]}
                animationDuration={1500}
                animationBegin={200}
              />
            </BarChart>
          </ResponsiveContainer>

          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Students</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Completion %</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Course Status Pie Chart */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <GlassCard className="p-6 h-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Course Status Distribution
          </h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationDuration={1500}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-gray-600 dark:text-gray-400">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default CourseAnalyticsChart;
