import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  BookOpen,
  Users,
  Star,
  Clock,
  ChevronRight,
  Award,
  TrendingUp,
  Zap,
  Calendar,
  PlayCircle,
  CheckCircle
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { user, enrolledCourses } = useAuth();

  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Greeting
  useEffect(() => {
    const hour = new Date().getHours();

    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Featured courses
  useEffect(() => {
    const courses = [
      {
        id: 1,
        title: "React for Beginners",
        description: "Master React from scratch - Zero to Hero",
        category: "Web Development",
        instructor: "John Doe",
        students: 12500,
        rating: 4.8,
        duration: 42,
        imageUrl: "https://picsum.photos/400/200?random=1",
        difficulty: "Beginner"
      },
      {
        id: 2,
        title: "Core Java Masterclass",
        description: "Complete Java course from basics to advanced",
        category: "Programming",
        instructor: "Jane Smith",
        students: 5000,
        rating: 4.7,
        duration: 45,
        imageUrl: "https://picsum.photos/400/200?random=2",
        difficulty: "Intermediate"
      },
      {
        id: 3,
        title: "Python for Data Science",
        description: "Learn Python for data analysis and ML",
        category: "Data Science",
        instructor: "Alex Brown",
        students: 1500,
        rating: 4.9,
        duration: 40,
        imageUrl: "https://picsum.photos/400/200?random=3",
        difficulty: "Intermediate"
      }
    ];

    setFeaturedCourses(courses);
  }, []);

  // Announcements
  useEffect(() => {
    const data = [
      {
        id: 1,
        title: "New Course: React Advanced",
        message: "Advanced React with hooks and Redux is now available!",
        date: "2026-03-10"
      },
      {
        id: 2,
        title: "Assignment Deadline",
        message: "React Dashboard UI assignment due in 2 days",
        date: "2026-03-09"
      },
      {
        id: 3,
        title: "Quiz Available",
        message: "JavaScript Advanced Quiz is now open",
        date: "2026-03-08"
      }
    ];

    setAnnouncements(data);
  }, []);

  const stats = {
    enrolledCourses: enrolledCourses?.length || 0,
    completedCourses: 3,
    ongoingCourses: enrolledCourses?.length - 3 || 0,
    totalHours: 124,
    streak: 15,
    achievements: 8
  };

  const continueLearning = enrolledCourses?.slice(0, 2) || [];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Welcome */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-4">

            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                {greeting}, {user?.name || "Student"} 👋
              </h1>

              <p className="text-gray-600 text-sm sm:text-base">
                {currentTime.toLocaleDateString()} | {currentTime.toLocaleTimeString()}
              </p>
            </div>

            <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg w-fit">
              <span className="font-semibold">
                Streak: {stats.streak} days 🔥
              </span>
            </div>

          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
            <p className="text-sm text-gray-500">Enrolled</p>
            <p className="text-2xl font-bold">{stats.enrolledCourses}</p>
            <BookOpen className="w-6 h-6 text-blue-500 mt-2" />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-2xl font-bold">{stats.ongoingCourses}</p>
            <TrendingUp className="w-6 h-6 text-green-500 mt-2" />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
            <p className="text-sm text-gray-500">Streak</p>
            <p className="text-2xl font-bold">{stats.streak}</p>
            <Zap className="w-6 h-6 text-purple-500 mt-2" />
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-500">
            <p className="text-sm text-gray-500">Achievements</p>
            <p className="text-2xl font-bold">{stats.achievements}</p>
            <Award className="w-6 h-6 text-yellow-500 mt-2" />
          </div>

        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left */}
          <div className="lg:col-span-2 space-y-6">

            {/* Continue Learning */}
            {continueLearning.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">

                <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                  <PlayCircle className="w-5 h-5 text-blue-600" />
                  Continue Learning
                </h2>

                <div className="space-y-4">
                  {continueLearning.map(course => (

                    <div
                      key={course.id}
                      onClick={() => navigate(`/course/${course.id}/learn`)}
                      className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100"
                    >

                      <img
                        src={course.thumbnail || "https://picsum.photos/80"}
                        alt={course.title}
                        className="w-full sm:w-20 h-32 sm:h-20 object-cover rounded-lg"
                      />

                      <div className="flex-1">
                        <h3 className="font-semibold">{course.title}</h3>

                        <p className="text-sm text-gray-500">
                          {course.instructor}
                        </p>

                        <div className="mt-2">
                          <div className="w-full bg-gray-200 h-2 rounded">
                            <div
                              className="bg-blue-600 h-full"
                              style={{ width: `${course.progress || 40}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-5 h-5 text-gray-400" />

                    </div>

                  ))}
                </div>

              </div>
            )}

            {/* Featured Courses */}
            <div className="bg-white rounded-xl shadow p-6">

              <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Featured Courses
                </h2>

                <button
                  onClick={() => navigate("/courses")}
                  className="text-blue-600 text-sm"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

                {featuredCourses.map(course => (

                  <div
                    key={course.id}
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md"
                  >

                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-full h-40 object-cover"
                    />

                    <div className="p-4">

                      <h3 className="font-semibold mb-2">
                        {course.title}
                      </h3>

                      <p className="text-sm text-gray-600 mb-3">
                        {course.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{course.students} students</span>
                        <span>{course.duration}h</span>
                        <span>⭐ {course.rating}</span>
                      </div>

                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Right */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">

              <h2 className="text-xl font-semibold mb-4">
                Quick Actions
              </h2>

              <div className="grid grid-cols-2 gap-3">

                <button
                  onClick={() => navigate("/courses")}
                  className="bg-white/20 rounded-lg p-3 hover:bg-white/30"
                >
                  Browse
                </button>

                <button
                  onClick={() => navigate("/assignments")}
                  className="bg-white/20 rounded-lg p-3 hover:bg-white/30"
                >
                  Assignments
                </button>

                <button
                  onClick={() => navigate("/quizzes")}
                  className="bg-white/20 rounded-lg p-3 hover:bg-white/30"
                >
                  Quiz
                </button>

                <button
                  onClick={() => navigate("/support")}
                  className="bg-white/20 rounded-lg p-3 hover:bg-white/30"
                >
                  Help
                </button>

              </div>

            </div>

            {/* Announcements */}
            <div className="bg-white rounded-xl shadow p-6">

              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                Announcements
              </h2>

              <div className="space-y-4">

                {announcements.map(item => (

                  <div key={item.id} className="border-l-4 border-blue-500 pl-4">

                    <p className="font-medium">{item.title}</p>

                    <p className="text-sm text-gray-600">
                      {item.message}
                    </p>

                    <p className="text-xs text-gray-400">
                      {new Date(item.date).toLocaleDateString()}
                    </p>

                  </div>

                ))}

              </div>

            </div>

            {/* Learning Tip */}
            <div className="bg-green-50 rounded-xl p-6">

              <h2 className="font-semibold text-green-800 mb-2">
                💡 Learning Tip
              </h2>

              <p className="text-sm text-green-700">
                Learn at least 30 minutes daily to maintain your streak.
              </p>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Home;
