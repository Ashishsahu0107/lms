import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, Clock, Award, Users, BookOpen, PlayCircle } from 'lucide-react';
import { courseService, enrollmentService } from '../utils/apiService';
import { useAuth } from '../hooks/useAuth';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await courseService.getCourseById(id);
      setCourse(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching course:', error);
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setEnrolling(true);
    try {
      await enrollmentService.enrollCourse(id);
      setIsEnrolled(true);
      alert('Successfully enrolled in the course!');
      navigate(`/course/${id}/learn`);
    } catch (error) {
      console.error('Enrollment failed:', error);
      alert('Failed to enroll. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
          <p className="text-lg opacity-90">{course.description}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Info */}
          <div className="lg:col-span-2">
            {/* Course Image */}
            <div className="mb-8">
              <img
                src={course.thumbnail || 'https://picsum.photos/800/400'}
                alt={course.title}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">About this course</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {course.fullDescription || course.description}
              </p>

              {/* Course Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5" /> {course.duration || 40}h
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Level</p>
                  <p className="text-lg font-semibold">{course.level || 'Intermediate'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5" /> {course.enrolledCount || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rating</p>
                  <p className="text-lg font-semibold">⭐ {course.rating || 4.5}</p>
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6" /> Course Content
              </h2>
              <div className="space-y-3">
                {course.modules && course.modules.length > 0 ? (
                  course.modules.map((module, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedSection(expandedSection === idx ? null : idx)}
                        className="w-full bg-gray-50 p-4 flex items-center justify-between hover:bg-gray-100"
                      >
                        <span className="font-semibold">{module.title}</span>
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${
                            expandedSection === idx ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {expandedSection === idx && (
                        <div className="p-4 bg-white border-t space-y-2">
                          {module.lessons && module.lessons.map((lesson, lidx) => (
                            <div key={lidx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                              <PlayCircle className="w-4 h-4 text-blue-600" />
                              <span className="text-sm">{lesson.title}</span>
                              {lesson.duration && <span className="text-xs text-gray-500 ml-auto">{lesson.duration}min</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">Course content coming soon</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Enrollment Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <div className="mb-6">
                <p className="text-3xl font-bold text-blue-600">
                  {course.price ? `$${course.price}` : 'Free'}
                </p>
                <p className="text-sm text-gray-600">Full course access</p>
              </div>

              {isEnrolled ? (
                <button
                  onClick={() => navigate(`/course/${id}/learn`)}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <PlayCircle className="w-5 h-5" /> Continue Learning
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              )}

              {/* Course Highlights */}
              <div className="mt-6 pt-6 border-t space-y-3">
                <h3 className="font-semibold mb-4">What you'll learn</h3>
                {course.highlights && course.highlights.length > 0 ? (
                  course.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      <span className="text-sm">{highlight}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-600">Check course details for more info</p>
                )}
              </div>

              {/* Instructor Info */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3">Instructor</h3>
                <p className="font-medium">{course.instructor || 'Instructor'}</p>
                <p className="text-sm text-gray-600">{course.instructorBio || 'Professional instructor'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
