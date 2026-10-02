import nextEnv from "@next/env";
import mongoose, { Schema, Types } from "mongoose";
import bcrypt from "bcryptjs";

nextEnv.loadEnvConfig(process.cwd());

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI environment variable is required");

const userSchema = new Schema(
  {
    _id: { type: String, default: () => new Types.ObjectId().toString() },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: "student" },
    isVerified: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: true },
    status: { type: String, default: "active" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, strict: false, collection: "users" },
);
const User = mongoose.models.User || mongoose.model("User", userSchema);

const users = [
  { name: "Super Admin", email: "admin@gmail.com", role: "super_admin" },
  { name: "John Doe", email: "teacher@lmspro.edu", role: "teacher", bio: "Full Stack Web Development Instructor with 10+ years of experience.", specialization: "Web Development", experience: 10, qualification: "M.Tech Computer Science" },
  { name: "Ashish Sahu", email: "student@lmspro.edu", role: "student", bio: "Passionate learner exploring full stack web development." },
];

try {
  await mongoose.connect(uri, { bufferCommands: false });
  const password = await bcrypt.hash("admin123", 12);
  for (const user of users) {
    const result = await User.updateOne(
      { email: user.email },
      { $setOnInsert: { ...user, password, isVerified: true, isEmailVerified: true, status: "active", isActive: true } },
      { upsert: true },
    );
    console.log(result.upsertedCount ? `Created ${user.role}: ${user.email}` : `Already exists: ${user.email}`);
  }
} finally {
  await mongoose.disconnect();
}
