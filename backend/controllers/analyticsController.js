import User from '../models/User.js';
import Course from '../models/Course.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
const getDashboardAnalytics = asyncHandler(async (req, res, next) => {
  // Get counts
  const totalUsers = await User.countDocuments();
  const totalCourses = await Course.countDocuments();
  const totalAssignments = await Assignment.countDocuments();
  const totalSubmissions = await Submission.countDocuments();

  // Get user counts by role
  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get course statistics
  const publishedCourses = await Course.countDocuments({ isPublished: true });
  const draftCourses = await Course.countDocuments({ isPublished: false });

  // Get recent activity
  const recentUsers = await User.find()
    .select('name email role createdAt')
    .sort('-createdAt')
    .limit(5);

  const recentCourses = await Course.find()
    .populate('teacher', 'name email')
    .sort('-createdAt')
    .limit(5);

  const recentSubmissions = await Submission.find()
    .populate('student', 'name email')
    .populate('assignment', 'title')
    .sort('-submittedAt')
    .limit(5);

  // Get monthly growth (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyUsers = await User.aggregate([
    {
      $match: { createdAt: { $gte: sixMonthsAgo } }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);

  const monthlyCourses = await Course.aggregate([
    {
      $match: { createdAt: { $gte: sixMonthsAgo } }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      counts: {
        totalUsers,
        totalCourses,
        totalAssignments,
        totalSubmissions,
        publishedCourses,
        draftCourses
      },
      usersByRole,
      recentActivity: {
        users: recentUsers,
        courses: recentCourses,
        submissions: recentSubmissions
      },
      growth: {
        monthlyUsers,
        monthlyCourses
      }
    }
  });
});

// @desc    Get revenue analytics
// @route   GET /api/analytics/revenue
// @access  Private/Admin
const getRevenueAnalytics = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  // Build date filter
  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  // Get course revenue (assuming price field)
  const courses = await Course.find({
    ...dateFilter,
    isPublished: true
  }).populate('students');

  let totalRevenue = 0;
  const revenueByCourse = courses.map(course => ({
    courseId: course._id,
    title: course.title,
    students: course.students.length,
    price: course.price || 0,
    revenue: (course.students.length * (course.price || 0))
  }));

  totalRevenue = revenueByCourse.reduce((sum, course) => sum + course.revenue, 0);

  // Get monthly revenue
  const monthlyRevenue = await Course.aggregate([
    {
      $match: {
        isPublished: true,
        ...(startDate && { createdAt: { $gte: new Date(startDate) } }),
        ...(endDate && { createdAt: { $lte: new Date(endDate) } })
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'students',
        foreignField: '_id',
        as: 'students'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: {
          $sum: { $multiply: ['$price', { $size: '$students' }] }
        },
        courses: { $sum: 1 }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalRevenue,
      revenueByCourse,
      monthlyRevenue,
      totalCourses: courses.length,
      averageRevenuePerCourse: courses.length > 0 ? totalRevenue / courses.length : 0
    }
  });
});

