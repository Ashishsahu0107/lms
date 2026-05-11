import express from 'express';
import {
  getDashboardAnalytics,
  getRevenueAnalytics,
  getStudentAnalytics,
  getCourseAnalytics,
  getAssignmentAnalytics
} from '../controllers/analyticsController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and require admin access
router.use(protect);
router.use(authorizeRoles('superAdmin'));

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access   Private/Admin
router.get('/dashboard', getDashboardAnalytics);

// @route   GET /api/analytics/revenue
// @desc    Get revenue analytics
// @access   Private/Admin
router.get('/revenue', getRevenueAnalytics);

// @route   GET /api/analytics/students
// @desc    Get student analytics
// @access   Private/Admin
router.get('/students', getStudentAnalytics);

// @route   GET /api/analytics/courses
// @desc    Get course analytics
// @access   Private/Admin
router.get('/courses', getCourseAnalytics);

// @route   GET /api/analytics/assignments
// @desc    Get assignment analytics
// @access   Private/Admin
router.get('/assignments', getAssignmentAnalytics);

export default router;

