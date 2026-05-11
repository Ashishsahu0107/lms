import express from 'express';
import {
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
} from '../controllers/courseController.js';
import { protect, authorizeRoles, teacherOwnsCourse } from '../middleware/authMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourse);

// Protected routes
router.use(protect);

// @route   POST /api/courses
// @desc    Create new course
// @access   Private/Teacher
router.post('/', authorizeRoles('teacher', 'superAdmin'), uploadSingle('thumbnail'), createCourse);

// @route   PUT /api/courses/:id
// @desc    Update course
// @access   Private/Teacher
router.put('/:id', authorizeRoles('teacher', 'superAdmin'), teacherOwnsCourse, uploadSingle('thumbnail'), updateCourse);

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access   Private/Teacher
router.delete('/:id', authorizeRoles('teacher', 'superAdmin'), teacherOwnsCourse, deleteCourse);

// @route   POST /api/courses/enroll/:id
// @desc    Enroll in course
// @access   Private/User
router.post('/enroll/:id', authorizeRoles('user', 'teacher', 'superAdmin'), enrollCourse);

// @route   DELETE /api/courses/unenroll/:id
// @desc    Unenroll from course
// @access   Private/User
router.delete('/unenroll/:id', authorizeRoles('user', 'teacher', 'superAdmin'), unenrollCourse);

// @route   GET /api/courses/teacher
// @desc    Get teacher's courses
// @access   Private/Teacher
router.get('/teacher', authorizeRoles('teacher', 'superAdmin'), getTeacherCourses);

// @route   GET /api/courses/enrolled
// @desc    Get user's enrolled courses
// @access   Private/User
router.get('/enrolled', authorizeRoles('user', 'teacher', 'superAdmin'), getEnrolledCourses);

// @route   GET /api/courses/stats
// @desc    Get course statistics
// @access   Private/Admin
router.get('/stats', authorizeRoles('superAdmin'), getCourseStats);

export default router;