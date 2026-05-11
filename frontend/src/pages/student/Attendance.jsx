import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';

const StudentAttendance = () => {
  const [attendance, setAttendance] = useState({
    overall: 0,
    byMonth: [],
    recentClasses: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        // This would need to be implemented in the backend
        // For now, showing placeholder data
        setAttendance({
          overall: 85,
          byMonth: [
            { month: 'January', percentage: 90 },
            { month: 'February', percentage: 85 },
            { month: 'March', percentage: 80 },
            { month: 'April', percentage: 88 },
            { month: 'May', percentage: 82 }
          ],
          recentClasses: [
            { date: '2024-05-10', course: 'JavaScript Fundamentals', status: 'present' },
            { date: '2024-05-09', course: 'React Basics', status: 'present' },
            { date: '2024-05-08', course: 'HTML/CSS', status: 'absent' },
            { date: '2024-05-07', course: 'Node.js', status: 'present' },
            { date: '2024-05-06', course: 'Database Design', status: 'present' }
          ]
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const getStatusColor = (status) => {
    return status === 'present' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

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
          Attendance Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track your class attendance and participation.
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Overall Attendance */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Overall Attendance
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              This semester
            </p>
          </div>
          <div className="text-4xl font-bold text-blue-600">
            {attendance.overall}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Attendance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Monthly Attendance
          </h2>
          <div className="space-y-3">
            {attendance.byMonth.map((month, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">
                  {month.month}
                </span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${month.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {month.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Classes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Recent Classes
          </h2>
          <div className="space-y-3">
            {attendance.recentClasses.map((classItem, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {classItem.course}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(classItem.date).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(classItem.status)}`}>
                  {classItem.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