// @desc    Get student analytics
// @route   GET /api/analytics/students
// @access  Private/Admin
const getStudentAnalytics = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, course } = req.query;
  
  // Build filter
  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  if (course) filter.enrolledCourses = course;

  // Get student statistics
  const totalStudents = await User.countDocuments({ role: 'user', ...filter });
  const activeStudents = await User.countDocuments({ 
    role: 'user', 
    isBlocked: false, 
    ...filter 
  });
  const blockedStudents = await User.countDocuments({ 
    role: 'user', 
    isBlocked: true, 
    ...filter 
  });

  // Get students by enrollment
  const studentsByEnrollment = await User.aggregate([
    {
      $match: { role: 'user', ...filter }
    },
    {
      $addFields: {
        enrollmentCount: { $size: '$enrolledCourses' }
      }
    },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $eq: ['$enrollmentCount', 0] }, then: 'No Courses' },
              { case: { $eq: ['$enrollmentCount', 1] }, then: '1 Course' },
              { case: { $eq: ['$enrollmentCount', 2] }, then: '2 Courses' },
              { case: { $eq: ['$enrollmentCount', 3] }, then: '3 Courses' },
              { case: { $eq: ['$enrollmentCount', 4] }, then: '4 Courses' },
              { case: { $eq: ['$enrollmentCount', 5] }, then: '5 Courses' }
            ],
            default: '6+ Courses'
          }
        },
        count: { $sum: 1 }
      }
    }
  ]);

  // Get top performing students
  const topStudents = await Submission.aggregate([
    {
      $group: {
        _id: '$student',
        avgMarks: { $avg: '$finalMarks' },
        totalSubmissions: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'student'
      }
    },
    {
      $unwind: '$student'
    },
    {
      $project: {
        name: '$student.name',
        email: '$student.email',
        avgMarks: 1,
        totalSubmissions: 1
      }
    },
    {
      $sort: { avgMarks: -1 }
    },
    {
      $limit: 10
    }
  ]);

  // Get course popularity
  const coursePopularity = await Course.aggregate([
    {
      $match: { isPublished: true }
    },
    {
      $addFields: {
        enrollmentCount: { $size: '$students' }
      }
    },
    {
      $project: {
        title: 1,
        enrollmentCount: 1,
        rating: 1,
        category: 1
      }
    },
    {
      $sort: { enrollmentCount: -1 }
    },
    {
      $limit: 10
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalStudents,
      activeStudents,
      blockedStudents,
      studentsByEnrollment,
      topStudents,
      coursePopularity
    }
  });
});

// @desc    Get course analytics
// @route   GET /api/analytics/courses
// @access  Private/Admin
const getCourseAnalytics = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, teacher } = req.query;
  
  // Build filter
  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  if (teacher) filter.teacher = teacher;

  // Get course statistics
  const totalCourses = await Course.countDocuments(filter);
  const publishedCourses = await Course.countDocuments({ 
    ...filter, 
    isPublished: true 
  });
  const draftCourses = await Course.countDocuments({ 
    ...filter, 
    isPublished: false 
  });

  // Courses by category
  const coursesByCategory = await Course.aggregate([
    {
      $match: filter
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);

  // Courses by level
  const coursesByLevel = await Course.aggregate([
    {
      $match: filter
    },
    {
      $group: {
        _id: '$level',
        count: { $sum: 1 }
      }
    }
  ]);

  // Top rated courses
  const topRatedCourses = await Course.find(filter)
    .populate('teacher', 'name email')
    .sort('-rating')
    .limit(10);

  // Most enrolled courses
  const mostEnrolledCourses = await Course.find(filter)
    .populate('teacher', 'name email')
    .sort('-enrollmentCount')
    .limit(10);

  res.status(200).json({
    success: true,
    data: {
      totalCourses,
      publishedCourses,
      draftCourses,
      coursesByCategory,
      coursesByLevel,
      topRatedCourses,
      mostEnrolledCourses
    }
  });
});

// @desc    Get assignment analytics
// @route   GET /api/analytics/assignments
// @access  Private/Admin
const getAssignmentAnalytics = asyncHandler(async (req, res, next) => {
  const { startDate, endDate, course } = req.query;
  
  // Build filter
  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  if (course) filter.course = course;

  // Get assignment statistics
  const totalAssignments = await Assignment.countDocuments(filter);
  const publishedAssignments = await Assignment.countDocuments({ 
    ...filter, 
    isPublished: true 
  });

  // Submission statistics
  const submissionStats = await Submission.aggregate([
    {
      $lookup: {
        from: 'assignments',
        localField: 'assignment',
        foreignField: '_id',
        as: 'assignment'
      }
    },
    {
      $match: {
        'assignment': { $exists: true },
        ...(course && { 'assignment.course': new ObjectId(course) })
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Average grades
  const gradeDistribution = await Submission.aggregate([
    {
      $match: {
        marks: { $exists: true, $ne: null },
        finalMarks: { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: null,
        avgMarks: { $avg: '$finalMarks' },
        maxMarks: { $max: '$finalMarks' },
        minMarks: { $min: '$finalMarks' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalAssignments,
      publishedAssignments,
      submissionStats,
      gradeDistribution: gradeDistribution[0] || {
        avgMarks: 0,
        maxMarks: 0,
        minMarks: 0
      }
    }
  });
});

export {
  getDashboardAnalytics,
  getRevenueAnalytics,
  getStudentAnalytics,
  getCourseAnalytics,
  getAssignmentAnalytics
};
