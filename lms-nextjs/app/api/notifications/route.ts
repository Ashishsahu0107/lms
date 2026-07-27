// app/api/notifications/route.ts — Notifications API
/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get notifications for current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications list
 *   post:
 *     tags: [Notifications]
 *     summary: Create notification (Admin/Teacher only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Notification'
 *     responses:
 *       201:
 *         description: Notification created
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authenticate, authorize } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { recipientId: user!.id },
          { targetRole: user!.role as "student" | "teacher" | "all" },
          { targetRole: "all" },
        ],
      },
      orderBy: { scheduledAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, data: { notifications } });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const { title, message, type, targetRole, recipientId } = await req.json();
    if (!title || !message) {
      return NextResponse.json({ success: false, message: "title and message are required" }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        senderId: user!.id,
        recipientId: recipientId || null,
        title,
        message,
        type: type || "announcement",
        targetRole: targetRole || "all",
      },
    });

    return NextResponse.json({ success: true, message: "Notification sent", data: { notification } }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to send notification";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}
