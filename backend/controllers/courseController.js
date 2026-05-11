import Course from '../models/Course.js';
import Lecture from '../models/Lecture.js';
import Assignment from '../models/Assignment.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const sort = req.query.sort || '-createdAt';
  const category = req.query.category;
  const level = req.query.level;
  const search = req.query.search || '';
  const isPublished = req.query.published === 'true';

  // Build query
  const query = {};
  
  if (isPublished) {
    query.isPublished = true;
  }
  
  if (category) {
    query.category = category;
  }
  
  if (level) {
    query.level = level;
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const courses = await Course.find(query)
    .populate('teacher', 'name email avatar')
    .populate('students', 'name email avatar')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Course.countDocuments(query);

  res.status(200).json({
    success: true,
    data: courses,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate('teacher', 'name email avatar')
    .populate('lectures')
    .populate('assignments')
    .populate('students', 'name email avatar');

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Teacher
const createCourse = asyncHandler(async (req, res, next) => {
  const courseData = {
    ...req.body,
    teacher: req.user._id
  };

  const course = await Course.create(courseData);

  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Teacher
const updateCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Check if user owns the course or is admin
  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'superAdmin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this course'
    });
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('teacher', 'name email avatar');

  res.status(200).json({
    success: true,
    data: updatedCourse
  });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Teacher
const deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Check if user owns the course or is admin
  if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'superAdmin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this course'
    });
  }

  await course.remove();

  res.status(200).json({
    success: true,
    message: 'Course deleted successfully'
  });
});

// @desc    Enroll in course
// @route   POST /api/courses/enroll/:id
// @access  Private/User
const enrollCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Check if user is already enrolled
  if (course.students.includes(req.user._id)) {
    return res.status(400).json({
      success: false,
      message: 'Already enrolled in this course'
    });
  }

  // Add user to course students
  course.students.push(req.user._id);
  course.enrollmentCount = course.students.length;
  await course.save();

  // Add course to user's enrolled courses
  req.user.enrolledCourses.push(course._id);
  await req.user.save();

  res.status(200).json({
    success: true,
    message: 'Enrolled in course successfully',
    data: course
  });
});

// @desc    Unenroll from course
// @route   DELETE /api/courses/unenroll/:id
// @access  Private/User
const unenrollCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  // Remove user from course students
  course.students = course.students.filter(
    student => student.toString() !== req.user._id.toString()
  );
  course.enrollmentCount = course.students.length;
  await course.save();

  // Remove course from user's enrolled courses
  req.user.enrolledCourses = req.user.enrolledCourses.filter(
    courseId => courseId.toString() !== course._id.toString()
  );
  await req.user.save();

  res.status(200).json({
    success: true,
    message: 'Unenrolled from course successfully'
  });
});

// @desc    Get teacher's courses
// @route   GET /api/courses/teacher
// @access  Private/Teacher
const getTeacherCourses = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const sort = req.query.sort || '-createdAt';

  const courses = await Course.find({ teacher: req.user._id })
    .populate('students', 'name email avatar')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Course.countDocuments({ teacher: req.user._id });

  res.status(200).json({
    success: true,
    data: courses,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get user's enrolled courses
// @route   GET /api/courses/enrolled
// @access  Private/User
const getEnrolledCourses = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const sort = req.query.sort || '-createdAt';

  const courses = await Course.find({ 
    students: req.user._id 
  })
    .populate('teacher', 'name email avatar')
    .populate('lectures')
    .populate('assignments')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Course.countDocuments({ 
    students: req.user._id 
  });

  res.status(200).json({
    success: true,
    data: courses,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get course statistics
// @route   GET /api/courses/stats
// @access  Private/Admin
const getCourseStats = asyncHandler(async (req, res, next) => {
  const totalCourses = await Course.countDocuments();
  const publishedCourses = await Course.countDocuments({ isPublished: true });
  const draftCourses = await Course.countDocuments({ isPublished: false });
  
  const coursesByCategory = await Course.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);
  
  const coursesByLevel = await Course.aggregate([
    { $group: { _id: '$level', count: { $sum: 1 } } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalCourses,
      publishedCourses,
      draftCourses,
      coursesByCategory,
      coursesByLevel
    }
  });
});

export {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  unenrollCourse,
  getTeacherCourses,
  getEnrolledCourses,
  getCourseStats
};
