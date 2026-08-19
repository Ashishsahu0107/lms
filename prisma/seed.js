// prisma/seed.js — Seeds Super Admin, demo Teacher, demo Student, and sample courses
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertUser(data) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (!existing) {
    const user = await prisma.user.create({ data });
    console.log(`✅ Created: ${data.role} → ${data.email}`);
    return user;
  } else {
    console.log(`ℹ️  Already exists: ${data.role} → ${data.email}`);
    return existing;
  }
}

async function main() {
  console.log("🌱 Seeding database...");

  const password = await bcrypt.hash("admin123", 12);

  // ── Users
  await upsertUser({
    name: "Super Admin",
    email: "admin@gmail.com",
    password,
    role: "super_admin",
    isVerified: true,
    isEmailVerified: true,
    status: "active",
    isActive: true,
  });

  const teacher = await upsertUser({
    name: "John Doe",
    email: "teacher@lmspro.edu",
    password,
    role: "teacher",
    isVerified: true,
    isEmailVerified: true,
    status: "active",
    isActive: true,
    bio: "Full Stack Web Development Instructor with 10+ years of experience.",
    specialization: "Web Development",
    experience: 10,
    qualification: "M.Tech Computer Science",
  });

  const student = await upsertUser({
    name: "Ashish Sahu",
    email: "student@lmspro.edu",
    password,
    role: "student",
    isVerified: true,
    isEmailVerified: true,
    status: "active",
    isActive: true,
    bio: "Passionate learner exploring full stack web development.",
  });

  console.log("🌱 Users seeding complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
