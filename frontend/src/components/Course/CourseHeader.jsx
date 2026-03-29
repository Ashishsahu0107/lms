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
  CheckCircle,
  Heart
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

        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-blue-100 text-sm mb-4">

          <Link to="/" className="flex items-center gap-1 hover:underline">
            <Heart size={14} className="text-pink-300"/>
            Our Home
          </Link>

          <ChevronRight size={14}/>

          <Link to="/courses" className="flex items-center gap-1 hover:underline">
            <BookOpen size={14}/>
            Our Courses
          </Link>

          <ChevronRight size={14}/>

          <span className="flex items-center gap-1">
            <Star size={14} className="text-yellow-300"/>
            {course.category}
          </span>

        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-pink-500/20 px-3 py-1 rounded-full text-sm mb-6">
          <Heart size={14}/>
          Our Featured Course
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* LEFT CONTENT */}
          <div className="lg:w-2/3">

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              {course.title}
            </h1>

            <p className="text-lg sm:text-xl text-blue-100 mb-6">
              {course.subtitle}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6">

              <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full">

                <div className="flex">

                  {[1,2,3,4,5].map((star)=>(
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

                <span className="font-semibold">
                  {course.rating}
                </span>

                <span className="text-blue-200 text-sm">
                  ({course.stats?.totalRatings || 0})
                </span>

              </div>

              <div className="flex items-center gap-2">
                <Users size={18}/>
                {course.stats?.totalStudents?.toLocaleString()}
              </div>

              <div className="flex items-center gap-2">
                <Clock size={18}/>
                {course.stats?.totalHours} hours
              </div>

              <div className="flex items-center gap-2">
                <BookOpen size={18}/>
                {course.content?.sections?.length} sections
              </div>

            </div>

            {/* Update */}
            <div className="flex flex-wrap gap-4 text-sm text-blue-200 mb-6">

              <span className="flex items-center gap-1">
                <Heart size={14}/>
                Our latest update
              </span>

              <span>📅 {course.stats?.lastUpdated}</span>

              <span>🌐 {course.stats?.language}</span>

              {course.certificate && (
                <span className="flex items-center gap-1">
                  <Award size={16}/>
                  Certificate included
                </span>
              )}

            </div>

            {/* Instructor */}
            <div className="flex items-center gap-4 flex-wrap">

              <img
                src={course.instructor?.avatar}
                alt={course.instructor?.name}
                className="w-12 h-12 rounded-full border-2 border-white"
              />

              <div>

                <p className="text-sm text-blue-200">
                  Our Instructor
                </p>

                <p className="font-semibold">
                  {course.instructor?.name}
                </p>

                <p className="text-sm text-blue-200">
                  {course.instructor?.title}
                </p>

              </div>

            </div>

          </div>

          {/* RIGHT CARD */}
          <div className="lg:w-1/3">

            <div className="relative bg-white rounded-xl p-5 sm:p-6 text-gray-900 shadow-xl">

              {/* Badge */}
              <div className="absolute -top-3 -right-3 bg-pink-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                <Heart size={12}/>
                Our Pick
              </div>

              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-full h-40 sm:h-48 object-cover rounded-lg mb-4"
              />

              {/* Price */}
              <div className="mb-4">

                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <Heart size={12}/>
                  Our Special Price
                </p>

                {course.discountedPrice ? (

                  <div className="flex flex-wrap items-center gap-2">

                    <span className="text-3xl font-bold">
                      ${course.discountedPrice}
                    </span>

                    <span className="text-lg text-gray-400 line-through">
                      ${course.price}
                    </span>

                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm">
                      {Math.round((1-course.discountedPrice/course.price)*100)}% off
                    </span>

                  </div>

                ) : (

                  <span className="text-3xl font-bold">
                    ${course.price}
                  </span>

                )}

              </div>

              {/* Buttons */}
              {isEnrolled ? (

                <>
                  <button
                    onClick={handleContinueLearning}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2 mb-3"
                  >
                    <PlayCircle size={18}/>
                    Continue Learning
                  </button>

                  <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                    <CheckCircle size={16}/>
                    Enrolled
                  </div>
                </>

              ) : (

                <>
                  <button
                    onClick={onEnroll}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 mb-3"
                  >
                    Enroll in Course
                  </button>

                  <button
                    onClick={onAddToCart}
                    className="w-full border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50"
                  >
                    Add to Cart
                  </button>
                </>

              )}

              {/* Includes */}
              <div className="mt-4 pt-4 border-t">

                <h4 className="font-semibold text-sm mb-3 flex items-center gap-1">
                  <Heart size={14}/>
                  Course includes
                </h4>

                <ul className="space-y-2 text-sm text-gray-600">

                  <li className="flex items-center gap-2">
                    <PlayCircle size={16}/>
                    {course.stats?.totalHours} hours video
                  </li>

                  <li className="flex items-center gap-2">
                    <Download size={16}/>
                    Downloadable resources
                  </li>

                  <li className="flex items-center gap-2">
                    <Award size={16}/>
                    Certificate
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
