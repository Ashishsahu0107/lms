// app/api/enrollments/route.ts — Enrollments & Course Assignment API
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authenticate } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const courseId = searchParams.get("courseId");

    const where: Record<string, string> = {};
    if (studentId) where.studentId = studentId;
    if (courseId) where.courseId = courseId;
    if (user!.role === "student") where.studentId = user!.id;

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        course: { include: { teacher: { select: { id: true, name: true, avatar: true } } } },
        student: { select: { id: true, name: true, email: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: { enrollments } });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch enrollments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;

    const body = await req.json();
    let { studentId, courseId } = body;

    // If role is student, default studentId to authenticated user's ID
    if (user!.role === "student") {
      studentId = user!.id;
    }

    if (!studentId || !courseId) {
      return NextResponse.json({ success: false, message: "studentId and courseId are required" }, { status: 400 });
    }

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (existing) {
      return NextResponse.json({ success: false, message: "Student is already enrolled in this course" }, { status: 409 });
    }

    const enrollment = await prisma.enrollment.create({
      data: { studentId, courseId, assignedById: user!.id },
      include: {
        course: true,
        student: { select: { id: true, name: true, email: true } },
      },
    });

    // Initialize student progress record
    await prisma.studentProgress.upsert({
      where: { studentId_courseId: { studentId, courseId } },
      update: {},
      create: { studentId, courseId },
    });

    return NextResponse.json(
      { success: true, message: "Course assigned / enrolled successfully", data: { enrollment } },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Enrollment failed";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
