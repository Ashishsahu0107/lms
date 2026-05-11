import express from 'express';
import {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeAssignment,
  getStudentSubmissions,
  getAssignmentSubmissions
} from '../controllers/assignmentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { uploadAssignmentFiles, uploadSubmissionFiles } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/assignments
// @desc    Get all assignments
// @access   Private/Teacher
router.get('/', authorizeRoles('teacher', 'superAdmin'), getAssignments);

// @route   GET /api/assignments/:id
// @desc    Get single assignment
// @access   Private
router.get('/:id', getAssignment);

// @route   POST /api/assignments
// @desc    Create new assignment
// @access   Private/Teacher
router.post('/', authorizeRoles('teacher', 'superAdmin'), uploadAssignmentFiles, createAssignment);

// @route   PUT /api/assignments/:id
// @desc    Update assignment
// @access   Private/Teacher
router.put('/:id', authorizeRoles('teacher', 'superAdmin'), uploadAssignmentFiles, updateAssignment);

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
// @access   Private/Teacher
router.delete('/:id', authorizeRoles('teacher', 'superAdmin'), deleteAssignment);

// @route   POST /api/assignments/submit/:id
// @desc    Submit assignment
// @access   Private/User
router.post('/submit/:id', authorizeRoles('user', 'teacher', 'superAdmin'), uploadSubmissionFiles, submitAssignment);

// @route   PUT /api/assignments/grade/:id
// @desc    Grade assignment
// @access   Private/Teacher
router.put('/grade/:id', authorizeRoles('teacher', 'superAdmin'), gradeAssignment);

// @route   GET /api/assignments/submissions
// @desc    Get student's submissions
// @access   Private/User
router.get('/submissions', authorizeRoles('user', 'teacher', 'superAdmin'), getStudentSubmissions);

// @route   GET /api/assignments/:id/submissions
// @desc    Get assignment submissions (for teachers)
// @access   Private/Teacher
router.get('/:id/submissions', authorizeRoles('teacher', 'superAdmin'), getAssignmentSubmissions);

export default router;