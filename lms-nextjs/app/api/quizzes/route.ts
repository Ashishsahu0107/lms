// app/api/quizzes/route.ts — Quizzes API
/**
 * @swagger
 * /quizzes:
 *   get:
 *     tags: [Quizzes]
 *     summary: Get quizzes for a course
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of quizzes
 *   post:
 *     tags: [Quizzes]
 *     summary: Create a quiz (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Quiz'
 *     responses:
 *       201:
 *         description: Quiz created
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
    const moduleId = searchParams.get("moduleId");

    const where: Record<string, unknown> = {};
    if (courseId) where.courseId = courseId;
    if (moduleId) where.moduleId = moduleId;
    if (user!.role === "student") where.status = "published";

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        _count: { select: { questions: true, attempts: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: { quizzes } });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch quizzes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const body = await req.json();
    const {
      title, description, instructions, courseId, moduleId, topicId,
      duration, totalMarks, passingMarks, quizType, attemptLimit,
      shuffleQuestions, shuffleOptions, startDate, endDate, negativeMarking, status,
    } = body;

    if (!title || !courseId) {
      return NextResponse.json({ success: false, message: "title and courseId are required" }, { status: 400 });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title, description: description || "", instructions: instructions || "",
        courseId, moduleId: moduleId || null, topicId: topicId || null,
        createdById: user!.id,
        duration: duration || 30, totalMarks: totalMarks || 100,
        passingMarks: passingMarks || 40, quizType: quizType || "exam",
        attemptLimit: attemptLimit ?? 1,
        shuffleQuestions: shuffleQuestions ?? false,
        shuffleOptions: shuffleOptions ?? false,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        negativeMarking: negativeMarking ?? false,
        status: status || "published",
      },
      include: { _count: { select: { questions: true } } },
    });

    return NextResponse.json(
      { success: true, message: "Quiz created", data: { quiz } },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create quiz";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
