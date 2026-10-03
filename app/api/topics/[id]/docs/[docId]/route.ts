// app/api/topics/[id]/docs/[docId]/route.ts — Get, Update, Delete single topic doc
import { NextRequest, NextResponse } from "next/server";
import mongo from "@/lib/db";
import { authenticate, authorize } from "@/lib/middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> },
) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;

    const { docId } = await params;
    const doc = await mongo.topicDoc.findOne({ filter: { id: docId } });
    if (!doc) {
      return NextResponse.json(
        { success: false, message: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { doc } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch note";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> },
) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const { docId } = await params;
    const body = await req.json();
    const { title, content, status } = body;

    const doc = await mongo.topicDoc.findOneAndUpdate({
      filter: { id: docId },
      data: {
        ...(title !== undefined && { title: title.trim() || "Untitled Note" }),
        ...(content !== undefined && { content }),
        ...(status !== undefined && { status }),
        updatedAt: new Date(),
      },
    });

    if (!doc) {
      return NextResponse.json(
        { success: false, message: "Note not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Note updated successfully",
      data: { doc },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update note";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> },
) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const { docId } = await params;
    await mongo.topicDoc.findOneAndDelete({ filter: { id: docId } });

    return NextResponse.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete note";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
