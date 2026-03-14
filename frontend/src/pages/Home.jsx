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

  // Time-based greeting
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

  // Load featured courses
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

  // Load announcements
  useEffect(() => {
    const announcementsData = [
      {
        id: 1,
        title: "New Course: React Advanced",
        message: "Advanced React with hooks and Redux is now available!",
        date: "2026-03-10",
        type: "course"
      },
      {
        id: 2,
        title: "Assignment Deadline",
        message: "React Dashboard UI assignment due in 2 days",
        date: "2026-03-09",
        type: "assignment"
      },
      {
        id: 3,
        title: "Quiz Available",
        message: "JavaScript Advanced Quiz is now open",
        date: "2026-03-08",
        type: "quiz"
      }
    ];
    setAnnouncements(announcementsData);
  }, []);

  // Quick stats
  const stats = {
    enrolledCourses: enrolledCourses?.length || 0,
    completedCourses: 3,
    ongoingCourses: enrolledCourses?.length - 3 || 0,
    totalHours: 124,
    streak: 15,
    achievements: 8
  };

  // Continue learning - last accessed courses
  const continueLearning = enrolledCourses?.slice(0, 2) || [];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {greeting}, {user?.name || "Student"}! 👋
              </h1>
              <p className="text-gray-600">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} | {currentTime.toLocaleTimeString()}
              </p>
            </div>
            <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg">
              <span className="font-semibold">Streak: {stats.streak} days 🔥</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900">{stats.enrolledCourses}</p>
                <p className="text-xs text-green-600 mt-1">{stats.completedCourses} completed</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.ongoingCourses}</p>
                <p className="text-xs text-yellow-600 mt-1">{stats.totalHours} hours</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Learning Streak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.streak} days</p>
                <p className="text-xs text-purple-600 mt-1">Keep it up!</p>
              </div>
              <Zap className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Achievements</p>
                <p className="text-2xl font-bold text-gray-900">{stats.achievements}</p>
                <p className="text-xs text-yellow-600 mt-1">Badges earned</p>
              </div>
              <Award className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Continue Learning */}
            {continueLearning.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-blue-600" />
                  Continue Learning
                </h2>
                <div className="space-y-4">
                  {continueLearning.map((course) => (
                    <div 
                      key={course.id}
                      onClick={() => navigate(`/course/${course.id}/learn`)}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                    >
                      <img 
                        src={course.thumbnail || "https://picsum.photos/80/80"} 
                        alt={course.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-500">{course.instructor}</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span className="font-medium">{course.progress || 45}%</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full rounded-full"
                              style={{ width: `${course.progress || 45}%` }}
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
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  Featured Courses
                </h2>
                <button 
                  onClick={() => navigate('/courses')}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View All
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredCourses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => navigate(`/course/${course.id}`)}
                    className="border rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer group"
                  >
                    <img 
                      src={course.imageUrl} 
                      alt={course.title}
                      className="w-full h-40 object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {course.category}
                        </span>
                        <span className="text-xs text-gray-500">{course.difficulty}</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{course.students.toLocaleString()}</span>
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/courses')}
                  className="bg-white/20 hover:bg-white/30 rounded-lg p-3 text-center transition"
                >
                  <BookOpen className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Browse Courses</span>
                </button>
                <button
                  onClick={() => navigate('/assignments')}
                  className="bg-white/20 hover:bg-white/30 rounded-lg p-3 text-center transition"
                >
                  <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Assignments</span>
                </button>
                <button
                  onClick={() => navigate('/quizzes')}
                  className="bg-white/20 hover:bg-white/30 rounded-lg p-3 text-center transition"
                >
                  <Award className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Take Quiz</span>
                </button>
                <button
                  onClick={() => navigate('/support')}
                  className="bg-white/20 hover:bg-white/30 rounded-lg p-3 text-center transition"
                >
                  <Users className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm">Get Help</span>
                </button>
              </div>
            </div>

            {/* Announcements */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Announcements
              </h2>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="font-medium text-gray-900">{announcement.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{announcement.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(announcement.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Tips */}
            <div className="bg-green-50 rounded-xl p-6">
              <h2 className="font-semibold text-green-800 mb-3">💡 Learning Tip</h2>
              <p className="text-sm text-green-700">
                "Consistency is key! Try to learn at least 30 minutes every day to maintain your streak and improve retention."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;