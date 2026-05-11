import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

const StudentCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    search: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await apiService.courses.getAll({
          ...filters,
          isPublished: true
        });
        setCourses(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Available Courses
        </h1>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            name="search"
            placeholder="Search courses..."
            value={filters.search}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="Programming">Programming</option>
            <option value="Design">Design</option>
            <option value="Business">Business</option>
            <option value="Marketing">Marketing</option>
            <option value="Data Science">Data Science</option>
          </select>
          
          <select
            name="level"
            value={filters.level}
            onChange={handleFilterChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {course.thumbnail && (
              <img 
                src={course.thumbnail} 
                alt={course.title}
                className="w-full h-48 object-cover"
              />
            )}
            
            <div className="p-6">
              <div className="mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {course.title}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {course.category}
                  </span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                    {course.level}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                {course.description}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <div>Students: {course.enrollmentCount || 0}</div>
                  <div>Duration: {course.duration} min</div>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  ${course.price || 0}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate(`/course/${course._id}`)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-600 dark:text-gray-400 text-lg">
            No courses found matching your criteria.
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
