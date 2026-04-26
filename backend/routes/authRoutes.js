import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// 🔹 REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ✅ validation
    if (!name || !email || !password) {
      return res.status(400).json({
        msg: "All fields are required",
      });
    }

    // ✅ check existing user
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({
        msg: "User already exists",
      });
    }

    // ✅ hash password
    const hash = await bcrypt.hash(password, 10);

    // ✅ create user
    await User.create({
      name,
      email,
      password: hash,
    });

    res.json({
      msg: "User registered successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      msg: "Server error",
    });
  }
});

// 🔹 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        msg: "User not found",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        msg: "Wrong password",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      "secret",
      { expiresIn: "24h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;