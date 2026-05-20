import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { User } from "../models/User.js";

import {
  UnauthorizedError,
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