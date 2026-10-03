// app/api/topics/[id]/resources/[resourceId]/route.ts — Edit and Delete topic resource
import { NextRequest, NextResponse } from "next/server";
import mongo from "@/lib/db";
import { authenticate, authorize, checkTopicOwnership } from "@/lib/middleware";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; resourceId: string }> }
) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const { id: topicId, resourceId } = await params;
    const ownerError = await checkTopicOwnership(user!, topicId);
    if (ownerError) return ownerError;

    const body = await req.json();
    const { title, fileUrl, resourceType, description } = body;

    const resource = await mongo.topicResource.findOneAndUpdate({
      filter: { id: resourceId, topicId },
      data: {
        ...(title && { title: title.trim() }),
        ...(fileUrl && { fileUrl: fileUrl.trim() }),
        ...(resourceType && { resourceType }),
        ...(description !== undefined && { description: description.trim() }),
      },
    });

    if (!resource) {
      return NextResponse.json(
        { success: false, message: "Resource not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Resource updated successfully",
      data: { resource },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update resource";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; resourceId: string }> }
) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const { id: topicId, resourceId } = await params;
    const ownerError = await checkTopicOwnership(user!, topicId);
    if (ownerError) return ownerError;

    await mongo.topicResource.findOneAndDelete({
      filter: { id: resourceId, topicId },
    });

    return NextResponse.json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete resource";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
