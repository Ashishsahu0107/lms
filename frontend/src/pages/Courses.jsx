import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BookOpen, Users, Clock, Star, ChevronRight } from "lucide-react";

const Courses = () => {
  const navigate = useNavigate();
  const { user, enrollInCourse, enrolledCourses } = useAuth();
  const [category, setCategory] = useState("All");

  const courses = [
    {
      id: 1,
      title: "React Development",
      description: "Master React.js from basics to advanced concepts including hooks, context, and Redux.",
      category: "Web Development",
      instructor: "John Doe",
      students: 45,
      duration: 40,
      rating: 4.8,
      price: 49,
      imageUrl: "https://picsum.photos/400/200?random=1",
      difficulty: "Intermediate",
      thumbnail: "https://picsum.photos/400/200?random=1"
    },
    {
      id: 2,
      title: "JavaScript Advanced",
      description: "Deep dive into closures, promises, async/await, and modern JavaScript features.",
      category: "Programming",
      instructor: "Jane Smith",
      students: 38,
      duration: 35,
      rating: 4.7,
      price: 39,
      imageUrl: "https://picsum.photos/400/200?random=2",
      difficulty: "Advanced",
      thumbnail: "https://picsum.photos/400/200?random=2"
    },
    {
      id: 3,
      title: "Database Systems",
      description: "Learn SQL, MongoDB, database design, and optimization techniques.",
      category: "Database",
      instructor: "Mike Johnson",
      students: 52,
      duration: 45,
      rating: 4.9,
      price: 59,
      imageUrl: "https://picsum.photos/400/200?random=3",
      difficulty: "Intermediate",
      thumbnail: "https://picsum.photos/400/200?random=3"
    },
    {
      id: 4,
      title: "Python Programming",
      description: "Master Python from basics to advanced concepts including OOP and data structures.",
      category: "Programming",
      instructor: "Alex Brown",
      students: 67,
      duration: 50,
      rating: 4.6,
      price: 44,
      imageUrl: "https://picsum.photos/400/200?random=4",
      difficulty: "Beginner",
      thumbnail: "https://picsum.photos/400/200?random=4"
    }
  ];

  const categories = ["All", "Web Development", "Programming", "Database"];

  const filteredCourses = category === "All"
    ? courses
    : courses.filter((c) => c.category === category);

  const handleEnroll = (courseId) => {
    enrollInCourse(courseId);
    navigate(`/course/${courseId}`);
  };

  const isEnrolled = (courseId) => {
    return enrolledCourses.some(course => course.id === courseId);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Explore Courses
          </h1>
          <p className="text-gray-600 text-lg">
            Find the perfect course for your learning journey
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full border transition ${
                category === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-gray-100 border-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => {
            const enrolled = isEnrolled(course.id);
            
            return (
              <div
                key={course.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group"
              >
                {/* Course Image */}
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={course.imageUrl} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {enrolled && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Enrolled
                    </div>
                  )}
                </div>

                {/* Course Content */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {course.category}
                    </span>
                    <span className="text-xs text-gray-500">{course.difficulty}</span>
                  </div>

                  <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {course.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Course Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{course.rating}</span>
                    </div>
                  </div>

                  {/* Instructor */}
                  <p className="text-sm text-gray-700 mb-4">
                    <span className="text-gray-500">Instructor:</span> {course.instructor}
                  </p>

                  {/* Action Button */}
                  {enrolled ? (
                    <button
                      onClick={() => navigate(`/course/${course.id}`)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      Continue Learning
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
                    >
                      Enroll Now • ${course.price}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Courses;