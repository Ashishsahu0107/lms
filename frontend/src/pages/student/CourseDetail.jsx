import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

const StudentCourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await apiService.courses.getById(id);
        setCourse(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    try {
      await apiService.courses.enroll(id);
      navigate('/student/courses');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll in course');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Course not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {course.thumbnail && (
          <img 
            src={course.thumbnail} 
            alt={course.title}
            className="w-full h-64 object-cover"
          />
        )}
        
        <div className="p-6">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {course.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>Category: {course.category}</span>
              <span>Level: {course.level}</span>
              <span>Duration: {course.duration} minutes</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Course Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Students</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {course.enrollmentCount || 0}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Lectures</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {course.lectures?.length || 0}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">Assignments</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {course.assignments?.length || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Instructor
            </h2>
            <div className="flex items-center space-x-4">
              <img 
                src={course.teacher?.avatar || '/default-avatar.jpg'} 
                alt={course.teacher?.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {course.teacher?.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {course.teacher?.email}
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleEnroll}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Enroll Now
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCourseDetail;
