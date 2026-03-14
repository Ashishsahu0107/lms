import React, { useState, useEffect } from "react"
import { 
  FileText, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Eye,
  Filter,
  Search,
  ChevronDown,
  Award,
  BarChart,
  Upload,
  File,
  Image,
  FileArchive,
  X,
  Plus,
  ExternalLink,
  Star,
  MessageCircle,
  Users,
  BookOpen,
  Edit,
  Trash2,
  Save,
  UserCheck,
  UserX
} from "lucide-react"

const AssignmentsPage = () => {
  // User role (in real app, this would come from auth context)
  const [userRole, setUserRole] = useState("student") // "student" or "teacher"
  
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadNote, setUploadNote] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [selectedStudentSubmission, setSelectedStudentSubmission] = useState(null)

  // Teacher's new assignment form
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    course: "",
    deadline: "",
    deadlineTime: "23:59",
    totalMarks: 100,
    resources: []
  })

  // Grade form
  const [gradeData, setGradeData] = useState({
    marks: "",
    feedback: ""
  })

  // Mock data - assignments with student submissions
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      title: "React Dashboard UI",
      description: "Create a responsive dashboard using React and Tailwind CSS. The dashboard should include at least 3 charts, a sidebar navigation, and a responsive layout.",
      deadline: "2026-03-25",
      deadlineTime: "23:59",
      course: "React Development",
      totalMarks: 100,
      createdBy: "John Doe",
      createdAt: "2026-03-01",
      resources: [
        {
          name: "assignment-instructions.pdf",
          size: "500 KB",
          type: "pdf",
          url: "#"
        },
        {
          name: "sample-dashboard.jpg",
          size: "200 KB",
          type: "image",
          url: "#"
        }
      ],
      submissions: [
        {
          studentId: "s1",
          studentName: "Alice Johnson",
          studentAvatar: "https://picsum.photos/40?random=101",
          status: "graded",
          marks: 85,
          submittedDate: "2026-03-23",
          submittedTime: "14:30",
          feedback: "Good work! The charts are well implemented. However, the mobile responsiveness could be improved.",
          attachments: [
            {
              name: "dashboard-project.zip",
              size: "2.4 MB",
              type: "zip",
              url: "#"
            },
            {
              name: "screenshots.zip", 
              size: "1.8 MB",
              type: "zip",
              url: "#"
            }
          ],
          note: "I've included both the source code and screenshots."
        },
        {
          studentId: "s2",
          studentName: "Bob Smith",
          studentAvatar: "https://picsum.photos/40?random=102",
          status: "submitted",
          submittedDate: "2026-03-24",
          submittedTime: "09:15",
          attachments: [
            {
              name: "react-dashboard.zip",
              size: "3.1 MB",
              type: "zip",
              url: "#"
            }
          ],
          note: "Please find my submission attached."
        },
        {
          studentId: "s3",
          studentName: "Charlie Brown",
          studentAvatar: "https://picsum.photos/40?random=103",
          status: "pending"
        },
        {
          studentId: "s4",
          studentName: "Diana Prince",
          studentAvatar: "https://picsum.photos/40?random=104",
          status: "late",
          submittedDate: "2026-03-26",
          submittedTime: "10:30",
          attachments: [
            {
              name: "dashboard-final.zip",
              size: "2.8 MB",
              type: "zip",
              url: "#"
            }
          ],
          note: "Sorry for the delay. Had some issues with the charts."
        }
      ]
    },
    {
      id: 2,
      title: "API Integration",
      description: "Create a React application that integrates with a REST API. Implement authentication, error handling, and display data in a table with sorting and filtering.",
      deadline: "2026-03-28",
      deadlineTime: "23:59",
      course: "JavaScript Advanced",
      totalMarks: 100,
      createdBy: "Jane Smith",
      createdAt: "2026-03-05",
      resources: [
        {
          name: "api-documentation.pdf",
          size: "1.2 MB",
          type: "pdf",
          url: "#"
        },
        {
          name: "postman-collection.json",
          size: "50 KB",
          type: "json",
          url: "#"
        }
      ],
      submissions: [
        {
          studentId: "s1",
          studentName: "Alice Johnson",
          studentAvatar: "https://picsum.photos/40?random=101",
          status: "submitted",
          submittedDate: "2026-03-27",
          submittedTime: "16:45",
          attachments: [
            {
              name: "api-project.zip",
              size: "2.2 MB",
              type: "zip",
              url: "#"
            }
          ]
        },
        {
          studentId: "s2",
          studentName: "Bob Smith",
          studentAvatar: "https://picsum.photos/40?random=102",
          status: "pending"
        }
      ]
    },
    {
      id: 3,
      title: "Authentication System",
      description: "Implement a complete authentication system using JWT tokens. Include login, registration, password reset, and protected routes.",
      deadline: "2026-03-30",
      deadlineTime: "23:59",
      course: "Database Systems",
      totalMarks: 100,
      createdBy: "Mike Johnson",
      createdAt: "2026-03-10",
      resources: [
        {
          name: "jwt-guide.pdf",
          size: "800 KB",
          type: "pdf",
          url: "#"
        }
      ],
      submissions: [
        {
          studentId: "s3",
          studentName: "Charlie Brown",
          studentAvatar: "https://picsum.photos/40?random=103",
          status: "graded",
          marks: 70,
          submittedDate: "2026-03-29",
          submittedTime: "22:30",
          feedback: "Authentication works but there are security vulnerabilities. JWT tokens are not properly validated.",
          attachments: [
            {
              name: "auth-system.zip",
              size: "3.1 MB",
              type: "zip",
              url: "#"
            }
          ]
        }
      ]
    }
  ])

  // Mock students list for teacher
  const [students] = useState([
    { id: "s1", name: "Alice Johnson", avatar: "https://picsum.photos/40?random=101", email: "alice@example.com" },
    { id: "s2", name: "Bob Smith", avatar: "https://picsum.photos/40?random=102", email: "bob@example.com" },
    { id: "s3", name: "Charlie Brown", avatar: "https://picsum.photos/40?random=103", email: "charlie@example.com" },
    { id: "s4", name: "Diana Prince", avatar: "https://picsum.photos/40?random=104", email: "diana@example.com" },
    { id: "s5", name: "Ethan Hunt", avatar: "https://picsum.photos/40?random=105", email: "ethan@example.com" }
  ])

  // For student view - get current student's submissions
  const currentStudentId = "s1" // In real app, this would come from auth context
  
  const getStudentAssignments = () => {
    return assignments.map(assignment => {
      const studentSubmission = assignment.submissions?.find(s => s.studentId === currentStudentId)
      return {
        ...assignment,
        studentSubmission: studentSubmission || { status: "pending" }
      }
    })
  }

  // Stats based on user role
  const getStats = () => {
    if (userRole === "student") {
      const studentAssignments = getStudentAssignments()
      return {
        total: studentAssignments.length,
        submitted: studentAssignments.filter(a => a.studentSubmission?.status === "submitted" || a.studentSubmission?.status === "graded").length,
        pending: studentAssignments.filter(a => a.studentSubmission?.status === "pending").length,
        late: studentAssignments.filter(a => a.studentSubmission?.status === "late").length,
        graded: studentAssignments.filter(a => a.studentSubmission?.status === "graded").length,
        averageMarks: studentAssignments
          .filter(a => a.studentSubmission?.marks)
          .reduce((acc, curr) => acc + curr.studentSubmission.marks, 0) / 
          studentAssignments.filter(a => a.studentSubmission?.marks).length || 0
      }
    } else {
      // Teacher stats
      const totalSubmissions = assignments.reduce((acc, curr) => acc + (curr.submissions?.filter(s => s.status !== "pending").length || 0), 0)
      const pendingGrading = assignments.reduce((acc, curr) => acc + (curr.submissions?.filter(s => s.status === "submitted").length || 0), 0)
      
      return {
        totalAssignments: assignments.length,
        totalSubmissions,
        pendingGrading,
        totalStudents: students.length,
        averageMarks: assignments
          .flatMap(a => a.submissions?.filter(s => s.marks) || [])
          .reduce((acc, curr) => acc + curr.marks, 0) / 
          assignments.flatMap(a => a.submissions?.filter(s => s.marks) || []).length || 0
      }
    }
  }

  const stats = getStats()

  // Filter assignments based on user role
  const filteredAssignments = (userRole === "student" ? getStudentAssignments() : assignments)
    .filter(a => {
      if (filter === "all") return true
      if (userRole === "student") {
        return a.studentSubmission?.status === filter
      } else {
        // For teacher, filter by assignment status or submission status
        return true // Implement as needed
      }
    })
    .filter(a => 
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.createdBy?.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const getStatusConfig = (status) => {
    const configs = {
      submitted: { 
        color: "bg-blue-100 text-blue-700", 
        icon: CheckCircle,
        text: "Submitted",
        bg: "bg-blue-50"
      },
      pending: { 
        color: "bg-yellow-100 text-yellow-700", 
        icon: Clock,
        text: "Pending",
        bg: "bg-yellow-50"
      },
      late: { 
        color: "bg-red-100 text-red-700", 
        icon: AlertCircle,
        text: "Late",
        bg: "bg-red-50"
      },
      graded: { 
        color: "bg-green-100 text-green-700", 
        icon: Award,
        text: "Graded",
        bg: "bg-green-50"
      }
    }
    return configs[status] || configs.pending
  }

  const getFileIcon = (type) => {
    if (type === 'pdf') return <FileText className="w-5 h-5 text-red-500" />
    if (type === 'image') return <Image className="w-5 h-5 text-blue-500" />
    if (type === 'zip') return <FileArchive className="w-5 h-5 text-yellow-500" />
    if (type === 'json') return <FileText className="w-5 h-5 text-green-500" />
    return <File className="w-5 h-5 text-gray-500" />
  }

  // Student: Handle file upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size should be less than 10MB")
        return
      }
      setUploadFile(file)
    }
  }

  const handleUpload = () => {
    if (!uploadFile) {
      alert("Please select a file to upload")
      return
    }

    setIsUploading(true)
    
    // Simulate upload
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setUploadProgress(progress)
      if (progress >= 100) {
        clearInterval(interval)
        setIsUploading(false)
        setShowUploadModal(false)
        setUploadFile(null)
        setUploadProgress(0)
        setUploadNote("")
        
        alert("Assignment uploaded successfully!")
        
        // Update assignment submissions
        const updatedAssignments = assignments.map(a => {
          if (a.id === selectedAssignment.id) {
            const submissions = a.submissions || []
            const existingSubmission = submissions.find(s => s.studentId === currentStudentId)
            
            if (existingSubmission) {
              // Update existing submission
              return {
                ...a,
                submissions: submissions.map(s => 
                  s.studentId === currentStudentId 
                    ? {
                        ...s,
                        status: "submitted",
                        submittedDate: new Date().toISOString().split('T')[0],
                        submittedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        attachments: [{ name: uploadFile.name, size: `${(uploadFile.size / 1024 / 1024).toFixed(2)} MB`, type: 'zip', url: '#' }],
                        note: uploadNote
                      }
                    : s
                )
              }
            } else {
              // Add new submission
              return {
                ...a,
                submissions: [
                  ...submissions,
                  {
                    studentId: currentStudentId,
                    studentName: "Alice Johnson",
                    studentAvatar: "https://picsum.photos/40?random=101",
                    status: "submitted",
                    submittedDate: new Date().toISOString().split('T')[0],
                    submittedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    attachments: [{ name: uploadFile.name, size: `${(uploadFile.size / 1024 / 1024).toFixed(2)} MB`, type: 'zip', url: '#' }],
                    note: uploadNote
                  }
                ]
              }
            }
          }
          return a
        })
        setAssignments(updatedAssignments)
      }
    }, 500)
  }

  // Teacher: Handle create assignment
  const handleCreateAssignment = () => {
    if (!newAssignment.title || !newAssignment.description || !newAssignment.course || !newAssignment.deadline) {
      alert("Please fill all required fields")
      return
    }

    const assignment = {
      id: assignments.length + 1,
      ...newAssignment,
      createdBy: "Current Teacher",
      createdAt: new Date().toISOString().split('T')[0],
      submissions: []
    }

    setAssignments([...assignments, assignment])
    setShowCreateModal(false)
    setNewAssignment({
      title: "",
      description: "",
      course: "",
      deadline: "",
      deadlineTime: "23:59",
      totalMarks: 100,
      resources: []
    })
    alert("Assignment created successfully!")
  }

  // Teacher: Handle grade submission
  const handleGradeSubmission = () => {
    if (!gradeData.marks || !gradeData.feedback) {
      alert("Please enter marks and feedback")
      return
    }

    const updatedAssignments = assignments.map(a => {
      if (a.id === selectedAssignment.id) {
        return {
          ...a,
          submissions: a.submissions.map(s => 
            s.studentId === selectedStudentSubmission.studentId
              ? {
                  ...s,
                  status: "graded",
                  marks: parseInt(gradeData.marks),
                  feedback: gradeData.feedback
                }
              : s
          )
        }
      }
      return a
    })

    setAssignments(updatedAssignments)
    setShowGradeModal(false)
    setSelectedStudentSubmission(null)
    setGradeData({ marks: "", feedback: "" })
    alert("Grades submitted successfully!")
  }

  // Teacher: Delete assignment
  const handleDeleteAssignment = (assignmentId) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      setAssignments(assignments.filter(a => a.id !== assignmentId))
    }
  }

  const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateStr).toLocaleDateString(undefined, options)
  }

  const isDeadlineNear = (deadline) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 2 && diffDays > 0
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Role Toggle (for demo) */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {userRole === "student" ? "My Assignments" : "Assignment Management"}
            </h1>
            <p className="text-gray-600 text-lg">
              {userRole === "student" 
                ? "Track, submit, and manage your course assignments"
                : "Create, manage, and grade student assignments"}
            </p>
          </div>
          
          {/* Role Toggle (for demo only) */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setUserRole("student")}
              className={`px-4 py-2 rounded-lg transition ${
                userRole === "student" 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Student View
            </button>
            <button
              onClick={() => setUserRole("teacher")}
              className={`px-4 py-2 rounded-lg transition ${
                userRole === "teacher" 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Teacher View
            </button>
          </div>
        </div>

        {/* Stats Cards - Different for Student/Teacher */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {userRole === "student" ? (
            // Student Stats
            <>
              <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Assignments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.submitted}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Marks</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.averageMarks ? stats.averageMarks.toFixed(1) : 'N/A'}
                    </p>
                  </div>
                  <Award className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </>
          ) : (
            // Teacher Stats
            <>
              <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Assignments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Submissions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalSubmissions}</p>
                  </div>
                  <Users className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Grading</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingGrading}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Marks</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.averageMarks ? stats.averageMarks.toFixed(1) : 'N/A'}
                    </p>
                  </div>
                  <BarChart className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Search, Filter and Create Button */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={userRole === "student" 
                  ? "Search assignments by title or course..." 
                  : "Search assignments by title, course, or instructor..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All</option>
                {userRole === "student" ? (
                  <>
                    <option value="pending">Pending</option>
                    <option value="submitted">Submitted</option>
                    <option value="graded">Graded</option>
                    <option value="late">Late</option>
                  </>
                ) : (
                  <>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </>
                )}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            {/* Create Assignment Button (Teacher only) */}
            {userRole === "teacher" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Assignment
              </button>
            )}
          </div>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((assignment) => {
              const studentSubmission = assignment.studentSubmission
              const status = userRole === "student" 
                ? studentSubmission?.status || "pending"
                : "active"
              const StatusIcon = getStatusConfig(status).icon
              const statusConfig = getStatusConfig(status)
              const deadlineNear = isDeadlineNear(assignment.deadline)
              
              return (
                <div
                  key={assignment.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
                >
                  {/* Main Card */}
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Left side - Assignment info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                            <StatusIcon className={`w-6 h-6 ${statusConfig.color.split(' ')[1]}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h2 className="text-xl font-semibold text-gray-900">
                                {assignment.title}
                              </h2>
                              {deadlineNear && status === "pending" && userRole === "student" && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                  Deadline Soon!
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {assignment.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <span className="text-gray-500 flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(assignment.deadline)} at {assignment.deadlineTime}
                              </span>
                              <span className="text-gray-500 flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                {assignment.course}
                              </span>
                              {userRole === "teacher" && (
                                <span className="text-gray-500 flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  {assignment.submissions?.filter(s => s.status !== "pending").length || 0} submissions
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right side - Status and actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
                        {/* Status Badge */}
                        <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${statusConfig.color}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="font-medium text-sm">{statusConfig.text}</span>
                        </div>

                        {/* Marks - Student view */}
                        {userRole === "student" && studentSubmission?.marks && (
                          <div className="text-center min-w-[80px]">
                            <p className="text-sm text-gray-500">Marks</p>
                            <p className="text-xl font-bold text-gray-900">
                              {studentSubmission.marks}/{assignment.totalMarks}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setSelectedAssignment(assignment)
                              setShowViewModal(true)
                            }}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition group"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          
                          {userRole === "student" && status === "pending" && !isDeadlineNear(assignment.deadline) && (
                            <button 
                              onClick={() => {
                                setSelectedAssignment(assignment)
                                setShowUploadModal(true)
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              Upload
                            </button>
                          )}

                          {userRole === "teacher" && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedAssignment(assignment)
                                  setShowViewModal(true)
                                }}
                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="View Submissions"
                              >
                                <Users className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteAssignment(assignment.id)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete Assignment"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="bg-white rounded-xl p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {userRole === "student" ? "No assignments found" : "No assignments created yet"}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? "Try adjusting your search or filter criteria" 
                  : userRole === "student"
                    ? "You don't have any assignments in this category"
                    : "Click 'Create Assignment' to get started"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* View Assignment Modal - Enhanced for both roles */}
      {showViewModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {userRole === "student" ? "Assignment Details" : "Assignment Submissions"}
              </h2>
              <button 
                onClick={() => setShowViewModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Assignment Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">{selectedAssignment.title}</h3>
                <p className="text-gray-600 mb-4">{selectedAssignment.description}</p>
                
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Course</p>
                    <p className="font-medium">{selectedAssignment.course}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Deadline</p>
                    <p className="font-medium">
                      {formatDate(selectedAssignment.deadline)} at {selectedAssignment.deadlineTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Marks</p>
                    <p className="font-medium">{selectedAssignment.totalMarks}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Created By</p>
                    <p className="font-medium">{selectedAssignment.createdBy}</p>
                  </div>
                </div>
              </div>

              {/* Resources */}
              {selectedAssignment.resources?.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Resources
                  </h4>
                  <div className="space-y-2">
                    {selectedAssignment.resources.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getFileIcon(resource.type)}
                          <div>
                            <p className="font-medium text-sm">{resource.name}</p>
                            <p className="text-xs text-gray-500">{resource.size}</p>
                          </div>
                        </div>
                        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-lg transition">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submissions - Teacher view */}
              {userRole === "teacher" && selectedAssignment.submissions?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Student Submissions ({selectedAssignment.submissions.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedAssignment.submissions.map((submission, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <img 
                              src={submission.studentAvatar} 
                              alt={submission.studentName}
                              className="w-10 h-10 rounded-full"
                            />
                            <div>
                              <p className="font-medium">{submission.studentName}</p>
                              <p className="text-sm text-gray-500">
                                {submission.status === "pending" 
                                  ? "Not submitted yet"
                                  : `Submitted: ${formatDate(submission.submittedDate)} at ${submission.submittedTime}`
                                }
                              </p>
                            </div>
                          </div>
                          
                          {submission.status !== "pending" && (
                            <div className="flex items-center gap-2">
                              {submission.status === "graded" ? (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                                  Graded: {submission.marks}/{selectedAssignment.totalMarks}
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedStudentSubmission(submission)
                                    setShowGradeModal(true)
                                  }}
                                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                                >
                                  Grade
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {submission.status !== "pending" && (
                          <>
                            {/* Attachments */}
                            {submission.attachments?.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {submission.attachments.map((file, fidx) => (
                                  <div key={fidx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                      {getFileIcon(file.type)}
                                      <span className="text-sm">{file.name}</span>
                                      <span className="text-xs text-gray-500">({file.size})</span>
                                    </div>
                                    <button className="p-1 text-gray-600 hover:text-blue-600">
                                      <Download className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Student Note */}
                            {submission.note && (
                              <p className="mt-2 text-sm text-gray-600 bg-blue-50 p-2 rounded-lg">
                                <span className="font-medium">Note:</span> {submission.note}
                              </p>
                            )}

                            {/* Feedback */}
                            {submission.feedback && (
                              <div className="mt-2 p-2 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-700">
                                  <span className="font-medium">Feedback:</span> {submission.feedback}
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Student's submission - Student view */}
              {userRole === "student" && selectedAssignment.studentSubmission?.status !== "pending" && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Your Submission
                  </h4>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Submitted on: {formatDate(selectedAssignment.studentSubmission.submittedDate)} at {selectedAssignment.studentSubmission.submittedTime}
                    </p>
                    
                    {selectedAssignment.studentSubmission.attachments?.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg mb-2">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.type)}
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">({file.size})</span>
                        </div>
                        <button className="p-1 text-gray-600 hover:text-blue-600">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {selectedAssignment.studentSubmission.note && (
                      <p className="mt-2 text-sm text-gray-600 bg-blue-50 p-2 rounded-lg">
                        <span className="font-medium">Your note:</span> {selectedAssignment.studentSubmission.note}
                      </p>
                    )}

                    {selectedAssignment.studentSubmission.feedback && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="font-medium text-green-800 mb-1">Instructor Feedback:</p>
                        <p className="text-green-700">{selectedAssignment.studentSubmission.feedback}</p>
                        {selectedAssignment.studentSubmission.marks && (
                          <p className="mt-2 font-medium">
                            Marks: {selectedAssignment.studentSubmission.marks}/{selectedAssignment.totalMarks}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal - Student only */}
      {showUploadModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Upload Assignment</h2>
              <button 
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadFile(null)
                  setUploadProgress(0)
                  setUploadNote("")
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-1">{selectedAssignment.title}</h3>
                <p className="text-sm text-gray-500">Deadline: {formatDate(selectedAssignment.deadline)} at {selectedAssignment.deadlineTime}</p>
              </div>

              {/* File Upload Area */}
              {!uploadFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
                  <input
                    type="file"
                    id="assignment-upload"
                    onChange={handleFileSelect}
                    className="hidden"
                    multiple
                  />
                  <label htmlFor="assignment-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium mb-1">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-500">ZIP, PDF, DOC, JPG up to 10MB (multiple files allowed)</p>
                  </label>
                </div>
              ) : (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileArchive className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-700">{uploadFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadFile(null)}
                      className="p-1 hover:bg-blue-100 rounded-full transition"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={uploadNote}
                  onChange={(e) => setUploadNote(e.target.value)}
                  rows="3"
                  placeholder="Add any comments about your submission..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadFile(null)
                  setUploadProgress(0)
                  setUploadNote("")
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!uploadFile || isUploading}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg transition flex items-center gap-2 ${
                  !uploadFile || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Assignment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal - Teacher only */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Create New Assignment</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., React Dashboard UI"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the assignment requirements..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newAssignment.course}
                    onChange={(e) => setNewAssignment({...newAssignment, course: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select course</option>
                    <option value="React Development">React Development</option>
                    <option value="JavaScript Advanced">JavaScript Advanced</option>
                    <option value="Database Systems">Database Systems</option>
                    <option value="Core Java">Core Java</option>
                    <option value="Python Programming">Python Programming</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={newAssignment.totalMarks}
                    onChange={(e) => setNewAssignment({...newAssignment, totalMarks: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newAssignment.deadline}
                    onChange={(e) => setNewAssignment({...newAssignment, deadline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline Time
                  </label>
                  <input
                    type="time"
                    value={newAssignment.deadlineTime}
                    onChange={(e) => setNewAssignment({...newAssignment, deadlineTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resources (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition">
                  <input
                    type="file"
                    id="resource-upload"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      // Handle resource upload
                      console.log("Resources selected:", e.target.files)
                    }}
                  />
                  <label htmlFor="resource-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload assignment resources</p>
                    <p className="text-xs text-gray-500">PDF, DOC, Images (max 5 files)</p>
                  </label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAssignment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Create Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grade Modal - Teacher only */}
      {showGradeModal && selectedStudentSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Grade Submission</h2>
              <button 
                onClick={() => {
                  setShowGradeModal(false)
                  setSelectedStudentSubmission(null)
                  setGradeData({ marks: "", feedback: "" })
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedStudentSubmission.studentAvatar} 
                  alt={selectedStudentSubmission.studentName}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium">{selectedStudentSubmission.studentName}</p>
                  <p className="text-sm text-gray-500">
                    Submitted: {formatDate(selectedStudentSubmission.submittedDate)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marks (out of {selectedAssignment?.totalMarks}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={gradeData.marks}
                  onChange={(e) => setGradeData({...gradeData, marks: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max={selectedAssignment?.totalMarks}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={gradeData.feedback}
                  onChange={(e) => setGradeData({...gradeData, feedback: e.target.value})}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Provide feedback to the student..."
                />
              </div>
            </div>

            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowGradeModal(false)
                  setSelectedStudentSubmission(null)
                  setGradeData({ marks: "", feedback: "" })
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleGradeSubmission}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Submit Grade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssignmentsPage