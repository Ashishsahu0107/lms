import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import authService from '../services/authService.js';

// cookie helpers (refresh token persistence)
const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/refresh',
    maxAge: Number(process.env.JWT_REFRESH_MAX_AGE_MS || 30 * 24 * 60 * 60 * 1000) // 30d default
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth/refresh'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const { ok, user, accessToken, refreshToken, message, status } =
    await authService.registerUser({ name, email, password, role });

  if (!ok) {
    return res.status(status || 400).json({ success: false, message });
  }

  setRefreshCookie(res, refreshToken);

  res.status(201).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: accessToken
    }
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password'
    });
  }

  const result = await authService.loginWithEmailPassword({ email, password });
  if (!result.ok) {
    return res.status(result.status || 401).json({
      success: false,
      message: result.message
    });
  }

  const { user, accessToken, refreshToken } = result;

  setRefreshCookie(res, refreshToken);

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      enrolledCourses: user.enrolledCourses,
      token: accessToken
    }
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');

  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found.' });
  }

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      enrolledCourses: user.enrolledCourses,
      isBlocked: user.isBlocked,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    }
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refresh = asyncHandler(async (req, res, next) => {
  // refresh token from httpOnly cookie
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'No refresh token provided.' });
  }

  try {
    const decoded = await authService.refreshTokens({ refreshToken });

    // Issue new access token
    const user = await User.findById(decoded.id).select('-password');
    if (!user || user.isBlocked) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    const newAccessToken = authService.signAccessToken(user);

    return res.status(200).json({
      success: true,
      data: { token: newAccessToken }
    });
  } catch (err) {
    clearRefreshCookie(res);
    return res.status(401).json({ success: false, message: 'Refresh token expired or invalid.' });
  }
});

// @desc    Log user out
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
  clearRefreshCookie(res);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/updateprofile
// @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email, avatar } = req.body;

  const fieldsToUpdate = {};
  if (name) fieldsToUpdate.name = name;
  if (email) fieldsToUpdate.email = email;
  if (avatar) fieldsToUpdate.avatar = avatar;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      enrolledCourses: user.enrolledCourses
    }
  });
});

// @desc    Change password
// @route   PUT /api/auth/changepassword
// @access   Private
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Please provide current password and new password'
    });
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
});

export {
  register,
  login,
  getMe,
  refresh,
  logout,
  updateProfile,
  changePassword
};
