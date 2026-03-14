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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 backdrop-blur-sm transition"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-12">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-3xl font-bold">
                  {student.avatar}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Name and Role */}
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="text-2xl font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg w-full max-w-md"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
                )}
                <p className="text-gray-500 flex items-center gap-2 mt-1">
                  <User className="w-4 h-4" />
                  {student.role} • {student.course}
                </p>
                <p className="text-gray-500 flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {student.email}
                </p>
              </div>

              {/* Join Date */}
              <div className="text-right">
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDate(student.joinDate)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Courses</p>
                <p className="text-xl font-bold text-gray-900">{stats.courses}</p>
                <p className="text-xs text-green-600">{stats.completedCourses} completed</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Assignments</p>
                <p className="text-xl font-bold text-gray-900">{stats.completedAssignments}/{stats.assignments}</p>
                <p className="text-xs text-green-600">{Math.round((stats.completedAssignments/stats.assignments)*100)}% done</p>
              </div>
              <Target className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Avg. Score</p>
                <p className="text-xl font-bold text-gray-900">{stats.averageScore}%</p>
                <p className="text-xs text-purple-600">{stats.attemptedQuizzes} quizzes</p>
              </div>
              <Award className="w-8 h-8 text-purple-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Streak</p>
                <p className="text-xl font-bold text-gray-900">{stats.streak} days</p>
                <p className="text-xs text-orange-600">{stats.totalHours} hours</p>
              </div>
              <Zap className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* My Courses Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              My Courses ({enrolledCourses?.length || 0})
            </h3>
            <button 
              onClick={() => navigate('/courses')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Browse All
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {enrolledCourses && enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.slice(0, 3).map((course) => (
                <div 
                  key={course.id} 
                  onClick={() => handleCourseClick(course.id)}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer group"
                >
                  <img 
                    src={course.thumbnail || "https://picsum.photos/400/200"} 
                    alt={course.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-1">{course.title}</h4>
                    <p className="text-xs text-gray-500 mb-2">{course.instructor}</p>
                    
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
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No courses enrolled yet</p>
              <button
                onClick={() => navigate('/courses')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Browse Courses
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b px-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition ${
                  activeTab === "profile"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Profile Info
              </button>
              <button
                onClick={() => setActiveTab("activity")}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition ${
                  activeTab === "activity"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Recent Activity
              </button>
              <button
                onClick={() => setActiveTab("achievements")}
                className={`py-4 px-2 font-medium text-sm border-b-2 transition ${
                  activeTab === "achievements"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Achievements
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Profile Info Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                {/* Bio */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Bio</h3>
                  {isEditing ? (
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{student.bio}</p>
                  )}
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {isEditing ? (
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          <span>{student.email}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          <span>{student.phone}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.location}
                            onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          <span>{student.location}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Education - FIXED with safe access */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Education</h3>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <span className="text-gray-500">University: </span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.education?.university || ""}
                            onChange={(e) => setEditForm({
                              ...editForm, 
                              education: { ...editForm.education, university: e.target.value }
                            })}
                            className="ml-2 px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          <span className="font-medium">{education.university}</span>
                        )}
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Degree: </span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.education?.degree || ""}
                            onChange={(e) => setEditForm({
                              ...editForm, 
                              education: { ...editForm.education, degree: e.target.value }
                            })}
                            className="ml-2 px-2 py-1 border border-gray-300 rounded"
                          />
                        ) : (
                          <span className="font-medium">{education.degree}</span>
                        )}
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Year: </span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.education?.year || ""}
                            onChange={(e) => setEditForm({
                              ...editForm, 
                              education: { ...editForm.education, year: e.target.value }
                            })}
                            className="ml-2 px-2 py-1 border border-gray-300 rounded"
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
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Social Links</h3>
                  <div className="flex gap-4">
                    <a href={`https://github.com/${social.github}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                      <Github className="w-5 h-5 text-gray-700" />
                    </a>
                    <a href={`https://linkedin.com/in/${social.linkedin}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                      <Linkedin className="w-5 h-5 text-blue-600" />
                    </a>
                    <a href={`https://twitter.com/${social.twitter}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                      <Twitter className="w-5 h-5 text-blue-400" />
                    </a>
                  </div>
                </div>

                {/* Edit/Save Buttons */}
                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Recent Activity Tab */}
            {activeTab === "activity" && (
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg ${
                      activity.type === "assignment" ? "bg-red-100" :
                      activity.type === "quiz" ? "bg-yellow-100" :
                      activity.type === "course" ? "bg-green-100" :
                      "bg-blue-100"
                    }`}>
                      {activity.type === "assignment" && <BookOpen className="w-4 h-4 text-red-600" />}
                      {activity.type === "quiz" && <Target className="w-4 h-4 text-yellow-600" />}
                      {activity.type === "course" && <Award className="w-4 h-4 text-green-600" />}
                      {activity.type === "attendance" && <Calendar className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                    {activity.score && (
                      <span className="text-sm font-semibold text-green-600">{activity.score}</span>
                    )}
                    {activity.status && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border hover:shadow-md transition">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center text-2xl">
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <p className="text-xs text-gray-400 mt-1">Earned {achievement.date}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-500" />
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