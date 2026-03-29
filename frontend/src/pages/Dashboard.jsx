import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  BookOpen, 
  Users, 
  Award,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  Target,
  Zap,
  Star,
  ChevronRight,
  BarChart,
  Activity,
  Sun,
  Moon,
  Cloud
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, enrolledCourses } = useAuth();
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedWeek, setSelectedWeek] = useState("current");
  
  // Real-time greeting based on time
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

  // Academic Score - updates automatically based on assignments, quizzes, courses
  const [academicScore, setAcademicScore] = useState({
    overall: 78,
    assignments: { completed: 8, total: 12, score: 75 },
    quizzes: { attempted: 5, total: 8, score: 82 },
    courses: { completed: 3, total: 6, progress: 50 }
  });

  // Assignment Summary - updates on submission/evaluation
  const [assignmentSummary, setAssignmentSummary] = useState({
    completed: 8,
    total: 12,
    pending: 4,
    upcoming: [
      { name: "React Dashboard UI", due: "2026-03-25" },
      { name: "API Integration", due: "2026-03-28" }
    ]
  });

  // Learning Streak - updates daily based on activity
  const [learningStreak, setLearningStreak] = useState({
    current: 15,
    longest: 32,
    today: true,
    activities: [
      { date: "2026-03-09", count: 3 },
      { date: "2026-03-08", count: 2 },
      { date: "2026-03-07", count: 4 },
      { date: "2026-03-06", count: 1 },
      { date: "2026-03-05", count: 3 },
      { date: "2026-03-04", count: 2 },
      { date: "2026-03-03", count: 3 }
    ]
  });

  // Skills Acquired - linked to module completion
  const [skills, setSkills] = useState({
    acquired: 8,
    total: 15,
    list: [
      { name: "React", level: 80, icon: "⚛️" },
      { name: "JavaScript", level: 75, icon: "📜" },
      { name: "Node.js", level: 60, icon: "🟢" },
      { name: "MongoDB", level: 45, icon: "🍃" },
      { name: "TypeScript", level: 30, icon: "📘" },
      { name: "GraphQL", level: 25, icon: "🔷" }
    ]
  });

  // Weekly Activity Data
  const [weeklyActivity, setWeeklyActivity] = useState({
    type: "lessons", // or "time"
    data: [
      { day: "Mon", lessons: 3, time: 120 },
      { day: "Tue", lessons: 4, time: 150 },
      { day: "Wed", lessons: 2, time: 90 },
      { day: "Thu", lessons: 5, time: 180 },
      { day: "Fri", lessons: 3, time: 135 },
      { day: "Sat", lessons: 1, time: 45 },
      { day: "Sun", lessons: 0, time: 0 }
    ]
  });

  // Events Calendar
  const [events, setEvents] = useState([
    { 
      id: 1, 
      title: "React Dashboard UI Assignment", 
      type: "assignment", 
      date: "2026-03-25",
      time: "23:59",
      priority: "high"
    },
    { 
      id: 2, 
      title: "JavaScript Quiz", 
      type: "quiz", 
      date: "2026-03-20",
      time: "14:00",
      priority: "medium"
    },
    { 
      id: 3, 
      title: "Guest Lecture: AI in Web Dev", 
      type: "event", 
      date: "2026-03-22",
      time: "11:00",
      priority: "low"
    },
    { 
      id: 4, 
      title: "API Integration Assignment", 
      type: "assignment", 
      date: "2026-03-28",
      time: "23:59",
      priority: "high"
    }
  ]);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: "Alice Johnson", score: 98, avatar: "AJ", course: "React" },
    { rank: 2, name: "Bob Smith", score: 95, avatar: "BS", course: "JavaScript" },
    { rank: 3, name: "Carol Davis", score: 92, avatar: "CD", course: "Python" },
    { rank: 4, name: "David Wilson", score: 88, avatar: "DW", course: "Java" },
    { rank: 5, name: "Eva Brown", score: 85, avatar: "EB", course: "React" },
    { rank: 6, name: "Frank Miller", score: 82, avatar: "FM", course: "Database" },
    { rank: 7, name: "Grace Lee", score: 79, avatar: "GL", course: "UI/UX" },
    { rank: 8, name: "Henry Taylor", score: 76, avatar: "HT", course: "React" }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly update some stats to show real-time effect
      setAcademicScore(prev => ({
        ...prev,
        overall: prev.overall + (Math.random() > 0.7 ? 1 : 0)
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const maxLessons = Math.max(...weeklyActivity.data.map(d => d.lessons));
  const maxTime = Math.max(...weeklyActivity.data.map(d => d.time));

  const getEventIcon = (type) => {
    switch(type) {
      case "assignment": return <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "quiz": return <Target className="w-3 h-3 sm:w-4 sm:h-4" />;
      default: return <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case "high": return "border-l-2 sm:border-l-4 border-red-500";
      case "medium": return "border-l-2 sm:border-l-4 border-yellow-500";
      case "low": return "border-l-2 sm:border-l-4 border-blue-500";
      default: return "";
    }
  };

  const getWeatherIcon = () => {
    const hour = new Date().getHours();
    if (hour < 6 || hour > 18) return <Moon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-indigo-400" />;
    if (hour < 12) return <Sun className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-yellow-500" />;
    return <Cloud className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-400" />;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Greeting Section */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="w-full">
              <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 sm:gap-3 mb-2">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg text-white">
                  {getWeatherIcon()}
                </div>
                <div className="w-full">
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                    {greeting}, {user?.name || "Student"}! 👋
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {currentTime.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} | {currentTime.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="w-full sm:w-auto text-left sm:text-right">
              <div className="bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium inline-block">
                Learning Streak: {learningStreak.current} days 🔥
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          {/* Academic Score Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <Award className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Overall</span>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">{academicScore.overall}%</p>
            <p className="text-xs sm:text-sm opacity-90 mb-3 sm:mb-4">Academic Score</p>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between text-xs">
                <span>Assignments</span>
                <span>{academicScore.assignments.score}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Quizzes</span>
                <span>{academicScore.quizzes.score}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Courses</span>
                <span>{academicScore.courses.progress}%</span>
              </div>
            </div>
          </div>

          {/* Assignment Summary Card */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <CheckCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                {assignmentSummary.completed}/{assignmentSummary.total}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">{assignmentSummary.completed}</p>
            <p className="text-xs sm:text-sm opacity-90 mb-2">Assignments Completed</p>
            <p className="text-xs opacity-80">{assignmentSummary.pending} pending</p>
            <div className="mt-2 sm:mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full"
                style={{ width: `${(assignmentSummary.completed / assignmentSummary.total) * 100}%` }}
              />
            </div>
          </div>

          {/* Learning Streak Card */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <Zap className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                Best: {learningStreak.longest}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">{learningStreak.current}</p>
            <p className="text-xs sm:text-sm opacity-90 mb-3 sm:mb-4">Day Streak 🔥</p>
            <div className="flex gap-0.5 sm:gap-1">
              {learningStreak.activities.slice(0, 7).map((day, i) => (
                <div key={i} className="flex-1">
                  <div className="h-1 bg-white/20 rounded-full mb-1">
                    <div 
                      className="h-full bg-white rounded-full"
                      style={{ width: `${(day.count / 4) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Acquired Card */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <Star className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                {skills.acquired}/{skills.total}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">{skills.acquired}</p>
            <p className="text-xs sm:text-sm opacity-90 mb-2">Skills Acquired</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {skills.list.slice(0, 3).map((skill, i) => (
                <span key={i} className="text-xs bg-white/20 px-1.5 sm:px-2 py-0.5 rounded-full">
                  {skill.icon} {skill.name}
                </span>
              ))}
              {skills.list.length > 3 && (
                <span className="text-xs bg-white/20 px-1.5 sm:px-2 py-0.5 rounded-full">
                  +{skills.list.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {/* Left Column - 2 cols */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6">
            {/* Weekly Learning Activity Chart */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
              <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 mb-4 sm:mb-5 md:mb-6">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold flex items-center gap-2">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  Weekly Learning Activity
                </h2>
                <div className="flex gap-2 w-full xs:w-auto">
                  <button
                    onClick={() => setWeeklyActivity({...weeklyActivity, type: "lessons"})}
                    className={`flex-1 xs:flex-none px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg transition ${
                      weeklyActivity.type === "lessons" 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Lessons
                  </button>
                  <button
                    onClick={() => setWeeklyActivity({...weeklyActivity, type: "time"})}
                    className={`flex-1 xs:flex-none px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg transition ${
                      weeklyActivity.type === "time" 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Time
                  </button>
                </div>
              </div>

              {/* Chart */}
              <div className="h-32 sm:h-36 md:h-40 lg:h-48 flex items-end justify-between gap-1 sm:gap-2">
                {weeklyActivity.data.map((day, i) => {
                  const value = weeklyActivity.type === "lessons" ? day.lessons : day.time;
                  const max = weeklyActivity.type === "lessons" ? maxLessons : maxTime;
                  const height = max > 0 ? (value / max) * 100 : 0;
                  
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gray-100 rounded-t-lg relative group">
                        <div 
                          className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-300"
                          style={{ height: `${height}%`, minHeight: '15px' }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-1.5 sm:px-2 py-1 rounded whitespace-nowrap z-10">
                            {weeklyActivity.type === "lessons" ? `${value} lessons` : `${value} min`}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 sm:mt-2">{day.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Events Calendar */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  Upcoming Events
                </h2>
                <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View All <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {events.map((event) => (
                  <div 
                    key={event.id} 
                    className={`flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3 sm:gap-4 p-2 sm:p-3 bg-gray-50 rounded-lg hover:shadow-md transition ${getPriorityColor(event.priority)}`}
                  >
                    <div className={`p-1.5 sm:p-2 rounded-lg ${
                      event.type === "assignment" ? "bg-red-100" :
                      event.type === "quiz" ? "bg-yellow-100" : "bg-blue-100"
                    }`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm text-gray-900 truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })} at {event.time}
                      </p>
                    </div>
                    <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${
                      event.priority === "high" ? "bg-red-100 text-red-700" :
                      event.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {event.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* My Courses */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold flex items-center gap-2">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  My Courses
                </h2>
                <button 
                  onClick={() => navigate('/courses')}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View All <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>

              {enrolledCourses && enrolledCourses.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {enrolledCourses.slice(0, 3).map(course => (
                    <div 
                      key={course.id} 
                      onClick={() => navigate(`/course/${course.id}`)}
                      className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs sm:text-sm text-gray-900 truncate">{course.title}</p>
                        <p className="text-xs text-gray-500 truncate">{course.instructor}</p>
                      </div>
                      <div className="text-left xs:text-right w-full xs:w-auto">
                        <p className="text-xs sm:text-sm font-medium text-blue-600">Progress: {course.progress || 0}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 sm:py-6">
                  <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
                  <p className="text-xs sm:text-sm text-gray-500">No courses enrolled yet</p>
                  <button
                    onClick={() => navigate('/courses')}
                    className="mt-2 sm:mt-3 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Browse Courses
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - 1 col */}
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Leaderboard */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
              <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  Leaderboard
                </h2>
                <select className="text-xs sm:text-sm border rounded-lg px-2 py-1 w-full xs:w-auto">
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>All Time</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                {leaderboard.slice(0, 5).map((student) => (
                  <div 
                    key={student.rank}
                    className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition"
                  >
                    <div className={`w-5 sm:w-6 text-center text-xs sm:text-sm font-bold ${
                      student.rank === 1 ? "text-yellow-500" :
                      student.rank === 2 ? "text-gray-400" :
                      student.rank === 3 ? "text-orange-500" : "text-gray-500"
                    }`}>
                      #{student.rank}
                    </div>
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {student.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{student.name}</p>
                      <p className="text-xs text-gray-500 truncate">{student.course}</p>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-blue-600">
                      {student.score}%
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-3 sm:mt-4 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium text-center">
                View Full Leaderboard →
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 text-white">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <button 
                  onClick={() => navigate('/courses')}
                  className="bg-white/20 hover:bg-white/30 rounded-lg p-2 sm:p-3 text-center transition"
                >
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1" />
                  <span className="text-xs">Browse Courses</span>
                </button>
                <button 
                  onClick={() => navigate('/assignments')}
                  className="bg-white/20 hover:bg-white/30 rounded-lg p-2 sm:p-3 text-center transition"
                >
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1" />
                  <span className="text-xs">Assignments</span>
                </button>
                <button 
                  onClick={() => navigate('/quizzes')}
                  className="bg-white/20 hover:bg-white/30 rounded-lg p-2 sm:p-3 text-center transition"
                >
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1" />
                  <span className="text-xs">Take Quiz</span>
                </button>
                <button 
                  onClick={() => navigate('/support')}
                  className="bg-white/20 hover:bg-white/30 rounded-lg p-2 sm:p-3 text-center transition"
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1" />
                  <span className="text-xs">Get Help</span>
                </button>
              </div>
            </div>

            {/* Skills Progress */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 sm:mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Skills Progress
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {skills.list.slice(0, 4).map((skill, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span>{skill.icon} {skill.name}</span>
                      <span className="text-gray-600">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 sm:h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6">
              <h3 className="font-semibold text-sm sm:text-base md:text-lg mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                Upcoming Deadlines
              </h3>
              <div className="space-y-2">
                {assignmentSummary.upcoming.map((item, idx) => (
                  <div key={idx} className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-1 p-2 bg-orange-50 rounded-lg">
                    <span className="text-xs sm:text-sm font-medium">{item.name}</span>
                    <span className="text-xs text-orange-600">
                      Due: {new Date(item.due).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;