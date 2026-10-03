// app/api/assignments/[id]/route.ts — Get, Update, Delete single assignment
import { NextRequest, NextResponse } from "next/server";
import mongo from "@/lib/db";
import { authenticate, authorize } from "@/lib/middleware";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assignment = await mongo.assignment.findOne({
      filter: { id },
      populate: {
        createdBy: { select: { id: true, name: true } },
        rubrics: true,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { assignment } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch assignment";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const { id } = await params;
    const body = await req.json();
    const {
      title,
      description,
      instructions,
      dueDate,
      totalMarks,
      assignmentType,
      attachments,
      status,
    } = body;

    const assignment = await mongo.assignment.findOneAndUpdate({
      filter: { id },
      data: {
        ...(title && { title: title.trim() }),
        ...(description !== undefined && { description }),
        ...(instructions !== undefined && { instructions }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(totalMarks !== undefined && { totalMarks: Number(totalMarks) }),
        ...(assignmentType && { assignmentType }),
        ...(attachments !== undefined && { attachments }),
        ...(status && { status }),
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, message: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Assignment updated successfully",
      data: { assignment },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update assignment";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "teacher", "super_admin");
    if (roleError) return roleError;

    const { id } = await params;

    await mongo.submission.deleteMany({ filter: { assignmentId: id } });
    await mongo.rubric.deleteMany({ filter: { assignmentId: id } });
    await mongo.assignment.findOneAndDelete({ filter: { id } });

    return NextResponse.json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete assignment";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
