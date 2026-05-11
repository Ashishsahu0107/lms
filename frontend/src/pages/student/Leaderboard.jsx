import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';

const StudentLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all'); // all, month, week

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // This would need to be implemented in the backend
        // For now, showing placeholder data
        setLeaderboard([
          {
            _id: '1',
            name: 'Alice Johnson',
            email: 'alice@example.com',
            avatar: '/avatar1.jpg',
            totalPoints: 2850,
            completedCourses: 12,
            averageGrade: 92,
            streak: 15,
            rank: 1
          },
          {
            _id: '2',
            name: 'Bob Smith',
            email: 'bob@example.com',
            avatar: '/avatar2.jpg',
            totalPoints: 2720,
            completedCourses: 11,
            averageGrade: 89,
            streak: 12,
            rank: 2
          },
          {
            _id: '3',
            name: 'Carol Davis',
            email: 'carol@example.com',
            avatar: '/avatar3.jpg',
            totalPoints: 2680,
            completedCourses: 10,
            averageGrade: 88,
            streak: 10,
            rank: 3
          },
          {
            _id: '4',
            name: 'David Wilson',
            email: 'david@example.com',
            avatar: '/avatar4.jpg',
            totalPoints: 2540,
            completedCourses: 9,
            averageGrade: 87,
            streak: 8,
            rank: 4
          },
          {
            _id: '5',
            name: 'Emma Brown',
            email: 'emma@example.com',
            avatar: '/avatar5.jpg',
            totalPoints: 2480,
            completedCourses: 9,
            averageGrade: 86,
            streak: 7,
            rank: 5
          }
        ]);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getRankBadgeText = (rank) => {
    switch (rank) {
      case 1:
        return '🥇 1st';
      case 2:
        return '🥈 2nd';
      case 3:
        return '🥉 3rd';
      default:
        return `#${rank}`;
    }
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
          🏆 Leaderboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Top performing students this {timeFilter === 'all' ? 'semester' : timeFilter}.
        </p>
      </div>

      {/* Time Filter */}
      <div className="flex space-x-4 mb-6">
        {['all', 'month', 'week'].map((filter) => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timeFilter === filter
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Courses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Avg Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Streak
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboard.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getRankBadgeColor(student.rank)}`}>
                      {getRankBadgeText(student.rank)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        src={student.avatar || '/default-avatar.jpg'} 
                        alt={student.name}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                      {student.totalPoints.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {student.completedCourses}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {student.averageGrade}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {student.streak} days
                      </span>
                      <span className="ml-2 text-orange-500">🔥</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {leaderboard.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-600 dark:text-gray-400 text-lg">
            No leaderboard data available for this period.
          </div>
        </div>
      )}

      {/* Your Position */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">
          Your Position
        </h3>
        <p className="text-blue-700 dark:text-blue-300">
          Keep learning to climb the leaderboard! Complete courses and assignments to earn points.
        </p>
      </div>
    </div>
  );
};

export default StudentLeaderboard;
