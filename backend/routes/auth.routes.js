import { Router } from "express";

import {
  loginController,
  registerController,
  meController,
  logoutController,
} from "../controllers/auth.controller.js";

import {
  authenticate,
  authorize,
} from "../middleware/auth.js";

const router = Router();

// =====================================
// PUBLIC ROUTES
// =====================================

// Login
router.post(
  "/login",
  loginController
);

// Register
router.post(
  "/register",
  registerController
);

// =====================================
// PROTECTED ROUTES
// =====================================

// Current Logged In User
router.get(
  "/me",
  authenticate,
  meController
);

// Logout
router.post(
  "/logout",
  authenticate,
  logoutController
);

// =====================================
// ROLE TEST ROUTES
// =====================================

// Admin Only
router.get(
  "/admin-only",
  authenticate,
  authorize("super_admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome Super Admin",
      data: req.user,
    });
  }
);

// Teacher Only
router.get(
  "/teacher-only",
  authenticate,
  authorize("teacher", "super_admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome Teacher",
      data: req.user,
    });
  }
);

// Student Only
router.get(
  "/student-only",
  authenticate,
  authorize("student"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Welcome Student",
      data: req.user,
    });
  }
);

export default router;