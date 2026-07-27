// app/api/topics/route.ts — List & Create topics
/**
 * @swagger
 * /topics:
 *   get:
 *     tags: [Topics]
 *     summary: Get topics for a module
 *     parameters:
 *       - in: query
 *         name: moduleId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of topics
 *   post:
 *     tags: [Topics]
 *     summary: Create a topic (Teacher/Admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, moduleId]
 *             properties:
 *               title: { type: string }
 *               moduleId: { type: string }
 *               content: { type: string }
 *               videoUrl: { type: string }
 *               duration: { type: integer }
 *     responses:
 *       201:
 *         description: Topic created
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authenticate, authorize } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId");
    if (!moduleId) {
      return NextResponse.json({ success: false, message: "moduleId is required" }, { status: 400 });
    }

    const topics = await prisma.topic.findMany({
      where: { moduleId },
      orderBy: { createdAt: "asc" },
      include: { resources: true },
    });

    return NextResponse.json({ success: true, data: { topics } });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch topics" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const body = await req.json();
    const { title, moduleId, content, videoUrl, duration, attachments, resources } = body;

    if (!title || !moduleId) {
      return NextResponse.json({ success: false, message: "title and moduleId are required" }, { status: 400 });
    }

    const topic = await prisma.topic.create({
      data: {
        title: title.trim(),
        moduleId,
        content: content || "",
        videoUrl: videoUrl || "",
        duration: duration || 0,
        attachments: attachments || [],
        resources: resources ? { create: resources } : undefined,
      },
      include: { resources: true },
    });

    return NextResponse.json({ success: true, message: "Topic created", data: { topic } }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create topic";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}
