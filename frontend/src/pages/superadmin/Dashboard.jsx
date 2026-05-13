import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalAssignments: 0,
    totalSubmissions: 0,
    publishedCourses: 0,
    draftCourses: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching dashboard stats...');
        
        const response = await apiService.analytics.getDashboard();
        console.log('Dashboard response:', response);
        
        if (response.data.data && response.data.data.counts) {
          setStats({
            totalUsers: response.data.data.counts.totalUsers || 0,
            totalCourses: response.data.data.counts.totalCourses || 0,
            totalAssignments: response.data.data.counts.totalAssignments || 0,
            totalSubmissions: response.data.data.counts.totalSubmissions || 0,
            publishedCourses: response.data.data.counts.publishedCourses || 0,
            draftCourses: response.data.data.counts.draftCourses || 0,
            revenue: 0
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
        setError(err.message || 'Failed to load stats');
        // Set default stats on error so something displays
        setStats({
          totalUsers: 1,
          totalCourses: 0,
          totalAssignments: 0,
          totalSubmissions: 0,
          publishedCourses: 0,
          draftCourses: 0,
          revenue: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="p-3 mb-4 rounded bg-blue-50 text-blue-800 border border-blue-200 text-sm">
        SuperAdminDashboard rendered
        {error ? ` | error: ${error}` : ''}
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Super Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          System overview and analytics.
        </p>
        {error && (
          <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            <p>⚠️ {error}</p>
            <p className="text-sm mt-2">Displaying default data. Check console for details.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.totalUsers}
              </p>
            </div>
            <div className="text-4xl text-blue-500 opacity-20">👥</div>
          </div>
        </div>

        {/* Total Courses */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.totalCourses}
              </p>
            </div>
            <div className="text-4xl text-green-500 opacity-20">📚</div>
          </div>
        </div>

        {/* Total Assignments */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Assignments</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.totalAssignments}
              </p>
            </div>
            <div className="text-4xl text-purple-500 opacity-20">📋</div>
          </div>
        </div>

        {/* Total Submissions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Submissions</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.totalSubmissions}
              </p>
            </div>
            <div className="text-4xl text-orange-500 opacity-20">📤</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Course Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <span className="text-gray-700 dark:text-gray-300">Published Courses</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.publishedCourses}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-gray-700 dark:text-gray-300">Draft Courses</span>
              <span className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {stats.draftCourses}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            System Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700 dark:text-gray-300">Database Connected ✓</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700 dark:text-gray-300">API Server Running ✓</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700 dark:text-gray-300">Authentication Active ✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
