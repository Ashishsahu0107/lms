// app/api/submissions/route.ts — Submissions API
/**
 * @swagger
 * /submissions:
 *   get:
 *     tags: [Submissions]
 *     summary: Get assignment submissions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: assignmentId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Submissions list
 *   post:
 *     tags: [Submissions]
 *     summary: Submit assignment (Student)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [assignmentId]
 *             properties:
 *               assignmentId: { type: string }
 *               textAnswer: { type: string }
 *               files: { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Submitted
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authenticate } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const assignmentId = searchParams.get("assignmentId");
    const studentId = searchParams.get("studentId");

    const where: Record<string, string> = {};
    if (assignmentId) where.assignmentId = assignmentId;
    if (studentId) where.studentId = studentId;
    if (user!.role === "student") where.studentId = user!.id;

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, email: true, avatar: true } },
        assignment: { select: { id: true, title: true, totalMarks: true } },
        rubricEvaluation: true,
      },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: { submissions } });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch submissions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;

    const { assignmentId, textAnswer, files } = await req.json();
    if (!assignmentId) {
      return NextResponse.json({ success: false, message: "assignmentId is required" }, { status: 400 });
    }

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) {
      return NextResponse.json({ success: false, message: "Assignment not found" }, { status: 404 });
    }

    const isLate = new Date() > assignment.dueDate;

    const submission = await prisma.submission.upsert({
      where: { studentId_assignmentId: { studentId: user!.id, assignmentId } },
      update: {
        textAnswer: textAnswer || "",
        files: files || [],
        submittedAt: new Date(),
        status: isLate ? "late" : "pending",
      },
      create: {
        studentId: user!.id,
        assignmentId,
        textAnswer: textAnswer || "",
        files: files || [],
        status: isLate ? "late" : "pending",
      },
      include: { assignment: true },
    });

    return NextResponse.json({ success: true, message: "Assignment submitted", data: { submission } }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Submission failed";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}
