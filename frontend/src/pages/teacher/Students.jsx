import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';

const TeacherStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        // This would need to be implemented in the backend
        // For now, showing placeholder data
        setStudents([
          {
            _id: '1',
            name: 'Alice Johnson',
            email: 'alice@example.com',
            avatar: '/avatar1.jpg',
            enrolledCourses: ['JavaScript Fundamentals', 'React Basics'],
            progress: 85,
            lastLogin: '2024-05-10T10:30:00Z',
            status: 'active'
          },
          {
            _id: '2',
            name: 'Bob Smith',
            email: 'bob@example.com',
            avatar: '/avatar2.jpg',
            enrolledCourses: ['Node.js', 'Database Design'],
            progress: 72,
            lastLogin: '2024-05-09T14:20:00Z',
            status: 'active'
          },
          {
            _id: '3',
            name: 'Carol Davis',
            email: 'carol@example.com',
            avatar: '/avatar3.jpg',
            enrolledCourses: ['HTML/CSS'],
            progress: 90,
            lastLogin: '2024-05-08T09:15:00Z',
            status: 'active'
          }
        ]);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    return status === 'active' 
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
          My Students
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and monitor student progress.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search students by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div key={student._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center mb-4">
              <img 
                src={student.avatar || '/default-avatar.jpg'} 
                alt={student.name}
                className="w-12 h-12 rounded-full mr-3"
              />
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {student.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {student.email}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                {student.status}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Progress</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${student.progress}%` }}
                  ></div>
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {student.progress}%
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Enrolled Courses</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {student.enrolledCourses.map((course, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {course}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Last Login</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(student.lastLogin).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex space-x-2 mt-4">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                View Details
              </button>
              <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors">
                Send Message
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-600 dark:text-gray-400 text-lg">
            No students found matching your search.
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherStudents;
