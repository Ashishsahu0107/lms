import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../utils/errors.js";
import { User } from "../models/User.js";

export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw new UnauthorizedError("No token provided");

    const token = header.slice(7);
    const payload = jwt.verify(token, env.JWT_SECRET);

    const user = await User.findById(payload.userId).select("-password");
    if (!user) throw new UnauthorizedError("User not found");

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Invalid or expired token"));
    }
    next(err);
  }
}

export function authorize(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new UnauthorizedError("Access denied"));
    }
    next();
  };
}