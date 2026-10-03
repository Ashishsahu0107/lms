// app/api/topics/[id]/docs/route.ts — Get all docs or create doc for topic
import { NextRequest, NextResponse } from "next/server";
import mongo from "@/lib/db";
import { authenticate, authorize } from "@/lib/middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;

    const { id: topicId } = await params;

    const docs = await mongo.topicDoc.findMany({
      filter: { topicId },
      orderBy: { updatedAt: "desc", createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: { docs },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch docs";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const { id: topicId } = await params;
    const body = await req.json();
    const { title, content, status } = body;

    const doc = await mongo.topicDoc.create({
      data: {
        title: title ? title.trim() : "Untitled Note",
        content: content || "",
        status: status || "draft",
        topicId,
        authorId: user!.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Note created successfully",
      data: { doc },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create note";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
