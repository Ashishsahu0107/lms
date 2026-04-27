import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🔐 AUTH CHECK
export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "No token" });
    }

    const decoded = jwt.verify(token, "secret");

    req.user = await User.findById(decoded.id).select("-password");

    next();
  } catch (err) {
    console.log("AUTH ERROR:", err);
    res.status(401).json({ msg: "Invalid token" });
  }
};

// 👑 ADMIN ONLY
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      msg: "Access denied (Admin only)",
    });
  }
};

// 🔥 FIX: OLD NAME SUPPORT (IMPORTANT)
export const authMiddleware = protect;