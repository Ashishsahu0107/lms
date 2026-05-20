import { BadRequestError } from "../utils/errors.js";
import { authService } from "../services/auth.service.js";

// =====================================
// LOGIN CONTROLLER
// =====================================
export async function loginController(req, res, next) {
  try {
    const { email, password } = req.body ?? {};

    // Validation
    if (!email || !password) {
      throw new BadRequestError(
        "Email and password are required"
      );
    }

    // Login Service
    const result = await authService.login({
      email,
      password,
    });

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
    const {
      name,
      email,
      password,
      role,
    } = req.body ?? {};

    // Validation
    if (!name || !email || !password) {
      throw new BadRequestError(
        "Name, email and password are required"
      );
    }

    // Register Service
    const result = await authService.register({
      name,
      email,
      password,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
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
    return res.status(200).json({
      success: true,
      message: "Current user fetched successfully",
      data: {
        user: req.user,
      },
    });

  } catch (err) {
    next(err);
  }
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