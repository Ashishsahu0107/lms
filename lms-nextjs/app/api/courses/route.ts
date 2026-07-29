// app/api/courses/route.ts — List & Create courses
/**
 * @swagger
 * /courses:
 *   get:
 *     tags: [Courses]
 *     summary: Get all published courses
 *     security: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: difficulty
 *         schema: { type: string, enum: [beginner, intermediate, advanced] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: List of courses
 *   post:
 *     tags: [Courses]
 *     summary: Create a new course (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               category: { type: string }
 *               difficulty: { type: string }
 *               price: { type: number }
 *     responses:
 *       201:
 *         description: Course created
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authenticate, authorize } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");
    const teacherId = searchParams.get("teacherId");
    const status = searchParams.get("status");

    // Build filter
    const where: Record<string, unknown> = {};

    // Non-admins only see published courses
    const { user } = (await authenticate(req).catch(() => ({
      user: null,
    }))) as { user: { role: string } | null };
    const role = user?.role;
    if (!role || role === "student") {
      where.status = "published";
    } else if (status) {
      where.status = status;
    }

    if (category) where.category = { contains: category, mode: "insensitive" };
    if (difficulty) where.difficulty = difficulty;
    if (teacherId) where.teacherId = teacherId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          teacher: { select: { id: true, name: true, avatar: true } },
          _count: { select: { enrollments: true, modules: true } },
        },
      }),
      prisma.course.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Courses fetched successfully",
      data: {
        courses,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch courses" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;

    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const body = await req.json();
    const { title, description, category, difficulty, price, tags, status } =
      body;

    if (!title) {
      return NextResponse.json(
        { success: false, message: "Course title is required" },
        { status: 400 },
      );
    }

    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        description: description?.trim() || "",
        category: category?.trim() || "",
        difficulty: difficulty || "beginner",
        price: Number(price) || 0,
        tags: tags || [],
        status: status || "draft",
        teacherId: user!.id,
      },
      include: {
        teacher: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Course created successfully",
        data: { course },
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create course";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
