// prisma/seed.js — Seeds initial Super Admin and sample data
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Super Admin
  const adminEmail = "admin@gmail.com";
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existing) {
    const hashedPassword = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "super_admin",
        isVerified: true,
        isEmailVerified: true,
        status: "active",
        isActive: true,
      },
    });
    console.log("✅ Super Admin created:", adminEmail);
  } else {
    console.log("ℹ️  Super Admin already exists:", adminEmail);
  }

  console.log("🌱 Seeding complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
