// app/api/certificates/route.ts — Certificates API
/**
 * @swagger
 * /certificates:
 *   get:
 *     tags: [Certificates]
 *     summary: Get certificates
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema: { type: string }
 *       - in: query
 *         name: courseId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Certificates list
 *   post:
 *     tags: [Certificates]
 *     summary: Issue a certificate (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Certificate'
 *     responses:
 *       201:
 *         description: Certificate issued
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authenticate, authorize } from "@/lib/middleware";
import { v4 as uuidv4 } from "uuid";

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

    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
        issuedBy: { select: { id: true, name: true } },
      },
      orderBy: { issueDate: "desc" },
    });

    return NextResponse.json({ success: true, data: { certificates } });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch certificates" },
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

    const { studentId, courseId, completionPercentage } = await req.json();
    if (!studentId || !courseId || completionPercentage === undefined) {
      return NextResponse.json(
        {
          success: false,
          message: "studentId, courseId, completionPercentage are required",
        },
        { status: 400 },
      );
    }

    const cert = await prisma.certificate.create({
      data: {
        studentId,
        courseId,
        issuedById: user!.id,
        certificateId: `CERT-${uuidv4().slice(0, 8).toUpperCase()}`,
        completionPercentage: Number(completionPercentage),
        status: "Issued",
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Certificate issued",
        data: { certificate: cert },
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Failed to issue certificate";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}
