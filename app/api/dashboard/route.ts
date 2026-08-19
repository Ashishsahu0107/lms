// app/api/dashboard/route.ts — Student Dashboard API
/**
 * @swagger
 * /dashboard:
 *   get:
 *     tags: [Student]
 *     summary: Get student dashboard data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics and recent activity
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authenticate, authorize } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "student", "teacher", "super_admin");
    if (roleError) return roleError;

    const studentId = user!.id;

    const [
      enrollments,
      pendingAssignments,
      certificates,
      progressRecords,
      fullUser,
    ] = await Promise.all([
      // Enrolled courses with progress
      prisma.enrollment.findMany({
        where: { studentId },
        include: {
          course: {
            include: {
              teacher: { select: { id: true, name: true, avatar: true } },
              _count: { select: { modules: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),

      // Pending assignments
      prisma.assignment.findMany({
        where: {
          status: "published",
          course: { enrollments: { some: { studentId } } },
          dueDate: { gte: new Date() },
          submissions: { none: { studentId } },
        },
        orderBy: { dueDate: "asc" },
        take: 5,
        include: { course: { select: { id: true, title: true } } },
      }),

      // Certificates
      prisma.certificate.count({ where: { studentId } }),

      // Progress data
      prisma.studentProgress.findMany({
        where: { studentId },
        select: { courseId: true, progress: true, totalWatchTime: true },
      }),

      // Full user with achievements
      prisma.user.findUnique({
        where: { id: studentId },
        include: { achievements: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        enrollments,
        pendingAssignments,
        certificatesCount: certificates,
        progressRecords,
        user: fullUser,
        stats: {
          totalCourses: enrollments.length,
          completedCourses: progressRecords.filter((p) => p.progress >= 100)
            .length,
          totalWatchTime: progressRecords.reduce(
            (sum, p) => sum + p.totalWatchTime,
            0,
          ),
          xp: fullUser?.xp || 0,
          streak: fullUser?.streak || 0,
          badges: fullUser?.badges || [],
        },
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch dashboard" },
      { status: 500 },
    );
  }
}
