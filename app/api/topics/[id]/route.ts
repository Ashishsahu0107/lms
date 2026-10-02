// app/api/topics/[id]/route.ts — Get, Update, Delete single topic
import { NextRequest, NextResponse } from "next/server";
import mongo from "@/lib/db";
import {
  authenticate,
  authorize,
  checkTopicOwnership,
} from "@/lib/middleware";

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
    const ownerError = await checkTopicOwnership(user!, id);
    if (ownerError) return ownerError;

    const body = await req.json();
    const { title, content, videoUrl, duration, order } = body;

    const topic = await mongo.topic.findOneAndUpdate({
      filter: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(content !== undefined && { content }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(duration !== undefined && { duration: Number(duration) }),
        ...(order !== undefined && { order: Number(order) }),
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
    const ownerError = await checkTopicOwnership(user!, id);
    if (ownerError) return ownerError;

    await mongo.topicResource.deleteMany({ filter: { topicId: id } });
    await mongo.topic.findOneAndDelete({ filter: { id } });

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
