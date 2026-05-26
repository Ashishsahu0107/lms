import { User } from "../models/User.js";
import { BadRequestError, UnauthorizedError } from "../utils/errors.js";
import bcrypt from "bcryptjs";

// ======================================================
// GET /api/settings/profile
// Get logged-in user profile details
// ======================================================
export async function getSettingsProfileController(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// PUT /api/settings/profile
// Update user profile fields (name, email, phone, avatar, bio)
// ======================================================
export async function updateSettingsProfileController(req, res, next) {
  try {
    const { name, email, phone, avatar, bio } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      throw new BadRequestError("User not found");
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (bio !== undefined) user.bio = bio;

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      // Validate uniqueness
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== userId.toString()) {
        throw new BadRequestError("Email is already in use by another account");
      }
      user.email = email.toLowerCase();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// PUT /api/settings/password
// Verify old password and change to new password
// ======================================================
export async function changeSettingsPasswordController(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      throw new BadRequestError("Current password and new password are required");
    }

    if (newPassword.length < 6) {
      throw new BadRequestError("New password must be at least 6 characters long");
    }

    // Retrieve user with password select field
    const user = await User.findById(userId).select("+password");
    if (!user) {
      throw new BadRequestError("User not found");
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Incorrect current password");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    next(err);
  }
}

// ======================================================
// PUT /api/settings/preferences
// Update theme, notifications matrix, privacy levels, 2FA
// ======================================================
export async function updateSettingsPreferencesController(req, res, next) {
  try {
    const { theme, notifications, privacy, twoFactorEnabled } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      throw new BadRequestError("User not found");
    }

    // 1. Theme Configuration
    if (theme && ["light", "dark"].includes(theme)) {
      user.preferences.theme = theme;
    }

    // 2. Granular Notifications Matrix
    if (notifications) {
      if (notifications.email !== undefined) user.preferences.notifications.email = !!notifications.email;
      if (notifications.quizAlerts !== undefined) user.preferences.notifications.quizAlerts = !!notifications.quizAlerts;
      if (notifications.assignmentAlerts !== undefined) user.preferences.notifications.assignmentAlerts = !!notifications.assignmentAlerts;
      if (notifications.courseNotifications !== undefined) user.preferences.notifications.courseNotifications = !!notifications.courseNotifications;
    }

    // 3. Privacy Settings
    if (privacy) {
      if (privacy.accountVisibility && ["public", "private"].includes(privacy.accountVisibility)) {
        user.preferences.privacy.accountVisibility = privacy.accountVisibility;
      }
      if (privacy.activityVisibility && ["public", "private"].includes(privacy.activityVisibility)) {
        user.preferences.privacy.activityVisibility = privacy.activityVisibility;
      }
    }

    // 4. Two-Factor Authentication Switch
    if (twoFactorEnabled !== undefined) {
      user.preferences.twoFactorEnabled = !!twoFactorEnabled;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
}
