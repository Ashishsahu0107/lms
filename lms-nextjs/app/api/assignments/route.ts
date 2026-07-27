// app/api/assignments/route.ts — Assignments API
/**
 * @swagger
 * /assignments:
 *   get:
 *     tags: [Assignments]
 *     summary: List assignments for a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Assignments list
 *   post:
 *     tags: [Assignments]
 *     summary: Create assignment (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Assignment'
 *     responses:
 *       201:
 *         description: Assignment created
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authenticate, authorize } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    const where: Record<string, unknown> = {};
    if (courseId) where.courseId = courseId;
    if (user!.role === "student") where.status = "published";

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true } },
        rubrics: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { dueDate: "asc" },
    });

    return NextResponse.json({ success: true, data: { assignments } });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch assignments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const body = await req.json();
    const { title, description, instructions, courseId, moduleId, topicId,
      dueDate, totalMarks, assignmentType, status, rubrics } = body;

    if (!title || !courseId || !dueDate) {
      return NextResponse.json({ success: false, message: "title, courseId, and dueDate are required" }, { status: 400 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        title, description: description || "", instructions: instructions || "",
        courseId, moduleId: moduleId || null, topicId: topicId || null,
        createdById: user!.id,
        dueDate: new Date(dueDate),
        totalMarks: totalMarks || 100,
        assignmentType: assignmentType || "written",
        status: status || "published",
        rubrics: rubrics ? { create: rubrics } : undefined,
      },
      include: { rubrics: true },
    });

    return NextResponse.json({ success: true, message: "Assignment created", data: { assignment } }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create assignment";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
