import React, { useState, useEffect } from "react"
import { 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Clock,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  BarChart,
  PieChart,
  Users,
  BookOpen,
  Award,
  Percent,
  AlertTriangle
} from "lucide-react"

const AttendancePage = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [viewType, setViewType] = useState("table") // table, calendar, chart
  const [filterCourse, setFilterCourse] = useState("all")
  
  // Months for display
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  // Mock attendance data with detailed records
  const [attendanceData, setAttendanceData] = useState([
    {
      id: 1,
      course: "React Development",
      instructor: "John Doe",
      schedule: "Mon, Wed, Fri • 10:00 AM",
      totalClasses: 20,
      present: 18,
      absent: 2,
      late: 1,
      leave: 1,
      percentage: 90,
      color: "blue",
      monthly: [
        { date: "2026-03-01", status: "present", topic: "React Hooks Introduction" },
        { date: "2026-03-03", status: "present", topic: "useState Deep Dive" },
        { date: "2026-03-05", status: "late", topic: "useEffect and Side Effects" },
        { date: "2026-03-08", status: "present", topic: "Custom Hooks" },
        { date: "2026-03-10", status: "absent", topic: "Context API" },
        { date: "2026-03-12", status: "present", topic: "useReducer Hook" },
        { date: "2026-03-15", status: "present", topic: "Performance Optimization" },
        { date: "2026-03-17", status: "present", topic: "React.memo and useCallback" },
        { date: "2026-03-19", status: "leave", topic: "Code Splitting" },
        { date: "2026-03-22", status: "present", topic: "Error Boundaries" },
        { date: "2026-03-24", status: "present", topic: "Portals and Refs" },
        { date: "2026-03-26", status: "present", topic: "Higher-Order Components" },
        { date: "2026-03-29", status: "present", topic: "Render Props" },
        { date: "2026-03-31", status: "present", topic: "Compound Components" }
      ]
    },
    {
      id: 2,
      course: "JavaScript Advanced",
      instructor: "Jane Smith",
      schedule: "Tue, Thu • 2:00 PM",
      totalClasses: 20,
      present: 16,
      absent: 3,
      late: 2,
      leave: 1,
      percentage: 80,
      color: "green",
      monthly: [
        { date: "2026-03-02", status: "present", topic: "Closures and Scope" },
        { date: "2026-03-04", status: "late", topic: "Prototypes and Inheritance" },
        { date: "2026-03-06", status: "present", topic: "Async/Await" },
        { date: "2026-03-09", status: "present", topic: "Promises" },
        { date: "2026-03-11", status: "absent", topic: "Event Loop" },
        { date: "2026-03-13", status: "present", topic: "Generators" },
        { date: "2026-03-16", status: "present", topic: "Iterators" },
        { date: "2026-03-18", status: "absent", topic: "Symbols" },
        { date: "2026-03-20", status: "present", topic: "Maps and Sets" },
        { date: "2026-03-23", status: "late", topic: "WeakMap and WeakSet" },
        { date: "2026-03-25", status: "present", topic: "Proxy and Reflect" },
        { date: "2026-03-27", status: "present", topic: "Decorators" },
        { date: "2026-03-30", status: "leave", topic: "Module Patterns" }
      ]
    },
    {
      id: 3,
      course: "Database Systems",
      instructor: "Mike Johnson",
      schedule: "Mon, Wed • 4:00 PM",
      totalClasses: 20,
      present: 19,
      absent: 0,
      late: 0,
      leave: 1,
      percentage: 95,
      color: "purple",
      monthly: [
        { date: "2026-03-01", status: "present", topic: "SQL Introduction" },
        { date: "2026-03-03", status: "present", topic: "CRUD Operations" },
        { date: "2026-03-05", status: "present", topic: "Joins" },
        { date: "2026-03-08", status: "present", topic: "Subqueries" },
        { date: "2026-03-10", status: "present", topic: "Indexes" },
        { date: "2026-03-12", status: "present", topic: "Transactions" },
        { date: "2026-03-15", status: "present", topic: "Stored Procedures" },
        { date: "2026-03-17", status: "present", topic: "Triggers" },
        { date: "2026-03-19", status: "present", topic: "Views" },
        { date: "2026-03-22", status: "present", topic: "Normalization" },
        { date: "2026-03-24", status: "present", topic: "ACID Properties" },
        { date: "2026-03-26", status: "leave", topic: "NoSQL Introduction" },
        { date: "2026-03-29", status: "present", topic: "MongoDB Basics" },
        { date: "2026-03-31", status: "present", topic: "Aggregation Pipeline" }
      ]
    },
    {
      id: 4,
      course: "Core Java",
      instructor: "Sarah Wilson",
      schedule: "Tue, Thu, Sat • 9:00 AM",
      totalClasses: 24,
      present: 20,
      absent: 2,
      late: 1,
      leave: 1,
      percentage: 83,
      color: "orange"
    },
    {
      id: 5,
      course: "Python Programming",
      instructor: "Alex Brown",
      schedule: "Mon, Wed, Fri • 1:00 PM",
      totalClasses: 22,
      present: 18,
      absent: 2,
      late: 1,
      leave: 1,
      percentage: 82,
      color: "yellow"
    }
  ])

  // Calculate overall statistics
  const overallStats = {
    totalCourses: attendanceData.length,
    totalClasses: attendanceData.reduce((acc, curr) => acc + curr.totalClasses, 0),
    totalPresent: attendanceData.reduce((acc, curr) => acc + curr.present, 0),
    totalAbsent: attendanceData.reduce((acc, curr) => acc + curr.absent, 0),
    totalLate: attendanceData.reduce((acc, curr) => acc + curr.late, 0),
    totalLeave: attendanceData.reduce((acc, curr) => acc + curr.leave, 0),
    averagePercentage: Math.round(
      attendanceData.reduce((acc, curr) => acc + curr.percentage, 0) / attendanceData.length
    )
  }

  // Filter attendance data
  const filteredData = filterCourse === "all" 
    ? attendanceData 
    : attendanceData.filter(c => c.id === parseInt(filterCourse))

  // Get status color and icon
  const getStatusConfig = (status) => {
    switch(status) {
      case "present":
        return { 
          color: "bg-green-100 text-green-700 border-green-200",
          icon: <CheckCircle className="w-4 h-4" />,
          text: "Present"
        }
      case "absent":
        return { 
          color: "bg-red-100 text-red-700 border-red-200",
          icon: <XCircle className="w-4 h-4" />,
          text: "Absent"
        }
      case "late":
        return { 
          color: "bg-yellow-100 text-yellow-700 border-yellow-200",
          icon: <Clock className="w-4 h-4" />,
          text: "Late"
        }
      case "leave":
        return { 
          color: "bg-blue-100 text-blue-700 border-blue-200",
          icon: <AlertCircle className="w-4 h-4" />,
          text: "Leave"
        }
      default:
        return { 
          color: "bg-gray-100 text-gray-700 border-gray-200",
          icon: <AlertTriangle className="w-4 h-4" />,
          text: "Unknown"
        }
    }
  }

  // Get course color class
  const getCourseColor = (color) => {
    switch(color) {
      case "blue": return "bg-blue-500"
      case "green": return "bg-green-500"
      case "purple": return "bg-purple-500"
      case "orange": return "bg-orange-500"
      case "yellow": return "bg-yellow-500"
      default: return "bg-gray-500"
    }
  }

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay()
    
    const days = []
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push({ date: null, attendance: [] })
    }
    
    // Days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      
      // Collect attendance for this date across all courses
      const dayAttendance = []
      attendanceData.forEach(course => {
        if (course.monthly) {
          const record = course.monthly.find(r => r.date === dateStr)
          if (record) {
            dayAttendance.push({
              course: course.course,
              status: record.status,
              topic: record.topic,
              color: course.color
            })
          }
        }
      })
      
      days.push({ date: dateStr, day: d, attendance: dayAttendance })
    }
    
    return days
  }

  const calendarDays = generateCalendarDays()

  // Navigate month
  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  // Export attendance data
  const exportAttendance = () => {
    const dataStr = JSON.stringify(attendanceData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `attendance-${selectedYear}-${selectedMonth + 1}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Attendance Management
            </h1>
            <p className="text-gray-600 text-lg">
              Track your course attendance and performance
            </p>
          </div>
          <button
            onClick={exportAttendance}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
        </div>

        {/* Overall Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <BookOpen className="w-8 h-8 opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                Total
              </span>
            </div>
            <p className="text-3xl font-bold">{overallStats.totalCourses}</p>
            <p className="text-sm opacity-90">Courses Enrolled</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <CheckCircle className="w-8 h-8 opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                {overallStats.totalPresent}/{overallStats.totalClasses}
              </span>
            </div>
            <p className="text-3xl font-bold">{overallStats.totalPresent}</p>
            <p className="text-sm opacity-90">Classes Attended</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <Percent className="w-8 h-8 opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                Average
              </span>
            </div>
            <p className="text-3xl font-bold">{overallStats.averagePercentage}%</p>
            <p className="text-sm opacity-90">Attendance Rate</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex justify-between items-start mb-2">
              <AlertCircle className="w-8 h-8 opacity-80" />
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                Missed
              </span>
            </div>
            <p className="text-3xl font-bold">{overallStats.totalAbsent + overallStats.totalLate}</p>
            <p className="text-sm opacity-90">Classes Missed</p>
          </div>
        </div>

        {/* View Controls */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            {/* View Type Toggle */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewType("table")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  viewType === "table"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setViewType("calendar")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  viewType === "calendar"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Calendar View
              </button>
              <button
                onClick={() => setViewType("chart")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  viewType === "chart"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Chart View
              </button>
            </div>

            {/* Course Filter */}
            <div className="flex gap-2">
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="all">All Courses</option>
                {attendanceData.map(course => (
                  <option key={course.id} value={course.id}>{course.course}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table View */}
        {viewType === "table" && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4 text-left font-semibold text-gray-700">Course</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Instructor</th>
                    <th className="p-4 text-center font-semibold text-gray-700">Schedule</th>
                    <th className="p-4 text-center font-semibold text-gray-700">Present</th>
                    <th className="p-4 text-center font-semibold text-gray-700">Total</th>
                    <th className="p-4 text-center font-semibold text-gray-700">Absent</th>
                    <th className="p-4 text-center font-semibold text-gray-700">Late</th>
                    <th className="p-4 text-center font-semibold text-gray-700">Leave</th>
                    <th className="p-4 text-center font-semibold text-gray-700">Attendance %</th>
                    <th className="p-4 text-center font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((course, index) => {
                    const attendanceColor = 
                      course.percentage >= 90 ? "text-green-600" :
                      course.percentage >= 75 ? "text-yellow-600" :
                      "text-red-600"
                    
                    return (
                      <tr key={course.id} className="border-t hover:bg-gray-50 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getCourseColor(course.color)}`}></div>
                            <span className="font-medium">{course.course}</span>
                          </div>
                        </td>
                        <td className="p-4">{course.instructor}</td>
                        <td className="p-4 text-center text-sm">{course.schedule}</td>
                        <td className="p-4 text-center font-medium text-green-600">{course.present}</td>
                        <td className="p-4 text-center">{course.totalClasses}</td>
                        <td className="p-4 text-center text-red-600">{course.absent}</td>
                        <td className="p-4 text-center text-yellow-600">{course.late}</td>
                        <td className="p-4 text-center text-blue-600">{course.leave}</td>
                        <td className="p-4 text-center">
                          <span className={`font-bold ${attendanceColor}`}>
                            {course.percentage}%
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            course.percentage >= 90 ? "bg-green-100 text-green-700" :
                            course.percentage >= 75 ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {course.percentage >= 90 ? "Excellent" :
                             course.percentage >= 75 ? "Good" : "Needs Improvement"}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Calendar View */}
        {viewType === "calendar" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                {months[selectedMonth]} {selectedYear}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Late</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Leave</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
              
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-24 p-2 border rounded-lg ${
                    day.date ? 'bg-white hover:shadow-md transition' : 'bg-gray-50'
                  }`}
                >
                  {day.date && (
                    <>
                      <div className="text-right text-sm text-gray-600 mb-1">
                        {day.day}
                      </div>
                      <div className="space-y-1">
                        {day.attendance.map((att, i) => (
                          <div
                            key={i}
                            className={`text-xs p-1 rounded ${
                              att.status === "present" ? "bg-green-100 text-green-700" :
                              att.status === "absent" ? "bg-red-100 text-red-700" :
                              att.status === "late" ? "bg-yellow-100 text-yellow-700" :
                              "bg-blue-100 text-blue-700"
                            }`}
                            title={att.topic}
                          >
                            <div className="flex items-center gap-1">
                              <div className={`w-2 h-2 rounded-full ${getCourseColor(att.color)}`}></div>
                              <span className="truncate">{att.course.split(' ')[0]}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart View */}
        {viewType === "chart" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Percentage Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-blue-600" />
                Attendance Percentage by Course
              </h3>
              <div className="space-y-4">
                {filteredData.map((course) => (
                  <div key={course.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{course.course}</span>
                      <span className="font-semibold">{course.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          course.percentage >= 90 ? "bg-green-500" :
                          course.percentage >= 75 ? "bg-yellow-500" :
                          "bg-red-500"
                        }`}
                        style={{ width: `${course.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance Distribution Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-600" />
                Overall Attendance Distribution
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 relative">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="15"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="15"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - overallStats.totalPresent / overallStats.totalClasses)}`}
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold">
                        {Math.round((overallStats.totalPresent / overallStats.totalClasses) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        Present
                      </span>
                      <span className="font-medium">{overallStats.totalPresent}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        Absent
                      </span>
                      <span className="font-medium">{overallStats.totalAbsent}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        Late
                      </span>
                      <span className="font-medium">{overallStats.totalLate}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        Leave
                      </span>
                      <span className="font-medium">{overallStats.totalLeave}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Trend */}
            <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Weekly Attendance Trend
              </h3>
              <div className="h-48 flex items-end justify-between gap-2">
                {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, i) => {
                  const height = 60 + Math.random() * 30 // Random for demo
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '120px' }}>
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                            {Math.round(height)}%
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2">{week}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Course Details */}
        {viewType === "table" && filterCourse !== "all" && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Recent Classes - {filteredData[0]?.course}
            </h3>
            <div className="space-y-3">
              {filteredData[0]?.monthly?.slice(0, 10).map((record, i) => {
                const statusConfig = getStatusConfig(record.status)
                return (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 w-24">
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${statusConfig.color}`}>
                        {statusConfig.icon}
                        {statusConfig.text}
                      </span>
                      <span className="text-sm text-gray-700">{record.topic}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AttendancePage