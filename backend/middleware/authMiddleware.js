import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

// Protect routes - verify ACCESS JWT token only
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'dev_jwt_secret';
    const decoded = jwt.verify(token, accessSecret);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    if (user.isBlocked) {
      return res.status(401).json({ success: false, message: 'Account is blocked. Contact administrator.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
});

export { protect };
