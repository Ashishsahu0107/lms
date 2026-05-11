import express from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  updateUserRole,
  getUserStats
} from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/users
// @desc    Get all users
// @access   Private/Admin
router.get('/', authorizeRoles('superAdmin'), getUsers);

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access   Private/Admin
router.get('/stats', authorizeRoles('superAdmin'), getUserStats);

// @route   GET /api/users/:id
// @desc    Get single user
// @access   Private
router.get('/:id', getUser);

// @route   PUT /api/users/:id
// @desc    Update user
// @access   Private/Admin
router.put('/:id', authorizeRoles('superAdmin'), updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access   Private/Admin
router.delete('/:id', authorizeRoles('superAdmin'), deleteUser);

// @route   PUT /api/users/block/:id
// @desc    Block user
// @access   Private/Admin
router.put('/block/:id', authorizeRoles('superAdmin'), blockUser);

// @route   PUT /api/users/unblock/:id
// @desc    Unblock user
// @access   Private/Admin
router.put('/unblock/:id', authorizeRoles('superAdmin'), unblockUser);

// @route   PUT /api/users/role/:id
// @desc    Update user role
// @access   Private/SuperAdmin
router.put('/role/:id', authorizeRoles('superAdmin'), updateUserRole);

export default router;
