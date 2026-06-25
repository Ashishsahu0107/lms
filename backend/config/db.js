import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { env } from "./env.js";
import { User } from "../models/User.js";

export async function connectDb() {
  await mongoose.connect(env.MONGODB_URI);
  await seedSuperAdmin();
}

async function seedSuperAdmin() {
  try {
    const adminEmail = "admin@lmspro.edu";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("admin123", 12);
      await User.create({
        name: "Super Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "super_admin",
        isVerified: true,
        isActive: true,
      });
      console.log("Super Admin seeded successfully:", adminEmail);
    } else {
      console.log("Super Admin already exists:", adminEmail);
    }
  } catch (err) {
    console.error("Super Admin seeding failed:", err.message);
  }
}
