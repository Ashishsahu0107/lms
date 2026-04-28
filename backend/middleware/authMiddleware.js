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


// 👑 ADMIN ONLY
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      msg: "Access denied (Admin only)",
    });
  }
};


// 🔥 EXPORT ALL (IMPORTANT)
export {
  protect,
  adminOnly,
  protect as authMiddleware // backward compatibility
};