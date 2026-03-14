import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trophy, 
  Award, 
  Target,
  ChevronRight,
  Users,
  AlertCircle,
  TrendingUp,
  Zap
} from "lucide-react"

const QuizTakePage = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  // Real-time states
  const [currentTime, setCurrentTime] = useState(new Date())
  const [liveUsers, setLiveUsers] = useState(0)
  const [globalAvg, setGlobalAvg] = useState(0)
  const [timeLeft, setTimeLeft] = useState(600) // Will be updated based on quiz
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answers, setAnswers] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [startTime] = useState(new Date())
  const [quiz, setQuiz] = useState(null)

  // Load quiz data
  useEffect(() => {
    const quizzes = {
      "1": {
        title: "React Basics Quiz",
        duration: 600,
        questions: [
          {
            question: "What is React?",
            options: [
              "A JavaScript library for building user interfaces",
              "A programming language",
              "A database management system",
              "An operating system"
            ],
            answer: 0,
            explanation: "React is a JavaScript library developed by Facebook for building user interfaces."
          },
          {
            question: "Which hook is used for side effects in React?",
            options: ["useState", "useEffect", "useContext", "useReducer"],
            answer: 1,
            explanation: "useEffect is used to perform side effects in functional components."
          },
          {
            question: "What is JSX?",
            options: [
              "A JavaScript framework",
              "A syntax extension for JavaScript",
              "A new programming language",
              "A database query language"
            ],
            answer: 1,
            explanation: "JSX is a syntax extension that allows you to write HTML-like code in JavaScript."
          }
        ]
      },
      "2": {
        title: "JavaScript Advanced",
        duration: 900,
        questions: [
          {
            question: "What is a closure in JavaScript?",
            options: [
              "A function with access to its outer scope",
              "A way to close browser window",
              "A type of loop",
              "A data structure"
            ],
            answer: 0,
            explanation: "A closure is a function that has access to variables from its outer scope."
          },
          {
            question: "What is a Promise?",
            options: [
              "An object representing eventual completion",
              "A type of callback",
              "A synchronous operation",
              "A loop"
            ],
            answer: 0,
            explanation: "A Promise represents the eventual completion or failure of an async operation."
          }
        ]
      },
      "3": {
        title: "API & Fetch",
        duration: 480,
        questions: [
          {
            question: "What does REST stand for?",
            options: [
              "Representational State Transfer",
              "Remote Server Transfer",
              "Request State Transfer",
              "Response State Transfer"
            ],
            answer: 0,
            explanation: "REST stands for Representational State Transfer."
          }
        ]
      }
    }
    
    const selectedQuiz = quizzes[id] || quizzes["1"]
    setQuiz(selectedQuiz)
    setTimeLeft(selectedQuiz.duration)
  }, [id])

  // Real-time updates effect
  useEffect(() => {
    // Update clock every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // Simulate live users (in real app, this would be WebSocket)
    const usersInterval = setInterval(() => {
      setLiveUsers(prev => Math.max(1, prev + Math.floor(Math.random() * 5) - 2))
    }, 5000)

    // Simulate global average updates
    const avgInterval = setInterval(() => {
      setGlobalAvg(prev => {
        const change = Math.random() * 2 - 1
        return Math.max(60, Math.min(85, prev + change))
      })
    }, 8000)

    return () => {
      clearInterval(timeInterval)
      clearInterval(usersInterval)
      clearInterval(avgInterval)
    }
  }, [])

  // Timer effect
  useEffect(() => {
    if (submitted || !quiz) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [submitted, quiz])

  const handleAutoSubmit = () => {
    if (!quiz) return
    const updated = [...answers]
    updated[current] = selected
    calculateScore(updated)
  }

  const handleNext = () => {
    if (!quiz) return
    const updated = [...answers]
    updated[current] = selected
    setAnswers(updated)
    setSelected(null)
    setShowExplanation(false)

    if (current + 1 < quiz.questions.length) {
      setCurrent(current + 1)
    }
  }

  const calculateScore = (finalAnswers) => {
    if (!quiz) return
    let correct = 0
    finalAnswers.forEach((ans, i) => {
      if (ans === quiz.questions[i]?.answer) correct++
    })

    const percentage = Math.round((correct / quiz.questions.length) * 100)
    setScore(percentage)
    setSubmitted(true)
  }

  const submitQuiz = () => {
    if (!quiz) return
    const updated = [...answers]
    updated[current] = selected
    calculateScore(updated)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Loading state
  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const progress = ((current + 1) / quiz.questions.length) * 100
  const question = quiz.questions[current]

  // Result View
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Real-Time Result Header */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            <div className="text-center">
              {/* Live Stats Bar */}
              <div className="flex justify-between items-center bg-blue-50 rounded-lg p-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-700">{liveUsers} users taking this quiz now</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-700">Global Avg: {Math.round(globalAvg)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-blue-700">{currentTime.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
                {score >= 80 ? (
                  <Trophy className="w-12 h-12 text-yellow-500" />
                ) : score >= 50 ? (
                  <Award className="w-12 h-12 text-blue-500" />
                ) : (
                  <Target className="w-12 h-12 text-gray-500" />
                )}
              </div>
              
              <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
              <p className="text-gray-600 mb-6">{quiz.title}</p>

              {/* Score Display */}
              <div className="w-40 h-40 mx-auto mb-6 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-5xl font-bold text-blue-600">{score}%</span>
                  </div>
                </div>
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke={score >= 80 ? "#22c55e" : score >= 50 ? "#3b82f6" : "#ef4444"}
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - score / 100)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Correct</p>
                  <p className="text-xl font-bold text-green-600">
                    {answers.filter((a, i) => a === quiz.questions[i]?.answer).length}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-xl font-bold">{quiz.questions.length}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Time Taken</p>
                  <p className="text-xl font-bold">
                    {Math.round((new Date() - startTime) / 1000 / 60)} min
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">vs Global</p>
                  <p className="text-xl font-bold">{score > globalAvg ? '↑' : '↓'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Answers */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Detailed Review</h2>
            {quiz.questions.map((q, i) => {
              const isCorrect = answers[i] === q.answer
              return (
                <div
                  key={i}
                  className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
                    isCorrect ? 'border-green-500' : 'border-red-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold mb-2">Q{i + 1}: {q.question}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                        <div className="text-sm">
                          <span className="text-gray-500">Your answer: </span>
                          <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                            {answers[i] !== undefined ? q.options[answers[i]] : 'Not answered'}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div className="text-sm">
                            <span className="text-gray-500">Correct answer: </span>
                            <span className="text-green-600">{q.options[q.answer]}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <span className="font-medium">Explanation: </span>
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => navigate("/quizzes")}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Back to Quizzes
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Quiz Taking View
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Real-Time Header */}
        <div className="bg-white rounded-t-xl shadow-sm p-4">
          <div className="flex justify-between items-center mb-2">
            <h1 className="font-semibold text-gray-900">{quiz.title}</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Users className="w-4 h-4" />
                <span>{liveUsers} live</span>
              </div>
              <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-blue-100 text-blue-600'
              }`}>
                <Clock className="w-4 h-4 inline mr-2" />
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
          
          {/* Live Stats Bar */}
          <div className="flex justify-between text-xs text-gray-500 border-t pt-2">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span>{liveUsers} users taking now</span>
            </div>
            <div>Global Avg: {Math.round(globalAvg)}%</div>
            <div>{currentTime.toLocaleTimeString()}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white px-4">
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Question {current + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-b-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">{question.question}</h2>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {question.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className={`w-full text-left p-4 rounded-xl border-2 transition ${
                  selected === i
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                    selected === i
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300'
                  }`}>
                    {selected === i && '✓'}
                  </div>
                  <span className={selected === i ? 'text-blue-700' : 'text-gray-700'}>
                    {opt}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showExplanation ? 'Hide' : 'Show'} Hint
            </button>

            {current + 1 < quiz.questions.length ? (
              <button
                onClick={handleNext}
                disabled={selected === null}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  selected === null
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Next Question
              </button>
            ) : (
              <button
                onClick={submitQuiz}
                disabled={selected === null}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  selected === null
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Submit Quiz
              </button>
            )}
          </div>

          {/* Hint */}
          {showExplanation && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 Hint: </span>
                {question.explanation}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuizTakePage