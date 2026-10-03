// app/api/topics/[id]/resources/route.ts — List and Add resources for a topic
import { NextRequest, NextResponse } from "next/server";
import mongo from "@/lib/db";
import { authenticate, authorize, checkTopicOwnership } from "@/lib/middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resources = await mongo.topicResource.find({
      filter: { topicId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: { resources },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load resources";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const { id: topicId } = await params;
    const ownerError = await checkTopicOwnership(user!, topicId);
    if (ownerError) return ownerError;

    const body = await req.json();
    const { title, fileUrl, resourceType = "link", description = "" } = body;

    if (!title?.trim() || !fileUrl?.trim()) {
      return NextResponse.json(
        { success: false, message: "Title and File/URL are required" },
        { status: 400 }
      );
    }

    const resource = await mongo.topicResource.create({
      data: {
        title: title.trim(),
        fileUrl: fileUrl.trim(),
        resourceType,
        description: description.trim(),
        topicId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Resource added successfully",
        data: { resource },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to add resource";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
