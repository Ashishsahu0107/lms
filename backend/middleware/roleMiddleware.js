import asyncHandler from '../utils/asyncHandler.js';

// Role based authorization middleware
// Usage: router.get('/path', protect, authorizeRoles('teacher', 'superAdmin'))
const authorizeRoles = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please login first.'
      });
    }

    const normalizedAllowed = roles
      .filter(Boolean)
      .map((r) => (typeof r === 'string' ? r.toLowerCase() : r));

    const userRole = (user.role || '').toLowerCase();

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${user.role} role is not authorized to access this resource.`
      });
    }

    next();
  });
};

export default authorizeRoles;
