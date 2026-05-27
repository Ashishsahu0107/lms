import { BadRequestError, UnauthorizedError } from "../utils/errors.js";
import { authService } from "../services/auth.service.js";
import { User } from "../models/User.js";
import { sendOtpEmail } from "../utils/mailer.js";
import bcrypt from "bcryptjs";

// =====================================
// LOGIN CONTROLLER
// =====================================
export async function loginController(req, res, next) {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }

    // Look up user first to check verification state
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Verify Password
    const selectUser = await User.findOne({ email: email.toLowerCase() }).select("+password");
    const isPasswordValid = await bcrypt.compare(password, selectUser.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Role is student and email is not verified
    if (user.role === "student" && !user.isVerified) {
      // Generate OTP and save
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationOTP = otp;
      user.verificationOTPExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      // Send OTP
      await sendOtpEmail(user.email, otp, "Verify your LMS Pro Account");

      return res.status(200).json({
        success: true,
        needsVerification: true,
        email: user.email,
        message: "Email not verified. A verification code has been dispatched to your inbox.",
      });
    }

    // Check streaks on active logins
    if (user.role === "student") {
      try {
        const { recordActivityStreak } = await import("../utils/gamification.js");
        await recordActivityStreak(user._id);
      } catch (err) {
        console.error("Streak tracking error in auth:", err);
      }
    }

    // Regular Login Service
    const result = await authService.login({ email, password });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// REGISTER CONTROLLER
// =====================================
export async function registerController(req, res, next) {
  try {
    const { name, email, password, role } = req.body ?? {};

    if (!name || !email || !password) {
      throw new BadRequestError("Name, email and password are required");
    }

    if (role && role !== "student") {
      throw new BadRequestError("Self-registration is only allowed for student accounts.");
    }

    // 1. Regular Register Service
    const result = await authService.register({
      name,
      email,
      password,
      role: "student",
    });

    // 2. Fetch created user in DB and set unverified
    const user = await User.findOne({ email: email.toLowerCase() });
    user.isVerified = false;

    // 3. Generate verification OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOTP = otp;
    user.verificationOTPExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // 4. Send OTP
    await sendOtpEmail(user.email, otp, "Verify your LMS Pro Account");

    return res.status(201).json({
      success: true,
      needsVerification: true,
      email: user.email,
      message: "User registered. A 6-digit OTP code has been sent to your email.",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// SEND OTP (RESEND)
// =====================================
export async function sendOtpController(req, res, next) {
  try {
    const { email } = req.body ?? {};
    if (!email) {
      throw new BadRequestError("Email is required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new BadRequestError("User not found");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOTP = otp;
    user.verificationOTPExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    await sendOtpEmail(user.email, otp, "Verify your LMS Pro Account");

    return res.status(200).json({
      success: true,
      message: "Verification OTP code resent successfully.",
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// VERIFY OTP
// =====================================
export async function verifyOtpController(req, res, next) {
  try {
    const { email, otp } = req.body ?? {};
    if (!email || !otp) {
      throw new BadRequestError("Email and OTP code are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new BadRequestError("User not found");
    }

    if (user.verificationOTP !== otp || new Date() > user.verificationOTPExpires) {
      throw new BadRequestError("Invalid or expired verification OTP");
    }

    user.isVerified = true;
    user.verificationOTP = null;
    user.verificationOTPExpires = null;
    
    // Reward XP + Achievement for verification
    user.xp = (user.xp || 0) + 15;
    if (!user.badges.includes("Verified Member")) {
      user.badges.push("Verified Member");
    }
    user.achievements.push({
      title: "Verified Student",
      description: "Successfully completed email OTP verification!",
      unlockedAt: new Date()
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! Your account is now active.",
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// FORGOT PASSWORD
// =====================================
export async function forgotPasswordController(req, res, next) {
  try {
    const { email } = req.body ?? {};
    if (!email) {
      throw new BadRequestError("Email is required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new BadRequestError("User account not found");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = new Date(Date.now() + 15 * 60 * 1000);
    user.resetOTP = otp;
    user.resetOTPExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry
    await user.save();

    await sendOtpEmail(user.email, otp, "Password Recovery OTP Code");

    return res.status(200).json({
      success: true,
      message: "Password reset OTP has been sent to your email.",
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// VERIFY RESET OTP
// =====================================
export async function verifyResetOtpController(req, res, next) {
  try {
    const { email, otp } = req.body ?? {};
    if (!email || !otp) {
      throw new BadRequestError("Email and OTP code are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new BadRequestError("User account not found");
    }

    const isOtpValid = (user.resetOTP === otp && new Date() <= user.resetOTPExpire) ||
                       (user.resetPasswordOTP === otp && new Date() <= user.resetPasswordOTPExpires);

    if (!isOtpValid) {
      throw new BadRequestError("Invalid or expired password recovery OTP");
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now reset your password.",
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// RESEND OTP
// =====================================
export async function resendResetOtpController(req, res, next) {
  try {
    const { email } = req.body ?? {};
    if (!email) {
      throw new BadRequestError("Email is required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new BadRequestError("User account not found");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = new Date(Date.now() + 15 * 60 * 1000);
    user.resetOTP = otp;
    user.resetOTPExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry
    await user.save();

    await sendOtpEmail(user.email, otp, "Password Recovery OTP Code (Resent)");

    return res.status(200).json({
      success: true,
      message: "A new password recovery OTP has been sent to your email.",
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// RESET PASSWORD
// =====================================
export async function resetPasswordController(req, res, next) {
  try {
    const { email, otp, newPassword } = req.body ?? {};
    if (!email || !otp || !newPassword) {
      throw new BadRequestError("Email, OTP code, and new password are required");
    }

    if (newPassword.length < 6) {
      throw new BadRequestError("Password must be at least 6 characters long");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new BadRequestError("User not found");
    }

    const isOtpValid = (user.resetOTP === otp && new Date() <= user.resetOTPExpire) ||
                       (user.resetPasswordOTP === otp && new Date() <= user.resetPasswordOTPExpires);

    if (!isOtpValid) {
      throw new BadRequestError("Invalid or expired password reset OTP");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpires = null;
    user.resetOTP = null;
    user.resetOTPExpire = null;
    user.isEmailVerified = true;
    user.isVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully! You can now log in.",
    });
  } catch (err) {
    next(err);
  }
}

// =====================================
// CURRENT USER
// =====================================
export async function meController(req, res, next) {
  try {
    return res.status(MeResponseCode(req.user)).json({
      success: true,
      message: "Current user fetched successfully",
      data: { user: req.user },
    });
  } catch (err) {
    next(err);
  }
}

function MeResponseCode(user) {
  return 200;
}

// =====================================
// LOGOUT CONTROLLER
// =====================================
export async function logoutController(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (err) {
    next(err);
  }
}