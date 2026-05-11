import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Course from '../models/Course.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all assignments
// @route   GET /api/assignments
// @access  Private/Teacher
const getAssignments = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const sort = req.query.sort || '-createdAt';
  const courseId = req.query.course;
  const isPublished = req.query.published === 'true';

  // Build query
  const query = {};
  
  if (courseId) {
    query.course = courseId;
  }
  
  if (isPublished) {
    query.isPublished = true;
  }
  
  // If teacher, only show their assignments
  if (req.user.role === 'teacher') {
    // Get teacher's courses
    const teacherCourses = await Course.find({ teacher: req.user._id });
    const courseIds = teacherCourses.map(course => course._id);
    query.course = { $in: courseIds };
  }

  const assignments = await Assignment.find(query)
    .populate('course', 'title')
    .populate('submissions')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Assignment.countDocuments(query);

  res.status(200).json({
    success: true,
    data: assignments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
const getAssignment = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('course', 'title teacher')
    .populate('submissions');

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check if user has access
  if (req.user.role === 'teacher') {
    const course = await Course.findById(assignment.course._id);
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'superAdmin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this assignment'
      });
    }
  }

  res.status(200).json({
    success: true,
    data: assignment
  });
});

// @desc    Create new assignment
// @route   POST /api/assignments
// @access  Private/Teacher
const createAssignment = asyncHandler(async (req, res, next) => {
  const { title, description, dueDate, course, maxMarks, instructions, attachments, allowLateSubmission, latePenalty } = req.body;

  // Check if user owns the course
  const courseDoc = await Course.findById(course);
  if (!courseDoc) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  if (courseDoc.teacher.toString() !== req.user._id.toString() && req.user.role !== 'superAdmin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to create assignment for this course'
    });
  }

  const assignment = await Assignment.create({
    title,
    description,
    dueDate,
    course,
    maxMarks,
    instructions,
    attachments,
    allowLateSubmission,
    latePenalty,
    publishedAt: new Date()
  });

  // Add assignment to course
  courseDoc.assignments.push(assignment._id);
  await courseDoc.save();

  res.status(201).json({
    success: true,
    data: assignment
  });
});

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private/Teacher
const updateAssignment = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id).populate('course');

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check if user owns the course
  if (assignment.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'superAdmin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this assignment'
    });
  }

  const updatedAssignment = await Assignment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('course', 'title');

  res.status(200).json({
    success: true,
    data: updatedAssignment
  });
});

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Teacher
const deleteAssignment = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id).populate('course');

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check if user owns the course
  if (assignment.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'superAdmin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this assignment'
    });
  }

  // Remove assignment from course
  const course = await Course.findById(assignment.course._id);
  course.assignments = course.assignments.filter(
    assignmentId => assignmentId.toString() !== assignment._id.toString()
  );
  await course.save();

  await assignment.remove();

  res.status(200).json({
    success: true,
    message: 'Assignment deleted successfully'
  });
});

// @desc    Submit assignment
// @route   POST /api/assignments/submit/:id
// @access  Private/User
const submitAssignment = asyncHandler(async (req, res, next) => {
  const { file, textAnswer } = req.body;
  const assignmentId = req.params.id;

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check if user is enrolled in the course
  const course = await Course.findById(assignment.course);
  if (!course.students.includes(req.user._id)) {
    return res.status(403).json({
      success: false,
      message: 'Not enrolled in this course'
    });
  }

  // Check if already submitted
  const existingSubmission = await Submission.findOne({
    student: req.user._id,
    assignment: assignmentId
  });

  if (existingSubmission) {
    return res.status(400).json({
      success: false,
      message: 'Assignment already submitted'
    });
  }

  const submission = await Submission.create({
    student: req.user._id,
    assignment: assignmentId,
    file,
    textAnswer,
    submittedAt: new Date()
  });

  // Add submission to assignment
  assignment.submissions.push(submission._id);
  await assignment.save();

  res.status(201).json({
    success: true,
    data: submission
  });
});

// @desc    Grade assignment
// @route   PUT /api/assignments/grade/:id
// @access  Private/Teacher
const gradeAssignment = asyncHandler(async (req, res, next) => {
  const { marks, feedback } = req.body;
  const submissionId = req.params.id;

  const submission = await Submission.findById(submissionId).populate({
    path: 'assignment',
    populate: {
      path: 'course',
      populate: 'teacher'
    }
  });

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Submission not found'
    });
  }

  // Check if user owns the course
  if (submission.assignment.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'superAdmin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to grade this assignment'
    });
  }

  submission.marks = marks;
  submission.feedback = feedback;
  submission.gradedBy = req.user._id;
  submission.gradedAt = new Date();
  submission.status = 'graded';
  
  await submission.save();

  res.status(200).json({
    success: true,
    data: submission
  });
});

// @desc    Get student's submissions
// @route   GET /api/assignments/submissions
// @access  Private/User
const getStudentSubmissions = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const sort = req.query.sort || '-submittedAt';

  const submissions = await Submission.find({ student: req.user._id })
    .populate({
      path: 'assignment',
      populate: {
        path: 'course',
        select: 'title'
      }
    })
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Submission.countDocuments({ student: req.user._id });

  res.status(200).json({
    success: true,
    data: submissions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get assignment submissions (for teachers)
// @route   GET /api/assignments/:id/submissions
// @access  Private/Teacher
const getAssignmentSubmissions = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id).populate({
    path: 'course',
    populate: 'teacher'
  });

  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found'
    });
  }

  // Check if user owns the course
  if (assignment.course.teacher.toString() !== req.user._id.toString() && req.user.role !== 'superAdmin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view submissions for this assignment'
    });
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const sort = req.query.sort || '-submittedAt';

  const submissions = await Submission.find({ assignment: req.params.id })
    .populate('student', 'name email avatar')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Submission.countDocuments({ assignment: req.params.id });

  res.status(200).json({
    success: true,
    data: submissions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeAssignment,
  getStudentSubmissions,
  getAssignmentSubmissions
};
