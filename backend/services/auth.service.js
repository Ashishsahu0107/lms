import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User } from "../models/User.js";
import { env } from "../config/env.js";

import {
  UnauthorizedError,
  BadRequestError,
} from "../utils/errors.js";

// =====================================
// GENERATE JWT TOKEN
// =====================================
function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      role: user.role,
      email: user.email,
    },
    env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

// =====================================
// REMOVE PASSWORD FROM RESPONSE
// =====================================
function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || null,
    createdAt: user.createdAt,
  };
}

export const authService = {

  // =====================================
  // LOGIN
  // =====================================
  async login({ email, password }) {

    // Validate Inputs
    if (!email || !password) {
      throw new BadRequestError(
        "Email and password are required"
      );
    }

    // Find User
    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    // User Not Found
    if (!user) {
      throw new UnauthorizedError(
        "Invalid email or password"
      );
    }

    // Compare Password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    // Wrong Password
    if (!isPasswordValid) {
      throw new UnauthorizedError(
        "Invalid email or password"
      );
    }

    // Generate JWT
    const token = generateToken(user);

    // Return Response
    return {
      token,
      user: sanitizeUser(user),
    };
  },

  // =====================================
  // REGISTER
  // =====================================
  async register({
    name,
    email,
    password,
    role = "student",
  }) {

    // Validate Inputs
    if (!name || !email || !password) {
      throw new BadRequestError(
        "Name, email and password are required"
      );
    }

    // Check Existing User
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      throw new BadRequestError(
        "Email already registered"
      );
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(
      password,
      12
    );

    // Create User
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });

    // Generate Token
    const token = generateToken(user);

    // Return Response
    return {
      token,
      user: sanitizeUser(user),
    };
  },

  // =====================================
  // VERIFY TOKEN
  // =====================================
  async verifyToken(token) {

    if (!token) {
      throw new UnauthorizedError(
        "Authentication token missing"
      );
    }

    try {

      const decoded = jwt.verify(
        token,
        env.JWT_SECRET
      );

      const user = await User.findById(
        decoded.userId
      ).select("-password");

      if (!user) {
        throw new UnauthorizedError(
          "User not found"
        );
      }

      return user;

    } catch (error) {
      throw new UnauthorizedError(
        "Invalid or expired token"
      );
    }
  },
};