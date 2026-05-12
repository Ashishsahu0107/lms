import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";

const DEFAULT_EMAIL = "superadmin@example.com";
const DEFAULT_PASSWORD = "SuperAdmin@123";

async function main() {
  const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/lms";
  const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || DEFAULT_EMAIL;
  const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || DEFAULT_PASSWORD;

  const saltRounds = Number(process.env.BCRYPT_ROUNDS || 10);

  await mongoose.connect(MONGO_URI);

  const existing = await User.findOne({ email: SUPER_ADMIN_EMAIL });
  if (existing) {
    // If user exists but role isn't superAdmin, update role.
    if (existing.role !== "superAdmin") {
      existing.role = "superAdmin";
      await existing.save();
      console.log(`Updated role to superAdmin for existing user: ${SUPER_ADMIN_EMAIL}`);
    } else {
      console.log(`Super admin already exists: ${SUPER_ADMIN_EMAIL}`);
    }
    await mongoose.disconnect();
    return;
  }

  const hash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, saltRounds);

  await User.create({
    name: "Super Admin",
    email: SUPER_ADMIN_EMAIL,
    password: hash,
    role: "superAdmin",
  });

  console.log("Seed complete.");
  console.log("Login with:");
  console.log("  Email:", SUPER_ADMIN_EMAIL);
  console.log("  Password:", SUPER_ADMIN_PASSWORD);

  await mongoose.disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed script failed:", err);
    process.exit(1);
  });

