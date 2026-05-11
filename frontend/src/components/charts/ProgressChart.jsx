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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { GlassCard } from '../ui';

const ProgressChart = ({ data = [], className = '', ...props }) => {
  const defaultBarData = [
    { category: 'Modules', completed: 45, total: 60, percentage: 75 },
    { category: 'Lessons', completed: 120, total: 150, percentage: 80 },
    { category: 'Quizzes', completed: 18, total: 25, percentage: 72 },
    { category: 'Assignments', completed: 22, total: 30, percentage: 73 },
    { category: 'Projects', completed: 8, total: 10, percentage: 80 },
  ];

  const defaultRadarData = [
    { skill: 'JavaScript', level: 85, fullMark: 100 },
    { skill: 'React', level: 78, fullMark: 100 },
    { skill: 'Node.js', level: 72, fullMark: 100 },
    { skill: 'CSS', level: 88, fullMark: 100 },
    { skill: 'Database', level: 65, fullMark: 100 },
    { skill: 'Testing', level: 58, fullMark: 100 },
  ];

  const barData = data.length > 0 ? data : defaultBarData;
  const radarData = defaultRadarData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.name === 'percentage' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const RadarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {payload[0].payload.skill}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Level: {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`} {...props}>
      {/* Learning Progress Bar Chart */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <GlassCard className="p-6 h-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Learning Progress
          </h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.5} />
              <XAxis 
                type="number"
                stroke="#6B7280"
                fontSize={12}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <YAxis 
                type="category"
                dataKey="category"
                stroke="#6B7280"
                fontSize={12}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Bar
                dataKey="percentage"
                fill="#8B5CF6"
                radius={[0, 8, 8, 0]}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>

          {/* Progress Details */}
          <div className="mt-4 space-y-2">
            {barData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{item.category}</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {item.completed}/{item.total} ({item.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Skills Radar Chart */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <GlassCard className="p-6 h-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Skills Assessment
          </h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid 
                stroke="#E5E7EB"
                strokeOpacity={0.5}
              />
              <PolarAngleAxis 
                dataKey="skill"
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#6B7280' }}
                tickFormatter={(value) => `${value}%`}
              />
              <Radar
                name="Skill Level"
                dataKey="level"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.6}
                strokeWidth={2}
                animationDuration={1500}
              />
              <Tooltip content={<RadarTooltip />} />
            </RadarChart>
          </ResponsiveContainer>

          {/* Skills Summary */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Level</p>
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(radarData.reduce((acc, item) => acc + item.level, 0) / radarData.length)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Top Skill</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {radarData.reduce((max, item) => item.level > max.level ? item : max).skill}
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default ProgressChart;
