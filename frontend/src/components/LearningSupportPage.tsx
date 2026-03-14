import React, { useState, useEffect } from "react"
import { 
  HelpCircle, 
  Video, 
  Upload, 
  Send, 
  CheckCircle, 
  AlertCircle,
  BookOpen,
  Clock,
  MessageSquare,
  FileText,
  X,
  RefreshCw,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Trash2,
  Download
} from "lucide-react"

const LearningSupportPage = () => {
  const [type, setType] = useState("doubt")
  const [course, setCourse] = useState("")
  const [topic, setTopic] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState({})
  const [doubtCategory, setDoubtCategory] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  // Recent requests state
  const [recentRequests, setRecentRequests] = useState([
    {
      id: 1,
      type: "doubt",
      title: "React Hooks doubt",
      course: "React Development",
      topic: "useEffect dependency array",
      description: "I'm confused about when to use dependencies in useEffect",
      status: "resolved",
      date: "2026-03-09T10:30:00",
      resolvedAt: "2026-03-09T12:45:00",
      category: "Concept Clarification",
      attachments: [],
      replies: 3
    },
    {
      id: 2,
      type: "backup",
      title: "Database backup class",
      course: "Database Systems",
      topic: "SQL Joins",
      description: "Missed the class on SQL joins, need backup session",
      status: "scheduled",
      date: "2026-03-08T15:20:00",
      scheduledFor: "2026-03-11T10:00:00",
      category: "Missed Class",
      attachments: [],
      replies: 1
    },
    {
      id: 3,
      type: "doubt",
      title: "JavaScript closure concept",
      course: "JavaScript Advanced",
      topic: "Closures in loops",
      description: "Having trouble understanding closures in for loops",
      status: "pending",
      date: "2026-03-10T09:15:00",
      category: "Code Debugging",
      attachments: [
        { name: "code-snippet.js", size: "2 KB", type: "js" }
      ],
      replies: 0
    }
  ])

  // Load from localStorage on component mount
  useEffect(() => {
    const savedRequests = localStorage.getItem('learningSupportRequests')
    if (savedRequests) {
      setRecentRequests(JSON.parse(savedRequests))
    }
  }, [])

  // Save to localStorage whenever recentRequests changes
  useEffect(() => {
    localStorage.setItem('learningSupportRequests', JSON.stringify(recentRequests))
  }, [recentRequests])

  // Form validation
  const validateForm = () => {
    const newErrors = {}
    
    if (!course) newErrors.course = "Please select a course"
    if (!topic.trim()) newErrors.topic = "Topic is required"
    if (!description.trim()) newErrors.description = "Description is required"
    if (description.length < 10) newErrors.description = "Description must be at least 10 characters"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB")
        return
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!allowedTypes.includes(selectedFile.type)) {
        alert("Only JPG, PNG, and PDF files are allowed")
        return
      }

      setFile(selectedFile)
      
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview(reader.result)
        }
        reader.readAsDataURL(selectedFile)
      } else {
        setFilePreview(null)
      }
    }
  }

  const removeFile = () => {
    setFile(null)
    setFilePreview(null)
    document.getElementById('file-upload').value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      // Create new request object
      const newRequest = {
        id: recentRequests.length + 1,
        type: type,
        title: type === "doubt" ? topic : `Backup: ${topic}`,
        course: courses.find(c => c.id === course)?.name || course,
        topic: topic,
        description: description,
        status: "pending",
        date: new Date().toISOString(),
        category: type === "doubt" ? doubtCategory : "Missed Class",
        attachments: file ? [
          { 
            name: file.name, 
            size: `${(file.size / 1024).toFixed(2)} KB`, 
            type: file.type.split('/')[1] 
          }
        ] : [],
        replies: 0
      }

      // Add to recent requests
      setRecentRequests(prev => [newRequest, ...prev])

      console.log({
        type,
        course,
        topic,
        description,
        fileName: file?.name,
        fileSize: file?.size,
        fileType: file?.type
      })

      setIsSubmitting(false)
      setShowSuccess(true)

      // Reset form after 2 seconds
      setTimeout(() => {
        setShowSuccess(false)
        setCourse("")
        setTopic("")
        setDescription("")
        setFile(null)
        setFilePreview(null)
        setDoubtCategory("")
        setErrors({})
      }, 2000)
    }, 1500)
  }

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffTime / (1000 * 60))

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200'
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  // Get type icon
  const getTypeIcon = (type) => {
    return type === 'doubt' ? 
      <HelpCircle className="w-4 h-4" /> : 
      <Video className="w-4 h-4" />
  }

  // Available courses
  const courses = [
    { id: "react", name: "React Development", instructor: "John Doe", duration: "8 weeks" },
    { id: "js", name: "JavaScript Advanced", instructor: "Jane Smith", duration: "6 weeks" },
    { id: "db", name: "Database Systems", instructor: "Mike Johnson", duration: "10 weeks" },
    { id: "java", name: "Core Java", instructor: "Sarah Wilson", duration: "12 weeks" },
    { id: "python", name: "Python Programming", instructor: "Alex Brown", duration: "8 weeks" }
  ]

  // Doubt categories
  const doubtCategories = [
    "Concept Clarification",
    "Assignment Help",
    "Project Guidance",
    "Code Debugging",
    "Exam Preparation"
  ]

  // Filter recent requests
  const filteredRequests = recentRequests
    .filter(req => {
      if (filterType === "all") return true
      return req.type === filterType
    })
    .filter(req => 
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.topic.toLowerCase().includes(searchTerm.toLowerCase())
    )

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Stats */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Learning Support
          </h1>
          <p className="text-gray-600 text-lg">
            Get help with your doubts or request a backup class
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Time</p>
                <p className="text-xl font-bold text-gray-900">&lt; 2 hours</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Instructors</p>
                <p className="text-xl font-bold text-gray-900">12+</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Doubts Solved</p>
                <p className="text-xl font-bold text-gray-900">1,234+</p>
              </div>
              <HelpCircle className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Backup Classes</p>
                <p className="text-xl font-bold text-gray-900">45+</p>
              </div>
              <Video className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  {type === "doubt" ? (
                    <>
                      <HelpCircle className="w-5 h-5" />
                      Submit Your Doubt
                    </>
                  ) : (
                    <>
                      <Video className="w-5 h-5" />
                      Request Backup Class
                    </>
                  )}
                </h2>
              </div>

              {/* Success Message */}
              {showSuccess && (
                <div className="mx-6 mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-fadeIn">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <p className="text-green-700">
                    Request submitted successfully! Check your recent requests below.
                  </p>
                </div>
              )}

              {/* Toggle Buttons */}
              <div className="p-6 border-b">
                <div className="flex gap-3 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setType("doubt")}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      type === "doubt"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <HelpCircle className="w-4 h-4" />
                    Submit Doubt
                  </button>

                  <button
                    onClick={() => setType("backup")}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      type === "backup"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    Backup Class
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Course Selection */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Select Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.course ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Choose a course</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} - {c.instructor}
                      </option>
                    ))}
                  </select>
                  {errors.course && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.course}
                    </p>
                  )}
                </div>

                {/* Doubt Category - Only for doubt type */}
                {type === "doubt" && (
                  <div>
                    <label className="block mb-2 font-medium text-gray-700">
                      Doubt Category
                    </label>
                    <select
                      value={doubtCategory}
                      onChange={(e) => setDoubtCategory(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select category</option>
                      {doubtCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Topic */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Topic/Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., React Hooks, Array Methods, SQL Joins"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.topic ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.topic && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.topic}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    {type === "doubt" ? "Describe your doubt" : "Reason for backup class"} 
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="5"
                    placeholder={type === "doubt" 
                      ? "Please explain your doubt in detail. Include what you've tried and where you're stuck."
                      : "Please explain why you need a backup class and which topics you missed."
                    }
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {description.length}/500 characters
                  </p>
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Screenshot (optional, max 5MB)
                    </div>
                  </label>
                  {!file ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
                      <input
                        type="file"
                        id="file-upload"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="hidden"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer"
                      >
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          PNG, JPG, PDF (max 5MB)
                        </p>
                      </label>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-700">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="p-1 hover:bg-gray-200 rounded-full transition"
                        >
                          <X className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                      {filePreview && (
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="mt-3 max-h-32 rounded border"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition ${
                    isSubmitting
                      ? 'opacity-75 cursor-not-allowed'
                      : 'hover:from-blue-700 hover:to-blue-800'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Request
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Sidebar - Help & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Help */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Quick Help
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-xl">
                  <p className="font-medium text-blue-900 mb-2">📘 Before submitting:</p>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>• Check if similar doubt already exists</li>
                    <li>• Be specific about your problem</li>
                    <li>• Include error messages if any</li>
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <p className="font-medium text-gray-700 mb-3">Expected Response Time:</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Doubt resolution</span>
                    <span className="font-semibold text-green-600">&lt; 2 hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Backup class</span>
                    <span className="font-semibold text-green-600">24 hours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity - Now with dynamic updates */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                  Recent Requests
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`text-xs px-2 py-1 rounded ${
                      filterType === "all" ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterType("doubt")}
                    className={`text-xs px-2 py-1 rounded ${
                      filterType === "doubt" ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                    }`}
                  >
                    Doubts
                  </button>
                  <button
                    onClick={() => setFilterType("backup")}
                    className={`text-xs px-2 py-1 rounded ${
                      filterType === "backup" ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                    }`}
                  >
                    Backup
                  </button>
                </div>
              </div>

              {/* Search in recent */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Recent Requests List */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className="group relative bg-gray-50 rounded-xl p-3 hover:shadow-md transition-all border border-gray-100"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          request.type === 'doubt' ? 'bg-purple-100' : 'bg-orange-100'
                        }`}>
                          {getTypeIcon(request.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {request.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {request.course} • {formatDate(request.date)}
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </div>
                          
                          {/* Preview description */}
                          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                            {request.description}
                          </p>

                          {/* Attachments indicator */}
                          {request.attachments.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <FileText className="w-3 h-3 text-blue-500" />
                              <span className="text-xs text-gray-500">
                                {request.attachments.length} attachment(s)
                              </span>
                            </div>
                          )}

                          {/* Replies count */}
                          {request.replies > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <MessageSquare className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {request.replies} {request.replies === 1 ? 'reply' : 'replies'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Hover actions */}
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition flex gap-1">
                        <button className="p-1 hover:bg-white rounded">
                          <Eye className="w-3 h-3 text-gray-500" />
                        </button>
                        <button className="p-1 hover:bg-white rounded">
                          <MoreVertical className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No requests found</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {searchTerm ? 'Try adjusting your search' : 'Submit your first request above'}
                    </p>
                  </div>
                )}
              </div>

              {/* View all link */}
              {recentRequests.length > 3 && (
                <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium text-center">
                  View All Requests →
                </button>
              )}
            </div>

            {/* Contact Support */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="font-semibold text-lg mb-2">Need immediate help?</h3>
              <p className="text-blue-100 text-sm mb-4">
                Chat with our support team for urgent queries
              </p>
              <button className="w-full bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition">
                Start Live Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default LearningSupportPage