import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';

const TeacherCourses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await apiService.courses.getTeacherCourses();
        setCourses(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await apiService.courses.delete(courseId);
      setCourses(courses.filter(course => course._id !== courseId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete course');
    }
  };

  const handleEditCourse = (courseId) => {
    navigate(`/teacher/edit-course/${courseId}`);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Courses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and monitor your courses.
          </p>
        </div>
        <button
          onClick={() => navigate('/teacher/create-course')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Create New Course
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
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
                  <span className={`px-2 py-1 rounded ${
                    course.isPublished 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                {course.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Students</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {course.students?.length || 0}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Lectures</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {course.lectures?.length || 0}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Rating</span>
                  <span className="text-yellow-500">⭐ {course.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Enrollment</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {course.enrollmentCount || 0}
                  </span>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/teacher/course/${course._id}`)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleEditCourse(course._id)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCourse(course._id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            You haven't created any courses yet.
          </div>
          <button
            onClick={() => navigate('/teacher/create-course')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Create Your First Course
          </button>
        </div>
      )}
    </div>
  );
};

export default TeacherCourses;
