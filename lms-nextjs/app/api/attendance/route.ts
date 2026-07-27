// app/api/attendance/route.ts — Attendance API
/**
 * @swagger
 * /attendance:
 *   get:
 *     tags: [Attendance]
 *     summary: Get attendance records
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema: { type: string }
 *       - in: query
 *         name: studentId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Attendance records
 *   post:
 *     tags: [Attendance]
 *     summary: Mark attendance
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId, courseId, date, status]
 *             properties:
 *               studentId: { type: string }
 *               courseId: { type: string }
 *               date: { type: string, format: date }
 *               status: { type: string, enum: [present, absent, late, leave] }
 *     responses:
 *       201:
 *         description: Attendance marked
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
    const studentId = searchParams.get("studentId");
    const sessionId = searchParams.get("sessionId");

    const where: Record<string, unknown> = {};
    if (courseId) where.courseId = courseId;
    if (studentId) where.studentId = studentId;
    if (sessionId) where.sessionId = sessionId;
    if (user!.role === "student") where.studentId = user!.id;
    if (user!.role === "teacher") where.teacherId = user!.id;

    const attendance = await prisma.attendance.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, email: true, avatar: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ success: true, data: { attendance } });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const body = await req.json();
    const { studentId, courseId, date, status, remarks, sessionId } = body;

    if (!studentId || !courseId || !date || !status) {
      return NextResponse.json({ success: false, message: "studentId, courseId, date, status are required" }, { status: 400 });
    }

    const attendance = await prisma.attendance.upsert({
      where: { studentId_courseId_date: { studentId, courseId, date: new Date(date) } },
      update: { status, remarks: remarks || "", markedById: user!.id },
      create: {
        studentId, courseId, teacherId: user!.id,
        date: new Date(date), status, remarks: remarks || "",
        markedById: user!.id,
        sessionId: sessionId || null,
      },
      include: {
        student: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ success: true, message: "Attendance marked", data: { attendance } }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to mark attendance";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}
