import express from 'express';
import {
  register,
  login,
  getMe,
  refresh,
  logout,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access   Public
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user & get token (access token returned + refresh cookie set)
// @access   Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access   Private
router.get('/me', protect, getMe);

// @route   POST /api/auth/refresh
// @desc    Refresh access token using refresh token cookie
// @access   Public
router.post('/refresh', refresh);

// @route   POST /api/auth/logout
// @desc    Logout user (clears refresh cookie)
// @access   Private
router.post('/logout', protect, logout);

// @route   PUT /api/auth/updateprofile
// @desc    Update user profile
// @access   Private
router.put('/updateprofile', protect, updateProfile);

// @route   PUT /api/auth/changepassword
// @desc    Change user password
// @access   Private
router.put('/changepassword', protect, changePassword);

export default router;
