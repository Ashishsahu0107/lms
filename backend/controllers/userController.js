import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const sort = req.query.sort || '-createdAt';
  const search = req.query.search || '';

  // Build query
  const query = search ? {
    $or: [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ]
  } : {};

  const users = await User.find(query)
    .select('-password')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res, next) => {
  const { name, email, role, isBlocked } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { name, email, role, isBlocked },
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  await user.remove();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// @desc    Block user
// @route   PUT /api/users/block/:id
// @access  Private/Admin
const blockUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: true },
    { new: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'User blocked successfully',
    data: user
  });
});

// @desc    Unblock user
// @route   PUT /api/users/unblock/:id
// @access  Private/Admin
const unblockUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: false },
    { new: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'User unblocked successfully',
    data: user
  });
});

// @desc    Update user role
// @route   PUT /api/users/role/:id
// @access  Private/SuperAdmin
const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!['superAdmin', 'teacher', 'user'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role'
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: user
  });
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ isBlocked: false });
  const blockedUsers = await User.countDocuments({ isBlocked: true });
  const superAdmins = await User.countDocuments({ role: 'superAdmin' });
  const teachers = await User.countDocuments({ role: 'teacher' });
  const students = await User.countDocuments({ role: 'user' });

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      blockedUsers,
      roles: {
        superAdmins,
        teachers,
        students
      }
    }
  });
});

export {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  updateUserRole,
  getUserStats
};
