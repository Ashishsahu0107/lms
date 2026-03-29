import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  User,
  Mail,
  Calendar,
  BookOpen,
  Award,
  Clock,
  MapPin,
  Phone,
  Github,
  Linkedin,
  Twitter,
  Edit2,
  Save,
  X,
  Camera,
  CheckCircle,
  Star,
  Target,
  Zap,
  ChevronRight
} from "lucide-react";

const Profile = () => {
  const { user, enrolledCourses } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  // Student data from localStorage with safe defaults
  const [student, setStudent] = useState(() => {
    const savedStudent = localStorage.getItem("student");
    const defaultStudent = {
      id: user?.id || 1,
      name: user?.name || "John Doe",
      email: user?.email || "john.doe@example.com",
      phone: "+1 234 567 8900",
      location: "New York, USA",
      avatar: user?.avatar || "JD",
      role: "Student",
      course: "React Development",
      joinDate: "2026-01-15",
      bio: "Passionate web developer learning React and modern web technologies. Love to build user-friendly applications.",
      social: {
        github: "johndoe",
        linkedin: "johndoe",
        twitter: "johndoe"
      },
      education: {
        university: "Tech University",
        degree: "Computer Science",
        year: "2024-2028"
      }
    };
    
    return savedStudent ? { ...defaultStudent, ...JSON.parse(savedStudent) } : defaultStudent;
  });

  // Edit form state
  const [editForm, setEditForm] = useState({ ...student });

  // Stats with safe values
  const stats = {
    courses: enrolledCourses?.length || 6,
    completedCourses: 3,
    assignments: 12,
    completedAssignments: 8,
    quizzes: 8,
    attemptedQuizzes: 5,
    averageScore: 82,
    streak: 15,
    totalHours: 124,
    achievements: 8
  };

  // Recent activities
  const recentActivities = [
    { id: 1, type: "assignment", title: "React Dashboard UI", date: "2026-03-09", status: "completed" },
    { id: 2, type: "quiz", title: "JavaScript Advanced Quiz", date: "2026-03-08", score: "85%" },
    { id: 3, type: "course", title: "React Hooks Module", date: "2026-03-07", progress: "100%" },
    { id: 4, type: "attendance", title: "Database Systems Class", date: "2026-03-06", status: "present" }
  ];

  // Achievements
  const achievements = [
    { id: 1, title: "Quick Learner", description: "Completed 5 modules in a week", icon: "⚡", date: "Mar 2026" },
    { id: 2, title: "Quiz Master", description: "Scored 90%+ in 3 quizzes", icon: "🏆", date: "Feb 2026" },
    { id: 3, title: "Perfect Attendance", description: "Attended all classes for a month", icon: "📅", date: "Jan 2026" },
    { id: 4, title: "Assignment Star", description: "Submitted all assignments on time", icon: "⭐", date: "Dec 2025" }
  ];

  // Handle save changes
  const handleSave = () => {
    setStudent(editForm);
    localStorage.setItem("student", JSON.stringify(editForm));
    setIsEditing(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setEditForm({ ...student });
    setIsEditing(false);
  };

  // Handle course click
  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  // Format date
  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  // Safe access to nested objects
  const education = student.education || { university: "Not specified", degree: "Not specified", year: "Not specified" };
  const social = student.social || { github: "", linkedin: "", twitter: "" };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-4 sm:mb-6">
          {/* Cover Photo */}
          <div className="h-20 sm:h-24 md:h-28 lg:h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/20 hover:bg-white/30 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 backdrop-blur-sm transition"
              >
                <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Edit Profile</span>
                <span className="xs:hidden">Edit</span>
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-3 sm:px-4 md:px-6 pb-4 sm:pb-6">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 -mt-10 sm:-mt-12">
              {/* Avatar */}
              <div className="relative mx-auto sm:mx-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-2 sm:border-4 border-white shadow-lg flex items-center justify-center text-white text-xl sm:text-2xl md:text-3xl font-bold">
                  {student.avatar}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 sm:p-2 rounded-full hover:bg-blue-700 transition">
                    <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>

              {/* Name and Role */}
              <div className="flex-1 text-center sm:text-left w-full">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg w-full max-w-md"
                  />
                ) : (
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{student.name}</h1>
                )}
                <p className="text-xs sm:text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1 sm:gap-2 mt-1">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{student.role} • {student.course}</span>
                </p>
                <p className="text-xs sm:text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1 sm:gap-2 mt-1 break-all">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate max-w-[200px] sm:max-w-none">{student.email}</span>
                </p>
              </div>

              {/* Join Date */}
              <div className="text-center sm:text-right w-full sm:w-auto">
                <p className="text-xs sm:text-sm text-gray-500 flex items-center justify-center sm:justify-end gap-1 sm:gap-2">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Joined {formatDate(student.joinDate)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          {/* Courses Card */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border-l-2 sm:border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Courses</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.courses}</p>
                <p className="text-xs text-green-600">{stats.completedCourses} done</p>
              </div>
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 opacity-50" />
            </div>
          </div>

          {/* Assignments Card */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border-l-2 sm:border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Assignments</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.completedAssignments}/{stats.assignments}</p>
                <p className="text-xs text-green-600">{Math.round((stats.completedAssignments/stats.assignments)*100)}%</p>
              </div>
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 opacity-50" />
            </div>
          </div>

          {/* Score Card */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border-l-2 sm:border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Avg. Score</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.averageScore}%</p>
                <p className="text-xs text-purple-600">{stats.attemptedQuizzes} quizzes</p>
              </div>
              <Award className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 opacity-50" />
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border-l-2 sm:border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Streak</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{stats.streak}d</p>
                <p className="text-xs text-orange-600">{stats.totalHours}h</p>
              </div>
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* My Courses Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2 mb-4">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <span>My Courses ({enrolledCourses?.length || 0})</span>
            </h3>
            <button 
              onClick={() => navigate('/courses')}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Browse All
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          {enrolledCourses && enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {enrolledCourses.slice(0, 3).map((course) => (
                <div 
                  key={course.id} 
                  onClick={() => handleCourseClick(course.id)}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer group"
                >
                  <img 
                    src={course.thumbnail || "https://picsum.photos/400/200"} 
                    alt={course.title}
                    className="w-full h-24 sm:h-28 md:h-32 object-cover"
                  />
                  <div className="p-3 sm:p-4">
                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-1 line-clamp-1">{course.title}</h4>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-1">{course.instructor}</p>
                    
                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span className="font-medium">{course.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${course.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-gray-500 text-base sm:text-lg mb-2">No courses enrolled yet</p>
              <button
                onClick={() => navigate('/courses')}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition text-sm sm:text-base"
              >
                Browse Courses
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b px-3 sm:px-4 md:px-6 overflow-x-auto">
            <div className="flex gap-3 sm:gap-6 min-w-max">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-3 sm:py-4 px-2 sm:px-3 font-medium text-xs sm:text-sm border-b-2 transition ${
                  activeTab === "profile"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Profile Info
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`py-3 sm:py-4 px-2 sm:px-3 font-medium text-xs sm:text-sm border-b-2 transition ${
                  activeTab === "activity"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Recent Activity
              </button>
              <button
                onClick={() => setActiveTab("achievements")}
                className={`py-3 sm:py-4 px-2 sm:px-3 font-medium text-xs sm:text-sm border-b-2 transition ${
                  activeTab === "achievements"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Achievements
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Profile Info Tab */}
            {activeTab === "profile" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Bio */}
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Bio</h3>
                  {isEditing ? (
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      rows="3"
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 sm:p-3 rounded-lg">{student.bio}</p>
                  )}
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Contact Information</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-3 text-xs sm:text-sm">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                        {isEditing ? (
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            className="w-full xs:flex-1 px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded"
                          />
                        ) : (
                          <span className="break-all">{student.email}</span>
                        )}
                      </div>
                      <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-3 text-xs sm:text-sm">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            className="w-full xs:flex-1 px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded"
                          />
                        ) : (
                          <span>{student.phone}</span>
                        )}
                      </div>
                      <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-3 text-xs sm:text-sm">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.location}
                            onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                            className="w-full xs:flex-1 px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded"
                          />
                        ) : (
                          <span>{student.location}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Education</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-2 text-xs sm:text-sm">
                        <span className="text-gray-500 whitespace-nowrap">University:</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.education?.university || ""}
                            onChange={(e) => setEditForm({
                              ...editForm, 
                              education: { ...editForm.education, university: e.target.value }
                            })}
                            className="w-full xs:flex-1 px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded"
                          />
                        ) : (
                          <span className="font-medium">{education.university}</span>
                        )}
                      </div>
                      <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-2 text-xs sm:text-sm">
                        <span className="text-gray-500 whitespace-nowrap">Degree:</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.education?.degree || ""}
                            onChange={(e) => setEditForm({
                              ...editForm, 
                              education: { ...editForm.education, degree: e.target.value }
                            })}
                            className="w-full xs:flex-1 px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded"
                          />
                        ) : (
                          <span className="font-medium">{education.degree}</span>
                        )}
                      </div>
                      <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-2 text-xs sm:text-sm">
                        <span className="text-gray-500 whitespace-nowrap">Year:</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.education?.year || ""}
                            onChange={(e) => setEditForm({
                              ...editForm, 
                              education: { ...editForm.education, year: e.target.value }
                            })}
                            className="w-full xs:flex-1 px-2 py-1 text-xs sm:text-sm border border-gray-300 rounded"
                          />
                        ) : (
                          <span className="font-medium">{education.year}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Social Links</h3>
                  <div className="flex gap-2 sm:gap-4 flex-wrap">
                    <a href={`https://github.com/${social.github}`} target="_blank" rel="noopener noreferrer" className="p-1.5 sm:p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                      <Github className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                    </a>
                    <a href={`https://linkedin.com/in/${social.linkedin}`} target="_blank" rel="noopener noreferrer" className="p-1.5 sm:p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                      <Linkedin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </a>
                    <a href={`https://twitter.com/${social.twitter}`} target="_blank" rel="noopener noreferrer" className="p-1.5 sm:p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                      <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                    </a>
                  </div>
                </div>

                {/* Edit/Save Buttons */}
                {isEditing && (
                  <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
                    <button
                      onClick={handleSave}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center justify-center gap-2 border border-gray-300 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Recent Activity Tab */}
            {activeTab === "activity" && (
              <div className="space-y-3 sm:space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className={`p-1.5 sm:p-2 rounded-lg ${
                      activity.type === "assignment" ? "bg-red-100" :
                      activity.type === "quiz" ? "bg-yellow-100" :
                      activity.type === "course" ? "bg-green-100" :
                      "bg-blue-100"
                    }`}>
                      {activity.type === "assignment" && <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />}
                      {activity.type === "quiz" && <Target className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />}
                      {activity.type === "course" && <Award className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />}
                      {activity.type === "attendance" && <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-xs sm:text-sm">{activity.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                    {activity.score && (
                      <span className="text-xs sm:text-sm font-semibold text-green-600">{activity.score}</span>
                    )}
                    {activity.status && (
                      <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                        activity.status === "completed" ? "bg-green-100 text-green-700" :
                        activity.status === "present" ? "bg-green-100 text-green-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {activity.status}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === "achievements" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border hover:shadow-md transition">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center text-lg sm:text-xl md:text-2xl">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm sm:text-base text-gray-900">{achievement.title}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{achievement.description}</p>
                      <p className="text-xs text-gray-400 mt-1">Earned {achievement.date}</p>
                    </div>
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;