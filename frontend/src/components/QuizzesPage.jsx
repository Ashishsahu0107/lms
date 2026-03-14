import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Clock, 
  Award, 
  BarChart,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  Trophy,
  Zap,
  BookOpen,
  ChevronRight,
  Users,
  Filter,
  TrendingUp
} from "lucide-react"

const QuizzesPage = () => {
  const navigate = useNavigate()
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  
  // Real-time states
  const [liveUsers, setLiveUsers] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [quizzes, setQuizzes] = useState([
    { 
      id: 1, 
      title: "React Basics Quiz", 
      description: "Test your fundamental React knowledge including components, props, and state.",
      questions: 10, 
      duration: 10,
      category: "React",
      difficulty: "Beginner",
      attempts: 234,
      avgScore: 78,
      completed: true,
      lastScore: 85,
      activeUsers: 3
    },
    { 
      id: 2, 
      title: "JavaScript Advanced", 
      description: "Advanced JavaScript concepts including closures, promises, and async/await.",
      questions: 15, 
      duration: 15,
      category: "JavaScript",
      difficulty: "Advanced",
      attempts: 156,
      avgScore: 72,
      completed: false,
      activeUsers: 5
    },
    { 
      id: 3, 
      title: "API & Fetch", 
      description: "Learn about REST APIs, fetch method, and data handling.",
      questions: 8, 
      duration: 8,
      category: "API",
      difficulty: "Intermediate",
      attempts: 89,
      avgScore: 81,
      completed: false,
      activeUsers: 2
    },
    { 
      id: 4, 
      title: "React Hooks", 
      description: "Master useState, useEffect, and custom hooks.",
      questions: 12, 
      duration: 12,
      category: "React",
      difficulty: "Advanced",
      attempts: 67,
      avgScore: 69,
      completed: true,
      lastScore: 92,
      activeUsers: 1
    },
    { 
      id: 5, 
      title: "CSS & Tailwind", 
      description: "Test your styling skills with CSS and Tailwind CSS.",
      questions: 10, 
      duration: 10,
      category: "CSS",
      difficulty: "Beginner",
      attempts: 145,
      avgScore: 76,
      completed: false,
      activeUsers: 4
    }
  ])

  // Real-time updates effect
  useEffect(() => {
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Simulate live users updating (in real app, this would be WebSocket)
    const usersInterval = setInterval(() => {
      setQuizzes(prevQuizzes => 
        prevQuizzes.map(quiz => ({
          ...quiz,
          activeUsers: Math.max(0, quiz.activeUsers + Math.floor(Math.random() * 3) - 1),
          attempts: quiz.attempts + (Math.random() > 0.9 ? 1 : 0) // Random new attempts
        }))
      )
      
      // Update total live users
      setLiveUsers(prev => prev + Math.floor(Math.random() * 5) - 2)
    }, 5000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(usersInterval)
    }
  }, [])

  // Calculate real-time stats
  const stats = {
    totalQuizzes: quizzes.length,
    completedQuizzes: quizzes.filter(q => q.completed).length,
    averageScore: Math.round(quizzes.reduce((acc, curr) => acc + curr.avgScore, 0) / quizzes.length),
    totalAttempts: quizzes.reduce((acc, curr) => acc + curr.attempts, 0),
    liveUsers: quizzes.reduce((acc, curr) => acc + curr.activeUsers, 0),
    totalActive: liveUsers
  }

  const filteredQuizzes = quizzes.filter(quiz => {
    if (filter === "all") return true
    if (filter === "completed") return quiz.completed
    if (filter === "pending") return !quiz.completed
    if (filter === "popular") return quiz.activeUsers > 2
    return true
  }).filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case "Beginner": return "text-green-600 bg-green-100"
      case "Intermediate": return "text-yellow-600 bg-yellow-100"
      case "Advanced": return "text-red-600 bg-red-100"
      default: return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Real-Time Clock */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Knowledge Quizzes
            </h1>
            <p className="text-gray-600 text-lg">
              Test your knowledge and track your progress
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Live Now</div>
            <div className="text-2xl font-bold text-blue-600">{stats.liveUsers}</div>
            <div className="text-xs text-gray-400">users active</div>
          </div>
        </div>

        {/* Real-Time Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
            <BookOpen className="w-6 h-6 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
            <p className="text-xs opacity-90">Total Quizzes</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
            <CheckCircle className="w-6 h-6 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{stats.completedQuizzes}</p>
            <p className="text-xs opacity-90">Completed</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
            <BarChart className="w-6 h-6 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{stats.averageScore}%</p>
            <p className="text-xs opacity-90">Avg Score</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
            <Users className="w-6 h-6 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{stats.totalAttempts}</p>
            <p className="text-xs opacity-90">Total Attempts</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
            <TrendingUp className="w-6 h-6 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{stats.liveUsers}</p>
            <p className="text-xs opacity-90">Live Now</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 text-white">
            <Clock className="w-6 h-6 mb-2 opacity-80" />
            <p className="text-sm font-bold">{currentTime.toLocaleTimeString()}</p>
            <p className="text-xs opacity-90">Current Time</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search quizzes by title or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Quizzes</option>
                <option value="completed">Completed</option>
                <option value="pending">Not Started</option>
                <option value="popular">Popular Now 🔥</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Activity Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-700">
              {stats.liveUsers} users taking quizzes right now
            </span>
          </div>
          <span className="text-xs text-blue-500">
            Last updated: {currentTime.toLocaleTimeString()}
          </span>
        </div>

        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              onClick={() => navigate(`/quiz/${quiz.id}`)}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
            >
              {/* Live Badge */}
              {quiz.activeUsers > 0 && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  {quiz.activeUsers} live
                </div>
              )}

              <div className="p-6">
                {/* Category and Difficulty */}
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {quiz.category}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                  {quiz.title}
                </h2>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {quiz.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Questions</p>
                    <p className="font-semibold">{quiz.questions}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-semibold">{quiz.duration} min</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Avg Score</p>
                    <p className="font-semibold">{quiz.avgScore}%</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    {quiz.completed ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Completed</span>
                        <span className="text-sm font-semibold text-blue-600 ml-2">
                          {quiz.lastScore}%
                        </span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">Start Quiz</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{quiz.attempts} attempts</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredQuizzes.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No quizzes found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizzesPage