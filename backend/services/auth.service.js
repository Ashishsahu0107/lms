import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { UnauthorizedError } from "../utils/errors.js";

export const authService = {
  async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedError("Invalid credentials");

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
    };
  },

  async register({ name, email, password, role = "student" }) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new UnauthorizedError("Email already in use");

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed, role });
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    };
  },
};