import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Star, 
  Users, 
  Clock, 
  BookOpen,
  ChevronRight,
  Award,
  Download,
  PlayCircle,
  ShoppingCart,
  LogIn,
  UserPlus,
  CheckCircle,
  Heart  // ✅ Added Heart icon for "Our"
} from "lucide-react";

const CourseHeader = ({ course, isEnrolled, onEnroll, onAddToCart }) => {
  const navigate = useNavigate();

  if (!course) return null;

  const handleContinueLearning = () => {
    navigate(`/course/${course.id}/learn`);
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Breadcrumb with "Our" */}
        <div className="flex items-center gap-2 text-blue-100 text-sm mb-4">
          <Link to="/" className="hover:underline flex items-center gap-1">
            <Heart size={14} className="text-pink-300" />
            <span>Our Home</span>
          </Link>
          <ChevronRight size={14} />
          <Link to="/courses" className="hover:underline flex items-center gap-1">
            <BookOpen size={14} />
            <span>Our Courses</span>
          </Link>
          <ChevronRight size={14} />
          <span className="flex items-center gap-1">
            <Star size={14} className="text-yellow-300" />
            {course.category}
          </span>
        </div>

        {/* "Our Featured Course" Badge */}
        <div className="inline-flex items-center gap-2 bg-pink-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm mb-4">
          <Heart size={14} className="text-pink-300" />
          <span>Our Featured Course</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Course Info */}
          <div className="lg:w-2/3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              {course.title}
            </h1>
            
            <p className="text-lg sm:text-xl text-blue-100 mb-6">
              {course.subtitle}
            </p>

            {/* Rating & Stats with "Our" */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6">
              <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(course.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold">{course.rating}</span>
                <span className="text-blue-200 text-sm">
                  ({course.stats?.totalRatings || 0} reviews)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Users size={18} />
                <span>{course.stats?.totalStudents?.toLocaleString() || 0} students</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span>{course.stats?.totalHours || course.chaptersCount} hours</span>
              </div>

              <div className="flex items-center gap-2">
                <BookOpen size={18} />
                <span>{course.content?.sections?.length || 0} sections</span>
              </div>
            </div>

            {/* Last Updated & Language with "Our" */}
            <div className="flex flex-wrap gap-4 text-sm text-blue-200 mb-6">
              <span className="flex items-center gap-1">
                <Heart size={14} className="text-pink-300" />
                Our latest update:
              </span>
              <span>📅 {course.stats?.lastUpdated || "March 2026"}</span>
              <span>🌐 {course.stats?.language || "English"}</span>
              {course.certificate && (
                <span className="flex items-center gap-1">
                  <Award size={16} />
                  Our Certificate included
                </span>
              )}
            </div>

            {/* Instructor Quick Info with "Our" */}
            <div className="flex items-center gap-4">
              <img 
                src={course.instructor?.avatar} 
                alt={course.instructor?.name}
                className="w-12 h-12 rounded-full border-2 border-white"
              />
              <div>
                <p className="text-sm text-blue-200 flex items-center gap-1">
                  <Heart size={12} className="text-pink-300" />
                  Our Instructor
                </p>
                <p className="font-semibold">{course.instructor?.name}</p>
                <p className="text-sm text-blue-200">{course.instructor?.title}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Course Card */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl p-6 text-gray-900 shadow-xl">
              {/* "Our Pick" Badge */}
              <div className="absolute -top-2 -right-2 bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Heart size={12} />
                Our Pick
              </div>

              <img 
                src={course.imageUrl} 
                alt={course.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />

              {/* Price with "Our Price" */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Heart size={12} className="text-pink-500" />
                  Our Special Price
                </p>
                {course.discountedPrice ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold">${course.discountedPrice}</span>
                    <span className="text-lg text-gray-400 line-through">${course.price}</span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-sm font-medium">
                      {Math.round((1 - course.discountedPrice/course.price) * 100)}% off
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold">${course.price}</span>
                )}
              </div>

              {/* Action Buttons */}
              {isEnrolled ? (
                <>
                  <button 
                    onClick={handleContinueLearning}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition mb-3 flex items-center justify-center gap-2"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Continue Learning
                  </button>
                  <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>You are enrolled in our course</span>
                  </div>
                </>
              ) : (
                <>
                  <button 
                    onClick={onEnroll}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-3"
                  >
                    Enroll in Our Course
                  </button>
                  <button 
                    onClick={onAddToCart}
                    className="w-full border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Add to Our Cart
                  </button>
                </>
              )}

              {/* Course Includes with "Our" */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-1">
                  <Heart size={14} className="text-pink-500" />
                  Our course includes:
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <PlayCircle size={16} className="text-blue-600" />
                    {course.stats?.totalHours} hours of our video content
                  </li>
                  <li className="flex items-center gap-2">
                    <Download size={16} className="text-blue-600" />
                    Our downloadable resources
                  </li>
                  <li className="flex items-center gap-2">
                    <Award size={16} className="text-blue-600" />
                    Our certificate of completion
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseHeader;