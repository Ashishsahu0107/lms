// app/api/admin/users/route.ts — Admin User Management API
/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users (Super Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [student, teacher, super_admin] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, suspended, pending] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Users list with pagination
 *   post:
 *     tags: [Admin]
 *     summary: Create a user (Super Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created
 */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";
import { authenticate, authorize } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, email: true, role: true,
          status: true, isActive: true, isVerified: true,
          avatar: true, xp: true, streak: true,
          createdAt: true, lastSeen: true,
          _count: { select: { enrollments: true, teachingCourses: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: { users, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } },
    });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "super_admin");
    if (roleError) return roleError;

    const body = await req.json();
    const { name, email, password, role: newRole = "student" } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: "name, email, password required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ success: false, message: "Email already exists" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashed,
        role: newRole,
        isVerified: true,
        isEmailVerified: true,
        status: "active",
        isActive: true,
      },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    });

    return NextResponse.json({ success: true, message: "User created", data: { user: newUser } }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create user";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}
