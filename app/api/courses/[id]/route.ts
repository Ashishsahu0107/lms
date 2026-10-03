// app/api/courses/[id]/route.ts — Get, Update, Delete single course
/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     tags: [Courses]
 *     summary: Get a single course by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Course data
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     tags: [Courses]
 *     summary: Update course (owner/admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       200:
 *         description: Course updated
 *   delete:
 *     tags: [Courses]
 *     summary: Delete course (owner/admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Course deleted
 */
import { NextRequest, NextResponse } from "next/server";
import mongo from "@/lib/db";
import { authenticate, authorize } from "@/lib/middleware";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await authenticate(_req);
    const { id } = await params;

    const course = await mongo.course.findOne({
      filter: { id },
      populate: {
        teacher: { select: { id: true, name: true, avatar: true, bio: true } },
        modules: {
          orderBy: { order: "asc" },
          populate: {
            topics: {
              orderBy: { order: "asc", createdAt: "asc" },
              populate: {
                resources: true,
                quizzes: {
                  populate: { questions: true },
                },
                assignments: true,
              },
            },
          },
        },
        ratings: {
          populate: {
            student: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 },
      );
    }

    if (user?.role === "teacher" && course.teacherId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Access denied: this course is not assigned to you" },
        { status: 403 },
      );
    }
    if (user?.role !== "super_admin" && user?.role !== "teacher" && course.status !== "published") {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course fetched successfully",
      data: { course },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch course" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "super_admin");
    if (roleError) return roleError;

    const { id } = await params;

    const body = await req.json();
    const {
      title,
      description,
      category,
      difficulty,
      price,
      tags,
      status,
      duration,
      teacherId,
    } = body;

    if (teacherId) {
      const assignedTeacher = await mongo.user.findOne({
        filter: { id: teacherId, role: "teacher", isActive: true, status: "active" },
        select: { id: true },
      });
      if (!assignedTeacher) {
        return NextResponse.json(
          { success: false, message: "Choose an active teacher to assign this course" },
          { status: 400 },
        );
      }
    }

    const course = await mongo.course.findOneAndUpdate({
      filter: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(category !== undefined && { category }),
        ...(difficulty && { difficulty }),
        ...(price !== undefined && { price: Number(price) }),
        ...(tags && { tags }),
        ...(status && { status }),
        ...(duration !== undefined && { duration: Number(duration) }),
        ...(teacherId && { teacherId }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Course updated successfully",
      data: { course },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update course";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "super_admin");
    if (roleError) return roleError;

    const { id } = await params;
    await mongo.course.findOneAndDelete({ filter: { id } });

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to delete course";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
