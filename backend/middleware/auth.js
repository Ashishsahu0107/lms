import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { Course } from "../models/Course.js";
import { Module } from "../models/Module.js";
import { Topic } from "../models/Topic.js";

import {
  UnauthorizedError,
  ForbiddenError,
} from "../utils/errors.js";

// =====================================
// AUTHENTICATE USER
// =====================================
export async function authenticate(req, res, next) {
  try {

    // Get Authorization Header
    const authHeader = req.headers.authorization;

    // Check Header
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      throw new UnauthorizedError(
        "Authentication token missing"
      );
    }

    // Extract Token
    const token = authHeader.split(" ")[1];

    // Verify Token
    const decoded = jwt.verify(
      token,
      env.JWT_SECRET
    );

    // Find User
    const user = await User.findById(
      decoded.userId
    ).select("-password");

    // User Not Found
    if (!user) {
      throw new UnauthorizedError(
        "User not found"
      );
    }

    // Attach User To Request
    req.user = user;

    // Attach Token
    req.token = token;

    next();

  } catch (error) {

    // JWT Errors
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return next(
        new UnauthorizedError(
          "Invalid or expired token"
        )
      );
    }

    next(error);
  }
}

// =====================================
// ROLE AUTHORIZATION
// =====================================
export function authorize(...roles) {

  return (req, res, next) => {

    // Check User
    if (!req.user) {
      return next(
        new UnauthorizedError(
          "Authentication required"
        )
      );
    }

    // Check Role
    if (!roles.includes(req.user.role)) {
      try {
        import("../utils/securityLogger.js").then(({ logSecurityEvent }) => {
          logSecurityEvent({
            userId: req.user._id,
            action: "API_UNAUTHORIZED",
            details: `Unauthorized attempt to access route requiring roles: [${roles.join(", ")}]. User role: ${req.user.role}`,
            ip: req.ip,
            device: req.headers["user-agent"] || "",
            severity: "high"
          });
        });
      } catch (logErr) {
        console.error("[Log] Failed to log unauthorized route access:", logErr);
      }

      return next(
        new UnauthorizedError(
          "Access denied"
        )
      );
    }

    next();
  };
}

// =====================================
// OPTIONAL AUTH
// =====================================
export async function optionalAuth(
  req,
  res,
  next
) {
  try {

    const authHeader =
      req.headers.authorization;

    // No Token
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return next();
    }

    // Extract Token
    const token = authHeader.split(" ")[1];

    // Verify
    const decoded = jwt.verify(
      token,
      env.JWT_SECRET
    );

    // User
    const user = await User.findById(
      decoded.userId
    ).select("-password");

    if (user) {
      req.user = user;
    }

    next();

  } catch (error) {
    next();
  }
}

// =====================================
// OWNERSHIP AUTHORIZATION
// =====================================
export async function ownershipMiddleware(req, res, next) {
  try {
    const { id } = req.params;

    // Admins bypass ownership check
    if (req.user.role === "super_admin") {
      return next();
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Teachers can only modify their own courses
    if (course.teacherId.toString() !== req.user._id.toString()) {
      throw new ForbiddenError(
        "Access denied: you do not own this course"
      );
    }

    next();
  } catch (err) {
    next(err);
  }
}

// =====================================
// MODULE OWNERSHIP GUARD
// =====================================
export async function moduleOwnershipMiddleware(req, res, next) {
  try {
    if (req.user.role === "super_admin") return next();

    const { id } = req.params;
    const mod = await Module.findById(id);
    if (!mod) {
      return res.status(404).json({ success: false, message: "Module not found" });
    }

    const course = await Course.findById(mod.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Parent course not found" });
    }

    if (course.teacherId.toString() !== req.user._id.toString()) {
      throw new ForbiddenError("Access denied: you do not own this module's course");
    }

    next();
  } catch (err) {
    next(err);
  }
}

// =====================================
// TOPIC OWNERSHIP GUARD
// =====================================
export async function topicOwnershipMiddleware(req, res, next) {
  try {
    if (req.user.role === "super_admin") return next();

    const { id } = req.params;
    const topic = await Topic.findById(id);
    if (!topic) {
      return res.status(404).json({ success: false, message: "Topic not found" });
    }

    const mod = await Module.findById(topic.moduleId);
    if (!mod) {
      return res.status(404).json({ success: false, message: "Parent module not found" });
    }

    const course = await Course.findById(mod.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Parent course not found" });
    }

    if (course.teacherId.toString() !== req.user._id.toString()) {
      throw new ForbiddenError("Access denied: you do not own this topic's course");
    }

    next();
  } catch (err) {
    next(err);
  }
}