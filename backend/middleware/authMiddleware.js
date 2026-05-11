import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (req.user.isBlocked) {
      return res.status(401).json({
        success: false,
        message: 'Account is blocked. Contact administrator.'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
});

// Authorize roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login first.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${req.user.role} role is not authorized to access this resource.`
      });
    }

    next();
  };
};

// Check if user owns the resource or is admin/teacher
const authorizeOwnerOrAdmin = (resourceField = 'user') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login first.'
      });
    }

    // SuperAdmin can access everything
    if (req.user.role === 'superAdmin') {
      return next();
    }

    // Teachers can access their own resources
    if (req.user.role === 'teacher') {
      // For dynamic routes, we need to fetch the resource first
      // This will be implemented in specific controllers
      return next();
    }

    // Regular users can only access their own resources
    if (req.params.id && req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

// Teacher-only middleware
const teacherOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please login first.'
    });
  }

  if (req.user.role !== 'teacher' && req.user.role !== 'superAdmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Teacher role required.'
    });
  }

  next();
};

// Super Admin-only middleware
const superAdminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please login first.'
    });
  }

  if (req.user.role !== 'superAdmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super Admin role required.'
    });
  }

  next();
};

// Teacher ownership check for courses
const teacherOwnsCourse = async (req, res, next) => {
  try {
    if (!req.params.courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID parameter required.'
      });
    }

    // SuperAdmin bypass
    if (req.user.role === 'superAdmin') {
      return next();
    }

    if (req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Teacher role required.'
      });
    }

    const { default: Course } = await import('../models/Course.js');
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    // Check ownership
    if (course.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own courses.'
      });
    }

    next();
  } catch (error) {
    console.error('Teacher ownership check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during ownership verification.'
    });
  }
};

export {
  protect,
  authorizeRoles,
  authorizeOwnerOrAdmin,
  teacherOnly,
  superAdminOnly,
  teacherOwnsCourse
};
