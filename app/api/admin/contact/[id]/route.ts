// app/api/admin/contact/[id]/route.ts — Admin Endpoint for Updating Status & Deleting Submissions
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { authenticate, authorize } from "@/lib/middleware";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "super_admin");
    if (roleError) return roleError;

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const validStatuses = ["NEW", "IN_PROGRESS", "RESOLVED"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status. Must be NEW, IN_PROGRESS, or RESOLVED.",
        },
        { status: 400 },
      );
    }

    const updated = await prisma.contactRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: "Contact request status updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating contact request:", error);
    return NextResponse.json(
      { success: false, message: "Unable to update contact request." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, error } = await authenticate(req);
    if (error) return error;
    const roleError = authorize(user!, "super_admin");
    if (roleError) return roleError;

    const { id } = await params;

    await prisma.contactRequest.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Contact request deleted successfully.",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting contact request:", error);
    return NextResponse.json(
      { success: false, message: "Unable to delete contact request." },
      { status: 500 },
    );
  }
}
