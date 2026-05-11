import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🔐 MAIN AUTH FUNCTION
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "No token" });
    }

    const decoded = jwt.verify(token, "secret");

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ msg: "User not found" });
    }

    next();
  } catch (err) {
    console.log("AUTH ERROR:", err);
    res.status(401).json({ msg: "Invalid token" });
  }
};


// ✅ TEACHER ONLY
const teacherOnly = (req, res, next) => {
  if (req.user && req.user.role === "teacher") {
    return next();
  }
  return res.status(403).json({ msg: "Access denied (Teacher only)" });
};

// ✅ SUPER ADMIN ONLY
const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.role === "superAdmin") {
    return next();
  }
  return res
    .status(403)
    .json({ msg: "Access denied (Super Admin only)" });
};

// ✅ BACKWARD COMPATIBILITY: old role `admin` -> treat as teacher
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "teacher") {
    return next();
  }
  return res.status(403).json({ msg: "Access denied (Teacher only)" });
};

// 🔥 EXPORT ALL (IMPORTANT)
// ✅ Generic role authorizer (RBAC)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ msg: "No user" });
    if (roles.includes(req.user.role)) return next();
    return res.status(403).json({ msg: "Access denied" });
  };
};

// ✅ Teacher-only guard: teacher must own the course (Course.userId)
const teacherOwnsCourse = async (req, res, next) => {
  try {
    if (!req.params.courseId) {
      return res.status(400).json({ msg: "courseId param required" });
    }

    // superAdmin bypass
    if (req.user?.role === "superAdmin") return next();

    if (req.user?.role !== "teacher") {
      return res.status(403).json({ msg: "Access denied" });
    }

    const { default: Course } = await import("../models/Course.js");

    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ msg: "Course not found" });

    // strict ownership: Course.userId must equal teacher's _id
    if (course.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Access denied (Not your course)" });
    }

    next();
  } catch (err) {
    console.log("teacherOwnsCourse error:", err);
    res.status(500).json({ msg: "Ownership check failed" });
  }
};

export {
  protect,
  adminOnly,
  teacherOnly,
  superAdminOnly,
  authorizeRoles,
  teacherOwnsCourse,
  protect as authMiddleware,
};
