// app/api/modules/route.ts — List & Create modules
/**
 * @swagger
 * /modules:
 *   get:
 *     tags: [Modules]
 *     summary: Get modules for a course
 *     parameters:
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of modules
 *   post:
 *     tags: [Modules]
 *     summary: Create a module (Teacher/Admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, courseId]
 *             properties:
 *               title: { type: string }
 *               courseId: { type: string }
 *               order: { type: integer }
 *     responses:
 *       201:
 *         description: Module created
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authenticate, authorize } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    if (!courseId) {
      return NextResponse.json({ success: false, message: "courseId is required" }, { status: 400 });
    }

    const modules = await prisma.module.findMany({
      where: { courseId },
      orderBy: { order: "asc" },
      include: {
        topics: {
          orderBy: { createdAt: "asc" },
          include: { resources: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: { modules } });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch modules" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const body = await req.json();
    const { title, courseId, order } = body;
    if (!title || !courseId) {
      return NextResponse.json({ success: false, message: "title and courseId are required" }, { status: 400 });
    }

    const module = await prisma.module.create({
      data: { title: title.trim(), courseId, order: order || 0 },
      include: { topics: true },
    });

    return NextResponse.json({ success: true, message: "Module created", data: { module } }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create module";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
