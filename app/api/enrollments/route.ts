// app/api/enrollments/route.ts — Enrollments & Course Assignment API
import { NextRequest, NextResponse } from "next/server";
import mongo from "@/lib/db";
import {
  authenticate,
  authorize,
  checkCourseOwnership,
} from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const courseId = searchParams.get("courseId");

    const where: Record<string, unknown> = {};
    if (studentId) where.studentId = studentId;
    if (courseId) where.courseId = courseId;
    if (user!.role === "student") where.studentId = user!.id;
    if (user!.role === "teacher") {
      const assignedCourses = await mongo.course.find({
        filter: { teacherId: user!.id },
        select: { id: true },
      });
      const assignedCourseIds = assignedCourses.map((course: { id: string }) => course.id);
      if (courseId && !assignedCourseIds.includes(courseId)) {
        return NextResponse.json(
          { success: false, message: "Access denied: this course is not assigned to you" },
          { status: 403 },
        );
      }
      where.courseId = courseId || { in: assignedCourseIds };
    }

    const enrollments = await mongo.enrollment.find({
      filter: where,
      populate: {
        course: {
          populate: {
            teacher: { select: { id: true, name: true, avatar: true } },
          },
        },
        student: {
          select: { id: true, name: true, email: true, avatar: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: { enrollments } });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch enrollments" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;

    const body = await req.json();
    const { courseId } = body;
    let studentId = body.studentId;

    // If role is student, default studentId to authenticated user's ID
    if (user!.role === "student") {
      studentId = user!.id;
    }

    if (!studentId || !courseId) {
      return NextResponse.json(
        { success: false, message: "studentId and courseId are required" },
        { status: 400 },
      );
    }

    if (user!.role !== "student") {
      const roleError = authorize(user!, "teacher", "super_admin");
      if (roleError) return roleError;
    }
    if (user!.role === "teacher") {
      const ownerError = await checkCourseOwnership(user!, courseId);
      if (ownerError) return ownerError;
    }

    // Check if already enrolled
    const existing = await mongo.enrollment.findOne({
      filter: { studentId_courseId: { studentId, courseId } },
    });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Student is already enrolled in this course",
        },
        { status: 409 },
      );
    }

    const enrollment = await mongo.enrollment.create({
      data: { studentId, courseId, assignedById: user!.id },
      populate: {
        course: true,
        student: { select: { id: true, name: true, email: true } },
      },
    });

    // Initialize student progress record
    await mongo.studentProgress.upsertOne({
      filter: { studentId_courseId: { studentId, courseId } },
      update: {},
      create: { studentId, courseId },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Course assigned / enrolled successfully",
        data: { enrollment },
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Enrollment failed";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
