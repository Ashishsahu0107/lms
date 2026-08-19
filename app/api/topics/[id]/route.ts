// app/api/topics/[id]/route.ts — Get, Update, Delete single topic
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authenticate, authorize } from "@/lib/middleware";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const { id } = await params;
    const body = await req.json();
    const { title, content, videoUrl, duration } = body;

    const topic = await prisma.topic.update({
      where: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(content !== undefined && { content }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(duration !== undefined && { duration: Number(duration) }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Topic updated successfully",
      data: { topic },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to update topic";
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
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const { id } = await params;
    await prisma.topic.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Topic deleted successfully",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to delete topic";
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    return NextResponse.json({ success: false, message }, { status });
  }
}
