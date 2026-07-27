// app/api/messages/route.ts — Messaging API
/**
 * @swagger
 * /messages:
 *   get:
 *     tags: [Messages]
 *     summary: Get messages between users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: recipientId
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Messages list
 *   post:
 *     tags: [Messages]
 *     summary: Send a message
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *     responses:
 *       201:
 *         description: Message sent
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authenticate } from "@/lib/middleware";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const recipientId = searchParams.get("recipientId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 30;
    const skip = (page - 1) * limit;

    if (!recipientId) {
      // Get conversation list — last message per user
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: user!.id },
            { recipientId: user!.id },
          ],
          deleted: false,
        },
        orderBy: { createdAt: "desc" },
        include: {
          sender: { select: { id: true, name: true, avatar: true, isOnline: true } },
          recipient: { select: { id: true, name: true, avatar: true, isOnline: true } },
        },
        take: 50,
      });

      return NextResponse.json({ success: true, data: { messages } });
    }

    // Get conversation between two users
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user!.id, recipientId },
          { senderId: recipientId, recipientId: user!.id },
        ],
        deleted: false,
      },
      orderBy: { createdAt: "asc" },
      skip,
      take: limit,
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        attachments: true,
      },
    });

    // Mark received messages as read
    await prisma.message.updateMany({
      where: { senderId: recipientId, recipientId: user!.id, read: false },
      data: { read: true, readAt: new Date() },
    });

    return NextResponse.json({ success: true, data: { messages } });
  } catch {
    return NextResponse.json({ success: false, message: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;

    const { recipientId, content, messageType, attachments } = await req.json();
    if (!recipientId || !content) {
      return NextResponse.json({ success: false, message: "recipientId and content are required" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        senderId: user!.id,
        recipientId,
        content: content.trim(),
        messageType: messageType || "text",
        attachments: attachments
          ? { create: attachments }
          : undefined,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
        attachments: true,
      },
    });

    return NextResponse.json({ success: true, message: "Message sent", data: { message } }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to send message";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message: msg }, { status });
  }
}
