import { User } from "../models/User.js";

// =====================================
// CREATE USER
// =====================================
export async function createUser(req, res, next) {
  try {

    const {
      name,
      email,
      password,
      role,
    } = req.body;

    // Create User
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });

  } catch (error) {
    next(error);
  }
}

// =====================================
// GET ALL USERS
// =====================================
export async function getUsers(req, res, next) {
  try {

    const users = await User.find();

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });

  } catch (error) {
    next(error);
  }
}