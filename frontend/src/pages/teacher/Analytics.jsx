import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';

const TeacherAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalAssignments: 0,
    averageGrade: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // This would need to be implemented in the backend
        // For now, showing placeholder data
        setAnalytics({
          totalStudents: 45,
          totalCourses: 8,
          totalAssignments: 24,
          averageGrade: 87.5,
          recentActivity: [
            { type: 'assignment_submission', message: 'Alice submitted JavaScript Assignment', time: '2 hours ago' },
            { type: 'course_enrollment', message: 'Bob enrolled in React Basics', time: '4 hours ago' },
            { type: 'question_posted', message: 'Carol posted a question in Node.js forum', time: '6 hours ago' },
            { type: 'grade_posted', message: 'David graded HTML/CSS quiz', time: '1 day ago' }
          ]
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your teaching performance and student engagement.
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex space-x-4 mb-6">
        {['week', 'month', 'year'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110-5.292M15 21H3v-1a6 6 0 016-6h14a6 6 0 016 6v1m0 0V3a2 2 0 012-2h4a2 2 0 012 2v17a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h4a2 2 0 012 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2v2a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2H9z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.221.582-.98.632-1.161l2.833-4.714c.364-.615.582-1.337.632-2.161.078-.824.123-1.657.123-2.498V6.337c0-.841-.045-1.674-.123-2.498L8.858 2.126c-.05-.425-.332-.94-.632-1.161-.3-.221-.582-.98-.632-1.161L11.049 2.927zm-2.248 8.536l-2.833-4.715c-.364-.615-.582-1.337-.632-2.161-.078-.824-.123-1.657-.123-2.498V6.337c0-.841.045-1.674.123-2.498l2.833-4.714c.364-.615.582-1.337.632-2.161.078-.824.123-1.657.123-2.498V6.337c0 .841.045 1.674.123 2.498l-2.833 4.714c-.364.615-.582 1.337-.632 2.161-.078.824-.123 1.657-.123 2.498v10.326c0 .841-.045 1.674-.123 2.498l2.833 4.714c.364.615.582 1.337.632 2.161.078.824.123 1.657.123 2.498v-10.326z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Grade</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.averageGrade}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Stats
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
              <span className="font-medium text-gray-900 dark:text-white">78%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg. Response Time</span>
              <span className="font-medium text-gray-900 dark:text-white">2.3 days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Active Students</span>
              <span className="font-medium text-gray-900 dark:text-white">32 / 45</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Pending Reviews</span>
              <span className="font-medium text-gray-900 dark:text-white">8</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAnalytics;
